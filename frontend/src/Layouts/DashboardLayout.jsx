import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import logo from "../Components/logo.png"; // ✅ your logo

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const API = "https://project-s-i-a-t-ai.onrender.com";

  // 🔹 Detect mobile resize
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

  // 🔹 Fetch user + wallet balance
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUser(null);
          navigate("/");
          return;
        }

        const res = await axios.get(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let userData = res.data;

        try {
          const summaryRes = await axios.get(`${API}/wallet/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          userData.withdrawable_balance = summaryRes.data.wallet_balance || 0;
        } catch {
          userData.withdrawable_balance = 0;
        }

        setUser(userData);

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

  if (loading) return <div className="loading-screen">Loading dashboard...</div>;
  if (!user) return null;

  let role = "Investor";
  if (user.is_admin) role = "Admin";
  else if (user.is_associate) role = "Associate";

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
    <div className="dashboard-root">
      {/* Sidebar */}
      {(sidebarOpen || !isMobile) && (
        <aside className="dashboard-sidebar">
          {isMobile && (
            <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
              ✖
            </button>
          )}

          <div style={{ flex: 1 }}>
            <h2 className="user-name">{user.name || "User"}</h2>
            <p className="user-balance">
              Balance: ${user.withdrawable_balance?.toLocaleString() || "0"}
            </p>

            {/* ✅ Glowy divider line */}
            <div className="glow-divider"></div>

            {sidebarItems[role.toLowerCase()].map((item) => {
              const active = location.pathname === item.path;
              return (
                <div key={item.key} style={{ margin: "6px 0" }}>
                  <Link
                    to={item.path}
                    className={`sidebar-link ${active ? "active" : ""}`}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* ✅ Raise a Request button */}
          <a
            href="mailto:support@algomcube.com"
            className="request-btn"
          >
            Raise a Request
          </a>

          <div className="logout-btn" onClick={handleLogout}>
            Logout
          </div>
        </aside>
      )}

      {/* Main Section */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          {/* Left: Logo */}
          <div className="header-left">
            <img
              src={logo}
              alt="AlgoM³ Logo"
              style={{
                height: "36px",
                width: "36px",
                borderRadius: "8px",
                border: "2px solid #17E8E5",
                background: "#0B1220",
                padding: "3px",
                boxShadow: "0 0 8px rgba(23,232,229,0.6)",
              }}
            />
          </div>

          {/* Center: Branding */}
          <div className="header-center">
            <h1
              className="brand"
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: "bold",
                color: "#17E8E5",
                textShadow: "0 0 10px #17E8E5, 0 0 20px #0B1220",
              }}
            >
              AlgoM³ Ai
            </h1>
          </div>

          {/* Right: Panel + Menu */}
          <div className="header-right">
            <span className="panel">{role} Panel</span>
            {isMobile && (
              <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                ☰
              </button>
            )}
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>

      {/* Styles */}
      <style>{`
        .dashboard-root {
          display: flex;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          font-family: Inter, Arial, sans-serif;
          color: #E5E7EB;
          background: #0B1220;
        }

        .dashboard-sidebar {
          width: 250px;
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(10px);
          padding: 25px 15px;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(23,232,166,0.2);
          box-shadow: 0 0 20px rgba(23,232,229,0.15);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .close-sidebar {
          position: absolute;
          top: 10px;
          right: 10px;
          background: transparent;
          border: none;
          font-size: 22px;
          color: #17E8E5;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .close-sidebar:hover {
          transform: scale(1.2);
        }

        .user-name {
          font-size: 18px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 6px;
        }
        .user-balance {
          font-size: 14px;
          color: #17E8E5;
          text-align: center;
          margin-bottom: 15px;
          font-weight: 600;
        }

        /* ✅ Glowy divider line */
        .glow-divider {
          height: 2px;
          border-radius: 2px;
          margin: 15px 0;
          background: linear-gradient(90deg, transparent, #17E8E5, transparent);
          box-shadow: 0 0 12px #17E8E5;
        }

        .sidebar-link {
          display: block;
          padding: 12px 15px;
          border-radius: 10px;
          text-decoration: none;
          color: #E5E7EB;
          transition: all 0.3s ease;
        }
        .sidebar-link.active {
          background: linear-gradient(135deg,#17E8E5,#14B8A6);
          color: #0B1220;
          font-weight: 600;
          box-shadow: 0 0 12px rgba(23,232,166,0.5);
        }

        /* ✅ Raise a Request button */
        .request-btn {
          display: block;
          padding: 12px 15px;
          margin: 15px 0;
          border-radius: 10px;
          cursor: pointer;
          text-align: center;
          font-weight: 600;
          text-decoration: none;
          color: #0B1220;
          background: linear-gradient(135deg,#17E8E5,#14B8A6);
          box-shadow: 0 0 12px rgba(23,232,166,0.5);
        }

        .logout-btn {
          padding: 12px 15px;
          margin: 10px 0 40px;
          border-radius: 10px;
          cursor: pointer;
          background: rgba(255,255,255,0.08);
          text-align: center;
          font-weight: 600;
        }

        .dashboard-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .dashboard-header {
          height: 20px;
          background: rgba(18,26,43,0.95);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 15px;
          border-bottom: 1px solid rgba(23,232,166,0.2);
          flex-shrink: 0;
        }

        .header-left {
          flex: 0 0 auto;
        }
        .header-center {
          flex: 1;
          text-align: center;
        }
        .header-right {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand {
          font-family: Orbitron, sans-serif;
        }
        .panel {
          font-size: 14px;
          color: #94A3B8;
          font-weight: 600;
          white-space: nowrap;
        }
        .menu-btn {
          background: transparent;
          border: none;
          color: #17E8E5;
          font-size: 22px;
          cursor: pointer;
        }

        .dashboard-content {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          background: linear-gradient(135deg,#0B1220,#0F2F2D,#000);
          padding: 20px;
          padding-bottom: 100px;
        }

        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background: #000;
        }
      `}</style>
    </div>
  );
}
