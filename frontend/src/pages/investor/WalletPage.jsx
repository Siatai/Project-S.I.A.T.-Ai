import React, { useEffect } from "react";
import InvestorNavbar from "./Navbar";   //  Navbar with halo logo
import Wallet from "../shared/Wallet";   //  Wallet Section (fetches /wallet/summary)
import Deposit from "../shared/Deposit"; //  Deposit Section (fetches /investor-roi-status)

export default function WalletPage() {
  //  Apply global body reset like AssociateHome
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "var(--fx-hero)";
    document.body.style.overflowX = "hidden";
  }, []);

  return (
    <div style={pageWrapper}>
      {/*  Navbar */}
      <InvestorNavbar />

      {/* Content Wrapper (with header/footer spacing) */}
      <div style={contentWrapper} className="wallet-shell">
        {/*  Wallet Section (fixed top look) */}
        <div style={walletWrapper}>
          <Wallet />
        </div>

        {/* Divider */}
        <div style={dividerLine} />

        {/*  Deposit Section (scrollable area) */}
        <div style={depositWrapper}>
          <Deposit hideInfoIcon={true} />
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .wallet-shell {
            padding: 0;
            padding-top: 72px;
            padding-bottom: 84px;
          }
        }
      `}</style>
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
  padding: "2px",
  background: "var(--fx-card)",
  border: "1px solid var(--fx-border)",
  boxShadow: "var(--fx-shadow)",
  borderRadius: "12px",
  marginBottom: "20px",
};

const depositWrapper = {
  flex: 1,
  overflowY: "auto",
  paddingBottom: "2px",
};

const dividerLine = {
  marginBottom: "20px",
  height: "2px",
  background: "linear-gradient(90deg, transparent, var(--fx-accent), transparent)",
  boxShadow: "0 0 8px var(--fx-accent)",
};
