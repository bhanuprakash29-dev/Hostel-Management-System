import { useState, useEffect } from "react";
import axios from "axios";

const ManageApplications = ({ user }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [updating, setUpdating] = useState(null);
    const [selectedApp, setSelectedApp] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, [user]);

    const fetchApplications = async () => {
        try {
            const token = await user.getIdToken();
            const res = await axios.get('https://hostel-management-system-11.onrender.com/api/admin/bookings/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const apps = Array.isArray(res.data) ? res.data : [];
            setApplications(apps);
            
            // Calculate stats with safety check
            const s = apps.reduce((acc, curr) => {
                acc.total++;
                if (curr?.status === 'Pending') acc.pending++;
                // Validated counts anything that has been moved past the pending stage successfully
                if (['Approved', 'Paid', 'Room Assigned'].includes(curr?.status)) acc.approved++;
                return acc;
            }, { total: 0, pending: 0, approved: 0 });
            setStats(s);
        } catch (err) {
            console.error("Error fetching admin applications", err);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        setUpdating(id);
        try {
            const token = await user.getIdToken();
            await axios.put(`https://hostel-management-system-11.onrender.com/api/admin/bookings/${id}`, { status }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (selectedApp) setSelectedApp(null);
            fetchApplications(); // Refresh list
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently REMOVE this application?")) return;
        setUpdating(id);
        try {
            const token = await user.getIdToken();
            await axios.delete(`https://hostel-management-system-11.onrender.com/api/admin/bookings/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchApplications();
        } catch (err) {
            console.error(err);
            alert("Failed to delete application");
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <h2 className="mb-4 text-dark fw-bold">Admission Requests</h2>

            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card shadow-sm rounded-4 border-0 p-4 h-100 bg-white">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase text-muted mb-1 small fw-bold">Incoming</h6>
                                <h1 className="mb-0 fw-bold">{stats.total}</h1>
                            </div>
                            <div className="bg-primary bg-opacity-10 p-4 rounded-circle">
                                <i className="bi bi-inboxes text-primary fs-2"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm rounded-4 border-0 p-4 h-100 bg-white">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase text-muted mb-1 small fw-bold">Pending Approval</h6>
                                <h1 className="mb-0 fw-bold text-warning">{stats.pending}</h1>
                            </div>
                            <div className="bg-warning bg-opacity-10 p-4 rounded-circle">
                                <i className="bi bi-clock-history text-warning fs-2"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm rounded-4 border-0 p-4 h-100 bg-white text-dark">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase text-muted mb-1 small fw-bold">Validated</h6>
                                <h1 className="mb-0 fw-bold text-success">{stats.approved}</h1>
                            </div>
                            <div className="bg-success bg-opacity-10 p-4 rounded-circle">
                                <i className="bi bi-shield-check text-success fs-2"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white border-0 py-3">
                    <h5 className="mb-0 text-dark fw-bold"><i className="bi bi-list-task me-2 text-primary"></i>Application Queue</h5>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr className="small text-muted text-uppercase">
                                    <th className="px-4 py-3">Student Informtion</th>
                                    <th className="py-3">Course / Year</th>
                                    <th className="py-3">Preference</th>
                                    <th className="py-3 text-center">Date</th>
                                    <th className="py-3 text-center">Status</th>
                                    <th className="py-3 text-center px-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                                ) : applications.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">No applications found in the system.</td></tr>
                                ) : applications.map((app) => (
                                    <tr key={app._id}>
                                        <td className="px-4">
                                            <div className="fw-bold text-dark fs-5">{app.studentName}</div>
                                            <div className="text-muted" style={{ fontSize: '1rem' }}>ID: {app.studentId}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold fs-6">{app.course}</div>
                                            <div className="text-muted">{app.year}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold fs-6">Room {app.roomNumber}</div>
                                            <span className="badge bg-light text-dark border shadow-sm fs-6 mt-1">{app.hostelPreference}</span>
                                        </td>
                                        <td className="text-center fw-bold fs-6 text-muted">
                                            {new Date(app.appliedAt).toLocaleDateString()}
                                        </td>
                                        <td className="text-center">
                                            <div className="fw-bold fs-6 text-primary">{app.duration || '1 year'}</div>
                                            <span className={`badge px-3 py-2 rounded-pill mt-1 ${
                                                app.status === 'Room Assigned' || app.userId?.accessCardIssued ? 'bg-success' : 
                                                app.status === 'Approved' ? 'bg-primary' : 
                                                app.status === 'Rejected' ? 'bg-danger' : 
                                                app.status === 'Paid' ? 'bg-info' : 'bg-warning text-dark'
                                            }`}>
                                                {app.status === 'Room Assigned' || app.userId?.accessCardIssued ? 'ASSIGNED' : app.status}
                                            </span>
                                        </td>
                                        <td className="text-center px-4">
                                            <div className="d-flex gap-2 justify-content-center">
                                                <button 
                                                    onClick={() => setSelectedApp(app)}
                                                    className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                                >
                                                    View Details
                                                </button>
                                                {app.status === 'Pending' && (
                                                    <div className="d-flex gap-2">
                                                        <button 
                                                            onClick={() => handleAction(app._id, 'Approved')} 
                                                            disabled={updating === app._id}
                                                            className="btn btn-sm btn-success rounded-pill px-3"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction(app._id, 'Rejected')} 
                                                            disabled={updating === app._id}
                                                            className="btn btn-sm btn-danger rounded-pill px-3"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(app._id)}
                                                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                                    disabled={updating === app._id}
                                                    title="Delete Application"
                                                >
                                                    {updating === app._id ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-trash"></i>}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Application Detail Modal */}
            {selectedApp && (
                <div className="modal show d-block animate__animated animate__fadeIn" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header border-0 p-4">
                                <h5 className="modal-title fw-bold">Application Details</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedApp(null)}></button>
                            </div>
                            <div className="modal-body p-4 pt-0">
                                <div className="row g-4 fs-6 text-dark">
                                    <div className="col-md-6">
                                        <h6 className="text-muted small fw-bold text-uppercase">Student Information</h6>
                                        <p className="mb-1"><strong className="text-dark">Name:</strong> {selectedApp.studentName}</p>
                                        <p className="mb-1"><strong className="text-dark">ID:</strong> {selectedApp.studentId}</p>
                                        <p className="mb-1"><strong className="text-dark">Email:</strong> {selectedApp.email || selectedApp.userId?.email}</p>
                                        <p className="mb-1"><strong className="text-dark">Phone:</strong> {selectedApp.phone}</p>
                                        <p className="mb-1"><strong className="text-dark">Address:</strong> {selectedApp.address}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="text-muted small fw-bold text-uppercase">Academic Info</h6>
                                        <p className="mb-1"><strong className="text-dark">Course:</strong> {selectedApp.course}</p>
                                        <p className="mb-1"><strong className="text-dark">Year:</strong> {selectedApp.year}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="text-muted small fw-bold text-uppercase">Booking Preference</h6>
                                        <p className="mb-1"><strong className="text-dark">Room Number:</strong> {selectedApp.roomNumber}</p>
                                        <p className="mb-1"><strong className="text-dark">Room Type:</strong> {selectedApp.roomType}</p>
                                        <p className="mb-1"><strong className="text-dark">Hostel Block:</strong> {selectedApp.hostelPreference}</p>
                                        <p className="mb-1"><strong className="text-dark">Duration:</strong> {selectedApp.duration}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="text-muted small fw-bold text-uppercase">Status & billing</h6>
                                        <p className="mb-1"><strong>Total Fee:</strong> ₹ {selectedApp.amount?.toLocaleString()}</p>
                                        <p className="mb-1">
                                            <strong>Status:</strong> <span className={`badge ${selectedApp.status === 'Approved' ? 'bg-success' : selectedApp.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>{selectedApp.status}</span>
                                        </p>
                                        <p className="mb-1">
                                            <strong>Payment:</strong> <span className={`badge ${selectedApp.paymentStatus === 'Paid' ? 'bg-success' : 'bg-danger'}`}>{selectedApp.paymentStatus}</span>
                                        </p>
                                    </div>
                                    {selectedApp.additionalDetails && (
                                        <div className="col-12">
                                            <h6 className="text-muted small fw-bold text-uppercase">Additional Notes</h6>
                                            <p className="bg-light p-3 rounded-3 mb-0">{selectedApp.additionalDetails}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer border-0 p-4">
                                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setSelectedApp(null)}>Close</button>
                                {selectedApp.status === 'Pending' && (
                                    <>
                                        <button 
                                            onClick={() => handleAction(selectedApp._id, 'Rejected')} 
                                            className="btn btn-danger rounded-pill px-4"
                                            disabled={updating === selectedApp._id}
                                        >
                                            Reject Application
                                        </button>
                                        <button 
                                            onClick={() => handleAction(selectedApp._id, 'Approved')} 
                                            className="btn btn-success rounded-pill px-4"
                                            disabled={updating === selectedApp._id}
                                        >
                                            Approve Application
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageApplications;
