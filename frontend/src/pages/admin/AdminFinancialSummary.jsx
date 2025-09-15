import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminFinancialSummary() {
  const [summary, setSummary] = useState(null);
  const API = "https://project-s-i-a-t-ai.onrender.com";

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(`${API}/admin/financial-summary`, { headers });
        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching summary:", err);
      }
    };

    fetchSummary();
  }, []);

  if (!summary) return <p style={{ color: "#E5E7EB" }}>Loading...</p>;

  return (
    <div style={{ padding: "20px", color: "#E5E7EB" }}>
      <h2>📊 Financial Summary</h2>

      {/* Investors */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          borderRadius: "8px",
          background: "#1E293B",
          maxWidth: "700px",
        }}
      >
        <h3>👤 Investors</h3>
        <p><strong>Total Deposits:</strong> {summary.investors.total_deposits} USDT</p>
      </div>

      {/* Associates */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          borderRadius: "8px",
          background: "#1E293B",
          maxWidth: "700px",
        }}
      >
        <h3>🤝 Associates</h3>
        <p><strong>Total Deposits:</strong> {summary.associates.total_deposits} USDT</p>
        <p><strong>Locked:</strong> {summary.associates.locked} USDT</p>
        <p><strong>Matured:</strong> {summary.associates.matured} USDT</p>
        <p><strong>Withdrawn/Reinvested:</strong> {summary.associates.withdrawn_or_reinvested} USDT</p>
      </div>

      {/* Global */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          borderRadius: "8px",
          background: "#111827",
          maxWidth: "900px",
        }}
      >
        <h3>🌍 Global</h3>
        <p><strong>Total Deposits:</strong> {summary.global.total_deposits} USDT</p>
        <p><strong>Total Withdrawals:</strong> {summary.global.total_withdrawals} USDT</p>
        <p><strong>Total Commissions:</strong> {summary.global.total_commissions} USDT</p>
        <p><strong>Wallet Balances:</strong> {summary.global.wallet_balances} USDT</p>
      </div>
    </div>
  );
}
