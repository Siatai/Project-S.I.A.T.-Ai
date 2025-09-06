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

  if (!stats) return <p style={{ color: "#E5E7EB" }}>Loading admin dashboard...</p>;

  return (
    <div style={{ color: "#E5E7EB" }}>
      <h2>Admin Dashboard</h2>
      <div style={{ marginTop: 20 }}>
        <p>Total Users: {stats.total_users}</p>
        <p>Total Deposits: ${stats.total_deposits}</p>
        <p>Total Withdrawals: ${stats.total_withdrawals}</p>
      </div>
    </div>
  );
}
