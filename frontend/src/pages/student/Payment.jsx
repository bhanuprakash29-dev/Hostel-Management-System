import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Payment = ({ user }) => {
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const token = await user.getIdToken();
                const [bookingRes, userRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/bookings/my', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.post('http://localhost:5000/api/users', {}, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
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
            const token = await user.getIdToken();
            // Simulate payment delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            await axios.put('http://localhost:5000/api/users/payment', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
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
        <div className="container py-5 animate__animated animate__fadeIn">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="bg-primary p-4 text-white text-center">
                            <h4 className="fw-bold mb-0">Elite Hostel Payment</h4>
                            <p className="mb-0 small opacity-75">Secure Checkout</p>
                        </div>
                        <div className="card-body p-4">
                            <div className="mb-4 text-center">
                                <h2 className="fw-bold mb-1">₹ {booking.amount?.toLocaleString() || '0'}</h2>
                                <p className="text-muted small">Total Annual Hostel Fee</p>
                            </div>

                            <div className="bg-light p-3 rounded-4 mb-4">
                                <div className="d-flex justify-content-between small mb-2">
                                    <span className="text-muted">Hostel & Room:</span>
                                    <span className="fw-bold">{booking.hostelPreference} - Room {booking.roomNumber}</span>
                                </div>
                                <div className="d-flex justify-content-between small">
                                    <span className="text-muted">Category:</span>
                                    <span className="fw-bold">{booking.roomType}</span>
                                </div>
                            </div>

                            <form onSubmit={handlePayment}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Card Number</label>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-white border-end-0"><i className="bi bi-credit-card"></i></span>
                                        <input type="text" className="form-control border-start-0" placeholder="XXXX XXXX XXXX XXXX" required />
                                    </div>
                                </div>
                                <div className="row mb-4">
                                    <div className="col-6">
                                        <label className="form-label small fw-bold">Expiry</label>
                                        <input type="text" className="form-control" placeholder="MM/YY" required />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold">CVV</label>
                                        <input type="text" className="form-control" placeholder="123" required />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold" disabled={paying}>
                                    {paying ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                                    ) : 'Pay Now & Generate Receipt'}
                                </button>
                            </form>
                        </div>
                        <div className="card-footer bg-white border-0 text-center pb-4">
                            <i className="bi bi-shield-lock text-success me-2"></i>
                            <span className="small text-muted">256-bit SSL Encrypted Payment</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
