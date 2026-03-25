import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../firebase';

const StudentNotices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await axios.get('http://localhost:5000/api/notices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotices(res.data);
        } catch (error) {
            console.error('Error fetching notices:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryBadge = (category) => {
        switch (category) {
            case 'Academic': return 'bg-primary';
            case 'Event': return 'bg-success';
            case 'Urgent': return 'bg-danger';
            case 'General': return 'bg-info text-dark';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-dark fw-bold mb-0"><i className="bi bi-megaphone-fill text-danger me-2"></i>Campus Notices</h2>
                <div className="badge bg-white shadow-sm text-dark px-3 py-2 rounded-pill border fw-bold">
                    Total: {notices.length}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary shadow-sm" style={{ width: '3rem', height: '3rem' }}></div>
                    <p className="mt-3 text-muted fw-bold">Syncing latest announcements...</p>
                </div>
            ) : notices.length === 0 ? (
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                    <i className="bi bi-bell-slash display-1 mb-4 opacity-10"></i>
                    <h4 className="fw-bold">No Records Found</h4>
                    <p className="text-muted">There are currently no active announcements from the management.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {notices.map((notice) => (
                        <div className="col-md-6 col-lg-4" key={notice._id}>
                            <div className="card h-100 border-0 shadow-sm rounded-4 hover-lift p-4 bg-white">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <span className={`badge rounded-pill fw-bold px-3 py-2 ${getCategoryBadge(notice.category)}`}>
                                        {notice.category}
                                    </span>
                                    <small className="text-muted fw-bold">
                                        <i className="bi bi-calendar3 me-1"></i>
                                        {new Date(notice.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                                <h4 className="fw-bold text-dark mb-3" style={{ fontSize: '1.25rem' }}>{notice.title}</h4>
                                <p className="text-muted mb-4 opacity-75" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{notice.content}</p>
                                <div className="mt-auto pt-3 border-top border-light d-flex align-items-center">
                                    <div className="bg-light rounded-circle p-2 me-2">
                                        <i className="bi bi-person-check-fill text-primary"></i>
                                    </div>
                                    <small className="fw-bold text-muted">Posted by Management</small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentNotices;
