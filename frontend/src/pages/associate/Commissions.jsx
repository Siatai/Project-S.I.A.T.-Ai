import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Commissions() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

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
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching referral income:", err);
      } finally {
        setLoading(false);
      }
    };

    if (email) fetchSummary();
  }, [email, token]);

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

      // Refresh summary
      const updated = await axios.get(`${API}/get-referral-income`, {
        params: { email },
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

  // Group details by date
  const groupedByDate = summary
    ? summary.details.reduce((acc, d) => {
        if (!acc[d.date]) acc[d.date] = [];
        acc[d.date].push(d);
        return acc;
      }, {})
    : {};

  if (loading) return <p style={{ color: "#E5E7EB" }}>Loading commissions...</p>;
  if (!summary) return <p style={{ color: "#E5E7EB" }}>No commission data available.</p>;

  return (
    <div style={{ color: "#E5E7EB" }}>
      <h2 style={{ marginBottom: "20px" }}>My Commissions</h2>

      {/* Summary Cards */}
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

      {/* Referral Details grouped by date */}
      <h3>Referral Earnings by Date</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr style={{ background: "#1F2937", color: "#E5E7EB" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>Date</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Total Earnings</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedByDate).map(([date, records], i) => {
            const totalForDay = records.reduce((sum, r) => sum + r.commission, 0);
            return (
              <tr key={i} style={{ borderBottom: "1px solid #374151" }}>
                <td style={{ padding: "10px" }}>{date}</td>
                <td style={{ padding: "10px", color: "#22C55E" }}>${totalForDay.toFixed(2)}</td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  <button
                    onClick={() => setSelectedDate({ date, records })}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: "#3B82F6",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ℹ️ Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Popup for details */}
      {selectedDate && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setSelectedDate(null)}
        >
          <div
            style={{
              background: "#1F2937",
              padding: "20px",
              borderRadius: "10px",
              maxWidth: "600px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "15px" }}>Details for {selectedDate.date}</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#374151", color: "#E5E7EB" }}>
                  <th style={{ padding: "8px", textAlign: "left" }}>Referred User</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Investment</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Earning</th>
                </tr>
              </thead>
              <tbody>
                {selectedDate.records.map((r, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #2D3748" }}>
                    <td style={{ padding: "8px" }}>{r.name || r.investor}</td>
                    <td style={{ padding: "8px" }}>${r.roi_source}</td>
                    <td style={{ padding: "8px", color: "#22C55E" }}>${r.commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => setSelectedDate(null)}
              style={{
                marginTop: "15px",
                padding: "8px 16px",
                border: "none",
                borderRadius: "6px",
                background: "#EF4444",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
