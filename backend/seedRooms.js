require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel';

const rooms = [
    { roomNumber: '101', block: 'Block A', type: 'Single AC', price: 150000, capacity: 1, availableSeats: 1, features: ['WiFi', 'AC', 'Attached Bath'] },
    { roomNumber: '102', block: 'Block A', type: 'Double AC', price: 120000, capacity: 2, availableSeats: 2, features: ['WiFi', 'AC', 'Shared Bath'] },
    { roomNumber: '201', block: 'Block B', type: 'Single Non-AC', price: 100000, capacity: 1, availableSeats: 1, features: ['WiFi', 'Fan', 'Attached Bath'] },
    { roomNumber: '202', block: 'Block B', type: 'Double Non-AC', price: 85000, capacity: 2, availableSeats: 2, features: ['WiFi', 'Fan'] },
    { roomNumber: '301', block: 'Block C', type: 'Luxurious Suite', price: 250000, capacity: 1, availableSeats: 1, features: ['WiFi', 'AC', 'Mini Fridge', 'Private Balcony'] },
    { roomNumber: '302', block: 'Block C', type: 'Double AC', price: 120000, capacity: 2, availableSeats: 0, features: ['WiFi', 'AC'] }
];

async function seed() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for seeding...');
        
        // Clear existing rooms to avoid duplicates
        await Room.deleteMany({});
        
        await Room.insertMany(rooms);
        console.log('Successfully seeded rooms in Blocks A, B, and C!');
        
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        mongoose.connection.close();
    }
}

seed();
