import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";

export default function Deposit() {
  const [selected, setSelected] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [newWallet, setNewWallet] = useState("");
  const [email, setEmail] = useState("");
  const [walletPopupMessage, setWalletPopupMessage] = useState(null); // ✅ only for modal messages

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  // 🔹 Fetch user email + wallet
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await axios.get(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWallet(res.data.wallet);
        setEmail(res.data.email);
      } catch (err) {
        console.error("Error fetching wallet:", err);
      }
    };
    if (token) fetchWallet();
  }, [token]);

  // 🔹 Save wallet (with email)
  const saveWallet = async () => {
    if (!newWallet.trim()) {
      setWalletPopupMessage({
        type: "error",
        text: "⚠️ Please enter a valid TRC20 wallet address.",
      });
      return;
    }
    try {
      await axios.post(
        `${API}/save-wallet`,
        { email, wallet: newWallet },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWallet(newWallet);
      setShowWalletPopup(false);
      setNewWallet("");
      setWalletPopupMessage(null);
    } catch (err) {
      console.error("Error saving wallet:", err);

      // ✅ Show duplicate wallet warning inside modal
      if (err?.response?.status === 400) {
        setWalletPopupMessage({
          type: "error",
          text: "⚠️ Duplicate wallets will not be saved — each wallet can only be linked to one account.",
        });
      } else {
        setWalletPopupMessage({
          type: "error",
          text: err?.response?.data?.detail || "❌ Failed to bind wallet",
        });
      }
    }
  };

  const TRC20_ADDRESS = "TF14BvXgdkyz6Bv8ApoQMr8acDYyaHmRgz";

  const methods = [
    { id: "trc20", name: "Tether (USDT TRC20)", active: true, recommended: true },
    { id: "erc20", name: "Tether (USDT ERC20)", active: false },
    { id: "bsc", name: "Binance Smart Chain (BEP20)", active: false },
    { id: "btc", name: "Bitcoin (BTC)", active: false },
    { id: "eth", name: "Ethereum (ETH)", active: false },
  ];

  return (
    <div style={{ color: "var(--fx-ink)", padding: "20px" }}>
      <h2
        style={{
          marginBottom: "10px",
          fontFamily: "var(--fx-font-display)",
          color: "var(--fx-accent)",
        }}
      >
        Deposit
      </h2>
      <div style={glowLine} />

      {/* Methods Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {methods.map((m) => (
          <div
            key={m.id}
            onClick={() => {
              if (m.active) {
                if (!wallet) setShowWalletPopup(true);
                else setSelected(m.id);
              }
            }}
            style={{
              position: "relative",
              background: "var(--fx-card)",
              backdropFilter: "blur(8px)",
              padding: "22px",
              borderRadius: "12px",
              cursor: m.active ? "pointer" : "not-allowed",
              opacity: m.active ? 1 : 0.5,
              border:
                selected === m.id
                  ? "2px solid var(--fx-accent)"
                  : "1px solid rgba(255,255,255,0.1)",
              transition: "all 0.3s ease",
              boxShadow:
                selected === m.id
                  ? "0 0 20px rgba(var(--fx-accent-rgb),0.6)"
                  : "0 0 8px rgba(var(--fx-accent-rgb),0.2)",
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                marginBottom: "10px",
                fontWeight: "600",
                fontFamily: "var(--fx-font-display)",
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {m.name}
            </h3>
            <p
              style={{
                fontSize: "11px",
                color: "var(--fx-muted)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {m.active ? "Processing: Instant – 15 minutes" : "Coming soon"}
            </p>

            {m.recommended && (
              <span
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "linear-gradient(135deg, var(--fx-button), var(--fx-button-2))",
                  color: "var(--fx-bg)",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "3px 10px",
                  borderRadius: "12px",
                  boxShadow: "0 12px 24px rgba(var(--fx-accent-rgb),0.22)",
                }}
              >
                LIVE
              </span>
            )}

            {!m.active && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.65)",
                  color: "var(--fx-ink)",
                  fontSize: "15px",
                  fontWeight: "600",
                  borderRadius: "12px",
                }}
              >
                Coming Soon
              </div>
            )}
          </div>
        ))}
      </div>

      {/* TRC20 Deposit Modal */}
      {selected === "trc20" && (
        <div style={popupOverlay} onClick={() => setSelected(null)}>
          <div style={popupBox} onClick={(e) => e.stopPropagation()}>
            <button style={closeBtn} onClick={() => setSelected(null)}>
              ✕
            </button>
            <h3 style={{ marginBottom: "18px", fontWeight: "600", color: "var(--fx-accent)" }}>
              Deposit via TRC20 (USDT)
            </h3>
            <QRCodeCanvas value={TRC20_ADDRESS} size={180} />
            <p style={{ marginTop: "15px", fontSize: "14px", color: "var(--fx-muted)" }}>
              Send USDT to the address below:
            </p>
            <p
              style={{
                marginTop: "12px",
                padding: "12px",
                background: "rgba(8, 10, 20, 0.55)",
                borderRadius: "8px",
                fontFamily: "monospace",
                wordBreak: "break-all",
                fontSize: "11px",
              }}
            >
              {TRC20_ADDRESS}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(TRC20_ADDRESS)}
              style={btnTeal}
            >
              Copy Address
            </button>
          </div>
        </div>
      )}

      {/* Wallet Binding Popup */}
      {showWalletPopup && (
        <div style={popupOverlay} onClick={() => setShowWalletPopup(false)}>
          <div style={popupBox} onClick={(e) => e.stopPropagation()}>
            <button style={closeBtn} onClick={() => setShowWalletPopup(false)}>
              ✕
            </button>
            <h3 style={{ marginBottom: "10px", color: "var(--fx-accent)" }}>
              Bind Your TRC20 Wallet
            </h3>

            {/* ✅ Error message INSIDE modal */}
            {walletPopupMessage && (
              <div
                style={{
                  marginBottom: "15px",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid var(--fx-danger)",
                  color: "var(--fx-danger)",
                  fontWeight: "600",
                  textAlign: "center",
                  fontSize: "14px",
                }}
              >
                {walletPopupMessage.text}
              </div>
            )}

            <p style={{ fontSize: "13px", marginBottom: "8px", color: "var(--fx-muted)" }}>
              You must bind your withdrawal wallet before depositing.
            </p>
            <input
              type="text"
              placeholder="Enter TRC20 Wallet Address"
              value={newWallet}
              onChange={(e) => setNewWallet(e.target.value)}
              style={inputStyle}
            />
            <button onClick={saveWallet} style={btnTeal}>
              Save Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* === Shared Styles === */
const btnTeal = {
  marginTop: "15px",
  padding: "12px 24px",
  border: "none",
  borderRadius: "8px",
  background: "linear-gradient(135deg, var(--fx-button), var(--fx-button-2))",
  color: "var(--fx-bg)",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 12px 24px rgba(var(--fx-accent-rgb),0.22)",
  width: "100%",
  maxWidth: "420px",
};
const inputStyle = {
  width: "100%",
  maxWidth: "420px",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "12px",
  border: "1px solid var(--fx-border)",
  background: "rgba(8, 10, 20, 0.6)",
  color: "var(--fx-ink)",
  fontSize: "12px",
  boxSizing: "border-box",
};
const popupOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};
const popupBox = {
  border: "1px solid var(--fx-border)",
  background: "var(--fx-card)",
  padding: "25px",
  borderRadius: "12px",
  maxWidth: "420px",
  width: "90%",
  boxShadow: "var(--fx-shadow)",
  textAlign: "center",
  position: "relative",
};
const closeBtn = {
  position: "absolute",
  top: "10px",
  right: "12px",
  background: "transparent",
  border: "none",
  fontSize: "20px",
  color: "var(--fx-ink)",
  cursor: "pointer",
};
const glowLine = {
  height: "0",
  background: "transparent",
  boxShadow: "none",
  marginBottom: "14px",
};
