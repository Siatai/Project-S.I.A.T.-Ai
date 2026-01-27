import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaWallet } from "react-icons/fa";
import InvestorNavbar from "./Navbar";
import HudLoader from "../../Components/HudLoader";

export default function InvestorHome() {
  const [applied, setApplied] = useState(false);
  const [showAppliedMsg, setShowAppliedMsg] = useState(false);
  const [isAssociate, setIsAssociate] = useState(false);
  const [user, setUser] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const API = "https://project-s-i-a-t-ai.onrender.com";

  //  Apply global dark background + reset body
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "var(--fx-hero)";
    document.body.style.overflowX = "hidden";
  }, []);

  //  Fetch user, wallet, deposits
  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(`${API}/me`, { headers });
        setUser(res.data);

        if (res.data.is_associate) setIsAssociate(true);
        if (res.data.pending_associate) setApplied(true);

        const roiRes = await axios.get(`${API}/investor-roi-status`, { headers });
        setDeposits(roiRes.data.deposits || []);
        setSummary(roiRes.data.summary || null);

        const walletRes = await axios.get(`${API}/wallet/summary`, { headers });
        setUser((prev) => ({
          ...prev,
          wallet_balance: walletRes.data.wallet_balance,
        }));
      } catch (err) {
        console.error("Error fetching investor data:", err);
      }
    };
    fetchUserAndData();
  }, []);

  //  Apply for associate
  const applyForAssociate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/request-associate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplied(true);
      setShowAppliedMsg(true);
      setTimeout(() => setShowAppliedMsg(false), 10000);
      alert("Request sent to admin for approval.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Something went wrong");
    }
  };

  if (!user) return <HudLoader text="Loading dashboard" />;

  return (
    <div style={pageWrapper}>
      <InvestorNavbar />

      {/* Content Wrapper with header/footer spacing */}
      <div style={contentWrapper}>
        {/*  Name greeting */}
        <h2 style={welcomeText}>
          Welcome, {user.name || user.email}
        </h2>
        <div style={glowLine} />

        {/*  Wallet Balance */}
        <div style={walletCard}>
          <div style={walletIconBox}>
            <FaWallet style={walletIcon} />
          </div>
          <div>
            <p style={{ fontSize: "13px", color: "var(--fx-muted)", margin: 0 }}>
              Wallet Balance
            </p>
            <h3 style={{ fontSize: "20px", color: "var(--fx-accent)", margin: 0 }}>
              {user.wallet_balance !== undefined
                ? user.wallet_balance.toFixed(2)
                : 0}{" "}
              USDT
            </h3>
          </div>
        </div>

        <p style={helperText}>
          You can deposit funds, withdraw profits, and track your ROI here.
        </p>

        {/*  Deposits with Depleting Progress */}
        <div style={{ ...cardStyle, position: "relative" }}>
          {summary && (
            <span onClick={() => setShowInfo(true)} style={infoIcon}>
              i
            </span>
          )}

          <h3 style={depositTitle}>My Deposits</h3>
          <div style={glowLine} />

          {summary && (
            <div style={{ marginBottom: "25px" }}>
              <div style={glowRowTotal}>
                <span>Total Deposits</span>
                <span>{summary.total_invested} USDT</span>
              </div>
              <DepletingBar
                received={summary.total_received}
                max={summary.total_max_return}
              />
            </div>
          )}

          {deposits.length === 0 ? (
            <p style={{ color: "var(--fx-muted)", marginTop: "12px" }}>No deposits yet</p>
          ) : (
            deposits.map((d, idx) => (
              <div key={idx} style={{ marginBottom: "18px" }}>
                <div style={glowRowGreen}>
                  <span>{d.capital} USDT</span>
                  <span>
                    {d.timestamp
                      ? new Date(d.timestamp).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                <DepletingBar received={d.roi_received} max={d.max_return} />
              </div>
            ))
          )}
        </div>

        {/*  Associate Status / Button */}
        <div style={{ marginTop: 40, textAlign: "center", width: "100%" }}>
          {isAssociate ? (
            <p style={{ color: "var(--fx-success)", fontWeight: "600" }}>
              Welcome, <strong>Associate</strong>! You now have referral access.
            </p>
          ) : !applied ? (
            <button onClick={applyForAssociate} style={btnTeal}>
              Apply to become Associate
            </button>
          ) : (
            showAppliedMsg && (
              <p style={{ color: "var(--fx-gold)", fontWeight: "600" }}>
                 Pending approval from Admin...
              </p>
            )
          )}
        </div>

        {/*  Info Popup */}
        {showInfo && (
          <div style={popupOverlay} onClick={() => setShowInfo(false)}>
            <div style={popupBox} onClick={(e) => e.stopPropagation()}>
              <button style={closeBtn} onClick={() => setShowInfo(false)}>
                X
              </button>
              <h3 style={{ color: "var(--fx-accent)", marginBottom: "12px" }}>Info</h3>
              <p style={{ fontSize: "14px", color: "var(--fx-ink)" }}>
                Maximum Receivable:{" "}
                <strong>{summary.total_max_return} USDT</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* === Depleting Progress Bar === */
function DepletingBar({ received, max }) {
  const percentLeft = max > 0 ? ((max - received) / max) * 100 : 0;

  let gradient = "linear-gradient(90deg,var(--fx-accent),var(--fx-accent-2))";
  if (percentLeft < 70 && percentLeft >= 40) {
    gradient = "linear-gradient(90deg,var(--fx-gold),var(--fx-gold-strong))";
  }
  if (percentLeft < 40) {
    gradient = "linear-gradient(90deg,var(--fx-danger),var(--fx-danger-strong))";
  }

  return (
    <div style={{ marginTop: "10px" }}>
      <div style={progressBigTrack}>
        <div
          style={{
            ...progressBigFill,
            width: `${percentLeft}%`,
            background: gradient,
          }}
        ></div>
        <span style={progressBigText}>{Math.round(percentLeft)}%</span>
      </div>
      <p style={progressCaption}>
        Remaining: {Math.max(max - received, 0)} / {max} USDT
      </p>
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
  padding: "0 16px",
  boxSizing: "border-box",
};

const contentWrapper = {
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  paddingTop: "80px",
  paddingBottom: "70px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const welcomeText = {
  fontFamily: "var(--fx-font-display)",
  fontSize: "20px",
  color: "var(--fx-accent)",
  width: "100%",
  maxWidth: "920px",
  letterSpacing: "0.12em",
};

const cardStyle = {
  marginTop: 30,
  padding: "20px",
  borderRadius: "12px",
  background: "var(--fx-card)",
  border: "1px solid var(--fx-border)",
  backdropFilter: "blur(10px)",
  width: "100%",
  maxWidth: "920px",
  boxShadow: "var(--fx-shadow)",
};

const glowLine = {
  height: "0",
  background: "transparent",
  boxShadow: "none",
  margin: "6px 0 14px 0",
};

const walletCard = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  background: "var(--fx-card-strong)",
  border: "1px solid var(--fx-border)",
  borderRadius: "12px",
  padding: "15px 20px",
  margin: "15px 0",
  boxShadow: "var(--fx-shadow)",
  width: "100%",
  maxWidth: "920px",
};

const walletIconBox = {
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(var(--fx-accent-2-rgb),0.14)",
  boxShadow: "0 0 18px rgba(var(--fx-accent-rgb),0.35)",
};

const walletIcon = {
  fontSize: "20px",
  color: "var(--fx-accent)",
};

const glowRowGreen = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 10px",
  marginTop: "6px",
  fontSize: "14px",
  borderRadius: "6px",
  background: "rgba(8, 10, 20, 0.55)",
  borderLeft: "3px solid var(--fx-success)",
  boxShadow: "0 0 6px rgba(34,197,94,0.25)",
};

const glowRowTotal = {
  ...glowRowGreen,
  fontSize: "16px",
  fontWeight: "700",
  borderLeft: "4px solid var(--fx-success)",
  boxShadow: "0 0 12px rgba(34,197,94,0.4)",
  marginBottom: "8px",
};

const btnTeal = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, var(--fx-button), var(--fx-button-2))",
  color: "var(--fx-bg)",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 0 15px rgba(var(--fx-accent-rgb),0.4)",
  transition: "all 0.3s ease",
};

const helperText = {
  marginTop: 15,
  color: "var(--fx-muted)",
  width: "100%",
  maxWidth: "920px",
};

const popupOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const popupBox = {
  background: "var(--fx-card)",
  border: "1px solid var(--fx-border)",
  padding: "20px",
  borderRadius: "10px",
  maxWidth: "350px",
  width: "90%",
  textAlign: "center",
  boxShadow: "0 18px 36px rgba(var(--fx-accent-rgb),0.25)",
  position: "relative",
};

const closeBtn = {
  position: "absolute",
  top: "10px",
  right: "12px",
  background: "var(--fx-hero)",
  border: "none",
  fontSize: "18px",
  color: "var(--fx-ink)",
  cursor: "pointer",
};

const infoIcon = {
  cursor: "pointer",
  background: "var(--fx-button)",
  color: "var(--fx-bg)",
  borderRadius: "50%",
  width: "20px",
  height: "20px",
  fontSize: "13px",
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 0 12px rgba(var(--fx-accent-rgb),0.35)",
  position: "absolute",
  top: "12px",
  right: "12px",
};

const depositTitle = {
  marginBottom: "10px",
  fontSize: "16px",
  fontWeight: "600",
  color: "var(--fx-accent)",
  fontFamily: "var(--fx-font-display)",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

const progressBigTrack = {
  background: "rgba(255,255,255,0.08)",
  borderRadius: "12px",
  overflow: "hidden",
  height: "18px",
  position: "relative",
  boxShadow:
    "inset 3px 3px 6px rgba(0,0,0,0.6), inset -3px -3px 6px rgba(255,255,255,0.1)",
};

const progressBigFill = {
  height: "100%",
  borderRadius: "12px",
  transition: "width 0.6s ease",
};

const progressBigText = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  fontSize: "12px",
  fontWeight: "700",
  color: "var(--fx-bg)",
  textShadow: "0 0 5px rgba(255,255,255,0.7)",
};

const progressCaption = {
  marginTop: "6px",
  fontSize: "13px",
  color: "var(--fx-muted)",
  textAlign: "center",
};
