import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const API = "http://127.0.0.1:8000/api";
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

  // Fetch deposits + withdrawals
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);

        const [depositsRes, withdrawalsRes] = await Promise.all([
          axios.get(`${API}/investments`, { params: { email } }),
          axios.get(`${API}/withdrawals/user`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const deposits = depositsRes.data.map((d) => ({
          type: "Deposit",
          amount: d.amount,
          date: new Date(d.timestamp),
          status: "confirmed",
          tx: d.tx_hash || "-",
        }));

        const withdrawals = withdrawalsRes.data.map((w) => ({
          type: "Withdrawal",
          amount: w.final_amount,
          fee: w.fee,
          date: new Date(w.timestamp),
          status: w.status,
          tx: w.tx_hash || "-",
        }));

        // Merge and sort
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

    if (email) fetchHistory();
  }, [email, token]);

  // Filter transactions
  const now = new Date();
  const filteredTx = transactions.filter((t) => {
    if (filter === "7d") {
      return now - t.date <= 7 * 24 * 60 * 60 * 1000;
    }
    if (filter === "30d") {
      return now - t.date <= 30 * 24 * 60 * 60 * 1000;
    }
    return true; // all
  });

  return (
    <div style={{ color: "#E5E7EB" }}>
      <h2 style={{ marginBottom: "20px" }}>Transaction History</h2>

      {/* Filters */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            marginRight: "10px",
            padding: "6px 12px",
            border: "none",
            borderRadius: "4px",
            background: filter === "all" ? "#3B82F6" : "#374151",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          All
        </button>
        <button
          onClick={() => setFilter("7d")}
          style={{
            marginRight: "10px",
            padding: "6px 12px",
            border: "none",
            borderRadius: "4px",
            background: filter === "7d" ? "#3B82F6" : "#374151",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setFilter("30d")}
          style={{
            padding: "6px 12px",
            border: "none",
            borderRadius: "4px",
            background: filter === "30d" ? "#3B82F6" : "#374151",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Last 30 Days
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading transactions...</p>
      ) : filteredTx.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1F2937", color: "#E5E7EB" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>Type</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Amount</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Fee</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Tx Hash</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTx.map((t, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #374151" }}>
                <td style={{ padding: "10px" }}>{t.type}</td>
                <td style={{ padding: "10px" }}>${t.amount}</td>
                <td style={{ padding: "10px" }}>{t.fee ? `$${t.fee}` : "-"}</td>
                <td
                  style={{
                    padding: "10px",
                    color:
                      t.status === "pending"
                        ? "#FACC15"
                        : t.status === "approved" || t.status === "confirmed"
                        ? "#22C55E"
                        : "#EF4444",
                  }}
                >
                  {t.status}
                </td>
                <td style={{ padding: "10px", fontFamily: "monospace" }}>
                  {t.tx}
                </td>
                <td style={{ padding: "10px" }}>
                  {t.date.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
