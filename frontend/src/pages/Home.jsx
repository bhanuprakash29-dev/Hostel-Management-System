import { Link } from 'react-router-dom';

const Home = ({ user }) => {
    return (
        <div className="animate-fade-in bg-white min-vh-100">
            {/* Main Hero */}
            <header className="py-5 bg-white">
                <div className="container py-5 text-center">
                    <div className="d-inline-block px-3 py-1 rounded-pill bg-primary bg-opacity-10 text-primary small fw-800 text-uppercase mb-4" style={{ letterSpacing: '2px', fontSize: '10px' }}>
                        Premier Student Housing
                    </div>
                    <h1 className="display-4 fw-800 text-dark mb-4 lh-sm">
                        Elite <span className="text-primary">Hostel</span> Management
                    </h1>
                    <p className="lead text-secondary mb-5 mx-auto fw-500" style={{ maxWidth: '600px' }}>
                        The official all-in-one portal for local and international students. 
                        Digital room allocation, instant payments, and 24/7 resident support.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        {user ? (
                            <Link to="/dashboard" className="btn btn-primary btn-lg px-5 py-3 fw-700 shadow-sm">
                                Open Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/sign-up" className="btn btn-primary btn-lg px-5 py-3 fw-700 shadow-sm">
                                    Sign Up
                                </Link>
                                <Link to="/sign-in" className="btn btn-outline-dark btn-lg px-5 py-3 fw-700">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Feature Highlights */}
            <section className="py-5 bg-light border-top border-bottom">
                <div className="container py-5">
                    <div className="row g-4">
                        {[
                            { icon: "bi-house-check", title: "Smart Allocation", desc: "Automated room assignment system ensuring fair and quick placement across all campus blocks." },
                            { icon: "bi-credit-card-2-back", title: "Instant Payments", desc: "Integrated payment gateways for tuition and mess fees with immediate digital receipt generation." },
                            { icon: "bi-megaphone", title: "Broadcast Hub", desc: "Stay informed with real-time campus announcements and emergency notifications directly on your device." }
                        ].map((item, idx) => (
                            <div className="col-md-4" key={idx}>
                                <div className="card-decent h-100 p-4 bg-white border-0 shadow-sm transition-all">
                                    <div className="p-3 bg-primary bg-opacity-10 rounded-3 text-primary d-inline-block mb-4">
                                        <i className={`bi ${item.icon} fs-2`}></i>
                                    </div>
                                    <h4 className="fw-700 mb-3 text-dark">{item.title}</h4>
                                    <p className="text-secondary mb-0 small lh-lg fw-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Footer Placeholder */}
            <footer className="py-5 bg-white text-center">
                <div className="container">
                    <div className="fw-800 text-dark mb-3">ELITE<span className="text-primary">HOSTEL</span></div>
                    <p className="text-muted small mb-0">&copy; 2026 Campus Housing Management Authority. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
