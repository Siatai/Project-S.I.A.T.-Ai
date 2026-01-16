import React, { useEffect, useState } from "react";
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
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const API = "https://project-s-i-a-t-ai.onrender.com";

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
      setSending(true); // disable button
      await axios.post(`${API}/send-otp-signup`, { email, name, referrer });
      setOtpSent(true);
      setToast({ type: "success", message: "OTP sent to your email." });
    } catch (err) {
      console.error("Send OTP error:", err);
      setToast({ type: "error", message: err?.response?.data?.detail || "Error sending OTP" });
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

      setToast({ type: "success", message: "Signup successful!" });

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
            <span style={{ fontSize: "13px", color: "var(--fx-muted-2)" }}>
              By checking this box, you agree to our{" "}
              <span
                onClick={() => setShowTerms(true)}
                style={{
                  color: "var(--fx-accent-2)",
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

const checkboxContainer = {
  display: "flex",
  alignItems: "center",
  marginBottom: "18px",
};
