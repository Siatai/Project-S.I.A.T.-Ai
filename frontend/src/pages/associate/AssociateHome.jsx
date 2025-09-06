import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AssociateHome() {
  const [user, setUser] = useState(null);
  const API = "https://project-s-i-a-t-ai.onrender.com";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
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
    <div style={{ color: "#E5E7EB" }}>
      <h2>Welcome Associate 🎉</h2>
      <p style={{ marginTop: 10 }}>
        Share your referral link below — new users will land directly on the signup page with your referral code prefilled.
      </p>

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
    </div>
  );
}
