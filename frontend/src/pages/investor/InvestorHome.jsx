import React, { useState, useEffect } from "react";
import axios from "axios";

export default function InvestorHome() {
  const [applied, setApplied] = useState(false);
  const [isAssociate, setIsAssociate] = useState(false);
  const [user, setUser] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [totalDeposits, setTotalDeposits] = useState(0);
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

        // Get deposits
        if (res.data.email) {
          const depRes = await axios.get(
            `${API}/investments?email=${res.data.email}`,
            { headers }
          );
          setDeposits(depRes.data);

          // Calculate total
          const total = depRes.data.reduce(
            (sum, d) => sum + Number(d.amount),
            0
          );
          setTotalDeposits(total);
        }
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
      <h2>Welcome Investor</h2>
      <p style={{ marginTop: 10 }}>
        You can deposit funds, withdraw profits, and track your ROI here.
      </p>

      {/* ✅ My Deposits */}
      <div
        style={{
          marginTop: 30,
          padding: "15px",
          borderRadius: "8px",
          background: "#111827",
          maxWidth: "600px",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>💰 My Deposits</h3>

        {/* Total Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
            borderBottom: "2px solid #374151",
            fontWeight: "bold",
          }}
        >
          <span>Total Deposits</span>
          <span>{totalDeposits} USDT</span>
        </div>

        {/* Deposit List */}
        {deposits.length === 0 ? (
          <p style={{ color: "#9CA3AF", marginTop: "10px" }}>
            No deposits yet
          </p>
        ) : (
          deposits.map((d, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #374151",
                padding: "6px 0",
                fontSize: "14px",
              }}
            >
              <span>{d.amount} USDT</span>
              <span>{new Date(d.timestamp).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>

      {/* ✅ Associate Status / Button moved to bottom */}
      <div style={{ marginTop: 40, textAlign: "center" }}>
        {isAssociate ? (
          <p style={{ color: "#4ADE80" }}>
            🎉 Welcome, <strong>Associate</strong>! You now have referral access.
          </p>
        ) : !applied ? (
          <button
            onClick={applyForAssociate}
            style={{
              padding: "8px 16px",
              border: "1px solid #3B82F6",
              borderRadius: 6,
              background: "transparent",
              color: "#3B82F6",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Apply to become Associate
          </button>
        ) : (
          <p style={{ color: "#FACC15" }}>
            ⏳ Pending approval from Admin...
          </p>
        )}
      </div>
    </div>
  );
}
