import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AssociateHome() {
  const [user, setUser] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const API = "https://project-s-i-a-t-ai.onrender.com";

  // Fetch user data + deposits
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(`${API}/me`, { headers });
        setUser(res.data);

        // Once user is fetched, fetch deposits
        if (res.data?.email) {
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
        console.error("Error fetching associate data:", err);
      }
    };

    fetchUser();
  }, []);

  const copyReferral = () => {
    if (user?.referral_code) {
      const signupUrl = `${window.location.origin}/referral-signup?ref=${user.referral_code}`;
      navigator.clipboard.writeText(signupUrl);
      alert("Referral signup link copied!");
    }
  };

  if (!user) return <p style={{ color: "#E5E7EB" }}>Loading...</p>;

  const signupUrl = `${window.location.origin}/referral-signup?ref=${user.referral_code}`;

  return (
    <div style={{ color: "#E5E7EB", padding: "20px" }}>
      <h2>Welcome Associate 🎉</h2>
      <p style={{ marginTop: 10 }}>
        Share your referral link below — new users will land directly on the
        signup page with your referral code prefilled.
      </p>

      {/* Referral Link */}
      <div
        style={{
          marginTop: 20,
          padding: "15px",
          borderRadius: "8px",
          background: "#1E293B",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "600px",
        }}
      >
        <span style={{ fontSize: "14px", wordBreak: "break-all" }}>
          {signupUrl}
        </span>
        <button
          onClick={copyReferral}
          style={{
            padding: "6px 12px",
            border: "none",
            borderRadius: "6px",
            background: "#3B82F6",
            color: "#fff",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Copy Link
        </button>
      </div>

      {/* Own Deposits */}
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
    </div>
  );
}
