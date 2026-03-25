import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Dashboard = ({ user }) => {
    const [role, setRole] = useState(null);
    const [backendMessage, setBackendMessage] = useState("Connecting to backend...");
    const [dbSyncStatus, setDbSyncStatus] = useState("Syncing user data...");
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    useEffect(() => {
        if (user) {
            // 1. Test backend connection
            axios.get('http://localhost:5000/api/test')
                .then(res => setBackendMessage(res.data.message))
                .catch(err => setBackendMessage("Backend connection failed. Make sure server is running on port 5000."));

            // 2. Sync user with MongoDB
            const syncUser = async () => {
                try {
                    const token = await user.getIdToken();
                    const response = await axios.post('http://localhost:5000/api/users', {}, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setDbSyncStatus(response.data.message);
                    // Extract role from backend response
                    setRole(response.data.user.role);
                } catch (err) {
                    console.error("Sync error:", err);
                    setDbSyncStatus("Failed to sync user with MongoDB.");
                }
            };

            syncUser();
        }
    }, [user]);

    return (
        <div className="container dashboard-card p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary mb-0">Dashboard</h2>
                <button onClick={handleLogout} className="btn btn-danger">Logout</button>
            </div>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card h-100 border-0 bg-light">
                        <div className="card-body">
                            <h5 className="card-title text-secondary">Welcome, {user.displayName || 'User'}!</h5>
                            <p className="card-text"><strong>Email:</strong> {user.email}</p>
                            <p className="card-text">
                                <strong>Role: </strong> 
                                <span className={`badge ${role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                    {role ? (role === 'admin' ? 'Admin' : 'Student') : 'Loading...'}
                                </span>
                            </p>
                            <p className="card-text"><strong>Firebase UID:</strong> <code className="text-muted">{user.uid}</code></p>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-6 mb-4">
                    <div className="card h-100 border-0 bg-light text-center d-flex align-items-center justify-content-center">
                        <div className="card-body">
                            <h5 className="mb-3">System Status</h5>
                            <div className="badge bg-success p-2 mb-2 w-100 d-block">
                                {backendMessage}
                            </div>
                            <div className="badge bg-info p-2 w-100 d-block">
                                {dbSyncStatus}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="alert alert-info mt-3" role="alert">
                <i className="fa fa-info-circle me-2"></i>
                This is a minimal dashboard showing your profile information synced with our MongoDB database.
            </div>
        </div>
    );
};

export default Dashboard;
