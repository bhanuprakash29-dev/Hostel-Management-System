const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Notification = require('./models/Notification');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const notifications = await Notification.find({}).sort({ createdAt: -1 }).limit(10);
    console.log("RECENT NOTIFICATIONS:", JSON.stringify(notifications, null, 2));
    process.exit(0);
}

run().catch(console.error);
