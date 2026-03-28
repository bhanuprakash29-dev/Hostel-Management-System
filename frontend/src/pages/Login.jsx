import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // ... (rest of the functions remain same)
  // (I will use replace_file_content to target the specific block)


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsEmailLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/verify-email");
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        setError("The password you entered is incorrect. Please try again.");
      } else if (err.code === 'auth/user-not-found') {
        setError("No account found with this email. Please register first.");
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError("This account is linked with Google. Please use 'Sign in with Google'.");
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
        <div className="auth-card border-0 shadow-lg">
            <div className="text-center mb-5">
                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-4" style={{ width: '64px', height: '64px' }}>
                    <i className="bi bi-shield-lock text-primary fs-3"></i>
                </div>
                <h2 className="fw-800 text-dark mb-2">Member Portal</h2>
                <p className="text-secondary small fw-500">Sign in to manage your residency</p>
            </div>

            {error && (
                <div className="alert border-0 bg-danger bg-opacity-10 text-danger px-4 py-3 mb-4 rounded-3 d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-3 fs-5"></i>
                    <div className="small fw-700">{error}</div>
                </div>
            )}

            <form onSubmit={handleLogin}>
                <div className="mb-4">
                    <label className="form-label small fw-800 text-muted text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>Email Address</label>
                    <input
                        type="email"
                        className="form-input-decent shadow-none"
                        placeholder="yourname@hostel.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label small fw-800 text-muted text-uppercase mb-0" style={{ letterSpacing: '0.5px' }}>Security Key</label>
                        <Link to="/forgot-password" title="Recover Account" className="small text-primary text-decoration-none fw-700">Forgot Password?</Link>
                    </div>
                    <div className="position-relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-input-decent shadow-none"
                            placeholder="••••••••"
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
                
                <button type="submit" className="btn btn-primary w-100 py-3 fs-6 mb-4 fw-700 shadow-sm" disabled={isEmailLoading || isGoogleLoading}>
                    {isEmailLoading ? 'Verifying...' : 'Access My Dashboard'}
                </button>

                <div className="d-flex align-items-center my-4">
                    <hr className="flex-grow-1 opacity-25" />
                    <span className="mx-3 text-muted small fw-800 text-uppercase" style={{fontSize: '9px', letterSpacing: '1px'}}>One-Tap Social Entry</span>
                    <hr className="flex-grow-1 opacity-25" />
                </div>

                <button 
                    type="button" 
                    onClick={handleGoogleSignIn}
                    className="btn btn-white border w-100 py-2 shadow-sm mb-4 d-flex align-items-center justify-content-center gap-3 rounded-3"
                    disabled={isEmailLoading || isGoogleLoading}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
                    <span className="fw-700 text-dark small">Continue with Google</span>
                </button>
            </form>
            
            <div className="text-center pt-3 mt-2 border-top">
                <p className="text-secondary small mb-0">
                    Not a member? <Link to="/sign-up" className="text-primary fw-800 text-decoration-none ms-1">Apply Now &rarr;</Link>
                </p>
            </div>
        </div>
    </div>
  );
};

export default Login;
