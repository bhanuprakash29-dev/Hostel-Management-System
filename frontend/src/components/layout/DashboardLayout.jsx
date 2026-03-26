import { useState } from 'react';
import Sidebar from './Sidebar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children, user, role }) => {
    const navigate = useNavigate();
    const [showSidebar, setShowSidebar] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar with mobile toggle state */}
            <Sidebar role={role} show={showSidebar} onClose={() => setShowSidebar(false)} />
            
            {/* Overlay for mobile when sidebar is open */}
            {showSidebar && (
                <div 
                    className="modal-overlay d-lg-none" 
                    onClick={() => setShowSidebar(false)}
                ></div>
            )}

            <div className="main-content">
                <nav className="top-nav px-4 bg-white border-bottom shadow-sm">
                    <div className="d-flex align-items-center">
                        <button 
                            className="btn btn-light d-lg-none me-4 rounded-circle p-2 shadow-sm border border-light-subtle" 
                            onClick={() => setShowSidebar(true)}
                        >
                            <i className="bi bi-list fs-4"></i>
                        </button>
                        <div className="d-none d-md-flex align-items-center px-3 py-1 bg-light rounded-pill border border-dark border-opacity-10">
                            <i className="bi bi-shield-lock-fill text-primary me-2"></i>
                            <span className="small fw-bold text-muted text-uppercase" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>
                                Secure {role === 'admin' ? 'Administration' : 'Student'} Session
                            </span>
                        </div>
                    </div>
                    
                    <div className="d-flex align-items-center">
                        <div className="me-3 d-none d-lg-block text-end">
                            <div className="text-dark fw-bold mb-0 lh-1">{user?.displayName || 'User'}</div>
                            <small className="text-muted text-uppercase" style={{fontSize: '0.65rem', letterSpacing: '0.5px'}}>{user?.email}</small>
                        </div>
                        <div className="dropdown">
                            <img src={`https://ui-avatars.com/api/?name=${user?.displayName || user?.email}&background=4f46e5&color=fff`} className="img-fluid rounded-circle border shadow-sm" style={{width: 40, height: 40}} alt="User" />
                            <button onClick={handleLogout} className="btn btn-link py-1 px-3 text-danger text-decoration-none small fw-bold ms-2">
                                <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                            </button>
                        </div>
                    </div>
                </nav>

                <main className="content-body flex-grow-1 animate-fade-in">
                    {children}
                </main>
                
                <footer className="px-4 py-3 bg-white border-top text-center text-muted small opacity-50">
                    &copy; 2026 Elite Hostel Management System • Version 2.1 Premium
                </footer>
            </div>
        </div>
    );
};

export default DashboardLayout;
