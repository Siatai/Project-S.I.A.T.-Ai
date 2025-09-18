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
    document.body.style.background = "#0f172a";
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
            <span style={{ color: "#17E8E5", fontWeight: "600" }}>
              {directPct}%
            </span>{" "}
            direct referral bonus and{" "}
            <span style={{ color: "#FACC15", fontWeight: "600" }}>
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
  backgroundColor: "#0f172a", // 🔹 dark background
  color: "#E5E7EB",
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
  background: "linear-gradient(145deg,#1E293B,#0F172A)",
  borderRadius: "14px",
  padding: "25px 20px",
  boxShadow: "0 0 20px rgba(23,232,229,0.25)",
  marginBottom: "20px",
};

const heroTitle = {
  fontSize: "22px",
  fontWeight: "700",
  fontFamily: "Orbitron, sans-serif",
  marginBottom: "10px",
  color: "#17E8E5",
};

const heroSubtitle = {
  fontSize: "15px",
  lineHeight: "1.5",
  color: "#E5E7EB",
};

const card = {
  background: "rgba(17,24,39,0.9)",
  borderRadius: "12px",
  padding: "20px",
  marginTop: "20px",
  textAlign: "left",
  boxShadow: "0 0 12px rgba(23,232,229,0.15)",
};

const cardTitle = {
  fontSize: "18px",
  fontWeight: "600",
  marginBottom: "12px",
  color: "#17E8E5",
};

const listStyle = {
  listStyle: "disc",
  paddingLeft: "20px",
  lineHeight: "1.6",
  fontSize: "14px",
  color: "#E5E7EB",
};

const ctaBox = { textAlign: "center", margin: "10px 0 20px" };

const btnApply = {
  padding: "14px 24px",
  fontSize: "16px",
  fontWeight: "700",
  borderRadius: "8px",
  background: "linear-gradient(135deg,#17E8E5,#14B8E5)",
  border: "none",
  cursor: "pointer",
  color: "#0B1220",
  boxShadow: "0 0 12px rgba(23,232,229,0.4)",
};

const msgBox = (type) => ({
  marginTop: "12px",
  padding: "10px",
  borderRadius: "8px",
  background:
    type === "error" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
  border: `1px solid ${type === "error" ? "#EF4444" : "#10B981"}`,
  color: type === "error" ? "#F87171" : "#34D399",
  fontSize: "14px",
});
