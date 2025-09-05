import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [referrer, setReferrer] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const API = "http://127.0.0.1:8000/api";

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
    try {
      await axios.post(`${API}/send-otp-signup`, { email, name, referrer });
      setOtpSent(true);
      alert("📧 OTP sent to your email.");
    } catch (err) {
      console.error("Send OTP error:", err);
      alert(err?.response?.data?.detail || err?.response?.data?.message || "Error sending OTP");
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async () => {
    try {
      const res = await axios.post(`${API}/verify-otp`, { email, otp });
      const { token, user } = res.data;

      // save token & role
      localStorage.setItem("token", token);
      const role = user.is_admin ? "admin" : user.is_associate ? "associate" : "investor";
      localStorage.setItem("role", role);

      alert("✅ Signup successful!");

      // redirect based on role
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
      <h2 style={{ marginBottom: 20 }}>Sign Up</h2>

      {!otpSent ? (
        <>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 6, marginBottom: 10 }}
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 6, marginBottom: 10 }}
          />
          <input
            type="text"
            placeholder="Referral code (required)"
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
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
