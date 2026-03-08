const express = require('express');
const jwt = require('jsonwebtoken');
const Movement = require('../models/Movement');
const router = express.Router();

// Middleware to protect routes
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Sync bulk movements
router.post('/sync', auth, async (req, res) => {
    try {
        const movements = req.body; // Array of movements
        const results = [];

        for (const m of movements) {
            // Check if already synced using syncId
            let existing = await Movement.findOne({ syncId: m.syncId });
            if (!existing) {
                const newMovement = new Movement({
                    ...m,
                    userId: req.user.id
                });
                await newMovement.save();
                results.push({ syncId: m.syncId, status: 'synced' });
            } else {
                results.push({ syncId: m.syncId, status: 'already_synced' });
            }
        }
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get all movements for a user
router.get('/', auth, async (req, res) => {
    try {
        const movements = await Movement.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(movements);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
