import { useState, useEffect } from 'react';
import axios from 'axios';

const StudentProfile = ({ user }) => {
    const [profile, setProfile] = useState({
        name: user?.displayName || '',
        email: user?.email || '',
        studentId: user?.studentId || '',
        course: user?.course || '',
        year: user?.year || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await user.getIdToken();
                // Fetch booking
                const bookingRes = await axios.get('https://hostel-management-system-11.onrender.com/api/bookings/my', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setBooking(bookingRes.data);
                
                // Fetch latest user data (for profile sync)
                const userRes = await axios.post('https://hostel-management-system-11.onrender.com/api/users', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const userData = userRes.data.user;
                setProfile({
                    name: userData.name || '',
                    email: userData.email || '',
                    studentId: userData.studentId || '',
                    course: userData.course || '',
                    year: userData.year || '',
                    phone: userData.phone || '',
                    address: userData.address || ''
                });
            } catch (err) {
                console.error("Error fetching data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setMessage({ type: '', text: '' });
        try {
            const token = await user.getIdToken();
            await axios.put('https://hostel-management-system-11.onrender.com/api/users/profile', profile, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Profile updated successfully! Refreshing...' });
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                window.location.reload();
            }, 1000);
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to update profile.' });
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': return 'bg-success';
            case 'Pending': return 'bg-warning text-dark';
            case 'Rejected': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <h2 className="mb-4 text-dark fw-bold">My Profile</h2>
            
            {message.text && (
                <div className={`alert alert-${message.type} rounded-4 shadow-sm animate__animated animate__slideInDown`} role="alert">
                    {message.text}
                </div>
            )}

            <div className="row g-4">
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm rounded-4 overlay-hidden">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0 text-primary fw-bold">Personal Information</h5>
                        </div>
                        <div className="card-body p-4">
                            <form className="row g-3" onSubmit={handleUpdate}>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold">Full Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control rounded-3" 
                                        value={profile.name} 
                                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold">Email Address</label>
                                    <input type="email" className="form-control rounded-3 bg-light" value={profile.email} readOnly />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label text-muted small fw-bold">Student ID</label>
                                    <input 
                                        type="text" 
                                        className="form-control rounded-3" 
                                        value={profile.studentId} 
                                        onChange={(e) => setProfile({...profile, studentId: e.target.value})}
                                        placeholder="e.g. STU12345" 
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label text-muted small fw-bold">Course / Branch</label>
                                    <input 
                                        type="text" 
                                        className="form-control rounded-3" 
                                        value={profile.course} 
                                        onChange={(e) => setProfile({...profile, course: e.target.value})}
                                        placeholder="e.g. Computer Science" 
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label text-muted small fw-bold">Academic Year</label>
                                    <select 
                                        className="form-select rounded-3" 
                                        value={profile.year} 
                                        onChange={(e) => setProfile({...profile, year: e.target.value})}
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        className="form-control rounded-3" 
                                        value={profile.phone} 
                                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                        placeholder="+1 234 567 890" 
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-bold">Permanent Address</label>
                                    <input 
                                        type="text" 
                                        className="form-control rounded-3" 
                                        value={profile.address} 
                                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                                        placeholder="City, State, Country" 
                                    />
                                </div>
                                <div className="col-md-12 mt-4 text-end">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary px-5 rounded-pill fw-bold shadow-sm"
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white border-0 py-3 text-center">
                            <h5 className="mb-0 text-dark fw-bold">Room & Booking</h5>
                        </div>
                        <div className="card-body d-flex flex-column align-items-center justify-content-center py-5">
                            {loading ? (
                                <div className="spinner-border text-primary" role="status"></div>
                            ) : booking ? (
                                <>
                                    <div className={`badge ${getStatusBadge(booking.status)} p-3 rounded-pill mb-3 shadow-sm`}>
                                        <h5 className="mb-0 px-3">{booking.status}</h5>
                                    </div>
                                    <p className="text-muted text-center mb-0">
                                        Applied for <strong>{booking.hostelPreference}</strong>
                                    </p>
                                    <p className="text-muted small mb-4">{new Date(booking.appliedAt).toLocaleDateString()}</p>
                                    
                                    <div className="bg-light w-100 p-3 rounded-4">
                                        <div className="d-flex justify-content-between small mb-2 text-dark">
                                            <span>Room Allocation:</span>
                                            <span className="fw-bold">{user.roomAllocation || 'Not Allocated'}</span>
                                        </div>
                                        <div className="d-flex justify-content-between small text-dark">
                                            <span>Payment Status:</span>
                                            <span className={`fw-bold ${user.paymentStatus === 'Paid' ? 'text-success' : 'text-danger'}`}>{user.paymentStatus || 'Pending'}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-calendar-x fs-1 text-muted mb-3"></i>
                                    <p className="text-muted text-center">No active hostel application.</p>
                                    <button className="btn btn-outline-primary rounded-pill mt-2">Book Now</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
