import React, { useEffect, useState } from "react";
import axios from "axios";
import AssociateNavbar from "./AssociateNavbar"; // ✅ Navbar

export default function Referrals() {
  const [teamDeposits, setTeamDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReferee, setSelectedReferee] = useState(null);
  const [message, setMessage] = useState(null);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ✅ Global bg
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "#0f172a";
    document.body.style.overflowX = "hidden";
  }, []);

  // ✅ Load ROI summary (earned/left)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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

  // ✅ Group deposits by referee (name + email)
  const grouped = teamDeposits.reduce((acc, d) => {
    const name = d.referee_name || "Unknown User";
    const email = d.referee_email || "unknown@email";
    if (!acc[email]) acc[email] = { name, email, earned: 0, left: 0 };
    acc[email].earned += d.commission_earned || 0;
    acc[email].left += d.commission_left || 0;
    return acc;
  }, {});

  const referees = Object.values(grouped).map((r) => ({
    name: r.name,
    email: r.email,
    earned: r.earned,
    left: r.left,
    total: r.earned + r.left,
  }));

  const totalEarned = referees.reduce((s, r) => s + r.earned, 0);
  const totalLeft = referees.reduce((s, r) => s + r.left, 0);
  const totalAll = totalEarned + totalLeft;

  // ✅ On click, build a "virtual package"
  const handleRefClick = (ref) => {
    const lockDays = 30; // Or fetch from /associate-config if needed
    const now = new Date();
    const maturedAt = new Date();
    maturedAt.setDate(now.getDate() + lockDays);

    setSelectedReferee({
      ...ref,
      package: {
        amount: ref.left,
        status: ref.left > 0 ? "Locked" : "Matured",
        daysLeft: lockDays,
        maturedAt,
      },
    });
    setMessage(null);
  };

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
            <div
              style={{
                ...progressFill,
                width: totalAll > 0 ? `${(totalLeft / totalAll) * 100}%` : "0%",
                background: "#17E8E5",
              }}
            />
          </div>
          <p style={mutedText}>
            Earned: ${totalEarned.toFixed(2)} | Left: ${totalLeft.toFixed(2)}
          </p>
        </div>

        {/* === PER REFEREE BAR (clickable) === */}
        <h3 style={subHeader}>Referrals</h3>
        {referees.length === 0 && (
          <p style={{ color: "#9CA3AF" }}>No referrals yet.</p>
        )}
        {referees.map((r, i) => {
          const percentLeft = r.total > 0 ? (r.left / r.total) * 100 : 0;
          return (
            <div
              key={i}
              style={{ ...cardStyle, cursor: "pointer" }}
              onClick={() => handleRefClick(r)}
            >
              <div style={glowRow}>
                <span style={{ color: "#17E8E5", fontWeight: "600" }}>
                  {r.name}
                </span>
                <strong>
                  ${r.earned.toFixed(2)} / ${r.total.toFixed(2)}
                </strong>
              </div>
              <div style={progressTrack}>
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

        {/* === REFEREE PACKAGE MODAL === */}
        {selectedReferee && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <button
                onClick={() => setSelectedReferee(null)}
                style={closeBtn}
              >
                ✖
              </button>
              <h3 style={{ color: "#17E8E5", marginBottom: "10px" }}>
                {selectedReferee.name} – Commission Package
              </h3>
              {message && <p style={{ color: "#FACC15" }}>{message}</p>}

              {!selectedReferee.package ? (
                <p style={{ color: "#9CA3AF" }}>No package data</p>
              ) : (
                <div style={depositCard}>
                  <p>
                    <strong>Amount:</strong> {selectedReferee.package.amount} USDT
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedReferee.package.status}
                  </p>
                  <p>
                    <strong>Days Left:</strong> {selectedReferee.package.daysLeft}
                  </p>
                  <p>
                    <strong>Matures:</strong>{" "}
                    {selectedReferee.package.maturedAt.toLocaleDateString()}
                  </p>
                  <div style={{ marginTop: "10px" }}>
                    <button style={btnDisabled} disabled>
                      Withdraw
                    </button>
                    <button style={btnDisabled} disabled>
                      Re-stake
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* === Styles === */
const pageWrapper = {
  background: "#0f172a",
  minHeight: "100vh",
  color: "#E5E7EB",
};
const mainContent = { padding: "20px", marginTop: "80px" };
const headerTitle = { marginBottom: "20px", color: "#17E8E5" };
const subHeader = { margin: "20px 0 12px", color: "#17E8E5" };
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
};
const progressTrack = {
  background: "#374151",
  borderRadius: "6px",
  overflow: "hidden",
  height: "14px",
};
const progressFill = { height: "100%", transition: "width 0.6s ease" };
const mutedText = { color: "#9CA3AF", fontSize: "13px", marginTop: "6px" };
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};
const modalBox = {
  background: "#0f172a",
  padding: "20px",
  borderRadius: "12px",
  width: "90%",
  maxWidth: "500px",
  color: "#E5E7EB",
  position: "relative",
};
const closeBtn = {
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "transparent",
  border: "none",
  color: "#E5E7EB",
  fontSize: "18px",
  cursor: "pointer",
};
const depositCard = {
  background: "rgba(17,24,39,0.9)",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "12px",
};
const btnDisabled = {
  background: "#374151",
  border: "none",
  padding: "8px 14px",
  marginRight: "10px",
  borderRadius: "6px",
  color: "#9CA3AF",
  cursor: "not-allowed",
};
