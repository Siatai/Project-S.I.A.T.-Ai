import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false); // 👈 new state
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const API = "https://project-s-i-a-t-ai.onrender.com";

  const sendOtp = async () => {
    if (!email.trim()) {
      setToast({ type: "error", message: "Please enter your email address." });
      return;
    }
    try {
      setSending(true); // disable button
      await axios.post(`${API}/send-otp-signin`, { email });
      setOtpSent(true);
      setToast({ type: "success", message: "OTP sent to your email." });
    } catch (err) {
      console.error("Send OTP error:", err);
      setToast({ type: "error", message: err?.response?.data?.message || "Error sending OTP" });
      setSending(false); // allow retry on error
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

      setToast({ type: "success", message: "Login successful!" });

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
    <div>
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
              border: "1px solid var(--fx-border)",
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
      {!otpSent ? (
        <>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <button
            onClick={sendOtp}
            style={{
              ...buttonStyleTeal,
              opacity: sending ? 0.6 : 1,
              cursor: sending ? "not-allowed" : "pointer",
            }}
            disabled={sending} // 👈 disable when sending
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
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  marginBottom: "18px",
  borderRadius: "10px",
  border: "1px solid var(--fx-border)",
  background: "rgba(8, 10, 20, 0.6)",
  color: "var(--fx-ink)",
  fontSize: "14px",
  boxSizing: "border-box",
};

const buttonStyleTeal = {
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "linear-gradient(135deg, var(--fx-button), var(--fx-button-2))",
  color: "var(--fx-bg)",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 14px 28px rgba(var(--fx-accent-rgb),0.22)",
};
