import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaWallet,
  FaHistory,
  FaMoneyBillWave,
  FaChartLine,
} from "react-icons/fa";
import { avatar } from "../../Components"; // Barrel import

export default function InvestorNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch user info
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
    // Safe mailto to avoid canceled request in network
    window.open("mailto:support@algomcube.com", "_blank", "noreferrer");
  };

  return (
    <>
      {/* HEADER */}
      <header style={headerStyle}>
        {/* Center: Brand */}
        <h2 style={brandText}>
          AlgoM3
        </h2>

        {/* Right: Profile only */}
        <div style={rightHeader}>
          <span style={panelText}>Investor Panel</span>
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
          active={location.pathname === "/investor"}
          to="/investor"
        />
        <FooterBtn
          icon={<FaWallet />}
          label="Wallet"
          active={location.pathname === "/investor/wallet"}
          to="/investor/wallet"
        />
        <FooterBtn
          icon={<FaHistory />}
          label="History"
          active={location.pathname === "/investor/history"}
          to="/investor/history"
        />
        <FooterBtn
          icon={<FaMoneyBillWave />}
          label="Withdraw"
          active={location.pathname === "/investor/withdrawal"}
          to="/investor/withdrawal"
        />
        <FooterBtn
          icon={<FaChartLine />}
          label="Earn"
          active={location.pathname === "/investor/earn"}
          to="/investor/earn"
        />
      </footer>

      {/* Profile Popup */}
      {showProfilePopup && (
        <div style={popupOverlay}>
          <div style={popupBox}>
            <button style={closeBtn} onClick={() => setShowProfilePopup(false)}>
              Close
            </button>
            <h3 style={{ color: "var(--fx-accent)", marginBottom: "15px" }}>
              Profile Options
            </h3>
            <p style={{ color: "var(--fx-ink)", margin: "5px 0" }}>
              <strong>Name:</strong> {user?.name || "Loading..."}
            </p>
            <p style={{ color: "var(--fx-ink)", margin: "5px 0" }}>
              <strong>Email:</strong> {user?.email || "Loading..."}
            </p>
            <hr style={{ margin: "15px 0", borderColor: "var(--fx-surface-strong)" }} />
            <button style={popupBtn} onClick={handleSupport}>
              Raise a Request
            </button>
            <button style={popupBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* Footer Button */
function FooterBtn({ icon, label, active, to }) {
  const navigate = useNavigate();
  return (
    <button
      style={{
        ...footerBtn,
        color: active ? "var(--fx-accent)" : "var(--fx-muted)",
      }}
      onClick={() => navigate(to)}
    >
      <div
        style={{
          height: "4px",
          marginBottom: "6px",
          width: "100%",
          borderTop: active ? "2px solid var(--fx-accent)" : "2px solid transparent",
        }}
      />
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
  background: "linear-gradient(135deg, rgba(7, 15, 30, 0.96), rgba(11, 24, 44, 0.92))",
  backdropFilter: "blur(8px)",
  padding: "14px 20px",
  borderBottom: "1px solid rgba(var(--fx-accent-rgb), 0.35)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const brandText = {
  margin: "0",
  color: "var(--fx-accent-legacy)",
  fontWeight: "700",
  fontSize: "20px",
  fontFamily: "var(--fx-brand-font)",
  textShadow: "0 0 12px rgba(var(--fx-accent-legacy-rgb),0.6)",
  flex: 1,
  textAlign: "center",
};

const rightHeader = { display: "flex", alignItems: "center", gap: "12px" };

const panelText = {
  color: "var(--fx-muted-2)",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
};

const profileIcon = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  border: "2px solid var(--fx-accent)",
  cursor: "pointer",
  background: "#fff",
};

const footerStyle = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  height: "50px",
  background: "linear-gradient(135deg, rgba(7, 15, 30, 0.96), rgba(11, 24, 44, 0.92))",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  padding: "8px 0",
  borderTop: "1px solid rgba(var(--fx-accent-rgb), 0.35)",
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
  background: "var(--fx-card)",
  border: "1px solid rgba(var(--fx-accent-rgb), 0.35)",
  borderRadius: "12px",
  padding: "20px",
  width: "300px",
  textAlign: "center",
  boxShadow: "0 18px 40px rgba(var(--fx-accent-rgb),0.2)",
};

const closeBtn = {
  background: "transparent",
  border: "none",
  color: "var(--fx-ink)",
  fontSize: "14px",
  cursor: "pointer",
  marginBottom: "10px",
};

const popupBtn = {
  width: "100%",
  padding: "10px",
  margin: "8px 0",
  borderRadius: "8px",
  background: "linear-gradient(135deg, rgba(var(--fx-accent-rgb), 0.92), rgba(var(--fx-accent-rgb), 0.65))",
  color: "#05101b",
  fontWeight: "700",
  border: "1px solid rgba(var(--fx-accent-rgb), 0.6)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  cursor: "pointer",
};
