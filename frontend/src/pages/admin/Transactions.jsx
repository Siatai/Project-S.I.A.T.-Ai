import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Fetch both deposits + withdrawals
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);

      // Get deposits
      const invRes = await axios.get(`${API}/investments`, {
        params: { email },
        headers: { Authorization: `Bearer ${token}` },
      });

      // Get withdrawals
      const wRes = await axios.get(`${API}/withdrawals/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Normalize deposits
      const deposits = (invRes.data || []).map((i) => ({
        id: `dep-${i.id}`,
        type: "Deposit",
        amount: i.amount,
        date: i.timestamp,
        status: "confirmed",
        tx_hash: i.tx_hash || "-",
      }));

      // Normalize withdrawals
      const withdrawals = (wRes.data || []).map((w) => ({
        id: `wd-${w.id}`,
        type: "Withdrawal",
        amount: w.final_amount,
        date: w.timestamp,
        status: w.status,
        tx_hash: w.tx_hash || "-",
      }));

      // Merge & sort by date
      const merged = [...deposits, ...withdrawals].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setTransactions(merged);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      alert("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [API, token, email]);

  useEffect(() => {
    if (email) fetchTransactions();
  }, [fetchTransactions, email]);

  return (
    <div style={{ color: "#E5E7EB" }}>
      <h2 style={{ marginBottom: "20px" }}>Transaction History</h2>

      {loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1F2937", color: "#E5E7EB" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>Type</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Amount</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Date</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #374151" }}>
                <td style={{ padding: "10px" }}>{t.type}</td>
                <td style={{ padding: "10px" }}>${t.amount}</td>
                <td style={{ padding: "10px" }}>
                  {new Date(t.date).toLocaleString()}
                </td>
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
                <td style={{ padding: "10px" }}>{t.tx_hash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
