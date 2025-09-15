import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHome, FaWallet, FaUsers, FaUser } from "react-icons/fa";

export default function AssociateHome() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("summary"); // summary | my | referral | team
  const [myDeposits, setMyDeposits] = useState([]);
  const [referralDeposits, setReferralDeposits] = useState([]);
  const [teamDeposits, setTeamDeposits] = useState([]);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [commissionRate, setCommissionRate] = useState(null);
  const [roiMultiplier, setRoiMultiplier] = useState(2.0);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const ADMIN_EMAIL = "admin@algomcube.com"; // admin email

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // user info
        const res = await axios.get(`${API}/me`, { headers });
        setUser(res.data);

        if (res.data?.email && res.data.email !== ADMIN_EMAIL) {
          // 🟢 self deposits
          const investorRes = await axios.get(`${API}/investor-roi-status`, {
            headers,
          });
          setMyDeposits(investorRes.data.deposits || []);

          // 🟢 referral/associate deposits
          const assocRes = await axios.get(`${API}/associate/deposits`, {
            headers,
          });
          setReferralDeposits(assocRes.data || []);
        }

        // 🟢 team commission progress
        const teamRes = await axios.get(`${API}/associate-roi-status`, {
          headers,
        });
        setTeamDeposits(teamRes.data.details || []);
        setTotalReceivable(teamRes.data.total_commission_left || 0);

        // 🟢 commission %
        const commRes = await axios.get(`${API}/commission-percent`, {
          headers,
        });
        setCommissionRate(commRes.data.commission_percent || 0);

        // 🟢 ROI config
        const roiRes = await axios.get(`${API}/roi`, { headers });
        if (roiRes.data?.max_roi_multiplier)
          setRoiMultiplier(roiRes.data.max_roi_multiplier);
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
    <div style={pageWrapper}>
      {/* === HEADER === */}
      <header style={headerStyle}>
        <h2 style={{ margin: 0, color: "#17E8E5", fontFamily: "Orbitron" }}>
          Associate Panel
        </h2>
      </header>

      {/* === MAIN CONTENT === */}
      <main style={mainContent}>
        {/* Summary */}
        {activeTab === "summary" && (
          <div style={cardStyle}>
            <h3 style={sectionTitle}>Welcome {user.name || user.email}</h3>
            <p>You now earn {commissionRate}% from your referrals’ profits.</p>
            <p>
              <strong>Total Commission Left:</strong> {totalReceivable} USDT
            </p>
            <button onClick={copyReferral} style={btnTeal}>
              Copy Referral Code: {user.referral_code}
            </button>
          </div>
        )}

        {/* Self Deposits */}
        {activeTab === "my" && (
          <div style={cardStyle}>
            <h3 style={sectionTitle}>My Deposits</h3>
            {myDeposits.length === 0 ? (
              <p style={{ color: "#9CA3AF" }}>No self-investments yet.</p>
            ) : (
              myDeposits.map((d, idx) => (
                <DepositCard
                  key={idx}
                  data={d}
                  multiplier={roiMultiplier}
                  label="Self Invested"
                />
              ))
            )}
          </div>
        )}

        {/* Referral Deposits */}
        {activeTab === "referral" && (
          <div style={cardStyle}>
            <h3 style={sectionTitle}>Referral Investments</h3>
            {referralDeposits.length === 0 ? (
              <p style={{ color: "#9CA3AF" }}>No referral-based deposits yet.</p>
            ) : (
              referralDeposits.map((d, idx) => (
                <DepositCard
                  key={idx}
                  data={d}
                  multiplier={roiMultiplier}
                  label="Referral Based"
                />
              ))
            )}
          </div>
        )}

        {/* Team Deposits */}
        {activeTab === "team" && (
          <div style={cardStyle}>
            <h3 style={sectionTitle}>Team Deposits</h3>
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
                      <span style={{ color: "#FACC15" }}>
                        Remaining: {d.commission_left} USDT
                      </span>
                    </div>
                    <div style={progressTrack}>
                      <div style={{ ...progressFill, width: `${percent}%` }}></div>
                    </div>
                    <p style={progressText}>{percent.toFixed(2)}% earned</p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* === FOOTER === */}
      <footer style={footerStyle}>
        <button style={footerBtn} onClick={() => setActiveTab("summary")}>
          <FaHome /> <span>Home</span>
        </button>
        <button style={footerBtn} onClick={() => setActiveTab("my")}>
          <FaWallet /> <span>Deposits</span>
        </button>
        <button style={footerBtn} onClick={() => setActiveTab("referral")}>
          <FaUsers /> <span>Referrals</span>
        </button>
        <button style={footerBtn} onClick={() => setActiveTab("team")}>
          <FaUser /> <span>Team</span>
        </button>
      </footer>
    </div>
  );
}

/* === Subcomponents === */
function DepositCard({ data, multiplier, label }) {
  const roiReceived = data.roi_received || 0;
  const maxReturn = (data.capital || data.amount || 0) * (multiplier || 2);
  const percent = maxReturn > 0 ? (roiReceived / maxReturn) * 100 : 0;

  return (
    <div style={depositCard}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{data.capital || data.amount} USDT</span>
        <span>
          {data.timestamp ? new Date(data.timestamp).toLocaleDateString() : "-"}
        </span>
      </div>
      <small style={{ color: "#9CA3AF" }}>{label}</small>
      <div style={progressTrack}>
        <div style={{ ...progressFill, width: `${percent}%` }}></div>
      </div>
      <p style={progressText}>
        ROI: {roiReceived.toFixed(2)} / {maxReturn.toFixed(2)} USDT
      </p>
    </div>
  );
}

/* === Styles === */
const pageWrapper = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
};
const headerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  background: "#111827",
  padding: "12px",
  textAlign: "center",
  zIndex: 1000,
};
const footerStyle = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  background: "#111827",
  display: "flex",
  justifyContent: "space-around",
  padding: "8px 0",
  borderTop: "1px solid #1F2937",
  zIndex: 1000,
};
const mainContent = {
  flex: 1,
  marginTop: "60px",
  marginBottom: "60px",
  overflowY: "auto",
  padding: "10px",
};
const cardStyle = {
  background: "rgba(17,24,39,0.85)",
  padding: "16px",
  borderRadius: "12px",
  marginBottom: "15px",
  boxShadow: "0 0 10px rgba(23,232,229,0.15)",
};
const sectionTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#17E8E5",
  marginBottom: "10px",
};
const btnTeal = {
  marginTop: "10px",
  padding: "8px 12px",
  border: "none",
  borderRadius: "8px",
  background: "linear-gradient(135deg,#17E8E5,#14B8A6)",
  color: "#0B1220",
  fontWeight: "700",
  cursor: "pointer",
};
const footerBtn = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "transparent",
  border: "none",
  color: "#E5E7EB",
  fontSize: "14px",
  cursor: "pointer",
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
  fontSize: "12px",
  marginBottom: "6px",
};
const progressTrack = {
  background: "#374151",
  borderRadius: "6px",
  overflow: "hidden",
  height: "8px",
  marginTop: "8px",
};
const progressFill = {
  background: "#17E8E5",
  height: "8px",
  transition: "width 0.5s ease",
};
const progressText = { fontSize: "11px", color: "#9CA3AF", marginTop: "4px" };


