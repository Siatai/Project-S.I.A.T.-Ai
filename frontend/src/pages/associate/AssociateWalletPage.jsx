import React, { useEffect } from "react";
import AssociateNavbar from "./AssociateNavbar"; 
import Wallet from "../shared/Wallet";           
import Deposit from "../shared/Deposit";         

export default function AssociateWalletPage() {
  //  On mount  enforce global dark background
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "var(--fx-hero)";
    document.body.style.overflowX = "hidden";
  }, []);

  return (
    <div style={pageWrapper}>
      {/*  Navbar */}
      <AssociateNavbar />

      {/*  Content Wrapper */}
      <div style={contentWrapper}>
        {/* Wallet Section */}
        <div style={walletWrapper}>
          <Wallet />
        </div>

        {/* Divider */}
        <div style={dividerLine} />

        {/* Deposit Section */}
        <div style={depositWrapper}>
          <Deposit hideInfoIcon={true} />
        </div>
      </div>
    </div>
  );
}

/* === Styles === */
const pageWrapper = {
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "var(--fx-hero)",
  color: "var(--fx-ink)",
  padding: "0 16px",
  boxSizing: "border-box",
};

const contentWrapper = {
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  paddingTop: "80px",
  paddingBottom: "70px",
  boxSizing: "border-box",
};

const walletWrapper = {
  flexShrink: 0,
  padding: "20px",
  marginBottom: "20px",
  background: "var(--fx-card)",
  border: "1px solid var(--fx-border)",
  borderRadius: "12px",
  boxShadow: "var(--fx-shadow)",
};

const depositWrapper = {
  flex: 1,
  overflowY: "auto",
  paddingBottom: "20px",
};

const dividerLine = {
  marginBottom: "20px",
  height: "2px",
  background: "linear-gradient(90deg, transparent, var(--fx-accent), transparent)",
  boxShadow: "0 0 8px var(--fx-accent)",
};
