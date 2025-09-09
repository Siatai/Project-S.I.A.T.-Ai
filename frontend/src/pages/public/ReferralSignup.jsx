import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const referrer = params.get("ref") || ""; // ✅ prefilled from referral link

  const API = "https://project-s-i-a-t-ai.onrender.com";

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
      await axios.post(`${API}/send-otp-signup`, { email, name, referrer });
      setOtpSent(true);
      alert("📧 OTP sent to your email.");
    } catch (err) {
      console.error("Send OTP error:", err);
      alert(err?.response?.data?.detail || "Error sending OTP");
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "30px 20px",
        background: "linear-gradient(135deg,#0B1220,#0F2F2D,#000)",
        color: "#E5E7EB",
      }}
    >
      {/* 🔹 Header with logo + title */}
      <header
        style={{
          width: "100%",
          maxWidth: "900px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "30px",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <img
            src="/logo.png"
            alt="AlgoMcube Logo"
            style={{
              height: "60px",
              cursor: "pointer",
              filter: "drop-shadow(0 0 8px rgba(23,232,229,0.6))",
            }}
          />
        </Link>
        <h1
          style={{
            fontFamily: "Orbitron, sans-serif",
            fontSize: "22px",
            fontWeight: "700",
            color: "#17E8E5",
          }}
        >
          Referral Signup
        </h1>
      </header>

      {/* 🔹 Signup Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(17,24,39,0.85)",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(23,232,229,0.25)",
        }}
      >
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
            {/* ✅ Referral code prefilled + disabled */}
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

            {/* ✅ Agreement checkbox */}
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
                opacity: agree ? 1 : 0.6,
                cursor: agree ? "pointer" : "not-allowed",
              }}
              disabled={!agree}
            >
              Send OTP
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

      {/* ✅ Modal (T&C) */}
      {showTerms && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ marginTop: 0, color: "#17E8E5" }}>
              Terms & Conditions
            </h2>
            <div style={modalContent}>
              {/* 👇 You can paste your T&C text here (kept shorter for readability) */}
              <p>
                These Terms and Conditions (“Terms”) govern the use of AlgoMcube’s
                services. By creating an account, making a deposit, or engaging
                in trading, you agree to these Terms.
              </p>
              <hr />
              <h3>1. Account Rules</h3>
              <p>• One account per person.</p>
              <p>• First deposit wallet is permanently linked.</p>
              <hr />
              <h3>2. Deposits & Withdrawals</h3>
              <p>• Minimum Deposit: $100</p>
              <p>• Minimum Withdrawal: $20</p>
              <p>• Withdrawals only on Saturdays & Sundays.</p>
              <hr />
              <h3>3. Risk Disclaimer</h3>
              <p>
                Forex trading is highly volatile and risky. AlgoMcube does not
                guarantee profits. You may lose all or part of your investment.
              </p>
            </div>

            <button style={buttonStyleTeal} onClick={() => setShowTerms(false)}>
              Close
            </button>
          </div>
        </div>
      )}
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

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalBox = {
  background: "#1E293B",
  padding: "20px",
  borderRadius: "12px",
  maxWidth: "650px",
  width: "90%",
  color: "#E5E7EB",
  boxShadow: "0 0 20px rgba(23,232,229,0.4)",
};

const modalContent = {
  maxHeight: "400px",
  overflowY: "auto",
  marginBottom: "15px",
  fontSize: "14px",
  lineHeight: "1.6",
};
