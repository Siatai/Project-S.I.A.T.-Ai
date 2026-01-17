import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import TermsModal from "../../Components/TermsModal"; // Popup

export default function ReferralSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [sending, setSending] = useState(false); // New state
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const referrer = params.get("ref") || "";

  const API = "https://project-s-i-a-t-ai.onrender.com";

  // Axios instance with token handling
  const api = axios.create({ baseURL: API });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/signup");
      }
      return Promise.reject(err);
    }
  );

  // Fetch user (to confirm token works)
  const fetchUser = useCallback(async () => {
    try {
      await api.get("/me");
    } catch (err) {
      console.error("Fetch user failed:", err?.response?.data || err?.message);
    }
  }, [api]);

  // Auto fetch if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchUser();
  }, [fetchUser]);

  // Step 1: Send OTP
  const sendOtp = async () => {
    if (!referrer.trim()) {
      setToast({ type: "error", message: "Referral code is required to sign up." });
      return;
    }
    if (!email.trim() || !name.trim()) {
      setToast({ type: "error", message: "Please enter name and email." });
      return;
    }
    if (!agree) {
      setToast({ type: "error", message: "You must agree to the Terms & Conditions." });
      return;
    }
    try {
      setSending(true); // Disable button
      await axios.post(`${API}/send-otp-signup`, { email, name, referrer });
      setOtpSent(true);
      setToast({ type: "success", message: "OTP sent to your email." });
    } catch (err) {
      console.error("Send OTP error:", err);
      setToast({ type: "error", message: err?.response?.data?.detail || "Error sending OTP" });
      setSending(false); // Allow retry if failed
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async () => {
    try {
      const res = await axios.post(`${API}/verify-otp`, { email, otp });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      const role = user.is_admin
        ? "admin"
        : user.is_associate
        ? "associate"
        : "investor";
      localStorage.setItem("role", role);

      setToast({ type: "success", message: "Signup successful!" });
      fetchUser();

      if (role === "admin") navigate("/admin");
      else if (role === "associate") navigate("/associate");
      else navigate("/investor");
    } catch (err) {
      console.error("Verify OTP error:", err);
      setToast({ type: "error", message: err?.response?.data?.detail || "Invalid OTP" });
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "30px 20px",
        boxSizing: "border-box",
      }}
    >
      {toast && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            zIndex: 3000,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "var(--fx-card)",
              border: "1px solid rgba(var(--fx-accent-rgb), 0.35)",
              boxShadow: "var(--fx-shadow)",
              color: "var(--fx-ink)",
              padding: "14px 18px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              textAlign: "center",
              minWidth: "260px",
            }}
          >
            {toast.message}
          </div>
        </div>
      )}
      {/* Centered Logo */}
      <Link to="/" style={{ textDecoration: "none", marginBottom: "20px" }}>
        <img
          src="/logo.png"
          alt="AlgoMcube Logo"
          className="logo-img"
          style={{
            height: "70px",
            cursor: "pointer",
            filter: "drop-shadow(0 0 8px rgba(var(--fx-accent-rgb),0.6))",
          }}
        />
      </Link>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--fx-card)",
          padding: "30px",
          borderRadius: "16px",
          border: "1px solid rgba(var(--fx-accent-rgb), 0.35)",
          boxShadow: "var(--fx-shadow)",
        }}
      >
        {/* Subtle neon welcome heading */}
        <h1
          style={{
            textAlign: "center",
            fontFamily: "var(--fx-font-display)",
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "12px",
          }}
        >
          <span style={{ color: "var(--fx-ink)" }}>Welcome to </span>
          <span
            style={{
              color: "var(--fx-accent-legacy)",
              textShadow: "0 0 10px rgba(var(--fx-accent-legacy-rgb),0.6)",
              fontFamily: "var(--fx-brand-font)",
            }}
          >
            AlgoM3
          </span>
        </h1>

        <h2
          style={{
            marginBottom: "20px",
            textAlign: "center",
            fontFamily: "var(--fx-font-display)",
            color: "var(--fx-accent)",
          }}
        >
          Create Your Account
        </h2>

        {!otpSent ? (
          <>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              value={referrer}
              disabled
              style={{
                ...inputStyle,
                background: "rgba(6, 14, 28, 0.85)",
                color: "var(--fx-muted)",
                cursor: "not-allowed",
              }}
            />

            <div style={checkboxContainer}>
              <input
                type="checkbox"
                checked={agree}
                onChange={() => setAgree(!agree)}
                style={{ marginRight: "8px", cursor: "pointer" }}
              />
              <span style={{ fontSize: "13px", color: "var(--fx-muted-2)" }}>
                By checking this box, you agree to our{" "}
                <span
                  onClick={() => setShowTerms(true)}
                  style={{
                  color: "var(--fx-accent)",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                >
                  Terms & Conditions
                </span>
              </span>
            </div>

            <button
              onClick={sendOtp}
              style={{
                ...buttonStyleTeal,
                opacity: agree && !sending ? 1 : 0.6,
                cursor: agree && !sending ? "pointer" : "not-allowed",
              }}
              disabled={!agree || sending} // Disable if not agreed or already sending
            >
              {sending ? "Sending..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={inputStyle}
            />
            <button onClick={verifyOtp} style={buttonStyleTeal}>
              Verify OTP
            </button>
          </>
        )}
      </div>

      {/* Reusable popup */}
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />

      {/* Background + responsive logo */}
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          background: var(--fx-hero);
          overflow-x: hidden;
        }

        .logo-img {
          transition: all 0.3s ease;
        }

        @media (min-width: 768px) {
          .logo-img {
            height: 120px !important;
          }
        }
      `}</style>
    </div>
  );
}

/* === Styles === */
const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  marginBottom: "18px",
  borderRadius: "8px",
  border: "1px solid rgba(var(--fx-accent-rgb), 0.35)",
  background: "rgba(6, 14, 28, 0.85)",
  color: "var(--fx-ink)",
  fontSize: "14px",
  boxSizing: "border-box",
};

const buttonStyleTeal = {
  width: "100%",
  padding: "12px",
  border: "1px solid rgba(var(--fx-accent-rgb), 0.6)",
  borderRadius: "6px",
  background: "linear-gradient(135deg, rgba(var(--fx-accent-rgb), 0.92), rgba(var(--fx-accent-rgb), 0.65))",
  color: "#05101b",
  fontSize: "13px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 14px 28px rgba(var(--fx-accent-rgb),0.22)",
};

const checkboxContainer = {
  display: "flex",
  alignItems: "center",
  marginBottom: "18px",
};
