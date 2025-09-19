import React, { useEffect, useState } from "react";
import axios from "axios";
import AssociateNavbar from "./AssociateNavbar"; // ✅ Navbar

export default function Referrals() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReferee, setSelectedReferee] = useState(null);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  // ✅ Global bg
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "#0f172a";
    document.body.style.overflowX = "hidden";
  }, []);

  // ✅ Load packages from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }; // moved inside
        setLoading(true);
        const res = await axios.get(`${API}/associate/referral-packages`, {
          headers,
        });
        setPackages(res.data.packages || []);
      } catch (err) {
        console.error("Error fetching referral packages:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  if (loading) return <p style={{ color: "#E5E7EB" }}>Loading referrals...</p>;

  // ✅ Group by referee email
  const grouped = packages.reduce((acc, p) => {
    if (!acc[p.referee_email]) acc[p.referee_email] = [];
    acc[p.referee_email].push(p);
    return acc;
  }, {});

  const referees = Object.keys(grouped).map((email) => ({
    email,
    packages: grouped[email],
    totalCommission: grouped[email].reduce(
      (s, p) => s + p.commission_amount,
      0
    ),
  }));

  const totalAll = packages.reduce((s, p) => s + p.commission_amount, 0);

  return (
    <div style={pageWrapper}>
      <AssociateNavbar />
      <main style={mainContent}>
        <h2 style={headerTitle}>Referral Earnings</h2>

        {/* === TOTAL SUMMARY === */}
        <div style={cardStyle}>
          <div style={glowRow}>
            <span>Total Commission from All Referrals</span>
            <strong>${totalAll.toFixed(2)}</strong>
          </div>
        </div>

        {/* === PER REFEREE === */}
        <h3 style={subHeader}>Referrals</h3>
        {referees.length === 0 && (
          <p style={{ color: "#9CA3AF" }}>No referrals yet.</p>
        )}
        {referees.map((r, i) => (
          <div
            key={i}
            style={{ ...cardStyle, cursor: "pointer" }}
            onClick={() => setSelectedReferee(r)}
          >
            <div style={glowRow}>
              <span style={{ color: "#17E8E5", fontWeight: "600" }}>
                {r.email}
              </span>
              <strong>${r.totalCommission.toFixed(2)}</strong>
            </div>
            <p style={mutedText}>Click to view packages</p>
          </div>
        ))}

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
                {selectedReferee.email} – Commission Packages
              </h3>

              {selectedReferee.packages.map((pkg, i) => {
                const maturedAt = new Date(pkg.matured_at);
                const now = new Date();
                const daysLeft = Math.max(
                  0,
                  Math.ceil((maturedAt - now) / (1000 * 60 * 60 * 24))
                );
                const status = daysLeft > 0 ? "Locked" : "Matured";

                return (
                  <div key={i} style={depositCard}>
                    <p>
                      <strong>Investment:</strong> {pkg.investment_amount} USDT
                    </p>
                    <p>
                      <strong>Commission:</strong> {pkg.commission_amount} USDT
                    </p>
                    <p>
                      <strong>Percentage:</strong> {pkg.percentage}%
                    </p>
                    <p>
                      <strong>Status:</strong> {status}
                    </p>
                    <p>
                      <strong>Days Left:</strong> {daysLeft}
                    </p>
                    <p>
                      <strong>Matures:</strong>{" "}
                      {maturedAt.toLocaleDateString()}
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
                );
              })}
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
