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
      <div style={{ flex: "1 1 320px", textAlign: "justify" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 16px",
            borderRadius: "999px",
            border: "1px solid rgba(var(--fx-accent-rgb), 0.4)",
            color: "var(--fx-accent)",
            fontSize: "11px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            fontFamily: "var(--fx-font-mono)",
          }}
        >
          AlgoM3 Neural Stack
        </div>
        <h2
          style={{
            marginTop: "18px",
            marginBottom: "12px",
            fontSize: "26px",
            fontWeight: "800",
            color: "var(--fx-ink)",
            textShadow: "0 0 16px rgba(var(--fx-accent-rgb),0.25)",
            fontFamily: "var(--fx-font-display)",
            textAlign: "center",
          }}
        >
          A precision pipeline that senses, decides, and executes in real time.
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
          Each layer is tuned for stability and speed, so AlgoM3 stays composed through
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
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "var(--fx-ink)",
                }}
              >
                {node.label}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--fx-muted)",
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
          <div className="orb-ring" />
          <div className="orb-ring orb-ring--outer" />
          <div className="orb-label">AlgoM3</div>
          <div className="orb-sub">Adaptive Core</div>
        </div>
        <div className="orb-grid" />
      </div>

      <style>{`
        .orb-core {
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(var(--fx-accent-rgb), 0.28), rgba(5, 12, 24, 0.95));
          border: 1px solid rgba(var(--fx-accent-rgb), 0.5);
          display: grid;
          placeItems: center;
          position: relative;
          text-align: center;
          box-shadow: 0 24px 40px rgba(2, 8, 18, 0.6);
        }

        .orb-ring {
          position: absolute;
          inset: 16px;
          border-radius: 50%;
          border: 1px solid rgba(var(--fx-accent-rgb), 0.35);
          animation: orbit 6s linear infinite;
        }

        .orb-ring--outer {
          inset: -10px;
          border: 1px dashed rgba(var(--fx-accent-rgb), 0.35);
          animation-duration: 9s;
        }

        .orb-label {
          font-size: 22px;
          font-weight: 800;
          color: var(--fx-accent);
          text-shadow: 0 0 16px rgba(var(--fx-accent-rgb), 0.4);
          font-family: var(--fx-font-display);
        }

        .orb-sub {
          font-size: 11px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--fx-muted);
          margin-top: 6px;
          font-family: var(--fx-font-mono);
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

        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
