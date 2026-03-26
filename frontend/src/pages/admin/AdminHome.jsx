import { useState, useEffect } from "react";
import api, { getAuthHeaders } from "../../api/axios";
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
                const headers = await getAuthHeaders(user);
                const [statsRes, appsRes, expiringRes, roomsRes, complaintsRes] = await Promise.all([
                    api.get('/api/admin/stats', headers),
                    api.get('/api/admin/bookings/all', headers),
                    api.get('/api/admin/expiring-students', headers),
                    api.get('/api/admin/rooms', headers),
                    api.get('/api/admin/complaints', headers)
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
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="text-dark fw-800 mb-1">Administrative Oversight</h2>
                    <p className="text-secondary small mb-0">Management and monitoring of hostel infrastructure and residents.</p>
                </div>
                <div className="card-decent py-2 px-3 bg-white d-none d-md-flex align-items-center gap-2">
                    <i className="bi bi-calendar3 text-primary"></i>
                    <span className="fw-700 small text-dark">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Critical Notifications */}
            {paidStudents.length > 0 && (
                <div className="alert border-0 bg-success bg-opacity-10 text-success px-4 py-3 mb-5 d-flex align-items-center justify-content-between rounded-3">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-credit-card-fill me-3 fs-4"></i>
                        <div>
                            <div className="fw-bold fs-6">Pending Access Issuance</div>
                            <div className="small opacity-75">{paidStudents.length} students have completed payments and are awaiting room assignment/card issuance.</div>
                        </div>
                    </div>
                    <Link to="/admin/room-management" className="btn btn-success btn-sm px-4 fw-700 rounded-pill shadow-sm">Process Now</Link>
                </div>
            )}

            {/* Statistics Key Performance Grids */}
            <div className="row g-4 mb-5">
                {statCards.map((stat, i) => (
                    <div className="col-12 col-md-3" key={i}>
                        <div className="card-decent h-100 p-4 bg-white">
                            <div className="d-flex align-items-center gap-3">
                                <div className={`p-3 rounded-circle bg-${stat.color} bg-opacity-10 text-${stat.color} d-flex align-items-center justify-content-center`} style={{ width: '56px', height: '56px' }}>
                                    <i className={`bi ${stat.icon} fs-3`}></i>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-secondary small fw-bold text-uppercase mb-0" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>{stat.title}</p>
                                    <h3 className="fw-800 mb-0 text-dark">{stat.value}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                {/* Main Operations Cluster */}
                <div className="col-lg-8">
                    {/* Occupancy Density Overview */}
                    <div className="card-decent p-4 mb-4 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                            <h5 className="fw-800 mb-0 text-dark small text-uppercase" style={{ letterSpacing: '1px' }}>Building Occupancy</h5>
                            <i className="bi bi-building text-muted"></i>
                        </div>
                        <div className="row g-4">
                            {Object.entries(blockStats || {}).length === 0 ? (
                                <div className="text-center py-5 text-muted small">No active block data available</div>
                            ) : Object.entries(blockStats).map(([block, data]) => {
                                const occupancyRate = data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0;
                                return (
                                    <div className="col-12 col-md-6" key={block}>
                                        <div className="p-3 bg-light rounded-3 border">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="fw-700 text-dark">{block} <small className="text-muted fw-normal ms-1">Block</small></span>
                                                <span className="badge bg-white text-dark border small rounded-pill px-2">{data.occupied} / {data.total}</span>
                                            </div>
                                            <div className="progress rounded-pill mb-2" style={{ height: '8px' }}>
                                                <div 
                                                    className="progress-bar rounded-pill" 
                                                    style={{ 
                                                        width: `${occupancyRate}%`, 
                                                        backgroundColor: occupancyRate > 90 ? 'var(--danger)' : occupancyRate > 75 ? 'var(--warning)' : 'var(--primary)' 
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="d-flex justify-content-between small text-muted">
                                                <span>Density</span>
                                                <span className="fw-bold">{occupancyRate}%</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pending Maintenance Requests */}
                    <div className="card-decent p-4 bg-white overflow-hidden">
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                            <h5 className="fw-800 mb-0 text-dark small text-uppercase" style={{ letterSpacing: '1px' }}>Priority Maintenance</h5>
                            <Link to="/admin/complaints" className="text-primary small fw-700 text-decoration-none">Review Log</Link>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-borderless align-middle mb-0">
                                <thead>
                                    <tr className="bg-light text-muted small text-uppercase" style={{ fontSize: '10px' }}>
                                        <th className="py-2">Requirement</th>
                                        <th className="py-2">Location</th>
                                        <th className="py-2 text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {complaints.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center py-5 text-muted small">No active reports registered</td></tr>
                                    ) : complaints.map(c => (
                                        <tr key={c._id} className="border-bottom-sm">
                                            <td className="py-3">
                                                <div className="fw-700 text-dark small">{c.title}</div>
                                                <div className="text-muted" style={{ fontSize: '11px' }}>By {c.studentName}</div>
                                            </td>
                                            <td className="py-3 small text-secondary">Room {c.roomNumber}</td>
                                            <td className="py-3 text-end"><span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2" style={{ fontSize: '10px' }}>HIGH</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* System Command Panel */}
                <div className="col-lg-4">
                    <div className="card-decent p-4 bg-white h-100">
                        <h5 className="fw-800 mb-4 small text-uppercase" style={{ letterSpacing: '1px' }}>Quick Operations</h5>
                        <div className="vstack gap-3">
                            <Link to="/admin/room-management" className="btn btn-primary text-start px-3 py-3 rounded-3 d-flex align-items-center gap-3">
                                <i className="bi bi-person-check fs-5"></i>
                                <div className="flex-grow-1">
                                    <div className="fw-bold small">Resident Approvals</div>
                                    <div className="opacity-75" style={{ fontSize: '11px' }}>Manage IDs and Payments</div>
                                </div>
                                {paidStudents.length > 0 && <span className="badge bg-white text-primary rounded-pill px-2">{paidStudents.length}</span>}
                            </Link>

                            <Link to="/admin/applications" className="btn btn-outline-dark text-start px-3 py-3 rounded-3 d-flex align-items-center gap-3">
                                <i className="bi bi-file-earmark-check fs-5"></i>
                                <div className="flex-grow-1">
                                    <div className="fw-bold small">Application Queue</div>
                                    <div className="opacity-75" style={{ fontSize: '11px' }}>Review New Requests</div>
                                </div>
                                {stats.pendingApps > 0 && <span className="badge bg-primary text-white rounded-pill px-2">{stats.pendingApps}</span>}
                            </Link>

                            <Link to="/admin/student-management" className="btn btn-light text-start px-3 py-2 rounded-3 text-secondary d-flex align-items-center gap-2">
                                <i className="bi bi-people-fill"></i>
                                <span className="flex-grow-1 small fw-bold">Resident Registry</span>
                            </Link>

                            <Link to="/admin/notices" className="btn btn-light text-start px-3 py-2 rounded-3 text-secondary d-flex align-items-center gap-2">
                                <i className="bi bi-megaphone-fill"></i>
                                <span className="flex-grow-1 small fw-bold">Issue Notice</span>
                            </Link>

                            {expiringStudents.length > 0 && (
                                <div className="mt-4 p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3">
                                    <div className="d-flex align-items-center gap-2 mb-2 text-danger">
                                        <i className="bi bi-exclamation-circle-fill small"></i>
                                        <span className="fw-700 text-uppercase" style={{ fontSize: '10px' }}>Stay Expiring</span>
                                    </div>
                                    <p className="text-secondary mb-3" style={{ fontSize: '11px' }}>{expiringStudents.length} students reaching limit.</p>
                                    <Link to="/admin/student-management" className="btn btn-danger btn-sm w-100 fw-700 rounded-pill">View Timeline</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
