const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentName: String,
    studentId: String, // Roll Number
    email: String,
    course: String,
    year: String,
    phone: String,
    address: String,
    roomNumber: String,
    roomType: String,
    amount: Number,
    hostelPreference: {
        type: String,
        required: true
    },
    duration: {
        type: String, // e.g., "6 months", "1 year"
        required: true
    },
    additionalDetails: String,
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Paid', 'Room Assigned'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    registrationDate: Date,
    expiryDate: Date
});

module.exports = mongoose.model('Booking', bookingSchema);
