const express = require('express');
const jwt = require('jsonwebtoken');
const EntryLog = require('../models/EntryLog');
const router = express.Router();

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

router.post('/sync', auth, async (req, res) => {
    try {
        const logs = req.body;
        const results = [];
        for (const l of logs) {
            let existing = await EntryLog.findOne({ syncId: l.syncId });
            if (!existing) {
                const newLog = new EntryLog({ ...l, userId: req.user.id });
                await newLog.save();
                results.push({ syncId: l.syncId, status: 'synced' });
            } else {
                results.push({ syncId: l.syncId, status: 'already_synced' });
            }
        }
        res.json(results);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
