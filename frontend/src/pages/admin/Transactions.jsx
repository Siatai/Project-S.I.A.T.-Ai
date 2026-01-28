import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { formatAmount } from "../../utils/format";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

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
    <div style={{ color: "var(--fx-ink)" }}>
      <h2 style={{ marginBottom: "20px" }}>Transactions</h2>

      {loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div className="fx-table-wrap">
          <table className="fx-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.type}</td>
                <td>${formatAmount(t.amount)}</td>
                <td>
                  {new Date(t.date).toLocaleString()}
                </td>
                <td
                  style={{
                    color:
                      t.status === "pending"
                        ? "var(--fx-gold)"
                        : t.status === "approved" || t.status === "confirmed"
                        ? "var(--fx-success)"
                        : "var(--fx-danger)",
                  }}
                >
                  {t.status}
                </td>
                <td>{t.tx_hash}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
