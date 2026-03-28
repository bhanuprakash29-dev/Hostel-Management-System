import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";


const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  // On mount: send the initial OTP and start countdown
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/sign-in"); // Not logged in
        return;
      }
      setUserEmail(firebaseUser.email || "");
      await sendOtp(firebaseUser);
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  const sendOtp = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await axios.post(
        `/api/otp/send`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.alreadyVerified) {
        navigate("/dashboard");
        return;
      }
      setMessage(res.data.message);
      startCountdown();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Check your internet connection.");
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only 1 digit per box
    setOtp(newOtp);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
      inputsRef.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setIsVerifying(true);
    setError("");
    setMessage("");
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error("Session expired. Please log in again.");
      const token = await firebaseUser.getIdToken();
      const res = await axios.post(
        `/api/otp/verify`,
        { otp: otpValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setIsResending(true);
    setError("");
    setMessage("");
    setOtp(["", "", "", "", "", ""]);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error("Session expired.");
      await sendOtp(firebaseUser);
    } catch (err) {
      setError("Could not resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-wrapper animate-fade-in">
      <div className="auth-card border-0 shadow-lg" style={{ maxWidth: '460px' }}>

        {/* Header */}
        <div className="text-center mb-5">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
            style={{
              width: '72px', height: '72px',
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)'
            }}
          >
            <i className="bi bi-envelope-check-fill text-primary fs-2"></i>
          </div>
          <h2 className="fw-800 text-dark mb-2">Verify Your Email</h2>
          <p className="text-secondary small fw-500 mb-1">
            We sent a 6-digit code to
          </p>
          <p className="fw-700 text-primary small">{userEmail}</p>
        </div>

        {/* Alerts */}
        {message && (
          <div className="alert border-0 bg-success bg-opacity-10 text-success px-4 py-3 mb-4 rounded-3 d-flex align-items-center">
            <i className="bi bi-check-circle-fill me-3 fs-5"></i>
            <div className="small fw-700">{message}</div>
          </div>
        )}
        {error && (
          <div className="alert border-0 bg-danger bg-opacity-10 text-danger px-4 py-3 mb-4 rounded-3 d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-3 fs-5"></i>
            <div className="small fw-700">{error}</div>
          </div>
        )}

        {/* OTP Input */}
        <form onSubmit={handleVerify}>
          <label className="form-label small fw-800 text-muted text-uppercase mb-3 d-block text-center" style={{ letterSpacing: '0.5px' }}>
            Enter Verification Code
          </label>
          <div className="d-flex justify-content-center gap-2 mb-5" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoFocus={index === 0}
                style={{
                  width: '52px',
                  height: '62px',
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: '800',
                  fontFamily: 'monospace',
                  border: digit ? '2px solid #2563eb' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  background: digit ? '#eff6ff' : '#f9fafb',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  color: '#1d4ed8'
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-3 fs-6 mb-4 fw-700 shadow-sm"
            disabled={isVerifying || otp.join("").length !== 6}
          >
            {isVerifying ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status" /> Verifying...</>
            ) : (
              <><i className="bi bi-shield-check me-2"></i>Verify & Continue</>
            )}
          </button>
        </form>

        {/* Resend */}
        <div className="text-center">
          <p className="text-secondary small mb-2">Didn&apos;t receive the code?</p>
          {canResend ? (
            <button
              className="btn btn-link p-0 text-primary fw-700 small text-decoration-none"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? "Sending..." : "Resend OTP"}
            </button>
          ) : (
            <p className="text-muted small fw-600">
              Resend in{" "}
              <span className="text-primary fw-800">{countdown}s</span>
            </p>
          )}
        </div>

        <div className="text-center mt-4 pt-3 border-top">
          <p className="text-secondary small mb-0">
            Wrong account?{" "}
            <button
              className="btn btn-link p-0 text-primary fw-700 small text-decoration-none"
              onClick={() => { auth.signOut(); navigate("/sign-in"); }}
            >
              Sign Out
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
