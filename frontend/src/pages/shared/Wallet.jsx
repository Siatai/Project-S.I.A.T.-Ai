import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Wallet() {
  const [wallet, setWallet] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);
  const [email, setEmail] = useState(null); // ✅ fetched from /me

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  // ✅ Fetch user email + wallet summary together
  useEffect(() => {
    const fetchUserAndWallet = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 🔹 Step 1: Fetch user info (email)
        const meRes = await axios.get(`${API}/me`, { headers });
        const fetchedEmail = meRes.data?.email;
        if (fetchedEmail) {
          setEmail(fetchedEmail);
          localStorage.setItem("email", fetchedEmail); // optional caching
        }

        // 🔹 Step 2: Fetch wallet summary
        const walletRes = await axios.get(`${API}/wallet/summary`, { headers });
        if (walletRes.data.wallet) {
          setWallet(walletRes.data.wallet);
          setSaved(true);
        }
      } catch (err) {
        console.error("Error fetching user or wallet:", err);
        setPopupMessage({
          type: "error",
          text: "❌ Failed to load wallet info. Please log in again.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUserAndWallet();
  }, [token]);

  // ✅ Save wallet
  const saveWallet = async () => {
    if (!email) {
      setPopupMessage({
        type: "error",
        text: "⚠️ Email not found — please re-login before saving wallet.",
      });
      return;
    }

    if (!wallet.trim() || !/^T[a-zA-Z0-9]{33}$/.test(wallet.trim())) {
      setPopupMessage({
        type: "error",
        text: "⚠️ Invalid TronLink wallet. It must start with 'T' and be 34 chars long.",
      });
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = { email, wallet };

      console.log("📤 Sending wallet payload:", body);

      const res = await axios.post(`${API}/save-wallet`, body, { headers });

      if (res.data.message?.toLowerCase().includes("success")) {
        setSaved(true);
        setPopupMessage({
          type: "success",
          text: "✅ Wallet saved successfully!",
        });
      } else {
        setPopupMessage({
          type: "error",
          text: res.data.message || "❌ Unknown server response.",
        });
      }
    } catch (err) {
      console.error("Error saving wallet:", err);
      const detail = err?.response?.data?.detail;

      if (typeof detail === "string" && detail.toLowerCase().includes("bound")) {
        setPopupMessage({
          type: "error",
          text: "⚠️ This wallet is already bound to another account.",
        });
      } else {
        setPopupMessage({
          type: "error",
          text:
            typeof detail === "string"
              ? detail
              : "❌ Failed to save wallet. Try again later.",
        });
      }
    }
  };

  if (loading)
    return <p style={{ color: "#E5E7EB", textAlign: "center" }}>Loading...</p>;

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

      {/* ✅ Popup message */}
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
            Bound TronLink Wallet:
          </p>
          <p style={walletBox}>{wallet}</p>

          <div style={glowLine} />
          <div style={policyBox}>
            <p>🔹 We only accept <b>TronLink wallets</b> (no gas fees needed!).</p>
            <p>🔹 You can link only <b>one wallet</b> to your account.</p>
            <p>🔹 The same wallet can’t be used on more than one account.</p>
            <p>🔹 Once connected, you can’t change or remove it — double-check before confirming!</p>
          </div>
        </div>
      ) : (
        <div style={cardStyle}>
          <input
            type="text"
            placeholder="Enter your TronLink wallet address"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            style={inputStyle}
          />
          <button onClick={saveWallet} style={btnTeal}>
            Save Wallet
          </button>

          <div style={{ ...policyBox, marginTop: "15px" }}>
            <p>🔹 We only accept <b>TronLink wallets</b> (no gas fees needed!).</p>
            <p>🔹 You can link only <b>one wallet</b> to your account.</p>
            <p>🔹 The same wallet can’t be used on more than one account.</p>
            <p>🔹 Once connected, you can’t change or remove it — double-check before confirming!</p>
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
  margin: "0 auto",
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

const policyBox = {
  background: "rgba(15,23,42,0.8)",
  border: "1px solid #17E8E5",
  borderRadius: "8px",
  padding: "12px",
  fontSize: "13px",
  color: "#E5E7EB",
  textAlign: "left",
  lineHeight: "1.6",
  boxShadow: "0 0 10px rgba(23,232,229,0.2)",
};
