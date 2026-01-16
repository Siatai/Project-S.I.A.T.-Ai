// src/Components/ForexStats.js
import React from "react";

export default function ForexStats() {
  const stats = [
    { stat: "$7T+", desc: "Daily Trading Volume" },
    { stat: "24/5", desc: "Market Open Hours" },
    { stat: "190+", desc: "Countries Trading" },
    { stat: "88%", desc: "Liquidity vs Stocks" },
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
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        About Forex
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
          {/* Infinite carousel by repeating 3 times */}
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
