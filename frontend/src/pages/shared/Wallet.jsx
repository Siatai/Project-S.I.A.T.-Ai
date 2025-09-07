import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Wallet() {
  const [wallet, setWallet] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  // ✅ Decode email from JWT token
  let email = "";
  if (token) {
    try {
      email = JSON.parse(atob(token.split(".")[1])).email;
    } catch (e) {
      console.error("Error decoding token:", e);
    }
  }

  // ✅ Fetch wallet on load
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await axios.get(`${API}/user-info`, {
          params: { email },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.wallet) {
          setWallet(res.data.wallet);
          setSaved(true);
        }
      } catch (err) {
        console.error("Error fetching wallet:", err);
      } finally {
        setLoading(false);
      }
    };
    if (email) fetchWallet();
  }, [token, email]);

  // ✅ Save wallet
  const saveWallet = async () => {
    if (!wallet.trim()) {
      alert("Please enter a valid TRC20 address.");
      return;
    }
    try {
      await axios.post(
        `${API}/save-wallet`,
        { email, wallet },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Wallet saved successfully!");
      setSaved(true);
    } catch (err) {
      console.error("Error saving wallet:", err);
      alert(err?.response?.data?.detail || "Failed to save wallet");
    }
  };

  if (loading) return <p style={{ color: "#E5E7EB" }}>Loading...</p>;

  return (
    <div style={{ color: "#E5E7EB", padding: "20px" }}>
      <h2
        style={{
          marginBottom: "10px",
          fontFamily: "Orbitron, sans-serif",
          color: "#17E8E5",
        }}
      >
        My Wallet
      </h2>
      <div style={glowLine} />

      {saved ? (
        <div style={cardStyle}>
          <p style={{ marginBottom: "10px", fontWeight: "600" }}>
            Bound TRC20 Wallet:
          </p>
          <p style={walletBox}>{wallet}</p>
          <div style={glowLine} />
          <p style={{ fontSize: "13px", color: "#F87171", marginTop: "12px" }}>
            ⚠️ You cannot change this wallet once saved.
          </p>
        </div>
      ) : (
        <div style={cardStyle}>
          <input
            type="text"
            placeholder="Enter your TRC20 wallet address"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            style={inputStyle}
          />
          <button onClick={saveWallet} style={btnTeal}>
            Save Wallet
          </button>
        </div>
      )}
    </div>
  );
}

/* === Styles === */
const cardStyle = {
  padding: "20px",
  borderRadius: "12px",
  background: "rgba(17,24,39,0.8)",
  backdropFilter: "blur(8px)",
  maxWidth: "420px",
  boxShadow: "0 0 15px rgba(23,232,229,0.2)",
};

const walletBox = {
  padding: "12px",
  background: "rgba(31,41,55,0.8)",
  borderRadius: "8px",
  fontFamily: "monospace",
  wordBreak: "break-all",
  fontSize: "14px",
  marginBottom: "10px",
  boxShadow: "0 0 8px rgba(23,232,229,0.3)",
};

const inputStyle = {
  width: "100%",
  maxWidth: "380px",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "12px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "#E5E7EB",
  fontSize: "14px",
  boxSizing: "border-box",
};

const btnTeal = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "8px",
  background: "linear-gradient(135deg,#17E8E5,#14B8E5)",
  color: "#0B1220",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 0 12px rgba(23,232,229,0.3)",
  width: "100%",
  maxWidth: "380px",
};

const glowLine = {
  height: "2px",
  background: "linear-gradient(90deg, transparent, #17E8E5, transparent)",
  boxShadow: "0 0 10px #17E8E5",
  margin: "8px 0 20px 0",
};
