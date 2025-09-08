import React, { useState } from "react";
import { motion } from "framer-motion";
import AuthModal from "./auth/AuthModal";
import bg from "../Components/bg.png";
import avatar from "../Components/avatar.png";
import sniper from "../Components/sniper.png";
import logo from "../Components/logo.png"; // ✅ your square logo

// Divider with neon glow + shine
const Divider = () => (
  <div
    style={{
      height: "4px",
      margin: "50px auto",
      maxWidth: "90%",
      borderRadius: "4px",
      background:
        "linear-gradient(90deg, rgba(0,0,0,0) 0%, #17E8E5 20%, #17E8E5 50%, #17E8E5 80%, rgba(0,0,0,0) 100%)",
      boxShadow: "0 0 30px 8px rgba(23,232,229,0.9)",
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

  // Forex stats
  const stats = [
    { stat: "$7T+", desc: "Daily Trading Volume" },
    { stat: "24/5", desc: "Market Open Hours" },
    { stat: "190+", desc: "Countries Trading" },
    { stat: "88%", desc: "Liquidity vs Stocks" },
  ];

  // Coming soon
  const comingSoon = [
    { icon: "📊", desc: "Arbitrage Bot" },
    { icon: "⚡", desc: "MEV Bot" },
    {
      icon: (
        <img
          src={sniper}
          alt="Sniper Bot"
          style={{ width: "40px", margin: "0 auto" }}
        />
      ),
      desc: "Sniper Bot",
    },
    { icon: "💹", desc: "Crypto Trading Bot" },
    { icon: "📈", desc: "Multi-Asset Smart Portfolio" },
  ];

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        fontFamily: "Inter, Arial, sans-serif",
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflowX: "hidden",
        color: "#E5E7EB",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(rgba(11,18,32,0.85), rgba(11,18,32,0.95))",
          zIndex: 0,
        }}
      />

      {/* Sticky Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Orbitron, Arial, sans-serif",
          background: "rgba(11,18,32,0.9)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
        }}
      >
        {/* ✅ Logo + Text */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src={logo}
            alt="AlgoM³ Logo"
            style={{
              height: "45px",
              width: "45px",
              borderRadius: "8px",
              border: "2px solid #17E8E5",
              background: "#0B1220",
              padding: "4px",
              boxShadow: "0 0 12px rgba(23,232,229,0.6)",
            }}
          />
          <h1
            style={{
              color: "#17E8E5",
              fontSize: "25px",
              fontWeight: "bold",
              justifyContent: "center",
              margin: 0,
              textShadow: "0 0 12px #17E8E5, 0 0 24px #0B1220",
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
            border: "2px solid #17E8E5",
            background: "#fff",
          }}
        />
      </header>

      {/* Hero */}
      <main
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "80px 20px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: "Orbitron, Arial, sans-serif",
            fontSize: "34px",
            fontWeight: "800",
            marginBottom: "20px",
            textShadow: "0 0 25px #17E8E5, 0 0 60px #0B1220",
            lineHeight: "1.2",
          }}
        >
          Meet Algo's{" "}
          <span
            style={{
              color: "#17E8E5",
              textShadow: "0 0 30px #17E8E5, 0 0 60px #0B1220",
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
            color: "#94A3B8",
            lineHeight: "1.6",
            marginBottom: "40px",
          }}
        >
          AI-powered Forex bot delivering{" "}
          <span style={{ color: "#17E8E5", fontWeight: "600" }}>8–10% ROI</span>{" "}
          monthly. Transparent, consistent, and futuristic growth.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAuthOpen(true)}
          style={{
            background: "#17E8E5",
            color: "#0B1220",
            border: "none",
            padding: "14px 36px",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontFamily: "Rajdhani, Arial, sans-serif",
          }}
        >
          Get Started
        </motion.button>
      </main>

      <Divider />

      {/* About Forex */}
      <section
        style={{
          position: "relative",
          zIndex: 2,
          padding: "60px 20px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h3
          style={{
            fontSize: "24px",
            color: "#17E8E5",
            fontWeight: "700",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          About Forex
        </h3>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              width: "max-content",
              animation: "marquee 25s linear infinite",
            }}
          >
            {[...stats, ...stats, ...stats].map((item, i) => (
              <div
                key={i}
                style={{
                  flex: "0 0 250px",
                  margin: "0 12px",
                  background: "rgba(30,41,59,0.7)",
                  borderRadius: "12px",
                  padding: "30px 20px",
                  textAlign: "center",
                  boxShadow: "0 0 15px rgba(23,232,229,0.3)",
                }}
              >
                <h4
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#17E8E5",
                    marginBottom: "10px",
                  }}
                >
                  {item.stat}
                </h4>
                <p style={{ fontSize: "14px", color: "#94A3B8" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* Coming Soon */}
      <section
        style={{
          position: "relative",
          zIndex: 2,
          padding: "60px 20px",
          textAlign: "center",
          background: "rgba(15,23,42,0.7)",
        }}
      >
        <h3
          style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "#17E8E5",
            marginBottom: "20px",
          }}
        >
          Coming Soon
        </h3>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              width: "max-content",
              animation: "marquee 20s linear infinite",
            }}
          >
            {[...comingSoon, ...comingSoon, ...comingSoon].map((item, i) => (
              <div
                key={i}
                style={{
                  flex: "0 0 250px",
                  margin: "0 12px",
                  background: "rgba(30,41,59,0.7)",
                  borderRadius: "12px",
                  padding: "30px 20px",
                  textAlign: "center",
                  boxShadow: "0 0 15px rgba(23,232,229,0.3)",
                }}
              >
                <h4 style={{ fontSize: "28px", marginBottom: "10px" }}>
                  {item.icon}
                </h4>
                <p style={{ fontSize: "16px", color: "#94A3B8" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "30px 15px",
          borderTop: "1px solid #1E293B",
          color: "#64748B",
          fontSize: "14px",
        }}
      >
        <p style={{ marginBottom: "5px" }}>
          © {new Date().getFullYear()} AlgoMcube Fintech Pvt. Ltd.
        </p>
        <p>Global AI Trading Innovation Hub</p>
      </footer>

      {/* Animations + Fixes */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; text-shadow: 0 0 25px #17E8E5, 0 0 60px #0B1220; }
          50% { opacity: 0.7; text-shadow: 0 0 15px #17E8E5; }
          100% { opacity: 1; text-shadow: 0 0 25px #17E8E5, 0 0 60px #0B1220; }
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
          background-color: #0B1220;
          height: 100%;
          overflow-x: hidden;
        }
        #root {
          height: 100%;
        }
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
