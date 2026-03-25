require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel';
const emailToMakeAdmin = process.argv[2];

if (!emailToMakeAdmin) {
    console.log('Usage: node makeAdmin.js <user_email>');
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(async () => {
        const user = await User.findOneAndUpdate(
            { email: emailToMakeAdmin },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`Success! User ${emailToMakeAdmin} is now an admin.`);
            console.log(user);
        } else {
            console.log(`User with email ${emailToMakeAdmin} not found in MongoDB.`);
        }
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
