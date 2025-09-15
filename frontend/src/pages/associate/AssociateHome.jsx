import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHome, FaWallet, FaUsers, FaUser, FaCopy } from "react-icons/fa";
import logo from "../../Components/logo.png"; // ✅ apna logo

export default function AssociateHome() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [myDeposits, setMyDeposits] = useState([]);
  const [teamDeposits, setTeamDeposits] = useState([]);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [copied, setCopied] = useState(false);
  const [commissionPct, setCommissionPct] = useState(0); // ✅ for referral %
  const [directPct, setDirectPct] = useState(0); // ✅ direct referral %

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const ADMIN_EMAIL = "admin@algomcube.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(`${API}/me`, { headers });
        setUser(res.data);

        if (res.data?.email && res.data.email !== ADMIN_EMAIL) {
          const investorRes = await axios.get(`${API}/investor-roi-status`, {
            headers,
          });
          setMyDeposits(investorRes.data.deposits || []);
        }

        // Commission API
        const teamRes = await axios.get(`${API}/associate-roi-status`, {
          headers,
        });
        setTeamDeposits(teamRes.data.details || []);
        setTotalReceivable(teamRes.data.total_commission_left || 0);
        setCommissionPct(teamRes.data.commission_percent || 0);

        const commRes = await axios.get(`${API}/commission-percent`, {
          headers,
        });
        setDirectPct(commRes.data.commission_percent || 0);
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) return <p style={{ color: "#E5E7EB" }}>Loading...</p>;

  // 🔹 Self deposits summary
  const totalSelf = myDeposits.reduce((s, d) => s + d.capital, 0);
  const roiReceivedSelf = myDeposits.reduce((s, d) => s + d.roi_received, 0);
  const maxSelf = myDeposits.reduce((s, d) => s + d.max_return, 0);
  const leftSelf = maxSelf - roiReceivedSelf;
  const percentLeftSelf = maxSelf > 0 ? (leftSelf / maxSelf) * 100 : 0;

  // 🔹 Team commission summary
  const earnedTeam = teamDeposits.reduce((s, d) => s + d.commission_earned, 0);
  const leftTeam = totalReceivable;
  const totalTeam = earnedTeam + leftTeam;
  const percentLeftTeam = totalTeam > 0 ? (leftTeam / totalTeam) * 100 : 0;

  return (
    <div style={pageWrapper}>
      {/* HEADER */}
      <header style={headerStyle}>
        <img src={logo} alt="Logo" style={logoStyle} />
        <h2 style={neonHeader}>Associate Panel</h2>
      </header>

      {/* MAIN */}
      <main style={mainContent}>
        {activeTab === "summary" && (
          <>
            {/* Welcome text */}
            <h3 style={welcomeText}>Welcome, {user.name || user.email}</h3>
            <p style={subCaption}>
              Now enjoy{" "}
              <span style={{ color: "#17E8E5", fontWeight: "600" }}>
                {directPct}%
              </span>{" "}
              as direct referral and{" "}
              <span style={{ color: "#FACC15", fontWeight: "600" }}>
                {commissionPct}%
              </span>{" "}
              of your investors’ income.
            </p>

            {/* Referral Code */}
            <div style={cardStyle3D}>
              <p style={sectionCaption}>Referral Code</p>
              <div style={referralBox}>
                <span style={referralText}>{user.referral_code}</span>
                <button onClick={copyReferral} style={copyIconBtn}>
                  <FaCopy />
                </button>
              </div>
              {copied && <p style={copiedText}>Copied!</p>}
            </div>

            {/* Deposits */}
            <div style={cardStyle3D}>
              <div style={glowRow}>
                <span>Total Deposits</span>
                <strong>{Math.round(totalSelf)} USDT</strong>
              </div>
              <ProgressBar percent={percentLeftSelf} />
              <p style={mutedText}>
                ROI: {Math.round(roiReceivedSelf)} / {Math.round(maxSelf)} USDT
              </p>
              <p style={{ color: "#FACC15", fontSize: "13px" }}>
                {Math.round(leftSelf)} USDT left to receive
              </p>
            </div>

            {/* Commission */}
            <div style={cardStyle3D}>
              <div style={glowRow}>
                <span>Total Commission</span>
                <strong>{Math.round(totalTeam)} USDT</strong>
              </div>
              <ProgressBar percent={percentLeftTeam} />
              <p style={mutedText}>
                Earned: {Math.round(earnedTeam)} USDT | Left: {Math.round(leftTeam)} USDT
              </p>
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer style={footerStyle}>
        <FooterBtn
          icon={<FaHome />}
          label="Home"
          active={activeTab === "summary"}
          onClick={() => setActiveTab("summary")}
        />
        <FooterBtn
          icon={<FaWallet />}
          label="Deposits"
          active={activeTab === "my"}
          onClick={() => setActiveTab("my")}
        />
        <FooterBtn
          icon={<FaUsers />}
          label="Referrals"
          active={activeTab === "referral"}
          onClick={() => setActiveTab("referral")}
        />
        <FooterBtn
          icon={<FaUser />}
          label="Team"
          active={activeTab === "team"}
          onClick={() => setActiveTab("team")}
        />
      </footer>
    </div>
  );
}

/* Progress Bar */
function ProgressBar({ percent }) {
  let color = "#17E8E5";
  if (percent < 70 && percent >= 40) color = "#FACC15";
  if (percent < 40) color = "#EF4444";

  return (
    <div style={progressTrack}>
      <div style={{ ...progressFill, width: `${percent}%`, background: color }}></div>
    </div>
  );
}

/* Footer Button */
function FooterBtn({ icon, label, active, onClick }) {
  return (
    <button
      style={{
        ...footerBtn,
        color: active ? "#17E8E5" : "#9CA3AF",
        borderTop: active ? "2px solid #17E8E5" : "2px solid transparent",
      }}
      onClick={onClick}
    >
      {icon}
      <span style={{ fontSize: "12px", marginTop: "2px" }}>{label}</span>
    </button>
  );
}

/* === Styles === */
const pageWrapper = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  fontFamily: "Poppins, Orbitron, sans-serif",
};
const headerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  background: "#0f172a",
  padding: "18px 20px", // ⬆️ more height
  borderBottom: "1px solid #1F2937",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const logoStyle = { height: "36px", position: "absolute", left: "15px" };
const neonHeader = {
  margin: 0,
  color: "#17E8E5",
  fontWeight: "700",
  fontFamily: "Orbitron",
  textShadow: "0 0 10px #17E8E5, 0 0 20px #17E8E5",
};
const mainContent = {
  flex: 1,
  marginTop: "80px", // ⬆️ offset bigger header
  marginBottom: "70px",
  overflowY: "auto",
  padding: "12px",
};
const footerStyle = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  background: "#0f172a",
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  padding: "12px 0", // ⬆️ more height
  borderTop: "1px solid #1F2937",
  zIndex: 1000,
};
const cardStyle3D = {
  background: "linear-gradient(145deg,#1E293B,#0F172A)",
  padding: "16px",
  borderRadius: "14px",
  marginBottom: "18px",
  boxShadow:
    "5px 5px 15px rgba(0,0,0,0.7), -5px -5px 15px rgba(255,255,255,0.05)",
};
const glowRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px",
  marginTop: "10px",
  fontSize: "14px",
  borderRadius: "8px",
  background: "rgba(17,24,39,0.8)",
  borderLeft: "3px solid #17E8E5",
  boxShadow: "0 0 12px rgba(23,232,229,0.25)",
};
const referralBox = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "rgba(17,24,39,0.9)",
  padding: "10px 14px",
  borderRadius: "10px",
  margin: "8px 0 12px",
  boxShadow: "0 0 8px rgba(23,232,229,0.25)",
};
const referralText = {
  fontSize: "15px",
  color: "#17E8E5",
  fontWeight: "600",
  fontFamily: "monospace",
};
const copyIconBtn = {
  background: "transparent",
  border: "none",
  color: "#17E8E5",
  fontSize: "18px",
  cursor: "pointer",
};
const copiedText = {
  fontSize: "11px",
  color: "#22C55E",
  marginTop: "4px",
};
const progressTrack = {
  background: "#374151",
  borderRadius: "6px",
  overflow: "hidden",
  height: "12px",
  marginTop: "10px",
};
const progressFill = {
  height: "100%",
  transition: "width 0.6s ease",
};
const mutedText = { color: "#9CA3AF", fontSize: "13px", margin: "6px 0" };
const footerBtn = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "transparent",
  border: "none",
  fontSize: "16px",
  cursor: "pointer",
};
const welcomeText = {
  textAlign: "left",
  color: "#17E8E5",
  fontSize: "18px",
  fontWeight: "600",
  textShadow: "0 0 8px #17E8E5",
  margin: "12px 5px 4px",
};
const subCaption = {
  fontSize: "13px",
  color: "#9CA3AF",
  margin: "0 5px 12px",
};
const sectionCaption = {
  fontSize: "13px",
  color: "#9CA3AF",
  marginBottom: "6px",
};
