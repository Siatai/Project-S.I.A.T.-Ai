import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Withdrawal() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const API = "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("token");

  // Fetch wallet summary (ROI + commissions)
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/wallet/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching wallet summary:", err);
        alert("Failed to load wallet summary");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchSummary();
  }, [API, token]);

  // Request OTP
  const requestOtp = async () => {
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

  // Confirm Withdrawal
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

      // Refresh summary after withdrawal
      const updated = await axios.get(`${API}/wallet/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(updated.data);
    } catch (err) {
      console.error("Error withdrawing:", err);
      alert(err?.response?.data?.detail || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <p style={{ color: "#E5E7EB" }}>Loading wallet summary...</p>;
  if (!summary) return <p style={{ color: "#E5E7EB" }}>No wallet data available.</p>;

  return (
    <div style={{ color: "#E5E7EB" }}>
      <h2 style={{ marginBottom: "20px" }}>Withdrawal</h2>

      {/* Wallet Summary */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: "1", padding: "15px", background: "#1F2937", borderRadius: "8px" }}>
          <h3>Total Earnings</h3>
          <p style={{ fontSize: "20px", marginTop: "10px" }}>${summary.total}</p>
        </div>
        <div style={{ flex: "1", padding: "15px", background: "#1F2937", borderRadius: "8px" }}>
          <h3>Withdrawn</h3>
          <p style={{ fontSize: "20px", marginTop: "10px" }}>${summary.withdrawn}</p>
        </div>
        <div style={{ flex: "1", padding: "15px", background: "#1F2937", borderRadius: "8px" }}>
          <h3>Withdrawable</h3>
          <p style={{ fontSize: "20px", marginTop: "10px", color: "#22C55E" }}>
            ${summary.withdrawable}
          </p>
        </div>
      </div>

      {/* Withdraw Earnings */}
      {summary.withdrawable > 0 && !otpSent && (
        <button
          onClick={requestOtp}
          style={{
            marginBottom: "20px",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            background: "#3B82F6",
            color: "#fff",
            cursor: "pointer",
          }}
        >
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
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              background: "#22C55E",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {withdrawing ? "Submitting..." : "Confirm Withdrawal"}
          </button>
        </div>
      )}
    </div>
  );
}
