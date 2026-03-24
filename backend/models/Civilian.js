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
    photo: { type: String }, // Base64 or URL
    fingerprintLinked: { type: Boolean, default: false },
    approved: { type: Number, default: 0 }, // 0: Pending, 1: Approved, 2: Deleted/Rejected
    syncId: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

// PRIMARY LOOKUP: biometric identify search uses $or on these three fields
// Individual indexes let MongoDB scan only matching shards per condition
CivilianSchema.index({ idNumber: 1 });   // Most common lookup (Aadhar/ID scan)
CivilianSchema.index({ idProof: 1 });    // ID type lookup
// syncId already indexed via unique:true above

// VILLAGE FILTERING: allows fast village-scoped queries as collection grows
CivilianSchema.index({ village: 1 });

// COMPOUND: village + approved — useful for listing approved civilians per village
CivilianSchema.index({ village: 1, approved: 1 });

// COMPOUND: village + createdAt — for paginated/sorted village-level listings
CivilianSchema.index({ village: 1, createdAt: -1 });

module.exports = mongoose.model('Civilian', CivilianSchema);

