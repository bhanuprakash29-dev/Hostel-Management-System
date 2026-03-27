import { useState, useEffect } from "react";
import axios from "axios";

const ManageNotices = ({ user }) => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newNotice, setNewNotice] = useState({ title: "", content: "", category: "Update" });

    useEffect(() => {
        fetchNotices();
    }, [user]);

    const fetchNotices = async () => {
        try {
            const token = await user.getIdToken();
            const res = await axios.get('https://hostel-management-system-11.onrender.com/api/notices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotices(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        try {
            const token = await user.getIdToken();
            await axios.post('https://hostel-management-system-11.onrender.com/api/admin/notices', newNotice, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNewNotice({ title: "", content: "", category: "Update" });
            fetchNotices();
        } catch (err) {
            alert("Failed to post notice");
        }
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <h2 className="mb-4 text-dark fw-bold">Notice Board Management</h2>

            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <h5 className="fw-bold mb-4">Post New Notice</h5>
                        <form onSubmit={handlePost}>
                            <div className="mb-3">
                                <label className="form-label small">Title</label>
                                <input type="text" className="form-control" value={newNotice.title} onChange={(e) => setNewNotice({...newNotice, title: e.target.value})} required placeholder="Notice Title" />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small">Category</label>
                                <select className="form-select" value={newNotice.category} onChange={(e) => setNewNotice({...newNotice, category: e.target.value})}>
                                    <option value="Update">General Update</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Rules">Rules & Regulations</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small">Content</label>
                                <textarea className="form-control" value={newNotice.content} onChange={(e) => setNewNotice({...newNotice, content: e.target.value})} required rows="4" placeholder="Notice detailed content..."></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary w-100 rounded-pill py-2 fw-bold">Post Announcement</button>
                        </form>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <h5 className="fw-bold mb-4">Recent Announcements</h5>
                        {loading ? (
                            <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
                        ) : notices.length === 0 ? (
                            <p className="text-muted text-center py-4">No notices posted yet.</p>
                        ) : (
                            <div className="list-group list-group-flush">
                                {notices.map((notice) => (
                                    <div key={notice._id} className="list-group-item px-0 py-3 border-bottom border-light">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h6 className="fw-bold text-dark mb-0">{notice.title}</h6>
                                            <span className="badge bg-light text-primary rounded-pill px-3">{notice.category}</span>
                                        </div>
                                        <p className="text-muted small mb-2">{notice.content}</p>
                                        <div className="text-muted" style={{fontSize: '0.75rem'}}>
                                            <i className="bi bi-clock me-1"></i>{new Date(notice.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageNotices;
