import React from "react";
import { FaChartLine, FaCrosshairs, FaRobot } from "react-icons/fa";

export default function LiveNow() {
  const liveNow = [
    { icon: <FaCrosshairs />, desc: "Sniper Bot" },
    { icon: <FaChartLine />, desc: "Forex Trading Bot" },
    { icon: <FaRobot />, desc: "Crypto Trading Bot" },
  ];

  return (
    <section
      style={{
        position: "relative",
        zIndex: 2,
        padding: "50px 20px 20px",
        textAlign: "center",
      }}
    >
      <h3
        style={{
          fontSize: "18px",
          fontWeight: "700",
          color: "var(--fx-accent)",
          marginBottom: "16px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        Live Now
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
            animation: "marquee 18s linear infinite",
            padding: "8px 0 16px",
          }}
        >
          {[...liveNow, ...liveNow, ...liveNow].map((item, i) => (
            <div
              key={i}
              style={{
                flex: "0 0 230px",
                margin: "0 4px",
                background:
                  "linear-gradient(135deg, rgba(8, 16, 30, 0.92), rgba(10, 24, 46, 0.92)) padding-box, linear-gradient(135deg, rgba(var(--fx-accent-rgb), 0.7), rgba(var(--fx-accent-2-rgb), 0.7)) border-box",
                borderRadius: "14px",
                padding: "24px 20px",
                textAlign: "center",
                border: "1px solid transparent",
                boxShadow: "0 16px 28px rgba(2, 8, 18, 0.5)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  margin: "0 auto 12px",
                  borderRadius: "14px",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "24px",
                  color: "var(--fx-accent)",
                  background: "rgba(5, 16, 26, 0.7)",
                  border: "1px solid rgba(var(--fx-accent-rgb),0.4)",
                  boxShadow: "0 0 16px rgba(var(--fx-accent-rgb),0.28)",
                }}
              >
                {item.icon}
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--fx-ink)",
                  marginBottom: "10px",
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
                  color: "var(--fx-accent-2)",
                }}
              >
                live
              </span>
              <div
                style={{
                  position: "absolute",
                  inset: "0",
                  background:
                    "linear-gradient(120deg, transparent 0%, rgba(var(--fx-accent-rgb),0.2) 50%, transparent 100%)",
                  opacity: 0.35,
                  transform: "translateX(-100%)",
                  animation: "scanline 6s linear infinite",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
