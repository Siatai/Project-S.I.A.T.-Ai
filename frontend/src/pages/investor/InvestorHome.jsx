import React, { useState, useEffect } from "react";
import axios from "axios";

export default function InvestorHome() {
  const [applied, setApplied] = useState(false);
  const [isAssociate, setIsAssociate] = useState(false);
  const [user, setUser] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const API = "https://project-s-i-a-t-ai.onrender.com";

  // 🔹 Fetch user and deposits
  useEffect(() => {
    const fetchUserAndDeposits = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        // Get user info
        const res = await axios.get(`${API}/me`, { headers });
        setUser(res.data);

        if (res.data.is_associate) setIsAssociate(true);
        if (res.data.pending_associate) setApplied(true);

        // Get deposits
        if (res.data.email) {
          const depRes = await axios.get(
            `${API}/investments?email=${res.data.email}`,
            { headers }
          );
          setDeposits(depRes.data);

          // Calculate total
          const total = depRes.data.reduce(
            (sum, d) => sum + Number(d.amount),
            0
          );
          setTotalDeposits(total);
        }
      } catch (err) {
        console.error("Error fetching investor data:", err);
      }
    };

    fetchUserAndDeposits();
  }, []);

  // 🔹 Apply for associate
  const applyForAssociate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/request-associate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApplied(true);
      alert("Request sent to admin for approval.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Something went wrong");
    }
  };

  if (!user) return <p style={{ color: "#E5E7EB" }}>Loading...</p>;

  return (
    <div style={{ color: "#E5E7EB", padding: "20px" }}>
      <h2
        style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "22px",
          color: "#17E8E5",
        }}
      >
        Welcome, Investor
      </h2>
      <div style={glowLine} />
      <p style={{ marginTop: 10, color: "#9CA3AF" }}>
        You can deposit funds, withdraw profits, and track your ROI here.
      </p>

      {/* ✅ My Deposits */}
      <div style={cardStyle}>
        <h3
          style={{
            marginBottom: "10px",
            fontSize: "18px",
            fontWeight: "600",
            color: "#17E8E5",
          }}
        >
          💰 My Deposits
        </h3>
        <div style={glowLine} />

        {/* Total Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            fontWeight: "600",
            fontSize: "15px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span>Total Deposits</span>
          <span style={{ color: "#17E8E5" }}>{totalDeposits} USDT</span>
        </div>

        {/* Deposit List */}
        {deposits.length === 0 ? (
          <p style={{ color: "#9CA3AF", marginTop: "12px" }}>No deposits yet</p>
        ) : (
          deposits.map((d, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                padding: "8px 0",
                fontSize: "14px",
              }}
            >
              <span>{d.amount} USDT</span>
              <span>{new Date(d.timestamp).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>

      {/* ✅ Associate Status / Button */}
      <div style={{ marginTop: 40, textAlign: "center" }}>
        {isAssociate ? (
          <p style={{ color: "#4ADE80", fontWeight: "600" }}>
            🎉 Welcome, <strong>Associate</strong>! You now have referral access.
          </p>
        ) : !applied ? (
          <button onClick={applyForAssociate} style={btnTeal}>
            Apply to become Associate
          </button>
        ) : (
          <p style={{ color: "#FACC15", fontWeight: "600" }}>
            ⏳ Pending approval from Admin...
          </p>
        )}
      </div>
    </div>
  );
}

/* === Styles === */
const cardStyle = {
  marginTop: 30,
  padding: "20px",
  borderRadius: "12px",
  background: "rgba(17,24,39,0.8)",
  backdropFilter: "blur(10px)",
  maxWidth: "600px",
  boxShadow: "0 0 20px rgba(23,232,229,0.2)",
};

const glowLine = {
  height: "2px",
  background: "linear-gradient(90deg, transparent, #17E8E5, transparent)",
  boxShadow: "0 0 10px #17E8E5",
  margin: "8px 0 18px 0",
};

const btnTeal = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg,#17E8E5,#14B8E5)",
  color: "#0B1220",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 0 15px rgba(23,232,229,0.4)",
  transition: "all 0.3s ease",
};
