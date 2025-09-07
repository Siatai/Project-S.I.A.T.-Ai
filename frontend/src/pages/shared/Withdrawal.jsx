import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function Withdrawal() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [newWallet, setNewWallet] = useState("");

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  // 🔹 Fetch wallet summary
  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/wallet/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;

      const approved = data.withdrawals.filter((w) => w.status === "approved");
      const pending = data.withdrawals.filter((w) => w.status === "pending");

      const withdrawn = approved.reduce(
        (sum, w) => sum + (w.final_amount || 0),
        0
      );
      const pendingAmt = pending.reduce(
        (sum, w) => sum + (w.requested_amount || 0),
        0
      );
      const total = withdrawn + pendingAmt + (data.wallet_balance || 0);

      // ✅ Deductions = requested - final (only approved)
      const deductions = approved.reduce(
        (sum, w) =>
          sum + ((w.requested_amount || 0) - (w.final_amount || 0)),
        0
      );

      setSummary({
        wallet: data.wallet,
        wallet_balance: data.wallet_balance || 0,
        withdrawals: data.withdrawals || [],
        total,
        withdrawn,
        pending: pendingAmt,
        withdrawable: data.wallet_balance || 0,
        deductions,
      });
    } catch (err) {
      console.error("Error fetching wallet summary:", err);
      alert("Failed to load wallet summary");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  useEffect(() => {
    if (token) fetchSummary();
  }, [token, fetchSummary]);

  // 🔹 Request OTP
  const requestOtp = async () => {
    if (!summary?.wallet) {
      setShowWalletPopup(true);
      return;
    }
    try {
      await axios.post(
        `${API}/send-otp-withdrawal`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtpSent(true);
      alert("📧 OTP sent to your email.");
    } catch (err) {
      console.error("Error sending OTP:", err);
      alert(err?.response?.data?.detail || "Failed to send OTP");
    }
  };

  // 🔹 Confirm withdrawal
  const confirmWithdrawal = async () => {
    try {
      setWithdrawing(true);
      const res = await axios.post(
        `${API}/request-withdrawal`,
        { otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || "Withdrawal request submitted");
      setOtp("");
      setOtpSent(false);
      fetchSummary();
    } catch (err) {
      console.error("Error withdrawing:", err);
      alert(err?.response?.data?.detail || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  // 🔹 Save wallet
  const saveWallet = async () => {
    try {
      await axios.post(
        `${API}/wallet/bind`,
        { wallet: newWallet },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Wallet bound successfully!");
      setShowWalletPopup(false);
      setNewWallet("");
      fetchSummary();
    } catch (err) {
      console.error("Error saving wallet:", err);
      alert(err?.response?.data?.detail || "Failed to bind wallet");
    }
  };

  if (loading) return <p style={{ color: "#E5E7EB" }}>Loading wallet summary...</p>;
  if (!summary) return <p style={{ color: "#E5E7EB" }}>No wallet data available.</p>;

  return (
    <div style={{ color: "#E5E7EB", padding: "20px" }}>
      <h2
        style={{
          marginBottom: "10px",
          fontFamily: "Orbitron, sans-serif",
          color: "#17E8E5",
        }}
      >
        Withdrawal
      </h2>
      <div style={glowLine} />

      {/* Wallet Summary */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "25px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={cardStyle}>
          <h3 style={cardTitle}>Total Earnings</h3>
          <p style={valueStyle}>${summary.total.toFixed(2)}</p>
        </div>
        <div style={cardStyle}>
          <h3 style={cardTitle}>Withdrawn</h3>
          <p style={valueStyle}>${summary.withdrawn.toFixed(2)}</p>
        </div>
        <div style={cardStyle}>
          <h3 style={cardTitle}>Pending</h3>
          <p style={{ ...valueStyle, color: "#FACC15" }}>
            ${summary.pending.toFixed(2)}
          </p>
        </div>
        <div style={cardStyle}>
          <h3 style={cardTitle}>Withdrawable</h3>
          <p style={{ ...valueStyle, color: "#17E8E5" }}>
            ${summary.withdrawable.toFixed(2)}
          </p>
        </div>
        <div style={cardStyle}>
          <h3 style={cardTitle}>Total Deductions</h3>
          <p style={{ ...valueStyle, color: "#EF4444" }}>
            -${summary.deductions.toFixed(2)}
          </p>
        </div>
      </div>

      <div style={glowLine} />

      {/* Withdraw Earnings */}
      {summary.withdrawable > 0 && !otpSent && (
        <button onClick={requestOtp} style={btnTeal}>
          Request Withdrawal
        </button>
      )}

      {/* OTP Confirmation */}
      {otpSent && (
        <div
          style={{
            marginBottom: "20px",
            maxWidth: "420px",
            background: "rgba(17,24,39,0.7)",
            padding: "18px",
            borderRadius: "12px",
            marginTop: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={inputStyle}
          />
          <button
            onClick={confirmWithdrawal}
            disabled={withdrawing || !otp}
            style={btnTeal}
          >
            {withdrawing ? "Submitting..." : "Confirm Withdrawal"}
          </button>
        </div>
      )}

      {/* Wallet Binding Popup */}
      {showWalletPopup && (
        <div style={popupOverlay} onClick={() => setShowWalletPopup(false)}>
          <div style={popupBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "10px", color: "#17E8E5" }}>
              Bind Your TRC20 Wallet
            </h3>
            <div style={glowLine} />
            <p style={{ fontSize: "14px", marginBottom: "12px", color: "#94A3B8" }}>
              You must bind a withdrawal wallet before requesting withdrawal.
            </p>
            <input
              type="text"
              placeholder="Enter TRC20 Wallet Address"
              value={newWallet}
              onChange={(e) => setNewWallet(e.target.value)}
              style={inputStyle}
            />
            <button onClick={saveWallet} style={btnTeal}>
              Save Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* === Styles === */
const cardStyle = {
  flex: "1",
  padding: "18px",
  borderRadius: "12px",
  background: "rgba(17,24,39,0.8)",
  backdropFilter: "blur(8px)",
  boxShadow: "0 0 20px rgba(23,232,229,0.15)",
  minWidth: "200px",
};

const cardTitle = {
  fontSize: "14px",
  color: "#94A3B8",
  marginBottom: "8px",
  fontWeight: "500",
};

const valueStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#E5E7EB",
};

const btnTeal = {
  marginTop: "10px",
  padding: "12px 20px",
  border: "none",
  borderRadius: "8px",
  background: "linear-gradient(135deg,#17E8E5,#14B8E5)",
  color: "#0B1220",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 0 15px rgba(23,232,229,0.3)",
  transition: "all 0.3s ease",
  width: "100%",
  maxWidth: "420px",
};

const inputStyle = {
  width: "100%",
  maxWidth: "420px",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "#E5E7EB",
  marginBottom: "12px",
  boxSizing: "border-box",
};

const popupOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const popupBox = {
  background: "rgba(17,24,39,0.95)",
  padding: "25px",
  borderRadius: "12px",
  maxWidth: "420px",
  width: "100%",
  boxShadow: "0 0 20px rgba(23,232,229,0.25)",
  boxSizing: "border-box",
  textAlign: "center",
};

const glowLine = {
  height: "2px",
  background: "linear-gradient(90deg, transparent, #17E8E5, transparent)",
  boxShadow: "0 0 10px #17E8E5",
  margin: "8px 0 20px 0",
};
