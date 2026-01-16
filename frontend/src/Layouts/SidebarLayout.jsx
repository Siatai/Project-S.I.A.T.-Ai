import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SidebarLayout({
  role = "associate",
  user = { name: "User", wallet_balance: 1000 },
  children,
}) {
  const [active, setActive] = useState("home");
  const navigate = useNavigate();

  // Sidebar items by role
  const sidebarItems = {
    investor: [
      { key: "account", label: "My Account", path: "/investor/account" },
      { key: "deposit", label: "Deposit", path: "/investor/deposit" },
      { key: "withdrawal", label: "Withdrawal", path: "/investor/withdrawal" },
      { key: "history", label: "Transaction History", path: "/investor/history" },
      { key: "wallet", label: "Crypto Wallet", path: "/investor/wallet" },
      { key: "analytics", label: "Analytics", path: "/investor/analytics" },
    ],
    associate: [
      { key: "home", label: "Home", path: "/associate" },
      { key: "deposit", label: "Deposit", path: "/associate/deposit" },
      { key: "withdrawal", label: "Withdrawal", path: "/associate/withdrawal" },
      { key: "wallet", label: "Wallet", path: "/associate/wallet" },
      { key: "transactions", label: "Transactions", path: "/associate/history" },
      { key: "commissions", label: "Referrals & Deposits", path: "/associate/deposits" },
      { key: "analytics", label: "Analytics", path: "/associate/analytics" },
    ],
    admin: [
      { key: "dashboard", label: "Dashboard", path: "/admin" },
      { key: "users", label: "Users", path: "/admin/users" },
      { key: "roi-config", label: "ROI Config", path: "/admin/roi-config" },
      { key: "commission-config", label: "Commission Config", path: "/admin/commission-config" },
      { key: "roi-credit", label: "ROI & Commission Credit", path: "/admin/roi-credit" },
      { key: "financial-summary", label: "Financial Summary", path: "/admin/financial-summary" },
      { key: "approvals", label: "Withdrawal Approvals", path: "/admin/approvals" },
      { key: "transactions", label: "Transactions", path: "/admin/transactions" },
      { key: "analytics", label: "Analytics", path: "/admin/analytics" },
    ],
  };

  const handleNav = (item) => {
    setActive(item.key);
    navigate(item.path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--fx-hero)", color: "var(--fx-ink)" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "260px",
          background: "linear-gradient(145deg, rgba(6, 14, 30, 0.98), rgba(10, 22, 42, 0.96))",
          padding: "20px 15px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid rgba(var(--fx-accent-rgb), 0.35)",
          boxShadow: "var(--fx-shadow)",
        }}
      >
        <div>
          {/* User Info */}
          <div style={{ marginBottom: "30px", textAlign: "left" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "5px" }}>
              {user.name || "User"}
            </h2>
            <p style={{ fontSize: "14px", color: "var(--fx-accent)", fontWeight: "600" }}>
              Balance: ${user.wallet_balance?.toLocaleString() || 0}
            </p>
          </div>

          {/* Menu Items */}
          {sidebarItems[role].map((item) => (
            <div
              key={item.key}
              onClick={() => handleNav(item)}
              style={{
                padding: "12px 15px",
                margin: "6px 0",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: active === item.key ? "rgba(var(--fx-accent-rgb),0.1)" : "transparent",
                color: active === item.key ? "var(--fx-accent)" : "var(--fx-ink)",
                fontWeight: active === item.key ? "600" : "400",
                transition: "all 0.2s ease-in-out",
              }}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Logout */}
        <div
          onClick={handleLogout}
          style={{
            padding: "12px 15px",
            margin: "6px 0",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: "var(--fx-surface-strong)",
            textAlign: "center",
            color: "var(--fx-danger)",
            fontWeight: "600",
          }}
        >
          Logout
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Header with Branding */}
        <div
          style={{
            height: "60px",
            background: "linear-gradient(135deg, rgba(7, 15, 30, 0.96), rgba(11, 24, 44, 0.92))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            borderBottom: "1px solid rgba(var(--fx-accent-rgb), 0.35)",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--fx-font-display)",
              fontWeight: "700",
              color: "var(--fx-accent)",
              fontSize: "20px",
            }}
          >
            AlgoM3
          </h1>
          <span style={{ fontSize: "12px", color: "var(--fx-muted-2)", fontWeight: "700", letterSpacing: "0.14em" }}>
            {role.toUpperCase()} PANEL
          </span>
        </div>

        {/* Dynamic page content */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}
