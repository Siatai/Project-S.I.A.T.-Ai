import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Commissions() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  // Decode email from JWT
  let email = "";
  if (token) {
    try {
      email = JSON.parse(atob(token.split(".")[1])).email;
    } catch (e) {
      console.error("Error decoding token:", e);
    }
  }

  // Fetch referral income summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/get-referral-income`, {
          params: { email },
        });
        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching referral income:", err);
      } finally {
        setLoading(false);
      }
    };
    if (email) fetchSummary();
  }, [email]); // ✅ no warning now

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
      setLoading(true);
      const updated = await axios.get(`${API}/get-referral-income`, {
        params: { email },
      });
      setSummary(updated.data);
      setLoading(false);
    } catch (err) {
      console.error("Error withdrawing:", err);
      alert(err?.response?.data?.detail || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <p style={{ color: "#E5E7EB" }}>Loading commissions...</p>;
  if (!summary) return <p style={{ color: "#E5E7EB" }}>No commission data available.</p>;

  return (
    <div style={{ color: "#E5E7EB" }}>
      <h2 style={{ marginBottom: "20px" }}>My Commissions</h2>

      {/* Summary */}
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

      {/* Detailed Breakdown */}
      <h3>Referral Details</h3>
      {summary.details.length === 0 ? (
        <p>No referrals yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ background: "#1F2937", color: "#E5E7EB" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>Referred User</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Investment</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Date</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Earning</th>
            </tr>
          </thead>
          <tbody>
            {summary.details.map((d, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #374151" }}>
                <td style={{ padding: "10px" }}>{d.name}</td>
                <td style={{ padding: "10px" }}>${d.amount}</td>
                <td style={{ padding: "10px" }}>{d.date}</td>
                <td style={{ padding: "10px", color: "#22C55E" }}>${d.earning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
