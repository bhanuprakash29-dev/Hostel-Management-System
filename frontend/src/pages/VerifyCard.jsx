import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyCard = () => {
    const { uid } = useParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [data, setData] = useState(null);

    useEffect(() => {
        const verifyStudent = async () => {
            try {
                const res = await axios.get(`https://hostel-management-system-11.onrender.com/api/public/verify/${uid}`);
                setData(res.data);
                setStatus('success');
            } catch (err) {
                setStatus('error');
            }
        };
        verifyStudent();
    }, [uid]);

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" 
             style={{ background: 'linear-gradient(135deg, #09121c 0%, #15283c 100%)' }}>
            
            <div className="container" style={{ maxWidth: '500px' }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold text-white mb-0">Identity <span className="text-info">Verification</span></h2>
                    <p className="text-white-50">Official Hostel Security Portal</p>
                </div>

                {status === 'loading' && (
                    <div className="card border-0 shadow-lg rounded-4 p-5 text-center bg-white bg-opacity-10 backdrop-blur">
                        <div className="spinner-border text-info mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                        <h5 className="text-white mb-0">Verifying Identity...</h5>
                    </div>
                )}

                {status === 'error' && (
                    <div className="card border-0 shadow-lg rounded-4 p-5 text-center bg-white">
                        <div className="bg-danger bg-opacity-10 rounded-circle d-inline-block p-4 mb-4">
                            <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h3 className="fw-bold text-dark">Verification Failed</h3>
                        <p className="text-muted mb-4">The scanned QR code is invalid, expired, or does not exist in our systems.</p>
                        <Link to="/" className="btn btn-outline-dark rounded-pill px-4 fw-bold">Return Home</Link>
                    </div>
                )}

                {status === 'success' && data && (
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        
                        <div className={`p-4 text-center text-white ${data.status === 'Active' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            <div className="mb-2">
                                {data.status === 'Active' ? (
                                    <i className="bi bi-patch-check-fill fs-1"></i>
                                ) : (
                                    <i className="bi bi-exclamation-triangle-fill fs-1"></i>
                                )}
                            </div>
                            <h3 className="fw-bold mb-0">
                                {data.status === 'Active' ? 'AUTHORIZED' : 'PENDING'}
                            </h3>
                            <div className="small opacity-75 fw-bold text-uppercase mt-1">STATUS</div>
                        </div>

                        <div className="card-body p-4 p-md-5">
                            <div className="d-flex align-items-center mb-4 border-bottom pb-4">
                                <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3" style={{ width: '60px', height: '60px', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {data.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="fw-bold mb-0 text-dark">{data.name}</h4>
                                    <div className="text-muted"><i className="bi bi-person-badge me-1"></i>{data.studentId}</div>
                                </div>
                            </div>
                            
                            <div className="row g-3">
                                <div className="col-6">
                                    <div className="p-3 bg-light rounded-3 text-center h-100 border">
                                        <div className="small text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Allocated Room</div>
                                        <div className={`fs-5 fw-bold ${data.roomAllocation ? 'text-primary' : 'text-danger'}`}>{data.roomAllocation || 'Unassigned'}</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-3 bg-light rounded-3 text-center h-100 border">
                                        <div className="small text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Course / Year</div>
                                        <div className="fs-6 fw-bold text-dark">{data.course} {data.year && `· ${data.year}`}</div>
                                    </div>
                                </div>
                                <div className="col-12 mt-4 text-center">
                                    <div className="small text-muted fw-bold">
                                        <i className="bi bi-shield-check text-success me-1"></i>
                                        Information securely fetched from Hostel Database at {new Date().toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyCard;
