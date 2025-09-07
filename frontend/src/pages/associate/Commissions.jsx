import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Commissions() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  // Decode email from JWT
  let email = "";
  if (token) {
    try {
      email = JSON.parse(atob(token.split(".")[1])).email;
    } catch (e) {
      console.error("Error decoding token:", e);
    }
  }

  // Fetch referral income summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/get-referral-income`, {
          params: { email },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching referral income:", err);
      } finally {
        setLoading(false);
      }
    };

    if (email) fetchSummary();
  }, [email, token]);

  // Group details by date
  const groupedByDate = summary
    ? summary.details.reduce((acc, d) => {
        if (!acc[d.date]) acc[d.date] = [];
        acc[d.date].push(d);
        return acc;
      }, {})
    : {};

  if (loading) return <p style={{ color: "#E5E7EB" }}>Loading commissions...</p>;
  if (!summary) return <p style={{ color: "#E5E7EB" }}>No commission data available.</p>;

  return (
    <div style={{ color: "#E5E7EB", padding: "20px" }}>
      <h2
        style={{
          marginBottom: "20px",
          fontFamily: "Orbitron, sans-serif",
          color: "#17E8E5",
        }}
      >
        My Commissions
      </h2>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { label: "Total Earnings", value: summary.total, color: "#E5E7EB" },
          { label: "Withdrawn", value: summary.withdrawn, color: "#E5E7EB" },
          { label: "Withdrawable", value: summary.withdrawable, color: "#17E8E5" },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              flex: "1",
              minWidth: "220px",
              padding: "18px",
              borderRadius: "12px",
              background: "rgba(17,24,39,0.8)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 0 15px rgba(23,232,229,0.2)",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "6px" }}>
              {card.label}
            </h3>
            <p style={{ fontSize: "22px", fontWeight: "700", color: card.color }}>
              ${card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Referral Details grouped by date */}
      <h3 style={{ marginTop: "30px", marginBottom: "12px", color: "#17E8E5" }}>
        Referral Earnings by Date
      </h3>
      <div
        style={{
          borderRadius: "12px",
          overflowX: "auto",
          background: "rgba(17,24,39,0.8)",
          boxShadow: "0 0 12px rgba(23,232,229,0.15)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
          <thead>
            <tr style={{ background: "rgba(31,41,55,0.9)" }}>
              {["Date", "Total Earnings", "Action"].map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: "12px",
                    textAlign: i === 2 ? "center" : "left",
                    fontSize: "14px",
                    color: "#9CA3AF",
                    fontWeight: "600",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedByDate).map(([date, records], i) => {
              const totalForDay = records.reduce((sum, r) => sum + r.commission, 0);
              return (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={tdStyle}>{date}</td>
                  <td style={{ ...tdStyle, color: "#17E8E5", fontWeight: "600" }}>
                    ${totalForDay.toFixed(2)}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <button onClick={() => setSelectedDate({ date, records })} style={btnTealSm}>
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Popup for details */}
      {selectedDate && (
        <div style={popupOverlay} onClick={() => setSelectedDate(null)}>
          <div style={popupBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "15px", color: "#17E8E5" }}>
              Details for {selectedDate.date}
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(55,65,81,0.8)" }}>
                  {["Referred User", "Investment", "Earning"].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        fontSize: "14px",
                        color: "#9CA3AF",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedDate.records.map((r, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={tdStyle}>{r.name || r.investor}</td>
                    <td style={tdStyle}>${r.roi_source}</td>
                    <td style={{ ...tdStyle, color: "#17E8E5", fontWeight: "600" }}>
                      ${r.commission}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setSelectedDate(null)} style={btnRed}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* === Styles === */
const tdStyle = {
  padding: "10px",
  fontSize: "14px",
  color: "#E5E7EB",
  fontFamily: "Inter, sans-serif",
};

const btnTealSm = {
  padding: "6px 14px",
  border: "none",
  borderRadius: "6px",
  background: "linear-gradient(135deg,#17E8E5,#14B8E5)",
  color: "#0B1220",
  fontWeight: "600",
  cursor: "pointer",
};

const btnRed = {
  marginTop: "15px",
  padding: "8px 16px",
  border: "none",
  borderRadius: "8px",
  background: "#EF4444",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer",
};

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
  padding: "25px",
  borderRadius: "12px",
  maxWidth: "600px",
  width: "100%",
  boxShadow: "0 0 20px rgba(23,232,229,0.3)",
};
