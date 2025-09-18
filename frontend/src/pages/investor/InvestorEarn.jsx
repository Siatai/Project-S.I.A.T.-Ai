import React, { useEffect, useState } from "react";
import axios from "axios";
import InvestorNavbar from "./Navbar";

export default function InvestorEarn() {
  const [directPct, setDirectPct] = useState(0);
  const [commissionPct, setCommissionPct] = useState(0);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 🔹 Direct referral %
        const commRes = await axios.get(`${API}/commission-percent`, {
          headers,
        });
        setDirectPct(commRes.data.commission_percent || 0);

        // 🔹 Team commission % (safe for investors)
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

  return (
    <div style={{ color: "#E5E7EB", paddingBottom: "1px" }}>
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

        {/* Apply Now Button (moved above Why Join) */}
        <div style={ctaBox}>
          <button style={btnApply}>Apply Now</button>
        </div>

        {/* Why Join Card */}
        <div style={card}>
          <h3 style={cardTitle}>Why Join?</h3>
          <ul style={listStyle}>
            <li>
              <strong>Instant Payouts:</strong> Get rewarded with {directPct}% commission whenever you refer a new investor.
            </li>
            <li>
              <strong>Residual Income:</strong> Earn {commissionPct}% every month from the profits of your referred investors.
            </li>
            <li>
              <strong>Unlimited Growth:</strong> The more your network grows, the higher your recurring income.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* === Styles === */
const wrapper = { padding: "80px 20px 20px", textAlign: "center" };

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
