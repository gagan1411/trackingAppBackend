const mongoose = require('mongoose');

const EntryLogSchema = new mongoose.Schema({
    civilianId: { type: String },
    name: { type: String },
    village: { type: String },
    type: { type: String }, // Entry / Exit
    category: { type: String },
    purposeOfVisit: { type: String },
    placeOfVisit: { type: String },
    vehicleDetails: { type: String },
    itemsCashCarried: { type: String },
    animals: { type: String },
    otherImpDetails: { type: String },
    isInternational: { type: Boolean },
    passportDetails: { type: String },
    visaDetails: { type: String },
    flightTicketDetails: { type: String },
    internationalCash: { type: String },
    internationalOtherDetails: { type: String },
    phoneCheckDetails: { type: String },
    timestamp: { type: Date, default: Date.now },
    exitTimestamp: { type: Date },
    completed: { type: Number, default: 0 },
    syncId: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('EntryLog', EntryLogSchema);
