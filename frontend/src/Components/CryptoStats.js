// src/Components/CryptoStats.js
import React from "react";

export default function CryptoStats() {
  const stats = [
    { stat: "$2T+", desc: "Total Market Cap" },
    { stat: "24/7", desc: "Always-On Markets" },
    { stat: "100M+", desc: "Active Wallets" },
    { stat: "0.1s", desc: "Avg Block Finality" },
  ];

  return (
    <section
      style={{
        position: "relative",
        zIndex: 2,
        padding: "60px 20px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      <h3
        style={{
          fontSize: "24px",
          color: "var(--fx-accent)",
          fontWeight: "700",
          marginBottom: "20px",
          textAlign: "center",
          marginLeft: "auto",
          marginRight: "auto",
          width: "fit-content",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        About Crypto
      </h3>

      <div
        style={{
          overflow: "hidden",
          position: "relative",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          maskImage:
            "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "max-content",
            gap: "18px",
            animation: "marquee 26s linear infinite",
            padding: "10px 0 20px",
          }}
        >
          {[...stats, ...stats, ...stats].map((item, i) => (
            <div
              key={i}
              style={{
                flex: "0 0 250px",
                margin: "0 4px",
                background:
                  "linear-gradient(135deg, rgba(10, 18, 34, 0.85), rgba(10, 26, 48, 0.9)) padding-box, linear-gradient(135deg, rgba(var(--fx-accent-rgb), 0.6), rgba(var(--fx-accent-2-rgb), 0.6)) border-box",
                borderRadius: "16px",
                padding: "30px 20px",
                textAlign: "center",
                border: "1px solid transparent",
                boxShadow: "0 18px 32px rgba(2, 8, 18, 0.5)",
              }}
            >
              <h4
                className="no-underline"
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "var(--fx-accent)",
                  marginBottom: "10px",
                }}
              >
                {item.stat}
              </h4>
              <p style={{ fontSize: "14px", color: "var(--fx-muted)" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
