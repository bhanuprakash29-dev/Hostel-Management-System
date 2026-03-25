const mongoose = require('mongoose');

const messSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        unique: true
    },
    breakfast: String,
    lunch: String,
    snacks: String,
    dinner: String,
    special: String
});

module.exports = mongoose.model('Mess', messSchema);
