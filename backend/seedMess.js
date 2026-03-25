require('dotenv').config();
const mongoose = require('mongoose');
const Mess = require('./models/Mess');

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel';

const weeklyMenu = [
    {
        day: 'Monday',
        breakfast: 'Idli, Sambar, Coconut Chutney, Filter Coffee',
        lunch: 'Rice, Dal Tadka, Aloo Gobi, Rasam, Curd, Papad',
        snacks: 'Masala Tea, Onion Pakora',
        dinner: 'Chapati, Palak Paneer, Jeera Rice, Raita',
        special: 'Gulab Jamun'
    },
    {
        day: 'Tuesday',
        breakfast: 'Dosa, Podi, Sambar, Tomato Chutney, Milk',
        lunch: 'Rice, Sambar, Beans Poriyal, Rasam, Buttermilk, Papad',
        snacks: 'Filter Coffee, Medu Vada',
        dinner: 'Chapati, Chole Masala, Steamed Rice, Onion Raita',
        special: 'Kesari Bath'
    },
    {
        day: 'Wednesday',
        breakfast: 'Pongal, Coconut Chutney, Sambar, Coffee',
        lunch: 'Rice, Kootu, Cabbage Poriyal, Rasam, Curd Rice',
        snacks: 'Tea, Bonda',
        dinner: 'Parotta, Vegetable Kurma, Lemon Rice, Papad',
        special: 'Payasam'
    },
    {
        day: 'Thursday',
        breakfast: 'Upma, Coconut Chutney, Boiled Egg, Filter Coffee',
        lunch: 'Rice, Moong Dal, Brinjal Curry, Rasam, Curd, Pickle',
        snacks: 'Masala Tea, Murukku',
        dinner: 'Chapati, Dal Makhani, Veg Pulao, Raita',
        special: 'Rava Laddu'
    },
    {
        day: 'Friday',
        breakfast: 'Pesarattu, Ginger Chutney, Upma, Tea',
        lunch: 'Rice, Sambar, Potato Podimas, Rasam, Buttermilk',
        snacks: 'Coffee, Bajji (Banana/Chili)',
        dinner: 'Chapati, Paneer Butter Masala, Jeera Rice, Salad',
        special: 'Badam Halwa'
    },
    {
        day: 'Saturday',
        breakfast: 'Poori, Aloo Masala, Pickle, Filter Coffee',
        lunch: 'Biryani, Raita, Mirchi Ka Salan, Boiled Egg',
        snacks: 'Tea, Samosa with Chutney',
        dinner: 'Dosa, Sambar, Tomato Chutney, Podi',
        special: 'Jangri / Imarti'
    },
    {
        day: 'Sunday',
        breakfast: 'Chole Bhature, Lassi, Pickle',
        lunch: 'Rice, Paneer Tikka Masala, Dal Fry, Rasam, Papad',
        snacks: 'Masala Chai, Mysore Bonda',
        dinner: 'Chapati, Mixed Veg Curry, Pulihora (Tamarind Rice), Curd',
        special: 'Double Ka Meetha'
    }
];

async function seed() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for mess menu seeding...');

        // Clear existing mess data
        await Mess.deleteMany({});
        console.log('Cleared old mess menu data.');

        await Mess.insertMany(weeklyMenu);
        console.log('Successfully seeded weekly mess menu with Indian/South Indian food!');

    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        mongoose.connection.close();
    }
}

seed();
