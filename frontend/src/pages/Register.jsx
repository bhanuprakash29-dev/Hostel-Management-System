import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-split-bg d-none d-lg-flex flex-column align-items-start">
        <div className="position-relative z-index-1 mb-5">
            <Link to="/" className="text-white text-decoration-none d-flex align-items-center fw-bold fs-5">
              <i className="bi bi-building me-2"></i> Elite Hostel
            </Link>
        </div>
        <div className="position-relative z-index-1">
          <h1 className="display-4 fw-bolder mb-4">Start Your Journey With Us.</h1>
          <p className="lead opacity-75 mb-5" style={{ maxWidth: '400px' }}>
            Join our community of students and experience the best hassle-free hostel living environment.
          </p>
          <div className="d-flex align-items-center gap-3 bg-white bg-opacity-10 p-3 rounded-4 backdrop-blur">
            <div className="d-flex">
              <div className="bg-white rounded-circle rounded-circle border border-white" style={{width: 40, height: 40, backgroundImage: 'url(https://i.pravatar.cc/100?img=1)', backgroundSize: 'cover'}}></div>
              <div className="bg-white rounded-circle rounded-circle border border-white ms-n2" style={{width: 40, height: 40, backgroundImage: 'url(https://i.pravatar.cc/100?img=2)', backgroundSize: 'cover'}}></div>
              <div className="bg-white rounded-circle rounded-circle border border-white ms-n2" style={{width: 40, height: 40, backgroundImage: 'url(https://i.pravatar.cc/100?img=3)', backgroundSize: 'cover'}}></div>
            </div>
            <div className="small">
              <div className="fw-bold">1k+ Students</div>
              <div className="opacity-75">Already joined this year</div>
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
            <h2 className="fw-bold text-dark mb-2">Create Account</h2>
            <p className="text-muted">Register to apply for your hostel seat</p>
          </div>

          {error && (
            <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-4 d-flex align-items-center small mb-4">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted ms-1 mb-2">Full Name</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0 px-3 rounded-start-pill"><i className="bi bi-person text-muted"></i></span>
                <input
                  type="text"
                  className="form-control border-0 bg-light rounded-end-pill py-3 px-3 shadow-none"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            
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
              <label className="form-label small fw-bold text-muted ms-1 mb-2">Password</label>
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="text-center">
            <p className="text-muted small mb-0">
              Already have an account? <Link to="/sign-in" className="text-primary fw-bold text-decoration-none ms-1">Sign in instead</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
