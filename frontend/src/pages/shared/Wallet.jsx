import React, { useEffect, useState } from "react";
import axios from "axios";
import HudLoader from "../../Components/HudLoader";

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

  if (loading) return <HudLoader text="Loading wallet" />;

  return (
    <div style={{ color: "var(--fx-ink)", padding: "2px" }}>
      <h2
        style={{
          marginBottom: "10px",
          fontFamily: "var(--fx-font-display)",
          color: "var(--fx-accent)",
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
              popupMessage.type === "error" ? "var(--fx-danger)" : "var(--fx-success)"
            }`,
            color: popupMessage.type === "error" ? "var(--fx-danger)" : "var(--fx-success-2)",
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
  background: "var(--fx-card)",
  border: "1px solid var(--fx-border)",
  backdropFilter: "blur(8px)",
  maxWidth: "420px",
  boxShadow: "var(--fx-shadow)",
  margin: "0 auto",
};

const walletBox = {
  padding: "12px",
  background: "rgba(8, 10, 20, 0.55)",
  border: "1px solid var(--fx-border)",
  borderRadius: "8px",
  fontFamily: "monospace",
  wordBreak: "break-all",
  fontSize: "14px",
  marginBottom: "10px",
  boxShadow: "0 0 12px rgba(var(--fx-accent-rgb),0.2)",
};

const inputStyle = {
  width: "100%",
  maxWidth: "380px",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "12px",
  border: "1px solid var(--fx-border)",
  background: "rgba(8, 10, 20, 0.6)",
  color: "var(--fx-ink)",
  fontSize: "14px",
  boxSizing: "border-box",
};

const btnTeal = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "8px",
  background: "linear-gradient(135deg, var(--fx-button), var(--fx-button-2))",
  color: "var(--fx-bg)",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 0 12px rgba(var(--fx-accent-rgb),0.3)",
  width: "100%",
  maxWidth: "380px",
};

const glowLine = {
  height: "2px",
  background: "linear-gradient(90deg, transparent, var(--fx-accent), transparent)",
  boxShadow: "0 0 10px var(--fx-accent)",
  margin: "8px 0 20px 0",
};

const policyBox = {
  background: "rgba(8, 10, 20, 0.6)",
  border: "1px solid var(--fx-border)",
  borderRadius: "8px",
  padding: "12px",
  fontSize: "13px",
  color: "var(--fx-ink)",
  textAlign: "left",
  lineHeight: "1.6",
  boxShadow: "0 0 12px rgba(var(--fx-accent-rgb),0.2)",
};
