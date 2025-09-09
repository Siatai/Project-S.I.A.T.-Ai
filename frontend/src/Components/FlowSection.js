// src/Components/FlowSection.js
import React from "react";
import flowImg from "./flow-card.png"; // 👈 apni transparent PNG

export default function FlowSection() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px 60px",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Neon Heading inside Box */}
      <div
        style={{
          padding: "10px 25px",
          borderRadius: "12px",
          marginBottom: "25px",
          background: "rgba(23,232,229,0.08)",
          border: "1px solid rgba(23,232,229,0.5)",
          backdropFilter: "blur(8px)",
          boxShadow:
            "0 0 15px rgba(23,232,229,0.5), 0 0 35px rgba(0,240,255,0.3)",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#17E8E5",
            margin: 0,
            fontFamily: "Orbitron, sans-serif",
            textShadow: "0 0 10px #17E8E5, 0 0 25px rgba(0,240,255,0.6)",
          }}
        >
          M³'s Algo
        </h2>
      </div>

      {/* Center Image with Pulsing Aura */}
      <div
        style={{
          position: "relative",
          marginTop: "10px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Pulsing Aura */}
        <div
          className="pulsing-glow"
          style={{
            position: "absolute",
            inset: "-80px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(23,232,229,0.6), transparent 70%)",
            filter: "blur(60px)",
            zIndex: 0,
          }}
        ></div>

        {/* Transparent PNG */}
        <img
          src={flowImg}
          alt="Flow Algo"
          style={{
            width: "90vw",     // responsive for mobile
            maxWidth: "700px", // large on desktop
            position: "relative",
            zIndex: 5,
          }}
        />
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulseGlow {
          0% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.4; transform: scale(0.95); }
        }

        .pulsing-glow {
          animation: pulseGlow 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
