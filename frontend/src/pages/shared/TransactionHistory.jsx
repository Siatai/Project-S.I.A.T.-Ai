import React, { useEffect, useState } from "react";
import axios from "axios";
import InvestorNavbar from "../investor/Navbar"; // ✅ Import Navbar

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  // 🔹 Apply global dark background + reset body (no bleed)
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "var(--fx-hero)";
    document.body.style.overflowX = "hidden";
  }, []);

  // Handle resize → detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch deposits + withdrawals
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        const [roiRes, withdrawalsRes] = await Promise.all([
          axios.get(`${API}/investor-roi-status`, { headers }),
          axios.get(`${API}/withdrawals/user`, { headers }),
        ]);

        const deposits = (roiRes.data.deposits || []).map((d) => ({
          type: "Deposit",
          amount: d.capital,
          date: new Date(d.timestamp),
          status: "confirmed",
          tx: d.tx_hash || "-",
        }));

        const withdrawals = (withdrawalsRes.data || []).map((w) => ({
          type: "Withdrawal",
          amount: w.final_amount,
          fee: w.fee,
          date: new Date(w.timestamp),
          status: w.status,
          tx: w.tx_hash || "-",
        }));

        const allTx = [...deposits, ...withdrawals].sort(
          (a, b) => b.date - a.date
        );
        setTransactions(allTx);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchHistory();
  }, [token]);

  const now = new Date();
  const filteredTx = transactions.filter((t) => {
    if (filter === "7d") return now - t.date <= 7 * 24 * 60 * 60 * 1000;
    if (filter === "30d") return now - t.date <= 30 * 24 * 60 * 60 * 1000;
    return true;
  });

  return (
    <div style={pageWrapper}>
      {/* ✅ Navbar */}
      <InvestorNavbar />

      <div style={contentWrapper}>
        <h2
          style={{
            marginBottom: "10px",
            fontFamily: "var(--fx-font-display)",
            color: "var(--fx-accent)",
          }}
        >
          Transaction History
        </h2>
        <div style={glowLine} />

        {/* Filters */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
          {[
            { key: "all", label: "All" },
            { key: "7d", label: "Last 7 Days" },
            { key: "30d", label: "Last 30 Days" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                background:
                  filter === btn.key
                    ? "linear-gradient(135deg, var(--fx-button), var(--fx-button-2))"
                    : "rgba(55,65,81,0.6)",
                color: filter === btn.key ? "var(--fx-bg)" : "var(--fx-ink)",
                boxShadow:
                  filter === btn.key
                    ? "0 0 12px rgba(var(--fx-accent-rgb),0.4)"
                    : "none",
                transition: "all 0.3s ease",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Table / Mobile Cards */}
        <div className="fx-table-wrap">
          {loading ? (
            <p style={{ padding: "20px" }}>Loading transactions...</p>
          ) : filteredTx.length === 0 ? (
            <p style={{ padding: "20px", color: "var(--fx-muted)" }}>
              No transactions found.
            </p>
          ) : isMobile ? (
            <div style={{ display: "grid", gap: "15px" }}>
              {filteredTx.map((t, i) => (
                <div key={i} style={mobileCard}>
                  <p>
                    <strong>Type:</strong> {t.type}
                  </p>
                  <p>
                    <strong>Amount:</strong> ${t.amount}
                  </p>
                  {t.fee && (
                    <p>
                      <strong>Fee:</strong> ${t.fee}
                    </p>
                  )}
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        color:
                          t.status === "pending"
                            ? "var(--fx-gold)"
                            : t.status === "approved" ||
                              t.status === "confirmed"
                            ? "var(--fx-accent)"
                            : "var(--fx-danger)",
                        fontWeight: "600",
                      }}
                    >
                      {t.status}
                    </span>
                  </p>
                  <p style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                    <strong>Tx:</strong> {t.tx}
                  </p>
                  <p>
                    <strong>Date:</strong> {t.date.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <table className="fx-table" style={tableStyle}>
              <thead>
                <tr style={{ background: "rgba(8, 10, 20, 0.7)" }}>
                  {["Type", "Amount", "Fee", "Status", "Tx Hash", "Date"].map(
                    (h, i) => (
                      <th key={i} style={thStyle}>
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((t, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--fx-border)" }}>
                    <td style={tdStyle}>{t.type}</td>
                    <td style={tdStyle}>${t.amount}</td>
                    <td style={tdStyle}>{t.fee ? `$${t.fee}` : "-"}</td>
                    <td
                      style={{
                        ...tdStyle,
                        color:
                          t.status === "pending"
                            ? "var(--fx-gold)"
                            : t.status === "approved" ||
                              t.status === "confirmed"
                            ? "var(--fx-accent)"
                            : "var(--fx-danger)",
                        fontWeight: "600",
                      }}
                    >
                      {t.status}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: "monospace" }}>
                      {t.tx}
                    </td>
                    <td style={tdStyle}>{t.date.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* === Styles === */
const pageWrapper = {
  background: "transparent", // dark page background
  color: "var(--fx-ink)",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const contentWrapper = {
  padding: "20px",
  paddingTop: "80px",    // space for fixed header
  paddingBottom: "60px", // space for fixed footer
};

const tableStyle = {
  width: "100%",
  minWidth: "700px",
};

const thStyle = {
  padding: "12px",
  textAlign: "left",
  fontSize: "14px",
  color: "var(--fx-muted)",
  fontWeight: "600",
  fontFamily: "var(--fx-font-body)",
};

const tdStyle = {
  padding: "12px",
  fontSize: "14px",
  color: "var(--fx-ink)",
  fontFamily: "var(--fx-font-body)",
};

const glowLine = {
  height: "2px",
  background: "linear-gradient(90deg, transparent, var(--fx-accent), transparent)",
  boxShadow: "0 0 10px var(--fx-accent)",
  margin: "8px 0 20px 0",
};

const mobileCard = {
  background: "var(--fx-card-strong)",
  borderRadius: "12px",
  padding: "15px",
  border: "1px solid var(--fx-border)",
  boxShadow: "var(--fx-shadow)",
};
