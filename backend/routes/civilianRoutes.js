const express = require('express');
const jwt = require('jsonwebtoken');
const Civilian = require('../models/Civilian');
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

// Sync bulk civilians
router.post('/sync', auth, async (req, res) => {
    try {
        const civilians = req.body;
        const results = [];

        for (const c of civilians) {
            let existing = await Civilian.findOne({ syncId: c.syncId });
            if (!existing) {
                const newCivilian = new Civilian({
                    ...c,
                    userId: req.user.id
                });
                await newCivilian.save();
                results.push({ syncId: c.syncId, status: 'synced' });
            } else {
                results.push({ syncId: c.syncId, status: 'already_synced' });
            }
        }
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update approval status (Admin only in future)
router.post('/approve', auth, async (req, res) => {
    try {
        const { id, status } = req.body;
        const civilian = await Civilian.findByIdAndUpdate(id, { approved: status }, { new: true });
        res.json(civilian);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Register single civilian (remotely from registration form)
router.post('/register', auth, async (req, res) => {
    try {
        const civilian = new Civilian({
            ...req.body,
            userId: req.user.id
        });
        await civilian.save();
        res.json({ status: 'success', message: 'Civilian registered on central server' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Search civilian by ID Number (for remote identification)
router.get('/search/:idNumber', auth, async (req, res) => {
    try {
        const civilian = await Civilian.findOne({ idNumber: req.params.idNumber });
        if (!civilian) return res.status(404).json({ msg: 'Not found' });
        res.json(civilian);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
