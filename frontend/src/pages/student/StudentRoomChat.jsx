import { useState, useEffect, useRef } from "react";
import axios from "axios";

const StudentRoomChat = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [roomNumber, setRoomNumber] = useState(null);
    const [roommates, setRoommates] = useState([]);
    const scrollRef = useRef();

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                const token = await user.getIdToken();
                // Get user's own room allocation
                const userRes = await axios.post('/api/users', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const myRoom = userRes.data.user.roomAllocation;
                setRoomNumber(myRoom);

                if (myRoom) {
                    // Fetch roommates
                    const roommatesRes = await axios.get('/api/rooms/my', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setRoommates(roommatesRes.data.room?.allocatedStudents || []);
                    
                    // Fetch initial messages
                    const chatRes = await axios.get(`/api/chats/${myRoom}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setMessages(chatRes.data);
                }
            } catch (err) {
                console.error("Error fetching chat data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRoomDetails();
        const interval = setInterval(() => {
            if (roomNumber) {
                fetchMessages();
            }
        }, 5000); // Poll messages every 5s

        return () => clearInterval(interval);
    }, [user, roomNumber]);

    const fetchMessages = async () => {
        try {
            const token = await user.getIdToken();
            const res = await axios.get(`/api/chats/${roomNumber}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Only update if new messages arrived to avoid UI flicker
            if (res.data.length !== messages.length) {
                setMessages(res.data);
            }
        } catch (err) {
            console.error("Polling failed", err);
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const token = await user.getIdToken();
            const res = await axios.post(`/api/chats/${roomNumber}`, {
                content: newMessage
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessages([...messages, res.data]);
            setNewMessage("");
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    if (!roomNumber) {
        return (
            <div className="container py-5 text-center">
                <div className="card border-0 shadow-sm rounded-4 p-5">
                    <i className="bi bi-chat-dots fs-1 text-muted mb-3"></i>
                    <h3 className="fw-bold">No Room Assigned</h3>
                    <p className="text-muted">Chatting is only available once you have been assigned a room by the administration.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <div className="row g-4" style={{ height: 'calc(100vh - 150px)' }}>
                {/* Chat Section */}
                <div className="col-lg-9 h-100 d-flex flex-column">
                    <div className="card border-0 shadow-sm rounded-4 flex-grow-1 overflow-hidden d-flex flex-column">
                        <div className="card-header bg-white border-bottom p-3 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                                    <i className="bi bi-chat-right-text-fill text-primary fs-4"></i>
                                </div>
                                <div>
                                    <h5 className="mb-0 fw-bold">Room #{roomNumber} Chat</h5>
                                    <small className="text-muted">Connect with your roommates</small>
                                </div>
                            </div>
                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2">
                                <i className="bi bi-circle-fill small me-2" style={{ fontSize: '0.5rem' }}></i> Active Group
                            </span>
                        </div>

                        <div className="card-body p-4 overflow-auto bg-light" style={{ flex: 1 }}>
                            {messages.length === 0 ? (
                                <div className="text-center py-5 opacity-50">
                                    <i className="bi bi-chat-quote fs-1 mb-2 d-block"></i>
                                    <p>Start the conversation! Say hello to your roommates.</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user.uid || msg.senderName === (user.displayName || user.email);
                                    // Note: In real setup we'd compare MongoDB IDs if synced, but string check works for simple cases
                                    return (
                                        <div key={idx} className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'} mb-3`}>
                                            <div className="d-flex flex-column" style={{ maxWidth: '75%' }}>
                                                {!isMe && <small className="fw-bold mb-1 ms-2 text-muted">{msg.senderName}</small>}
                                                <div className={`p-3 rounded-4 shadow-sm ${isMe ? 'bg-primary text-white rounded-te-0' : 'bg-white text-dark rounded-ts-0'}`}>
                                                    <p className="mb-0">{msg.content}</p>
                                                </div>
                                                <small className={`mt-1 opacity-50 px-2 ${isMe ? 'text-end' : ''}`} style={{ fontSize: '0.65rem' }}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </small>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={scrollRef} />
                        </div>

                        <div className="card-footer bg-white border-0 p-3">
                            <form onSubmit={sendMessage} className="d-flex gap-2 p-1 bg-light rounded-pill shadow-sm border">
                                <input 
                                    type="text" 
                                    className="form-control border-0 bg-transparent px-3 py-2 shadow-none" 
                                    placeholder="Type your message here..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <i className="bi bi-send-fill"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="col-lg-3 h-100">
                    <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                        <div className="card-header bg-white border-bottom p-3 fw-bold">
                            <i className="bi bi-people me-2"></i> Roommates
                        </div>
                        <div className="card-body p-3 overflow-auto">
                            {roommates.map((r, i) => (
                                <div key={i} className="d-flex align-items-center gap-3 p-3 mb-2 rounded-3 bg-light hover-lift">
                                    <div className="bg-white border rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '40px', height: '40px' }}>
                                        {r.name?.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="fw-bold small text-truncate">{r.name}</div>
                                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>{r.course}</div>
                                    </div>
                                </div>
                            ))}
                            
                            <hr className="my-4 opacity-10" />
                            
                            <div className="p-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-3">
                                <h6 className="fw-bold text-dark small mb-2"><i className="bi bi-shield-lock-fill me-2"></i>Privacy Note</h6>
                                <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                                    This chat is strictly private for residents of Room #{roomNumber}. Please maintain decorum and respect.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentRoomChat;
