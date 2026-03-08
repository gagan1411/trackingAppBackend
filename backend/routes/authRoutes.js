const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, password, name, dob, email, contact, role } = req.body;
        console.log(`[AUTH] Register attempt: ${username}`);
        let user = await User.findOne({ username });
        if (user) {
            console.log(`[AUTH] Register failed: User ${username} already exists`);
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ username, password, name, dob, email, contact, role });
        await user.save();

        console.log(`[AUTH] Register success: ${username}`);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, username: user.username, name: user.name, role: user.role } });
    } catch (err) {
        console.error(`[AUTH] Register error:`, err);
        res.status(500).json({ msg: err.message, stack: err.stack });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`[AUTH] Login attempt: ${username}`);
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`[AUTH] Login failed: User ${username} not found`);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log(`[AUTH] Login failed: Incorrect password for ${username}`);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        console.log(`[AUTH] Login success: ${username}`);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
    } catch (err) {
        console.error(`[AUTH] Login error:`, err);
        res.status(500).send('Server Error');
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        if (!username || !newPassword) return res.status(400).json({ msg: 'Username and new password are required.' });
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ msg: 'No account found with that username.' });
        user.password = newPassword; // pre-save hook will bcrypt hash it
        await user.save();
        res.json({ msg: 'Password reset successful.' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
