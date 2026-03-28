import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import axios from 'axios';

const Navbar = ({ user }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isNavCollapsed, setIsNavCollapsed] = useState(true);

    const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

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
        <nav className="navbar navbar-expand-lg border-bottom sticky-top py-2 bg-white shadow-sm">
            <div className="container">
                <Link className="navbar-brand fw-800 text-dark d-flex align-items-center" to={user ? "/dashboard" : "/"}>
                    ELITE<span className="text-primary">HOSTEL</span>
                </Link>
                <button className="navbar-toggler border-0 shadow-none px-0" type="button" onClick={handleNavCollapse} aria-expanded={!isNavCollapsed}>
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center fw-600">
                        {user ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link px-3 text-secondary small text-uppercase fw-bold" to="/dashboard">Portal Home</Link>
                                </li>
                                <li className="nav-item dropdown px-2">
                                    <a className="nav-link position-relative text-dark" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i className="bi bi-bell fs-5"></i>
                                        {notifications.filter(n => !n.read).length > 0 && (
                                            <span className="position-absolute translate-middle p-1 bg-danger border border-light rounded-circle" style={{ top: '12px', right: '4px' }}></span>
                                        )}
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-3 animate-fade-in" style={{ width: '280px' }}>
                                        <li className="px-3 py-2 border-bottom">
                                            <h6 className="fw-bold mb-0 small">Updates</h6>
                                        </li>
                                        {notifications.length === 0 ? (
                                            <li className="px-3 py-4 text-center text-muted small">No new updates</li>
                                        ) : (
                                            notifications.map(n => (
                                                <li key={n._id} className={`px-3 py-2 border-bottom ${!n.read ? 'bg-light' : ''}`}>
                                                    <div className="fw-bold small text-dark">{n.title}</div>
                                                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{n.message}</div>
                                                    {!n.read && (
                                                        <button onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }} className="btn btn-link p-0 text-decoration-none small fw-bold" style={{ fontSize: '0.7rem' }}>Mark Read</button>
                                                    )}
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </li>
                                <li className="nav-item ms-lg-2">
                                    <button onClick={handleLogout} className="btn btn-outline-danger btn-sm px-3 fw-bold rounded-pill">
                                        Sign Out
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link px-3 text-secondary small text-uppercase fw-bold" to="/sign-in">Sign In</Link>
                                </li>
                                <li className="nav-item ms-lg-3">
                                    <Link className="btn btn-primary px-4 fw-600 shadow-sm" to="/sign-up">Sign Up</Link>
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
