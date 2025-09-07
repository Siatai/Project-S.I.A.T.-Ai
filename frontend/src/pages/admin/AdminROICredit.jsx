import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminROICredit() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [lastCredit, setLastCredit] = useState(null);

  const API = "https://project-s-i-a-t-ai.onrender.com";

  // 🔹 Fetch last credit date on mount
  useEffect(() => {
    const fetchLastCredit = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(`${API}/admin/last-roi-credit`, { headers });
        setLastCredit(res.data.last_credit);
      } catch (err) {
        console.error("Error fetching last credit date:", err);
      }
    };

    fetchLastCredit();
  }, [result]); // refresh after crediting

  const handleCreditROI = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.post(`${API}/admin/credit-daily-roi`, {}, { headers });
      setResult(res.data);
      alert(res.data.message);
    } catch (err) {
      console.error("Error crediting ROI:", err);
      alert(err?.response?.data?.detail || "❌ Failed to credit ROI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", color: "#E5E7EB" }}>
      <h2>📌 Credit ROI & Commission</h2>
      <p style={{ marginTop: 10 }}>
        Use this tool to manually credit daily ROI and commissions.  
        This should normally run automatically, but you can trigger it here if needed.
      </p>

      {/* Show last credit date */}
      <div style={{ marginTop: "10px", marginBottom: "20px" }}>
        <strong>Last Credited:</strong>{" "}
        {lastCredit ? new Date(lastCredit).toLocaleString() : "Never"}
      </div>

      {/* Action Button */}
      <button
        onClick={handleCreditROI}
        disabled={loading}
        style={{
          padding: "10px 20px",
          border: "none",
          borderRadius: "6px",
          background: loading ? "#9CA3AF" : "#3B82F6",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Processing..." : "Credit ROI & Commission"}
      </button>

      {/* Results */}
      {result && (
        <div
          style={{
            marginTop: 20,
            padding: "15px",
            borderRadius: "8px",
            background: "#111827",
            maxWidth: "700px",
          }}
        >
          <h3 style={{ marginBottom: 10 }}>{result.message}</h3>
          <p><strong>Total Users Credited:</strong> {result.count}</p>

          <div style={{ marginTop: 10 }}>
            {result.credited && result.credited.length > 0 ? (
              <table style={{ width: "100%", fontSize: "14px" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid #374151" }}>
                    <th style={{ padding: "6px" }}>Email</th>
                    <th style={{ padding: "6px" }}>Investment</th>
                    <th style={{ padding: "6px" }}>Daily Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {result.credited.map((c, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #374151" }}>
                      <td style={{ padding: "6px" }}>{c.email}</td>
                      <td style={{ padding: "6px" }}>{c.investment} USDT</td>
                      <td style={{ padding: "6px" }}>{c.daily_profit} USDT</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: "#9CA3AF" }}>No users credited today.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
