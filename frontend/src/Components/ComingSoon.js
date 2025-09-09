// src/Components/ComingSoon.js
import React from "react";
import sniper from "./sniper.png";

export default function ComingSoon() {
  const comingSoon = [
    { icon: "📊", desc: "Arbitrage Bot" },
    { icon: "⚡", desc: "MEV Bot" },
    {
      icon: (
        <img
          src={sniper}
          alt="Sniper Bot"
          style={{ width: "40px", margin: "0 auto" }}
        />
      ),
      desc: "Sniper Bot",
    },
    { icon: "💹", desc: "Crypto Trading Bot" },
    { icon: "📈", desc: "Multi-Asset Smart Portfolio" },
  ];

  return (
    <section
      style={{
        position: "relative",
        zIndex: 2,
        padding: "60px 20px",
        textAlign: "center",
        background: "rgba(15,23,42,0.7)",
      }}
    >
      <h3
        style={{
          fontSize: "22px",
          fontWeight: "700",
          color: "#17E8E5",
          marginBottom: "20px",
        }}
      >
        Coming Soon
      </h3>

      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            width: "max-content",
            animation: "marquee 20s linear infinite",
          }}
        >
          {/* Infinite carousel */}
          {[...comingSoon, ...comingSoon, ...comingSoon].map((item, i) => (
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
              <h4 style={{ fontSize: "28px", marginBottom: "10px" }}>
                {item.icon}
              </h4>
              <p style={{ fontSize: "16px", color: "#94A3B8" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
