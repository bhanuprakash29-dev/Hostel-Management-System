const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true
    },
    block: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Single AC', 'Double AC', 'Single Non-AC', 'Double Non-AC', 'Luxurious Suite'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    availableSeats: {
        type: Number,
        required: true
    },
    features: [String],
    allocatedStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('Room', roomSchema);
