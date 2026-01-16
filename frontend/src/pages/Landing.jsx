import React, { useState } from "react";
import { motion } from "framer-motion";
import AuthModal from "./auth/AuthModal";
import bg from "../Components/bg.png";
import avatar from "../Components/avatar.png";

// ✅ externalized sections
import FlowSection from "../Components/FlowSection";
import ForexStats from "../Components/ForexStats";
import ComingSoon from "../Components/ComingSoon";

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
        backgroundImage: `radial-gradient(1200px 600px at 0% 0%, rgba(var(--fx-accent-2-rgb),0.16), transparent 60%), url(${bg})`,
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

      {/* ✅ Sticky Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--fx-font-display)",
          background: "rgba(10, 12, 20, 0.82)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1
            style={{
              color: "var(--fx-accent-2)",
              fontSize: "25px",
              fontWeight: "bold",
              margin: 0,
              textShadow: "0 0 12px rgba(var(--fx-accent-2-rgb),0.5)",
            }}
          >
            AlgoM³ Ai
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

      {/* ✅ Hero Section */}
      <main
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "80px 20px",
          maxWidth: "900px",
          margin: "0 auto",
          background: "rgba(10,12,20,0.4)",
          border: "1px solid var(--fx-border)",
          borderRadius: "24px",
          boxShadow: "var(--fx-shadow)",
          backdropFilter: "blur(10px)",
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: "var(--fx-font-display)",
            fontSize: "34px",
            fontWeight: "800",
            marginBottom: "20px",
            textShadow: "0 0 20px rgba(var(--fx-accent-2-rgb),0.35)",
            lineHeight: "1.2",
          }}
        >
          Meet Algo's{" "}
          <span
            style={{
              color: "var(--fx-accent-2)",
              textShadow: "0 0 18px rgba(var(--fx-accent-2-rgb),0.45)",
              animation: "pulse 2s infinite",
            }}
          >
            M³
          </span>{" "}
          — Your AI Trading Bot
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            fontSize: "16px",
            color: "var(--fx-muted)",
            lineHeight: "1.6",
            marginBottom: "40px",
          }}
        >
          AI-powered Forex bot delivering{" "}
          <span style={{ color: "var(--fx-accent)", fontWeight: "600" }}>8–10% ROI</span>{" "}
          monthly. Transparent, consistent, and futuristic growth.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAuthOpen(true)}
          style={{
            background: "var(--fx-button)",
            color: "var(--fx-bg)",
            border: "none",
            padding: "14px 36px",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontFamily: "var(--fx-font-display)",
            boxShadow: "0 10px 20px rgba(var(--fx-accent-2-rgb),0.2)",
          }}
        >
          Get Started
        </motion.button>

        {/* ✅ New Slogan */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          style={{
            fontSize: "18px",
            marginTop: "25px",
            color: "var(--fx-accent-2)",
            fontWeight: "600",
            textShadow: "0 0 12px rgba(var(--fx-accent-2-rgb),0.6)",
            fontFamily: "var(--fx-font-display)",
          }}
        >
          AI creates the edge. ML makes it smarter. AlgoM³ turns it into profit.
        </motion.p>
      </main>

      <Divider />

      {/* ✅ Externalized Sections */}
      <FlowSection />
      <Divider />
      <ForexStats />
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
          © {new Date().getFullYear()} AlgoMcube Fintech
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
      `}</style>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
