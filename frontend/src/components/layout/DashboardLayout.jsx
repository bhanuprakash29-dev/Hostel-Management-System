import Sidebar from './Sidebar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children, user, role }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <Sidebar role={role} />
            <div className="main-content">
                <nav className="top-navbar d-flex justify-content-between align-items-center">
                    <div className="text-secondary fw-semibold">
                        {role === 'admin' ? 'Administration Panel' : 'Student Portal'}
                    </div>
                    <div className="dropdown">
                        <span className="me-3 text-dark d-none d-md-inline">
                            Hello, <span className="fw-bold">{user?.displayName || user?.email}</span>
                        </span>
                        <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill px-3">
                            <i className="bi bi-box-arrow-right me-1"></i> Logout
                        </button>
                    </div>
                </nav>
                <main className="content-area">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
