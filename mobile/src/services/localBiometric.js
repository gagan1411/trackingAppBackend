/**
 * localBiometric.js
 * ------------------
 * Handles communication with the biometric AI server running on the LOCAL network.
 * No internet / Localtunnel required — uses the LAN IP directly.
 *
 * Priority:
 *  1. User-saved custom IP (SecureStore: 'local_biometric_ip')
 *  2. Auto-detected common LAN patterns
 *  3. null (caller falls back to pure local SQLite matching)
 */

import * as SecureStore from 'expo-secure-store';

const PORT = 8000;
const TIMEOUT_MS = 4000; // fast timeout so UI doesn't freeze

/**
 * Ping a candidate URL and return it if healthy, or null.
 */
async function pingServer(baseUrl) {
    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), TIMEOUT_MS);
        const resp = await fetch(`${baseUrl}/health`, { signal: controller.signal });
        clearTimeout(tid);
        if (resp.ok) {
            const data = await resp.json();
            if (data?.status === 'ok') return baseUrl;
        }
    } catch (_) { }
    return null;
}

/**
 * Returns the reachable local biometric server URL, or null if none found.
 */
export async function getLocalBiometricUrl() {
    // 1. Check user-configured IP
    try {
        const saved = await SecureStore.getItemAsync('local_biometric_ip');
        if (saved) {
            const url = saved.startsWith('http') ? saved : `http://${saved}:${PORT}`;
            const live = await pingServer(url);
            if (live) return live;
        }
    } catch (_) { }

    const candidates = [
        `http://172.20.10.7:${PORT}`, // Auto-discovered Hotspot IP
        `http://192.168.1.100:${PORT}`,
        `http://192.168.0.100:${PORT}`,
        `http://192.168.29.240:${PORT}`,
        `http://10.0.0.100:${PORT}`,
        `http://localhost:${PORT}`,
    ];

    for (const url of candidates) {
        const live = await pingServer(url);
        if (live) return live;
    }

    return null; // server not reachable — use pure local SQLite
}

/**
 * Save the user's preferred local biometric server IP.
 */
export async function saveLocalBiometricIp(ip) {
    await SecureStore.setItemAsync('local_biometric_ip', ip);
}

/**
 * Register a face photo with the local LAN biometric server.
 * Returns { success: boolean, embedding: number[]|null, message: string }
 */
export async function registerFaceLocal(localUrl, userId, photoUri) {
    try {
        let formData = new FormData();
        formData.append('user_id', userId);
        formData.append('image', { uri: photoUri, name: 'reg_face.jpg', type: 'image/jpeg' });

        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 15000);
        const resp = await fetch(`${localUrl}/register-face`, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
        });
        clearTimeout(tid);

        const text = await resp.text();
        let result = {};
        try { result = JSON.parse(text); } catch (_) { }

        if (result.status === 'success') {
            return { success: true, embedding: result.embedding || null, message: 'Registered' };
        }
        return { success: false, embedding: null, message: result.message || 'Server error' };
    } catch (err) {
        return { success: false, embedding: null, message: err.message };
    }
}

/**
 * Verify a face photo against all registered faces on the local LAN server.
 * Returns { matched: boolean, user_id: string|null, confidence: number, distance: number }
 */
export async function verifyFaceLocal(localUrl, photoUri) {
    try {
        let formData = new FormData();
        formData.append('image', { uri: photoUri, name: 'face.jpg', type: 'image/jpeg' });

        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 15000);
        const resp = await fetch(`${localUrl}/verify-face`, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
        });
        clearTimeout(tid);

        const text = await resp.text();
        let result = {};
        try { result = JSON.parse(text); } catch (_) { }

        if (result.status === 'match') {
            return { matched: true, user_id: result.user_id, confidence: result.confidence || 0, distance: result.distance || 0 };
        }
        return { matched: false, user_id: null, confidence: 0, distance: result.distance || 1 };
    } catch (err) {
        return { matched: false, user_id: null, confidence: 0, distance: 1, error: err.message };
    }
}

/**
 * Register a fingerprint template with the local LAN biometric server.
 */
export async function registerFingerprintLocal(localUrl, userId, template) {
    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 8000);
        const resp = await fetch(`${localUrl}/register-fingerprint`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, template }),
            signal: controller.signal,
        });
        clearTimeout(tid);
        const result = await resp.json();
        return result.status === 'success';
    } catch (_) {
        return false;
    }
}
