import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AdminHome = ({ user }) => {
    const [stats, setStats] = useState({
        totalApps: 0,
        pendingApps: 0,
        approvedApps: 0,
        rejectedApps: 0,
        totalRooms: 0,
        occupiedRooms: 0,
        availableRooms: 0
    });
    const [recentApps, setRecentApps] = useState([]);
    const [paidStudents, setPaidStudents] = useState([]);
    const [expiringStudents, setExpiringStudents] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await user.getIdToken();
                const [statsRes, appsRes, expiringRes, roomsRes, complaintsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/stats', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:5000/api/admin/bookings/all', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:5000/api/admin/expiring-students', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:5000/api/admin/rooms', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:5000/api/admin/complaints', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);
                setStats(statsRes.data);
                setRecentApps(appsRes.data.slice(0, 5));
                setExpiringStudents(expiringRes.data);
                setRooms(roomsRes.data);
                setComplaints(complaintsRes.data.filter(c => c.status === 'Pending').slice(0, 5));
                
                const paidWaiters = (appsRes.data || []).filter(app => 
                    app?.paymentStatus === 'Paid' && !app?.userId?.accessCardIssued
                );
                setPaidStudents(paidWaiters);
                
            } catch (err) {
                console.error("Error fetching admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Calculate block distribution
    const blockStats = rooms.reduce((acc, room) => {
        if (!acc[room.block]) acc[room.block] = { total: 0, occupied: 0 };
        acc[room.block].total += room.capacity;
        acc[room.block].occupied += room.allocatedStudents?.length || 0;
        return acc;
    }, {});

    const statCards = [
        { title: "Admission Requests", value: stats.totalApps, icon: "bi-file-earmark-text", color: "primary" },
        { title: "Pending Review", value: stats.pendingApps, icon: "bi-clock-history", color: "warning" },
        { title: "Total Occupants", value: stats.occupiedRooms, icon: "bi-people", color: "success" },
        { title: "Available Seats", value: stats.availableRooms, icon: "bi-door-open", color: "info" }
    ];

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-dark fw-bold mb-0">Warden's Oversight</h2>
                <div className="text-muted small fw-bold text-uppercase">
                    <i className="bi bi-calendar3 me-2"></i>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
            </div>

            {/* PAYMENT NOTIFICATION BAR */}
            {paidStudents.length > 0 && (
                <div className="alert bg-success text-white border-0 shadow-sm rounded-4 p-4 mb-4 d-flex align-items-center justify-content-between animate__animated animate__fadeInDown">
                    <div className="d-flex align-items-center">
                        <div className="bg-white bg-opacity-25 p-3 rounded-circle me-3">
                            <i className="bi bi-bell-fill fs-4 text-white"></i>
                        </div>
                        <div>
                            <h5 className="fw-bold mb-1">Payment Notification!</h5>
                            <p className="mb-0 text-white-50">{paidStudents.length} student(s) have successfully paid. Please issue their Access Cards.</p>
                        </div>
                    </div>
                    <Link to="/admin/room-management" className="btn btn-light rounded-pill px-4 fw-bold">Issue Cards Now</Link>
                </div>
            )}

            {/* Stats Cards */}
            <div className="row g-4 mb-5">
                {statCards.map((stat, i) => (
                    <div className="col-md-3" key={i}>
                        <div className="card stat-card shadow-sm rounded-4 border-0 p-4 h-100 bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1 small fw-bold text-uppercase">{stat.title}</h6>
                                    <h2 className="mb-0 fw-bold">{stat.value}</h2>
                                </div>
                                <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded-circle`}>
                                    <i className={`bi ${stat.icon} fs-4 text-${stat.color}`}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                {/* Recent Applications */}
                <div className="col-lg-8">
                    {/* Block Distribution Overview */}
                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                        <h5 className="fw-bold mb-4">Building Occupancy Overview</h5>
                        <div className="row g-3">
                            {Object.entries(blockStats || {}).length === 0 ? (
                                <div className="text-center py-4 text-muted small">No block data available yet.</div>
                            ) : Object.entries(blockStats).map(([block, data]) => {
                                const occupancyRate = data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0;
                                return (
                                    <div className="col-md-6" key={block}>
                                        <div className="p-3 border rounded-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="fw-bold text-dark">{block}</span>
                                                <span className="badge bg-primary bg-opacity-10 text-primary">{data.occupied}/{data.total} Beds</span>
                                            </div>
                                            <div className="progress rounded-pill mb-1" style={{ height: '8px' }}>
                                                <div 
                                                    className={`progress-bar rounded-pill ${occupancyRate > 90 ? 'bg-danger' : occupancyRate > 70 ? 'bg-warning' : 'bg-success'}`} 
                                                    role="progressbar" 
                                                    style={{ width: `${occupancyRate}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-end small text-muted">{occupancyRate}% Occupied</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pending Complaints */}
                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0 text-danger"><i className="bi bi-briefcase me-2"></i>Urgent Maintenance Requests</h5>
                            <Link to="/admin/complaints" className="btn btn-sm btn-outline-danger px-3 rounded-pill fw-bold">Resolve All</Link>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <tbody>
                                    {(complaints || []).length === 0 ? (
                                        <tr><td className="text-center py-3 text-muted">No pending complaints reported.</td></tr>
                                    ) : complaints.map(c => (
                                        <tr key={c._id}>
                                            <td className="border-0 py-3">
                                                <div className="fw-bold text-dark">{c.title}</div>
                                                <small className="text-muted">By {c.studentName} (Room {c.roomNumber})</small>
                                            </td>
                                            <td className="border-0 py-3 text-end">
                                                <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-1">PENDING</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* Expiring Students Section */}
                    {expiringStudents.length > 0 && (
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white animate__animated animate__fadeInUp">
                            <h5 className="fw-bold mb-4 text-warning"><i className="bi bi-hourglass-split me-2"></i>Expiring Stays (Next 30 Days)</h5>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead>
                                        <tr className="text-muted small text-uppercase">
                                            <th className="border-0">Student</th>
                                            <th className="border-0">Room</th>
                                            <th className="border-0 text-end">Expires In</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expiringStudents.map(student => {
                                            const days = Math.ceil((new Date(student.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                                            return (
                                                <tr key={student._id}>
                                                    <td className="py-3">
                                                        <div className="fw-bold">{student.name}</div>
                                                        <small className="text-muted">{student.studentId}</small>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-light text-dark fw-bold border">{student.roomAllocation}</span>
                                                    </td>
                                                    <td className="text-end">
                                                        <span className={`badge ${days <= 7 ? 'bg-danger' : 'bg-warning'} text-white fw-bold rounded-pill px-3`}>
                                                            {days <= 0 ? 'EXPIRED' : `${days} days left`}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                        <h5 className="fw-bold mb-4">Hostel Controls</h5>
                        <div className="d-grid gap-3">
                            <Link to="/admin/room-management" className="btn btn-primary text-start p-3 rounded-4 d-flex align-items-center justify-content-between shadow-sm hover-lift">
                                <div>
                                    <i className="bi bi-key-fill me-3"></i> Access Cards
                                </div>
                                {paidStudents.length > 0 && <span className="badge bg-white text-primary rounded-pill">{paidStudents.length}</span>}
                            </Link>
                            <Link to="/admin/complaints" className="btn btn-info text-dark text-start p-3 rounded-4 d-flex align-items-center justify-content-between shadow-sm hover-lift fw-bold">
                                <div><i className="bi bi-headset me-3"></i> Complaint Setup</div>
                            </Link>
                            <Link to="/admin/applications" className="btn btn-outline-dark text-start p-3 rounded-4 d-flex align-items-center border-light bg-light bg-opacity-50 hover-lift">
                                <i className="bi bi-clipboard-check me-3"></i> Validate Forms
                            </Link>
                            <Link to="/admin/notices" className="btn btn-outline-dark text-start p-3 rounded-4 d-flex align-items-center border-light bg-light bg-opacity-50 hover-lift">
                                <i className="bi bi-megaphone me-3"></i> Sync Notices
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
