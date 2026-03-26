const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const duplicates = await User.aggregate([
        { $group: { _id: '$email', count: { $sum: 1 }, ids: { $push: '$_id' } } },
        { $match: { count: { $gt: 1 } } }
    ]);
    console.log(JSON.stringify(duplicates, null, 2));
    process.exit(0);
}

check().catch(console.error);
