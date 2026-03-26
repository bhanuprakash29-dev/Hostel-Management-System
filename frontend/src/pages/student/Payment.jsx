import { useState, useEffect } from "react";
import api, { getAuthHeaders } from "../../api/axios";
import { useNavigate } from "react-router-dom";

const Payment = ({ user }) => {
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const headers = await getAuthHeaders(user);
                const [bookingRes, userRes] = await Promise.all([
                    api.get('/api/bookings/my', headers),
                    api.post('/api/users', {}, headers)
                ]);
                
                let currentBooking = bookingRes.data;
                const serverUser = userRes.data.user;

                if (serverUser.accessCardIssued && (!currentBooking || currentBooking.status !== 'Room Assigned')) {
                    currentBooking = {
                        status: 'Room Assigned',
                        roomNumber: serverUser.roomAllocation,
                        paymentStatus: 'Paid',
                        expiryDate: serverUser.expiryDate,
                        amount: serverUser.amount || 0
                    };
                }
                
                setBooking(currentBooking);
            } catch (err) {
                console.error("Error fetching status", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [user]);

    const handlePayment = async (e) => {
        e.preventDefault();
        setPaying(true);
        try {
            const headers = await getAuthHeaders(user);
            // Simulate payment delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            await api.put('/api/users/payment', {}, headers);
            
            navigate('/student/receipt');
        } catch (err) {
            alert("Payment failed. Please try again.");
        } finally {
            setPaying(false);
        }
    };


    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    if (!booking || (booking.status !== 'Approved' && booking.status !== 'Paid' && booking.status !== 'Room Assigned')) {
        const isRejected = booking?.status === 'Rejected';
        return (
            <div className="container py-5 text-center">
                <div className="card border-0 shadow-sm rounded-4 p-5 animate__animated animate__fadeIn">
                    <div className={isRejected ? "bg-danger bg-opacity-10 p-4 rounded-circle d-inline-block mx-auto mb-4" : "bg-warning bg-opacity-10 p-4 rounded-circle d-inline-block mx-auto mb-4"}>
                        <i className={isRejected ? "bi bi-shield-lock-fill text-danger fs-1" : "bi bi-clock-history text-warning fs-1"}></i>
                    </div>
                    <h3 className="fw-bold">{isRejected ? 'Application Rejected' : 'Payment Not Ready'}</h3>
                    <p className="text-muted fs-5">
                        {isRejected 
                            ? <span>Your hostel application has been rejected. <strong>Please contact the warden</strong> for further instructions.</span>
                            : <span>Your application is still being reviewed. You can pay once it is <strong>Approved</strong> by the administration.</span>
                        }
                    </p>
                    <button className="btn btn-dark rounded-pill px-4 mt-3 fw-bold" onClick={() => navigate('/student/dashboard')}>
                        <i className="bi bi-arrow-left me-2"></i>Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (booking.paymentStatus === 'Paid' || booking.status === 'Room Assigned') {
        const hasCard = booking.status === 'Room Assigned';
        return (
            <div className="container py-5 text-center">
                <div className="card border-0 shadow-lg rounded-4 p-5 animate__animated animate__zoomIn">
                    <div className="bg-success bg-opacity-10 p-4 rounded-circle d-inline-block mx-auto mb-4">
                        <i className={`bi ${hasCard ? 'bi-shield-check text-primary' : 'bi-check-circle-fill text-success'} fs-1`}></i>
                    </div>
                    <h3 className={`fw-bold ${hasCard ? 'text-primary' : 'text-success'}`}>
                        {hasCard ? 'Active Residency Found' : 'Payment Already Completed!'}
                    </h3>
                    <p className="text-muted mb-1">
                        {hasCard 
                            ? `You are currently assigned to Room ${booking.roomNumber}. Duplicate applications are not allowed.`
                            : `Your hostel fee of ₹ ${booking.amount?.toLocaleString()} has been successfully paid.`
                        }
                    </p>
                    {hasCard && (
                        <div className="p-3 bg-light rounded-4 my-4 d-inline-block mx-auto border shadow-sm">
                            <i className="bi bi-clock-history me-2 text-primary"></i>
                            Re-application Eligibility: <strong>
                                {booking.expiryDate && !isNaN(new Date(booking.expiryDate).getTime())
                                    ? new Date(booking.expiryDate).toLocaleDateString()
                                    : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()
                                }
                            </strong>
                        </div>
                    )}
                    <div className="badge bg-success px-4 py-2 rounded-pill mb-4 fs-6">Status: {booking.status === 'Room Assigned' ? 'Active Resident' : 'Paid ✓'}</div>
                    <div className="d-flex gap-3 justify-content-center mt-2">
                        {!hasCard && (
                            <button className="btn btn-outline-success rounded-pill px-4" onClick={() => navigate('/student/receipt')}>
                                <i className="bi bi-receipt me-2"></i>View Receipt
                            </button>
                        )}
                        <button className="btn btn-primary rounded-pill px-4 shadow" onClick={() => navigate('/student/dashboard')}>
                            <i className="bi bi-house me-2"></i>Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="premium-card overflow-hidden bg-white shadow-2xl">
                        <div className="bg-primary p-5 text-white text-center position-relative">
                            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10 pointer-events-none">
                                <i className="bi bi-shield-lock-fill position-absolute" style={{right: '-10%', bottom: '-10%', fontSize: '8rem'}}></i>
                            </div>
                            <h3 className="fw-800 mb-2">Secure Checkout</h3>
                            <p className="mb-0 small opacity-75 fw-bold text-uppercase" style={{letterSpacing: '1px'}}>Elite Hostel Annual Fees</p>
                        </div>
                        <div className="card-body p-4 p-lg-5">
                            <div className="mb-5 text-center">
                                <h1 className="display-4 fw-800 mb-1 text-dark">₹ {booking.amount?.toLocaleString() || '0'}</h1>
                                <span className="status-badge status-pending px-3 py-1">PAYMENT PENDING</span>
                            </div>

                            <div className="bg-light p-4 rounded-4 mb-5 border border-dark border-opacity-5">
                                <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-dark border-opacity-10">
                                    <span className="text-muted small fw-bold text-uppercase">Allocation Details</span>
                                    <i className="bi bi-info-circle text-primary"></i>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">Hostel & Block:</span>
                                    <span className="fw-bold small">{booking.hostelPreference}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">Assigned Room:</span>
                                    <span className="fw-bold small">#{booking.roomNumber}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted small">Room Tier:</span>
                                    <span className="fw-bold small">{booking.roomType}</span>
                                </div>
                            </div>

                            <form onSubmit={handlePayment}>
                                <div className="mb-4">
                                    <label className="form-label ms-1 small fw-bold text-muted text-uppercase mb-2" style={{letterSpacing: '0.5px'}}>Card Information</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0 px-3 rounded-start-pill"><i className="bi bi-credit-card-2-back-fill text-muted"></i></span>
                                        <input type="text" className="form-control border-0 bg-light py-3 px-3 shadow-none fw-bold" placeholder="Card Number" required />
                                    </div>
                                </div>
                                <div className="row g-3 mb-5">
                                    <div className="col-6">
                                        <div className="input-group">
                                            <input type="text" className="form-control border-0 bg-light py-3 px-3 rounded-pill shadow-none fw-bold text-center" placeholder="MM/YY" required />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-group">
                                            <input type="text" className="form-control border-0 bg-light py-3 px-3 rounded-pill shadow-none fw-bold text-center" placeholder="CVV" required />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-premium btn-premium-primary w-100 py-3 shadow-lg fs-5" disabled={paying}>
                                    {paying ? (
                                        <><span className="spinner-border spinner-border-sm me-3"></span>Processing...</>
                                    ) : 'Complete Secure Payment'}
                                </button>
                            </form>
                        </div>
                        <div className="card-footer bg-light border-0 text-center py-4 d-flex align-items-center justify-content-center gap-3">
                            <img src="https://cdn-icons-png.flaticon.com/512/349/349221.png" height="20" alt="Visa" className="grayscale opacity-50" />
                            <img src="https://cdn-icons-png.flaticon.com/512/349/349228.png" height="20" alt="MasterCard" className="grayscale opacity-50" />
                            <div className="vr h-20px opacity-25 mx-1"></div>
                            <span className="small text-muted fw-bold" style={{fontSize: '0.65rem'}}><i className="bi bi-shield-check me-1 fs-6"></i> PCI-DSS COMPLIANT</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default Payment;
