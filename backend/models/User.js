const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUID: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Male'
    },
    // Student Specific Fields
    studentId: String,
    course: String,
    year: String,
    phone: String,
    address: String,
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending'
    },
    roomAllocation: {
        type: String,
        default: ''
    },
    accessCardIssued: {
        type: Boolean,
        default: false
    },
    registrationDate: Date,
    expiryDate: Date,
    duration: String, // e.g., "1st Year", "1 year"
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Expired'],
        default: 'Inactive'
    },
    // Email OTP Verification
    emailVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        default: null
    },
    otpExpiresAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
