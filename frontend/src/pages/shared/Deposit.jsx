import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";

export default function Deposit() {
  const [selected, setSelected] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [newWallet, setNewWallet] = useState("");

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await axios.get(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWallet(res.data.wallet);
      } catch (err) {
        console.error("Error fetching wallet:", err);
      }
    };
    if (token) fetchWallet();
  }, [token]);

  const saveWallet = async () => {
    try {
      await axios.post(
        `${API}/wallet/bind`,
        { wallet: newWallet },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Wallet bound successfully!");
      setWallet(newWallet);
      setShowWalletPopup(false);
      setNewWallet("");
    } catch (err) {
      console.error("Error saving wallet:", err);
      alert(err?.response?.data?.detail || "Failed to bind wallet");
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
    <div style={{ color: "#E5E7EB", padding: "20px" }}>
      <h2
        style={{
          marginBottom: "10px",
          fontFamily: "Orbitron, sans-serif",
          color: "#17E8E5",
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
              background: "rgba(17,24,39,0.7)",
              backdropFilter: "blur(8px)",
              padding: "22px",
              borderRadius: "12px",
              cursor: m.active ? "pointer" : "not-allowed",
              opacity: m.active ? 1 : 0.5,
              border:
                selected === m.id
                  ? "2px solid #17E8E5"
                  : "1px solid rgba(255,255,255,0.1)",
              transition: "all 0.3s ease",
              boxShadow:
                selected === m.id
                  ? "0 0 20px rgba(23,232,229,0.6)"
                  : "0 0 8px rgba(23,232,229,0.2)",
            }}
          >
            <h3 style={{ fontSize: "16px", marginBottom: "10px", fontWeight: "600" }}>
              {m.name}
            </h3>
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
              {m.active ? "Processing: Instant – 15 minutes" : "Coming soon"}
            </p>

            {m.recommended && (
              <span
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "linear-gradient(135deg,#17E8E5,#14B8E5)",
                  color: "#0B1220",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "3px 10px",
                  borderRadius: "12px",
                  boxShadow: "0 0 12px rgba(23,232,229,0.4)",
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
                  color: "#E5E7EB",
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
            <h3 style={{ marginBottom: "18px", fontWeight: "600", color: "#17E8E5" }}>
              Deposit via TRC20 (USDT)
            </h3>
            <QRCodeCanvas value={TRC20_ADDRESS} size={180} />
            <p style={{ marginTop: "15px", fontSize: "14px", color: "#9CA3AF" }}>
              Send USDT to the address below:
            </p>
            <p
              style={{
                marginTop: "12px",
                padding: "12px",
                background: "rgba(31,41,55,0.8)",
                borderRadius: "8px",
                fontFamily: "monospace",
                wordBreak: "break-all",
                fontSize: "14px",
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
            <h3 style={{ marginBottom: "10px", color: "#17E8E5" }}>
              Bind Your TRC20 Wallet
            </h3>
            <p style={{ fontSize: "13px", marginBottom: "12px", color: "#9CA3AF" }}>
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
  background: "linear-gradient(135deg,#17E8E5,#14B8E5)",
  color: "#0B1220",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 0 12px rgba(23,232,229,0.4)",
  width: "100%",
  maxWidth: "420px",
};

const inputStyle = {
  width: "100%",
  maxWidth: "420px",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "12px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "#E5E7EB",
  fontSize: "14px",
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
  background: "rgba(17,24,39,0.95)",
  padding: "25px",
  borderRadius: "12px",
  maxWidth: "420px",
  width: "90%",
  boxShadow: "0 0 25px rgba(23,232,229,0.35)",
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
  color: "#E5E7EB",
  cursor: "pointer",
};

const glowLine = {
  height: "2px",
  background: "linear-gradient(90deg, transparent, #17E8E5, transparent)",
  boxShadow: "0 0 10px #17E8E5",
  marginBottom: "20px",
};
