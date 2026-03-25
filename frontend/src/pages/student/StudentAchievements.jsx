import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../firebase';

const StudentAchievements = ({ user }) => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ title: '', description: '', category: 'Academic' });
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const token = await user.getIdToken();
            const res = await axios.get('http://localhost:5000/api/achievements/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAchievements(res.data);
        } catch (error) {
            console.error('Error fetching achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await user.getIdToken();
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('category', form.category);
            if (file) formData.append('proofFile', file);

            await axios.post('http://localhost:5000/api/achievements', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setForm({ title: '', description: '', category: 'Academic' });
            setFile(null);
            fetchData();
        } catch (error) {
            alert('Error submitting achievement');
        }
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-dark fw-bold mb-0">🏆 My Achievements</h2>
            </div>
            
            <div className="row g-4">
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 rounded-4 mb-4">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="fw-bold text-primary mb-0"><i className="bi bi-plus-circle me-2"></i>Add Achievement</h5>
                        </div>
                        <div className="card-body p-4 pt-0">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Title</label>
                                    <input type="text" className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Category</label>
                                    <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                                        <option value="Academic">Academic</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Cultural">Cultural</option>
                                        <option value="Technical">Technical</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Upload Certificate (PDF)</label>
                                    <input type="file" accept=".pdf" className="form-control" onChange={e => setFile(e.target.files[0])} required />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fs-6 fw-bold text-muted">Description</label>
                                    <textarea className="form-control fs-6" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 fw-bold rounded-pill hover-lift shadow-sm">
                                    Submit for Review
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="fw-bold text-dark mb-0"><i className="bi bi-award me-2 text-warning"></i>Submitted Achievements</h5>
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                            ) : achievements.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-trophy display-4 d-block mb-3 opacity-25"></i>
                                    No achievements added yet.
                                </div>
                            ) : (
                                <div className="list-group list-group-flush rounded-bottom-4">
                                    {achievements.map((item) => (
                                        <div className="list-group-item p-4 border-bottom-0 border-top" key={item._id}>
                                            <div className="d-flex w-100 justify-content-between align-items-start">
                                                <div>
                                                    <h4 className="fw-bold mb-1">{item.title}</h4>
                                                    <div className="small text-muted mb-2">
                                                        <span className="badge bg-light text-dark border me-2">{item.category}</span>
                                                        <i className="bi bi-clock me-1"></i>{new Date(item.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <p className="mb-2 text-dark opacity-75">{item.description}</p>
                                                    {item.proofUrl && (
                                                        <a href={item.proofUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary border rounded-pill px-3 mt-1 fw-bold" style={{ fontSize: '0.75rem' }}>
                                                            <i className="bi bi-link-45deg me-1"></i>View Certificate
                                                        </a>
                                                    )}
                                                </div>
                                                <span className={`badge rounded-pill fw-bold px-4 py-2 fs-6 ${item.status === 'Approved' ? 'bg-success' : item.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                    {item.status}
                                                </span>
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

export default StudentAchievements;
