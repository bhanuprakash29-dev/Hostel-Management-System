const AdminProfile = ({ user }) => {
    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <h2 className="mb-4 text-dark fw-bold">Admin Profile</h2>
            <div className="row">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <div className="text-center mb-4">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-inline-block p-4 mb-3">
                                <i className="bi bi-person-badge fs-1 text-primary"></i>
                            </div>
                            <h4 className="fw-bold mb-0">{user?.displayName || 'Administrator'}</h4>
                            <p className="text-muted small">System Admin Access</p>
                        </div>
                        <div className="list-group list-group-flush border-top">
                            <div className="list-group-item bg-transparent py-3 d-flex justify-content-between">
                                <span className="text-muted">Email</span>
                                <span className="fw-bold">{user?.email}</span>
                            </div>
                            <div className="list-group-item bg-transparent py-3 d-flex justify-content-between">
                                <span className="text-muted">Account Status</span>
                                <span className="badge bg-success rounded-pill px-3">Verified Admin</span>
                            </div>
                            <div className="list-group-item bg-transparent py-3 d-flex justify-content-between">
                                <span className="text-muted">Permissions</span>
                                <span className="fw-bold text-primary">Full Control</span>
                            </div>
                        </div>
                        <button className="btn btn-primary rounded-pill mt-4 w-100 py-2 fw-bold">Update Admin Credentials</button>
                    </div>
                </div>
                
                <div className="col-md-6 mt-4 mt-md-0">
                    <div className="card border-0 shadow-sm rounded-4 bg-dark text-white p-4 h-100">
                        <h5 className="fw-bold mb-4"><i className="bi bi-activity me-2"></i>Security Logs</h5>
                        <div className="mb-3 d-flex align-items-center">
                            <div className="p-2 border border-secondary rounded me-3"><i className="bi bi-clock small"></i></div>
                            <div>
                                <small className="d-block text-secondary">Last Login</small>
                                <span className="small">{new Date().toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="mb-3 d-flex align-items-center">
                            <div className="p-2 border border-secondary rounded me-3"><i className="bi bi-globe small"></i></div>
                            <div>
                                <small className="d-block text-secondary">IP Address</small>
                                <span className="small">192.168.1.1 (Authenticated)</span>
                            </div>
                        </div>
                        <hr className="border-secondary opacity-25 my-4" />
                        <div className="alert alert-warning bg-transparent border-secondary text-white small">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Remember to sign out after performing administrative tasks on public devices.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
