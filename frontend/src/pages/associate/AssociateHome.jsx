import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AssociateHome() {
  const [user, setUser] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [teamDeposits, setTeamDeposits] = useState([]);
  const [totalTeamDeposits, setTotalTeamDeposits] = useState(0);

  const API = "https://project-s-i-a-t-ai.onrender.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(`${API}/me`, { headers });
        setUser(res.data);

        if (res.data?.email) {
          const depRes = await axios.get(`${API}/investments?email=${res.data.email}`, { headers });
          setDeposits(depRes.data);
          setTotalDeposits(depRes.data.reduce((sum, d) => sum + Number(d.amount), 0));
        }

        const teamRes = await axios.get(`${API}/associate/deposits`, { headers });
        setTeamDeposits(teamRes.data);
        setTotalTeamDeposits(teamRes.data.reduce((sum, d) => sum + Number(d.amount), 0));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const copyReferral = () => {
    if (user?.referral_code) {
      const signupUrl = `${window.location.origin}/referral-signup?ref=${user.referral_code}`;
      navigator.clipboard.writeText(signupUrl);
      alert("Referral signup link copied!");
    }
  };

  if (!user) return <p style={{ color: "#E5E7EB" }}>Loading...</p>;

  const signupUrl = `${window.location.origin}/referral-signup?ref=${user.referral_code}`;

  return (
    <div style={{ color: "#E5E7EB", padding: "20px" }}>
      <h2 style={{ marginBottom: "15px", color: "#17E8E5" }}>
        Welcome, {user.name || "Associate"}
      </h2>
      <p style={{ marginBottom: "25px", color: "#94A3B8" }}>
        Share your unique referral link to grow your network. All deposits made via your link will be tracked here.
      </p>

      {/* Referral Link */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Referral Link</h3>
        <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
          <input type="text" value={signupUrl} readOnly style={inputStyle} />
          <button onClick={copyReferral} style={btnTeal}>Copy</button>
        </div>
      </div>

      <div style={glowLine}></div>

      {/* Own Deposits */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>My Deposits</h3>
        <div style={rowHeader}>
          <span>Total Deposits</span>
          <span style={{ color: "#17E8E5", fontWeight: "700" }}>
            {totalDeposits} USDT
          </span>
        </div>
        {deposits.length === 0 ? (
          <p style={{ color: "#9CA3AF", marginTop: "10px" }}>No deposits yet</p>
        ) : (
          deposits.map((d, idx) => (
            <div key={idx} style={glowRow}>
              <span>{d.amount} USDT</span>
              <span>{new Date(d.timestamp).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>

      <div style={glowLine}></div>

      {/* Team Deposits */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Team Deposits</h3>

        {/* Total */}
        <div style={rowHeader}>
          <span>Total Team Deposits</span>
          <span style={{ color: "#22C55E", fontWeight: "700", fontSize: "15px" }}>
            {totalTeamDeposits} USDT
          </span>
        </div>

        {/* Table Headings */}
        {teamDeposits.length > 0 && (
          <div style={tableHeader}>
            <span>Name</span>
            <span>USDT</span>
            <span>Date</span>
          </div>
        )}

        {teamDeposits.length === 0 ? (
          <p style={{ color: "#9CA3AF", marginTop: "10px" }}>No team deposits yet</p>
        ) : (
          teamDeposits.map((d, idx) => (
            <div key={idx} style={glowRowGrid}>
              <span>{d.name}</span>
              <span>{d.amount}</span>
              <span>{new Date(d.timestamp).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* === Styles === */
const cardStyle = {
  background: "rgba(17,24,39,0.85)",
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "25px",
  boxShadow: "0 0 15px rgba(23,232,229,0.15)",
};

const sectionTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#17E8E5",
  marginBottom: "12px",
};

const inputStyle = {
  flex: 1,
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "#E5E7EB",
  fontSize: "14px",
  marginRight: "10px",
};

const btnTeal = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  background: "linear-gradient(135deg,#17E8E5,#14B8A6)",
  color: "#0B1220",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 0 10px rgba(23,232,229,0.3)",
};

const glowLine = {
  height: "2px",
  background: "linear-gradient(90deg,transparent,#17E8E5,transparent)",
  margin: "30px 0",
};

const rowHeader = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "2px solid rgba(255,255,255,0.1)",
  fontWeight: "600",
};

/* 🔹 Glow Row for My Deposits */
const glowRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px",
  marginTop: "8px",
  fontSize: "14px",
  borderRadius: "8px",
  background: "rgba(15,23,42,0.9)",
  borderLeft: "4px solid #",
  boxShadow: "0 0 10px rgba(23,232,229,0.25)",
};

/* 🔹 Glow Grid Row for Team Deposits */
const tableHeader = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 22C55E1fr",
  textAlign: "center",
  fontWeight: "600",
  fontSize: "14px",
  color: "#9CA3AF",
  padding: "8px 0",
  borderBottom: "2px solid rgba(255,255,255,0.1)",
  marginTop: "10px",
};

const glowRowGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  textAlign: "center",
  padding: "10px",
  marginTop: "8px",
  fontSize: "14px",
  borderRadius: "8px",
  background: "rgba(15,23,42,0.9)",
  borderLeft: "4px solid #17E8E5",
  boxShadow: "0 0 10px rgba(34,197,94,0.25)",
};
