const admin = require('../firebaseAdmin');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided or invalid format' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email, name } = decodedToken;

        let user = await User.findOne({ firebaseUID: uid });

        // If user doesn't exist in MongoDB, create it (Requirement 3)
        if (!user) {
            user = new User({
                firebaseUID: uid,
                email,
                name: name || email.split('@')[0], // Use name from token or fallback to email prefix
                role: 'student' // Default to student
            });
            await user.save();
            console.log(`New user created in MongoDB: ${email}`);
        }

        // Attach user to request object (Requirement 4)
        req.user = user;
        next();
    } catch (error) {
        console.error('Firebase Auth Error:', {
            code: error.code,
            message: error.message,
            tokenSnippet: token ? `${token.substring(0, 10)}...` : 'NONE'
        });
        res.status(401).json({ message: 'Unauthorized: Invalid token', error: error.message });
    }
};

const isAdmin = (req, res, next) => {
    // Check if user is admin (Requirement 5)
    if (req.user && req.user.role && req.user.role.toLowerCase() === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }
};

module.exports = { verifyToken, isAdmin };
