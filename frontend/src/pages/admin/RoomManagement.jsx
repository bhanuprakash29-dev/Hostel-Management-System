import { useState, useEffect } from "react";
import axios from "axios";

const RoomManagement = ({ user }) => {
    const [rooms, setRooms] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [issuingCard, setIssuingCard] = useState(null);
    const [newRoom, setNewRoom] = useState({
        roomNumber: "",
        block: "Block A",
        type: "Single Non-AC",
        price: 100000,
        capacity: 1,
        availableSeats: 1,
        features: ["WiFi"]
    });

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const token = await user.getIdToken();
            const [roomsRes, appsRes] = await Promise.all([
                axios.get('https://hostel-management-system-11.onrender.com/api/admin/rooms', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get('https://hostel-management-system-11.onrender.com/api/admin/bookings/all', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);
            setRooms(roomsRes.data);
            setApplications(appsRes.data);
        } catch (err) {
            console.error("Error fetching data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleIssueCard = async (userId, roomNumber) => {
        if (!roomNumber) return alert('Room number is required');
        setIssuingCard(userId);
        try {
            const token = await user.getIdToken();
            await axios.put(`https://hostel-management-system-11.onrender.com/api/admin/issue-access-card/${userId}`, { roomNumber }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert("Failed to issue card");
        } finally {
            setIssuingCard(null);
        }
    };

    const handleTypeChange = (value) => {
        let cap = 1;
        let prc = 100000;
        if (value.includes('Double')) cap = 2;
        if (value === 'Single AC') prc = 150000;
        if (value === 'Double AC') prc = 120000;
        if (value === 'Single Non-AC') prc = 100000;
        if (value === 'Double Non-AC') prc = 85000;
        if (value === 'Luxurious Suite') { prc = 250000; cap = 1; }
        setNewRoom({ ...newRoom, type: value, capacity: cap, availableSeats: cap, price: prc });
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            const token = await user.getIdToken();
            await axios.post('https://hostel-management-system-11.onrender.com/api/admin/rooms', newRoom, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setShowAddModal(false);
            fetchData();
            setNewRoom({ roomNumber: "", block: "Block A", type: "Single Non-AC", price: 100000, capacity: 1, availableSeats: 1, features: ["WiFi"] });
        } catch (err) {
            alert("Failed to add room");
        }
    };

    // Students who paid and haven't been issued a card yet
    const pendingCards = applications.filter(app =>
        app.paymentStatus === 'Paid' && !app.userId?.accessCardIssued
    );

    const handleAddBed = async (roomId) => {
        try {
            const token = await user.getIdToken();
            const res = await axios.put(`https://hostel-management-system-11.onrender.com/api/admin/rooms/${roomId}/add-bed`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Update local state for immediate feedback
            setRooms(rooms.map(r => r._id === roomId ? res.data.room : r));
        } catch (err) {
            alert("Failed to add bed to room");
        }
    };

    const handleRemoveBed = async (roomId) => {
        try {
            const token = await user.getIdToken();
            const res = await axios.put(`https://hostel-management-system-11.onrender.com/api/admin/rooms/${roomId}/remove-bed`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setRooms(rooms.map(r => r._id === roomId ? res.data.room : r));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to remove bed");
        }
    };

    // Group rooms by block for grid view
    const groupedRooms = rooms.reduce((acc, room) => {
        if (!acc[room.block]) acc[room.block] = [];
        acc[room.block].push(room);
        return acc;
    }, {});
    const sortedBlocks = Object.keys(groupedRooms).sort();

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-dark fw-bold mb-0">Room & Access Management</h2>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary px-4 rounded-pill fw-bold hover-lift">
                    <i className="bi bi-plus-lg me-2"></i>Add New Room
                </button>
            </div>

            {/* Add Room Modal */}
            {showAddModal && (
                <div className="modal show d-block animate__animated animate__fadeIn" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header border-0 p-4 pb-0">
                                <h5 className="fw-bold mb-0">
                                    <i className="bi bi-door-open me-2 text-primary"></i>Add Hostel Room
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={handleAddRoom}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">Room Number</label>
                                            <input type="text" className="form-control rounded-3" value={newRoom.roomNumber} onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">Block</label>
                                            <select className="form-select rounded-3" value={newRoom.block} onChange={(e) => setNewRoom({ ...newRoom, block: e.target.value })}>
                                                <option value="Block A">Block A</option>
                                                <option value="Block B">Block B</option>
                                                <option value="Block C">Block C</option>
                                            </select>
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label small fw-bold text-muted">Room Category</label>
                                            <select className="form-select rounded-3" value={newRoom.type} onChange={(e) => handleTypeChange(e.target.value)}>
                                                <option value="Single AC">Single AC</option>
                                                <option value="Double AC">Double AC</option>
                                                <option value="Single Non-AC">Single Non-AC</option>
                                                <option value="Double Non-AC">Double Non-AC</option>
                                                <option value="Luxurious Suite">Luxurious Suite</option>
                                            </select>
                                        </div>
                                        <div className="col-12 mt-4 d-flex gap-2">
                                            <button type="submit" className="btn btn-primary flex-grow-1 rounded-pill fw-bold">Create Room</button>
                                            <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-light rounded-pill fw-bold">Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Room Inventory Grid */}
            <div className="mb-5">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h5 className="fw-bold mb-0 d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-diagram-3-fill"></i>
                        </div>
                        Room Allocation Grid
                    </h5>
                </div>
                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : sortedBlocks.length === 0 ? (
                    <div className="alert bg-white border-0 shadow-sm rounded-4 text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-1 d-block mb-3 opacity-50"></i>
                        <h5 className="fw-bold">No Rooms Created</h5>
                        <p className="mb-0">Start by adding new rooms to manage allocations.</p>
                    </div>
                ) : (
                    sortedBlocks.map(block => (
                        <div key={block} className="mb-5 bg-white p-4 rounded-4 shadow-sm">
                            <h5 className="fw-bold mb-4 border-bottom pb-3 d-flex align-items-center">
                                <i className="bi bi-building-check me-2 text-primary"></i>{block}
                            </h5>
                            <div className="row g-4">
                                {groupedRooms[block].map(room => (
                                    <div className="col-md-6 col-lg-4" key={room._id}>
                                        <div className={`card h-100 border-1 shadow-sm rounded-4 transition-all hover-lift ${room.availableSeats === 0 ? 'border-danger border-opacity-25' : 'border-primary border-opacity-10'}`}>
                                            <div className={`card-header border-0 py-3 d-flex justify-content-between align-items-center rounded-top-4 ${room.availableSeats === 0 ? 'bg-danger bg-opacity-10' : 'bg-primary bg-opacity-10'}`}>
                                                <div className="d-flex align-items-center gap-2">
                                                    <h5 className={`mb-0 fw-bold ${room.availableSeats === 0 ? 'text-danger' : 'text-primary'}`}>
                                                        {room.roomNumber}
                                                    </h5>
                                                    <span className={`badge rounded-pill fw-bold ${room.availableSeats === 0 ? 'bg-danger' : 'bg-primary'}`}>
                                                        {room.type.split(' ')[0]}
                                                    </span>
                                                </div>
                                                <div className="d-flex gap-1">
                                                    <button 
                                                        onClick={() => handleRemoveBed(room._id)} 
                                                        className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center btn-outline-danger`}
                                                        title="Remove Empty Bed"
                                                        disabled={room.availableSeats === 0 || room.capacity === room.allocatedStudents.length}
                                                        style={{ width: '30px', height: '30px' }}
                                                    >
                                                        <i className="bi bi-dash-lg"></i>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAddBed(room._id)} 
                                                        className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center ${room.availableSeats === 0 ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                                                        title="Add Extra Bed"
                                                        style={{ width: '30px', height: '30px' }}
                                                    >
                                                        <i className="bi bi-plus-lg"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="card-body p-0">
                                                <div className="d-flex bg-light bg-opacity-50 p-2 border-bottom">
                                                    <div className="flex-fill text-center px-2 border-end">
                                                        <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.65rem', fontWeight: 600 }}>Capacity</small>
                                                        <div className="fw-bold text-dark">{room.capacity} Beds</div>
                                                    </div>
                                                    <div className="flex-fill text-center px-2">
                                                        <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.65rem', fontWeight: 600 }}>Available</small>
                                                        <div className={`fw-bold ${room.availableSeats > 0 ? 'text-success' : 'text-danger'}`}>{room.availableSeats} Left</div>
                                                    </div>
                                                </div>
                                                
                                                {/* Beds Listing */}
                                                <ul className="list-group list-group-flush border-0">
                                                    {[...Array(room.capacity)].map((_, index) => {
                                                        const student = room.allocatedStudents?.[index];
                                                        return (
                                                            <li className="list-group-item d-flex align-items-center p-3 border-bottom-0" key={index}>
                                                                <div className={`rounded-circle p-2 me-3 d-flex align-items-center justify-content-center border ${student ? 'bg-success bg-opacity-10 text-success border-success border-opacity-25' : 'bg-light text-secondary border-light'}`} style={{ width: '40px', height: '40px' }}>
                                                                    <i className={`bi ${student ? 'bi-person-badge-fill' : 'bi-person'} fs-5`}></i>
                                                                </div>
                                                                <div className="flex-grow-1 overflow-hidden">
                                                                    <div className="fw-bold fs-6 text-truncate mb-0">
                                                                        Bed {index + 1}
                                                                    </div>
                                                                    {student ? (
                                                                        <div className="mt-1">
                                                                            <div className="small fw-semibold text-dark text-truncate mb-1">{student.name} ({student.studentId || 'N/A'})</div>
                                                                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                                                <i className="bi bi-telephone me-1"></i>{student.phone || 'N/A'}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="small text-muted fst-italic mt-1"><i className="bi bi-circle me-1 border bg-light rounded-circle" style={{fontSize: '0.4rem', verticalAlign: 'middle'}}></i> Unassigned</div>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pending Access Cards — Premium Card Layout */}
            <div className="mb-4 d-flex align-items-center justify-content-between">
                <div>
                    <h4 className="fw-bold mb-1">
                        <i className="bi bi-credit-card-2-front me-2 text-primary"></i>Pending Access Cards
                    </h4>
                    <p className="text-muted small mb-0">
                        Students who completed payment and are awaiting their digital hostel card. Room number is auto-filled from the student's application.
                    </p>
                </div>
                {pendingCards.length > 0 && (
                    <span className="badge bg-warning text-dark rounded-pill px-3 py-2 fw-bold fs-6">
                        {pendingCards.length} Pending
                    </span>
                )}
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : pendingCards.length === 0 ? (
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                    <div className="bg-success bg-opacity-10 p-4 rounded-circle d-inline-block mx-auto mb-3">
                        <i className="bi bi-check2-all fs-1 text-success"></i>
                    </div>
                    <h5 className="fw-bold">All Clear!</h5>
                    <p className="text-muted mb-0">All paid students have been issued their access cards.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {pendingCards.map((app) => (
                        <div className="col-md-6 col-xl-4" key={app._id}>
                            <div className="card border-0 shadow-lg rounded-4 overflow-hidden h-100"
                                style={{ background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' }}>

                                {/* Card Top — Preview */}
                                <div className="card-body p-4 text-white">

                                    {/* Header row */}
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div>
                                            <div className="text-uppercase small fw-bold mb-1" style={{ opacity: 0.5, letterSpacing: '0.1em' }}>
                                                Elite Hostel · Digital Card
                                            </div>
                                            <span className="badge bg-warning text-dark rounded-pill px-3 py-1 small fw-bold">
                                                <i className="bi bi-hourglass-split me-1"></i>Awaiting Issue
                                            </span>
                                        </div>
                                        <div className="bg-white rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ opacity: 0.15, width: '44px', height: '44px' }}>
                                            <i className="bi bi-cpu fs-4 text-white" style={{ opacity: 1 }}></i>
                                        </div>
                                    </div>

                                    {/* Student avatar + info */}
                                    <div className="d-flex align-items-center gap-3 mb-4">
                                        <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 fw-bold fs-4"
                                            style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
                                            {app.studentName?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="fw-bold fs-6">{app.studentName}</div>
                                            <div className="small" style={{ opacity: 0.6 }}>Roll: {app.studentId || '—'}</div>
                                            <div className="small" style={{ opacity: 0.6 }}>{app.course}{app.year ? ` · ${app.year}` : ''}</div>
                                        </div>
                                    </div>

                                    {/* Room info chips */}
                                    <div className="row g-2 mb-4">
                                        {[
                                            { label: 'Room No.', value: app.roomNumber || '—' },
                                            { label: 'Block', value: app.hostelPreference || '—' },
                                            { label: 'Type', value: app.roomType?.split(' ').slice(0, 2).join(' ') || '—' }
                                        ].map(({ label, value }) => (
                                            <div className="col-4" key={label}>
                                                <div className="text-center rounded-3 py-2 px-1"
                                                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                    <div className="small mb-1" style={{ opacity: 0.5, fontSize: '0.68rem' }}>{label}</div>
                                                    <div className="fw-bold" style={{ fontSize: '0.8rem' }}>{value}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Payment verified strip */}
                                    <div className="d-flex align-items-center gap-2 rounded-3 px-3 py-2"
                                        style={{ background: 'rgba(40,200,100,0.15)', border: '1px solid rgba(40,200,100,0.3)' }}>
                                        <i className="bi bi-patch-check-fill text-success"></i>
                                        <span className="small fw-bold">Payment Verified</span>
                                        <span className="ms-auto small fw-bold text-success">₹ {app.amount?.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Card Footer — Action */}
                                <div className="bg-white p-3 border-0">
                                    <label className="form-label small fw-bold text-muted mb-1">
                                        <i className="bi bi-key-fill me-1 text-primary"></i>
                                        Assign Room Number
                                        <span className="ms-2 badge bg-info-subtle text-info rounded-pill px-2" style={{ fontSize: '0.65rem' }}>
                                            Auto-filled from application
                                        </span>
                                    </label>
                                    <div className="input-group shadow-sm">
                                        <span className="input-group-text bg-white border-end-0">
                                            <i className="bi bi-door-open text-primary"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control border-start-0 fw-bold ps-1"
                                            defaultValue={app.roomNumber || ''}
                                            id={`room-input-${app._id}`}
                                            placeholder="e.g. A-101"
                                        />
                                        <button
                                            className="btn btn-primary px-3 fw-bold"
                                            disabled={issuingCard === app.userId?._id}
                                            onClick={() => {
                                                const val = document.getElementById(`room-input-${app._id}`).value;
                                                handleIssueCard(app.userId?._id, val);
                                            }}
                                        >
                                            {issuingCard === app.userId?._id ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                <><i className="bi bi-send-check me-1"></i>Issue Card</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoomManagement;
