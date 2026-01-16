import React, { useEffect } from "react";
import InvestorNavbar from "./Navbar";   // ✅ Navbar with halo logo
import Wallet from "../shared/Wallet";   // ✅ Wallet Section (fetches /wallet/summary)
import Deposit from "../shared/Deposit"; // ✅ Deposit Section (fetches /investor-roi-status)

export default function WalletPage() {
  // 🔹 Apply global body reset like AssociateHome
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "var(--fx-hero)";
    document.body.style.overflowX = "hidden";
  }, []);

  return (
    <div style={pageWrapper}>
      {/* 🔹 Navbar */}
      <InvestorNavbar />

      {/* Content Wrapper (with header/footer spacing) */}
      <div style={contentWrapper}>
        {/* 🔹 Wallet Section (fixed top look) */}
        <div style={walletWrapper}>
          <Wallet />
        </div>

        {/* Divider */}
        <div style={dividerLine} />

        {/* 🔹 Deposit Section (scrollable area) */}
        <div style={depositWrapper}>
          <Deposit hideInfoIcon={true} />
        </div>
      </div>
    </div>
  );
}

/* === Styles === */
const pageWrapper = {
  background: "transparent", // 🔹 dark page background
  color: "var(--fx-ink)",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const contentWrapper = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  paddingTop: "80px",    // space for fixed header
  paddingBottom: "60px", // space for fixed footer
};

const walletWrapper = {
  flexShrink: 0,
  padding: "20px",
  background: "var(--fx-card)",
  border: "1px solid var(--fx-border)",
  boxShadow: "var(--fx-shadow)",
  borderRadius: "12px",
  margin: "0 20px 20px", // spacing from sides and bottom
};

const depositWrapper = {
  flex: 1,
  overflowY: "auto",
  padding: "0 20px 20px",
};

const dividerLine = {
  margin: "0 20px 20px",
  height: "2px",
  background: "linear-gradient(90deg, transparent, var(--fx-accent), transparent)",
  boxShadow: "0 0 8px var(--fx-accent)",
};
