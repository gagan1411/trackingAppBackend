import * as SecureStore from 'expo-secure-store';

export const pingServer = async (url) => {
    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(`${url}/health`, { signal: controller.signal });
        clearTimeout(tid);
        if (res.status === 200) return url;
    } catch (e) {
        console.log(`Ping failed for ${url}`);
    }
    return null;
};

export const checkBiometricServer = async () => {
    return 'https://gc141199-biometricfaceengine.hf.space';
};

export const getLocalBiometricUrl = async () => {
    return 'https://gc141199-biometricfaceengine.hf.space';
};
