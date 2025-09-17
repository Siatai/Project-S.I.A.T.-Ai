import React from "react";
import InvestorNavbar from "./Navbar";   // ✅ Navbar with halo logo
import Wallet from "../shared/Wallet";   // ✅ Wallet Section (fetches /wallet/summary)
import Deposit from "../shared/Deposit"; // ✅ Deposit Section (fetches /investor-roi-status)

export default function WalletPage() {
  return (
    <div style={pageWrapper}>
      {/* 🔹 Navbar */}
      <InvestorNavbar />

      {/* 🔹 Wallet Section (fixed top, unscrollable) */}
      <div style={walletWrapper}>
        <Wallet />
      </div>

      {/* Divider */}
      <div style={dividerLine} />

      {/* 🔹 Deposit Section (scrollable) */}
      <div style={depositWrapper}>
        <Deposit hideInfoIcon={true} /> {/* ✅ Pass prop to hide `i` icon */}
      </div>
    </div>
  );
}

/* === Styles === */
const pageWrapper = {
  color: "#E5E7EB",
  display: "flex",
  flexDirection: "column",
  height: "100vh",
};

const walletWrapper = {
  flexShrink: 0,
  padding: "20px",
  background: "rgba(15,23,42,0.85)",
  boxShadow: "0 0 15px rgba(23,232,229,0.2)",
  zIndex: 1,
};

const depositWrapper = {
  flex: 1,
  overflowY: "auto",
  padding: "20px",
};

const dividerLine = {
  margin: "0",
  height: "2px",
  background: "linear-gradient(90deg, transparent, #17E8E5, transparent)",
  boxShadow: "0 0 8px #17E8E5",
};
