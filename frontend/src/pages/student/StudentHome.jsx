import { useState, useEffect } from "react";
import api, { getAuthHeaders } from "../../api/axios";
import { Link } from "react-router-dom";

const StudentHome = ({ user, role }) => {
    // 1. ALL Hooks must be at the top level
    const [booking, setBooking] = useState(null);
    const [notices, setNotices] = useState([]);
    const [serverUser, setServerUser] = useState(null);
    const [myRoom, setMyRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [renewing, setRenewing] = useState(false);
    const [showExpiryModal, setShowExpiryModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const headers = await getAuthHeaders(user);
                const [bookingRes, noticeRes, userRes, roomRes] = await Promise.all([
                    api.get('/api/bookings/my', headers),
                    api.get('/api/notices', headers),
                    api.post('/api/users', {}, headers),
                    api.get('/api/rooms/my', headers).catch(() => ({ data: null }))
                ]);
                setBooking(bookingRes.data);
                setNotices(noticeRes.data.slice(0, 3));
                setServerUser(userRes.data.user);
                setMyRoom(roomRes.data);
            } catch (err) {
                console.error("Error fetching data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        if (serverUser?.expiryDate) {
            const diff = new Date(serverUser.expiryDate) - new Date();
            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
            if (days !== null && days <= 10 && days > 0 && serverUser?.paymentStatus !== 'Paid') {
                setShowExpiryModal(true);
            }
        }
    }, [serverUser]);

    if (loading) {
        return (
            <div className="text-center py-5 d-flex flex-column align-items-center">
                <div className="spinner-border text-primary shadow-sm mb-3"></div>
                <p className="text-muted">Loading your portal...</p>
            </div>
        );
    }

    const stats = [
        { title: "Application", value: booking?.status || "None", icon: "bi-file-earmark-text", color: "primary", badge: booking?.status === 'Approved' ? 'bg-success' : booking?.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark' },
        { title: "Room No", value: serverUser?.roomAllocation || "N/A", icon: "bi-door-open", color: "info", badge: "bg-info text-dark" },
        { title: "Hostel", value: booking?.hostelPreference || "N/A", icon: "bi-building", color: "success", badge: "bg-success text-white" },
        { title: "Payment", value: serverUser?.paymentStatus || "Pending", icon: "bi-credit-card", color: "danger", badge: serverUser?.paymentStatus === 'Paid' ? 'bg-success text-white' : 'bg-danger text-white' }
    ];

    const isPending = booking?.status === 'Pending';
    const isRejected = booking?.status === 'Rejected';
    const needsPayment = booking?.status === 'Approved' && serverUser?.paymentStatus !== 'Paid';
    const hasCard = serverUser?.accessCardIssued;

    const daysLeft = (() => {
        if (!serverUser?.expiryDate) return null;
        const diff = new Date(serverUser.expiryDate) - new Date();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    })();
    const isExpiringSoon = daysLeft !== null && daysLeft <= 10 && daysLeft > 0;
    const isExpired = daysLeft !== null && daysLeft <= 0;

    const generateUniqueId = () => {
        if (!serverUser) return '---';
        const raw = `${serverUser.studentId}-${serverUser.roomAllocation}`;
        let hash = 0;
        for (let i = 0; i < raw.length; i++) {
            hash = ((hash << 5) - hash) + raw.charCodeAt(i);
            hash |= 0;
        }
        return `AC-${Math.abs(hash).toString(16).toUpperCase()}`;
    };

    return (
        <div className="animate-fade-in">
            {/* Expiry Alert */}
            {showExpiryModal && (
                <div className="modal-overlay d-flex align-items-center justify-content-center">
                    <div className="bg-white rounded-3 p-5 shadow-lg text-center" style={{ maxWidth: '400px' }}>
                        <div className="text-danger mb-4">
                            <i className="bi bi-clock-history fs-1"></i>
                        </div>
                        <h4 className="fw-bold text-dark mb-3">Stay Period Ending</h4>
                        <p className="text-secondary mb-4">Your stay expires in <span className="text-danger fw-700">{daysLeft} days</span>. Please complete your renewal payment.</p>
                        <div className="d-grid gap-2">
                            <Link to="/student/payment" className="btn btn-primary py-2 fw-600" onClick={() => setShowExpiryModal(false)}>Pay Renewal Fee</Link>
                            <button className="btn btn-light text-muted small" onClick={() => setShowExpiryModal(false)}>Remind me later</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Welcome Section */}
            <div className="card-decent mb-4 bg-primary text-white border-0 py-4 px-4">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="fw-700 mb-1">Welcome back, {serverUser?.name || 'Resident'}</h2>
                        <p className="mb-0 opacity-75 small fw-500">
                            ID: {serverUser?.studentId || 'N/A'} • Course: {serverUser?.course || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Application Status Alerts */}
            {isPending && (
                <div className="alert border-0 bg-info bg-opacity-10 text-info px-4 py-3 mb-4 d-flex align-items-center">
                    <i className="bi bi-info-circle-fill me-3 fs-5"></i>
                    <div>
                        <div className="fw-bold mb-0">Application Pending</div>
                        <div className="small opacity-75">Your room request is currently under review by the administration.</div>
                    </div>
                </div>
            )}
            
            {isRejected && (
                <div className="alert border-0 bg-danger bg-opacity-10 text-danger px-4 py-3 mb-4 d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-3 fs-5"></i>
                    <div>
                        <div className="fw-bold mb-0">Application Status: Rejected</div>
                        <div className="small opacity-75">Please contact the hostel office for more information regarding your application.</div>
                    </div>
                </div>
            )}
            
            {booking?.status === 'Approved' && !serverUser?.paymentStatus?.includes('Paid') && (
                <div className="alert border-0 bg-success bg-opacity-10 text-success px-4 py-3 mb-4 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill me-3 fs-5"></i>
                        <div>
                            <div className="fw-bold">Approval Granted</div>
                            <div className="small">Your application has been approved. Proceed to payment for room allocation.</div>
                        </div>
                    </div>
                    <Link to="/student/payment" className="btn btn-success btn-sm px-4 fw-bold rounded-pill">Complete Payment</Link>
                </div>
            )}

            {/* Stats Dashboard */}
            <div className="row g-4 mb-5">
                {stats.map((stat, i) => (
                    <div className="col-12 col-sm-6 col-md-3" key={i}>
                        <div className="card-decent h-100 p-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className={`p-2 rounded bg-${stat.color} bg-opacity-10 text-${stat.color}`}>
                                    <i className={`bi ${stat.icon} fs-4`}></i>
                                </div>
                                <div>
                                    <p className="text-secondary small fw-bold text-uppercase mb-0" style={{ fontSize: '10px' }}>{stat.title}</p>
                                    <h5 className="fw-bold mb-0 text-dark">{stat.value}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4 mb-5">
                {/* ID Card Display */}
                <div className="col-12 col-lg-8">
                    {hasCard ? (
                        <div className="card-decent p-0 overflow-hidden border-0 shadow-sm">
                            <div className="row g-0">
                                <div className="col-md-7 p-4 p-xl-5 bg-white">
                                    <div className="d-flex align-items-center mb-4">
                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(serverUser?.name || 'S')}&background=2563eb&color=fff&size=80`} className="rounded-circle me-3 border" style={{ width: '64px' }} alt="Avatar" />
                                        <div>
                                            <h4 className="fw-bold mb-0 text-dark">{serverUser?.name}</h4>
                                            <span className="text-primary small fw-bold text-uppercase" style={{ fontSize: '11px' }}>Verified Resident</span>
                                        </div>
                                    </div>
                                    <div className="row g-3 pt-3 border-top">
                                        <div className="col-6">
                                            <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '10px' }}>Student ID</small>
                                            <p className="fw-bold text-dark mb-0">{serverUser?.studentId}</p>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '10px' }}>Room No</small>
                                            <p className="fw-bold text-primary mb-0">{serverUser?.roomAllocation}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-5 bg-light p-4 text-center d-flex flex-column justify-content-center align-items-center">
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${import.meta.env.VITE_APP_URL || 'http://localhost:3000'}/verify/${user?.uid}`)}`} 
                                        alt="QR" 
                                        className="img-fluid rounded mb-3 border bg-white p-2"
                                        style={{ width: '110px' }}
                                    />
                                    <div className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 small fw-bold border border-success border-opacity-25">
                                        SYSTEM-ACTIVE
                                    </div>
                                    <small className="text-muted mt-2 fw-bold" style={{ fontSize: '9px' }}>{generateUniqueId()}</small>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card-decent py-5 text-center bg-light border-dashed">
                            <i className="bi bi-shield-slash text-muted fs-1 mb-3 d-block"></i>
                            <h5 className="fw-bold text-secondary">Card Not Issued</h5>
                            <p className="text-muted small">Your digital access card will appear here after approval.</p>
                        </div>
                    )}
                </div>

                {/* Notices Section */}
                <div className="col-12 col-lg-4">
                    <div className="card-decent h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">Notice Board</h5>
                            <Link to="/student/notices" className="text-primary small fw-700 text-decoration-none">More</Link>
                        </div>
                        <div className="vstack gap-3">
                            {notices.length > 0 ? notices.map((notice, i) => (
                                <div key={i} className="p-3 bg-light rounded-3 border-start border-4 border-primary">
                                    <div className="fw-bold small text-dark mb-1">{notice.title}</div>
                                    <p className="text-secondary truncate-2 mb-0" style={{ fontSize: '12px' }}>{notice.content}</p>
                                    <small className="text-muted" style={{ fontSize: '10px' }}>{new Date(notice.createdAt).toLocaleDateString()}</small>
                                </div>
                            )) : (
                                <p className="text-center text-muted small py-4">No active notices</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Link Grid */}
            <h5 className="fw-bold mb-4">Resident Services</h5>
            <div className="row g-3">
                {[
                    { to: "/student/booking", icon: "bi-journal-plus", label: "Apply Seat" },
                    { to: "/student/booking-rooms", icon: "bi-house-heart", label: "Room Status" },
                    { to: "/student/mess-menu", icon: "bi-egg-fried", label: "Mess Menu" },
                    { to: "/student/complaints", icon: "bi-chat-left-dots", label: "Support" },
                    { to: "/student/achievements", icon: "bi-award", label: "Achievements" },
                    { to: "/student/payment", icon: "bi-credit-card", label: "Payments" }
                ].map((action, i) => (
                    <div className="col-6 col-md-4 col-lg-2" key={i}>
                        <Link to={action.to} className="text-decoration-none">
                            <div className="card-decent p-4 text-center h-100">
                                <div className="text-primary mb-3">
                                    <i className={`bi ${action.icon} fs-3`}></i>
                                </div>
                                <span className="fw-bold small text-dark">{action.label}</span>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentHome;
