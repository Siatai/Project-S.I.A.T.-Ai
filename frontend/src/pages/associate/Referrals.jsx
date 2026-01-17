import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import AssociateNavbar from "./AssociateNavbar";
import HudLoader from "../../Components/HudLoader";

export default function Referrals() {
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReferee, setSelectedReferee] = useState(null); // { name, email }
  const [packages, setPackages] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  //  build headers safely
  const headers = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  //  Global styles
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "var(--fx-hero)";
    document.body.style.overflowX = "hidden";
  }, []);

  //  Load referrals + deposits together
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.warn(" No token found in localStorage");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. ROI commissions
        const roiRes = await axios.get(`${API}/associate-roi-status`, { headers });
        const depositData = roiRes.data.details || [];

        // 2. All referrals (invested or not)
        const refRes = await axios.get(`${API}/associate/referrals`, { headers });
        const refereesList = refRes.data.referrals || [];

        // 3. Merge ROI + referrals
        const merged = refereesList.map((r) => {
          const dep = depositData.filter((d) => d.referee_email === r.email);
          const earned = dep.reduce((s, d) => s + (d.commission_earned || 0), 0);
          const left = dep.reduce((s, d) => s + (d.commission_left || 0), 0);
          return {
            id: r.id,
            name: r.name || "Unknown User",
            email: r.email,
            earned,
            left,
            total: earned + left,
          };
        });

        setReferees(merged);
      } catch (err) {
        console.error("Error fetching referrals:", err?.response?.data || err?.message);
        alert(err?.response?.data?.detail || "Failed to load referrals. Please login again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, headers]);

  //  Load referral packages (direct bonuses)
  const fetchReferralPackages = async (refEmail) => {
    try {
      const res = await axios.get(
        `${API}/associate/referral-packages?email=${refEmail}`,
        { headers }
      );
      const sorted = (res.data.packages || []).sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      setPackages(sorted);
    } catch (err) {
      console.error("Error fetching referral packages:", err?.response?.data || err?.message);
    }
  };

  //  Handle withdraw/reinvest
  const handleAction = async (pkgId, action) => {
    try {
      setActionLoading(pkgId + action);
      const url = `${API}/associate/direct-bonuses/${pkgId}/${action}`;
      const res = await axios.post(url, {}, { headers });
      alert(res.data.message || "Action successful");
      if (selectedReferee) fetchReferralPackages(selectedReferee.email);
    } catch (err) {
      console.error("Error:", err?.response?.data || err?.message);
      alert(err?.response?.data?.detail || "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <HudLoader text="Loading referrals" />;

  //  Totals
  const totalEarned = referees.reduce((s, r) => s + r.earned, 0);
  const totalLeft = referees.reduce((s, r) => s + r.left, 0);
  const totalAll = totalEarned + totalLeft;

  return (
    <div style={pageWrapper}>
      <AssociateNavbar />
      <main style={mainContent}>
        <h2 style={headerTitle}>Referral Earnings</h2>

        {/* === TOTAL BAR === */}
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
                background: "var(--fx-button)",
              }}
            />
          </div>
          <p style={mutedText}>
            Earned: ${totalEarned.toFixed(2)} | Left: ${totalLeft.toFixed(2)}
          </p>
        </div>

        {/* === PER REFEREE === */}
        <h3 style={subHeader}>Referrals</h3>
        {referees.length === 0 && (
          <p style={{ color: "var(--fx-muted)" }}>No referrals yet.</p>
        )}
        {referees.map((r, i) => {
          const percentLeft = r.total > 0 ? (r.left / r.total) * 100 : 0;
          return (
            <div
              key={i}
              style={{ ...cardStyle, cursor: "pointer" }}
              onClick={() => {
                setSelectedReferee({ name: r.name, email: r.email });
                fetchReferralPackages(r.email);
              }}
            >
              <div style={glowRow}>
                <span style={{ color: "var(--fx-accent)", fontWeight: "600" }}>
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
                    background: "var(--fx-button)",
                  }}
                />
              </div>
              <p style={mutedText}>
                Earned: ${r.earned.toFixed(2)} | Left: ${r.left.toFixed(2)}
              </p>
            </div>
          );
        })}

        {/* === POPUP === */}
        {selectedReferee && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <div style={modalHeader}>
                <button
                  onClick={() => setSelectedReferee(null)}
                  style={backBtn}
                >
                   Back
                </button>
                <button
                  onClick={() => setSelectedReferee(null)}
                  style={closeBtn}
                >
                  X
                </button>
              </div>
              <h3 style={{ color: "var(--fx-accent)", marginBottom: "10px" }}>
                {selectedReferee.name}  Bonuses
              </h3>

              {packages.length === 0 && (
                <p style={{ color: "var(--fx-muted)" }}>No bonuses yet</p>
              )}

              <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
                {packages.map((pkg, i) => {
                  const now = new Date();
                  const maturedAt = new Date(pkg.matured_at);
                  const investedAt = new Date(pkg.timestamp);
                  const totalDays = pkg.lock_days || 30;
                  const daysLeft = Math.max(
                    0,
                    Math.ceil((maturedAt - now) / (1000 * 60 * 60 * 24))
                  );
                  const percentDone = Math.min(
                    100,
                    Math.max(0, ((totalDays - daysLeft) / totalDays) * 100)
                  );

                  return (
                    <div key={pkg.id || i} style={depositCard}>
                      <p>
                        <strong>Bonus Amount:</strong> {pkg.bonus_amount} USDT
                      </p>
                      <p>
                        <strong>From Deposit:</strong> {pkg.amount} USDT
                      </p>
                      <p>
                        <strong>Start Date:</strong>{" "}
                        {investedAt.toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Status:</strong> {pkg.status}
                      </p>
                      <div style={progressTrack}>
                        <div
                          style={{
                            ...progressFill,
                            width: `${percentDone}%`,
                            background: "var(--fx-success)",
                          }}
                        />
                      </div>
                      <p style={mutedText}>
                        {daysLeft > 0
                          ? `${daysLeft} days left`
                          : "Unlocked ready!"}
                      </p>
                      <p style={{ color: "var(--fx-muted)", fontSize: "12px" }}>
                        Matures: {maturedAt.toLocaleDateString()}
                      </p>
                      <div style={{ marginTop: "10px" }}>
                        <button
                          style={
                            pkg.status !== "Matured" || actionLoading
                              ? btnDisabled
                              : btnPrimary
                          }
                          disabled={pkg.status !== "Matured" || actionLoading}
                          onClick={() => handleAction(pkg.id, "withdraw")}
                        >
                          {actionLoading === pkg.id + "withdraw"
                            ? "Processing..."
                            : "Withdraw"}
                        </button>
                        <button
                          style={
                            pkg.status !== "Matured" || actionLoading
                              ? btnDisabled
                              : btnSecondary
                          }
                          disabled={pkg.status !== "Matured" || actionLoading}
                          onClick={() => handleAction(pkg.id, "reinvest")}
                        >
                          {actionLoading === pkg.id + "reinvest"
                            ? "Processing..."
                            : "Re-stake"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
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
const mainContent = { padding: "20px", marginTop: "80px" };
const headerTitle = { marginBottom: "20px", color: "var(--fx-accent)" };
const subHeader = { margin: "20px 0 12px", color: "var(--fx-accent)" };
const cardStyle = {
  padding: "16px",
  borderRadius: "14px",
  marginBottom: "18px",
  background: "var(--fx-card)",
  border: "1px solid var(--fx-border)",
  boxShadow: "var(--fx-shadow)",
};
const glowRow = { display: "flex", justifyContent: "space-between", marginBottom: "8px" };
const progressTrack = {
  background: "var(--fx-rail)",
  borderRadius: "6px",
  overflow: "hidden",
  height: "14px",
  marginTop: "6px",
  position: "relative",
};
const progressFill = { height: "100%", transition: "width 0.6s ease" };
const mutedText = { color: "var(--fx-muted)", fontSize: "13px", marginTop: "6px" };
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
  background: "var(--fx-card)",
  border: "1px solid var(--fx-border)",
  padding: "20px",
  borderRadius: "12px",
  width: "90%",
  maxWidth: "500px",
  color: "var(--fx-ink)",
  position: "relative",
  boxShadow: "var(--fx-shadow)",
};
const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
};
const backBtn = {
  background: "rgba(var(--fx-accent-2-rgb),0.12)",
  border: "1px solid rgba(var(--fx-accent-2-rgb),0.4)",
  color: "var(--fx-accent-2)",
  padding: "4px 10px",
  borderRadius: "6px",
  cursor: "pointer",
};
const closeBtn = {
  background: "var(--fx-hero)",
  border: "none",
  color: "var(--fx-ink)",
  fontSize: "18px",
  cursor: "pointer",
};
const depositCard = {
  background: "var(--fx-card-strong)",
  border: "1px solid var(--fx-border)",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "12px",
};
const btnPrimary = {
  background: "linear-gradient(135deg, var(--fx-button), var(--fx-button-2))",
  border: "none",
  padding: "8px 14px",
  marginRight: "10px",
  borderRadius: "6px",
  cursor: "pointer",
  color: "var(--fx-bg)",
};
const btnSecondary = {
  background: "linear-gradient(135deg, var(--fx-gold), var(--fx-accent-2))",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  color: "var(--fx-bg)",
};
const btnDisabled = {
  background: "var(--fx-rail)",
  border: "none",
  padding: "8px 14px",
  marginRight: "10px",
  borderRadius: "6px",
  color: "var(--fx-muted)",
  cursor: "not-allowed",
};
