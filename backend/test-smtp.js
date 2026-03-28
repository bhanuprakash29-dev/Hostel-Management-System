require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing SMTP connection with:');
console.log('User:', process.env.BREVO_SMTP_USER);
console.log('Pass starts with:', process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 15) + '...' : 'undefined');

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_API_KEY
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Connection Failed:', error);
    } else {
        console.log('✅ Server is ready to take our messages');
    }
    process.exit(0);
});
