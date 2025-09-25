import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaWallet,
  FaUsers,
  FaHistory,
  FaMoneyBillWave,
} from "react-icons/fa";
import { logo, avatar } from "../../Components"; // ✅ barrel import

export default function AssociateNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [user, setUser] = useState(null);

  // 🔹 Fetch user info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("https://project-s-i-a-t-ai.onrender.com/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("User fetch error:", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleSupport = () => {
    // ✅ Safe mailto, no "canceled request" in Network tab
    window.open("mailto:support@algomcube.com", "_blank", "noreferrer");
  };

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

        {/* Right: Panel name + Profile */}
        <div style={rightHeader}>
          <span style={panelText}>Associate Panel</span>
          <img
            src={avatar}
            alt="Profile"
            onClick={() => setShowProfilePopup(true)}
            style={profileIcon}
          />
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

      {/* ✅ Profile Popup */}
      {showProfilePopup && (
        <div style={popupOverlay}>
          <div style={popupBox}>
            <button style={closeBtn} onClick={() => setShowProfilePopup(false)}>
              ❌ Close
            </button>
            <h3 style={{ color: "#17E8E5", marginBottom: "15px" }}>
              Profile Options
            </h3>
            <p style={{ color: "#E5E7EB", margin: "5px 0" }}>
              <strong>Name:</strong> {user?.name || "Loading..."}
            </p>
            <p style={{ color: "#E5E7EB", margin: "5px 0" }}>
              <strong>Email:</strong> {user?.email || "Loading..."}
            </p>
            <hr style={{ margin: "15px 0", borderColor: "#1E293B" }} />
            <button style={popupBtn} onClick={handleSupport}>
              Raise a Request
            </button>
            <button style={popupBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Footer Button */
function FooterBtn({ icon, label, active, to }) {
  const navigate = useNavigate();
  return (
    <button
      style={{
        ...footerBtn,
        color: active ? "#17E8E5" : "#9CA3AF",
        borderTop: active ? "2px solid #17E8E5" : "2px solid transparent",
        paddingTop: "6px",
        paddingBottom: "6px",
      }}
      onClick={() => navigate(to)}
    >
      {icon}
      <span style={{ fontSize: "12px", marginTop: "4px" }}>{label}</span>
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

const logoStyle = { height: "32px", objectFit: "contain" };

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

const rightHeader = { display: "flex", alignItems: "center", gap: "10px" };

const panelText = { color: "#E5E7EB", fontSize: "14px", fontWeight: "500" };

const profileIcon = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  border: "2px solid #17E8E5",
  cursor: "pointer",
  background: "#fff",
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
  padding: "8px 0",
  borderTop: "1px solid #1F2937",
  zIndex: 1000,
};

const footerBtn = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  fontSize: "16px",
  cursor: "pointer",
  gap: "3px",
};

/* === Popup Styles === */
const popupOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 5000,
};

const popupBox = {
  background: "rgba(15,23,42,0.95)",
  border: "1px solid rgba(23,232,166,0.3)",
  borderRadius: "12px",
  padding: "20px",
  width: "300px",
  textAlign: "center",
  boxShadow: "0 0 20px rgba(23,232,229,0.5)",
};

const closeBtn = {
  background: "transparent",
  border: "none",
  color: "#E5E7EB",
  fontSize: "14px",
  cursor: "pointer",
  marginBottom: "10px",
};

const popupBtn = {
  width: "100%",
  padding: "10px",
  margin: "8px 0",
  borderRadius: "8px",
  border: "none",
  background: "#17E8E5",
  color: "#0f172a",
  fontWeight: "600",
  cursor: "pointer",
};
