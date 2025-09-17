import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaWallet } from "react-icons/fa"; // Wallet icon
import InvestorNavbar from "./Navbar"; // Custom Navbar with halo logo

export default function InvestorHome() {
  const [applied, setApplied] = useState(false);
  const [showAppliedMsg, setShowAppliedMsg] = useState(false);
  const [isAssociate, setIsAssociate] = useState(false);
  const [user, setUser] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const API = "https://project-s-i-a-t-ai.onrender.com";

  // 🔹 Fetch user, wallet, deposits
  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        // Get user info
        const res = await axios.get(`${API}/me`, { headers });
        setUser(res.data);

        if (res.data.is_associate) setIsAssociate(true);
        if (res.data.pending_associate) setApplied(true);

        // Get deposits + ROI progress
        const roiRes = await axios.get(`${API}/investor-roi-status`, {
          headers,
        });
        setDeposits(roiRes.data.deposits || []);
        setSummary(roiRes.data.summary || null);

        // ✅ Get wallet balance from /wallet/summary
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

  // 🔹 Apply for associate
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

  if (!user) return <p style={{ color: "#E5E7EB" }}>Loading...</p>;

  return (
    <div style={{ color: "#E5E7EB" }}>
      <InvestorNavbar />

      <div style={{ padding: "20px", marginBottom: "70px" }}>
        {/* ✅ Name greeting */}
        <h2
          style={{
            fontFamily: "Orbitron, sans-serif",
            fontSize: "22px",
            color: "#17E8E5",
          }}
        >
          Welcome, {user.name || user.email}
        </h2>
        <div style={glowLine} />

        {/* ✅ Wallet Balance */}
        <div style={walletCard}>
          <div style={walletIconBox}>
            <FaWallet style={walletIcon} />
          </div>
          <div>
            <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>
              Wallet Balance
            </p>
            <h3 style={{ fontSize: "20px", color: "#17E8E5", margin: 0 }}>
              {user.wallet_balance !== undefined
                ? user.wallet_balance.toFixed(2)
                : 0}{" "}
              USDT
            </h3>
          </div>
        </div>

        <p style={{ marginTop: 15, color: "#9CA3AF" }}>
          You can deposit funds, withdraw profits, and track your ROI here.
        </p>

        {/* ✅ Deposits with Depleting Progress */}
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
            <p style={{ color: "#9CA3AF", marginTop: "12px" }}>
              No deposits yet
            </p>
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

        {/* ✅ Associate Status / Button */}
        <div style={{ marginTop: 40, textAlign: "center" }}>
          {isAssociate ? (
            <p style={{ color: "#4ADE80", fontWeight: "600" }}>
              Welcome, <strong>Associate</strong>! You now have referral access.
            </p>
          ) : !applied ? (
            <button onClick={applyForAssociate} style={btnTeal}>
              Apply to become Associate
            </button>
          ) : (
            showAppliedMsg && (
              <p style={{ color: "#FACC15", fontWeight: "600" }}>
                ⏳ Pending approval from Admin...
              </p>
            )
          )}
        </div>

        {/* ℹ️ Info Popup */}
        {showInfo && (
          <div style={popupOverlay} onClick={() => setShowInfo(false)}>
            <div style={popupBox} onClick={(e) => e.stopPropagation()}>
              <button style={closeBtn} onClick={() => setShowInfo(false)}>
                ✕
              </button>
              <h3 style={{ color: "#17E8E5", marginBottom: "12px" }}>Info</h3>
              <p style={{ fontSize: "14px", color: "#E5E7EB" }}>
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

  // 🎨 Dynamic color based on depletion
  let gradient = "linear-gradient(90deg,#17E8E5,#14B8E5)"; // neon blue
  if (percentLeft < 70 && percentLeft >= 40) {
    gradient = "linear-gradient(90deg,#FACC15,#FBBF24)"; // yellow
  }
  if (percentLeft < 40) {
    gradient = "linear-gradient(90deg,#EF4444,#DC2626)"; // red
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

const walletCard = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  background: "rgba(17,24,39,0.85)",
  borderRadius: "12px",
  padding: "15px 20px",
  margin: "15px 0",
  boxShadow: "0 0 15px rgba(23,232,229,0.3)",
};

const walletIconBox = {
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(23,232,229,0.1)",
  boxShadow: "0 0 12px rgba(23,232,229,0.5)",
};

const walletIcon = {
  fontSize: "20px",
  color: "#17E8E5",
};

const glowRowGreen = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 10px",
  marginTop: "6px",
  fontSize: "14px",
  borderRadius: "6px",
  background: "rgba(15,23,42,0.85)",
  borderLeft: "3px solid #22C55E",
  boxShadow: "0 0 6px rgba(34,197,94,0.25)",
};

const glowRowTotal = {
  ...glowRowGreen,
  fontSize: "16px",
  fontWeight: "700",
  borderLeft: "4px solid #22C55E",
  boxShadow: "0 0 12px rgba(34,197,94,0.4)",
  marginBottom: "8px",
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
  background: "rgba(17,24,39,0.95)",
  padding: "20px",
  borderRadius: "10px",
  maxWidth: "350px",
  width: "90%",
  textAlign: "center",
  boxShadow: "0 0 20px rgba(23,232,229,0.4)",
  position: "relative",
};

const closeBtn = {
  position: "absolute",
  top: "10px",
  right: "12px",
  background: "transparent",
  border: "none",
  fontSize: "18px",
  color: "#E5E7EB",
  cursor: "pointer",
};

const infoIcon = {
  cursor: "pointer",
  background: "#17E8E5",
  color: "#0B1220",
  borderRadius: "50%",
  width: "20px",
  height: "20px",
  fontSize: "13px",
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 0 6px rgba(23,232,229,0.6)",
  position: "absolute",
  top: "12px",
  right: "12px",
};

const depositTitle = {
  marginBottom: "10px",
  fontSize: "18px",
  fontWeight: "600",
  color: "#17E8E5",
};

const progressBigTrack = {
  background: "linear-gradient(145deg, #1F2937, #111827)",
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
  color: "#0B1220",
  textShadow: "0 0 5px rgba(255,255,255,0.7)",
};

const progressCaption = {
  marginTop: "6px",
  fontSize: "13px",
  color: "#9CA3AF",
  textAlign: "center",
};
