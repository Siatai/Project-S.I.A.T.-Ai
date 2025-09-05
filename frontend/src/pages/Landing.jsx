import React, { useState } from "react";
import AuthModal from "./auth/AuthModal";

export default function Landing() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div style={{ backgroundColor: "#0B1220", color: "#E5E7EB", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <header
        style={{
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #1E293B",
        }}
      >
        <h1 style={{ color: "#3B82F6", fontSize: "24px", fontWeight: "bold" }}>Project S.I.A.T. Ai</h1>
        <button
          style={{
            background: "#3B82F6",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}
          onClick={() => setAuthOpen(true)}
        >
          Profile
        </button>
      </header>

      {/* Hero Section */}
      <main
        style={{
          textAlign: "center",
          padding: "120px 20px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ fontSize: "40px", color: "#E5E7EB", marginBottom: "20px" }}>
          AI Forex Bot with <span style={{ color: "#3B82F6" }}>8–10% ROI</span> Monthly
        </h2>
        <p style={{ fontSize: "18px", color: "#94A3B8", lineHeight: "1.6", marginBottom: "40px" }}>
          Experience consistent growth with our automated trading bot. The Forex market is a{" "}
          <span style={{ color: "#3B82F6" }}>$7 trillion</span> daily industry — transparent,
          global, and liquid. Invest smart, grow steady, and scale your returns over time.
        </p>

        <button
          style={{
            background: "#3B82F6",
            color: "#fff",
            border: "none",
            padding: "15px 40px",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
          onClick={() => setAuthOpen(true)}
        >
          Get Started
        </button>
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "20px",
          borderTop: "1px solid #1E293B",
          color: "#64748B",
        }}
      >
        © {new Date().getFullYear()} IronDoge. All rights reserved.
      </footer>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
