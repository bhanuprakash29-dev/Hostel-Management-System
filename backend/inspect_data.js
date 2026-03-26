const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Booking = require('./models/Booking');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({}, 'email firebaseUID name _id');
    const bookings = await Booking.find({}, 'email studentName userId status paymentStatus createdAt appliedAt');
    
    const data = {
        users,
        bookings
    };
    
    const fs = require('fs');
    fs.writeFileSync('diagnostic_data.json', JSON.stringify(data, null, 2));
    console.log("Diagnostic data written to diagnostic_data.json");
    process.exit(0);
}

run().catch(console.error);
