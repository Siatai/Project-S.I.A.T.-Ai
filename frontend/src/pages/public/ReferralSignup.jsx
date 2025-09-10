import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import TermsModal from "../../Components/TermsModal"; // ✅ popup

export default function ReferralSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [sending, setSending] = useState(false); // 👈 new state

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const referrer = params.get("ref") || "";

  const API = "https://project-s-i-a-t-ai.onrender.com";

  // ✅ Axios instance with token handling
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

  // ✅ Fetch user (to confirm token works)
  const fetchUser = useCallback(async () => {
    try {
      await api.get("/me");
    } catch (err) {
      console.error("Fetch user failed:", err?.response?.data || err.message);
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
      alert("⚠️ Referral code is required to sign up.");
      return;
    }
    if (!email.trim() || !name.trim()) {
      alert("⚠️ Please enter name and email.");
      return;
    }
    if (!agree) {
      alert("⚠️ You must agree to the Terms & Conditions to continue.");
      return;
    }
    try {
      setSending(true); // 👈 disable button
      await axios.post(`${API}/send-otp-signup`, { email, name, referrer });
      setOtpSent(true);
      alert("📧 OTP sent to your email.");
    } catch (err) {
      console.error("Send OTP error:", err);
      alert(err?.response?.data?.detail || "Error sending OTP");
      setSending(false); // 👈 allow retry if failed
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

      alert("✅ Signup successful!");
      fetchUser();

      if (role === "admin") navigate("/admin");
      else if (role === "associate") navigate("/associate");
      else navigate("/investor");
    } catch (err) {
      console.error("Verify OTP error:", err);
      alert(err?.response?.data?.detail || "Invalid OTP");
    }
  };

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
      {/* 🔹 Centered Logo */}
      <Link to="/" style={{ textDecoration: "none", marginBottom: "20px" }}>
        <img
          src="/logo.png"
          alt="AlgoMcube Logo"
          className="logo-img"
          style={{
            height: "70px",
            cursor: "pointer",
            filter: "drop-shadow(0 0 8px rgba(23,232,229,0.6))",
          }}
        />
      </Link>

      {/* 🔹 Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(17,24,39,0.95)",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 6px 24px rgba(0,0,0,0.6)",
        }}
      >
        {/* ✅ Subtle neon welcome heading */}
        <h1
          style={{
            textAlign: "center",
            fontFamily: "Orbitron, sans-serif",
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "12px",
          }}
        >
          <span style={{ color: "#ffffff" }}>Welcome to </span>
          <span
            style={{
              color: "#17E8E5",
              textShadow:
                "0 0 4px #17E8E5, 0 0 8px rgba(23,232,229,0.6), 0 0 12px rgba(23,232,229,0.4)",
            }}
          >
            AlgoM³
          </span>
        </h1>

        <h2
          style={{
            marginBottom: "20px",
            textAlign: "center",
            fontFamily: "Orbitron, sans-serif",
            color: "#17E8E5",
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
                background: "rgba(31,41,55,0.8)",
                color: "#9CA3AF",
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
              <span style={{ fontSize: "13px", color: "#CBD5E1" }}>
                By checking this box, you agree to our{" "}
                <span
                  onClick={() => setShowTerms(true)}
                  style={{
                    color: "#17E8E5",
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
              disabled={!agree || sending} // 👈 disable if not agreed or already sending
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

      {/* ✅ Reusable popup */}
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />

      {/* ✅ Background + responsive logo */}
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          background: linear-gradient(135deg,#0B1220,#0F2F2D,#000);
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
  borderRadius: "10px",
  border: "1px solid #1E293B",
  background: "rgba(255,255,255,0.05)",
  color: "#E5E7EB",
  fontSize: "14px",
  boxSizing: "border-box",
};

const buttonStyleTeal = {
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "#17E8E5",
  color: "#0B1220",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.3s ease",
};

const checkboxContainer = {
  display: "flex",
  alignItems: "center",
  marginBottom: "18px",
};
