const admin = require('firebase-admin');
const path = require('path');

// To properly verify tokens, you need a service account key.
// Please place your 'serviceAccountKey.json' in the 'backend' folder.
// You can download this from the Firebase Console (Project Settings > Service Accounts).

let serviceAccount = null;
try {
    serviceAccount = require('./serviceAccountKey.json');
} catch (error) {
    console.warn('Warning: serviceAccountKey.json not found. Firebase Admin SDK might not be fully initialized.');
}

if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully.');
} else if (!admin.apps.length) {
    // Attempt initialization with environment variables if possible
    admin.initializeApp();
    console.log('Firebase Admin initialized with default credentials.');
}

module.exports = admin;
