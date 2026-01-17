import React from "react";

export default function HudLoader({ text = "Loading..." }) {
  return (
    <div className="hud-loader">
      <div className="hud-loader-core">
        <div className="hud-loader-ring" />
        <div className="hud-loader-ring hud-loader-ring--outer" />
        <div className="hud-loader-dot" />
      </div>
      <div className="hud-loader-text">{text}</div>

      <style>{`
        .hud-loader {
          min-height: 45vh;
          display: grid;
          place-items: center;
          gap: 14px;
          color: var(--fx-muted-2);
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 11px;
          font-family: var(--fx-font-mono);
        }

        .hud-loader-core {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(var(--fx-accent-rgb), 0.28),
            rgba(5, 12, 24, 0.95)
          );
          border: 1px solid rgba(var(--fx-accent-rgb), 0.5);
          box-shadow: 0 0 24px rgba(var(--fx-accent-rgb), 0.25);
        }

        .hud-loader-ring {
          position: absolute;
          inset: 10px;
          border-radius: 50%;
          border: 1px solid rgba(var(--fx-accent-rgb), 0.35);
          animation: hudSpin 2.4s linear infinite;
        }

        .hud-loader-ring--outer {
          inset: -6px;
          border: 1px dashed rgba(var(--fx-accent-rgb), 0.3);
          animation-duration: 3.4s;
        }

        .hud-loader-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 10px;
          height: 10px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: var(--fx-accent);
          box-shadow: 0 0 12px rgba(var(--fx-accent-rgb), 0.8);
          animation: hudPulse 1.4s ease-in-out infinite;
        }

        .hud-loader-text {
          text-align: center;
        }

        @keyframes hudSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes hudPulse {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
