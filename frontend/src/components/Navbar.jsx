import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import axios from 'axios';

const Navbar = ({ user }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!user) return;
        const fetchNotifications = async () => {
            try {
                const token = await user.getIdToken();
                const res = await axios.get('/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to fetch notifications");
            }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const markAsRead = async (id) => {
        try {
            const token = await user.getIdToken();
            await axios.put(`/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n?._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error("Failed to mark as read");
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm backdrop-blur" style={{ background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)' }}>
            <div className="container py-1">
                <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to={user ? "/dashboard" : "/"}>
                    <i className="bi bi-building text-warning me-2"></i> 
                    Elite <span className="text-warning font-monospace ms-1">Hostel</span>
                </Link>
                <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center fw-semibold">
                        <li className="nav-item">
                            <Link className="nav-link px-3" to={user ? "/dashboard" : "/"}>Home</Link>
                        </li>
                        {user ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link px-3" to="/dashboard">Dashboard</Link>
                                </li>
                                <li className="nav-item dropdown px-2 mt-2 mt-lg-0">
                                    <a className="nav-link position-relative" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i className="bi bi-bell-fill fs-5"></i>
                                        {notifications.filter(n => !n.read).length > 0 && (
                                            <span className="position-absolute top-10 start-90 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                                                {notifications.filter(n => !n.read).length}
                                            </span>
                                        )}
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 p-0 mt-3" style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
                                        <li className="p-3 border-bottom bg-light rounded-top-4">
                                            <h6 className="fw-bold mb-0 text-dark">Notifications</h6>
                                        </li>
                                        {notifications.length === 0 ? (
                                            <li className="p-4 text-center text-muted small">No notifications yet</li>
                                        ) : (
                                            notifications.map(n => (
                                                <li key={n._id} className={`p-3 border-bottom position-relative ${n.read ? 'bg-white' : 'bg-primary bg-opacity-10'}`}>
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <span className={`badge ${n.type === 'Success' ? 'bg-success' : n.type === 'Error' ? 'bg-danger' : n.type === 'Warning' ? 'bg-warning text-dark' : 'bg-info text-dark'} rounded-pill`} style={{ fontSize: '0.65rem' }}>{n.type}</span>
                                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>{n?.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Today'}</small>
                                                    </div>
                                                    <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.85rem' }}>{n.title}</div>
                                                    <div className="small text-muted mb-2" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>{n.message}</div>
                                                    {!n.read && (
                                                        <button onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }} className="btn btn-sm btn-link text-decoration-none p-0 text-primary fw-bold" style={{ fontSize: '0.75rem' }}>Mark as read</button>
                                                    )}
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </li>
                                <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                                    <button onClick={handleLogout} className="btn btn-warning rounded-pill px-4 fw-bold hover-lift shadow-sm text-dark d-flex align-items-center">
                                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item mt-2 mt-lg-0">
                                    <Link className="btn btn-outline-light rounded-pill px-4 ms-lg-2 hover-lift fw-bold" to="/sign-in">Login</Link>
                                </li>
                                <li className="nav-item mt-2 mt-lg-0">
                                    <Link className="btn btn-warning text-dark rounded-pill px-4 ms-lg-2 hover-lift fw-bold shadow-sm" to="/sign-up">Sign Up</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
