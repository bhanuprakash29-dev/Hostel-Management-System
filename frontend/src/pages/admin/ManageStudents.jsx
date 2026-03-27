import { useState, useEffect } from "react";
import axios from "axios";

const ManageStudents = ({ user }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, [user]);

    const fetchStudents = async () => {
        try {
            const token = await user.getIdToken();
            const res = await axios.get('https://hostel-management-system-11.onrender.com/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeallocate = async (id) => {
        if (!window.confirm("Are you sure you want to deallocate this student? This will remove their room assignment.")) return;
        setUpdating(id);
        try {
            const token = await user.getIdToken();
            await axios.put(`https://hostel-management-system-11.onrender.com/api/admin/users/${id}/deallocate`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchStudents();
        } catch (err) {
            alert("Failed to deallocate student");
        } finally {
            setUpdating(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("CRITICAL: Are you sure you want to completely DELETE this student record? This cannot be undone and will also deallocate their room.")) return;
        setUpdating(id);
        try {
            const token = await user.getIdToken();
            await axios.delete(`https://hostel-management-system-11.onrender.com/api/admin/users/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchStudents();
        } catch (err) {
            alert("Failed to delete student record");
        } finally {
            setUpdating(null);
        }
    };

    const filteredStudents = students.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-dark fw-bold mb-0">Student Ledger & Control</h2>
                <div className="d-flex gap-2">
                    <div className="input-group" style={{ maxWidth: '300px' }}>
                        <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                        <input 
                            type="text" 
                            className="form-control border-start-0 ps-0" 
                            placeholder="Find student..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr className="small text-muted text-uppercase fw-bold">
                                <th className="px-4 py-3">Identity</th>
                                <th className="py-3">Role</th>
                                <th className="py-3">Residential Location</th>
                                <th className="py-3 text-center">Payment Status</th>
                                <th className="py-3 text-center">Access Card</th>
                                <th className="py-3 text-center px-4">Ledger Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">No student records match your query.</td></tr>
                            ) : filteredStudents.map((s) => (
                                <tr key={s._id}>
                                    <td className="px-4">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                                                {s.name?.charAt(0)}
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="fw-bold text-dark">{s.name}</div>
                                                <div className="text-muted small">{s.email}</div>
                                                <button 
                                                    className="btn btn-link p-0 text-start text-primary small fw-bold text-decoration-none mt-1" 
                                                    onClick={() => setSelectedStudent(s)}
                                                    style={{ fontSize: '0.75rem' }}
                                                >
                                                    <i className="bi bi-person-lines-fill me-1"></i>View Profile
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge rounded-pill px-2 py-1 ${s.role === 'admin' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'}`}>
                                            {s.role?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        {s.roomAllocation ? (
                                            <div className="d-flex flex-column">
                                                <div className="fw-bold text-dark fs-6 d-flex align-items-center">
                                                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1 me-2" style={{ fontSize: '0.7rem' }}>
                                                        <i className="bi bi-shield-check me-1"></i>ASSIGNED
                                                    </span>
                                                    Room {s.roomAllocation}
                                                </div>
                                                <div className="text-muted small mt-1"><i className="bi bi-building me-1"></i>Hostel Residence</div>
                                            </div>
                                        ) : (
                                            <div className="d-flex align-items-center text-muted opacity-75">
                                                <span className="badge bg-light text-muted rounded-pill px-3 py-1 me-2 border" style={{ fontSize: '0.7rem' }}>PENDING</span>
                                                <span className="small">Unassigned</span>
                                            </div>
                                        )}
                                        <div className="text-muted small mt-1">{s.course} {s.year}</div>
                                    </td>
                                    <td className="text-center">
                                        <span className={`badge rounded-pill px-3 py-2 ${s.paymentStatus === 'Paid' ? 'bg-success shadow-sm' : 'bg-warning text-dark'}`}>
                                            <i className={`bi ${s.paymentStatus === 'Paid' ? 'bi-check-circle-fill' : 'bi-exclamation-circle'} me-1`}></i>
                                            {s.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        {s.accessCardIssued ? (
                                            <div className="text-success fw-bold d-flex align-items-center justify-content-center">
                                                <div className="bg-success rounded-circle me-2 animate__animated animate__pulse animate__infinite" style={{ width: '8px', height: '8px' }}></div>
                                                Issued
                                            </div>
                                        ) : (
                                            <span className="text-muted small opacity-50">Not Issued</span>
                                        )}
                                    </td>
                                    <td className="text-center px-4">
                                        <div className="d-flex gap-2 justify-content-center">
                                            {s.roomAllocation && (
                                                <button 
                                                    onClick={() => handleDeallocate(s._id)}
                                                    disabled={updating === s._id}
                                                    className="btn btn-sm btn-outline-warning rounded-pill px-3 fw-bold"
                                                    title="Remove from room only"
                                                >
                                                    {updating === s._id ? <span className="spinner-border spinner-border-sm"></span> : "Vacate Room"}
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(s._id)}
                                                disabled={updating === s._id}
                                                className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold"
                                                title="Delete student record"
                                            >
                                                {updating === s._id ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-trash"></i>}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Student Profile Detail Modal */}
            {selectedStudent && (
                <div className="modal show d-block animate__animated animate__fadeIn" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header bg-primary text-white p-4 border-0">
                                <div className="d-flex align-items-center">
                                    <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold fs-4" style={{ width: '60px', height: '60px' }}>
                                        {selectedStudent.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h5 className="modal-title fw-bold mb-0">{selectedStudent.name}</h5>
                                        <small className="opacity-75">{selectedStudent.email}</small>
                                    </div>
                                </div>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedStudent(null)}></button>
                            </div>
                            <div className="modal-body p-4 bg-light bg-opacity-50">
                                <div className="row g-4">
                                    <div className="col-6">
                                        <label className="text-muted small fw-bold text-uppercase d-block mb-1">Student ID</label>
                                        <div className="fw-bold text-dark">{selectedStudent.studentId || 'PENDING'}</div>
                                    </div>
                                    <div className="col-6">
                                        <label className="text-muted small fw-bold text-uppercase d-block mb-1">Contact Phone</label>
                                        <div className="fw-bold text-dark">{selectedStudent.phone || 'N/A'}</div>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-bold text-uppercase d-block mb-1">Residential Address</label>
                                        <div className="fw-bold text-dark">{selectedStudent.address || 'No address on file'}</div>
                                    </div>
                                    <div className="col-6">
                                        <label className="text-muted small fw-bold text-uppercase d-block mb-1">Academic Program</label>
                                        <div className="fw-bold text-dark">{selectedStudent.course || 'N/A'}</div>
                                    </div>
                                    <div className="col-6">
                                        <label className="text-muted small fw-bold text-uppercase d-block mb-1">Current Year</label>
                                        <div className="fw-bold text-dark">{selectedStudent.year || 'N/A'}</div>
                                    </div>
                                    <div className="col-6">
                                        <label className="text-muted small fw-bold text-uppercase d-block mb-1">Gender Identification</label>
                                        <div className="text-dark fw-bold">
                                            <span className={`badge rounded-pill px-3 py-1 ${selectedStudent.gender === 'Female' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'}`}>
                                                {selectedStudent.gender || 'Not Specified'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="text-muted small fw-bold text-uppercase d-block mb-1">Account Role</label>
                                        <div className="fw-bold text-dark text-uppercase">{selectedStudent.role}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 p-4 bg-white">
                                <button type="button" className="btn btn-secondary rounded-pill px-4 fw-bold" onClick={() => setSelectedStudent(null)}>Close Profile</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageStudents;
