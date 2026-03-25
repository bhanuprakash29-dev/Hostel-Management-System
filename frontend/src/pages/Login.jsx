import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-split-bg d-none d-lg-flex flex-column align-items-start position-relative">
        <div className="position-relative z-index-1 mb-5">
            <Link to="/" className="text-white text-decoration-none d-flex align-items-center fw-bold fs-5">
              <i className="bi bi-building me-2"></i> Elite Hostel
            </Link>
        </div>
        
        <div className="position-relative z-index-1 flex-grow-1 d-flex flex-column justify-content-center">
          <h1 className="display-4 fw-bolder mb-4 lh-base">Welcome Back.<br/>Manage Your Stay.</h1>
          <p className="lead opacity-75 mb-5" style={{ maxWidth: '400px' }}>
            Access your dashboard to check notifications, track your hostel payments, and manage access cards.
          </p>
          
          <div className="bg-white bg-opacity-10 p-4 rounded-4 backdrop-blur mt-auto mb-5 d-inline-block border border-white border-opacity-25" style={{ maxWidth: '400px' }}>
            <div className="d-flex align-items-start gap-3">
              <i className="bi bi-quote fs-1 text-warning opacity-50"></i>
              <div>
                <p className="fst-italic mb-3">"The digital access cards and app notifications make living here incredibly easy. Everything is just a tap away."</p>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle border" style={{width: 30, height: 30, backgroundImage: 'url(https://i.pravatar.cc/100?img=5)', backgroundSize: 'cover'}}></div>
                  <small className="fw-bold">Rohit Sharma, 3rd Year CE</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-container">
        <div className="auth-card">
          <div className="mb-5 d-lg-none text-center">
             <Link to="/" className="text-primary text-decoration-none d-inline-flex align-items-center fw-bold fs-4">
              <i className="bi bi-building me-2"></i> Elite Hostel
            </Link>
          </div>
          
          <div className="mb-4">
            <h2 className="fw-bold text-dark mb-2">Sign In</h2>
            <p className="text-muted">Enter your email and password to access</p>
          </div>

          {error && (
            <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-4 d-flex align-items-center small mb-4">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted ms-1 mb-2">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0 px-3 rounded-start-pill"><i className="bi bi-envelope text-muted"></i></span>
                <input
                  type="email"
                  className="form-control border-0 bg-light rounded-end-pill py-3 px-3 shadow-none"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-2 ms-1">
                <label className="form-label small fw-bold text-muted mb-0">Password</label>
                <a href="#" className="small text-primary text-decoration-none" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light border-0 px-3 rounded-start-pill"><i className="bi bi-lock text-muted"></i></span>
                <input
                  type="password"
                  className="form-control border-0 bg-light rounded-end-pill py-3 px-3 shadow-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg hover-lift mb-4 d-flex align-items-center justify-content-center" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
          
          <div className="text-center">
            <p className="text-muted small mb-0">
              New here? <Link to="/sign-up" className="text-primary fw-bold text-decoration-none ms-1">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
