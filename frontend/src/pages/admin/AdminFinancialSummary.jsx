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

      {/* Totals */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          borderRadius: "8px",
          background: "#1E293B",
          maxWidth: "700px",
        }}
      >
        <p><strong>Total Deposits:</strong> {summary.total_deposits} USDT</p>
        <p><strong>Total Commission Paid:</strong> {summary.total_commissions} USDT</p>
        <p><strong>Total ROI Distributed:</strong> {summary.total_roi_distributed} USDT</p>
      </div>

      {/* User Payout List */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          borderRadius: "8px",
          background: "#111827",
          maxWidth: "900px",
        }}
      >
        <h3>User Payouts</h3>
        <table style={{ width: "100%", marginTop: "10px", fontSize: "14px" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #374151" }}>
              <th style={{ padding: "6px" }}>Name</th>
              <th style={{ padding: "6px" }}>Email</th>
              <th style={{ padding: "6px" }}>Wallet</th>
              <th style={{ padding: "6px" }}>Balance (USDT)</th>
            </tr>
          </thead>
          <tbody>
            {summary.user_payouts.map((u, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #374151" }}>
                <td style={{ padding: "6px" }}>{u.name || "-"}</td>
                <td style={{ padding: "6px" }}>{u.email}</td>
                <td style={{ padding: "6px" }}>{u.wallet || "Not set"}</td>
                <td style={{ padding: "6px" }}>{u.wallet_balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
