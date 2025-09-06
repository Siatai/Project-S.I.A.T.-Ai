import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CommissionConfig() {
  const [levels, setLevels] = useState([{ level: 1, percentage: 0 }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  // 🔹 Fetch existing commission config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/admin/commission`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.length > 0) {
          setLevels(res.data);
        }
      } catch (err) {
        console.error("Error fetching commission config:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchConfig();
  }, [token]);

  // 🔹 Handle value changes
  const handleChange = (index, field, value) => {
    const updated = [...levels];
    updated[index][field] = Number(value);
    setLevels(updated);
  };

  // 🔹 Add new level row
  const addLevel = () => {
    setLevels([...levels, { level: levels.length + 1, percentage: 0 }]);
  };

  // 🔹 Save to backend
  const saveConfig = async () => {
    try {
      setSaving(true);
      await axios.post(
        `${API}/admin/commission`,
        { levels }, // ✅ Array of objects as backend expects
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Commission structure updated!");
    } catch (err) {
      console.error("Error saving commission config:", err);
      alert(err?.response?.data?.detail || "Failed to save config");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading commission config...</p>;

  return (
    <div style={{ color: "#E5E7EB" }}>
      <h2 style={{ marginBottom: "20px" }}>Commission Configuration</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr style={{ background: "#1F2937" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>Level</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Percentage (%)</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((lvl, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #374151" }}>
              <td style={{ padding: "10px" }}>{lvl.level}</td>
              <td style={{ padding: "10px" }}>
                <input
                  type="number"
                  value={lvl.percentage}
                  onChange={(e) => handleChange(i, "percentage", e.target.value)}
                  style={{ width: "80px", padding: "5px", borderRadius: "6px" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={addLevel}
        style={{
          marginRight: "10px",
          padding: "10px 20px",
          border: "none",
          borderRadius: "6px",
          background: "#3B82F6",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        ➕ Add Level
      </button>

      <button
        onClick={saveConfig}
        disabled={saving}
        style={{
          padding: "10px 20px",
          border: "none",
          borderRadius: "6px",
          background: "#22C55E",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        {saving ? "Saving..." : "Save Config"}
      </button>
    </div>
  );
}
