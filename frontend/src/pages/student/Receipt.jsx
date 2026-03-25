import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Receipt = ({ user }) => {
    const navigate = useNavigate();
    const [serverUser, setServerUser] = useState(null);
    const receiptId = "HMS-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await user.getIdToken();
                const res = await axios.post('http://localhost:5000/api/users', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setServerUser(res.data.user);
            } catch (err) {
                console.error("Error fetching user data for receipt", err);
            }
        };
        fetchUserData();
    }, [user]);

    const regDate = serverUser?.registrationDate ? new Date(serverUser.registrationDate).toLocaleDateString() : new Date().toLocaleDateString();

    return (
        <div className="container py-5 animate__animated animate__zoomIn">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
                        <div className="p-4 bg-success text-white text-center">
                            <i className="bi bi-check-circle-fill fs-1 mb-2 d-block"></i>
                            <h4 className="fw-bold mb-0">Payment Successful!</h4>
                        </div>
                        <div className="card-body p-5">
                            <div className="text-center mb-5">
                                <h6 className="text-uppercase text-muted small fw-bold">Official Receipt</h6>
                                <h3 className="fw-bold text-dark">Elite Hostel Management</h3>
                            </div>

                            <div className="row g-3 mb-5 py-3 border-top border-bottom">
                                <div className="col-6">
                                    <small className="text-muted d-block">Receipt ID:</small>
                                    <span className="fw-bold">{receiptId}</span>
                                </div>
                                <div className="col-6 text-end">
                                    <small className="text-muted d-block">Registration Date:</small>
                                    <span className="fw-bold">{regDate}</span>
                                </div>
                                <div className="col-6">
                                    <small className="text-muted d-block">Student Name:</small>
                                    <span className="fw-bold">{user.displayName || 'Student'}</span>
                                </div>
                                <div className="col-6 text-end">
                                    <small className="text-muted d-block">Status:</small>
                                    <span className="badge bg-success">PAID</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Accommodation Fee (1 Year)</span>
                                    <span className="fw-bold">₹ 1,50,000.00</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Security Deposit</span>
                                    <span className="fw-bold">₹ 10,000.00</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Processing Fee</span>
                                    <span className="fw-bold">₹ 5,000.00</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between">
                                    <h5 className="fw-bold">Total Paid</h5>
                                    <h5 className="fw-bold text-primary">₹ 1,65,000.00</h5>
                                </div>
                            </div>

                            <div className="text-center mt-5">
                                <button className="btn btn-outline-primary rounded-pill me-3 px-4" onClick={() => window.print()}>
                                    <i className="bi bi-printer me-2"></i>Print Receipt
                                </button>
                                <button className="btn btn-primary rounded-pill px-4" onClick={() => navigate('/student/dashboard')}>
                                    Return Home
                                </button>
                            </div>
                        </div>
                        <div className="card-footer bg-light border-0 text-center py-3">
                            <small className="text-muted">This is an electronically generated receipt. No signature required.</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Receipt;
