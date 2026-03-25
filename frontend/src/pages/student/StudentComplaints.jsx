import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../firebase';

const StudentComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await axios.get('http://localhost:5000/api/complaints/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(res.data);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await axios.post('http://localhost:5000/api/complaints', { title, description }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ text: res.data.message, type: 'success' });
            setTitle('');
            setDescription('');
            fetchComplaints();
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Error submitting complaint', type: 'danger' });
        } finally {
            setSubmitting(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        }
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-dark fw-bold mb-0">Help & Support</h2>
            </div>
            
            {message.text && (
                <div className={`alert alert-${message.type} border-0 shadow-sm rounded-4 d-flex align-items-center mb-4`}>
                    <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'} fs-4 me-3`}></i>
                    <div>{message.text}</div>
                </div>
            )}

            <div className="row g-4 mb-5">
                <div className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 text-center p-4 bg-white hover-lift transition-all">
                        <div className="bg-primary bg-opacity-10 text-primary mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                            <i className="bi bi-person-badge-fill"></i>
                        </div>
                        <h5 className="fw-bold text-dark mb-1">Chief Warden</h5>
                        <p className="text-muted small fw-bold mb-2">Dr. A. Sharma</p>
                        <p className="small mb-0"><i className="bi bi-telephone text-primary me-2"></i>+91 98765 43210</p>
                        <p className="small mb-0"><i className="bi bi-envelope text-primary me-2"></i>warden@hostel.edu</p>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 text-center p-4 bg-white hover-lift transition-all">
                        <div className="bg-success bg-opacity-10 text-success mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                            <i className="bi bi-building-gear"></i>
                        </div>
                        <h5 className="fw-bold text-dark mb-1">Hostel Manager</h5>
                        <p className="text-muted small fw-bold mb-2">Mr. V. Kumar</p>
                        <p className="small mb-0"><i className="bi bi-telephone text-success me-2"></i>+91 91234 56780</p>
                        <p className="small mb-0"><i className="bi bi-envelope text-success me-2"></i>manager@hostel.edu</p>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 text-center p-4 bg-white hover-lift transition-all">
                        <div className="bg-danger bg-opacity-10 text-danger mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                            <i className="bi bi-headset"></i>
                        </div>
                        <h5 className="fw-bold text-dark mb-1">IT Desk</h5>
                        <p className="text-muted small fw-bold mb-2">Technical Support</p>
                        <p className="small mb-0"><i className="bi bi-telephone text-danger me-2"></i>+91 1800 123 456</p>
                        <p className="small mb-0"><i className="bi bi-envelope text-danger me-2"></i>support@hostel.edu</p>
                    </div>
                </div>
            </div>

            <h4 className="fw-bold mb-3 text-dark border-bottom pb-2">Support Tickets</h4>

            <div className="row g-4">
                <div className="col-lg-5">
                    <div className="card shadow-sm border-0 rounded-4 mb-4 mb-lg-0">
                        <div className="card-header bg-white border-bottom py-3">
                            <h5 className="fw-bold text-primary mb-0"><i className="bi bi-pencil-square me-2"></i>File a Complaint</h5>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fs-5 fw-bold text-muted">Issue Title</label>
                                    <input 
                                        type="text" 
                                        className="form-control rounded-3 py-2 bg-light border-0 px-3 shadow-none" 
                                        placeholder="e.g. Broken Fan, Water Purifier Issue"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        maxLength={100}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fs-5 fw-bold text-muted">Detailed Description</label>
                                    <textarea 
                                        className="form-control rounded-3 py-2 bg-light border-0 px-3 shadow-none" 
                                        rows="5" 
                                        placeholder="Please provide specifics of the issue so the admin team can resolve it efficiently..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-2 rounded-pill fw-bold hover-lift shadow-sm d-flex align-items-center justify-content-center" disabled={submitting}>
                                    {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-send-fill me-2"></i>}
                                    {submitting ? 'Submitting...' : 'Submit Complaint'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card shadow-sm border-0 rounded-4 h-100">
                        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold text-primary mb-0"><i className="bi bi-clock-history me-2"></i>My Ticket History</h5>
                            <span className="badge bg-primary rounded-pill">{complaints.length} Tickets</span>
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                            ) : complaints.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-check2-circle fs-1 d-block mb-3 text-success opacity-50"></i>
                                    <h5>No Complaints Found</h5>
                                    <p className="small mb-0">You have not submitted any issues.</p>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {complaints.map(c => (
                                        <div className="list-group-item p-4 border-bottom border-light" key={c._id}>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h6 className="fw-bold mb-0 text-dark">{c.title}</h6>
                                                <span className={`badge rounded-pill fs-6 px-3 py-2 ${c.status === 'Resolved' ? 'bg-success' : c.status === 'In Progress' ? 'bg-info text-dark' : 'bg-warning text-dark'}`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                            <p className="text-muted small mb-3">{c.description}</p>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted fw-semibold">
                                                    <i className="bi bi-calendar me-1"></i> 
                                                    {new Date(c.createdAt).toLocaleDateString()}
                                                </small>
                                                <small className="text-muted">
                                                    ID: #{c._id.slice(-6).toUpperCase()}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentComplaints;
