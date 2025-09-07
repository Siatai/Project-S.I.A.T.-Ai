import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// role can be: "investor", "associate", "admin"
export default function SidebarLayout({
  role = "investor",
  user = { email: "user@email.com", wallet_balance: 10000, name: "User" },
  children,
}) {
  const [active, setActive] = useState("dashboard");
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
      { key: "account", label: "My Account", path: "/associate/account" },
      { key: "deposit", label: "Deposit", path: "/associate/deposit" },
      { key: "withdrawal", label: "Withdrawal", path: "/associate/withdrawal" },
      { key: "history", label: "Transaction History", path: "/associate/history" },
      { key: "wallet", label: "Crypto Wallet", path: "/associate/wallet" },
      { key: "commissions", label: "Referrals & Deposits", path: "/associate/deposits" },
      { key: "analytics", label: "Analytics", path: "/associate/analytics" },
    ],
    admin: [
      { key: "dashboard", label: "Dashboard", path: "/admin" },
      { key: "users", label: "Users", path: "/admin/users" },
      { key: "roi-config", label: "ROI Config", path: "/admin/roi-config" },
      { key: "commission-config", label: "Commission Config", path: "/admin/commission-config" },
      { key: "roi-credit", label: "ROI & Commission Credit", path: "/admin/roi-credit" }, // ✅ new
      { key: "financial-summary", label: "Financial Summary", path: "/admin/financial-summary" }, // ✅ new
      { key: "approvals", label: "Withdrawal Approvals", path: "/admin/approvals" },
      { key: "transactions", label: "Transactions", path: "/admin/transactions" },
      { key: "analytics", label: "Analytics", path: "/admin/analytics" },
    ],
  };

  // 🔹 Handle navigation
  const handleNav = (item) => {
    setActive(item.key);
    navigate(item.path);
  };

  // 🔹 Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#0B1220", color: "#E5E7EB" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "240px",
          backgroundColor: "#121A2B",
          padding: "20px 10px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2
            style={{
              color: "#3B82F6",
              fontSize: "20px",
              textAlign: "center",
              marginBottom: "30px",
              textTransform: "uppercase",
            }}
          >
            {role} Panel
          </h2>

          {sidebarItems[role].map((item) => (
            <div
              key={item.key}
              onClick={() => handleNav(item)}
              style={{
                padding: "12px 15px",
                margin: "6px 0",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: active === item.key ? "#1E293B" : "transparent",
                color: active === item.key ? "#3B82F6" : "#E5E7EB",
                fontWeight: active === item.key ? "600" : "400",
                transition: "all 0.2s ease-in-out",
              }}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div
          onClick={handleLogout}
          style={{
            padding: "12px 15px",
            margin: "6px 0",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: "#1E293B",
            textAlign: "center",
            color: "#F87171",
            fontWeight: "600",
          }}
        >
          Logout
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <div
          style={{
            height: "60px",
            backgroundColor: "#121A2B",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            borderBottom: "1px solid #1E293B",
          }}
        >
          <div style={{ fontSize: "16px" }}>
            Balance: ${user.wallet_balance?.toLocaleString() || 0}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span>{user.email}</span>
            <div
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                backgroundColor: "#3B82F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </div>

        {/* Dynamic page content */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}
