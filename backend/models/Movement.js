const mongoose = require('mongoose');

const MovementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true
    },
    driverName: {
        type: String,
        required: true
    },
    fromLocation: {
        type: String,
        required: true
    },
    toLocation: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    syncId: {
        type: String, // Unique ID from local SQLite to prevent duplicates
        unique: true
    }
});

module.exports = mongoose.model('Movement', MovementSchema);
