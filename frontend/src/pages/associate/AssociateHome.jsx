import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AssociateHome() {
  const [user, setUser] = useState(null);
  const [teamStatus, setTeamStatus] = useState(null);
  const [infoVisible, setInfoVisible] = useState(false);

  const API = "https://project-s-i-a-t-ai.onrender.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(`${API}/me`, { headers });
        setUser(res.data);

        // Fetch associate ROI status
        const teamRes = await axios.get(`${API}/associate-roi-status`, { headers });
        setTeamStatus(teamRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  if (!user) return <p style={{ color: "#E5E7EB" }}>Loading...</p>;
  if (!teamStatus) return <p style={{ color: "#E5E7EB" }}>Loading team data...</p>;

  return (
    <div style={{ color: "#E5E7EB", padding: "20px" }}>
      <h2 style={{ marginBottom: "15px", color: "#17E8E5" }}>
        Welcome, {user.name || "Associate"}
      </h2>

      {/* Team Deposits Card */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={sectionTitle}>Team Deposits</h3>
          {/* Info Button */}
          <button
            style={infoBtn}
            onClick={() => setInfoVisible(!infoVisible)}
          >
            ℹ️
          </button>
        </div>

        {infoVisible && (
          <div style={infoBox}>
            You earn <strong>{teamStatus.commission_pct}%</strong> commission
            from the ROI receivable of your referred investors until their account is flushed.
          </div>
        )}

        <div style={rowHeader}>
          <span>Total Left to Receive</span>
          <span style={{ color: "#22C55E", fontWeight: "800", fontSize: "16px" }}>
            {teamStatus.total_commission_left} USDT
          </span>
        </div>

        {/* Table Headings */}
        {teamStatus.details.length > 0 && (
          <div style={tableHeader}>
            <span>Referee</span>
            <span>Capital</span>
            <span>Commission</span>
          </div>
        )}

        {teamStatus.details.length === 0 ? (
          <p style={{ color: "#9CA3AF", marginTop: "10px" }}>No team deposits yet</p>
        ) : (
          teamStatus.details.map((d, idx) => (
            <div key={idx} style={glowRowGrid}>
              <span>{d.referee_name}</span>
              <span>{d.capital} USDT</span>
              <span>
                Left: <strong style={{ color: "#FACC15" }}>{d.commission_left} USDT</strong>
              </span>
              <ProgressBar percent={(d.commission_left / ((d.left_to_receive * d.commission_pct) / 100)) * 100} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* === Small ProgressBar Component === */
function ProgressBar({ percent }) {
  return (
    <div
      style={{
        background: "#374151",
        borderRadius: "6px",
        overflow: "hidden",
        height: "8px",
        marginTop: "4px",
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          background: "linear-gradient(90deg,#17E8E5,#14B8A6)",
          height: "8px",
          transition: "width 0.5s ease",
        }}
      ></div>
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
  position: "relative",
};

const sectionTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#17E8E5",
};

const infoBtn = {
  background: "transparent",
  border: "none",
  fontSize: "18px",
  cursor: "pointer",
  color: "#17E8E5",
};

const infoBox = {
  background: "rgba(23,232,229,0.1)",
  border: "1px solid #17E8E5",
  padding: "10px",
  borderRadius: "8px",
  fontSize: "13px",
  color: "#E5E7EB",
  marginBottom: "15px",
  marginTop: "10px",
};

const rowHeader = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "2px solid rgba(255,255,255,0.1)",
  fontWeight: "600",
  marginTop: "15px",
};

const tableHeader = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
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
