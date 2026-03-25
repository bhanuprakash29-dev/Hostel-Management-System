import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BookingRooms = ({ user }) => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterBlock, setFilterBlock] = useState("All");
    const [filterType, setFilterType] = useState("All");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const token = await user.getIdToken();
                const res = await axios.get('/api/rooms/available', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setRooms(res.data);
            } catch (err) {
                console.error("Error fetching rooms", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, [user]);

    const filteredRooms = rooms.filter(room => {
        const matchBlock = filterBlock === "All" || room.block === filterBlock;
        const matchType = filterType === "All" || room.type.includes(filterType);
        return matchBlock && matchType;
    });

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const getRoomStyles = (type) => {
        if (type.includes('Suite')) return { bg: '#198754', text: '#ffffff', border: '#198754' }; // Green
        if (type.includes('AC')) return { bg: '#6c757d', text: '#ffffff', border: '#6c757d' }; // Grey
        return { bg: '#fff0f5', text: '#d63384', border: '#ffc1e3' }; // Pinkish White
    };

    const getRoomDescription = (type) => {
        if (type.includes('Suite')) return 'Premium living with exclusive lounge area, private balcony, and superior interior design.';
        if (type.includes('Single AC')) return 'Private air-conditioned sanctuary designed for focus and complete comfort.';
        if (type.includes('Double AC')) return 'Spacious shared AC living with optimized space for collaborative learning and rest.';
        if (type.includes('Non-AC')) return 'Budget-friendly, well-ventilated essential living space for productive student life.';
        return 'Comfortable student accommodation with all basic amenities provided.';
    };

    const handleViewDetails = (room) => {
        setSelectedRoom(room);
        setShowModal(true);
    };

    const handleRequestBooking = (room) => {
        navigate('/student/booking', { 
            state: { 
                selectedRoom: room.roomNumber,
                selectedType: room.type,
                selectedPrice: room.price,
                selectedBlock: room.block
            } 
        });
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-dark fw-bold mb-0">Explore Available Rooms</h2>
                <div className="d-flex gap-2">
                    <select className="form-select rounded-pill shadow-sm" style={{ minWidth: '150px' }} value={filterBlock} onChange={(e) => setFilterBlock(e.target.value)}>
                        <option value="All">All Blocks</option>
                        <option value="Block A">Block A</option>
                        <option value="Block B">Block B</option>
                        <option value="Block C">Block C</option>
                    </select>
                    <select className="form-select rounded-pill shadow-sm" style={{ minWidth: '150px' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="All">All Types</option>
                        <option value="AC">AC Rooms</option>
                        <option value="Non-AC">Non-AC Rooms</option>
                        <option value="Suite">Suites</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : filteredRooms.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4 border">
                    <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
                    <p className="text-muted fw-bold">No rooms found matching your filters.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {filteredRooms.map((room) => {
                        const styles = getRoomStyles(room.type);
                        return (
                            <div className="col-md-6 col-lg-4" key={room._id}>
                                <div className="card border-0 shadow-sm rounded-4 h-100 room-card overflow-hidden border-top border-4" style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease', borderTopColor: styles.border + ' !important' }}>
                                    <div className="card-header py-3 text-center border-0 d-flex justify-content-between align-items-center px-4" style={{ backgroundColor: styles.bg, color: styles.text }}>
                                        <span className="badge bg-white bg-opacity-20 text-white rounded-pill px-3" style={{ border: '1px solid rgba(255,255,255,0.3)' }}>{room.block}</span>
                                        <h5 className="mb-0 fw-bold">{room.type}</h5>
                                    </div>
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h4 className="fw-bold text-dark mb-0">Room {room.roomNumber}</h4>
                                            <div className={`mt-1 fw-bold ${room.allocatedStudents?.length > 0 ? (room.allocatedStudents[0].gender === 'Male' ? 'text-primary' : 'text-danger') : 'text-success'}`} style={{ fontSize: '0.8rem' }}>
                                                <i className="bi bi-person-fill me-1"></i>
                                                {room.allocatedStudents?.length > 0 ? `${room.allocatedStudents[0].gender} Occupied` : 'Vacant'}
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <h5 className="text-primary fw-bold mb-0">₹ {room.price?.toLocaleString()}</h5>
                                            <small className="text-muted">per year</small>
                                        </div>
                                    </div>

                                    <p className="text-muted small mb-3 line-clamp-2" style={{ height: '2.5rem', overflow: 'hidden' }}>
                                        {getRoomDescription(room.type)}
                                    </p>

                                    <div className="row g-2 mb-4">
                                        <div className="col-6">
                                            <div className="p-2 border rounded-3 bg-light text-center h-100">
                                                <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>Capacity</small>
                                                <span className="fw-bold">{room.capacity} Seats</span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="p-2 border rounded-3 bg-light text-center h-100">
                                                <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>Available</small>
                                                <span className="fw-bold text-success">{room.availableSeats} Left</span>
                                            </div>
                                        </div>
                                    </div>

                                        <button 
                                            onClick={() => handleViewDetails(room)}
                                            className="btn btn-light border w-100 py-2 rounded-pill fw-bold text-dark mb-2"
                                        >
                                            View Details
                                        </button>
                                        <button 
                                            onClick={() => handleRequestBooking(room)}
                                            className="btn w-100 py-2 rounded-pill fw-bold shadow-sm text-white"
                                            style={{ backgroundColor: styles.bg === '#fff0f5' ? '#d63384' : styles.bg }}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedRoom && (
                <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header border-0 p-4" style={{ backgroundColor: getRoomStyles(selectedRoom.type).bg, color: getRoomStyles(selectedRoom.type).text }}>
                                <div>
                                    <h4 className="modal-title fw-bold">Room {selectedRoom.roomNumber} - {selectedRoom.type}</h4>
                                    <p className="mb-0 opacity-75">{selectedRoom.block} &bull; {selectedRoom.capacity} Seater {selectedRoom.type.includes('Suite') ? 'Luxury' : 'Economy'}</p>
                                </div>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="lead fs-6 text-muted mb-4 fst-italic">
                                    "{getRoomDescription(selectedRoom.type)}"
                                </p>
                                <div className="row g-4">
                                    <div className="col-md-7">
                                        <div className="mb-4">
                                            <h6 className="fw-bold text-uppercase small text-muted mb-3"><i className="bi bi-info-circle me-2"></i>Room Specifications</h6>
                                            <div className="row g-3">
                                                <div className="col-6">
                                                    <div className="p-3 bg-light rounded-3">
                                                        <div className="text-muted small">Standard Price</div>
                                                        <div className="fw-bold fs-5 text-primary">₹ {selectedRoom.price?.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="p-3 bg-light rounded-3">
                                                        <div className="text-muted small">Available Seats</div>
                                                        <div className="fw-bold fs-5 text-success">{selectedRoom.availableSeats} / {selectedRoom.capacity}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h6 className="fw-bold text-uppercase small text-muted mb-3"><i className="bi bi-star-fill me-2 text-warning"></i>Key Features</h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                {selectedRoom.features.map((f, i) => (
                                                    <span key={i} className="badge bg-white text-dark border p-2 px-3 rounded-pill fw-normal shadow-sm">
                                                        <i className="bi bi-check2-circle text-success me-2"></i>{f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-3 bg-info bg-opacity-10 border border-info border-opacity-25 rounded-3">
                                            <div className="fw-bold text-info mb-1 small uppercase font-monospace">Hostel Policy</div>
                                            <p className="small text-dark mb-0 opacity-75">
                                                Electricity and Water charges are included. Damage to any furniture will be charged to the residents. No outside guests allowed after 10 PM.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-md-5">
                                        <div className="card border-0 bg-light rounded-4 p-3 h-100">
                                            <h6 className="fw-bold text-uppercase small text-muted mb-3"><i className="bi bi-people-fill me-2 text-primary"></i>Current Roommates</h6>
                                            {selectedRoom.allocatedStudents?.length > 0 ? (
                                                <div className="d-flex flex-column gap-3">
                                                    {selectedRoom.allocatedStudents.map((s, idx) => (
                                                        <div key={idx} className="bg-white p-3 rounded-3 shadow-sm border border-opacity-10 scale-hover">
                                                            <div className="d-flex align-items-center gap-3 mb-2">
                                                                <div className="bg-primary text-white text-center rounded-circle fw-bold shadow-sm" style={{ width: '40px', height: '40px', lineHeight: '38px', fontSize: '1.2rem' }}>
                                                                    {s.name?.charAt(0)}
                                                                </div>
                                                                <div className="text-dark overflow-hidden">
                                                                    <div className="fw-bold text-truncate">{s.name}</div>
                                                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{s.course}</div>
                                                                </div>
                                                            </div>
                                                            <div className="pt-2 border-top d-flex justify-content-between align-items-center">
                                                                <span className="text-primary small fw-bold">
                                                                    <i className="bi bi-telephone me-1"></i> {s.phone || 'N/A'}
                                                                </span>
                                                                <span className="badge bg-light text-dark small">{s.gender}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-5 opacity-50">
                                                    <i className="bi bi-door-open fs-1 mb-2 d-block"></i>
                                                    <p className="small mb-0">Total Privacy.<br/>Room is vacant.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 p-4 pt-0">
                                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>Close</button>
                                <button 
                                    className="btn btn-primary rounded-pill px-5 fw-bold shadow"
                                    onClick={() => {
                                        setShowModal(false);
                                        handleRequestBooking(selectedRoom);
                                    }}
                                >
                                    Proceed to Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingRooms;
