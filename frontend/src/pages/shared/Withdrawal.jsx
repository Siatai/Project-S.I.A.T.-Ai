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

  // 🔹 Reusable fetch summary function
  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/wallet/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;
      const withdrawn = data.withdrawals.reduce(
        (sum, w) => sum + (w.final_amount || 0),
        0
      );
      const total = withdrawn + (data.wallet_balance || 0);

      setSummary({
        wallet: data.wallet,
        wallet_balance: data.wallet_balance || 0,
        withdrawals: data.withdrawals || [],
        total,
        withdrawn,
        withdrawable: data.wallet_balance || 0,
      });
    } catch (err) {
      console.error("Error fetching wallet summary:", err);
      alert("Failed to load wallet summary");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  // 🔹 Initial fetch
  useEffect(() => {
    if (token) fetchSummary();
  }, [token, fetchSummary]);

  // 🔹 Request OTP
  const requestOtp = async () => {
    if (!summary?.wallet) {
      setShowWalletPopup(true); // 🚨 show popup if no wallet bound
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
    <div style={{ color: "#E5E7EB" }}>
      <h2 style={{ marginBottom: "20px" }}>Withdrawal</h2>

      {/* Wallet Summary */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <h3>Total Earnings</h3>
          <p style={valueStyle}>${summary.total.toFixed(2)}</p>
        </div>
        <div style={cardStyle}>
          <h3>Withdrawn</h3>
          <p style={valueStyle}>${summary.withdrawn.toFixed(2)}</p>
        </div>
        <div style={cardStyle}>
          <h3>Withdrawable</h3>
          <p style={{ ...valueStyle, color: "#22C55E" }}>
            ${summary.withdrawable.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Withdraw Earnings */}
      {summary.withdrawable > 0 && !otpSent && (
        <button onClick={requestOtp} style={btnBlue}>
          Request Withdrawal
        </button>
      )}

      {/* OTP Confirmation */}
      {otpSent && (
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "10px",
            }}
          />
          <button
            onClick={confirmWithdrawal}
            disabled={withdrawing || !otp}
            style={btnGreen}
          >
            {withdrawing ? "Submitting..." : "Confirm Withdrawal"}
          </button>
        </div>
      )}

      {/* Wallet Binding Popup */}
      {showWalletPopup && (
        <div style={popupOverlay} onClick={() => setShowWalletPopup(false)}>
          <div style={popupBox} onClick={(e) => e.stopPropagation()}>
            <h3>🔗 Bind Your TRC20 Wallet</h3>
            <p style={{ fontSize: "14px", marginBottom: "10px" }}>
              You must bind a withdrawal wallet before requesting withdrawal.
            </p>
            <input
              type="text"
              placeholder="Enter TRC20 Wallet Address"
              value={newWallet}
              onChange={(e) => setNewWallet(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "10px",
              }}
            />
            <button onClick={saveWallet} style={btnGreen}>
              Save Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  flex: "1",
  padding: "15px",
  background: "#1F2937",
  borderRadius: "8px",
};

const valueStyle = {
  fontSize: "20px",
  marginTop: "10px",
};

const btnBlue = {
  marginBottom: "20px",
  padding: "10px 20px",
  border: "none",
  borderRadius: "6px",
  background: "#3B82F6",
  color: "#fff",
  cursor: "pointer",
};

const btnGreen = {
  padding: "10px 20px",
  border: "none",
  borderRadius: "6px",
  background: "#22C55E",
  color: "#fff",
  cursor: "pointer",
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
};

const popupBox = {
  background: "#1F2937",
  padding: "20px",
  borderRadius: "10px",
  maxWidth: "400px",
  width: "100%",
};
