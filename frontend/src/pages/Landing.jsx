import React, { useState } from "react";
import { motion } from "framer-motion";
import AuthModal from "./auth/AuthModal";
import bg from "../Components/bg.png";
import avatar from "../Components/avatar.png"; // use your avatar image
import sniper from "../Components/sniper.png";
export default function Landing() {
  const [authOpen, setAuthOpen] = useState(false);

  const stats = [
    { stat: "$7T+", desc: "Daily Trading Volume" },
    { stat: "24/5", desc: "Market Open Hours" },
    { stat: "190+", desc: "Countries Trading" },
    { stat: "88%", desc: "Liquidity vs Stocks" },
  ];

 const comingSoon = [
  { icon: "📊", desc: "Arbitrage Bot" },
  { icon: "⚡", desc: "MEV Bot" },
  { icon: <img src={sniper} alt="Sniper Bot" style={{ width: "40px", margin: "0 auto" }} />, desc: "Sniper Bot" },
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

      {/* Header */}
      <header
        style={{
          position: "relative",
          zIndex: 2,
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #1E293B",
          fontFamily: "Orbitron, Arial, sans-serif",
        }}
      >
        <h1 style={{ color: "#3B82F6", fontSize: "20px", fontWeight: "bold" }}>
          AlgoM³ Ai
        </h1>
        <img
          src={avatar}
          alt="profile"
          onClick={() => setAuthOpen(true)}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            cursor: "pointer",
            border: "2px solid #3B82F6",
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
            textShadow: "0 0 20px #3B82F6, 0 0 40px #1E3A8A",
            lineHeight: "1.2",
          }}
        >
          Meet Algo's{" "}
          <span
            style={{
              color: "#3B82F6",
              textShadow: "0 0 25px #3B82F6, 0 0 50px #2563EB",
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
            fontFamily: "Inter, Arial, sans-serif",
          }}
        >
          AI-powered Forex bot delivering{" "}
          <span style={{ color: "#3B82F6", fontWeight: "600" }}>8–10% ROI</span>{" "}
          monthly. Transparent, consistent, and futuristic growth.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAuthOpen(true)}
          style={{
            background: "#3B82F6",
            color: "#fff",
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

      {/* About Forex Auto-Carousel */}
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
            color: "#3B82F6",
            fontWeight: "700",
            marginBottom: "20px",
            textAlign: "center",
            fontFamily: "Rajdhani, Arial, sans-serif",
          }}
        >
          About Forex
        </h3>
        <div style={{ overflow: "hidden", position: "relative" }}>
          <div
            style={{
              display: "flex",
              animation: "slide 16s linear infinite",
            }}
          >
            {[...stats, ...stats].map((item, i) => (
              <div
                key={i}
                style={{
                  flex: "0 0 250px",
                  margin: "0 10px",
                  background: "rgba(30,41,59,0.6)",
                  border: "1px solid #1E293B",
                  borderRadius: "12px",
                  padding: "30px 20px",
                  textAlign: "center",
                  fontFamily: "Rajdhani, Arial, sans-serif",
                }}
              >
                <h4
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#3B82F6",
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

      {/* Coming Soon Auto-Carousel */}
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
            color: "#3B82F6",
            marginBottom: "20px",
            fontFamily: "Rajdhani, Arial, sans-serif",
          }}
        >
          Coming Soon
        </h3>
        <div style={{ overflow: "hidden", position: "relative" }}>
          <div
            style={{
              display: "flex",
              animation: "slide 14s linear infinite",
            }}
          >
            {[...comingSoon, ...comingSoon].map((item, i) => (
              <div
                key={i}
                style={{
                  flex: "0 0 250px",
                  margin: "0 10px",
                  background: "rgba(30,41,59,0.6)",
                  border: "1px solid #1E293B",
                  borderRadius: "12px",
                  padding: "30px 20px",
                  textAlign: "center",
                }}
              >
                <h4
                  style={{
                    fontSize: "28px",
                    marginBottom: "10px",
                  }}
                >
                  {item.icon}
                </h4>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#94A3B8",
                    fontFamily: "Inter, Arial, sans-serif",
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <p style={{ marginBottom: "5px" }}>
          © {new Date().getFullYear()} AlgoMcube Fintech Pvt. Ltd.
        </p>
        <p>Global AI Trading Innovation Hub</p>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; text-shadow: 0 0 20px #3B82F6, 0 0 40px #1E3A8A; }
          50% { opacity: 0.7; text-shadow: 0 0 10px #3B82F6; }
          100% { opacity: 1; text-shadow: 0 0 20px #3B82F6, 0 0 40px #1E3A8A; }
        }
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
