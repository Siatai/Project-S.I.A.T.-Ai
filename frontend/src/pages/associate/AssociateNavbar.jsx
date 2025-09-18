import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaWallet,
  FaUsers,
  FaHistory,
  FaMoneyBillWave,
  FaBars, // ✅ Hamburger icon
} from "react-icons/fa";
import logo from "../../Components/logo.png";

export default function AssociateNavbar() {
  const location = useLocation();

  return (
    <div>
      {/* HEADER */}
      <header style={headerStyle}>
        {/* Left: Logo */}
        <div style={logoHalo}>
          <div style={logoBox}>
            <img src={logo} alt="Logo" style={logoStyle} />
          </div>
        </div>

        {/* Center: Brand */}
        <h2 style={brandText}>
          AlgoM<sup style={{ fontSize: "12px" }}>3</sup> Ai
        </h2>

        {/* Right: Panel name + Menu */}
        <div style={rightHeader}>
          <span style={panelText}>Associate Panel</span>
          <FaBars style={menuIcon} />
        </div>
      </header>

      {/* FOOTER NAV */}
      <footer style={footerStyle}>
        <FooterBtn
          icon={<FaHome />}
          label="Home"
          active={location.pathname === "/associate"}
          to="/associate"
        />
        <FooterBtn
          icon={<FaWallet />}
          label="Wallet"
          active={location.pathname === "/associate/wallet"}
          to="/associate/wallet"
        />
        <FooterBtn
          icon={<FaUsers />}
          label="Referrals"
          active={location.pathname === "/associate/referrals"}
          to="/associate/referrals"
        />
        <FooterBtn
          icon={<FaHistory />}
          label="History"
          active={location.pathname === "/associate/history"}
          to="/associate/history"
        />
        <FooterBtn
          icon={<FaMoneyBillWave />}
          label="Withdraw"
          active={location.pathname === "/associate/withdrawal"}
          to="/associate/withdrawal"
        />
      </footer>
    </div>
  );
}

/* Footer Button */
function FooterBtn({ icon, label, active, to }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (to) navigate(to);
  };

  return (
    <button
      style={{
        ...footerBtn,
        color: active ? "#17E8E5" : "#9CA3AF",
        borderTop: active ? "2px solid #17E8E5" : "2px solid transparent",
      }}
      onClick={handleClick}
    >
      {icon}
      <span style={{ fontSize: "12px", marginTop: "2px" }}>{label}</span>
    </button>
  );
}

/* === Styles === */
const headerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: "60px",
  background: "#0f172a",
  padding: "14px 20px",
  borderBottom: "1px solid #1F2937",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const logoHalo = {
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(23,232,229,0.4) 0%, rgba(23,232,229,0) 70%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const logoBox = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  border: "2px solid #17E8E5",
  boxShadow: "0 0 10px #17E8E5, 0 0 20px rgba(23,232,229,0.6)",
  background: "rgba(15,23,42,0.7)",
};

const logoStyle = {
  height: "32px",
  objectFit: "contain",
};

const brandText = {
  margin: "0",
  color: "#17E8E5",
  fontWeight: "700",
  fontSize: "20px",
  fontFamily: "Orbitron",
  textShadow: "0 0 10px #17E8E5, 0 0 20px #17E8E5",
  flex: 1,
  textAlign: "center",
};

const rightHeader = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const panelText = {
  color: "#E5E7EB",
  fontSize: "14px",
  fontWeight: "500",
};

const menuIcon = {
  color: "#17E8E5",
  fontSize: "18px",
  cursor: "pointer",
};

const footerStyle = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  height: "60px",
  background: "#0f172a",
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  padding: "12px 0",
  borderTop: "1px solid #1F2937",
  zIndex: 1000,
};

const footerBtn = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "transparent",
  border: "none",
  fontSize: "16px",
  cursor: "pointer",
};
