import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CommissionAndAssociateConfig() {
  const [levels, setLevels] = useState([{ level: 1, percentage: 0 }]);
  const [assocConfig, setAssocConfig] = useState({ referral_percent: 0, lock_days: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  // 🔹 Fetch existing configs
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch commission levels
        const commissionRes = await axios.get(`${API}/admin/commission`, { headers });
        if (commissionRes.data.length > 0) {
          setLevels(commissionRes.data);
        }

        // Fetch associate config
        const assocRes = await axios.get(`${API}/associate/admin/config`, { headers });
        if (assocRes.data) {
          setAssocConfig({
            referral_percent: assocRes.data.referral_percent,
            lock_days: assocRes.data.lock_days,
          });
        }
      } catch (err) {
        console.error("Error fetching config:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchConfig();
  }, [token]);

  // 🔹 Handle commission change
  const handleChange = (index, field, value) => {
    const updated = [...levels];
    updated[index][field] = Number(value);
    setLevels(updated);
  };

  // 🔹 Handle associate config change
  const handleAssocChange = (field, value) => {
    setAssocConfig({ ...assocConfig, [field]: Number(value) });
  };

  // 🔹 Add new commission level row
  const addLevel = () => {
    setLevels([...levels, { level: levels.length + 1, percentage: 0 }]);
  };

  // 🔹 Save commission + associate configs
  const saveConfig = async () => {
    try {
      setSaving(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Save commission levels
      await axios.post(`${API}/admin/commission`, { levels }, { headers });

      // Save associate config
      await axios.put(`${API}/associate/config`, assocConfig, { headers });

      alert("✅ Configurations updated!");
    } catch (err) {
      console.error("Error saving config:", err);
      alert(err?.response?.data?.detail || "Failed to save config");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading configuration...</p>;

  return (
    <div style={{ color: "var(--fx-ink)", padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>⚙️ Commission & Associate Configuration</h2>

      {/* Commission Table */}
      <h3>Commission Levels</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr style={{ background: "var(--fx-surface-strong)" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>Level</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Percentage (%)</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((lvl, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--fx-rail)" }}>
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
          background: "var(--fx-info)",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        ➕ Add Level
      </button>

      {/* Associate Config */}
      <div
        style={{
          marginTop: "40px",
          padding: "15px",
          borderRadius: "8px",
          background: "var(--fx-surface-strong)",
          maxWidth: "400px",
        }}
      >
        <h3>Associate Config</h3>
        <div style={{ marginTop: "10px" }}>
          <label>Referral Percent (%)</label>
          <input
            type="number"
            value={assocConfig.referral_percent}
            onChange={(e) => handleAssocChange("referral_percent", e.target.value)}
            style={{ width: "100px", marginLeft: "10px", padding: "5px", borderRadius: "6px" }}
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          <label>Lock Days</label>
          <input
            type="number"
            value={assocConfig.lock_days}
            onChange={(e) => handleAssocChange("lock_days", e.target.value)}
            style={{ width: "100px", marginLeft: "10px", padding: "5px", borderRadius: "6px" }}
          />
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={saveConfig}
          disabled={saving}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            background: "var(--fx-success)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {saving ? "Saving..." : "💾 Save All Configs"}
        </button>
      </div>
    </div>
  );
}
