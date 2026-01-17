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
            AlgoM3 AI
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
              textShadow: "0 0 22px rgba(var(--fx-accent-rgb),0.6)",
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--fx-muted-2)",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}
          >
            <span
              style={{
                height: "2px",
                width: "50px",
                background: "var(--fx-accent)",
                boxShadow: "0 0 10px rgba(var(--fx-accent-rgb), 0.5)",
              }}
            />
            Live Systems Active
          </div>
        </div>

        {/* New Slogan */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          style={{
            fontSize: "22px",
            marginTop: "28px",
            color: "var(--fx-accent)",
            fontWeight: "600",
            textShadow: "0 0 12px rgba(var(--fx-accent-rgb),0.6)",
            fontFamily: "var(--fx-font-display)",
            letterSpacing: "0.05em",
          }}
        >
          Signal. Execute. Scale. No noise, just results.
        </motion.p>
        <div className="hero-grid" />
        <div className="hero-scan" />
        <div
          className="hero-metrics"
          style={{
            display: "grid",
            gap: "16px",
            marginTop: "40px",
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
              style={{
                border: "1px solid rgba(var(--fx-accent-rgb), 0.35)",
                borderRadius: "12px",
                padding: "20px",
                background:
                  "linear-gradient(145deg, rgba(6, 14, 28, 0.9), rgba(10, 22, 42, 0.7))",
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
                  fontSize: "20px",
                  color: "var(--fx-accent)",
                  fontWeight: "600",
                  marginTop: "6px",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
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

        @media (max-width: 768px) {
          .landing-hero {
            padding: 40px 20px;
            margin: 20px 10px;
          }
          .landing-title {
            font-size: 28px;
          }
          .hero-metrics {
            grid-template-columns: 1fr 1fr;
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
            padding-right: 280px;
          }
          .hero-metrics {
            grid-template-columns: repeat(4, minmax(160px, 1fr));
            justify-items: stretch;
          }
          .hero-right {
            position: absolute;
            top: 86px;
            right: 28px;
            width: 210px;
            display: block;
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
