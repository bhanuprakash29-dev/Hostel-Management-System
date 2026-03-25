const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const Booking = require('./models/Booking');
const Room = require('./models/Room');
const Notice = require('./models/Notice');
const Mess = require('./models/Mess');
const Message = require('./models/Message');
const { verifyToken, isAdmin } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const fs = require('fs');
const path = require('path');
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel';
mongoose.connect(mongoURI)
    .then(async () => {
        console.log('MongoDB connected successfully');
        /* try {
            // Drop the old collection to clear conflicting Clerk indexes
            // This is safe because this is a minimal/new project
            await mongoose.connection.db.collection('users').drop();
            console.log('Old users collection dropped to clear stale indexes');
        } catch (e) {
            // Ignore error if collection doesn't exist
        } */
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('Hostel Management System (HMS) Backend is running! 🏩');
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend Connected Successfully' });
});

app.post('/api/users', verifyToken, async (req, res) => {
    // Sync gender if available in body (from initial creation)
    if (req.body.gender && !req.user.gender) {
        req.user.gender = req.body.gender;
    }
    
    // Auto-sync from latest booking if user record is incomplete
    if (req.user.role === 'student' && (!req.user.studentId || !req.user.course || !req.user.phone)) {
        const latestBooking = await Booking.findOne({ userId: req.user._id }).sort({ appliedAt: -1 });
        if (latestBooking) {
            req.user.studentId = req.user.studentId || latestBooking.studentId;
            req.user.course = req.user.course || latestBooking.course;
            req.user.year = req.user.year || latestBooking.year;
            req.user.phone = req.user.phone || latestBooking.phone;
            req.user.address = req.user.address || latestBooking.address;
            req.user.name = req.user.name || latestBooking.studentName;
        }
    }
    
    await req.user.save();
    res.status(200).json({ message: 'User authenticated and synchronized', user: req.user });
});

// Admin: Get All Users (Requirement - Manage Students)
app.get('/api/admin/users', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        
        // Enrich user records with booking info if profile is incomplete
        const enrichedUsers = await Promise.all(users.map(async (u) => {
            if (u.role === 'student' && (!u.studentId || !u.course || !u.year)) {
                const latestBooking = await Booking.findOne({ userId: u._id }).sort({ appliedAt: -1 });
                if (latestBooking) {
                    const userObj = u.toObject();
                    return {
                        ...userObj,
                        studentId: u.studentId || latestBooking.studentId || '',
                        course: u.course || latestBooking.course || '',
                        year: u.year || latestBooking.year || '',
                        phone: u.phone || latestBooking.phone || '',
                        address: u.address || latestBooking.address || '',
                        name: u.name || latestBooking.studentName || ''
                    };
                }
            }
            return u;
        }));
        
        res.json(enrichedUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Admin: Update User Role (e.g., Promote to Admin)
app.put('/api/admin/users/:id/role', verifyToken, isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        res.json({ message: `Role updated to ${role}`, user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
});

// Admin: Deallocate Student From Room
app.put('/api/admin/users/:id/deallocate', verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const roomNum = user.roomAllocation;
        if (roomNum) {
            await Room.findOneAndUpdate(
                { roomNumber: roomNum },
                { 
                    $pull: { allocatedStudents: user._id },
                    $inc: { availableSeats: 1 }
                }
            );
        }

        user.roomAllocation = '';
        user.accessCardIssued = false;
        user.status = 'Inactive';
        await user.save();

        res.json({ message: 'Student deallocated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error deallocating student', error: error.message });
    }
});

// Admin: Delete Student Record Completely
app.delete('/api/admin/users/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) return res.status(404).json({ message: 'Student not found' });

        // 1. Deallocate from room if assigned
        const roomNum = userToDelete.roomAllocation;
        if (roomNum) {
            await Room.findOneAndUpdate(
                { roomNumber: roomNum },
                { 
                    $pull: { allocatedStudents: userToDelete._id },
                    $inc: { availableSeats: 1 }
                }
            );
        }

        // 2. Delete the user
        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'Student record deleted successfully and room deallocated' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting student', error: error.message });
    }
});

// --- NEW BOOKING ROUTES ---

// Student: Submit Booking
app.post('/api/bookings', verifyToken, async (req, res) => {
    try {
        const { studentName, studentId, email, course, year, phone, address, roomNumber, roomType, amount, hostelPreference, duration, additionalDetails, gender } = req.body;
        
        // Sync user profile during booking
        if (gender) req.user.gender = gender;
        if (studentName) req.user.name = studentName;
        if (studentId) req.user.studentId = studentId;
        if (course) req.user.course = course;
        if (year) req.user.year = year;
        if (phone) req.user.phone = phone;
        if (address) req.user.address = address;
        
        await req.user.save();
        
        let booking = await Booking.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
        if (booking && (booking.status === 'Pending' || booking.status === 'Approved')) {
            return res.status(400).json({ message: `You already have an active application (${booking.status})` });
        }

        // --- GENDER VALIDATION ---
        const room = await Room.findOne({ roomNumber }).populate('allocatedStudents', 'gender');
        if (room && room.allocatedStudents.length > 0) {
            const existingGender = room.allocatedStudents[0].gender;
            if (existingGender !== req.user.gender) {
                return res.status(400).json({ message: `Gender Policy: Room ${roomNumber} is reserved for ${existingGender} students only.` });
            }
        }

        const newBooking = new Booking({
            userId: req.user._id,
            studentName,
            studentId,
            email,
            course,
            year,
            phone,
            address,
            roomNumber,
            roomType,
            amount,
            hostelPreference,
            duration,
            additionalDetails
        });

        await newBooking.save();
        res.status(201).json({ message: 'Application submitted successfully', booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting application', error: error.message });
    }
});

// Student: Get My Booking
app.get('/api/bookings/my', verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking', error: error.message });
    }
});

// Admin: Get All Applications
app.get('/api/admin/bookings/all', verifyToken, isAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find().populate('userId', 'name email studentId paymentStatus accessCardIssued');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
});

// Admin: Update Booking Status (Accept/Reject)
app.put('/api/admin/bookings/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
        
        const Notification = require('./models/Notification');
        await new Notification({
            userId: booking.userId,
            title: 'Room Application Update',
            message: `Your room application status has been updated to: ${status}`,
            type: status === 'Approved' ? 'Success' : (status === 'Rejected' ? 'Error' : 'Info')
        }).save();

        res.json({ message: `Application ${status.toLowerCase()} successfully`, booking });
    } catch (error) {
        res.status(500).json({ message: 'Error updating application', error: error.message });
    }
});

// Admin: Delete Application
app.delete('/api/admin/bookings/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Application removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting application', error: error.message });
    }
});

// Admin: Get Dashboard Stats
app.get('/api/admin/stats', verifyToken, isAdmin, async (req, res) => {
    try {
        const totalApps = await Booking.countDocuments();
        const pendingApps = await Booking.countDocuments({ status: 'Pending' });
        // Approved should count any that have passed the initial approval (Approved, Paid, or Assigned)
        const approvedApps = await Booking.countDocuments({ status: { $in: ['Approved', 'Paid', 'Room Assigned'] } });
        const rejectedApps = await Booking.countDocuments({ status: 'Rejected' });
        
        const totalRooms = await Room.countDocuments();
        // Occupied rooms are those where availableSeats < capacity
        const occupiedRooms = await User.countDocuments({ roomAllocation: { $ne: '' }, accessCardIssued: true });
        const totalCapacity = await Room.aggregate([
            { $group: { _id: null, total: { $sum: "$capacity" } } }
        ]);
        const capacityVal = totalCapacity[0]?.total || 0;
        const availableRooms = capacityVal - occupiedRooms;

        res.json({
            totalApps, pendingApps, approvedApps, rejectedApps,
            totalRooms, occupiedRooms, availableRooms, totalCapacity: capacityVal
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
});

// Admin: Get Expiring Students
app.get('/api/admin/expiring-students', verifyToken, isAdmin, async (req, res) => {
    try {
        const today = new Date();
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const expiringStudents = await User.find({
            expiryDate: { $gte: today, $lte: thirtyDaysFromNow },
            status: 'Active'
        }).sort({ expiryDate: 1 });
        
        res.json(expiringStudents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expiring students', error: error.message });
    }
});

// User: Update Profile
app.put('/api/users/profile', verifyToken, async (req, res) => {
    try {
        const { name, studentId, course, year, phone, address, gender } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, studentId, course, year, phone, address, gender },
            { new: true }
        );
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

// User: Complete Payment
app.put('/api/users/payment', verifyToken, async (req, res) => {
    try {
        // 1. STRICT WORKFLOW: Check if student has an APPROVED application
        const activeBooking = await Booking.findOne({ userId: req.user._id, status: 'Approved' });
        if (!activeBooking) {
            return res.status(403).json({ message: 'Payment disabled. Your application must be APPROVED by the warden first.' });
        }

        // Update User payment status
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { paymentStatus: 'Paid' },
            { new: true }
        );

        // Update active Booking payment status and status enum
        await Booking.findOneAndUpdate(
            { userId: req.user._id, status: 'Approved' },
            { 
                paymentStatus: 'Paid',
                status: 'Paid' 
            }
        );

        res.json({ message: 'Payment completed successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating payment status', error: error.message });
    }
});

// User: Renew Stay
app.put('/api/users/renew', verifyToken, async (req, res) => {
    try {
        const { duration } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const registrationDate = new Date();
        let newExpiryDate = new Date(user.expiryDate > new Date() ? user.expiryDate : registrationDate);
        
        if (duration.includes('year')) {
            const years = parseInt(duration) || 1;
            newExpiryDate.setFullYear(newExpiryDate.getFullYear() + years);
        } else if (duration.includes('month')) {
            const months = parseInt(duration) || 6;
            newExpiryDate.setMonth(newExpiryDate.getMonth() + months);
        } else {
            newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
        }

        user.registrationDate = registrationDate;
        user.expiryDate = newExpiryDate;
        user.duration = duration;
        user.status = 'Active';
        user.paymentStatus = 'Paid'; // Assuming renewal involves payment
        await user.save();

        const Notification = require('./models/Notification');
        await new Notification({
            userId: user._id,
            title: 'Renewal Successful',
            message: `Your stay has been extended until ${newExpiryDate.toLocaleDateString()}`,
            type: 'Success'
        }).save();

        res.json({ message: 'Stay renewed successfully', expiryDate: newExpiryDate });
    } catch (error) {
        res.status(500).json({ message: 'Error renewing stay', error: error.message });
    }
});

// Scheduled Task for Expiry Checks (Simplified Cron)
const checkExpiries = async () => {
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const tenDaysFromNow = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);
        
        // 1. Notify 10 days before expiry
        const expiringSoon = await User.find({
            expiryDate: { $lte: tenDaysFromNow, $gt: today },
            status: 'Active',
            paymentStatus: { $ne: 'Paid' } // Only notify those who haven't paid
        });

        const Notification = require('./models/Notification');
        for (const student of expiringSoon) {
            // Check if we already sent a notification recently
            const alreadyNotified = await Notification.findOne({
                userId: student._id,
                title: 'Upcoming Stay Expiry',
                createdAt: { $gte: new Date(today.getTime() - 24 * 60 * 60 * 1000) }
            });
            
            if (!alreadyNotified) {
                await new Notification({
                    userId: student._id,
                    title: 'Upcoming Stay Expiry',
                    message: 'Your hostel stay will expire in less than 10 days. Please complete your renewal payment to avoid room deallocation.',
                    type: 'Warning'
                }).save();
            }
        }

        // 2. Handle actual expiry
        const expiredStudents = await User.find({
            expiryDate: { $lt: today },
            status: 'Active'
        });

        for (const student of expiredStudents) {
            const roomNum = student.roomAllocation;
            
            // Update User status
            student.status = 'Expired';
            student.roomAllocation = '';
            student.accessCardIssued = false;
            await student.save();

            // Notify student
            await new Notification({
                userId: student._id,
                title: 'Stay Expired',
                message: 'Your stay has expired. You have been removed from your room.',
                type: 'Error'
            }).save();

            // Update Room
            if (roomNum) {
                await Room.findOneAndUpdate(
                    { roomNumber: roomNum },
                    { 
                        $pull: { allocatedStudents: student._id },
                        $inc: { availableSeats: 1 }
                    }
                );
            }
        }
    } catch (error) {
        console.error('Expiry Task Error:', error);
    }
};

// Run checkExpiries every 24 hours (86400000 ms)
setInterval(checkExpiries, 24 * 60 * 60 * 1000);
// Run once on startup
checkExpiries();

// Admin: Issue Access Card
app.put('/api/admin/issue-access-card/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { roomNumber } = req.body;
        
        // Find latest booking for this student to get duration
        const latestBooking = await Booking.findOne({ userId: req.params.id }).sort({ appliedAt: -1 });
        const registrationDate = new Date();
        let expiryDate = new Date();
        const durationStr = latestBooking?.duration || '1 year';
        
        if (durationStr.includes('year')) {
            const years = parseInt(durationStr) || 1;
            expiryDate.setFullYear(registrationDate.getFullYear() + years);
        } else if (durationStr.includes('month')) {
            const months = parseInt(durationStr) || 6;
            expiryDate.setMonth(registrationDate.getMonth() + months);
        } else {
            // Default 1 year if not specified
            expiryDate.setFullYear(registrationDate.getFullYear() + 1);
        }

        // 1. Update User
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { 
                accessCardIssued: true, 
                roomAllocation: roomNumber,
                registrationDate,
                expiryDate,
                duration: durationStr,
                status: 'Active',
                // Sync latest profile info from booking if available
                studentId: latestBooking?.studentId || undefined,
                course: latestBooking?.course || undefined,
                year: latestBooking?.year || undefined,
                phone: latestBooking?.phone || undefined,
                address: latestBooking?.address || undefined,
                name: latestBooking?.studentName || undefined
            },
            { new: true }
        );

        // Update Booking status to "Room Assigned"
        if (latestBooking) {
            latestBooking.registrationDate = registrationDate;
            latestBooking.expiryDate = expiryDate;
            latestBooking.status = 'Room Assigned';
            await latestBooking.save();
        }

        // 2. Link User to Room and update availability
        await Room.findOneAndUpdate(
            { roomNumber: roomNumber },
            { 
                $addToSet: { allocatedStudents: new mongoose.Types.ObjectId(req.params.id) },
                $inc: { availableSeats: -1 }
            }
        );

        res.json({ message: 'Access Card Issued Successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error issuing access card', error: error.message });
    }
});

// Admin: Manage Rooms (Get All)
app.get('/api/admin/rooms', verifyToken, isAdmin, async (req, res) => {
    try {
        const rooms = await Room.find().populate('allocatedStudents', 'name studentId phone email');
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rooms', error: error.message });
    }
});

// Admin: Add Room
app.post('/api/admin/rooms', verifyToken, isAdmin, async (req, res) => {
    try {
        const room = new Room(req.body);
        await room.save();
        res.status(201).json({ message: 'Room added successfully', room });
    } catch (error) {
        res.status(500).json({ message: 'Error adding room', error: error.message });
    }
});

// Admin: Add Bed to Room
app.put('/api/admin/rooms/:id/add-bed', verifyToken, isAdmin, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        room.capacity += 1;
        room.availableSeats += 1;
        await room.save();
        
        // Return populated room
        const populatedRoom = await Room.findById(req.params.id).populate('allocatedStudents', 'name studentId phone email');
        res.json({ message: 'Bed added successfully', room: populatedRoom });
    } catch (error) {
        res.status(500).json({ message: 'Error adding bed', error: error.message });
    }
});

// Admin: Remove Bed from Room
app.put('/api/admin/rooms/:id/remove-bed', verifyToken, isAdmin, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (room.availableSeats > 0 && room.capacity > room.allocatedStudents.length) {
            room.capacity -= 1;
            room.availableSeats -= 1;
            await room.save();
        } else {
            return res.status(400).json({ message: 'Cannot remove an occupied bed' });
        }
        
        const populatedRoom = await Room.findById(req.params.id).populate('allocatedStudents', 'name studentId phone email');
        res.json({ message: 'Bed removed successfully', room: populatedRoom });
    } catch (error) {
        res.status(500).json({ message: 'Error removing bed', error: error.message });
    }
});

// Student: Get Available Rooms
app.get('/api/rooms/available', verifyToken, async (req, res) => {
    try {
        // Find rooms with available seats and populate the allocated students details
        console.log("Fetching available rooms for student...");
        const rooms = await Room.find({ availableSeats: { $gt: 0 } })
            .populate({
                path: 'allocatedStudents',
                select: 'name studentId course phone gender'
            });
        
        res.json(rooms);
    } catch (error) {
        console.error("Error in /api/rooms/available:", error);
        res.status(500).json({ message: 'Error fetching rooms', error: error.message });
    }
});

// Student: Get My Room Details
app.get('/api/rooms/my', verifyToken, async (req, res) => {
    try {
        if (!req.user.roomAllocation) return res.json(null);
        const room = await Room.findOne({ roomNumber: req.user.roomAllocation })
            .populate('allocatedStudents', 'name email phone studentId');
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching my room details', error: error.message });
    }
});

// Admin: Notices (Post)
app.post('/api/admin/notices', verifyToken, isAdmin, async (req, res) => {
    try {
        console.log('Received notice post request:', req.body);
        const notice = new Notice(req.body);
        await notice.save();
        res.status(201).json({ message: 'Notice posted successfully', notice });
    } catch (error) {
        console.error('Error in POST /api/admin/notices:', error);
        res.status(500).json({ message: 'Error posting notice', error: error.message });
    }
});

// All: Get Notices
app.get('/api/notices', verifyToken, async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notices', error: error.message });
    }
});

// Mess Menu Routes
app.get('/api/mess/menu', verifyToken, async (req, res) => {
    try {
        const menu = await Mess.find();
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching mess menu', error: error.message });
    }
});

app.post('/api/admin/mess/update', verifyToken, isAdmin, async (req, res) => {
    try {
        const { day, breakfast, lunch, snacks, dinner, special } = req.body;
        const menu = await Mess.findOneAndUpdate(
            { day },
            { breakfast, lunch, snacks, dinner, special },
            { upsert: true, new: true }
        );
        res.json({ message: 'Mess menu updated successfully', menu });
    } catch (error) {
        res.status(500).json({ message: 'Error updating mess menu', error: error.message });
    }
});

// --- COMPLAINTS ROUTES ---

const Complaint = require('./models/Complaint');

// Student: File a Complaint
app.post('/api/complaints', verifyToken, async (req, res) => {
    try {
        // Find existing booking to auto-fill room number if they have one
        const booking = await Booking.findOne({ userId: req.user._id, status: 'Approved', paymentStatus: 'Paid' });
        
        const complaint = new Complaint({
            userId: req.user._id,
            studentName: req.user.name || 'Unknown',
            studentId: req.user.studentId || 'Unknown',
            roomNumber: booking?.roomNumber || 'Not Assigned',
            title: req.body.title,
            description: req.body.description,
            status: 'Pending'
        });
        
        await complaint.save();
        res.status(201).json({ message: 'Complaint submitted successfully', complaint });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting complaint', error: error.message });
    }
});

// Student: Get My Complaints
app.get('/api/complaints/my', verifyToken, async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching complaints', error: error.message });
    }
});

// Admin: Get All Complaints
app.get('/api/admin/complaints', verifyToken, isAdmin, async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all complaints', error: error.message });
    }
});

// Admin: Update Complaint Status
app.put('/api/admin/complaints/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { status, resolutionNotes } = req.body;
        const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status, resolutionNotes }, { new: true });
        
        if (complaint && complaint.userId) {
            try {
                const Notification = require('./models/Notification');
                await new Notification({
                    userId: complaint.userId,
                    title: 'Complaint Status Updated',
                    message: `Your complaint "${complaint.title}" is now ${status}. ${resolutionNotes ? `Note: ${resolutionNotes}` : ''}`,
                    type: status === 'Resolved' ? 'Success' : 'Info'
                }).save();
            } catch (err) {
                console.error("Failed to save notification: " + err.message);
            }
        }

        res.json({ message: `Complaint status updated to ${status}`, complaint });
    } catch (error) {
        res.status(500).json({ message: 'Error updating complaint status', error: error.message });
    }
});

// --- ACHIEVEMENTS ROUTES ---
const Achievement = require('./models/Achievement');

// Get All Approved Achievements (For Hostel Info Wall of Fame)
app.get('/api/achievements/approved', verifyToken, async (req, res) => {
    try {
        const achievements = await Achievement.find({ status: 'Approved' }).sort({ createdAt: -1 });
        res.json(achievements);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching approved achievements', error: error.message });
    }
});

app.post('/api/achievements', verifyToken, upload.single('proofFile'), async (req, res) => {
    try {
        let proofUrl = req.body.proofUrl || '';
        if (req.file) {
            const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
            proofUrl = `${baseUrl}/uploads/${req.file.filename}`;
        }
        
        const achievement = new Achievement({
            userId: req.user._id,
            studentName: req.user.name || 'Unknown',
            studentId: req.user.studentId || 'Unknown',
            roomNumber: req.user.roomAllocation || 'Not Assigned',
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            proofUrl: proofUrl
        });
        await achievement.save();
        res.status(201).json({ message: 'Achievement submitted for review', achievement });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting achievement', error: error.message });
    }
});

app.get('/api/achievements/my', verifyToken, async (req, res) => {
    try {
        const achievements = await Achievement.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(achievements);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching achievements', error: error.message });
    }
});

app.get('/api/admin/achievements', verifyToken, isAdmin, async (req, res) => {
    try {
        const achievements = await Achievement.find().sort({ createdAt: -1 });
        res.json(achievements);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all achievements', error: error.message });
    }
});

app.put('/api/admin/achievements/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const achievement = await Achievement.findByIdAndUpdate(req.params.id, { status, rejectionReason }, { new: true });
        
        if (achievement && achievement.userId) {
            try {
                const Notification = require('./models/Notification');
                await new Notification({
                    userId: achievement.userId,
                    title: 'Achievement Update',
                    message: `Your achievement "${achievement.title}" has been ${status.toLowerCase()}. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
                    type: status === 'Approved' ? 'Success' : 'Error'
                }).save();
            } catch (err) {
                console.error("Failed to save achievement notification:", err.message);
            }
        }
        
        res.json({ message: `Achievement ${status}`, achievement });
    } catch (error) {
        res.status(500).json({ message: 'Error updating achievement', error: error.message });
    }
});

app.get('/api/public/achievements', async (req, res) => {
    try {
        const achievements = await Achievement.find({ status: 'Approved' }).sort({ createdAt: -1 }).limit(10);
        res.json(achievements);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching public achievements', error: error.message });
    }
});

// --- NOTIFICATIONS ROUTES ---
const Notification = require('./models/Notification');

app.get('/api/notifications', verifyToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
});

app.put('/api/notifications/:id/read', verifyToken, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
});

// --- PUBLIC VERIFICATION ROUTE ---
app.get('/api/public/verify/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.params.uid });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.json({
            name: user.name,
            studentId: user.studentId,
            course: user.course,
            year: user.year,
            roomAllocation: user.roomAllocation,
            accessCardIssued: user.accessCardIssued,
            status: user.status || (user.accessCardIssued ? 'Active' : 'Pending')
        });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying QR code', error: error.message });
    }
});
// --- ROOM CHAT ROUTES ---
app.get('/api/chats/:roomNumber', verifyToken, async (req, res) => {
    try {
        const { roomNumber } = req.params;
        // Verify user is in this room OR is admin
        if (req.user.role !== 'admin' && req.user.roomAllocation !== roomNumber) {
            return res.status(403).json({ message: 'Access denied to this room chat' });
        }
        const messages = await Message.find({ roomNumber }).sort({ createdAt: 1 }).limit(100);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chat messages' });
    }
});

app.post('/api/chats/:roomNumber', verifyToken, async (req, res) => {
    try {
        const { roomNumber } = req.params;
        const { content } = req.body;
        // Verify user is in this room
        if (req.user.roomAllocation !== roomNumber) {
            return res.status(403).json({ message: 'Cannot send message to this room' });
        }
        
        // Find existing student name from database
        const senderName = req.user.name || req.user.username;
        
        const message = new Message({
            roomNumber,
            senderId: req.user._id,
            senderName,
            content
        });
        await message.save();
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message' });
    }
});

// End of Routes and Tasks
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
