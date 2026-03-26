import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Password reset email sent! Check your inbox.");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="auth-wrapper animate-fade-in">
        <div className="auth-card">
            <div className="text-center mb-5">
                <Link to="/" className="text-dark text-decoration-none fw-800 fs-3 mb-2 d-block">
                    ELITE<span className="text-primary">HOSTEL</span>
                </Link>
                <h2 className="fw-700 h4 mb-2">Access Recovery</h2>
                <p className="text-muted small px-3">Enter the email associated with your campus account.</p>
            </div>

            {message && (
                <div className="alert border-0 shadow-sm rounded-3 p-3 mb-4 d-flex align-items-center bg-success bg-opacity-10 text-success">
                    <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                    <div className="small fw-600">{message}</div>
                </div>
            )}

            {error && (
                <div className="alert border-0 shadow-sm rounded-3 p-3 mb-4 d-flex align-items-center bg-danger bg-opacity-10 text-danger">
                    <i className="bi bi-exclamation-circle-fill me-2 fs-5"></i>
                    <div className="small fw-600">{error}</div>
                </div>
            )}

            <form onSubmit={handleReset}>
                <div className="mb-5">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Registered Email</label>
                    <input
                        type="email"
                        className="form-input-decent"
                        placeholder="name@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2 fs-6 mb-4 fw-600" disabled={loading}>
                    {loading ? 'Transmitting...' : 'Issue Reset Link'}
                </button>
                
                <div className="text-center pt-2">
                    <Link to="/sign-in" className="text-decoration-none small text-muted fw-bold d-flex align-items-center justify-content-center gap-2">
                        <i className="bi bi-chevron-left"></i> Back to Login Portal
                    </Link>
                </div>
            </form>
        </div>
    </div>

    );
};

export default ForgotPassword;
