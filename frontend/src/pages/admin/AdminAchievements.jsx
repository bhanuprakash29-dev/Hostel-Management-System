import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../firebase';

const AdminAchievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectionTarget, setRejectionTarget] = useState(null);
    const [reason, setReason] = useState("");

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await axios.get('https://hostel-management-system-11.onrender.com/api/admin/achievements', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAchievements(res.data);
        } catch (error) {
            console.error('Error fetching admin achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus, rejectionReason = "") => {
        try {
            const token = await auth.currentUser.getIdToken();
            await axios.put(`https://hostel-management-system-11.onrender.com/api/admin/achievements/${id}`, 
                { status: newStatus, rejectionReason }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRejectionTarget(null);
            setReason("");
            fetchAchievements();
        } catch (error) {
            console.error('Error updating achievement status:', error);
            alert("Failed to update status");
        }
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <h2 className="text-dark fw-bold mb-4">Achievement Verification</h2>
            
            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header bg-white border-0 py-3">
                    <h5 className="fw-bold text-primary mb-0"><i className="bi bi-award me-2"></i>Review Submissions</h5>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr className="text-muted small text-uppercase fw-bold">
                                    <th className="py-3 px-4">Student</th>
                                    <th className="py-3">Details</th>
                                    <th className="py-3 text-center">Current Status</th>
                                    <th className="py-3 px-4 text-end">Evaluation Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                                ) : achievements.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-5 text-muted">No achievements found.</td></tr>
                                ) : achievements.map((a) => (
                                    <tr key={a._id} className={a.status !== 'Pending' ? 'table-light' : ''}>
                                        <td className="py-3 px-4">
                                            <div className="fw-bold">{a.studentName}</div>
                                            <div className="text-muted small">ID: {a.studentId}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold mb-1">{a.title} &nbsp; 
                                                <span className="badge bg-secondary opacity-50 small">{a.category}</span>
                                            </div>
                                            <div className="small text-muted mb-2">{a.description}</div>
                                            {a.proofUrl && (
                                                <a href={a.proofUrl} target="_blank" rel="noreferrer" className="text-primary small fw-semibold">
                                                    <i className="bi bi-link-45deg"></i> View Document
                                                </a>
                                            )}
                                            {a.rejectionReason && (
                                                <div className="mt-2 p-2 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded small">
                                                    <span className="fw-bold text-danger">Rejection Reason:</span> {a.rejectionReason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge rounded-pill px-3 py-2 ${a.status === 'Approved' ? 'bg-success' : a.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td className="px-4 text-end">
                                            {a.status === 'Pending' ? (
                                                rejectionTarget === a._id ? (
                                                    <div className="d-flex flex-column gap-2">
                                                        <textarea 
                                                            className="form-control form-control-sm border-danger" 
                                                            placeholder="State the reason for rejection..."
                                                            rows="2"
                                                            value={reason}
                                                            onChange={(e) => setReason(e.target.value)}
                                                        />
                                                        <div className="d-flex gap-2 justify-content-end">
                                                            <button className="btn btn-sm btn-outline-danger px-3 py-1 fw-bold" onClick={() => updateStatus(a._id, 'Rejected', reason)}>Submit Rejection</button>
                                                            <button className="btn btn-sm btn-link text-muted px-0" onClick={() => setRejectionTarget(null)}>Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex gap-2 justify-content-end">
                                                        <button className="btn btn-sm btn-success px-4 rounded-pill fw-bold shadow-sm" onClick={() => updateStatus(a._id, 'Approved')}>Accept</button>
                                                        <button className="btn btn-sm btn-outline-danger px-4 rounded-pill fw-bold" onClick={() => setRejectionTarget(a._id)}>Reject</button>
                                                    </div>
                                                )
                                            ) : (
                                                <span className="text-muted small fw-bold">Review Complete</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAchievements;
