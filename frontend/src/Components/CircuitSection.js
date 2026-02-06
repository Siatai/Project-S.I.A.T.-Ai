import React from "react";

const rows = [
  { label: "Signal Mesh", accent: "var(--fx-accent)" },
  { label: "Execution Grid", accent: "var(--fx-accent-2)" },
  { label: "Risk Lattice", accent: "var(--fx-accent-legacy)" },
];

export default function CircuitSection() {
  return (
    <section className="circuit-section">
      <div className="circuit-bg" aria-hidden="true" />
      <div className="circuit-header">
        <span className="circuit-chip">Neural Circuitry</span>
        <h2>Precision Routing Core</h2>
        <p>Symmetric signal paths feed the core with clean, low-latency flow.</p>
      </div>

      <div className="circuit-body">
        <div className="circuit-side circuit-side--left">
          {rows.map((row) => (
            <div className="circuit-row" key={`left-${row.label}`}>
              <div className="circuit-line" />
              <div className="circuit-node" style={{ borderColor: row.accent }} />
              <div className="circuit-label">{row.label}</div>
            </div>
          ))}
        </div>

        <div className="circuit-core">
          <div className="circuit-core__ring" />
          <div className="circuit-core__ring circuit-core__ring--mid" />
          <div className="circuit-core__ring circuit-core__ring--inner" />
          <div className="circuit-core__disc" />
          <div className="circuit-core__label">Core</div>
        </div>

        <div className="circuit-side circuit-side--right">
          {rows.map((row) => (
            <div className="circuit-row" key={`right-${row.label}`}>
              <div className="circuit-label">{row.label}</div>
              <div className="circuit-node" style={{ borderColor: row.accent }} />
              <div className="circuit-line" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .circuit-section {
          position: relative;
          padding: 70px 24px;
          margin: 0 auto;
          max-width: 1100px;
          border-radius: 26px;
          border: 1px solid rgba(var(--fx-accent-rgb), 0.25);
          background: linear-gradient(140deg, rgba(6, 14, 30, 0.9), rgba(10, 22, 42, 0.85));
          overflow: hidden;
          box-shadow: 0 30px 50px rgba(2, 8, 18, 0.55);
        }

        .circuit-bg {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(600px 320px at 10% 20%, rgba(var(--fx-accent-rgb), 0.15), transparent 70%),
            radial-gradient(700px 380px at 90% 20%, rgba(var(--fx-accent-legacy-rgb), 0.12), transparent 70%),
            url("data:image/svg+xml,%3Csvg width='800' height='460' viewBox='0 0 800 460' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%2390c6ff' stroke-width='1' stroke-opacity='0.25' fill='none'%3E%3Cpath d='M40 80h120l40 40h120'/%3E%3Cpath d='M40 140h180l30 30h110'/%3E%3Cpath d='M40 200h150l60 60h120'/%3E%3Cpath d='M760 80H640l-40 40H480'/%3E%3Cpath d='M760 140H600l-30 30H460'/%3E%3Cpath d='M760 200H610l-60 60H430'/%3E%3Ccircle cx='200' cy='80' r='6'/%3E%3Ccircle cx='250' cy='170' r='6'/%3E%3Ccircle cx='220' cy='260' r='6'/%3E%3Ccircle cx='600' cy='80' r='6'/%3E%3Ccircle cx='550' cy='170' r='6'/%3E%3Ccircle cx='580' cy='260' r='6'/%3E%3C/g%3E%3C/svg%3E");
          background-size: cover;
          opacity: 0.7;
          pointer-events: none;
        }

        .circuit-header {
          position: relative;
          z-index: 2;
          text-align: center;
          margin-bottom: 42px;
        }

        .circuit-chip {
          display: inline-flex;
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid rgba(var(--fx-accent-rgb), 0.45);
          color: var(--fx-accent);
          text-transform: uppercase;
          letter-spacing: 0.26em;
          font-size: 10px;
          font-family: var(--fx-font-display);
          background: rgba(var(--fx-accent-rgb), 0.08);
        }

        .circuit-header h2 {
          margin: 14px 0 8px;
          font-family: var(--fx-font-display);
          font-size: 28px;
          color: var(--fx-ink);
          text-shadow: 0 0 18px rgba(var(--fx-accent-rgb), 0.3);
        }

        .circuit-header p {
          margin: 0 auto;
          max-width: 520px;
          color: var(--fx-muted-2);
          line-height: 1.6;
        }

        .circuit-body {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 220px 1fr;
          align-items: center;
          gap: 26px;
        }

        .circuit-side {
          display: grid;
          gap: 24px;
        }

        .circuit-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          gap: 14px;
          color: var(--fx-ink);
          font-family: var(--fx-font-display);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .circuit-side--right .circuit-row {
          grid-template-columns: auto auto 1fr;
          text-align: right;
        }

        .circuit-line {
          height: 2px;
          background: linear-gradient(90deg, rgba(0,0,0,0), rgba(var(--fx-accent-rgb), 0.6), rgba(0,0,0,0));
          position: relative;
        }

        .circuit-line::before,
        .circuit-line::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(var(--fx-accent-rgb), 0.75);
          box-shadow: 0 0 12px rgba(var(--fx-accent-rgb), 0.6);
          transform: translateY(-50%);
        }

        .circuit-line::before { left: 12%; }
        .circuit-line::after { right: 12%; background: rgba(var(--fx-accent-legacy-rgb), 0.8); }

        .circuit-node {
          width: 18px;
          height: 18px;
          border-radius: 6px;
          border: 2px solid var(--fx-accent);
          box-shadow: 0 0 12px rgba(var(--fx-accent-rgb), 0.5);
          background: rgba(6, 14, 28, 0.9);
        }

        .circuit-label {
          color: var(--fx-muted-2);
          font-size: 11px;
          letter-spacing: 0.18em;
        }

        .circuit-core {
          position: relative;
          width: 220px;
          height: 220px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background:
            radial-gradient(120px 120px at 28% 25%, rgba(255, 255, 255, 0.18), rgba(10, 16, 28, 0) 60%),
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.12), rgba(10, 16, 28, 0.95));
          border: 1px solid rgba(120, 140, 160, 0.55);
          box-shadow:
            inset 0 10px 20px rgba(255, 255, 255, 0.04),
            inset 0 -22px 30px rgba(0, 0, 0, 0.6),
            0 18px 26px rgba(2, 8, 18, 0.45),
            0 40px 70px rgba(2, 8, 18, 0.65);
          overflow: hidden;
        }

        .circuit-core__ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(140, 170, 200, 0.55);
          box-shadow: inset 0 0 26px rgba(20, 40, 60, 0.6), 0 0 20px rgba(80, 140, 190, 0.35);
          animation: circuitSpin 18s linear infinite;
        }

        .circuit-core__ring--mid {
          inset: 18px;
          border-style: dashed;
          border-color: rgba(var(--fx-accent-rgb), 0.65);
          box-shadow:
            0 0 14px rgba(var(--fx-accent-rgb), 0.55),
            0 0 28px rgba(var(--fx-accent-rgb), 0.35),
            inset 0 0 10px rgba(var(--fx-accent-rgb), 0.4);
          animation-duration: 14s;
        }

        .circuit-core__ring--inner {
          inset: 38px;
          border-width: 1px;
          border-color: rgba(90, 140, 180, 0.5);
          animation-duration: 10s;
        }

        .circuit-core__disc {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background:
            radial-gradient(60px 60px at 30% 28%, rgba(255, 255, 255, 0.14), rgba(10, 20, 35, 0) 55%),
            radial-gradient(circle, rgba(12, 26, 44, 0.92), rgba(4, 8, 16, 0.98));
          border: 1px solid rgba(80, 150, 210, 0.65);
          box-shadow:
            inset 0 16px 22px rgba(255, 255, 255, 0.1),
            inset 0 -18px 26px rgba(0, 0, 0, 0.85),
            0 16px 28px rgba(0, 0, 0, 0.45),
            0 0 32px rgba(var(--fx-accent-rgb), 0.45);
        }

        .circuit-core__disc::before {
          content: "";
          position: absolute;
          inset: 54px;
          border-radius: 50%;
          border: 2px solid rgba(255, 170, 60, 0.8);
          box-shadow: 0 0 22px rgba(255, 150, 60, 0.55);
        }

        .circuit-core__disc::after {
          content: "";
          position: absolute;
          inset: 44px;
          border-radius: 50%;
          background:
            conic-gradient(
              from 30deg,
              rgba(255, 170, 60, 0.95),
              rgba(255, 120, 40, 0.6),
              rgba(255, 210, 120, 0.85),
              rgba(255, 140, 40, 0.7),
              rgba(255, 170, 60, 0.95)
            );
          filter: blur(1px);
          opacity: 0.55;
          animation: circuitSpin 12s linear infinite;
        }

        .circuit-core__label {
          position: absolute;
          bottom: -28px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          color: var(--fx-muted);
          font-family: var(--fx-font-mono);
        }

        @keyframes circuitSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 900px) {
          .circuit-body {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .circuit-side--right .circuit-row,
          .circuit-side--left .circuit-row {
            grid-template-columns: 1fr auto auto;
            text-align: left;
          }
          .circuit-core {
            margin: 0 auto;
          }
          .circuit-label {
            letter-spacing: 0.14em;
          }
        }

        @media (max-width: 640px) {
          .circuit-section {
            padding: 50px 18px;
          }
          .circuit-core {
            width: 180px;
            height: 180px;
          }
          .circuit-core__disc {
            width: 96px;
            height: 96px;
          }
        }
      `}</style>
    </section>
  );
}
