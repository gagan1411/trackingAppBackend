const mongoose = require('mongoose');

const CivilianSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fatherName: { type: String },
    mobile: { type: String },
    idProof: { type: String },
    idNumber: { type: String },
    religion: { type: String },
    occupation: { type: String },
    dob: { type: String },
    physiologicalCharacteristics: { type: String },
    fenceCardNo: { type: String },
    vehicles: { type: String }, // JSON stringified
    state: { type: String },
    district: { type: String },
    tehsil: { type: String },
    village: { type: String },
    houseDetails: { type: String },
    category: { type: String },
    bloodRelatives: { type: String }, // JSON stringified
    lat: { type: Number },
    lon: { type: Number },
    photo: { type: String }, // Base64
    fingerprintLinked: { type: Boolean, default: false },
    approved: { type: Number, default: 0 }, // 0: Pending, 1: Approved, 2: Deleted/Rejected
    syncId: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Civilian', CivilianSchema);
