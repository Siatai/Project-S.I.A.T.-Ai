import React from "react";
import AssociateNavbar from "./AssociateNavbar"; // ✅ Associate Navbar with halo logo
import Wallet from "../shared/Wallet";           // ✅ Wallet Section (fetches /wallet/summary)
import Deposit from "../shared/Deposit";         // ✅ Deposit Section (fetches /associate-roi-status if needed)

export default function AssociateWalletPage() {
  return (
    <div style={pageWrapper}>
      {/* 🔹 Navbar */}
      <AssociateNavbar />

      {/* 🔹 Wallet Section (fixed top, unscrollable) */}
      <div style={walletWrapper}>
        <Wallet />
      </div>

      {/* Divider */}
      <div style={dividerLine} />

      {/* 🔹 Deposit Section (scrollable) */}
      <div style={depositWrapper}>
        <Deposit hideInfoIcon={true} /> {/* ✅ Prop to hide `i` info icon */}
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
  background: "#0f172a", // ✅ dark theme background
};

const walletWrapper = {
  flexShrink: 0,
  padding: "2px",
  background: "rgba(15,23,42,0.85)",
  boxShadow: "0 0 15px rgba(23,232,229,0.2)",
  zIndex: 1,
};

const depositWrapper = {
  flex: 1,
  overflowY: "auto",
  padding: "2px",
};

const dividerLine = {
  margin: "0",
  height: "2px",
  background: "linear-gradient(90deg, transparent, #17E8E5, transparent)",
  boxShadow: "0 0 8px #17E8E5",
};
