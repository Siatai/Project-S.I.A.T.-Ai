import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function ReferralSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [acceptedTnC, setAcceptedTnC] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const referralCode = params.get("ref") || "";

  const API = "https://project-s-i-a-t-ai.onrender.com";

  // Step 1: Send OTP
  const sendOtp = async () => {
    if (!email.trim() || !name.trim()) {
      alert("⚠️ Please enter name and email.");
      return;
    }
    if (!referralCode.trim()) {
      alert("⚠️ Referral code is required to sign up.");
      return;
    }
    if (!acceptedTnC) {
      alert("⚠️ You must accept Terms & Conditions to proceed.");
      return;
    }
    try {
      await axios.post(`${API}/send-otp-signup`, {
        email,
        name,
        referrer: referralCode,
      });
      setOtpSent(true);
      alert("📧 OTP sent to your email.");
    } catch (err) {
      console.error("Send OTP error:", err);
      alert(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Error sending OTP"
      );
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async () => {
    try {
      const res = await axios.post(`${API}/verify-otp`, { email, otp });
      const { token, user } = res.data;

      // Save token & role
      localStorage.setItem("token", token);
      const role = user.is_admin
        ? "admin"
        : user.is_associate
        ? "associate"
        : "investor";
      localStorage.setItem("role", role);

      alert("✅ Signup successful!");

      // Redirect
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
        background: "linear-gradient(135deg,#0B1220,#0F2F2D,#000)",
        color: "#E5E7EB",
      }}
    >
      {/* 🔹 Header */}
      <header
        style={{
          height: "60px",
          background: "rgba(18,26,43,0.9)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid rgba(23,232,229,0.3)",
          boxShadow: "0 0 12px rgba(23,232,229,0.2)",
        }}
      >
        <h1
          style={{
            fontFamily: "Orbitron, sans-serif",
            fontWeight: "700",
            color: "#17E8E5",
            fontSize: "22px",
          }}
        >
          AlgoM³
        </h1>
        <span style={{ color: "#94A3B8", fontSize: "14px" }}>
          Referral Signup
        </span>
      </header>

      {/* 🔹 Main Content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
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
            Signup
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
                value={referralCode}
                disabled
                style={{
                  ...inputStyle,
                  background: "rgba(31,41,55,0.8)",
                  color: "#9CA3AF",
                  cursor: "not-allowed",
                }}
              />

              {/* ✅ TnC Checkbox */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                  fontSize: "13px",
                  color: "#9CA3AF",
                }}
              >
                <input
                  type="checkbox"
                  id="tnc"
                  checked={acceptedTnC}
                  onChange={(e) => setAcceptedTnC(e.target.checked)}
                  style={{ marginRight: "8px", cursor: "pointer" }}
                />
                <label htmlFor="tnc">
                  I accept{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#17E8E5", textDecoration: "underline" }}
                  >
                    Terms & Conditions
                  </a>
                </label>
              </div>

              <button onClick={sendOtp} style={btnTeal}>
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
              <button onClick={verifyOtp} style={btnGreen}>
                Verify OTP
              </button>
            </>
          )}

          {/* ✅ Home Button */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <button style={btnHome}>🏠 Home</button>
          </Link>
        </div>
      </main>

      {/* 🔹 Footer */}
      <footer
        style={{
          padding: "12px",
          textAlign: "center",
          fontSize: "13px",
          color: "#9CA3AF",
          borderTop: "1px solid rgba(23,232,229,0.2)",
          background: "rgba(18,26,43,0.8)",
        }}
      >
        © {new Date().getFullYear()} AlgoM³ • All Rights Reserved
      </footer>

      {/* 🔹 Global Fix for Bleed */}
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          background: linear-gradient(135deg,#0B1220,#0F2F2D,#000);
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}

/* === Styles === */
const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "12px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "#E5E7EB",
  fontSize: "14px",
  boxSizing: "border-box",
};

const btnTeal = {
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  background: "linear-gradient(135deg,#17E8E5,#14B8E5)",
  color: "#0B1220",
  fontWeight: "700",
  cursor: "pointer",
  marginTop: "10px",
  boxShadow: "0 0 12px rgba(23,232,229,0.4)",
};

const btnGreen = {
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  background: "linear-gradient(135deg,#22C55E,#16A34A)",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
  marginTop: "10px",
  boxShadow: "0 0 12px rgba(34,197,94,0.4)",
};

const btnHome = {
  width: "100%",
  padding: "10px",
  border: "1px solid rgba(23,232,229,0.4)",
  borderRadius: "8px",
  background: "transparent",
  color: "#17E8E5",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "14px",
  boxShadow: "0 0 8px rgba(23,232,229,0.2)",
};
