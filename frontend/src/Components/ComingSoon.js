// src/Components/ComingSoon.js
import React from "react";
import {
  FaChartLine,
  FaBolt,
  FaCrosshairs,
  FaRobot,
  FaLayerGroup,
} from "react-icons/fa";

export default function ComingSoon() {
  const comingSoon = [
    { icon: <FaChartLine />, desc: "Arbitrage Bot" },
    { icon: <FaBolt />, desc: "MEV Bot" },
    { icon: <FaCrosshairs />, desc: "Sniper Bot" },
    { icon: <FaRobot />, desc: "Crypto Trading Bot" },
    { icon: <FaLayerGroup />, desc: "Multi-Asset Smart Portfolio" },
  ];

  return (
    <section
      style={{
        position: "relative",
        zIndex: 2,
        padding: "60px 20px",
        textAlign: "center",
        background: "rgba(5, 10, 18, 0.55)",
      }}
    >
      <h3
        style={{
          fontSize: "22px",
          fontWeight: "700",
          color: "var(--fx-accent)",
          marginBottom: "20px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Coming Soon
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
            animation: "marquee 22s linear infinite",
            padding: "10px 0 20px",
          }}
        >
          {/* Infinite carousel */}
          {[...comingSoon, ...comingSoon, ...comingSoon].map((item, i) => (
            <div
              key={i}
              style={{
                flex: "0 0 250px",
                margin: "0 4px",
                background:
                  "linear-gradient(135deg, rgba(10, 18, 34, 0.85), rgba(10, 26, 48, 0.9)) padding-box, linear-gradient(135deg, rgba(var(--fx-accent-rgb), 0.6), rgba(var(--fx-accent-2-rgb), 0.6)) border-box",
                borderRadius: "16px",
                padding: "32px 22px",
                textAlign: "center",
                border: "1px solid transparent",
                boxShadow: "0 18px 32px rgba(2, 8, 18, 0.5)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  margin: "0 auto 14px",
                  borderRadius: "16px",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "26px",
                  color: "var(--fx-accent)",
                  background: "rgba(5, 16, 26, 0.7)",
                  border: "1px solid rgba(var(--fx-accent-rgb),0.4)",
                  boxShadow: "0 0 18px rgba(var(--fx-accent-rgb),0.28)",
                }}
              >
                {item.icon}
              </div>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--fx-ink)",
                  marginBottom: "8px",
                }}
              >
                {item.desc}
              </p>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--fx-muted)",
                }}
              >
                online soon
              </span>
              <div
                style={{
                  position: "absolute",
                  inset: "0",
                  background:
                    "linear-gradient(120deg, transparent 0%, rgba(var(--fx-accent-2-rgb),0.14) 50%, transparent 100%)",
                  opacity: 0.35,
                  transform: "translateX(-100%)",
                  animation: "scanline 6s linear infinite",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </section>
  );
}
