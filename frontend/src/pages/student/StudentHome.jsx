import { useState, useEffect } from "react";
import axios from "axios";
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
                const token = await user.getIdToken();
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
                const [bookingRes, noticeRes, userRes, roomRes] = await Promise.all([
                    axios.get(`${baseUrl}/api/bookings/my`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get(`${baseUrl}/api/notices`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.post(`${baseUrl}/api/users`, {}, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get(`${baseUrl}/api/rooms/my`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).catch(() => ({ data: null }))
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
        <div className="container-fluid animate__animated animate__fadeIn position-relative">
            {/* Expiry Warning Modal/Overlay */}
            {showExpiryModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
                    <div className="card border-0 shadow-lg rounded-4 p-4 text-center animate__animated animate__bounceIn" style={{ maxWidth: '450px', backgroundColor: '#fff' }}>
                        <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-4 mx-auto mb-3" style={{ width: 'fit-content' }}>
                            <i className="bi bi-clock-history display-4"></i>
                        </div>
                        <h3 className="fw-bold text-dark mb-2">Stay Period Ending!</h3>
                        <p className="text-muted mb-4 px-3">
                            Your hostel stay expires in <strong className="text-danger">{daysLeft} days</strong>. To avoid automatic room deallocation and card deactivation, please complete your renewal payment immediately.
                        </p>
                        <div className="d-grid gap-2">
                            <Link to="/student/payment" className="btn btn-primary py-3 rounded-pill fw-bold shadow-sm" onClick={() => setShowExpiryModal(false)}>Proceed to Payment</Link>
                            <button className="btn btn-link text-muted small text-decoration-none" onClick={() => setShowExpiryModal(false)}>Dismiss for now</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Header Section */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-primary text-white p-4" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' }}>
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="fw-bold mb-1 fs-3">Welcome, {serverUser?.name || 'Student'}! 👋</h2>
                        <p className="mb-0 opacity-75 fw-medium small">
                            ID: {serverUser?.studentId || 'N/A'} &nbsp;|&nbsp; Course: {serverUser?.course || 'N/A'}
                        </p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-2 rounded-circle">
                         <i className="bi bi-person-circle fs-3 text-white"></i>
                    </div>
                </div>
            </div>

            {/* Status Alerts */}
            {isPending && (
                <div className="alert bg-info bg-opacity-10 text-info border-0 rounded-4 px-4 py-3 mb-4 d-flex align-items-center shadow-sm">
                    <i className="bi bi-hourglass-split me-3 fs-4"></i>
                    <div>
                        <div className="fw-bold fs-6">Application Under Review (PENDING)</div>
                        <div className="small opacity-75">Your room application is being processed by the administration. Payment is disabled until approval.</div>
                    </div>
                </div>
            )}
            
            {isRejected && (
                <div className="alert bg-danger bg-opacity-10 text-danger border-0 rounded-4 px-4 py-3 mb-4 d-flex align-items-center shadow-sm">
                    <i className="bi bi-shield-x me-3 fs-4"></i>
                    <div>
                        <div className="fw-bold fs-6">Application REJECTED</div>
                        <div className="small">Your application has been rejected. <strong>Please contact the warden</strong> for more details.</div>
                    </div>
                </div>
            )}
            
            {booking?.status === 'Approved' && !serverUser?.paymentStatus?.includes('Paid') && (
                <div className="alert bg-success bg-opacity-10 text-success border-0 rounded-4 px-4 py-3 mb-4 d-flex justify-content-between align-items-center shadow-sm">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-patch-check-fill me-3 fs-4"></i>
                        <div>
                            <div className="fw-bold fs-6">Application APPROVED!</div>
                            <div className="small">Your application has been approved. <strong>You can proceed to payment</strong> and room allocation.</div>
                        </div>
                    </div>
                    <Link to="/student/payment" className="btn btn-success rounded-pill px-4 fw-bold shadow-sm animate__animated animate__pulse animate__infinite">
                        Complete Payment
                    </Link>
                </div>
            )}

            {booking?.status === 'Paid' && !serverUser?.accessCardIssued && (
                <div className="alert bg-primary bg-opacity-10 text-primary border-0 rounded-4 px-4 py-3 mb-4 d-flex align-items-center shadow-sm animate__animated animate__fadeIn">
                    <i className="bi bi-clock-history me-3 fs-4"></i>
                    <div>
                        <div className="fw-bold fs-6">Payment Done - Waiting for Room Assignment</div>
                        <div className="small">Your payment is verified. <strong>Wait for the admin to assign your room</strong> and issue your digital hostel card.</div>
                    </div>
                </div>
            )}

            {needsPayment && !isPending && !isRejected && booking?.status !== 'Approved' && booking?.status !== 'Paid' && (
                <div className="alert bg-warning bg-opacity-10 text-dark border-0 rounded-4 px-4 py-3 mb-4 d-flex justify-content-between align-items-center shadow-sm">
                    <div><i className="bi bi-exclamation-triangle-fill me-2 text-warning"></i>Payment Required for Room {booking?.roomNumber}</div>
                    <Link to="/student/payment" className="btn btn-dark btn-sm rounded-pill px-3 fw-bold shadow-sm">Pay Now</Link>
                </div>
            )}

            {/* Main Content Area */}
            <div className="row g-4 mb-5">
                {/* Left Side: Card and Stats */}
                <div className="col-12 col-xl-8">
                    {/* Access Card Area */}
                    {hasCard && (
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4 position-relative" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
                            {/* Decorative Background Icon */}
                            <i className="bi bi-shield-check position-absolute" style={{ right: '-20px', bottom: '-20px', fontSize: '10rem', opacity: '0.05', transform: 'rotate(-15deg)' }}></i>
                            
                            <div className="row g-0 position-relative" style={{ zIndex: 1 }}>
                                <div className="col-md-8 p-4 p-lg-5">
                                    <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-white border-opacity-10">
                                        <div className="bg-white rounded-circle p-1 me-3 border border-2 border-primary">
                                            <div style={{ width: '85px', height: '85px', borderRadius: '50%', backgroundImage: `url(https://ui-avatars.com/api/?name=${encodeURIComponent(serverUser?.name || 'S')}&background=3b82f6&color=fff&size=128)`, backgroundSize: 'cover' }}></div>
                                        </div>
                                        <div>
                                            <h3 className="fw-bold mb-0 text-white" style={{ letterSpacing: '0.5px' }}>{serverUser?.name}</h3>
                                            <div className="text-primary fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>Hostel Resident Member</div>
                                        </div>
                                    </div>
                                    
                                    <div className="row g-3">
                                        <div className="col-sm-6">
                                            <div className="mb-3">
                                                <small className="text-white-50 text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Roll Number</small>
                                                <div className="fw-bold fs-6">{serverUser?.studentId}</div>
                                            </div>
                                            <div className="mb-0">
                                                <small className="text-white-50 text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Department</small>
                                                <div className="fw-bold fs-6">{serverUser?.course}</div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6 text-sm-end">
                                            <div className="bg-primary bg-opacity-10 p-3 rounded-4 border border-primary border-opacity-20 h-100 d-flex flex-column justify-content-center align-items-sm-end">
                                                <small className="text-primary text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Assigned Room</small>
                                                <div className="fw-bold fs-2" style={{ color: '#60a5fa' }}>{serverUser?.roomAllocation}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 bg-white text-dark d-flex flex-column justify-content-center align-items-center p-4 border-start border-light border-opacity-10" style={{ backdropFilter: 'blur(10px)' }}>
                                    <div className="text-center mb-3">
                                        <div className="badge bg-light text-muted border px-2 py-1 small rounded-pill mb-2 fw-bold" style={{ fontSize: '0.6rem' }}>{generateUniqueId()}</div>
                                        <div className={`p-2 rounded-4 border-2 border ${(serverUser?.status === 'Active' || (serverUser?.accessCardIssued && !isExpired)) ? 'border-success' : 'border-danger'}`} style={{ borderStyle: 'solid' }}>
                                            <img 
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(`${import.meta.env.VITE_APP_URL || 'http://localhost:3000'}/verify/${user?.uid}`)}&color=000&margin=10`} 
                                                alt="Access QR" 
                                                className="img-fluid rounded-3" 
                                            />
                                        </div>
                                    </div>
                                    <div className={`badge ${(serverUser?.status === 'Active' || (serverUser?.accessCardIssued && !isExpired)) ? 'bg-success' : 'bg-danger'} rounded-pill px-4 py-2 small fw-bold shadow-sm d-flex align-items-center`}>
                                        <span className="me-2 rounded-circle bg-white" style={{ width: '8px', height: '8px' }}></span>
                                        {(serverUser?.status === 'Active' || (serverUser?.accessCardIssued && !isExpired)) ? 'CARD ACTIVE' : 'CARD INACTIVE'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="row g-3">
                        {stats.map((stat, i) => (
                            <div className="col-6 col-md-3" key={i}>
                                <div className="card shadow-sm border-0 p-3 h-100 rounded-4 transition-all">
                                    <div className={`bg-${stat.color} bg-opacity-10 p-2 rounded-circle mx-auto mb-2 text-center`} style={{width: '40px', height: '40px'}}>
                                        <i className={`bi ${stat.icon} fs-5 text-${stat.color}`}></i>
                                    </div>
                                    <h6 className="text-muted fw-bold text-uppercase text-center mb-2" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>{stat.title}</h6>
                                    <div className={`badge ${stat.badge} rounded-pill py-2 px-3 fw-bold mx-auto shadow-sm d-block text-truncate fs-6`} style={{maxWidth: '100%'}}>
                                        {stat.value}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Roommates (Only visible if assigned) */}
                {hasCard && serverUser?.roomAllocation && (
                    <div className="col-12 col-xl-4">
                        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                            <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold mb-0 text-dark">My Roommates</h5>
                                <i className="bi bi-people-fill text-primary opacity-50"></i>
                            </div>
                            <div className="card-body px-4 pt-0">
                                {myRoom?.allocatedStudents && myRoom.allocatedStudents.filter(s => s._id !== serverUser?._id).length > 0 ? (
                                    <div className="roommates-list h-100 d-flex flex-column">
                                        <div className="flex-grow-1">
                                            {myRoom.allocatedStudents.filter(s => s._id !== serverUser?._id).map((mate, idx) => (
                                                <div key={idx} className="d-flex align-items-center p-3 mb-3 bg-light rounded-4 border border-opacity-10 border-white hover-lift">
                                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold shadow-sm" style={{ width: '40px', height: '40px' }}>
                                                        {mate.name?.charAt(0) || 'S'}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h6 className="fw-bold mb-0 text-dark text-truncate">{mate.name}</h6>
                                                        <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>ID: {mate.studentId}</small>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-auto pt-3 border-top">
                                            <Link to="/student/room-chat" className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center">
                                                <i className="bi bi-chat-right-text-fill me-2"></i> Start Conversation
                                            </Link>
                                            <small className="d-block text-center text-muted mt-2 small italic">Private Room Chat</small>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-5 text-muted small opacity-75">
                                        <i className="bi bi-person-dash display-6 d-block mb-3"></i>
                                        No roommates found yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Improved Quick Actions Section */}
            <div className="mb-5">
                <h4 className="fw-bold mb-4 text-dark fs-5"><i className="bi bi-lightning-charge-fill text-warning me-2"></i>Quick Actions</h4>
                <div className="row g-4">
                    {[
                        { to: "/student/booking", icon: "bi-journal-plus", label: "Apply Now", color: "#6366f1", bg: "#f5f3ff", text: "#4338ca" },
                        { to: "/student/booking-rooms", icon: "bi-house-heart", label: "Room Status", color: "#f59e0b", bg: "#fffbeb", text: "#92400e" },
                        { to: "/student/mess-menu", icon: "bi-egg-fried", label: "Mess Menu", color: "#ef4444", bg: "#fef2f2", text: "#991b1b" },
                        { to: "/student/complaints", icon: "bi-chat-right-quote", label: "Support", color: "#06b6d4", bg: "#ecfeff", text: "#0891b2" },
                        { to: "/student/achievements", icon: "bi-award", label: "Achievements", color: "#8b5cf6", bg: "#f5f3ff", text: "#5b21b6" },
                        { to: "/student/payment", icon: "bi-credit-card-2-front", label: "Payments", color: "#10b981", bg: "#f0fdf4", text: "#065f46" }
                    ].map((action, i) => (
                        <div className="col-6 col-md-4 col-lg-2" key={i}>
                            <Link to={action.to} className="text-decoration-none group d-block">
                                <div className="card border-0 shadow-sm rounded-4 p-4 text-center h-100 transition-all hover-lift" style={{ backgroundColor: action.bg }}>
                                    <div className="mx-auto rounded-4 d-flex align-items-center justify-content-center mb-3 shadow-sm" 
                                         style={{ width: '60px', height: '60px', backgroundColor: 'white' }}>
                                        <i className={`bi ${action.icon} fs-2`} style={{ color: action.color }}></i>
                                    </div>
                                    <span className="fw-bold fs-6" style={{ color: action.text }}>{action.label}</span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modified Notice Board */}
            <div className="row mb-5">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white overflow-hidden position-relative">
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                            <h5 className="fw-bold mb-0 text-dark fs-4"><i className="bi bi-megaphone-fill text-danger me-2"></i>Campus Announcements</h5>
                            <Link to="/student/notices" className="text-primary small fw-bold text-decoration-none hover-underline">View All Records <i className="bi bi-chevron-right"></i></Link>
                        </div>
                        <div className="row g-4">
                            {notices.length > 0 ? notices.map((notice, i) => (
                                <div key={i} className="col-md-4">
                                    <div className="p-4 rounded-4 bg-light h-100 border-start border-4 border-primary shadow-sm">
                                        <div className="d-flex justify-content-between mb-3">
                                            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill fw-bold" style={{ fontSize: '0.75rem' }}>{notice.category}</span>
                                            <small className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}><i className="bi bi-calendar-event me-1"></i>{new Date(notice.createdAt).toLocaleDateString()}</small>
                                        </div>
                                        <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.1rem' }}>{notice.title}</h5>
                                        <p className="text-muted small truncate-2 mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{notice.content}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-12 text-center py-4 text-muted small">No active announcements</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentHome;
