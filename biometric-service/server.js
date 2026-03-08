// Use the most stable legacy face-api.js for the current environment
const faceapi = require('face-api.js');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const canvas = require('canvas');
const fs = require('fs');
const path = require('path');

// Configure face-api for Node.js using node-canvas
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
const upload = multer({ dest: 'uploads/' });

const db = new sqlite3.Database('./biometrics.db');
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        template TEXT NOT NULL,
        UNIQUE(user_id, type)
    )`);
});

// ─── Load Models ─────────────────────────────────────────────────────────────
const MODELS_PATH = path.join(__dirname, 'models');
let modelsLoaded = false;

const loadModels = async () => {
    try {
        console.log(`Loading face models from: ${MODELS_PATH}`);
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);
        modelsLoaded = true;
        console.log('✅ Biometric Models Loaded');
    } catch (e) {
        console.error('❌ Model Load Error:', e.message);
    }
};

loadModels();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const safeDelete = (filePath) => {
    try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) { }
};

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', modelsLoaded, message: modelsLoaded ? 'Face AI ready' : 'Models loading...' });
});

// Register Face
app.post('/register-face', upload.single('image'), async (req, res) => {
    try {
        const userId = req.body.user_id;
        if (!userId || !req.file) {
            safeDelete(req.file?.path);
            return res.status(400).json({ status: 'error', message: 'user_id and image are required' });
        }
        if (!modelsLoaded) {
            safeDelete(req.file?.path);
            return res.status(503).json({ status: 'error', message: 'AI models still loading, please wait and retry.' });
        }

        const img = await canvas.loadImage(req.file.path);
        const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

        safeDelete(req.file.path);

        if (!detection) {
            return res.status(400).json({ status: 'error', message: 'No face detected in image. Ensure good lighting and face is clearly visible.' });
        }

        const embedding = Array.from(detection.descriptor);

        db.run(`INSERT OR REPLACE INTO templates (user_id, type, template) VALUES (?, ?, ?)`,
            [userId, 'face', JSON.stringify(embedding)],
            (err) => {
                if (err) return res.status(500).json({ status: 'error', message: err.message });
                console.log(`✅ Face registered for user_id: ${userId}`);
                res.json({ status: 'success', message: 'Face registered successfully' });
            }
        );
    } catch (err) {
        safeDelete(req.file?.path);
        console.error('register-face error:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Verify Face
app.post('/verify-face', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'image is required' });
        }
        if (!modelsLoaded) {
            safeDelete(req.file?.path);
            return res.status(503).json({ status: 'error', message: 'AI models still loading, please wait and retry.' });
        }

        const img = await canvas.loadImage(req.file.path);
        const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

        safeDelete(req.file.path);

        if (!detection) {
            return res.json({ status: 'no_match', message: 'No face detected in image' });
        }

        const candidateDescriptor = detection.descriptor;

        db.all(`SELECT user_id, template FROM templates WHERE type='face'`, (err, rows) => {
            if (err) return res.status(500).json({ status: 'error', message: err.message });

            if (!rows || rows.length === 0) {
                return res.json({ status: 'no_match', message: 'No registered faces found in database' });
            }

            let bestMatch = null;
            let minDistance = Infinity;
            const THRESHOLD = 0.4; // 0.4 is stricter and better for security

            console.log(`Verifying against ${rows.length} records...`);

            for (const row of rows) {
                const dbEmbedding = new Float32Array(JSON.parse(row.template));
                const distance = faceapi.euclideanDistance(candidateDescriptor, dbEmbedding);
                if (distance < minDistance) {
                    minDistance = distance;
                    if (distance < THRESHOLD) {
                        bestMatch = row.user_id;
                    }
                }
            }

            if (bestMatch) {
                const confidence = parseFloat(
                    Math.max(0, Math.min(100, (1 - minDistance / 0.6)) * 100).toFixed(2)
                );
                console.log(`✅ MATCH: user_id: ${bestMatch}, dist: ${minDistance.toFixed(4)}, conf: ${confidence}%`);
                return res.json({
                    status: 'match',
                    user_id: bestMatch,
                    confidence,
                    distance: parseFloat(minDistance.toFixed(4))
                });
            } else {
                console.log(`❌ NO MATCH: best distance was ${minDistance.toFixed(4)} (Threshold: ${THRESHOLD})`);
                return res.json({ status: 'no_match', message: 'No matching face found in records' });
            }
        });
    } catch (err) {
        safeDelete(req.file?.path);
        console.error('verify-face error:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Register Fingerprint (template string from Mantra MFS100 SDK)
app.post('/register-fingerprint', (req, res) => {
    const { user_id, template } = req.body;
    if (!user_id || !template) {
        return res.status(400).json({ status: 'error', message: 'user_id and template are required' });
    }

    db.run(`INSERT OR REPLACE INTO templates (user_id, type, template) VALUES (?, ?, ?)`,
        [user_id, 'fingerprint', template],
        (err) => {
            if (err) return res.status(500).json({ status: 'error', message: err.message });
            console.log(`✅ Fingerprint registered for user_id: ${user_id}`);
            res.json({ status: 'success', message: 'Fingerprint registered successfully' });
        }
    );
});

// Verify Fingerprint (ISO template string match)
app.post('/verify-fingerprint', (req, res) => {
    const { template } = req.body;
    if (!template) {
        return res.status(400).json({ status: 'error', message: 'template is required' });
    }

    db.all(`SELECT user_id, template FROM templates WHERE type='fingerprint'`, (err, rows) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });

        let bestMatch = null;
        for (const row of rows) {
            if (row.template === template) {
                bestMatch = row.user_id;
                break;
            }
        }

        if (bestMatch) {
            res.json({ status: 'match', user_id: bestMatch, confidence: 99.9 });
        } else {
            res.json({ status: 'no_match', message: 'No fingerprint match found' });
        }
    });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Biometric AI Server running on http://0.0.0.0:${PORT}`);
    console.log(`   Local:    http://localhost:${PORT}`);
    console.log(`   Network:  http://192.168.29.240:${PORT}`);
    console.log('   Any phone on the same Wi-Fi can now verify faces.\n');
});
