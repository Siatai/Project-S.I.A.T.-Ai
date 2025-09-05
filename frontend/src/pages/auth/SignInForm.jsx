import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const API = "http://127.0.0.1:8000/api";

  // Step 1: Request OTP
  const sendOtp = async () => {
    if (!email.trim()) {
      alert("⚠️ Please enter your email address.");
      return;
    }
    try {
      await axios.post(`${API}/send-otp-signin`, { email });
      setOtpSent(true);
      alert("📧 OTP sent to your email.");
    } catch (err) {
      console.error("Send OTP error:", err);
      alert(err?.response?.data?.message || "Error sending OTP");
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async () => {
    try {
      const res = await axios.post(`${API}/verify-otp`, { email, otp });
      const { token, user } = res.data;

      // Save token & role
      localStorage.setItem("token", token);
      const role = user.is_admin ? "admin" : user.is_associate ? "associate" : "investor";
      localStorage.setItem("role", role);

      alert("✅ Login successful!");

      // Redirect based on role
      if (role === "admin") navigate("/admin");
      else if (role === "associate") navigate("/associate");
      else navigate("/investor");
    } catch (err) {
      console.error("Verify OTP error:", err);
      alert(err?.response?.data?.detail || "Invalid OTP");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", color: "#E5E7EB" }}>
      <h2 style={{ marginBottom: 20 }}>Sign In</h2>

      {!otpSent ? (
        <>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 6, marginBottom: 15 }}
          />
          <button
            onClick={sendOtp}
            style={{
              width: "100%",
              padding: 10,
              border: "none",
              borderRadius: 6,
              background: "#3B82F6",
              color: "#fff",
              cursor: "pointer",
            }}
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
            style={{ width: "100%", padding: 10, borderRadius: 6, marginBottom: 15 }}
          />
          <button
            onClick={verifyOtp}
            style={{
              width: "100%",
              padding: 10,
              border: "none",
              borderRadius: 6,
              background: "#22C55E",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Verify OTP
          </button>
        </>
      )}
    </div>
  );
}
