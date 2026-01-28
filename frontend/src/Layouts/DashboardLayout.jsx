import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { formatAmount } from "../utils/format";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const API = "https://project-s-i-a-t-ai.onrender.com";

  // Detect mobile resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/");
  };

  // Fetch user + wallet balance
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

  if (loading)
    return (
      <div className="loading-screen">
        <div className="loading-pulse" />
        <span>Loading dashboard...</span>
      </div>
    );
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
              X
            </button>
          )}

          <div style={{ flex: 1 }}>
            <h2 className="user-name">{user.name || "User"}</h2>
            <p className="user-balance">
              Balance: ${formatAmount(user.withdrawable_balance)}
            </p>

            {/* Divider line */}
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

          {/* Raise a Request button */}
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
          <div className="header-left" />
          {/* Center: Branding */}
          <div className="header-center">
            <h1
              className="brand"
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: "bold",
                color: "var(--fx-accent-legacy)",
                textShadow: "0 0 12px rgba(var(--fx-accent-legacy-rgb), 0.6)",
              }}
            >
              <span className="algom3-pulse">AlgoM3</span>
            </h1>
          </div>

          {/* Right: Panel + Menu */}
          <div className="header-right">
            <span className="panel">{role} Panel</span>
            {isMobile && (
              <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                Menu
              </button>
            )}
          </div>
        </header>

        <main className="dashboard-content">
          <div className="hud-shell">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Styles */}
      <style>{`
        .dashboard-root {
          display: flex;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          font-family: var(--fx-font-body);
          color: var(--fx-ink);
          background: var(--fx-hero);
        }

        .loading-screen {
          height: 100vh;
          display: grid;
          place-items: center;
          color: var(--fx-muted);
          background: var(--fx-hero);
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          gap: 12px;
        }

        .loading-pulse {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 1px solid rgba(var(--fx-accent-rgb), 0.4);
          box-shadow: 0 0 24px rgba(var(--fx-accent-rgb), 0.25);
          position: relative;
          animation: loadingPulse 2.4s ease-in-out infinite;
        }

        .loading-pulse::after {
          content: '';
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          border: 1px dashed rgba(var(--fx-accent-rgb), 0.5);
          animation: loadingSpin 4s linear infinite;
        }

        .dashboard-sidebar {
          width: 250px;
          background: linear-gradient(145deg, rgba(6, 14, 30, 0.98), rgba(10, 22, 42, 0.96));
          backdrop-filter: blur(12px);
          padding: 25px 15px;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(var(--fx-accent-rgb), 0.35);
          box-shadow: 0 0 24px rgba(var(--fx-accent-rgb), 0.16);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .dashboard-sidebar::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(180deg, rgba(var(--fx-accent-rgb), 0.08), transparent 40%),
            repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.03) 0 1px, transparent 1px 22px);
          opacity: 0.6;
        }

        .close-sidebar {
          position: absolute;
          top: 10px;
          right: 10px;
          background: transparent;
          border: none;
          font-size: 22px;
          color: var(--fx-accent);
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
          color: var(--fx-accent);
          text-align: center;
          margin-bottom: 15px;
          font-weight: 600;
        }

        /* Divider line */
        .glow-divider {
          height: 2px;
          border-radius: 2px;
          margin: 15px 0;
          background: linear-gradient(90deg, transparent, var(--fx-accent), transparent);
          box-shadow: var(--fx-glow);
        }

        .sidebar-link {
          display: block;
          padding: 12px 15px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--fx-ink);
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }
        .sidebar-link.active {
          background: rgba(var(--fx-accent-rgb), 0.18);
          color: var(--fx-accent);
          font-weight: 700;
          border-color: rgba(var(--fx-accent-rgb), 0.6);
          box-shadow: 0 0 18px rgba(var(--fx-accent-rgb), 0.25);
        }

        /* Raise a Request button */
        .request-btn {
          display: block;
          padding: 12px 15px;
          margin: 15px 0;
          border-radius: 6px;
          cursor: pointer;
          text-align: center;
          font-weight: 700;
          text-decoration: none;
          color: #05101b;
          background: linear-gradient(135deg, rgba(var(--fx-accent-rgb), 0.92), rgba(var(--fx-accent-rgb), 0.65));
          border: 1px solid rgba(var(--fx-accent-rgb), 0.6);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          box-shadow: 0 0 18px rgba(var(--fx-accent-rgb), 0.3);
        }

        .logout-btn {
          padding: 12px 15px;
          margin: 10px 0 40px;
          border-radius: 6px;
          cursor: pointer;
          background: rgba(7, 18, 34, 0.7);
          border: 1px solid rgba(var(--fx-accent-rgb), 0.3);
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
          height: 56px;
          background: linear-gradient(135deg, rgba(7, 15, 30, 0.96), rgba(11, 24, 44, 0.92));
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 15px;
          border-bottom: 1px solid rgba(var(--fx-accent-rgb), 0.35);
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
          font-family: var(--fx-brand-font);
          letter-spacing: 0.03em;
        }
        .panel {
          font-size: 12px;
          color: var(--fx-muted-2);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          white-space: nowrap;
        }
        .menu-btn {
          background: transparent;
          border: none;
          color: var(--fx-accent);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .dashboard-content {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          background: var(--fx-hero);
          padding: 24px;
          padding-bottom: 120px;
        }

        .hud-shell {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background: var(--fx-bg);
        }

        @keyframes loadingPulse {
          0% { transform: scale(0.96); opacity: 0.5; }
          50% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(0.96); opacity: 0.5; }
        }

        @keyframes loadingSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
