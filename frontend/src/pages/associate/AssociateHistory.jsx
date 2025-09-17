import React, { useEffect, useState } from "react";
import axios from "axios";
import AssociateNavbar from "./AssociateNavbar"; // ✅ Navbar for associates

export default function AssociateHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

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

        // Map deposits
        const deposits = (roiRes.data.deposits || []).map((d) => ({
          type: "Deposit",
          amount: d.capital,
          date: new Date(d.timestamp),
          status: "confirmed",
          tx: d.tx_hash || "-",
        }));

        // Map withdrawals
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
    <div style={{ color: "#E5E7EB" }}>
      {/* ✅ Associate Navbar */}
      <AssociateNavbar />

      <div style={{ padding: "20px", marginTop: "5px", marginBottom: "70px" }}>
        <h2
          style={{
            marginBottom: "10px",
            fontFamily: "Orbitron, sans-serif",
            color: "#17E8E5",
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
                    ? "linear-gradient(135deg,#17E8E5,#14B8E5)"
                    : "rgba(55,65,81,0.6)",
                color: filter === btn.key ? "#0B1220" : "#E5E7EB",
                boxShadow:
                  filter === btn.key
                    ? "0 0 12px rgba(23,232,229,0.4)"
                    : "none",
                transition: "all 0.3s ease",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Table / Mobile Cards */}
        <div
          style={{
            background: "rgba(17,24,39,0.85)",
            backdropFilter: "blur(8px)",
            borderRadius: "12px",
            boxShadow: "0 0 18px rgba(23,232,229,0.2)",
            overflowX: "auto",
            maxWidth: "100%",
            padding: isMobile ? "10px" : "0",
          }}
        >
          {loading ? (
            <p style={{ padding: "20px" }}>Loading transactions...</p>
          ) : filteredTx.length === 0 ? (
            <p style={{ padding: "20px", color: "#9CA3AF" }}>
              No transactions found.
            </p>
          ) : isMobile ? (
            // Mobile → Card View
            <div style={{ display: "grid", gap: "15px" }}>
              {filteredTx.map((t, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(31,41,55,0.9)",
                    borderRadius: "12px",
                    padding: "15px",
                    boxShadow: "0 0 12px rgba(23,232,229,0.2)",
                  }}
                >
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
                            ? "#FACC15"
                            : t.status === "approved" ||
                              t.status === "confirmed"
                            ? "#17E8E5"
                            : "#EF4444",
                        fontWeight: "600",
                      }}
                    >
                      {t.status}
                    </span>
                  </p>
                  <p
                    style={{ fontFamily: "monospace", wordBreak: "break-all" }}
                  >
                    <strong>Tx:</strong> {t.tx}
                  </p>
                  <p>
                    <strong>Date:</strong> {t.date.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            // Desktop → Table View
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "700px",
              }}
            >
              <thead>
                <tr style={{ background: "rgba(31,41,55,0.9)" }}>
                  {["Type", "Amount", "Fee", "Status", "Tx Hash", "Date"].map(
                    (h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "14px",
                          color: "#9CA3AF",
                          fontWeight: "600",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((t, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <td style={tdStyle}>{t.type}</td>
                    <td style={tdStyle}>${t.amount}</td>
                    <td style={tdStyle}>{t.fee ? `$${t.fee}` : "-"}</td>
                    <td
                      style={{
                        ...tdStyle,
                        color:
                          t.status === "pending"
                            ? "#FACC15"
                            : t.status === "approved" ||
                              t.status === "confirmed"
                            ? "#17E8E5"
                            : "#4fef44ff",
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

const tdStyle = {
  padding: "12px",
  fontSize: "14px",
  color: "#E5E7EB",
  fontFamily: "Inter, sans-serif",
};

const glowLine = {
  height: "2px",
  background: "linear-gradient(90deg, transparent, #17E8E5, transparent)",
  boxShadow: "0 0 10px #17E8E5",
  margin: "8px 0 20px 0",
};
