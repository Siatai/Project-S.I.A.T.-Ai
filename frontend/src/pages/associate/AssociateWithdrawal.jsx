import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AssociateNavbar from "./AssociateNavbar"; // ✅ Associate Navbar

export default function AssociateWithdrawal() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [message, setMessage] = useState(null);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  // ✅ Force dark background on body
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "#0f172a";
    document.body.style.overflowX = "hidden";
  }, []);

  // 🔹 Fetch wallet summary
  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/wallet/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;

      const settled = data.withdrawals.filter((w) => w.status === "settled");
      const pending = data.withdrawals.filter((w) => w.status === "pending");

      const totalEarnings =
        (data.wallet_balance || 0) +
        data.withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

      const withdrawn = settled.reduce(
        (sum, w) => sum + (w.final_amount || 0),
        0
      );
      const pendingAmt = pending.reduce((sum, w) => sum + (w.amount || 0), 0);
      const deductions = settled.reduce(
        (sum, w) => sum + ((w.amount || 0) - (w.final_amount || 0)),
        0
      );

      setSummary({
        wallet_balance: data.wallet_balance || 0,
        total: totalEarnings,
        withdrawn,
        pending: pendingAmt,
        withdrawable: data.wallet_balance || 0,
        deductions,
        withdrawals: data.withdrawals || [],
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

  // 🔹 Request OTP (Sat, Sun, and hidden Monday allowed)
  const requestOtp = async () => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, 6 = Saturday
    if (today !== 0 && today !== 1 && today !== 6) {
      return setMessage({
        type: "error",
        text: "Withdrawals are allowed only on Saturday and Sunday.",
      });
    }

    if (summary.withdrawable < 20) {
      return setMessage({ type: "error", text: "Minimum withdrawal is $20." });
    }

    try {
      await axios.post(
        `${API}/send-otp-withdrawal`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtpSent(true);
      setMessage({ type: "success", text: "OTP sent to your email." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.detail || "Failed to send OTP",
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
      setMessage({ type: "success", text: res.data.message });
      setOtp("");
      setOtpSent(false);
      fetchSummary();
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.detail || "Withdrawal failed",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <p style={{ color: "#E5E7EB" }}>Loading...</p>;

  return (
    <div style={pageWrapper}>
      <AssociateNavbar />

      <div style={wrapper}>
        <h2 style={headerTitle}>Withdrawal</h2>

        {/* 🔹 Total Earnings Card */}
        <div style={highlightCard}>
          <h3 style={cardTitle}>Total Earnings</h3>
          <p style={bigValue}>${summary.total.toFixed(2)}</p>
        </div>

        {/* 🔹 Main Balance Card */}
        <div style={mainCard}>
          <h3 style={cardTitle}>Withdrawable Balance</h3>
          <p style={bigValueTeal}>${summary.withdrawable.toFixed(2)}</p>

          <div style={miniRows}>
            <div style={miniRow}>
              <span>Withdrawn</span>
              <strong>${summary.withdrawn.toFixed(2)}</strong>
            </div>
            <div style={miniRow}>
              <span>Pending</span>
              <strong style={{ color: "#FACC15" }}>
                ${summary.pending.toFixed(2)}
              </strong>
            </div>
            <div style={miniRow}>
              <span>Deductions</span>
              <strong style={{ color: "#EF4444" }}>
                -${summary.deductions.toFixed(2)}
              </strong>
            </div>
          </div>

          {message && <div style={msgBox(message.type)}>{message.text}</div>}

          {!otpSent ? (
            <button style={btnTeal} onClick={requestOtp}>
              Request Withdrawal
            </button>
          ) : (
            <div style={{ marginTop: "20px" }}>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={inputStyle}
              />
              <button
                style={btnTeal}
                onClick={confirmWithdrawal}
                disabled={!otp}
              >
                {withdrawing ? "Submitting..." : "Confirm Withdrawal"}
              </button>
            </div>
          )}
        </div>

        {/* 🔹 Withdrawals History */}
        <h3 style={subHeader}>Withdrawal History</h3>
        <div style={tableWrapper}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(31,41,55,0.9)" }}>
                {["Date", "Amount", "Status"].map((h, i) => (
                  <th key={i} style={thStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.withdrawals.map((w, idx) => (
                <tr key={idx} style={rowStyle}>
                  <td style={tdStyle}>
                    {new Date(w.timestamp).toLocaleString()}
                  </td>
                  <td style={tdStyle}>${w.final_amount}</td>
                  <td
                    style={{
                      ...tdStyle,
                      color:
                        w.status === "pending"
                          ? "#FACC15"
                          : w.status === "settled"
                          ? "#17E8E5"
                          : "#EF4444",
                      fontWeight: "600",
                    }}
                  >
                    {w.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* === Styles === */
const pageWrapper = {
  background: "#0f172a",
  minHeight: "100vh",
  width: "100%",
  overflowX: "hidden",
  color: "#E5E7EB",
};

const wrapper = { padding: "20px", marginTop: "80px", marginBottom: "70px" };
const headerTitle = {
  fontFamily: "Orbitron, sans-serif",
  color: "#17E8E5",
  marginBottom: "20px",
};
const highlightCard = {
  background: "linear-gradient(145deg,#1E293B,#0F172A)",
  padding: "20px",
  borderRadius: "14px",
  textAlign: "center",
  marginBottom: "20px",
  boxShadow: "0 0 20px rgba(23,232,229,0.2)",
};
const mainCard = {
  background: "rgba(17,24,39,0.9)",
  padding: "20px",
  borderRadius: "14px",
  marginBottom: "30px",
  boxShadow: "0 0 15px rgba(23,232,229,0.2)",
  textAlign: "center",
};
const cardTitle = { fontSize: "15px", color: "#94A3AF", marginBottom: "10px" };
const bigValue = { fontSize: "28px", fontWeight: "700", color: "#E5E7EB" };
const bigValueTeal = { fontSize: "26px", fontWeight: "700", color: "#17E8E5" };
const miniRows = { marginTop: "15px", textAlign: "left" };
const miniRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "6px",
  fontSize: "14px",
  color: "#E5E7EB",
};
const btnTeal = {
  marginTop: "15px",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  fontWeight: "700",
  background: "linear-gradient(135deg,#17E8E5,#14B8E5)",
  color: "#0B1220",
  cursor: "pointer",
  width: "100%",
  maxWidth: "320px",
};
const inputStyle = {
  width: "100%",
  maxWidth: "320px",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "#E5E7EB",
  marginBottom: "12px",
};
const msgBox = (type) => ({
  marginTop: "10px",
  padding: "10px",
  borderRadius: "8px",
  background:
    type === "error" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
  border: `1px solid ${type === "error" ? "#EF4444" : "#10B981"}`,
  color: type === "error" ? "#F87171" : "#34D399",
});
const subHeader = {
  marginBottom: "12px",
  marginTop: "20px",
  color: "#17E8E5",
  fontWeight: "600",
};
const tableWrapper = {
  borderRadius: "12px",
  overflowX: "auto",
  background: "rgba(17,24,39,0.8)",
  boxShadow: "0 0 12px rgba(23,232,229,0.15)",
};
const thStyle = {
  padding: "12px",
  textAlign: "left",
  fontSize: "14px",
  color: "#9CA3AF",
};
const rowStyle = { borderBottom: "1px solid rgba(255,255,255,0.05)" };
const tdStyle = {
  padding: "12px",
  fontSize: "14px",
  color: "#E5E7EB",
  fontFamily: "Inter, sans-serif",
};
