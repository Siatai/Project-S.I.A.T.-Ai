import React, { useState, useEffect } from "react";
import axios from "axios";

export default function InvestorHome() {
  const [applied, setApplied] = useState(false);
  const [isAssociate, setIsAssociate] = useState(false);
  const API = "http://127.0.0.1:8000/api";

  // 🔹 Check user status on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.is_associate) {
          setIsAssociate(true);
        }
        if (res.data.pending_associate) {
          setApplied(true);
        }
      } catch (err) {
        console.error("Error fetching user status:", err);
      }
    };

    fetchUser();
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

  return (
    <div style={{ color: "#E5E7EB" }}>
      <h2>Welcome Investor</h2>
      <p style={{ marginTop: 10 }}>
        You can deposit funds, withdraw profits, and track your ROI here.
      </p>

      {/* ✅ Associate Status */}
      {isAssociate ? (
        <p style={{ marginTop: 20, color: "#4ADE80" }}>
          🎉 Welcome, <strong>Associate</strong>! You now have referral access.
        </p>
      ) : !applied ? (
        <button
          onClick={applyForAssociate}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            border: "none",
            borderRadius: 6,
            background: "#3B82F6",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Apply to become Associate
        </button>
      ) : (
        <p style={{ marginTop: 20, color: "#FACC15" }}>
          ⏳ Pending approval from Admin...
        </p>
      )}
    </div>
  );
}
