import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminROI() {
  const [percentage, setPercentage] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const API = "https://project-s-i-a-t-ai.onrender.com";

  // Fetch config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/admin/roi`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPercentage(res.data.percentage || 0);
        setMultiplier(res.data.max_roi_multiplier || 2);
      } catch (err) {
        console.error("Error fetching ROI config:", err);
        alert("Failed to fetch ROI config");
      }
    };
    fetchConfig();
  }, []);

  // Save updated config
  const saveConfig = async () => {
    try {
      const token = localStorage.getItem("token");

      // First update ROI percentage
      await axios.post(
        `${API}/admin/roi`,
        { percentage: parseFloat(percentage) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Then update multiplier
      await axios.post(
        `${API}/admin/set-roi-config`,
        { multiplier: parseFloat(multiplier) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ ROI configuration updated successfully");
    } catch (err) {
      console.error("Error updating ROI config:", err);
      alert(err?.response?.data?.detail || "❌ Failed to update ROI config");
    }
  };

  return (
    <div
      style={{
        background: "#1E293B",
        color: "#E5E7EB",
        padding: "20px",
        borderRadius: "10px",
        maxWidth: "400px",
      }}
    >
      <h2 style={{ color: "#17E8E5", marginBottom: "15px" }}>
        ROI Configuration
      </h2>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "6px" }}>
          Monthly ROI Percentage (%)
        </label>
        <input
          type="number"
          step="0.01"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #374151",
            background: "#111827",
            color: "#E5E7EB",
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "6px" }}>
          Max ROI Multiplier (e.g., 2x)
        </label>
        <input
          type="number"
          step="0.1"
          value={multiplier}
          onChange={(e) => setMultiplier(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #374151",
            background: "#111827",
            color: "#E5E7EB",
          }}
        />
      </div>

      <button
        onClick={saveConfig}
        style={{
          width: "100%",
          padding: "10px",
          border: "none",
          borderRadius: "8px",
          background: "#17E8E5",
          color: "#0B1220",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Save Configuration
      </button>
    </div>
  );
}
