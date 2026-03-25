import React from 'react';

const StudentSupport = () => {
    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <h2 className="fw-bold mb-4 text-dark">Help & Support</h2>
            <div className="row g-4">
                <div className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 text-center p-5 bg-white hover-lift transition-all">
                        <div className="bg-primary bg-opacity-10 text-primary mx-auto rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                            <i className="bi bi-person-badge-fill"></i>
                        </div>
                        <h4 className="fw-bold text-dark mb-1">Chief Warden</h4>
                        <p className="text-muted small fw-bold">Dr. A. Sharma</p>
                        <p className="small mb-0"><i className="bi bi-telephone text-primary me-2"></i>+91 98765 43210</p>
                        <p className="small"><i className="bi bi-envelope text-primary me-2"></i>warden@hostel.edu</p>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 text-center p-5 bg-white hover-lift transition-all">
                        <div className="bg-success bg-opacity-10 text-success mx-auto rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                            <i className="bi bi-building-gear"></i>
                        </div>
                        <h4 className="fw-bold text-dark mb-1">Hostel Manager</h4>
                        <p className="text-muted small fw-bold">Mr. V. Kumar</p>
                        <p className="small mb-0"><i className="bi bi-telephone text-success me-2"></i>+91 91234 56780</p>
                        <p className="small"><i className="bi bi-envelope text-success me-2"></i>manager@hostel.edu</p>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 text-center p-5 bg-white hover-lift transition-all">
                        <div className="bg-danger bg-opacity-10 text-danger mx-auto rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                            <i className="bi bi-headset"></i>
                        </div>
                        <h4 className="fw-bold text-dark mb-1">IT Desk</h4>
                        <p className="text-muted small fw-bold">Technical Support</p>
                        <p className="small mb-0"><i className="bi bi-telephone text-danger me-2"></i>+91 1800 123 456</p>
                        <p className="small"><i className="bi bi-envelope text-danger me-2"></i>support@hostel.edu</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSupport;
