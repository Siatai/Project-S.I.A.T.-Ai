import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [referrer, setReferrer] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
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
      await axios.post(`${API}/send-otp-signup`, { email, name, referrer });
      setOtpSent(true);
      alert("📧 OTP sent to your email.");
    } catch (err) {
      console.error("Send OTP error:", err);
      alert(err?.response?.data?.detail || "Error sending OTP");
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

          {/* ✅ Agreement checkbox */}
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
                style={{ color: "#17E8E5", textDecoration: "underline", cursor: "pointer" }}
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

      {/* ✅ Modal */}
      {showTerms && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ marginTop: 0, color: "#17E8E5" }}>Terms & Conditions</h2>
            <div style={modalContent}>
              <p>
                These Terms and Conditions (“Terms”) govern your use of the services provided by
                <strong> AlgoMcube Fintech (“AlgoMcube”)</strong>.  
                AlgoMcube acts solely as a <strong>facilitator of trade</strong>, connecting
                users to professional trading strategies. AlgoMcube is <u>not</u> a broker,
                financial advisor, or trading platform.
              </p>

              <hr />

              <h3>1. Risk Disclaimer</h3>
              <p>
                Forex trading is highly volatile and inherently risky. There is no guarantee of
                profits, and past performance does not indicate future results. By using our
                services, you acknowledge and accept full responsibility for financial gains or
                losses incurred. Invest only what you can afford to lose.
              </p>

              <hr />

              <h3>2. Return on Investment (RoI)</h3>
              <ul>
                <li>Expected monthly ROI ranges between <strong>8–10%</strong>, but may vary.</li>
                <li>AlgoMcube does not guarantee fixed returns. Performance can fluctuate.</li>
              </ul>

              <hr />

              <h3>3. Deposits and Wallet Binding</h3>
              <ul>
                <li>Each user is allowed only one account.</li>
                <li>Deposits must come from the wallet you bind to your account.</li>
                <li>All withdrawals will be credited back to the same wallet address.</li>
                <li>Changing wallets requires explicit AlgoMcube approval.</li>
              </ul>

              <hr />

              <h3>4. Withdrawal Policy</h3>
              <ul>
                <li>Withdrawals are processed only on non-trading days (Saturday & Sunday).</li>
                <li>A <strong>2-week advance notice</strong> is required for capital withdrawals.</li>
                <li>Each withdrawal incurs a fee covering trade commissions, spreads, and network fees.</li>
              </ul>

              <hr />

              <h3>5. Capital Locking Period</h3>
              <ul>
                <li>All invested capital is subject to a <strong>120-day lock-in</strong>.</li>
                <li>Early withdrawals attract a <strong>15% penalty</strong>.</li>
              </ul>

              <hr />

              <h3>6. Compliance and Account Restrictions</h3>
              <ul>
                <li>Only one account per person is permitted.</li>
                <li>Multiple accounts may result in suspension or closure.</li>
                <li>Deposits from third-party or unverified wallets will be rejected/refunded (fees apply).</li>
              </ul>

              <hr />

              <h3>7. Limitation of Liability</h3>
              <ul>
                <li>AlgoMcube acts solely as a <strong>service provider and trading facilitator</strong>.</li>
                <li>We do not provide investment advice or profit guarantees.</li>
                <li>Trading outcomes may be affected by market risks, technical issues, or unforeseen events.</li>
              </ul>

              <hr />

              <h3>8. Acknowledgment</h3>
              <ul>
                <li>You confirm that you have read and understood these Terms.</li>
                <li>You acknowledge the risks of forex trading.</li>
                <li>You agree to comply with AlgoMcube policies regarding deposits, withdrawals, and accounts.</li>
              </ul>
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
  maxWidth: "600px",
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
