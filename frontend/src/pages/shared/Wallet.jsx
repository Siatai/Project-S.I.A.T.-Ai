import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Wallet() {
  const [wallet, setWallet] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  // ✅ Fetch wallet only
  useEffect(() => {
    const fetchWalletSummary = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${API}/wallet/summary`, { headers });

        if (res.data.wallet) {
          setWallet(res.data.wallet);
          setSaved(true);
        }
      } catch (err) {
        console.error("Error fetching wallet summary:", err);
        setPopupMessage({
          type: "error",
          text: "❌ Failed to fetch wallet info.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchWalletSummary();
  }, [token]);

  // ✅ Save wallet
  const saveWallet = async () => {
    if (!wallet.trim()) {
      setPopupMessage({
        type: "error",
        text: "⚠️ Please enter a valid TRC20 address.",
      });
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        `${API}/save-wallet`,
        { wallet }, // ✅ backend uses token for user
        { headers }
      );
      setSaved(true);
      setPopupMessage({
        type: "success",
        text: "✅ Wallet saved successfully!",
      });
    } catch (err) {
      console.error("Error saving wallet:", err);
      if (
        err?.response?.data?.detail &&
        err.response.data.detail.toLowerCase().includes("bound")
      ) {
        setPopupMessage({
          type: "error",
          text: "⚠️ This wallet is already bound to another account.",
        });
      } else {
        setPopupMessage({
          type: "error",
          text: err?.response?.data?.detail || "❌ Failed to save wallet.",
        });
      }
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

      {/* ✅ Inline popup message */}
      {popupMessage && (
        <div
          style={{
            marginBottom: "15px",
            padding: "12px",
            borderRadius: "8px",
            background:
              popupMessage.type === "error"
                ? "rgba(239,68,68,0.2)"
                : "rgba(16,185,129,0.2)",
            border: `1px solid ${
              popupMessage.type === "error" ? "#EF4444" : "#10B981"
            }`,
            color: popupMessage.type === "error" ? "#F87171" : "#34D399",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          {popupMessage.text}
        </div>
      )}

      {saved ? (
        <div style={cardStyle}>
          <p style={{ marginBottom: "10px", fontWeight: "600" }}>
            Bound TRC20 Wallet:
          </p>
          <p style={walletBox}>{wallet}</p>

          <div style={glowLine} />
          <div style={warningBox}>
            <p>⚠️ Only <b>one wallet</b> can be bound per account.</p>
            <p>⚠️ A wallet address cannot be used for <b>multiple accounts</b>.</p>
            <p>⚠️ Once saved, this wallet <b>cannot be changed</b>.</p>
          </div>
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
          <div style={{ ...warningBox, marginTop: "15px" }}>
            <p>⚠️ You can bind only one wallet to your account.</p>
            <p>⚠️ Duplicate wallets across accounts will not be saved.</p>
            <p>⚠️ Once saved, wallet cannot be changed.</p>
          </div>
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
const warningBox = {
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.4)",
  borderRadius: "8px",
  padding: "12px",
  fontSize: "7px",
  color: "#F87171",
  textAlign: "left",
  lineHeight: "1.5",
};
