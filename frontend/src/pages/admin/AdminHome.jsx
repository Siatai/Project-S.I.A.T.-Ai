import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const API = "https://project-s-i-a-t-ai.onrender.com";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <p style={{ color: "var(--fx-ink)" }}>Loading admin dashboard...</p>;

  return (
    <div style={{ color: "var(--fx-ink)", padding: "20px" }}>
      <h2>📊 Admin Dashboard</h2>

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "15px",
        }}
      >
        <div
          style={{
            padding: "15px",
            borderRadius: "8px",
            background: "var(--fx-card)",
            border: "1px solid var(--fx-border)",
            boxShadow: "var(--fx-shadow)",
          }}
        >
          <h3>Total Users</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>{stats.total_users}</p>
        </div>

        <div
          style={{
            padding: "15px",
            borderRadius: "8px",
            background: "var(--fx-card)",
            border: "1px solid var(--fx-border)",
            boxShadow: "var(--fx-shadow)",
          }}
        >
          <h3>Total Deposits</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            {stats.total_deposits} USDT
          </p>
        </div>

        <div
          style={{
            padding: "15px",
            borderRadius: "8px",
            background: "var(--fx-card)",
            border: "1px solid var(--fx-border)",
            boxShadow: "var(--fx-shadow)",
          }}
        >
          <h3>Total Withdrawals</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            {stats.total_withdrawals} USDT
          </p>
        </div>

        <div
          style={{
            padding: "15px",
            borderRadius: "8px",
            background: "var(--fx-card)",
            border: "1px solid var(--fx-border)",
            boxShadow: "var(--fx-shadow)",
          }}
        >
          <h3>Total Commissions</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            {stats.total_commissions} USDT
          </p>
        </div>
      </div>
    </div>
  );
}
