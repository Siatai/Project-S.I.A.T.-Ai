import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function Deposit() {
  const [selected, setSelected] = useState(null);

  // TRC20 deposit address
  const TRC20_ADDRESS = "TF14BvXgdkyz6Bv8ApoQMr8acDYyaHmRgz";

  // TRC20 comes first
  const methods = [
    { id: "trc20", name: "Tether (USDT TRC20)", active: true, recommended: true },
    { id: "erc20", name: "Tether (USDT ERC20)", active: false },
    { id: "bsc", name: "Binance Smart Chain (BEP20)", active: false },
    { id: "btc", name: "Bitcoin (BTC)", active: false },
    { id: "eth", name: "Ethereum (ETH)", active: false },
  ];

  return (
    <div style={{ color: "#E5E7EB" }}>
      <h2 style={{ marginBottom: "20px" }}>Deposit</h2>

      {/* Deposit Methods Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {methods.map((m) => (
          <div
            key={m.id}
            onClick={() => m.active && setSelected(m.id)}
            style={{
              position: "relative",
              background: "#1F2937",
              padding: "20px",
              borderRadius: "8px",
              cursor: m.active ? "pointer" : "not-allowed",
              opacity: m.active ? 1 : 0.6,
              border:
                selected === m.id ? "2px solid #3B82F6" : "2px solid transparent",
            }}
          >
            <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>{m.name}</h3>
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>
              {m.active
                ? "Processing time: Instant – 15 minutes"
                : "Processing time: Coming soon"}
            </p>

            {/* Recommended badge */}
            {m.recommended && (
              <span
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "#10B981",
                  color: "#fff",
                  fontSize: "12px",
                  padding: "2px 8px",
                  borderRadius: "12px",
                }}
              >
                LIVE
              </span>
            )}

            {/* Coming Soon watermark */}
            {!m.active && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%) ",
                  background: "rgba(0,0,0,0.7)",
                  color: "#FFFFFF",
                  fontSize: "18px",
                  fontWeight: "bold",
                  padding: "5px 15px",
                  borderRadius: "4px",
                  pointerEvents: "none",
                }}
              >
                Coming Soon
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Popup for TRC20 */}
      {selected === "trc20" && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "#111827",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>Deposit via TRC20 (USDT)</h3>
          <QRCodeCanvas value={TRC20_ADDRESS} size={180} />
          <p style={{ marginTop: "15px", fontSize: "14px" }}>
            Send USDT to the address below:
          </p>
          <p
            style={{
              marginTop: "10px",
              padding: "10px",
              background: "#1F2937",
              borderRadius: "6px",
              fontFamily: "monospace",
              wordBreak: "break-all",
            }}
          >
            {TRC20_ADDRESS}
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(TRC20_ADDRESS)}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              background: "#3B82F6",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Copy Address
          </button>
        </div>
      )}
    </div>
  );
}
