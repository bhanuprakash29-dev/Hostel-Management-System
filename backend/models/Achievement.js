const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    studentId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    proofUrl: { type: String, default: '' },
    roomNumber: { type: String, default: '' },
    category: { type: String, default: 'Academic' }, // Academic, Sports, Cultural, etc.
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    rejectionReason: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
