import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

const OTP_KEYS = [
  "otp_user_id",
  "otp_email",
  "otp_sessionTime",
  "otp_remember",
];

// Read the OTP challenge once (router state first, then sessionStorage)
const readChallenge = (state) => ({
  userId: state?.userId || sessionStorage.getItem("otp_user_id"),
  email: state?.email || sessionStorage.getItem("otp_email"),
  otpSessionTime:
    state?.otpSessionTime || sessionStorage.getItem("otp_sessionTime"),
  rememberMe:
    typeof state?.rememberMe === "boolean"
      ? state.rememberMe
      : sessionStorage.getItem("otp_remember") === "true",
});

export default function Mfa_otp() {
  const location = useLocation();
  const navigate = useNavigate();

  // Captured once so clearing storage later doesn't break the page
  const [challenge] = useState(() => readChallenge(location.state));
  const { userId, email, otpSessionTime, rememberMe } = challenge;

  const [otp, setOtp] = useState("");
  const [expired, setExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const expiryTime = otpSessionTime
    ? new Date(otpSessionTime).getTime()
    : NaN;

  const validChallenge =
    Boolean(userId) && Boolean(otpSessionTime) && !Number.isNaN(expiryTime);

  // OTP expiry timer
  useEffect(() => {
    if (!validChallenge) {
      return;
    }

    const updateTimer = () => {
      const seconds = Math.max(
        0,
        Math.ceil((expiryTime - Date.now()) / 1000)
      );

      setTimeLeft(seconds);
      setExpired(seconds <= 0);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [validChallenge, expiryTime]);

  const formatTime = (seconds) => {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const remaining = String(seconds % 60).padStart(2, "0");

    return `${minutes}:${remaining}`;
  };

  const clearOtpChallenge = () => {
    OTP_KEYS.forEach((key) => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
  };

  const handleBackToLogin = () => {
    clearOtpChallenge();
    navigate("/login", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");

    if (!validChallenge) {
      setServerError("OTP session not found. Please log in again.");
      return;
    }

    if (expired || Date.now() >= expiryTime) {
      setExpired(true);
      setServerError("OTP expired. Please log in again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setServerError("Enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          otp: otp,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setServerError(data.message || "OTP verification failed.");

        return;
      }

      if (!data.access || !data.refresh) {
        setServerError("Server did not return the required JWT tokens.");
        return;
      }

      // Save tokens only after successful OTP verification
      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      storage.setItem("access", data.access);
      storage.setItem("refresh", data.refresh);

      otherStorage.removeItem("access");
      otherStorage.removeItem("refresh");

      clearOtpChallenge();

      const destination = data.redirect === "/home" ? "/home" : "/home";

      navigate(destination, { replace: true });
    } catch (error) {
      console.error("OTP verification error:", error);
      setServerError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5">
          <div className="card border-0 rounded-4 shadow p-4 p-md-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10"
                style={{ width: "75px", height: "75px" }}
              >
                <span
                  className="text-primary fw-bold"
                  style={{ fontSize: "30px" }}
                >
                  OTP
                </span>
              </div>

              <h3 className="fw-bold">Email Verification</h3>

              <p className="text-secondary mb-2">
                Enter the 6-digit verification code sent to your email address.
              </p>

              {email && (
                <p className="fw-semibold text-break mb-3">{email}</p>
              )}
            </div>

            {/* Missing or invalid challenge */}
            {!validChallenge ? (
              <div className="text-center">
                <div className="alert alert-warning" role="alert">
                  OTP session not found or invalid. Please log in again.
                </div>

                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={handleBackToLogin}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <>
                {/* Expiry timer */}
                <div
                  className={`text-center mb-4 ${
                    expired ? "text-danger" : "text-primary"
                  }`}
                  aria-live="polite"
                >
                  <div className="small mb-1">
                    {expired ? "Your OTP has expired" : "OTP expires in"}
                  </div>

                  <h4 className="fw-bold mb-0">{formatTime(timeLeft)}</h4>
                </div>

                {/* Error message */}
                {serverError && (
                  <div className="alert alert-danger" role="alert">
                    {serverError}
                  </div>
                )}

                {/* OTP form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="otp" className="form-label fw-semibold">
                      Verification Code
                    </label>

                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="form-control form-control-lg text-center"
                      style={{
                        letterSpacing: "8px",
                        fontWeight: "bold",
                      }}
                      placeholder="000000"
                      value={otp}
                      onChange={(event) => {
                        setOtp(
                          event.target.value.replace(/\D/g, "").slice(0, 6)
                        );
                        setServerError("");
                      }}
                      maxLength={6}
                      required
                      disabled={expired || loading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 rounded-3"
                    disabled={expired || loading || otp.length !== 6}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </form>

                {expired && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100 mt-3"
                    onClick={handleBackToLogin}
                  >
                    Back to Login
                  </button>
                )}

                <p className="text-center text-secondary small mt-4 mb-0">
                  For your security, never share your verification code with
                  anyone.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}