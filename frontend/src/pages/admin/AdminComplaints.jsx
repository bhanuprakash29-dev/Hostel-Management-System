import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../firebase';

const AdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolutionTarget, setResolutionTarget] = useState(null);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await axios.get('http://localhost:5000/api/admin/complaints', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(res.data);
        } catch (error) {
            console.error('Error fetching admin complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus, resolutionNotes = "") => {
        try {
            const token = await auth.currentUser.getIdToken();
            await axios.put(`http://localhost:5000/api/admin/complaints/${id}`, 
                { status: newStatus, resolutionNotes }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResolutionTarget(null);
            setNotes("");
            fetchComplaints();
        } catch (error) {
            console.error('Error updating status:', error);
            alert("Failed to update status");
        }
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <h2 className="text-dark fw-bold mb-4">Complaint Resolution Console</h2>
            
            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold text-primary mb-0"><i className="bi bi-tools me-2"></i>Active Records</h5>
                    <div className="d-flex gap-2">
                        <span className="badge bg-warning text-dark px-3 py-2 rounded-pill"><i className="bi bi-clock-history me-1"></i>{complaints.filter(c => c.status === 'Pending').length} Pending</span>
                        <span className="badge bg-info text-dark px-3 py-2 rounded-pill"><i className="bi bi-activity me-1"></i>{complaints.filter(c => c.status === 'In Progress').length} Active</span>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr className="text-muted small text-uppercase fw-bold">
                                    <th className="py-3 px-4">Ticket</th>
                                    <th className="py-3">Student / Room</th>
                                    <th className="py-3 text-center">Status</th>
                                    <th className="py-3 text-end px-4">Resolution Option</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                                ) : complaints.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-5 text-muted">No issues registered.</td></tr>
                                ) : complaints.map((c) => (
                                    <tr key={c._id} className={c.status === 'Resolved' ? 'table-light' : ''}>
                                        <td className="py-3 px-4">
                                            <div className="fw-bold mb-1">{c.title}</div>
                                            <div className="small text-muted">{c.description}</div>
                                            <div className="text-muted italic small mt-1 opacity-75">{new Date(c.createdAt).toLocaleDateString()}</div>
                                            {c.resolutionNotes && (
                                                <div className="mt-2 p-2 bg-success bg-opacity-10 border border-success border-opacity-25 rounded small">
                                                    <span className="fw-bold text-success text-uppercase opacity-75 small">Resolution Logic:</span> {c.resolutionNotes}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div className="fw-bold">{c.studentName}</div>
                                            <div className="text-muted small">ID: {c.studentId}</div>
                                            <div className="badge bg-primary bg-opacity-10 text-primary small">Room: {c.roomNumber}</div>
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge rounded-pill px-3 py-2 fw-bold ${c.status === 'Resolved' ? 'bg-success' : c.status === 'In Progress' ? 'bg-info text-dark' : 'bg-warning text-dark'}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-4 text-end">
                                            {c.status === 'Resolved' ? (
                                                <div className="text-success fw-bold small"><i className="bi bi-check-circle-fill me-1"></i>Issue Solved</div>
                                            ) : resolutionTarget === c._id ? (
                                                <div className="d-flex flex-column gap-2" style={{ maxWidth: '250px', marginLeft: 'auto' }}>
                                                    <textarea 
                                                        className="form-control form-control-sm border-success" 
                                                        placeholder="Add resolution notes..."
                                                        rows="2"
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                    />
                                                    <div className="d-flex gap-2 justify-content-end">
                                                        <button className="btn btn-sm btn-success px-3 fw-bold rounded-pill" onClick={() => updateStatus(c._id, 'Resolved', notes)}>Save & Resolve</button>
                                                        <button className="btn btn-sm btn-link text-muted px-0 text-decoration-none" onClick={() => setResolutionTarget(null)}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="d-flex gap-2 justify-content-end">
                                                    {c.status === 'Pending' && (
                                                        <button className="btn btn-sm btn-outline-info px-3 fw-bold rounded-pill shadow-sm" onClick={() => updateStatus(c._id, 'In Progress')}>Take Operation</button>
                                                    )}
                                                    <button className="btn btn-sm btn-success px-3 fw-bold rounded-pill shadow-sm" onClick={() => setResolutionTarget(c._id)}>Resolve</button>
                                                </div>
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

export default AdminComplaints;
