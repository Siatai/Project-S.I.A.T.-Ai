import React, { useState, useEffect } from "react";
import axios from "axios";

export default function InvestorHome() {
  const [applied, setApplied] = useState(false);
  const [isAssociate, setIsAssociate] = useState(false);
  const [user, setUser] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
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
      <div style={{ ...cardStyle, position: "relative" }}>
        {/* Info Icon in Top Right */}
        {summary && (
          <span
            onClick={() => setShowInfo(true)}
            style={{
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
            }}
          >
            i
          </span>
        )}

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
          <div style={{ marginBottom: "25px" }}>
            <div style={glowRowTotal}>
              <span>Total Deposits</span>
              <span>{summary.total_invested} USDT</span>
            </div>
            <ProgressBarBig
              percent={summary.progress_percent}
              received={summary.total_received}
              max={summary.total_max_return}
            />
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
              <ProgressBarSmall
                percent={d.progress_percent}
                received={d.roi_received}
                max={d.max_return}
              />
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
  );
}

/* === Big 3D Progress Bar for Total === */
function ProgressBarBig({ percent, received, max }) {
  return (
    <div style={{ marginTop: "10px" }}>
      <div
        style={{
          background: "linear-gradient(145deg, #1F2937, #111827)",
          borderRadius: "12px",
          overflow: "hidden",
          height: "18px",
          boxShadow:
            "inset 3px 3px 6px rgba(0,0,0,0.6), inset -3px -3px 6px rgba(255,255,255,0.1)",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            background: "linear-gradient(90deg,#17E8E5,#14B8E5)",
            height: "100%",
            borderRadius: "12px",
            boxShadow:
              "0 0 15px rgba(23,232,229,0.7), inset 0 0 6px rgba(255,255,255,0.2)",
            transition: "width 0.6s ease",
          }}
        ></div>
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "12px",
            fontWeight: "700",
            color: "#0B1220",
            textShadow: "0 0 5px rgba(255,255,255,0.7)",
          }}
        >
          {percent}%
        </span>
      </div>
      <p
        style={{
          marginTop: "6px",
          fontSize: "13px",
          color: "#9CA3AF",
          textAlign: "center",
        }}
      >
        ROI Received: {received} / {max} USDT
      </p>
    </div>
  );
}

/* === Small 3D Progress Bar for Individual Deposits === */
function ProgressBarSmall({ percent, received, max }) {
  return (
    <div style={{ marginTop: "6px" }}>
      <div
        style={{
          background: "linear-gradient(145deg, #1F2937, #111827)",
          borderRadius: "8px",
          overflow: "hidden",
          height: "12px",
          boxShadow:
            "inset 2px 2px 5px rgba(0,0,0,0.6), inset -2px -2px 5px rgba(255,255,255,0.1)",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            background: "linear-gradient(90deg,#17E8E5,#14B8E5)",
            height: "100%",
            borderRadius: "8px",
            boxShadow:
              "0 0 10px rgba(23,232,229,0.7), inset 0 0 4px rgba(255,255,255,0.2)",
            transition: "width 0.6s ease",
          }}
        ></div>
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "10px",
            fontWeight: "600",
            color: "#0B1220",
            textShadow: "0 0 4px rgba(255,255,255,0.7)",
          }}
        >
          {percent}%
        </span>
      </div>
      <p
        style={{
          marginTop: "4px",
          fontSize: "12px",
          color: "#9CA3AF",
          textAlign: "center",
        }}
      >
        ROI: {received} / {max} USDT
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

/* === Popup Styles === */
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
