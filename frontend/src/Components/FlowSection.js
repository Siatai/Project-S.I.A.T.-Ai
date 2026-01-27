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
            color: "var(--fx-ink)",
            textShadow: "0 0 16px rgba(var(--fx-accent-rgb),0.25)",
            fontFamily: "var(--fx-font-body)",
            textAlign: "center",
          }}
        >
          <span className="algom3-pulse">AlgoM3</span> Core
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
          <div className="orb-glass-layer orb-glass-layer--outer" />
          <div className="orb-glass-layer orb-glass-layer--mid" />
          <div className="orb-glass-layer orb-glass-layer--inner" />
          <div className="orb-ring orb-ring--a" aria-hidden="true" />
          <div className="orb-ring orb-ring--b" aria-hidden="true" />
          <div className="orb-ring orb-ring--c" aria-hidden="true" />
          <div className="orb-track">
            <div className="orb-electron orb-electron--a" />
          </div>
          <div className="orb-track orb-track--b">
            <div className="orb-electron orb-electron--b" />
          </div>
          <div className="orb-track orb-track--c">
            <div className="orb-electron orb-electron--c" />
          </div>
          <div className="orb-track orb-track--d">
            <div className="orb-electron orb-electron--d" />
          </div>
          <div className="orb-track orb-track--e">
            <div className="orb-electron orb-electron--e" />
          </div>
          <div className="orb-sub">Adaptive Core</div>
          <div className="orb-hole" aria-hidden="true" />
        </div>
        <div className="orb-grid" />
      </div>

      <style>{`
        .orb-core {
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(31, 215, 255, 0.18), rgba(6, 12, 22, 0.92));
          border: 1px solid rgba(31, 215, 255, 0.45);
          display: grid;
          placeItems: center;
          position: relative;
          text-align: center;
          box-shadow: 0 24px 40px rgba(2, 8, 18, 0.6);
          perspective: 800px;
          overflow: hidden;
        }

        .orb-glass-layer {
          position: absolute;
          inset: 10px;
          border-radius: 50%;
          border: 1px solid rgba(31, 215, 255, 0.2);
          background:
            radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.18), transparent 60%),
            radial-gradient(circle at 70% 75%, rgba(31, 215, 255, 0.12), transparent 55%);
          backdrop-filter: blur(2px);
          mix-blend-mode: screen;
        }

        .orb-glass-layer--outer { inset: 6px; opacity: 0.6; }
        .orb-glass-layer--mid { inset: 18px; opacity: 0.45; }
        .orb-glass-layer--inner { inset: 32px; opacity: 0.35; }

        .orb-ring {
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          border: 1px solid rgba(31, 215, 255, 0.35);
          box-shadow: 0 0 14px rgba(31, 215, 255, 0.28);
          pointer-events: none;
        }

        .orb-ring--a { inset: 14px; opacity: 0.7; }
        .orb-ring--b { inset: 24px; opacity: 0.55; }
        .orb-ring--c { inset: 36px; opacity: 0.45; }

        .orb-track {
          position: absolute;
          inset: 14px;
          border-radius: 50%;
          border: none;
          transform-style: preserve-3d;
          background: transparent;
          animation: orbitSpin 6.5s linear infinite;
        }

        .orb-track--b {
          inset: 26px;
          animation-duration: 9s;
        }

        .orb-track--c {
          inset: 6px;
          animation-duration: 12s;
          animation-direction: reverse;
        }

        .orb-track--d {
          inset: 34px;
          animation-duration: 10s;
          animation-direction: reverse;
        }

        .orb-track--e {
          inset: 20px;
          animation-duration: 8s;
        }

        .orb-electron {
          position: absolute;
          top: -4px;
          left: 50%;
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 30%, #e9fbff 0%, rgba(31, 215, 255, 0.95) 55%, rgba(31, 215, 255, 0.35) 100%);
          box-shadow:
            0 0 10px rgba(31, 215, 255, 0.8),
            0 0 18px rgba(31, 215, 255, 0.45),
            0 2px 6px rgba(0, 0, 0, 0.35);
          transform: translateX(-50%);
          animation: electronDepth 2.8s ease-in-out infinite;
        }

        .orb-electron--a { animation-delay: 0s; }
        .orb-electron--b { animation-delay: 0.6s; }
        .orb-electron--c { animation-delay: 1.2s; }
        .orb-electron--d { animation-delay: 1.8s; }
        .orb-electron--e { animation-delay: 2.4s; }

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
          font-size: 11px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--fx-muted);
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-family: var(--fx-font-mono);
          z-index: 3;
          text-shadow: 0 0 10px rgba(31, 215, 255, 0.5);
        }

        .orb-hole {
          position: absolute;
          inset: 64px;
          border-radius: 50%;
          background:
            radial-gradient(circle at 40% 35%, rgba(31, 215, 255, 0.18), rgba(6, 10, 20, 0.9) 55%, rgba(2, 6, 12, 0.98) 100%);
          box-shadow:
            inset 0 0 24px rgba(0, 0, 0, 0.8),
            0 0 20px rgba(31, 215, 255, 0.15);
          border: 0.5px solid rgba(31, 215, 255, 0.28);
          box-shadow:
            inset 0 0 26px rgba(0, 0, 0, 0.8),
            0 0 12px rgba(31, 215, 255, 0.28);
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

        @keyframes orbitSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes electronDepth {
          0% { transform: translateX(-50%) translateZ(-18px) scale(0.8); opacity: 0.55; }
          50% { transform: translateX(-50%) translateZ(18px) scale(1.1); opacity: 1; }
          100% { transform: translateX(-50%) translateZ(-18px) scale(0.8); opacity: 0.55; }
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
