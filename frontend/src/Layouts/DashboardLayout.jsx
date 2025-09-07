import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const API = "https://project-s-i-a-t-ai.onrender.com";

  // 🔹 Detect mobile/desktop resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔹 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/");
  };

  // 🔹 Fetch user and wallet balance
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUser(null);
          navigate("/");
          return;
        }

        // 1. Get user info
        const res = await axios.get(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let userData = res.data;

        // 2. Get wallet balance separately
        try {
          const summaryRes = await axios.get(`${API}/wallet/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          userData.withdrawable_balance = summaryRes.data.wallet_balance || 0;
        } catch (e) {
          console.warn("⚠️ Wallet summary fetch failed:", e);
          userData.withdrawable_balance = 0;
        }

        setUser(userData);

        // 3. Save role
        let role = "investor";
        if (userData.is_admin) role = "admin";
        else if (userData.is_associate) role = "associate";
        localStorage.setItem("role", role);
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg,#0B1220,#0F2F2D,#000)",
          color: "#17E8E5",
          fontFamily: "Orbitron, Arial, sans-serif",
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  if (!user) return null;

  let role = "Investor";
  if (user.is_admin) role = "Admin";
  else if (user.is_associate) role = "Associate";

  // 🔹 Sidebar Items
  const sidebarItems = {
    investor: [
      { key: "home", label: "Home", path: "/investor" },
      { key: "deposit", label: "Deposit", path: "/investor/deposit" },
      { key: "withdrawal", label: "Withdrawal", path: "/investor/withdrawal" },
      { key: "wallet", label: "Wallet", path: "/investor/wallet" },
      { key: "transactions", label: "Transactions", path: "/investor/history" },
    ],
    associate: [
      { key: "home", label: "Home", path: "/associate" },
      { key: "deposit", label: "Deposit", path: "/associate/deposit" },
      { key: "withdrawal", label: "Withdrawal", path: "/associate/withdrawal" },
      { key: "wallet", label: "Wallet", path: "/associate/wallet" },
      { key: "transactions", label: "Transactions", path: "/associate/history" },
      { key: "commissions", label: "Referrals & Deposits", path: "/associate/commissions" },
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
    ],
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "linear-gradient(135deg,#0B1220,#0F2F2D,#000)",
        color: "#E5E7EB",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      {/* Sidebar */}
      {(sidebarOpen || !isMobile) && (
        <div
          style={{
            width: "250px",
            background: "rgba(17, 24, 39, 0.9)",
            backdropFilter: "blur(10px)",
            padding: "25px 15px",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid rgba(23,232,166,0.2)",
            position: isMobile ? "absolute" : "relative",
            height: "100%",
            zIndex: 1000,
            boxShadow: "0 0 20px rgba(23,232,229,0.15)",
          }}
        >
          <div style={{ flex: 1 }}>
            {/* User Info */}
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#E5E7EB",
                marginBottom: "6px",
                textAlign: "center",
              }}
            >
              {user.name || "User"}
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#17E8E5",
                fontWeight: "600",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              Balance: ${user.withdrawable_balance?.toLocaleString() || "0"}
            </p>

            {/* Sidebar Menu */}
            {sidebarItems[role.toLowerCase()].map((item) => {
              const active = location.pathname === item.path;
              return (
                <div key={item.key} style={{ margin: "6px 0" }}>
                  <Link
                    to={item.path}
                    style={{
                      display: "block",
                      padding: "12px 15px",
                      borderRadius: "10px",
                      textDecoration: "none",
                      color: active ? "#0B1220" : "#E5E7EB",
                      background: active
                        ? "linear-gradient(135deg,#17E8E5,#14B8A6)"
                        : "transparent",
                      fontWeight: active ? "600" : "400",
                      boxShadow: active
                        ? "0 0 12px rgba(23,232,166,0.5)"
                        : "none",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Logout */}
          <div
            onClick={handleLogout}
            style={{
              padding: "12px 15px",
              margin: "20px 0 40px 0",
              borderRadius: "10px",
              cursor: "pointer",
              background: "rgba(255,255,255,0.08)",
              textAlign: "center",
              fontWeight: "600",
              color: "#E5E7EB",
              transition: "all 0.3s ease",
            }}
          >
            Logout
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <div
          style={{
            height: "60px",
            background: "rgba(18,26,43,0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            borderBottom: "1px solid rgba(23,232,166,0.2)",
          }}
        >
          <h1
            style={{
              fontFamily: "Orbitron, sans-serif",
              fontWeight: "700",
              color: "#17E8E5",
              fontSize: "20px",
            }}
          >
            AlgoM³
          </h1>
          <span style={{ fontSize: "14px", color: "#94A3B8", fontWeight: "600" }}>
            {role} Panel
          </span>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "transparent",
                border: "none",
                color: "#17E8E5",
                fontSize: "22px",
                cursor: "pointer",
              }}
            >
              ☰
            </button>
          )}
        </div>

        {/* Dynamic Content */}
        <div className="dashboard-content" style={{ flex: 1, padding: "20px" }}>
          <Outlet />
        </div>
      </div>

      {/* Global Fix */}
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          background: linear-gradient(135deg,#0B1220,#0F2F2D,#000);
          overflow: hidden;
        }
        .dashboard-content {
          overflow-y: auto;
          height: 100%;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
}
