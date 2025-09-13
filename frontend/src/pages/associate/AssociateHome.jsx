import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AssociateHome() {
  const [user, setUser] = useState(null);
  const [teamDeposits, setTeamDeposits] = useState([]);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [myDeposits, setMyDeposits] = useState([]);
  const [commissionRate, setCommissionRate] = useState(null);

  const API = "https://project-s-i-a-t-ai.onrender.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // User info
        const res = await axios.get(`${API}/me`, { headers });
        setUser(res.data);

        // My deposits
        if (res.data?.email) {
          const depRes = await axios.get(
            `${API}/investments?email=${res.data.email}`,
            { headers }
          );
          setMyDeposits(depRes.data || []);
        }

        // Team deposits & commission progress
        const teamRes = await axios.get(`${API}/associate-roi-status`, {
          headers,
        });
        setTeamDeposits(teamRes.data.details || []);
        setTotalReceivable(teamRes.data.total_commission_left || 0);

        // Commission % (from backend API)
        const commRes = await axios.get(`${API}/commission-percent`, {
          headers,
        });
        setCommissionRate(commRes.data.commission_percent || 0);
      } catch (err) {
        console.error("Error fetching associate data:", err);
      }
    };
    fetchData();
  }, []);

  const copyReferral = () => {
    if (user?.referral_code) {
      const signupUrl = `${window.location.origin}/referral-signup?ref=${user.referral_code}`;
      navigator.clipboard.writeText(signupUrl);
      alert("Referral link copied!");
    }
  };

  if (!user) return <p style={{ color: "#E5E7EB" }}>Loading...</p>;

  return (
    <div
      style={{
        color: "#E5E7EB",
        padding: "20px",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      {/* ✅ Welcome Banner */}
      {commissionRate !== null && (
        <div style={bannerStyle}>
          <span style={{ fontWeight: "700" }}>
            Welcome, {user.name || user.email}!
          </span>{" "}
          You now earn{" "}
          <span style={{ fontWeight: "700", color: "#17E8E5" }}>
            {commissionRate}%
          </span>{" "}
          from the profits of your referrals.
        </div>
      )}

      {/* Referral Card */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Your Referral Code</h3>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Only show referral code */}
          <input
            type="text"
            value={user.referral_code}
            readOnly
            style={inputStyle}
          />
          <button onClick={copyReferral} style={btnTeal}>
            Copy
          </button>
        </div>
        <p style={helpText}>
          Share this code with others. When copied, it will include the full
          referral link automatically.
        </p>
      </div>

      {/* My Deposits */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>My Deposits</h3>
        {myDeposits.length === 0 ? (
          <p style={{ color: "#9CA3AF" }}>You have not made any deposits yet.</p>
        ) : (
          myDeposits.map((d, idx) => (
            <div key={idx} style={glowRow}>
              <span>{d.amount} USDT</span>
              <span>{new Date(d.timestamp).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>

      {/* Team Deposits */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={sectionTitle}>Team Deposits</h3>
          <button style={infoBtn} onClick={() => setShowInfo(!showInfo)}>
            ℹ️
          </button>
        </div>

        <div style={rowHeader}>
          <span>Total Pending Commission</span>
          <span style={{ color: "#22C55E", fontWeight: "700" }}>
            {totalReceivable} USDT
          </span>
        </div>

        {showInfo && (
          <div style={infoBox}>
            You earn daily commission as a percentage of your team’s ROI,
            continuing until each deposit package completes (~20 months).
          </div>
        )}

        {/* Table headings */}
        <div style={tableHeader}>
          <span>Referee</span>
          <span>Deposit</span>
          <span>Commission</span>
        </div>

        {teamDeposits.length === 0 ? (
          <p style={{ color: "#9CA3AF" }}>You don’t have any referrals yet.</p>
        ) : (
          teamDeposits.map((d, idx) => {
            const total = d.commission_earned + d.commission_left;
            const percent =
              total > 0 ? (d.commission_earned / total) * 100 : 0;

            return (
              <div key={idx} style={depositCard}>
                <div style={rowGrid}>
                  <span>{d.referee_name}</span>
                  <span>{d.capital} USDT</span>
                  <span style={{ color: "#FACC15", fontWeight: "300" }}>
                    Remaining: {d.commission_left} USDT
                  </span>
                </div>
                <div style={progressTrack}>
                  <div
                    style={{ ...progressFill, width: `${percent}%` }}
                  ></div>
                </div>
                <p style={progressText}>{percent.toFixed(2)}% earned</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* === Styles === */
const bannerStyle = {
  background: "linear-gradient(135deg, #0f172a, #1e293b)",
  padding: "14px 18px",
  borderRadius: "10px",
  marginBottom: "20px",
  textAlign: "center",
  fontSize: "14px",
  fontWeight: "400",
  color: "#E5E7EB",
  boxShadow: "0 0 12px rgba(23,232,229,0.3)",
};

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
   textAlign: "center",
};

const helpText = {
  marginTop: "8px",
  fontSize: "12px",
  color: "#9CA3AF",
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

const infoBtn = {
  background: "transparent",
  border: "none",
  color: "#60A5FA",
  fontSize: "18px",
  cursor: "pointer",
};

const infoBox = {
  background: "rgba(31,41,55,0.9)",
  padding: "12px",
  borderRadius: "8px",
  fontSize: "13px",
  color: "#D1D5DB",
  marginBottom: "12px",
};

const rowHeader = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  fontWeight: "600",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  marginBottom: "10px",
};

const glowRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px",
  marginTop: "8px",
  fontSize: "14px",
  borderRadius: "8px",
  background: "rgba(15,23,42,0.9)",
  borderLeft: "4px solid #22C55E",
  boxShadow: "0 0 10px rgba(34,197,94,0.25)",
};

const tableHeader = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  fontWeight: "600",
  fontSize: "14px",
  color: "#9CA3AF",
  margin: "10px 0",
};

const depositCard = {
  background: "rgba(15,23,42,0.9)",
  borderRadius: "10px",
  padding: "12px",
  marginBottom: "12px",
  boxShadow: "0 0 10px rgba(23,232,229,0.2)",
};

const rowGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  alignItems: "center",
  fontSize: "10px",
  marginBottom: "6px",
};

const progressTrack = {
  background: "#374151",
  borderRadius: "6px",
  overflow: "hidden",
  height: "8px",
};

const progressFill = {
  background: "#17E8E5",
  height: "8px",
  transition: "width 0.5s ease",
};

const progressText = {
  fontSize: "11px",
  color: "#9CA3AF",
  marginTop: "4px",
};
