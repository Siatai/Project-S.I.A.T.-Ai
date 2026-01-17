import React, { useEffect, useState } from "react";
import axios from "axios";

import { FaCopy, FaWallet } from "react-icons/fa";
import AssociateNavbar from "./AssociateNavbar"; //  Fixed Navbar

export default function AssociateHome() {
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0); //  wallet balance state
  const [myDeposits, setMyDeposits] = useState([]);
  const [teamDeposits, setTeamDeposits] = useState([]);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [copied, setCopied] = useState(false);
  const [commissionPct, setCommissionPct] = useState(0);
  const [directPct, setDirectPct] = useState(0);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const ADMIN_EMAIL = "admin@algomcube.com";

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "var(--fx-hero)";
    document.body.style.overflowX = "hidden";

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        //  Fetch user
        const res = await axios.get(`${API}/me`, { headers });
        setUser(res.data);

        //  Fetch wallet balance
        const walletRes = await axios.get(`${API}/wallet/summary`, { headers });
        setWalletBalance(walletRes.data.wallet_balance || 0);

        //  Investor deposits (exclude top ADMIN_EMAIL)
        if (res.dataemail && res.data.email !== ADMIN_EMAIL) {
          const investorRes = await axios.get(`${API}/investor-roi-status`, {
            headers,
          });
          setMyDeposits(investorRes.data.deposits || []);
        }

        //  Team deposits & commission
        const teamRes = await axios.get(`${API}/associate-roi-status`, {
          headers,
        });
        setTeamDeposits(teamRes.data.details || []);
        setTotalReceivable(teamRes.data.total_commission_left || 0);
        setCommissionPct(teamRes.data.commission_percent || 0);

        //  Direct commission %
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
    if (userreferral_code) {
      const signupUrl = `${window.location.origin}/referral-signup?ref=${user.referral_code}`;
      navigator.clipboard.writeText(signupUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) return <p style={{ color: "var(--fx-ink)" }}>Loading...</p>;

  //  Calculations
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
          {/*  Welcome Section */}
          <h3 style={welcomeText}>Welcome, {user.name || user.email}</h3>
          <div style={glowLine} />

          {/*  Wallet Balance Card */}
          <div style={walletCard}>
            <div style={walletIconBox}>
              <FaWallet style={walletIcon} />
            </div>
            <div>
              <p style={walletLabel}>Wallet Balance</p>
              <h3 style={walletValue}>{walletBalance.toFixed(2)} USDT</h3>
            </div>
          </div>

          <p style={subCaption}>
            Now enjoy{" "}
            <span style={{ color: "var(--fx-accent)", fontWeight: "600" }}>
              {directPct}%
            </span>{" "}
            as direct referral and{" "}
            <span style={{ color: "var(--fx-gold)", fontWeight: "600" }}>
              {commissionPct}%
            </span>{" "}
            of your investors income.
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

          {/*  Commission First */}
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

          {/*  Deposits Second */}
          <div style={cardStyle3D}>
            <div style={glowRow}>
              <span>Total Deposits</span>
              <strong>{Math.round(totalSelf)} USDT</strong>
            </div>
            <ProgressBar percent={percentLeftSelf} />
            <p style={mutedText}>
              ROI: {Math.round(roiReceivedSelf)} / {Math.round(maxSelf)} USDT
            </p>
            <p style={{ color: "var(--fx-gold)", fontSize: "13px" }}>
              {Math.round(leftSelf)} USDT left to receive
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProgressBar({ percent }) {
  let color = "var(--fx-accent)";
  if (percent < 70 && percent >= 40) color = "var(--fx-gold)";
  if (percent < 40) color = "var(--fx-danger)";
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
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "var(--fx-hero)",
  color: "var(--fx-ink)",
};

const mainContent = {
  padding: "20px",
  marginTop: "100px",
  marginBottom: "70px",
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
  background: "var(--fx-card)",
  border: "1px solid var(--fx-border)",
  boxShadow:
    "0 0 25px rgba(var(--fx-accent-rgb),0.3), 0 0 50px rgba(var(--fx-accent-rgb),0.15), inset 0 0 10px rgba(var(--fx-accent-rgb),0.1)",
};

/* Wallet card */
const walletCard = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  background: "var(--fx-card-strong)",
  border: "1px solid var(--fx-border)",
  borderRadius: "12px",
  padding: "15px 20px",
  margin: "15px 0",
  boxShadow: "0 0 15px rgba(var(--fx-accent-rgb),0.3)",
};

const walletIconBox = {
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(var(--fx-accent-2-rgb),0.14)",
  boxShadow: "0 0 12px rgba(var(--fx-accent-rgb),0.5)",
};

const walletIcon = { fontSize: "20px", color: "var(--fx-accent)" };
const walletLabel = { fontSize: "13px", color: "var(--fx-muted)", margin: 0 };
const walletValue = { fontSize: "20px", color: "var(--fx-accent)", margin: 0 };

const cardStyle3D = {
  background: "var(--fx-card-strong)",
  padding: "16px",
  borderRadius: "14px",
  marginBottom: "18px",
  border: "1px solid var(--fx-border)",
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
  background: "rgba(8, 10, 20, 0.55)",
  borderLeft: "3px solid var(--fx-accent)",
  boxShadow: "0 0 12px rgba(var(--fx-accent-rgb),0.25)",
};

const referralBox = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "var(--fx-card-strong)",
  border: "1px solid var(--fx-border)",
  padding: "10px 14px",
  borderRadius: "10px",
  margin: "8px 0 12px",
  boxShadow: "0 0 8px rgba(var(--fx-accent-rgb),0.25)",
};

const referralText = {
  fontSize: "15px",
  color: "var(--fx-accent)",
  fontWeight: "600",
  fontFamily: "monospace",
};

const copyIconBtn = {
  background: "var(--fx-hero)",
  border: "none",
  color: "var(--fx-accent)",
  fontSize: "18px",
  cursor: "pointer",
};

const copiedText = { fontSize: "11px", color: "var(--fx-success)", marginTop: "4px" };

const progressTrack = {
  background: "var(--fx-rail)",
  borderRadius: "6px",
  overflow: "hidden",
  height: "12px",
  marginTop: "10px",
};

const progressFill = { height: "100%", transition: "width 0.6s ease" };

const mutedText = { color: "var(--fx-muted)", fontSize: "13px", margin: "6px 0" };

const welcomeText = {
  textAlign: "left",
  color: "var(--fx-accent)",
  fontSize: "18px",
  fontWeight: "600",
  textShadow: "0 0 8px var(--fx-accent)",
  margin: "0 0 6px",
};

const subCaption = {
  fontSize: "13px",
  color: "var(--fx-muted)",
  margin: "0 0 15px",
};

const sectionCaption = {
  fontSize: "13px",
  color: "var(--fx-muted)",
  marginBottom: "6px",
};

const glowLine = {
  height: "2px",
  background: "linear-gradient(90deg, transparent, var(--fx-accent), transparent)",
  boxShadow: "0 0 10px var(--fx-accent)",
  margin: "8px 0 18px 0",
};