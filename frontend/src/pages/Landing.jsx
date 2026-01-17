import React, { useState } from "react";
import { motion } from "framer-motion";
import AuthModal from "./auth/AuthModal";
import bg from "../Components/bg.png";
import avatar from "../Components/avatar.png";

// Externalized sections
import FlowSection from "../Components/FlowSection";
import ForexStats from "../Components/ForexStats";
import ComingSoon from "../Components/ComingSoon";
import LiveNow from "../Components/LiveNow";

// Divider with neon glow + shine
const Divider = () => (
  <div
    style={{
      height: "4px",
      margin: "50px auto",
      maxWidth: "90%",
      borderRadius: "4px",
      background:
        "linear-gradient(90deg, rgba(0,0,0,0) 0%, var(--fx-accent) 20%, var(--fx-accent) 50%, var(--fx-accent) 80%, rgba(0,0,0,0) 100%)",
      boxShadow: "0 0 30px 8px rgba(var(--fx-accent-rgb),0.9)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: "-50%",
        width: "50%",
        height: "100%",
        background:
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
        animation: "shine 3s linear infinite",
      }}
    />
  </div>
);

export default function Landing() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        fontFamily: "var(--fx-font-body)",
        paddingTop: "70px",
        backgroundImage: `radial-gradient(1200px 600px at 0% 0%, rgba(var(--fx-accent-rgb),0.16), transparent 60%), url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflowX: "hidden",
        color: "var(--fx-ink)",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(800px 400px at 15% 0%, rgba(var(--fx-accent-rgb),0.12), transparent 60%), linear-gradient(130deg, rgba(10,12,20,0.92), rgba(16,22,40,0.9))",
          zIndex: 0,
        }}
      />
      {/* Subtle texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          opacity: 0.035,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Sticky Header */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--fx-font-display)",
          background: "linear-gradient(135deg, rgba(7, 15, 30, 0.96), rgba(11, 24, 44, 0.92))",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(var(--fx-accent-rgb), 0.35)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1
            style={{
              color: "var(--fx-accent-legacy)",
              fontSize: "25px",
              fontWeight: "bold",
              margin: 0,
              fontFamily: "var(--fx-brand-font)",
              textShadow: "0 0 12px rgba(var(--fx-accent-legacy-rgb),0.5)",
            }}
          >
            AlgoM3
          </h1>
        </div>

        <img
          src={avatar}
          alt="profile"
          onClick={() => setAuthOpen(true)}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            cursor: "pointer",
            border: "2px solid var(--fx-accent)",
            background: "#fff",
          }}
        />
      </header>

      {/* Hero Section */}
      <main
        className="landing-hero"
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "60px 50px",
          maxWidth: "1100px",
          margin: "40px auto 0",
          background:
            "linear-gradient(145deg, rgba(6, 14, 30, 0.9), rgba(10, 22, 42, 0.88))",
          border: "1px solid rgba(var(--fx-accent-rgb), 0.35)",
          borderRadius: "20px",
          boxShadow: "0 24px 40px rgba(2, 8, 18, 0.55)",
          backdropFilter: "blur(12px)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(600px 280px at 80% -10%, rgba(var(--fx-accent-rgb), 0.18), transparent 70%)",
            opacity: 0.8,
            pointerEvents: "none",
          }}
        />
        <div className="hero-right" style={{ display: "grid", gap: "14px" }}>
          <div className="hero-right-card">
            <div className="hero-right-title">Live Ops</div>
            <div className="hero-right-value">M3 Core</div>
            <div className="hero-right-line" />
            <div className="hero-right-metric">
              <span>Signal</span>
              <strong>Stable</strong>
            </div>
            <div className="hero-right-metric">
              <span>Latency</span>
              <strong>&lt; 120ms</strong>
            </div>
            <div className="hero-right-metric">
              <span>Risk</span>
              <strong>Adaptive</strong>
            </div>
          </div>
          <div className="hero-right-card hero-right-card--sub">
            <div className="hero-right-title">Session</div>
            <div className="hero-right-value">Neural Sync</div>
            <div className="hero-right-line" />
            <div className="hero-right-metric">
              <span>Mode</span>
              <strong>Auto</strong>
            </div>
            <div className="hero-right-metric">
              <span>Exposure</span>
              <strong>Balanced</strong>
            </div>
          </div>
        </div>
        <div className="hero-content">
          <motion.div
            className="landing-kicker"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 18px",
              borderRadius: "999px",
              border: "1px solid rgba(var(--fx-accent-rgb), 0.3)",
              color: "var(--fx-accent)",
              fontSize: "11px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontFamily: "var(--fx-font-mono)",
              marginBottom: "20px",
              background: "rgba(var(--fx-accent-rgb), 0.08)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--fx-accent-2)",
                boxShadow: "0 0 12px rgba(var(--fx-accent-2-rgb), 0.6)",
              }}
            />
            Command Interface Online
          </motion.div>

        <motion.h2
          className="landing-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: "var(--fx-font-display)",
            fontSize: "42px",
            fontWeight: "800",
            marginBottom: "24px",
            textShadow: "0 0 22px rgba(var(--fx-accent-rgb),0.35)",
            lineHeight: "1.15",
            maxWidth: "700px",
          }}
        >
          The{" "}
          <span
            style={{
              color: "var(--fx-accent)",
              textShadow:
                "0 0 6px rgba(var(--fx-accent-rgb),0.5), 0 0 14px rgba(var(--fx-accent-rgb),0.25)",
              background: "transparent",
              display: "inline-block",
              animation: "pulse 2s infinite",
            }}
          >
            M3
          </span>{" "}
          Tactical Trading Core
          <br />
          for Precision Growth
        </motion.h2>

        <motion.p
          className="landing-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            fontSize: "17px",
            color: "var(--fx-muted-2)",
            lineHeight: "1.6",
            marginBottom: "30px",
            maxWidth: "600px",
          }}
        >
          Adaptive strategy, disciplined execution, and transparent reporting. Targeting{" "}
          <span style={{ color: "var(--fx-accent-2)", fontWeight: "600" }}>8-10% ROI</span>{" "}
          monthly with volatility-aware controls.
        </motion.p>

          <div
            className="hero-cta-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <motion.button
              className="landing-cta"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAuthOpen(true)}
              style={{
                background:
                  "linear-gradient(135deg, rgba(var(--fx-accent-rgb), 0.92), rgba(var(--fx-accent-rgb), 0.65))",
                color: "#05101b",
                border: "1px solid rgba(var(--fx-accent-rgb), 0.6)",
                padding: "14px 35px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontFamily: "var(--fx-font-display)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                boxShadow: "0 10px 20px rgba(var(--fx-accent-rgb),0.2)",
              }}
            >
              Get Started
            </motion.button>
          </div>
        </div>

        <div className="hero-subpanel">
          <div
            className="hero-status"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--fx-muted-2)",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              justifyContent: "center",
              width: "100%",
              textAlign: "center",
              whiteSpace: "nowrap",
              margin: "0 auto",
            }}
          >
            <span
              style={{
                height: "10px",
                width: "10px",
                borderRadius: "50%",
                background: "var(--fx-success)",
                boxShadow: "0 0 12px rgba(34,197,94,0.9)",
                display: "inline-block",
                animation: "pulseGreen 1.6s ease-in-out infinite",
              }}
            />
            Live Systems Active
          </div>

          {/* New Slogan */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            style={{
              fontSize: "22px",
              marginTop: "18px",
              color: "var(--fx-accent)",
              fontWeight: "600",
              textShadow: "0 0 12px rgba(var(--fx-accent-rgb),0.6)",
              fontFamily: "var(--fx-font-display)",
              letterSpacing: "0.05em",
              textAlign: "center",
              width: "100%",
            }}
          >
            <span style={{ display: "block", fontSize: "20px" }}>
              Signal. Execute. Scale.
            </span>
            <span style={{ display: "block", fontSize: "16px", color: "var(--fx-muted-2)" }}>
              No noise, just results.
            </span>
          </motion.p>

          <div
          className="hero-metrics"
          style={{
            display: "grid",
            gap: "16px",
            marginTop: "26px",
            width: "100%",
            maxWidth: "720px",
            marginLeft: "auto",
            marginRight: "auto",
            justifyItems: "center",
          }}
        >
          {[
            { label: "Latency", value: "< 120ms" },
            { label: "Strategy", value: "Adaptive AI" },
            { label: "Coverage", value: "Multi-Market" },
            { label: "Uptime", value: "99.99%" },
          ].map((item) => (
            <div
              key={item.label}
              className="hero-metric-card"
              style={{
                border: "1px solid rgba(var(--fx-accent-rgb), 0.35)",
                borderRadius: "12px",
                padding: "20px",
                background:
                  "linear-gradient(145deg, rgba(6, 14, 28, 0.9), rgba(10, 22, 42, 0.7))",
                width: "100%",
                minHeight: "110px",
                display: "grid",
                alignContent: "center",
                gap: "6px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--fx-muted)",
                  fontFamily: "var(--fx-font-mono)",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: "17px",
                  color: "var(--fx-accent)",
                  fontWeight: "600",
                  lineHeight: "1.2",
                  wordBreak: "normal",
                  hyphens: "manual",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
        </div>
        <div className="hero-grid" />
        <div className="hero-scan" />
      </main>

      <Divider />

      {/* Externalized Sections */}
      <FlowSection />
      <Divider />
      <ForexStats />
      <Divider />
      <LiveNow />
      <Divider />
      <ComingSoon />
      <Divider />

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "30px 15px",
          borderTop: "1px solid var(--fx-border)",
          color: "var(--fx-muted)",
          fontSize: "14px",
        }}
      >
        <p style={{ marginBottom: "5px" }}>
          (c) {new Date().getFullYear()} AlgoMcube Fintech
        </p>
        <p>Global AI Trading Innovation Hub</p>
        <p style={{ marginTop: "8px" }}>
          <a
            href="mailto:support@algomcube.com"
            style={{
              color: "var(--fx-accent)",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            support@algomcube.com
          </a>
        </p>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; text-shadow: 0 0 25px var(--fx-accent), 0 0 60px var(--fx-bg); }
          50% { opacity: 0.7; text-shadow: 0 0 15px var(--fx-accent); }
          100% { opacity: 1; text-shadow: 0 0 25px var(--fx-accent), 0 0 60px var(--fx-bg); }
        }
        @keyframes pulseGreen {
          0% { transform: scale(1); box-shadow: 0 0 10px rgba(34,197,94,0.7); }
          50% { transform: scale(1.25); box-shadow: 0 0 18px rgba(34,197,94,0.95); }
          100% { transform: scale(1); box-shadow: 0 0 10px rgba(34,197,94,0.7); }
        }
        @keyframes shine {
          0% { left: -50%; }
          100% { left: 120%; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        html, body {
          margin: 0;
          padding: 0;
          background-color: var(--fx-bg);
          height: 100%;
          overflow-x: hidden;
        }
        #root { height: 100%; }
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }

        .hero-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(transparent 0%, rgba(255, 255, 255, 0.03) 48%, transparent 100%),
            repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.04) 0 1px, transparent 1px 40px),
            repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.04) 0 1px, transparent 1px 40px);
          opacity: 0.35;
          mix-blend-mode: screen;
        }

        .hero-scan {
          position: absolute;
          inset: -20% 0 0;
          pointer-events: none;
          background: linear-gradient(180deg, transparent 0%, rgba(var(--fx-accent-rgb), 0.14) 50%, transparent 100%);
          animation: scanDown 6s linear infinite;
          opacity: 0.6;
        }

        @keyframes scanDown {
          0% { transform: translateY(-40%); }
          100% { transform: translateY(40%); }
        }

        .hero-metrics {
          grid-template-columns: repeat(4, 1fr);
        }

        .hero-content {
          width: 100%;
          max-width: 720px;
        }

        .hero-subpanel {
          width: 100%;
          max-width: 760px;
          margin-top: 30px;
          padding: 24px 22px;
          border-radius: 18px;
          border: 1px solid rgba(var(--fx-accent-rgb), 0.25);
          background: linear-gradient(150deg, rgba(6, 14, 30, 0.85), rgba(10, 20, 38, 0.8));
          box-shadow: 0 18px 30px rgba(2, 8, 18, 0.45);
          margin-left: auto;
          margin-right: auto;
          text-align: center;
          align-self: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        @media (max-width: 768px) {
          .landing-hero {
            padding: 36px 18px;
            margin: 18px 12px;
            align-items: center;
            text-align: center;
          }
          .landing-title {
            font-size: 28px;
          }
          .hero-metrics {
            grid-template-columns: 1fr 1fr;
            justify-items: center;
          }
          .hero-right {
            display: none !important;
          }
          .hero-cta-row {
            justify-content: center;
          }
          .hero-status {
            justify-content: center;
          }
          .hero-metric-card {
            text-align: center;
            width: 100%;
          }
        }

        @media (max-width: 900px) {
          .hero-right {
            display: none !important;
          }
          .hero-metrics {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .flow-section {
            padding: 44px 18px 54px;
            margin: 18px 12px;
          }
        }

        @media (max-width: 640px) {
          .landing-hero {
            padding: 40px 20px;
            margin: 20px 10px;
            border-radius: 16px;
            text-align: center;
            align-items: center;
          }
          .landing-kicker {
            font-size: 9px;
            letter-spacing: 0.22em;
          }
          .landing-title {
            font-size: 24px;
          }
          .landing-subtitle {
            font-size: 13px;
          }
          .landing-cta {
            width: 100%;
            max-width: 220px;
            font-size: 12px;
          }
          .hero-cta-row {
            justify-content: center;
          }
          .hero-metrics {
            justify-items: center;
            width: 100%;
            grid-template-columns: 1fr;
          }
          .hero-grid {
            opacity: 0.25;
          }
          .hero-scan {
            opacity: 0.35;
          }
        }

        @media (min-width: 900px) {
          .landing-hero {
            padding: 72px 70px 64px;
            padding-right: 320px;
            align-items: flex-start;
            text-align: left;
          }
          .hero-metrics {
            grid-template-columns: repeat(4, minmax(160px, 1fr));
            justify-items: stretch;
          }
          .hero-subpanel {
            margin-left: 0;
          }
          .hero-right {
            position: absolute;
            top: 86px;
            right: 28px;
            width: 210px;
            display: block;
          }
        }

        @media (max-width: 520px) {
          .hero-metrics {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 899px) {
          .hero-right {
            display: none;
          }
        }

        .hero-right-card {
          background: rgba(6, 14, 28, 0.85);
          border: 1px solid rgba(var(--fx-accent-rgb), 0.35);
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 18px 28px rgba(2, 8, 18, 0.5);
          text-align: left;
        }

        .hero-right-title {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--fx-muted);
          font-family: var(--fx-font-mono);
        }

        .hero-right-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--fx-ink);
          margin: 10px 0 8px;
        }

        .hero-right-line {
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--fx-accent), transparent);
          box-shadow: 0 0 12px rgba(var(--fx-accent-rgb), 0.4);
          margin: 10px 0 12px;
        }

        .hero-right-metric {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--fx-muted-2);
          margin-bottom: 8px;
        }

        .hero-right-metric strong {
          color: var(--fx-accent);
          font-weight: 600;
        }
      `}</style>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
