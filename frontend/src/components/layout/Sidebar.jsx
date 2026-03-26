import { NavLink, Link } from 'react-router-dom';

const Sidebar = ({ role, show, onClose }) => {
    return (
        <aside className={`sidebar ${show ? 'show' : ''} border-end`}>
            <div className="sidebar-logo mb-4">
                <Link to="/" className="text-white text-decoration-none fw-800 fs-4 d-flex align-items-center">
                    <i className="bi bi-building me-2"></i> HMS
                </Link>
                <button className="btn d-lg-none ms-auto text-white" aria-label="Close sidebar" onClick={onClose}>
                    <i className="bi bi-x-large"></i>
                </button>
            </div>
            
            <nav className="sidebar-nav">
                <div className="text-muted small fw-bold text-uppercase px-2 mb-3 opacity-50" style={{ fontSize: '10px' }}>Management</div>
                {role === 'admin' ? (
                    <>
                        <NavLink to="/admin/dashboard" className="nav-link" onClick={onClose}>
                            <i className="bi bi-speedometer2"></i>
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/admin/applications" className="nav-link" onClick={onClose}>
                            <i className="bi bi-journal-text"></i>
                            <span>Applications</span>
                        </NavLink>
                        <NavLink to="/admin/room-management" className="nav-link" onClick={onClose}>
                            <i className="bi bi-layout-text-sidebar-reverse"></i>
                            <span>Rooms</span>
                        </NavLink>
                        <NavLink to="/admin/student-management" className="nav-link" onClick={onClose}>
                            <i className="bi bi-people"></i>
                            <span>Students</span>
                        </NavLink>
                        <NavLink to="/admin/notices" className="nav-link" onClick={onClose}>
                            <i className="bi bi-megaphone"></i>
                            <span>Notices</span>
                        </NavLink>
                        <NavLink to="/admin/complaints" className="nav-link" onClick={onClose}>
                            <i className="bi bi-chat-left-dots"></i>
                            <span>Complaints</span>
                        </NavLink>
                        <NavLink to="/admin/profile" className="nav-link" onClick={onClose}>
                            <i className="bi bi-gear"></i>
                            <span>Settings</span>
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/student/dashboard" className="nav-link" onClick={onClose}>
                            <i className="bi bi-house"></i>
                            <span>Home</span>
                        </NavLink>
                        <NavLink to="/student/booking" className="nav-link" onClick={onClose}>
                            <i className="bi bi-plus-circle"></i>
                            <span>Apply Seat</span>
                        </NavLink>
                        <NavLink to="/student/booking-rooms" className="nav-link" onClick={onClose}>
                            <i className="bi bi-eye"></i>
                            <span>View Rooms</span>
                        </NavLink>
                        <NavLink to="/student/room-chat" className="nav-link" onClick={onClose}>
                            <i className="bi bi-chat-dots"></i>
                            <span>Room Chat</span>
                        </NavLink>
                        <NavLink to="/student/mess-menu" className="nav-link" onClick={onClose}>
                            <i className="bi bi-cup-hot"></i>
                            <span>Mess Menu</span>
                        </NavLink>
                        <NavLink to="/student/notices" className="nav-link" onClick={onClose}>
                            <i className="bi bi-bell"></i>
                            <span>Updates</span>
                        </NavLink>
                        <NavLink to="/student/complaints" className="nav-link" onClick={onClose}>
                            <i className="bi bi-headset"></i>
                            <span>Support</span>
                        </NavLink>
                        <NavLink to="/student/profile" className="nav-link" onClick={onClose}>
                            <i className="bi bi-person"></i>
                            <span>My Profile</span>
                        </NavLink>
                    </>
                )}
            </nav>
            
            <div className="mt-auto pt-4 border-top opacity-75">
                <div className="d-flex align-items-center px-2">
                    <div className="text-secondary p-1 me-2 border rounded-3 bg-light opacity-50" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`bi ${role === 'admin' ? 'bi-shield-check' : 'bi-person-badge'} fs-6`}></i>
                    </div>
                    <div>
                        <div className="small fw-700 text-white opacity-50 uppercase" style={{ fontSize: '9px' }}>Log In Role</div>
                        <div className="small text-white fw-bold">{(role || 'Resident')}</div>
                    </div>
                </div>
            </div>
        </aside>

    );
};

export default Sidebar;
