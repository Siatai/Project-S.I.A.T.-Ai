import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

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
        justifyContent: "flex-start",
        padding: "30px 20px",
        background: "linear-gradient(135deg,#0B1220,#0F2F2D,#000)",
        color: "#E5E7EB",
      }}
    >
      {/* 🔹 Logo (click → landing page) */}
      <Link to="/" style={{ textDecoration: "none", marginBottom: "20px" }}>
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
          Sign Up
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
            <h2 style={{ marginTop: 0, color: "#17E8E5" }}>Terms & Conditions</h2>
            <div style={modalContent}>
              <p>
                These Terms and Conditions (“Terms”) govern the use of AlgoMcube’s services.  
                AlgoMcube acts solely as a <strong>facilitator of trade</strong> and is not a broker, exchange, or financial advisor.  
                By creating an account, making a deposit, or engaging in trading activities, you confirm that you have read and agree to these Terms.
              </p>

              <hr />
              <h3>1. Account Registration and Verification</h3>
              <p><strong>Single Account Rule:</strong> One account per person. Multiple accounts may be suspended.</p>
              <p><strong>Wallet Binding:</strong> First deposit wallet is permanently linked. All withdrawals go to the same wallet.</p>

              <hr />
              <h3>2. Minimum Deposit and Withdrawal</h3>
              <p>Minimum Deposit: <strong>$100</strong></p>
              <p>Minimum Withdrawal: <strong>$20</strong></p>

              <hr />
              <h3>3. Deposits and Fund Management</h3>
              <p>Deposits must be from your registered wallet. Third-party deposits may be rejected with fees.</p>
              <p>Deposits are allocated towards live forex trading with AlgoMcube’s systems and partners.</p>

              <hr />
              <h3>4. Withdrawal Policy</h3>
              <ul>
                <li>Withdrawals only on <strong>Saturdays & Sundays</strong>.</li>
                <li>2-week advance notice required for capital withdrawals.</li>
                <li>Withdrawal fees apply (commissions, spreads, network costs).</li>
              </ul>

              <hr />
              <h3>5. Capital Locking Period</h3>
              <p>Capital is locked for <strong>120 days</strong>. Early withdrawal before lock period incurs a <strong>15% penalty</strong>.</p>

              <hr />
              <h3>6. Return on Investment (RoI)</h3>
              <p>Target ROI: <strong>8-10% monthly</strong> (not guaranteed). Performance may vary with market conditions. Compounding option available.</p>

              <hr />
              <h3>7. User Responsibilities</h3>
              <p>You must provide accurate details, comply with laws in your jurisdiction, and avoid fraudulent activity.</p>

              <hr />
              <h3>8. Fees and Charges</h3>
              <p>Fees apply to withdrawals (Inc. network fees, trading commissions, traders fees etc.). These may change with market/network conditions.</p>

              <hr />
              <h3>9. Limitation of Liability</h3>
              <p>AlgoMcube is a <strong>service provider & facilitator</strong>. We do not guarantee profits. Not liable for internet outages, broker failures, or technical issues.</p>

              <hr />
              <h3>10. Risk Disclaimer</h3>
              <p>Forex trading is highly volatile and risky. You may lose part or all of your capital. AlgoMcube shall not be liable for financial losses, lost opportunities, or indirect damages.</p>

              <hr />
              <h3>11. Acceptance of Terms</h3>
              <p>By checking the box and creating an account, you acknowledge:</p>
              <ul>
                <li>You have read and understood these Terms.</li>
                <li>You understand the risks of forex trading.</li>
                <li>You agree to abide by AlgoMcube’s policies on deposits, withdrawals, and accounts.</li>
              </ul>

              <hr />
              <h3>Summary</h3>
              <ul>
                <li>Minimum Deposit: $100</li>
                <li>Minimum Withdrawal: $20</li>
                <li>Withdrawals: Saturday & Sunday only</li>
                <li>Capital Lock-in: 120 days</li>
                <li>Early Withdrawal Penalty: 15%</li>
                <li>Advance Notice: 2 weeks for capital withdrawals</li>
                <li>Target ROI: 8–10% monthly (not guaranteed)</li>
                <li>One Account & One Wallet per person</li>
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
