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
  const [walletPopupMessage, setWalletPopupMessage] = useState(null);
  const [buttonMessage, setButtonMessage] = useState(null);

  const [email, setEmail] = useState("");

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  // 🔹 Fetch wallet summary
  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);

      const meRes = await axios.get(`${API}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmail(meRes.data.email || "");

      const res = await axios.get(`${API}/wallet/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;

      const settled = data.withdrawals.filter((w) => w.status === "settled");
      const pending = data.withdrawals.filter((w) => w.status === "pending");

      // ✅ Total Earnings = all withdrawals (amount) + wallet balance
      const totalEarnings =
        (data.wallet_balance || 0) +
        data.withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

      // ✅ Withdrawn = all settled withdrawals (final_amount)
      const withdrawn = settled.reduce(
        (sum, w) => sum + (w.final_amount || 0),
        0
      );

      // ✅ Pending = all pending withdrawal requests
      const pendingAmt = pending.reduce(
        (sum, w) => sum + (w.amount || 0),
        0
      );

      // ✅ Deductions = total fee/loss in settled
      const deductions = settled.reduce(
        (sum, w) => sum + ((w.amount || 0) - (w.final_amount || 0)),
        0
      );

      setSummary({
        wallet: data.wallet,
        wallet_balance: data.wallet_balance || 0,
        withdrawals: data.withdrawals || [],
        total: totalEarnings,
        withdrawn,
        pending: pendingAmt,
        withdrawable: data.wallet_balance || 0,
        deductions,
      });
    } catch (err) {
      console.error("Error fetching wallet summary:", err);
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

    if (summary.withdrawable < 20) {
      setButtonMessage({
        type: "error",
        text: "⚠️ Minimum withdrawal limit is $20.",
      });
      return;
    }

    const today = new Date().getDay(); // 0=Sunday, 6=Saturday
    if (today !== 0 && today !== 6) {
      setButtonMessage({
        type: "error",
        text: "⚠️ Withdrawals are allowed only on Saturday and Sunday.",
      });
      return;
    }

    try {
      await axios.post(
        `${API}/send-otp-withdrawal`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtpSent(true);
      setButtonMessage({ type: "success", text: "📧 OTP sent to your email." });
    } catch (err) {
      console.error("Error sending OTP:", err);
      setButtonMessage({
        type: "error",
        text: err?.response?.data?.detail || "❌ Failed to send OTP",
      });
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
      setButtonMessage({
        type: "success",
        text: res.data.message || "✅ Withdrawal request submitted",
      });
      setOtp("");
      setOtpSent(false);
      fetchSummary();
    } catch (err) {
      console.error("Error withdrawing:", err);
      setButtonMessage({
        type: "error",
        text: err?.response?.data?.detail || "❌ Withdrawal failed",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  // 🔹 Save wallet
  const saveWallet = async () => {
    if (!newWallet.trim()) {
      setWalletPopupMessage({
        type: "error",
        text: "⚠️ Please enter a valid TRC20 wallet address.",
      });
      return;
    }
    try {
      await axios.post(
        `${API}/save-wallet`,
        { email, wallet: newWallet },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWalletPopupMessage({
        type: "success",
        text: "✅ Wallet bound successfully!",
      });
      setTimeout(() => {
        setShowWalletPopup(false);
        setWalletPopupMessage(null);
      }, 1500);
      setNewWallet("");
      fetchSummary();
    } catch (err) {
      console.error("Error saving wallet:", err);
      if (
        err?.response?.status === 400 &&
        err.response.data.detail.toLowerCase().includes("duplicate")
      ) {
        setWalletPopupMessage({
          type: "error",
          text: "⚠️ Duplicate wallets will not be saved — each wallet can only be linked to one account.",
        });
      } else {
        setWalletPopupMessage({
          type: "error",
          text: err?.response?.data?.detail || "❌ Failed to bind wallet",
        });
      }
    }
  };

  if (loading)
    return <p style={{ color: "#E5E7EB" }}>Loading wallet summary...</p>;
  if (!summary)
    return <p style={{ color: "#E5E7EB" }}>No wallet data available.</p>;

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
      <div style={summaryGrid}>
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
          <p style={{ ...valueStyle, color: "#44ef77ff" }}>
            -${summary.deductions.toFixed(2)}
          </p>
        </div>
      </div>

      <div style={glowLine} />

      {/* Withdraw Earnings */}
      {!otpSent && (
        <div style={{ maxWidth: "420px" }}>
          {buttonMessage && (
            <div style={popupBoxMsg(buttonMessage.type)}>
              {buttonMessage.text}
            </div>
          )}
          <button
            onClick={requestOtp}
            style={{
              ...btnTeal,
              opacity: summary.withdrawable >= 20 ? 1 : 0.6,
            }}
          >
            Request Withdrawal
          </button>
        </div>
      )}

      {/* OTP Confirmation */}
      {otpSent && (
        <div style={otpBox}>
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

            {walletPopupMessage && (
              <div style={popupBoxMsg(walletPopupMessage.type)}>
                {walletPopupMessage.text}
              </div>
            )}

            <p style={popupInfo}>
              You must bind a withdrawal wallet before requesting withdrawal.
            </p>
            <p style={popupWarn}>
              ⚠️ Each wallet can only be linked to one account.
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
const summaryGrid = {
  display: "flex",
  gap: "20px",
  marginBottom: "25px",
  marginTop: "20px",
  flexWrap: "wrap",
};
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
const valueStyle = { fontSize: "20px", fontWeight: "700", color: "#E5E7EB" };
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
const otpBox = {
  marginBottom: "20px",
  maxWidth: "420px",
  background: "rgba(17,24,39,0.7)",
  padding: "18px",
  borderRadius: "12px",
  marginTop: "20px",
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
  textAlign: "center",
};
const glowLine = {
  height: "2px",
  background: "linear-gradient(90deg, transparent, #17E8E5, transparent)",
  boxShadow: "0 0 10px #17E8E5",
  margin: "8px 0 20px 0",
};
const popupInfo = { fontSize: "14px", marginBottom: "8px", color: "#94A3B8" };
const popupWarn = {
  fontSize: "12px",
  color: "#F87171",
  marginBottom: "12px",
  fontStyle: "italic",
};
const popupBoxMsg = (type) => ({
  marginBottom: "12px",
  padding: "10px",
  borderRadius: "8px",
  background:
    type === "error" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
  border: `1px solid ${type === "error" ? "#EF4444" : "#10B981"}`,
  color: type === "error" ? "#F87171" : "#34D399",
  fontWeight: "300",
  textAlign: "center",
  fontSize: "14px",
});
