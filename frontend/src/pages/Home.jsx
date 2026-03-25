import { Link } from 'react-router-dom';

const Home = ({ user }) => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <div className="hero-section min-vh-100 d-flex align-items-center position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
                {/* Abstract Background Shapes */}
                <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ opacity: 0.1 }}>
                    <div className="position-absolute rounded-circle bg-white" style={{ width: '600px', height: '600px', top: '-20%', left: '-10%', filter: 'blur(80px)' }}></div>
                    <div className="position-absolute rounded-circle bg-white" style={{ width: '500px', height: '500px', bottom: '-20%', right: '-10%', filter: 'blur(60px)' }}></div>
                </div>

                <div className="container position-relative z-index-1">
                    <div className="row align-items-center">
                        <div className="col-lg-7 text-white animate__animated animate__fadeInLeft">
                            <span className="badge bg-white text-primary rounded-pill px-3 py-2 fw-bold mb-4 shadow-sm" style={{ letterSpacing: '2px' }}>
                                MODERN HOSTEL LIVING
                            </span>
                            <h1 className="display-3 fw-bolder mb-4 lh-base">
                                Experience <span className="text-warning">Comfort</span> <br/>
                                Like Never Before.
                            </h1>
                            <p className="lead mb-5 opacity-75 fw-light" style={{ maxWidth: '600px' }}>
                                Smart room assignments, digital access cards, and premium mess menus. Welcome to the next generation of student living.
                            </p>
                            
                            <div className="d-flex flex-wrap gap-3">
                                {user ? (
                                    <Link to="/dashboard" className="btn btn-warning btn-lg rounded-pill px-5 py-3 fw-bold text-dark shadow-lg hover-lift">
                                        Go to Dashboard <i className="bi bi-arrow-right ms-2"></i>
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/sign-in" className="btn btn-warning btn-lg rounded-pill px-5 py-3 fw-bold text-dark shadow-lg hover-lift">
                                            Sign In
                                        </Link>
                                        <Link to="/sign-up" className="btn btn-outline-light btn-lg rounded-pill px-5 py-3 fw-bold hover-lift text-white border-2">
                                            Create Account
                                        </Link>
                                    </>
                                )}
                            </div>
                            
                            <div className="mt-5 d-flex align-items-center gap-4 opacity-75">
                                <div className="d-flex align-items-center"><i className="bi bi-check-circle-fill text-warning me-2"></i> 24/7 Security</div>
                                <div className="d-flex align-items-center"><i className="bi bi-check-circle-fill text-warning me-2"></i> Smart Access</div>
                                <div className="d-flex align-items-center"><i className="bi bi-check-circle-fill text-warning me-2"></i> Premium Food</div>
                            </div>
                        </div>
                        
                        <div className="col-lg-5 d-none d-lg-block animate__animated animate__fadeInRight">
                            <div className="position-relative">
                                {/* Decorative elements */}
                                <div className="position-absolute bg-warning rounded-circle" style={{ width: '100px', height: '100px', top: '-30px', right: '-20px', zIndex: 0 }}></div>
                                <div className="position-absolute border border-white border-3 rounded-4" style={{ width: '100%', height: '100%', top: '30px', left: '-30px', zIndex: 0, opacity: 0.2 }}></div>
                                
                                <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                     alt="Hostel Room" 
                                     className="img-fluid rounded-4 shadow-lg position-relative" 
                                     style={{ zIndex: 1, objectFit: 'cover', height: '600px', width: '100%' }} />
                                     
                                {/* Floating Card */}
                                <div className="position-absolute bg-white rounded-4 shadow-lg p-4 d-flex align-items-center gap-3" style={{ bottom: '-30px', left: '-50px', zIndex: 2 }}>
                                    <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                                        <i className="bi bi-door-open-fill fs-3 text-success"></i>
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-1 text-dark">500+ Rooms</h6>
                                        <small className="text-muted">Available Now</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Features Section */}
            <div className="py-5 bg-white">
                <div className="container py-5">
                    <div className="text-center mb-5 animate__animated animate__fadeInUp">
                        <span className="text-primary fw-bold text-uppercase" style={{ letterSpacing: '2px' }}>Features</span>
                        <h2 className="display-6 fw-bold text-dark mt-2 mb-3">Everything You Need</h2>
                        <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>Our hostel management system provides end-to-end solutions for a seamless stay.</p>
                    </div>
                    
                    <div className="row g-4">
                        {[
                            { icon: "bi-phone", title: "Smart Booking", desc: "Select your preferred block and room type directly from your device." },
                            { icon: "bi-credit-card-2-front", title: "Digital Access Cards", desc: "No more physical keys. Use your digital access card for entry." },
                            { icon: "bi-cup-hot", title: "Premium Mess", desc: "View the daily menu and enjoy authentic South Indian cuisine." }
                        ].map((feature, idx) => (
                            <div className="col-md-4 animate__animated animate__fadeInUp" style={{ animationDelay: `${idx * 0.1}s` }} key={idx}>
                                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-lift text-center">
                                    <div className="bg-primary bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                                        <i className={`bi ${feature.icon} fs-1 text-primary`}></i>
                                    </div>
                                    <h4 className="fw-bold mb-3">{feature.title}</h4>
                                    <p className="text-muted mb-0">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
