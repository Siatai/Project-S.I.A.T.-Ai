import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AssociateHome() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("my"); // "my" | "referral"
  const [myDeposits, setMyDeposits] = useState([]);
  const [referralDeposits, setReferralDeposits] = useState([]);
  const [teamDeposits, setTeamDeposits] = useState([]);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [commissionRate, setCommissionRate] = useState(null);
  const [roiMultiplier, setRoiMultiplier] = useState(2.0);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const ADMIN_EMAIL = "admin@algomcube.com"; // 🔑 admin email

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 🟢 User info
        const res = await axios.get(`${API}/me`, { headers });
        setUser(res.data);

        // 🟢 Fetch deposits only for non-admin
        if (res.data?.email && res.data.email !== ADMIN_EMAIL) {
          const depRes = await axios.get(
            `${API}/investments?email=${res.data.email}`,
            { headers }
          );
          const all = depRes.data || [];
          setMyDeposits(all.filter((d) => !d.is_associate));
          setReferralDeposits(all.filter((d) => d.is_associate));
        }

        // 🟢 Team deposits
        const teamRes = await axios.get(`${API}/associate-roi-status`, {
          headers,
        });
        setTeamDeposits(teamRes.data.details || []);
        setTotalReceivable(teamRes.data.total_commission_left || 0);

        // 🟢 Commission %
        const commRes = await axios.get(`${API}/commission-percent`, {
          headers,
        });
        setCommissionRate(commRes.data.commission_percent || 0);

        // 🟢 ROI Config
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
    <div
      style={{
        color: "#E5E7EB",
        padding: "20px",
        maxWidth: "750px",
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

      {/* Deposits Section with Tabs (skip for admin) */}
      {user.email !== ADMIN_EMAIL && (
        <div style={cardStyle}>
          {/* Tabs */}
          <div style={tabsWrapper}>
            <button
              onClick={() => setActiveTab("my")}
              style={activeTab === "my" ? tabActive : tabInactive}
            >
              Deposits
            </button>
            <button
              onClick={() => setActiveTab("referral")}
              style={activeTab === "referral" ? tabActive : tabInactive}
            >
              Referral Investments
            </button>
          </div>

          {/* My Deposits */}
          {activeTab === "my" && (
            <>
              <TotalBox title="Total Deposits" deposits={myDeposits} />
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
            </>
          )}

          {/* Referral Deposits */}
          {activeTab === "referral" && (
            <>
              <TotalBox title="Total Referral Deposits" deposits={referralDeposits} />
              {referralDeposits.length === 0 ? (
                <p style={{ color: "#9CA3AF" }}>
                  No referral-based deposits yet.
                </p>
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
            </>
          )}
        </div>
      )}

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
            const percent = total > 0 ? (d.commission_earned / total) * 100 : 0;
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
                  <div style={{ ...progressFill, width: `${percent}%` }}></div>
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

/* === Subcomponents === */
function DepositCard({ data, multiplier, label }) {
  const roiReceived = data.roi_received || 0;
  const maxReturn = (data.amount || 0) * (multiplier || 2);
  const percent = maxReturn > 0 ? (roiReceived / maxReturn) * 100 : 0;

  // Unlock time left
  let unlockMsg = "";
  if (data.matured_at) {
    const now = new Date();
    const diff = new Date(data.matured_at) - now;
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      unlockMsg = `${days}d ${hours}h ${mins}m left`;
    } else {
      unlockMsg = "Unlocked ✅";
    }
  }

  return (
    <div style={depositCard}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{data.amount} USDT</span>
        <span>{new Date(data.timestamp).toLocaleDateString()}</span>
      </div>
      <small style={{ color: "#9CA3AF" }}>{label}</small>
      <div style={progressTrack}>
        <div style={{ ...progressFill, width: `${percent}%` }}></div>
      </div>
      <p style={progressText}>
        ROI: {roiReceived.toFixed(2)} / {maxReturn.toFixed(2)} USDT
      </p>
      {unlockMsg && (
        <p style={{ fontSize: "11px", color: "#FACC15" }}>{unlockMsg}</p>
      )}
    </div>
  );
}

function TotalBox({ title, deposits }) {
  const total = deposits.reduce((s, d) => s + d.amount, 0);
  return (
    <div style={totalBox}>
      <span>{title}</span>
      <strong style={{ color: "#17E8E5" }}>{total.toFixed(2)} USDT</strong>
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
const helpText = { marginTop: "8px", fontSize: "12px", color: "#9CA3AF" };
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
const totalBox = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
  padding: "10px",
  borderRadius: "8px",
  background: "rgba(31,41,55,0.7)",
  fontWeight: "600",
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
  marginTop: "8px",
};
const progressFill = {
  background: "#17E8E5",
  height: "8px",
  transition: "width 0.5s ease",
};
const progressText = { fontSize: "11px", color: "#9CA3AF", marginTop: "4px" };
const tabsWrapper = {
  display: "flex",
  marginBottom: "15px",
  borderBottom: "2px solid #1F2937",
};
const tabActive = {
  flex: 1,
  padding: "12px",
  border: "none",
  borderBottom: "3px solid #17E8E5",
  background: "transparent",
  color: "#17E8E5",
  fontWeight: "700",
  cursor: "pointer",
};
const tabInactive = {
  flex: 1,
  padding: "12px",
  border: "none",
  borderBottom: "3px solid transparent",
  background: "transparent",
  color: "#9CA3AF",
  fontWeight: "600",
  cursor: "pointer",
};
const tableHeader = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  fontWeight: "600",
  fontSize: "14px",
  color: "#9CA3AF",
  margin: "10px 0",
};
