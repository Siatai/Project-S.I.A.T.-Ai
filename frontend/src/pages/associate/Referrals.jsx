import React, { useEffect, useState } from "react";
import axios from "axios";
import AssociateNavbar from "./AssociateNavbar"; // ✅ Navbar

export default function Referrals() {
  const [teamDeposits, setTeamDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${API}/associate-roi-status`, { headers });
        setTeamDeposits(res.data.details || []);
      } catch (err) {
        console.error("Error fetching referrals:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  if (loading) return <p style={{ color: "#E5E7EB" }}>Loading referrals...</p>;
  if (!teamDeposits.length)
    return <p style={{ color: "#E5E7EB" }}>No referral data available.</p>;

  // ✅ Group deposits by referee name
  const grouped = teamDeposits.reduce((acc, d) => {
    const name = d.investor_name || d.referee_name || "Unknown User";
    if (!acc[name]) acc[name] = { earned: 0, left: 0 };
    acc[name].earned += d.commission_earned || 0;
    acc[name].left += d.commission_left || 0;
    return acc;
  }, {});

  const referees = Object.entries(grouped).map(([name, vals]) => ({
    name,
    earned: vals.earned,
    left: vals.left,
    total: vals.earned + vals.left,
  }));

  // ✅ Totals
  const totalEarned = referees.reduce((s, r) => s + r.earned, 0);
  const totalLeft = referees.reduce((s, r) => s + r.left, 0);
  const totalAll = totalEarned + totalLeft;

  return (
    <div style={pageWrapper}>
      <AssociateNavbar />

      <main style={mainContent}>
        <h2 style={headerTitle}>Referral Earnings</h2>

        {/* === TOTAL BAR (Depleting) === */}
        <div style={cardStyle}>
          <div style={glowRow}>
            <span>Total from All Referrals</span>
            <strong>
              ${totalEarned.toFixed(2)} / ${totalAll.toFixed(2)}
            </strong>
          </div>
          <div style={progressTrack}>
            {/* Remaining (left) visible part */}
            <div
              style={{
                ...progressFill,
                width: `${(totalLeft / totalAll) * 100}%`,
                background: "#17E8E5",
              }}
            />
          </div>
          <p style={mutedText}>
            Earned: ${totalEarned.toFixed(2)} | Left: ${totalLeft.toFixed(2)}
          </p>
        </div>

        {/* === PER REFEREE (Depleting) === */}
        <h3 style={subHeader}>Referrals</h3>
        {referees.map((r, i) => {
          const percentLeft = r.total > 0 ? (r.left / r.total) * 100 : 0;
          return (
            <div key={i} style={cardStyle}>
              <div style={glowRow}>
                <span style={{ color: "#17E8E5", fontWeight: "600" }}>
                  {r.name}
                </span>
                <strong>
                  ${r.earned.toFixed(2)} / ${r.total.toFixed(2)}
                </strong>
              </div>
              <div style={progressTrack}>
                {/* Remaining part shown */}
                <div
                  style={{
                    ...progressFill,
                    width: `${percentLeft}%`,
                    background: "#17E8E5",
                  }}
                />
              </div>
              <p style={mutedText}>
                Earned: ${r.earned.toFixed(2)} | Left: ${r.left.toFixed(2)}
              </p>
            </div>
          );
        })}
      </main>
    </div>
  );
}

/* === Styles === */
const pageWrapper = {
  background: "#0f172a",
  minHeight: "100vh",
  width: "100%",
  overflowX: "hidden",
};

const mainContent = {
  padding: "20px",
  marginTop: "25px",
  marginBottom: "70px",
};

const headerTitle = {
  marginBottom: "20px",
  fontFamily: "Orbitron, sans-serif",
  color: "#17E8E5",
};

const cardStyle = {
  padding: "16px",
  borderRadius: "14px",
  marginBottom: "18px",
  background: "rgba(17,24,39,0.85)",
  boxShadow: "0 0 12px rgba(23,232,229,0.2)",
};

const glowRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
  fontSize: "14px",
  color: "#E5E7EB",
};

const progressTrack = {
  background: "#374151",
  borderRadius: "6px",
  overflow: "hidden",
  height: "14px",
};

const progressFill = {
  height: "100%",
  transition: "width 0.6s ease",
};

const mutedText = {
  color: "#9CA3AF",
  fontSize: "13px",
  marginTop: "6px",
};

const subHeader = {
  marginTop: "30px",
  marginBottom: "12px",
  color: "#17E8E5",
  fontWeight: "600",
};
