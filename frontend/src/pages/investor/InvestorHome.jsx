import React, { useState, useEffect } from "react";
import axios from "axios";

export default function InvestorHome() {
  const [applied, setApplied] = useState(false);
  const [isAssociate, setIsAssociate] = useState(false);
  const [user, setUser] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [summary, setSummary] = useState(null);
  const API = "https://project-s-i-a-t-ai.onrender.com";

  // 🔹 Fetch user and deposits
  useEffect(() => {
    const fetchUserAndDeposits = async () => {
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
      } catch (err) {
        console.error("Error fetching investor data:", err);
      }
    };
    fetchUserAndDeposits();
  }, []);

  // 🔹 Apply for associate
  const applyForAssociate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/request-associate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApplied(true);
      alert("Request sent to admin for approval.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Something went wrong");
    }
  };

  if (!user) return <p style={{ color: "#E5E7EB" }}>Loading...</p>;

  return (
    <div style={{ color: "#E5E7EB", padding: "20px" }}>
      <h2
        style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "22px",
          color: "#17E8E5",
        }}
      >
        Welcome, Investor
      </h2>
      <div style={glowLine} />
      <p style={{ marginTop: 10, color: "#9CA3AF" }}>
        You can deposit funds, withdraw profits, and track your ROI here.
      </p>

      {/* ✅ Deposits with Progress */}
      <div style={cardStyle}>
        <h3
          style={{
            marginBottom: "10px",
            fontSize: "18px",
            fontWeight: "600",
            color: "#17E8E5",
          }}
        >
          My Deposits
        </h3>
        <div style={glowLine} />

        {summary && (
          <div style={{ marginBottom: "20px" }}>
            <div style={glowRowTotal}>
              <span>Total Deposits</span>
              <span>{summary.total_invested} USDT</span>
            </div>
            <p style={{ fontSize: "13px", marginTop: "5px" }}>
              ROI Received: {summary.total_received} /{" "}
              {summary.total_max_return} USDT
            </p>
            <ProgressBar percent={summary.progress_percent} />
          </div>
        )}

        {deposits.length === 0 ? (
          <p style={{ color: "#9CA3AF", marginTop: "12px" }}>No deposits yet</p>
        ) : (
          deposits.map((d, idx) => (
            <div key={idx} style={{ marginBottom: "18px" }}>
              <div style={glowRowGreen}>
                <span>{d.capital} USDT</span>
                <span>
                   {d.timestamp ? new Date(d.timestamp).toLocaleDateString() : "-"}
                </span>

              </div>
              <p style={{ fontSize: "12px", marginTop: "5px" }}>
                ROI: {d.roi_received} / {d.max_return} USDT
              </p>
              <ProgressBar percent={d.progress_percent} />
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
          <p style={{ color: "#FACC15", fontWeight: "600" }}>
            ⏳ Pending approval from Admin...
          </p>
        )}
      </div>
    </div>
  );
}

/* === Small ProgressBar Component === */
function ProgressBar({ percent }) {
  return (
    <div
      style={{
        background: "#374151",
        borderRadius: "6px",
        overflow: "hidden",
        height: "8px",
        marginTop: "4px",
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          background: "#17E8E5",
          height: "8px",
          transition: "width 0.5s ease",
        }}
      ></div>
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

/* 🔹 Row for deposits */
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

/* 🔹 Special row for totals */
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
