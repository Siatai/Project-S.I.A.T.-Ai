import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AssociateNavbar from "./AssociateNavbar"; //  Associate Navbar
import HudLoader from "../../Components/HudLoader";

export default function AssociateWithdrawal() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [message, setMessage] = useState(null);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  //  Force dark background on body
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "var(--fx-hero)";
    document.body.style.overflowX = "hidden";
  }, []);

  //  Fetch wallet summary
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

  //  Request OTP (Sat, Sun, and hidden Monday allowed)
  const requestOtp = async () => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, 6 = Saturday
    if (today !== 0 && today !== 1 && today !== 2 && today !== 3 && today !== 4 && today !== 5 && today !== 6) {
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

  //  Confirm withdrawal
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

  if (loading) return <HudLoader text="Loading withdrawal" />;

  return (
    <div style={pageWrapper}>
      <AssociateNavbar />

      <div style={wrapper} className="page-shell">
        <h2 style={headerTitle}>Withdrawal</h2>

        {/*  Total Earnings Card */}
        <div style={highlightCard}>
          <h3 style={cardTitle}>Total Earnings</h3>
          <p style={bigValue}>${summary.total.toFixed(2)}</p>
        </div>

        {/*  Main Balance Card */}
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
              <strong style={{ color: "var(--fx-gold)" }}>
                ${summary.pending.toFixed(2)}
              </strong>
            </div>
            <div style={miniRow}>
              <span>Deductions</span>
              <strong style={{ color: "var(--fx-danger)" }}>
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

        {/*  Withdrawals History */}
        <h3 style={subHeader}>Withdrawal History</h3>
        <div style={tableWrapper} className="withdraw-table">
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "44%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "28%" }} />
            </colgroup>
            <thead>
              <tr style={{ background: "rgba(8, 10, 20, 0.7)" }}>
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
                  <td style={{ ...tdStyle, whiteSpace: "normal", lineHeight: 1.2 }}>
                    {new Date(w.timestamp).toLocaleString()}
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>${w.final_amount}</td>
                  <td
                    style={{
                      ...tdStyle,
                      color:
                        w.status === "pending"
                          ? "var(--fx-gold)"
                          : w.status === "settled"
                          ? "var(--fx-accent)"
                          : "var(--fx-danger)",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
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

      <style>{`
        @media (max-width: 640px) {
          .page-shell {
            padding: 16px;
            padding-top: 72px;
            padding-bottom: 84px;
          }
          .withdraw-table {
            margin: 0 -6px;
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}

/* === Styles === */
const pageWrapper = {
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "var(--fx-hero)",
  color: "var(--fx-ink)",
};

const wrapper = {
  padding: "20px",
  marginTop: "80px",
  marginBottom: "70px",
  width: "100%",
  maxWidth: "1200px",
  boxSizing: "border-box",
};
const headerTitle = {
  fontFamily: "var(--fx-font-display)",
  color: "var(--fx-accent)",
  marginBottom: "16px",
  fontSize: "18px",
};
const highlightCard = {
  background: "var(--fx-card-strong)",
  padding: "20px",
  borderRadius: "14px",
  textAlign: "center",
  marginBottom: "20px",
  border: "1px solid var(--fx-border)",
  boxShadow: "var(--fx-shadow)",
};
const mainCard = {
  background: "var(--fx-card)",
  padding: "20px",
  borderRadius: "14px",
  marginBottom: "30px",
  border: "1px solid var(--fx-border)",
  boxShadow: "var(--fx-shadow)",
  textAlign: "center",
};
const cardTitle = { fontSize: "13px", color: "var(--fx-muted)", marginBottom: "8px" };
const bigValue = { fontSize: "24px", fontWeight: "700", color: "var(--fx-ink)" };
const bigValueTeal = { fontSize: "22px", fontWeight: "700", color: "var(--fx-accent)" };
const miniRows = { marginTop: "15px", textAlign: "left" };
const miniRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "6px",
  fontSize: "12px",
  color: "var(--fx-ink)",
};
const btnTeal = {
  marginTop: "15px",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  fontWeight: "700",
  background: "linear-gradient(135deg, var(--fx-button), var(--fx-button-2))",
  color: "var(--fx-bg)",
  cursor: "pointer",
  width: "100%",
  maxWidth: "320px",
};
const inputStyle = {
  width: "100%",
  maxWidth: "320px",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid var(--fx-border)",
  background: "rgba(8, 10, 20, 0.6)",
  color: "var(--fx-ink)",
  marginBottom: "12px",
};
const msgBox = (type) => ({
  marginTop: "10px",
  padding: "10px",
  borderRadius: "8px",
  background:
    type === "error" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
  border: `1px solid ${type === "error" ? "var(--fx-danger)" : "var(--fx-success)"}`,
  color: type === "error" ? "var(--fx-danger)" : "var(--fx-success-2)",
});
const subHeader = {
  marginBottom: "12px",
  marginTop: "20px",
  color: "var(--fx-accent)",
  fontWeight: "600",
  fontSize: "14px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  fontFamily: "var(--fx-font-display)",
};
const tableWrapper = {
  borderRadius: "12px",
  overflowX: "hidden",
  background: "var(--fx-card)",
  border: "1px solid var(--fx-border)",
  boxShadow: "var(--fx-shadow)",
};
const thStyle = {
  padding: "10px",
  textAlign: "left",
  fontSize: "11px",
  color: "var(--fx-muted)",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  fontFamily: "var(--fx-font-display)",
};
const rowStyle = { borderBottom: "1px solid var(--fx-border)" };
const tdStyle = {
  padding: "10px",
  fontSize: "10px",
  color: "var(--fx-ink)",
  fontFamily: "var(--fx-font-body)",
  wordBreak: "break-word",
  verticalAlign: "top",
};
