import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsEmailLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      navigate("/verify-email");
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError(
          <span>
            This email is already registered. If you forgot your password, please use 
            <Link to="/forgot-password" style={{ color: 'inherit', textDecoration: 'underline' }} className="ms-1 fw-bold">Forgot Password</Link>.
          </span>
        );
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters long.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message);
      }
    } finally {

      setIsEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/verify-email");
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };


  return (
    <div className="auth-wrapper animate-fade-in">
        <div className="auth-card">
            <div className="text-center mb-5">
                <Link to="/" className="text-dark text-decoration-none fw-800 fs-3 mb-2 d-block">
                    ELITE<span className="text-primary">HOSTEL</span>
                </Link>
                <h2 className="fw-700 h4 mb-2">Create Application</h2>
                <p className="text-muted small">Register to start your hostel application process</p>
            </div>

            {error && (
                <div className="alert border-0 shadow-sm rounded-3 p-3 mb-4 d-flex align-items-center bg-danger bg-opacity-10 text-danger">
                    <i className="bi bi-exclamation-circle-fill me-2 fs-5"></i>
                    <div className="small fw-600">{error}</div>
                </div>
            )}

            <form onSubmit={handleRegister}>
                <div className="mb-4">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Full Name</label>
                    <input
                        type="text"
                        className="form-input-decent"
                        placeholder="e.g. John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Campus Email</label>
                    <input
                        type="email"
                        className="form-input-decent"
                        placeholder="name@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                
                <div className="mb-5">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Create Password</label>
                    <div className="position-relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-input-decent"
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button 
                            type="button"
                            className="btn position-absolute top-50 end-0 translate-middle-y border-0 text-muted px-3"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ background: 'transparent' }}
                        >
                            <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                        </button>
                    </div>
                </div>
                
                <button type="submit" className="btn btn-primary w-100 py-2 fs-6 mb-4 fw-600" disabled={isEmailLoading || isGoogleLoading}>
                    {isEmailLoading ? 'Creating Profile...' : 'Begin Application'}
                </button>

                <div className="d-flex align-items-center my-4 opacity-50">
                    <hr className="flex-grow-1" />
                    <span className="mx-3 text-muted small fw-bold text-uppercase" style={{fontSize: '10px'}}>Quick Register</span>
                    <hr className="flex-grow-1" />
                </div>

                <button 
                    type="button" 
                    onClick={handleGoogleSignIn}
                    className="btn btn-outline-dark w-100 py-2 shadow-sm mb-4 d-flex align-items-center justify-content-center gap-2"
                    disabled={isEmailLoading || isGoogleLoading}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
                    <span className="fw-bold small">Google Account</span>
                </button>
            </form>
            
            <div className="text-center pt-2">
                <p className="text-muted small mb-0">
                    Already registered? <Link to="/sign-in" className="text-primary fw-700 text-decoration-none ms-1">Sign In instead</Link>
                </p>
            </div>
        </div>
    </div>
  );
};

export default Register;
