import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const HostelBooking = ({ user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const preSelected = location.state || {};

    const [bookingData, setBookingData] = useState({
        studentName: user.displayName || '',
        studentId: '',
        email: user.email || '',
        course: '',
        year: '',
        gender: 'Male',
        phone: '',
        address: '',
        hostelPreference: preSelected.selectedBlock || '',
        roomNumber: preSelected.selectedRoom || '',
        roomType: preSelected.selectedType || '',
        amount: preSelected.selectedPrice || 0,
        duration: '1 Year',
        additionalDetails: ''
    });

    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await user.getIdToken();
                // Fetch latest profile details from server
                const userRes = await axios.post('http://localhost:5000/api/users', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const serverUser = userRes.data.user;
                
                setBookingData(prev => ({
                    ...prev,
                    studentName: serverUser.name || prev.studentName,
                    studentId: serverUser.studentId || '',
                    course: serverUser.course || '',
                    year: serverUser.year || '',
                    gender: serverUser.gender || 'Male',
                    phone: serverUser.phone || '',
                    address: serverUser.address || ''
                }));

                const bookingRes = await axios.get('http://localhost:5000/api/bookings/my', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                let currentStatus = bookingRes.data;
                // CRITICAL FIX: Ensure residency warning works even if Booking record is missing
                if (serverUser.accessCardIssued && (!currentStatus || currentStatus.status !== 'Room Assigned')) {
                    currentStatus = {
                        status: 'Room Assigned',
                        roomNumber: serverUser.roomAllocation || 'Assigned',
                        hostelPreference: serverUser.hostelPreference || 'Hostel',
                        expiryDate: serverUser.expiryDate,
                        paymentStatus: 'Paid'
                    };
                }
                
                setStatus(currentStatus);
            } catch (err) {
                console.error("Error fetching data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = await user.getIdToken();
            await axios.post('http://localhost:5000/api/bookings', bookingData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("Application submitted successfully!");
            // Refresh to show status
            const bookingRes = await axios.get('http://localhost:5000/api/bookings/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStatus(bookingRes.data);
        } catch (err) {
            alert(err.response?.data?.message || "Error submitting application");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    if (status) {
        return (
            <div className="container py-5 text-center">
                <div className="card border-0 shadow-sm rounded-4 p-5 animate__animated animate__zoomIn">
                    <div className={`p-4 rounded-circle d-inline-block mb-4 ${
                        status.status === 'Approved' ? 'bg-success bg-opacity-10' : 
                        status.status === 'Rejected' ? 'bg-danger bg-opacity-10' : 'bg-warning bg-opacity-10'
                    }`}>
                        <i className={`bi ${
                            status.status === 'Approved' ? 'bi-patch-check-fill text-success' : 
                            status.status === 'Rejected' ? 'bi-x-circle-fill text-danger' : 'bi-hourglass-split text-warning'
                        } fs-1`}></i>
                    </div>
                    
                    <h3 className="fw-bold">
                        {status.paymentStatus === 'Paid' ? 'Payment Completed' : `Application ${status.status}`}
                    </h3>
                    
                    <p className="text-muted">
                        {status.status === 'Rejected' 
                            ? "We regret to inform you that your application has been rejected. Please contact the administration for details."
                            : `You have requested Room ${status.roomNumber} in ${status.hostelPreference}.`
                        }
                    </p>

                    <div className={`badge ${
                        status.paymentStatus === 'Paid' ? 'bg-primary' :
                        status.status === 'Approved' ? 'bg-success' : 
                        status.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'
                    } px-4 py-2 rounded-pill mb-4`}>
                        {status.paymentStatus === 'Paid' ? 'Completed' : `Status: ${status.status}`}
                    </div>

                    {status.status === 'Pending' && (
                        <div className="alert alert-info rounded-pill inline-block">
                            <i className="bi bi-info-circle me-2"></i> Your application is under review by the administration.
                        </div>
                    )}

                    {status.status === 'Approved' && status.paymentStatus === 'Pending' && (
                        <div className="mt-2">
                            <button className="btn btn-primary rounded-pill px-5 py-3 fw-bold" onClick={() => navigate('/student/payment')}>
                                Proceed to Payment (₹ {status.amount?.toLocaleString()})
                            </button>
                        </div>
                    )}

                    {status.status === 'Paid' && status.paymentStatus === 'Paid' && (
                        <div className="mt-2 text-center">
                            <div className="alert alert-primary rounded-pill mb-4 d-inline-block px-4">
                                <i className="bi bi-clock-history me-2"></i> <strong>Payment Successful!</strong> Waiting for the admin to assign your room.
                            </div>
                            <div>
                                <button className="btn btn-outline-success rounded-pill px-5 py-3 fw-bold" onClick={() => navigate('/student/dashboard')}>
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    )}

                    {status.status === 'Room Assigned' && (
                        <div className="mt-2 text-center animate__animated animate__fadeIn">
                            <div className="alert border-0 rounded-4 mb-4 py-5 px-4" style={{ backgroundColor: '#eef7f2' }}>
                                <div className="mb-3 text-success">
                                    <i className="bi bi-patch-check fs-1"></i>
                                </div>
                                <h2 className="fw-bold mb-3" style={{ color: '#064e3b' }}>Active Room Allocation Found</h2>
                                <p className="text-muted fs-6 mb-5 mx-auto" style={{maxWidth: '600px', lineHeight: '1.6'}}>
                                    You are currently holding an active hostel pass for <strong>Room {status.roomNumber}</strong> ({status.hostelPreference}). 
                                    Duplicate applications are not permitted during an active stay.
                                </p>
                                
                                <div className="card border-0 shadow-sm rounded-4 d-inline-block mx-auto mb-5 p-4" style={{ minWidth: '250px' }}>
                                    <small className="text-muted text-uppercase fw-bold d-block mb-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Stay Duration Ends On</small>
                                    <div className="fw-bold text-dark fs-3">
                                        {status.expiryDate && !isNaN(new Date(status.expiryDate).getTime())
                                            ? new Date(status.expiryDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
                                            : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
                                        }
                                    </div>
                                </div>
                                
                                <div className="d-flex align-items-center justify-content-center text-primary fw-bold gap-2 py-3 border-top border-dark border-opacity-10">
                                    <i className="bi bi-info-circle-fill fs-5"></i>
                                    <span>
                                        You can re-apply for a new allocation on {
                                            status.expiryDate && !isNaN(new Date(status.expiryDate).getTime())
                                              ? new Date(status.expiryDate).toLocaleDateString()
                                              : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()
                                        }.
                                    </span>
                                </div>
                            </div>
                            
                            <button className="btn btn-dark shadow rounded-pill px-5 py-3 fw-bold mt-3" onClick={() => navigate('/student/dashboard')}>
                                <i className="bi bi-arrow-left me-2"></i>Back to Portal Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <h2 className="mb-4 text-dark fw-bold">Hostel Admission Form</h2>
            
            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <form onSubmit={handleSubmit}>
                            <h5 className="fw-bold mb-4 text-primary"><i className="bi bi-person-lines-fill me-2"></i>Student Details</h5>
                            <div className="row g-3 mb-5">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Full Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={bookingData.studentName} 
                                        onChange={(e) => setBookingData({...bookingData, studentName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Roll Number / Student ID</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={bookingData.studentId} 
                                        onChange={(e) => setBookingData({...bookingData, studentId: e.target.value})}
                                        required
                                        placeholder="e.g. 2024CS01"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Email Address</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        value={bookingData.email} 
                                        readOnly
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        className="form-control" 
                                        value={bookingData.phone} 
                                        onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                                        required
                                        placeholder="Mobile number"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Course / Branch</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={bookingData.course} 
                                        onChange={(e) => setBookingData({...bookingData, course: e.target.value})}
                                        required
                                        placeholder="e.g. B.Tech Computer Science"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Year of Study</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={bookingData.year} 
                                        onChange={(e) => setBookingData({...bookingData, year: e.target.value})}
                                        required
                                        placeholder="e.g. 1st Year"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Gender</label>
                                    <select 
                                        className="form-select" 
                                        value={bookingData.gender} 
                                        onChange={(e) => setBookingData({...bookingData, gender: e.target.value})}
                                        required
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label small fw-bold text-muted">Permanent Address</label>
                                    <textarea 
                                        className="form-control" 
                                        rows="2"
                                        value={bookingData.address} 
                                        onChange={(e) => setBookingData({...bookingData, address: e.target.value})}
                                        required
                                        placeholder="Full address with city and pincode"
                                    ></textarea>
                                </div>
                            </div>

                            <h5 className="fw-bold mb-4 text-primary"><i className="bi bi-door-open-fill me-2"></i>Selected Room Details</h5>
                            {bookingData.roomNumber ? (
                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-muted">Room Number</label>
                                        <input type="text" className="form-control bg-primary bg-opacity-10 fw-bold" value={bookingData.roomNumber} readOnly />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-muted">Category</label>
                                        <input type="text" className="form-control bg-primary bg-opacity-10" value={bookingData.roomType} readOnly />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-muted">Annual Rent (₹)</label>
                                        <input type="text" className="form-control bg-success bg-opacity-10 fw-bold text-success" value={`₹ ${bookingData.amount?.toLocaleString()}`} readOnly />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label small fw-bold text-muted">Hostel Block</label>
                                        <input type="text" className="form-control" value={bookingData.hostelPreference} readOnly />
                                    </div>
                                </div>
                            ) : (
                                <div className="alert alert-warning rounded-4 border-0 shadow-sm p-4 mb-4">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-info-circle-fill fs-3 me-3 text-warning"></i>
                                        <div>
                                            <h6 className="fw-bold mb-1">No Room Selected</h6>
                                            <p className="small mb-0">Please go back to <strong>'View Rooms'</strong> and select a room to see auto-filled details and pricing.</p>
                                        </div>
                                    </div>
                                    <button className="btn btn-warning rounded-pill px-4 mt-3 fw-bold" onClick={() => navigate('/student/booking-rooms')}>Go to Rooms</button>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted">Duration of Stay</label>
                                <select 
                                    className="form-select rounded-3" 
                                    value={bookingData.duration} 
                                    onChange={(e) => setBookingData({...bookingData, duration: e.target.value})}
                                >
                                    <option value="6 Months">6 Months</option>
                                    <option value="1 Year">1 Year</option>
                                    <option value="2 Years">2 Years</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted">Additional Notes (Optional)</label>
                                <textarea 
                                    className="form-control rounded-3" 
                                    rows="3" 
                                    placeholder="Any special medical conditions or room requests..."
                                    value={bookingData.additionalDetails}
                                    onChange={(e) => setBookingData({...bookingData, additionalDetails: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="mt-4">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm"
                                    disabled={submitting || !bookingData.roomNumber}
                                >
                                    {submitting ? 'Submitting Application...' : 'Confirm & Request Allocation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-dark text-white">
                        <h5 className="fw-bold mb-4">Admission Process</h5>
                        <div className="d-flex mb-4">
                            <div className="me-3"><span className="badge rounded-circle bg-primary">1</span></div>
                            <div>
                                <h6 className="fw-bold mb-1">Select Room</h6>
                                <p className="small opacity-50 mb-0">Browse through blocks and choose your preferred room type.</p>
                            </div>
                        </div>
                        <div className="d-flex mb-4">
                            <div className="me-3"><span className="badge rounded-circle bg-primary">2</span></div>
                            <div>
                                <h6 className="fw-bold mb-1">Fill Admission Form</h6>
                                <p className="small opacity-50 mb-0">Enter your details and confirm the selected room pricing.</p>
                            </div>
                        </div>
                        <div className="d-flex mb-4">
                            <div className="me-3"><span className="badge rounded-circle bg-primary">3</span></div>
                            <div>
                                <h6 className="fw-bold mb-1">Admin Approval</h6>
                                <p className="small opacity-50 mb-0">Admin will verify your application and approve it.</p>
                            </div>
                        </div>
                        <div className="d-flex">
                            <div className="me-3"><span className="badge rounded-circle bg-primary">4</span></div>
                            <div>
                                <h6 className="fw-bold mb-1">Secure Payment</h6>
                                <p className="small opacity-50 mb-0">Pay the fees to generate your official access card.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostelBooking;
