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
          color: "#17E8E5",
          fontWeight: "700",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        About Forex
      </h3>

      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            width: "max-content",
            animation: "marquee 25s linear infinite",
          }}
        >
          {/* Infinite carousel by repeating 3 times */}
          {[...stats, ...stats, ...stats].map((item, i) => (
            <div
              key={i}
              style={{
                flex: "0 0 250px",
                margin: "0 12px",
                background: "rgba(30,41,59,0.7)",
                borderRadius: "12px",
                padding: "30px 20px",
                textAlign: "center",
                boxShadow: "0 0 15px rgba(23,232,229,0.3)",
              }}
            >
              <h4
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#17E8E5",
                  marginBottom: "10px",
                }}
              >
                {item.stat}
              </h4>
              <p style={{ fontSize: "14px", color: "#94A3B8" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
