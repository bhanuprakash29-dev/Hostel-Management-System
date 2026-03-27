import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HostelInfo = ({ user }) => {
    const [achievements, setAchievements] = useState([]);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const token = await user.getIdToken();
                const res = await axios.get('https://hostel-management-system-11.onrender.com/api/achievements/approved', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAchievements(res.data);
            } catch (error) {
                console.error('Error fetching approved achievements:', error);
            }
        };
        if (user) fetchAchievements();
    }, [user]);
    const facilities = [
        { title: "24/7 High Speed WiFi", desc: "Stay connected always with our enterprise-grade WiFi network coverage across all floors.", icon: "bi-wifi" },
        { title: "Modern Library", desc: "A quiet study environment with over 5,000 books and digital access to research journals.", icon: "bi-book" },
        { title: "Advanced Gym", desc: "Fully equipped fitness center with cardio and strength training equipment for health.", icon: "bi-bicycle" },
        { title: "Hygienic Mess", desc: "Nutritious and delicious meals served 4 times a day with a rotating menu.", icon: "bi-egg-fried" },
        { title: "Laundry Service", desc: "Quick and automated laundry facilities available for all students.", icon: "bi-water" },
        { title: "24/7 Security", desc: "Bio-metric access and CCTV surveillance for a safe living environment.", icon: "bi-shield-check" }
    ];

    const rules = [
        "In-time is 9:00 PM for all residents.",
        "Maintain silence in the library and study areas.",
        "Guests are only allowed in the common lobby.",
        "Proper use of gym equipment is mandatory.",
        "Wastage of food in the mess is strictly discouraged."
    ];

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <div className="row mb-5">
                <div className="col-lg-7">
                    <h2 className="display-6 fw-bold text-dark mb-4">About Our Elite Hostel</h2>
                    <p className="lead text-muted mb-4">
                        Established in 2010, our hostel provides a home away from home for over 500 students. 
                        We focus on providing a secure, comfortable, and academically stimulating environment 
                        that helps students excel in their studies while maintaining a healthy social life.
                    </p>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center mb-3">
                                <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                                    <i className="bi bi-geo-alt text-primary"></i>
                                </div>
                                <span className="fw-bold text-dark">Lakeside Campus, Block-9</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex align-items-center mb-3">
                                <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                                    <i className="bi bi-telephone text-success"></i>
                                </div>
                                <span className="fw-bold text-dark">+1 (555) 123-4567</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-5">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden h-100">
                        <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1000" className="card-img h-100 object-fit-cover opacity-75" alt="Hostel" />
                        <div className="card-img-overlay d-flex align-items-end p-4 bg-gradient-dark">
                            <h3 className="text-white fw-bold mb-0">Experience Premium Living</h3>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="fw-bold text-dark mb-4">World-Class Facilities</h3>
            <div className="row g-4 mb-5">
                {facilities.map((f, i) => (
                    <div className="col-md-4" key={i}>
                        <div className="card border-0 shadow-sm rounded-4 p-4 h-100 hover-lift">
                            <div className="d-flex align-items-center mb-3">
                                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                    <i className={`bi ${f.icon} fs-4 text-primary`}></i>
                                </div>
                                <h5 className="fw-bold mb-0 text-dark">{f.title}</h5>
                            </div>
                            <p className="text-muted small mb-0">{f.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-light h-100">
                        <h4 className="fw-bold text-dark mb-4"><i className="bi bi-journal-check me-3 text-primary"></i>Hostel Rules</h4>
                        <ul className="list-group list-group-flush bg-transparent">
                            {rules.map((rule, i) => (
                                <li className="list-group-item bg-transparent border-0 px-0 py-2 d-flex align-items-start" key={i}>
                                    <i className="bi bi-dot fs-3 text-primary me-2"></i>
                                    <span className="text-muted">{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-dark text-white h-100">
                        <h4 className="fw-bold mb-4"><i className="bi bi-clock-history me-3 text-primary"></i>Visiting Hours</h4>
                        <div className="mb-4">
                            <h6 className="fw-bold mb-1 text-primary">Weekdays</h6>
                            <p className="small opacity-75">4:00 PM - 7:00 PM</p>
                        </div>
                        <div className="mb-4">
                            <h6 className="fw-bold mb-1 text-primary">Weekends & Holidays</h6>
                            <p className="small opacity-75">10:00 AM - 7:00 PM</p>
                        </div>
                        <hr className="opacity-25" />
                        <p className="small mb-0 fst-italic">Note: All visitors must sign at the security desk and present a valid ID.</p>
                    </div>
                </div>
            </div>

            {/* Wall of Fame / Achievements */}
            {achievements.length > 0 && (
                <div className="mt-5">
                    <h3 className="fw-bold text-dark mb-4"><i className="bi bi-trophy-fill text-warning me-3"></i>Hostel Wall of Fame</h3>
                    <div className="row g-4 mb-5">
                        {achievements.map((a) => (
                            <div className="col-md-6 col-lg-4" key={a._id}>
                                <div className="card shadow-sm border-0 rounded-4 h-100 p-4 bg-white hover-lift">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle me-3">
                                            <i className="bi bi-star-fill fs-4"></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold text-dark mb-0">{a.studentName}</h5>
                                            <div className="d-flex gap-2 align-items-center">
                                                <span className="badge bg-light text-dark border mt-1 small">{a.category}</span>
                                                <small className="text-muted fw-bold mt-1">Room {a.roomNumber}</small>
                                            </div>
                                        </div>
                                    </div>
                                    <h6 className="fw-bold text-primary mb-2">{a.title}</h6>
                                    <p className="text-muted small mb-3">{a.description}</p>
                                    {a.proofUrl && (
                                        <a href={a.proofUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold mt-auto" style={{ width: 'fit-content' }}>
                                            <i className="bi bi-file-earmark-pdf me-2"></i>View Certificate
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HostelInfo;
