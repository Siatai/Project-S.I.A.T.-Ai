import React, { useEffect, useState } from "react";
import axios from "axios";
import AssociateNavbar from "./AssociateNavbar"; //  Navbar for associates
import HudLoader from "../../Components/HudLoader";

export default function AssociateHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  //  Force dark background
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "var(--fx-hero)";
    document.body.style.overflowX = "hidden";
  }, []);

  // Handle resize
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
        console.error("Error fetching associate history:", err);
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
      <AssociateNavbar />

      <div style={mainContent} className="page-shell">
        <h2 style={headerTitle}>Transaction History</h2>
        <div style={glowLine} />

        {/* Filters */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All" },
            { key: "7d", label: "Last 7 Days" },
            { key: "30d", label: "Last 30 Days" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              style={{
                padding: "7px 14px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "11px",
                fontFamily: "var(--fx-font-display)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
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
        <div>
          {loading ? (
            <HudLoader text="Loading history" />
          ) : filteredTx.length === 0 ? (
            <p style={{ padding: "20px", color: colors.textSecondary }}>
              No transactions found.
            </p>
          ) : isMobile ? (
            // Mobile  Card View
            <div style={{ display: "grid", gap: "15px" }}>
              {filteredTx.map((t, i) => (
                <div key={i} style={mobileCard}>
                  <p>
                    <strong style={{ color: colors.textSecondary }}>
                      Type:
                    </strong>{" "}
                    <span style={{ color: colors.textPrimary }}>{t.type}</span>
                  </p>
                  <p>
                    <strong style={{ color: colors.textSecondary }}>
                      Amount:
                    </strong>{" "}
                    <span style={{ color: colors.accentCyan }}>
                      ${t.amount}
                    </span>
                  </p>
                  {t.fee && (
                    <p>
                      <strong style={{ color: colors.textSecondary }}>
                        Fee:
                      </strong>{" "}
                      <span style={{ color: colors.textPrimary }}>
                        ${t.fee}
                      </span>
                    </p>
                  )}
                  <p>
                    <strong style={{ color: colors.textSecondary }}>
                      Status:
                    </strong>{" "}
                    <span
                      style={{
                        color:
                          t.status === "pending"
                            ? colors.accentYellow
                            : t.status === "confirmed"
                            ? colors.accentCyan
                            : colors.accentRed,
                        fontWeight: "600",
                      }}
                    >
                      {t.status}
                    </span>
                  </p>
                  <p
                    style={{
                      fontFamily: "monospace",
                      color: colors.textSecondary,
                      wordBreak: "break-all",
                    }}
                  >
                    <strong>Tx:</strong> {t.tx}
                  </p>
                  <p style={{ fontSize: "12px", letterSpacing: "0.02em" }}>
                    <strong style={{ color: colors.textSecondary }}>
                      Date:
                    </strong>{" "}
                    <span style={{ color: colors.textPrimary, whiteSpace: "nowrap" }}>
                      {t.date.toLocaleString()}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            // Desktop  Table View
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
                  <tr key={i} style={rowStyle}>
                    <td style={tdStyle}>{t.type}</td>
                    <td style={{ ...tdStyle, color: colors.accentCyan }}>
                      ${t.amount}
                    </td>
                    <td style={tdStyle}>{t.fee ? `$${t.fee}` : "-"}</td>
                    <td
                      style={{
                        ...tdStyle,
                        color:
                          t.status === "pending"
                            ? colors.accentYellow
                            : t.status === "confirmed"
                            ? colors.accentCyan
                            : colors.accentRed,
                        fontWeight: "600",
                      }}
                    >
                      {t.status}
                    </td>
                    <td
                      style={{ ...tdStyle, fontFamily: "monospace", color: colors.textSecondary }}
                    >
                      {t.tx}
                    </td>
                    <td style={{ ...tdStyle, color: colors.textPrimary }}>
                      {t.date.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .page-shell {
            padding: 16px;
            padding-top: 72px;
            padding-bottom: 84px;
          }
          .fx-table-wrap {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}

/* === Styles & Colors === */
const colors = {
  textPrimary: "var(--fx-ink)",
  textSecondary: "var(--fx-muted)",
  accentCyan: "var(--fx-accent)",
  accentYellow: "var(--fx-gold)",
  accentRed: "var(--fx-danger)",
};

const pageWrapper = {
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "var(--fx-hero)",
  color: "var(--fx-ink)",
  padding: "0 16px",
  boxSizing: "border-box",
  overflowX: "hidden",
};

const mainContent = {
  padding: "20px",
  marginTop: "80px",
  marginBottom: "70px",
  width: "100%",
  maxWidth: "1200px",
  boxSizing: "border-box",
};

const headerTitle = {
  marginBottom: "10px",
  fontFamily: "var(--fx-font-display)",
  color: "var(--fx-accent)",
  fontSize: "18px",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
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
  padding: "14px",
  border: "1px solid var(--fx-border)",
  boxShadow: "var(--fx-shadow)",
  fontSize: "14px",
  lineHeight: 1.5,
};

const tableStyle = {
  width: "100%",
  tableLayout: "fixed",
};

const thStyle = {
  padding: "12px",
  textAlign: "left",
  fontSize: "14px",
  color: colors.textSecondary,
  fontWeight: "600",
  fontFamily: "var(--fx-font-body)",
};

const rowStyle = { borderBottom: "1px solid var(--fx-border)" };

const tdStyle = {
  padding: "12px",
  fontSize: "14px",
  color: colors.textPrimary,
  fontFamily: "var(--fx-font-body)",
  wordBreak: "break-word",
  whiteSpace: "normal",
};
