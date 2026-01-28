import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatAmount } from "../../utils/format";

export default function AdminROICredit() {
  const [loading, setLoading] = useState(false);
  const [forceLoading, setForceLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [lastCredit, setLastCredit] = useState(null);

  const API = "https://project-s-i-a-t-ai.onrender.com";

  // 🔹 Fetch last credit date on mount + after each run
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
  }, [result]);

  // 🔹 Normal credit (once/day)
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

  // 🔹 Force credit (multi-run / test)
  const handleForceCreditROI = async () => {
    try {
      setForceLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.post(`${API}/admin/force-credit-roi`, {}, { headers });
      setResult(res.data);
      alert(res.data.message);
    } catch (err) {
      console.error("Error force crediting ROI:", err);
      alert(err?.response?.data?.detail || "❌ Failed to force credit ROI");
    } finally {
      setForceLoading(false);
    }
  };

  // 🔹 Reset ROI dates (testing only)
  const handleResetROIDates = async () => {
    try {
      setResetLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(`${API}/admin/reset-roi-dates`, {}, { headers });
      alert("✅ ROI dates reset. You can re-run ROI crediting from scratch.");
    } catch (err) {
      console.error("Error resetting ROI dates:", err);
      alert(err?.response?.data?.detail || "❌ Failed to reset ROI dates");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", color: "var(--fx-ink)" }}>
      <h2>📌 Credit ROI & Commission</h2>
      <p style={{ marginTop: 10 }}>
        Normally ROI & commissions are credited automatically once per day.  
        Use the buttons below to trigger manually for testing.
      </p>

      {/* Show last credit date */}
      <div style={{ marginTop: "10px", marginBottom: "20px" }}>
        <strong>Last Credited:</strong>{" "}
        {lastCredit ? new Date(lastCredit).toLocaleString() : "Never"}
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={handleCreditROI}
          disabled={loading}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            background: loading ? "var(--fx-muted)" : "var(--fx-info)",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Processing..." : "Credit ROI (Safe)"}
        </button>

        <button
          onClick={handleForceCreditROI}
          disabled={forceLoading}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            background: forceLoading ? "var(--fx-muted)" : "var(--fx-gold)",
            color: "#fff",
            cursor: forceLoading ? "not-allowed" : "pointer",
          }}
        >
          {forceLoading ? "Processing..." : "Force Credit ROI (Test)"}
        </button>

        <button
          onClick={handleResetROIDates}
          disabled={resetLoading}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            background: resetLoading ? "var(--fx-muted)" : "var(--fx-danger)",
            color: "#fff",
            cursor: resetLoading ? "not-allowed" : "pointer",
          }}
        >
          {resetLoading ? "Resetting..." : "Reset ROI Dates"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div
          style={{
            marginTop: 20,
            padding: "15px",
            borderRadius: "8px",
            background: "var(--fx-surface-strong)",
            maxWidth: "800px",
          }}
        >
          <h3 style={{ marginBottom: 10 }}>{result.message}</h3>
          <p>
            <strong>Total Users Credited:</strong> {result.count}
          </p>

          <div style={{ marginTop: 10 }}>
            {result.credited && result.credited.length > 0 ? (
              <table style={{ width: "100%", fontSize: "14px" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--fx-rail)" }}>
                    <th style={{ padding: "6px" }}>Email</th>
                    <th style={{ padding: "6px" }}>Investment</th>
                    <th style={{ padding: "6px" }}>Days Credited</th>
                    <th style={{ padding: "6px" }}>Total Profit</th>
                    <th style={{ padding: "6px" }}>Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {result.credited.map((c, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--fx-rail)" }}>
                      <td style={{ padding: "6px" }}>{c.email}</td>
                      <td style={{ padding: "6px" }}>{formatAmount(c.investment)} USDT</td>
                      <td style={{ padding: "6px" }}>{c.days}</td>
                      <td style={{ padding: "6px" }}>{formatAmount(c.credited_profit)} USDT</td>
                      <td style={{ padding: "6px" }}>
                        {c.force_mode ? "Force" : "Safe"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: "var(--fx-muted)" }}>No users credited.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
