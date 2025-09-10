import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TermsModal from "../../Components/TermsModal"; // ✅ import modal

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [referrer, setReferrer] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [sending, setSending] = useState(false); // 👈 disable state
  const navigate = useNavigate();

  const API = "https://project-s-i-a-t-ai.onrender.com";

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
      setSending(true); // disable button
      await axios.post(`${API}/send-otp-signup`, { email, name, referrer });
      setOtpSent(true);
      alert("📧 OTP sent to your email.");
    } catch (err) {
      console.error("Send OTP error:", err);
      alert(err?.response?.data?.detail || "Error sending OTP");
      setSending(false); // allow retry if failed
    }
  };

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
    <div>
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
            placeholder="Referral code (required)"
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
            style={inputStyle}
          />

          <div style={checkboxContainer}>
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
              style={{ marginRight: "8px" }}
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

      {/* ✅ Reusable modal */}
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
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
