import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCopy } from "react-icons/fa";
import AssociateNavbar from "./AssociateNavbar"; // ✅ Fixed Navbar

export default function AssociateHome() {
  const [user, setUser] = useState(null);
  const [myDeposits, setMyDeposits] = useState([]);
  const [teamDeposits, setTeamDeposits] = useState([]);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [copied, setCopied] = useState(false);
  const [commissionPct, setCommissionPct] = useState(0);
  const [directPct, setDirectPct] = useState(0);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const ADMIN_EMAIL = "admin@algomcube.com";

  useEffect(() => {
    // ✅ Apply global dark background + reset margins inline
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "#0f172a";
    document.body.style.overflowX = "hidden";

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

  const totalSelf = myDeposits.reduce((s, d) => s + d.capital, 0);
  const roiReceivedSelf = myDeposits.reduce((s, d) => s + d.roi_received, 0);
  const maxSelf = myDeposits.reduce((s, d) => s + d.max_return, 0);
  const leftSelf = maxSelf - roiReceivedSelf;
  const percentLeftSelf = maxSelf > 0 ? (leftSelf / maxSelf) * 100 : 0;

  const earnedTeam = teamDeposits.reduce((s, d) => s + d.commission_earned, 0);
  const leftTeam = totalReceivable;
  const totalTeam = earnedTeam + leftTeam;
  const percentLeftTeam = totalTeam > 0 ? (leftTeam / totalTeam) * 100 : 0;

  return (
    <div style={pageWrapper}>
      <AssociateNavbar />

      <main style={mainContent}>
        <div style={haloBox}>
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
              Earned: {Math.round(earnedTeam)} USDT | Left:{" "}
              {Math.round(leftTeam)} USDT
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProgressBar({ percent }) {
  let color = "#17E8E5";
  if (percent < 70 && percent >= 40) color = "#FACC15";
  if (percent < 40) color = "#EF4444";
  return (
    <div style={progressTrack}>
      <div style={{ ...progressFill, width: `${percent}%`, background: color }} />
    </div>
  );
}

/* === Styles === */
const pageWrapper = {
  minHeight: "100vh",
  width: "100%",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  color: "#E5E7EB",
};

const mainContent = {
  padding: "20px",
  marginTop: "80px",
  marginBottom: "70px",
  marginleft: "15px" ,
  marginright: "15px",
  width: "100%",
  display: "flex",
  justifyContent: "center",
};

const haloBox = {
  width: "100%",
  maxWidth: "420px",
  padding: "20px",
  margin: "0 20px",
  borderRadius: "20px",
  background: "rgba(15,23,42,0.85)",
  boxShadow:
    "0 0 25px rgba(23,232,229,0.3), 0 0 50px rgba(23,232,229,0.15), inset 0 0 10px rgba(23,232,229,0.1)",
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

const welcomeText = {
  textAlign: "left",
  color: "#17E8E5",
  fontSize: "18px",
  fontWeight: "600",
  textShadow: "0 0 8px #17E8E5",
  margin: "0 0 6px",
};

const subCaption = {
  fontSize: "13px",
  color: "#9CA3AF",
  margin: "0 0 15px",
};

const sectionCaption = {
  fontSize: "13px",
  color: "#9CA3AF",
  marginBottom: "6px",
};
