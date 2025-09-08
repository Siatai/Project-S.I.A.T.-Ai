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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/");
  };

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

  if (loading) {
    return <div className="loading-screen">Loading dashboard...</div>;
  }

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
          {/* 🔹 Close button visible only on mobile */}
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

          <div className="logout-btn" onClick={handleLogout}>
            Logout
          </div>
        </aside>
      )}

      {/* Main Section */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <h1 className="brand">AlgoM³</h1>
          <span className="panel">{role} Panel</span>
          {isMobile && (
            <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
          )}
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>

      {/* Styles */}
      <style>{`
        /* --- inside <style> --- */
.dashboard-root {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  font-family: Inter, Arial, sans-serif;
  color: #E5E7EB;
  background: #0B1220;
}

/* Sidebar stays fixed height */
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
  overflow: hidden; /* lock sidebar scroll */
}

/* Main layout = header fixed + scrollable body */
.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.dashboard-header {
  flex-shrink: 0;
  height: 60px;
  background: rgba(18,26,43,0.95);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid rgba(23,232,166,0.2);
}

/* 🔹 Only this part scrolls */
.dashboard-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* smooth iOS scrolling */
  background: linear-gradient(135deg,#0B1220,#0F2F2D,#000);
  padding: 20px;
}

      `}</style>
    </div>
  );
}
