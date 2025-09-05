import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// role can be: "investor", "associate", "admin"
export default function SidebarLayout({
  role = "investor",
  user = { email: "user@email.com", balance: 10000, name: "User" },
  children,
}) {
  const [active, setActive] = useState("dashboard");
  const navigate = useNavigate();

  // Sidebar items by role
  const sidebarItems = {
    investor: [
      { key: "account", label: "My Account" },
      { key: "deposit", label: "Deposit" },
      { key: "withdrawal", label: "Withdrawal" },
      { key: "history", label: "Transaction History" },
      { key: "wallet", label: "Crypto Wallet" },
      { key: "analytics", label: "Analytics" },
    ],
    associate: [
      { key: "account", label: "My Account" },
      { key: "deposit", label: "Deposit" },
      { key: "withdrawal", label: "Withdrawal" },
      { key: "history", label: "Transaction History" },
      { key: "wallet", label: "Crypto Wallet" },
      { key: "commissions", label: "Referrals & Commissions" },
      { key: "analytics", label: "Analytics" },
    ],
    admin: [
      { key: "dashboard", label: "Dashboard" },
      { key: "users", label: "Users" },
      { key: "roi", label: "ROI Config" },
      { key: "commission", label: "Commission Config" },
      { key: "approvals", label: "Withdrawal Approvals" },
      { key: "transactions", label: "Transactions" },
      { key: "analytics", label: "Analytics" },
    ],
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
              onClick={() => setActive(item.key)}
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
          <div style={{ fontSize: "16px" }}>Balance: ${user.balance.toLocaleString()}</div>
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
