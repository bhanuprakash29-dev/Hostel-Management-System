import { NavLink } from 'react-router-dom';

const Sidebar = ({ role }) => {
    return (
        <div className="sidebar d-flex flex-column p-3">
            <div className="text-center mb-4">
                <h4 className="text-white fw-bold">HMS Portal</h4>
                <hr className="text-white opacity-25" />
            </div>
            
            <nav className="nav flex-column flex-grow-1">
                {role === 'admin' ? (
                    <>
                        <NavLink to="/admin/dashboard" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-speedometer2 me-3 fs-5"></i>
                            <span>Admin Home</span>
                        </NavLink>
                        <NavLink to="/admin/applications" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-file-earmark-text me-3 fs-5"></i>
                            <span>Applications</span>
                        </NavLink>
                        <NavLink to="/admin/room-management" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-door-closed me-3 fs-5"></i>
                            <span>Room Management</span>
                        </NavLink>
                        <NavLink to="/admin/student-management" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-people-fill me-3 fs-5"></i>
                            <span>Student Records</span>
                        </NavLink>
                        <NavLink to="/admin/notices" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-megaphone me-3 fs-5"></i>
                            <span>Notice Board</span>
                        </NavLink>
                        <NavLink to="/admin/complaints" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-headset me-3 fs-5"></i>
                            <span>Complaints</span>
                        </NavLink>
                        <NavLink to="/admin/achievements" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-award me-3 fs-5 text-warning"></i>
                            <span>Achievements</span>
                        </NavLink>
                        <NavLink to="/admin/profile" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-person-gear me-3 fs-5"></i>
                            <span>Admin Profile</span>
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/student/dashboard" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-house-door me-3 fs-5"></i>
                            <span>Student Home</span>
                        </NavLink>
                        <NavLink to="/student/booking" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-journal-plus me-3 fs-5"></i>
                            <span>Apply for Hostel</span>
                        </NavLink>
                        <NavLink to="/student/booking-rooms" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-door-open me-3 fs-5"></i>
                            <span>View Rooms</span>
                        </NavLink>
                        <NavLink to="/student/room-chat" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-chat-right-text me-3 fs-5 text-success"></i>
                            <span>Room Chat</span>
                        </NavLink>
                        <NavLink to="/student/mess-menu" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-egg-fried me-3 fs-5"></i>
                            <span>Mess Menu</span>
                        </NavLink>
                        <NavLink to="/student/info" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-info-circle me-3 fs-5"></i>
                            <span>Hostel Info</span>
                        </NavLink>
                        <NavLink to="/student/complaints" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-headset me-3 fs-5 text-info"></i>
                            <span>Help & Support</span>
                        </NavLink>
                        <NavLink to="/student/achievements" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-award me-3 fs-5 text-warning"></i>
                            <span>Achievements</span>
                        </NavLink>
                        <NavLink to="/student/profile" className="nav-link d-flex align-items-center mb-2 rounded shadow-sm">
                            <i className="bi bi-person-circle me-3 fs-5"></i>
                            <span>My Profile</span>
                        </NavLink>
                    </>
                )}
            </nav>
            
            <div className="mt-auto pt-3 border-top border-secondary border-opacity-25">
                <div className="d-flex align-items-center px-2">
                    <div className="bg-primary rounded-circle p-2 me-2">
                        <i className="bi bi-shield-lock text-white"></i>
                    </div>
                    <small className="text-white-50">Role: {(role || 'User').toUpperCase()}</small>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
