import React, { useEffect, useState } from "react";
import axios from "axios";
import InvestorNavbar from "./Navbar";

export default function InvestorEarn() {
  const [directPct, setDirectPct] = useState(0);
  const [commissionPct, setCommissionPct] = useState(0);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  // 🔹 Apply global dark background + reset body
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "var(--fx-hero)";
    document.body.style.overflowX = "hidden";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 🔹 Direct referral %
        const commRes = await axios.get(`${API}/commission-percent`, {
          headers,
        });
        setDirectPct(commRes.data.commission_percent || 0);

        // 🔹 Team commission %
        const configRes = await axios.get(`${API}/associate/admin/config`, {
          headers,
        });
        setCommissionPct(configRes.data.referral_percent || 0);
      } catch (err) {
        console.error("Error fetching earn data:", err);
      }
    };
    if (token) fetchData();
  }, [token]);

  // 🔹 Handle Apply Now
  const handleApply = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API}/request-associate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: "success", text: res.data.message });
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.detail || "Failed to submit request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapper}>
      <InvestorNavbar />

      <div style={wrapper}>
        {/* Hero Card */}
        <div style={heroCard}>
          <h2 style={heroTitle}>Apply to Become an Associate</h2>
          <p style={heroSubtitle}>
            Earn{" "}
            <span style={{ color: "var(--fx-accent)", fontWeight: "600" }}>
              {directPct}%
            </span>{" "}
            direct referral bonus and{" "}
            <span style={{ color: "var(--fx-gold)", fontWeight: "600" }}>
              {commissionPct}%
            </span>{" "}
            of your investors’ monthly income.
          </p>
        </div>

        {/* Apply Now Button */}
        <div style={ctaBox}>
          <button style={btnApply} onClick={handleApply} disabled={loading}>
            {loading ? "Submitting..." : "Apply Now"}
          </button>
          {message && <div style={msgBox(message.type)}>{message.text}</div>}
        </div>

        {/* Why Join Card */}
        <div style={card}>
          <h3 style={cardTitle}>Why Join?</h3>
          <ul style={listStyle}>
            <li>
              <strong>Instant Payouts:</strong> Get rewarded with {directPct}%
              commission whenever you refer a new investor.
            </li>
            <li>
              <strong>Residual Income:</strong> Earn {commissionPct}% every
              month from the profits of your referred investors.
            </li>
            <li>
              <strong>Unlimited Growth:</strong> The more your network grows,
              the higher your recurring income.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* === Styles === */
const pageWrapper = {
  background: "transparent", // 🔹 dark background
  color: "var(--fx-ink)",
  minHeight: "100vh",        // ✅ full screen
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",         // ✅ scrollable
};

const wrapper = {
  padding: "100px 20px 70px", // ✅ header + footer safe space
  textAlign: "center",
};

const heroCard = {
  background: "var(--fx-card-strong)",
  borderRadius: "14px",
  padding: "25px 20px",
  border: "1px solid var(--fx-border)",
  boxShadow: "var(--fx-shadow)",
  marginBottom: "20px",
};

const heroTitle = {
  fontSize: "22px",
  fontWeight: "700",
  fontFamily: "var(--fx-font-display)",
  marginBottom: "10px",
  color: "var(--fx-accent)",
};

const heroSubtitle = {
  fontSize: "15px",
  lineHeight: "1.5",
  color: "var(--fx-ink)",
};

const card = {
  background: "var(--fx-card)",
  borderRadius: "12px",
  padding: "20px",
  marginTop: "20px",
  textAlign: "left",
  border: "1px solid var(--fx-border)",
  boxShadow: "var(--fx-shadow)",
};

const cardTitle = {
  fontSize: "18px",
  fontWeight: "600",
  marginBottom: "12px",
  color: "var(--fx-accent)",
};

const listStyle = {
  listStyle: "disc",
  paddingLeft: "20px",
  lineHeight: "1.6",
  fontSize: "14px",
  color: "var(--fx-ink)",
};

const ctaBox = { textAlign: "center", margin: "10px 0 20px" };

const btnApply = {
  padding: "14px 24px",
  fontSize: "16px",
  fontWeight: "700",
  borderRadius: "8px",
  background: "linear-gradient(135deg, var(--fx-button), var(--fx-button-2))",
  border: "none",
  cursor: "pointer",
  color: "var(--fx-bg)",
  boxShadow: "0 0 12px rgba(var(--fx-accent-rgb),0.4)",
};

const msgBox = (type) => ({
  marginTop: "12px",
  padding: "10px",
  borderRadius: "8px",
  background:
    type === "error" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
  border: `1px solid ${type === "error" ? "var(--fx-danger)" : "var(--fx-success)"}`,
  color: type === "error" ? "var(--fx-danger)" : "var(--fx-success-2)",
  fontSize: "14px",
});
