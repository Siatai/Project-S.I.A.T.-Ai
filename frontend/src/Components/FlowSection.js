// src/Components/FlowSection.js
import React from "react";

export default function FlowSection() {
  const nodes = [
    { label: "Market Pulse", detail: "Forex + Crypto streams" },
    { label: "Signal Stack", detail: "Multi-factor indicators" },
    { label: "AI Engine", detail: "Adaptive trade logic" },
    { label: "Risk Layer", detail: "Volatility-aware control" },
    { label: "Execution", detail: "Low-latency routing" },
  ];

  return (
    <section
      className="flow-section"
      style={{
        position: "relative",
        padding: "60px 24px 70px",
        maxWidth: "980px",
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        gap: "30px",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(145deg, rgba(6, 14, 30, 0.9), rgba(10, 22, 42, 0.88))",
        border: "1px solid rgba(var(--fx-accent-rgb), 0.35)",
        borderRadius: "20px",
        boxShadow: "0 24px 40px rgba(2, 8, 18, 0.55)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          flex: "1 1 320px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "fit-content",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "8px 16px",
            borderRadius: "999px",
            border: "1px solid rgba(var(--fx-accent-rgb), 0.4)",
            color: "var(--fx-accent)",
            fontSize: "11px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            fontFamily: "var(--fx-font-display)",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <span className="algom3-pulse">AlgoM3</span> Neural Stack
        </div>
        <h2
          style={{
            marginTop: "18px",
            marginBottom: "12px",
            fontSize: "26px",
            fontWeight: "800",
            color: "rgba(255, 170, 90, 0.95)",
            textShadow: "0 0 18px rgba(255, 160, 70, 0.45)",
            fontFamily: "var(--fx-font-body)",
            textAlign: "center",
          }}
        >
          <span className="algom3-pulse">AlgoM3</span>{" "}
          <span className="core-amber-pulse">Core</span>
        </h2>
        <p
          style={{
            color: "var(--fx-muted-2)",
            lineHeight: "1.6",
            maxWidth: "420px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Each layer is tuned for stability and speed, so <span className="algom3-pulse">AlgoM3</span> stays composed through
          volatility while capturing clean entries.
        </p>
        <div
          style={{
            marginTop: "22px",
            display: "grid",
            gap: "12px",
          }}
        >
          {nodes.map((node) => (
            <div
              key={node.label}
              className="hud-node"
              style={{
                border: "1px solid rgba(var(--fx-accent-rgb), 0.35)",
                borderRadius: "12px",
                padding: "12px 14px",
                background: "rgba(6, 14, 28, 0.72)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div
                className="hud-node__label"
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "var(--fx-accent)",
                  fontFamily: "var(--fx-font-display)",
                  whiteSpace: "nowrap",
                }}
              >
                {node.label}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#ffffff",
                  textAlign: "right",
                  marginLeft: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                {node.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", display: "grid", placeItems: "center", flex: "1 1 260px" }}>
        <div className="orb-core">
          <div className="reactor-outer-disc" aria-hidden="true" />
          <div className="reactor-rim" aria-hidden="true" />
          <div className="reactor-plasma" aria-hidden="true" />
          <div className="reactor-amber-rings" aria-hidden="true">
            <div className="reactor-amber-ring ring-1" />
            <div className="reactor-amber-ring ring-2" />
            <div className="reactor-amber-ring ring-3" />
          </div>
          <div className="reactor-core">
            <div className="reactor-core__ring" />
            <div className="orb-sub">Adaptive Core</div>
          </div>
        </div>
        <div className="orb-grid" />
      </div>

      <style>{`
        .orb-core {
          width: 240px;
          height: 240px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.12), rgba(10, 16, 28, 0.95));
          border: 1px solid rgba(120, 140, 160, 0.45);
          display: grid;
          placeItems: center;
          position: relative;
          text-align: center;
          box-shadow: 0 30px 50px rgba(2, 8, 18, 0.65);
          overflow: hidden;
        }


        .reactor-rim {
          position: absolute;
          inset: 10px;
          border-radius: 50%;
          background:
            radial-gradient(circle, rgba(255, 255, 255, 0.12), transparent 45%),
            radial-gradient(circle at 70% 25%, rgba(120, 200, 255, 0.15), transparent 50%);
          border: 2px solid rgba(140, 170, 200, 0.55);
          box-shadow:
            inset 0 0 26px rgba(20, 40, 60, 0.6),
            0 0 20px rgba(80, 140, 190, 0.35);
        }

        .reactor-plasma {
          position: absolute;
          inset: 36px;
          border-radius: 50%;
          background:
            conic-gradient(
              from 40deg,
              rgba(255, 170, 60, 0.95),
              rgba(255, 120, 40, 0.7),
              rgba(255, 210, 120, 0.95),
              rgba(255, 140, 40, 0.75),
              rgba(255, 170, 60, 0.95)
            );
          filter: blur(1px);
          box-shadow:
            0 0 22px rgba(255, 150, 60, 0.55),
            0 0 40px rgba(255, 120, 40, 0.35);
          animation: plasmaSpin 10s linear infinite;
        }

        .reactor-outer-disc {
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          border: 2px solid rgba(255, 160, 60, 0.45);
          box-shadow: 0 0 18px rgba(255, 160, 60, 0.35);
          opacity: 0.7;
        }

        .reactor-amber-rings {
          position: absolute;
          inset: 28px;
          border-radius: 50%;
          pointer-events: none;
        }

        .reactor-amber-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid rgba(255, 160, 60, 0.82);
          box-shadow: 0 0 28px rgba(255, 140, 40, 0.65);
          opacity: 0.8;
        }

        .reactor-amber-ring.ring-1 { inset: 0; opacity: 0.85; }
        .reactor-amber-ring.ring-2 { inset: 12px; opacity: 0.7; }
        .reactor-amber-ring.ring-3 { inset: 24px; opacity: 0.55; }

        .reactor-core {
          position: absolute;
          inset: 60px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(10, 20, 35, 0.9), rgba(5, 8, 16, 0.95));
          border: 1px solid rgba(60, 120, 170, 0.5);
          box-shadow:
            inset 0 0 30px rgba(0, 0, 0, 0.8),
            0 0 24px rgba(50, 160, 220, 0.4);
          display: grid;
          placeItems: center;
        }

        .reactor-core__ring {
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          border: 2px solid rgba(255, 208, 40, 0.8);
          box-shadow: 0 0 26px rgba(40, 255, 234, 0.5);
          filter: blur(0.9px);
          animation: corePulse 3.2s ease-in-out infinite;
        }


        .orb-label {
          font-size: 22px;
          font-weight: 800;
          color: var(--fx-accent);
          text-shadow: 0 0 16px rgba(var(--fx-accent-rgb), 0.4);
          font-family: var(--fx-font-display);
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
        }

        .orb-sub {
          font-size: 7px;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #cfe5f5;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-family: var(--fx-font-mono);
          z-index: 3;
          text-shadow: 0 0 12px rgba(40, 200, 255, 0.5);
        }

        @keyframes plasmaSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes orbitSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes corePulse {
          0% { box-shadow: 0 0 14px rgba(40, 200, 255, 0.4); }
          50% { box-shadow: 0 0 26px rgba(40, 200, 255, 0.9); }
          100% { box-shadow: 0 0 14px rgba(40, 200, 255, 0.4); }
        }

        .orb-grid {
          position: absolute;
          inset: -20px;
          border-radius: 20px;
          background:
            repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.04) 0 1px, transparent 1px 40px),
            repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.04) 0 1px, transparent 1px 40px);
          opacity: 0.3;
          pointer-events: none;
        }

        @keyframes electronDepth {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.7; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.7; }
        }

        @keyframes hudTextPulse {
          0% { text-shadow: 0 0 6px rgba(31, 215, 255, 0.35), 0 0 12px rgba(31, 215, 255, 0.2); opacity: 0.9; }
          50% { text-shadow: 0 0 10px rgba(31, 215, 255, 0.6), 0 0 18px rgba(31, 215, 255, 0.35); opacity: 1; }
          100% { text-shadow: 0 0 6px rgba(31, 215, 255, 0.35), 0 0 12px rgba(31, 215, 255, 0.2); opacity: 0.9; }
        }

        .hud-node__label {
          color: #dff6ff;
          text-shadow: 0 0 8px rgba(31, 215, 255, 0.45);
          animation: hudTextPulse 3.6s ease-in-out infinite;
        }

        @keyframes coreAmberPulse {
          0% { text-shadow: 0 0 10px rgba(255, 160, 70, 0.35), 0 0 18px rgba(255, 140, 60, 0.2); opacity: 0.85; }
          50% { text-shadow: 0 0 18px rgba(255, 170, 90, 0.8), 0 0 32px rgba(255, 140, 60, 0.45); opacity: 1; }
          100% { text-shadow: 0 0 10px rgba(255, 160, 70, 0.35), 0 0 18px rgba(255, 140, 60, 0.2); opacity: 0.85; }
        }

        .core-amber-pulse {
          color: rgba(255, 170, 90, 0.95);
          animation: coreAmberPulse 3.2s ease-in-out infinite;
        }

        @media (max-width: 720px) {
          .flow-section {
            text-align: center;
          }
          .orb-core {
            width: 180px;
            height: 180px;
          }
          .orb-label {
            font-size: 18px;
          }
        }
      `}</style>
    </section>
  );
}
