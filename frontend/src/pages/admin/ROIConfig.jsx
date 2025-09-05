import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminROI() {
  const [roi, setRoi] = useState(0);
  const [newRoi, setNewRoi] = useState("");
  const API = "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchRoi = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/admin/roi`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoi(res.data.percentage);
      } catch (err) {
        console.error("Error fetching ROI config:", err);
      }
    };
    fetchRoi();
  }, []);

  const updateRoi = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/admin/roi`, { percentage: parseFloat(newRoi) }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoi(res.data.percentage);
      setNewRoi("");
      alert("ROI updated successfully");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to update ROI");
    }
  };

  return (
    <div style={{ color: "#E5E7EB" }}>
      <h2>ROI Configuration</h2>
      <p style={{ marginTop: 10 }}>Current ROI: <strong>{roi}%</strong></p>

      <div style={{ marginTop: 20 }}>
        <input
          type="number"
          step="0.01"
          value={newRoi}
          onChange={(e) => setNewRoi(e.target.value)}
          placeholder="Enter new ROI %"
          style={{ padding: "8px", borderRadius: "6px", marginRight: "10px" }}
        />
        <button
          onClick={updateRoi}
          style={{
            padding: "8px 15px",
            background: "#3B82F6",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Update ROI
        </button>
      </div>
    </div>
  );
}
