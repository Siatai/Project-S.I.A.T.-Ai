import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API = "https://project-s-i-a-t-ai.onrender.com";

  // 🔹 Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/");
  };

  // 🔹 Fetch user info once
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

        setUser(res.data);

        // Save role in localStorage for quick access
        let role = "investor";
        if (res.data.is_admin) role = "admin";
        else if (res.data.is_associate) role = "associate";
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

  // 🔹 Handle role-based redirects only when user changes
  useEffect(() => {
    if (!user) return;

    let role = "investor";
    if (user.is_admin) role = "admin";
    else if (user.is_associate) role = "associate";

    const roleBasePaths = {
      investor: "/investor",
      associate: "/associate",
      admin: "/admin",
    };

    if (!location.pathname.startsWith(roleBasePaths[role])) {
      navigate(roleBasePaths[role], { replace: true });
    }
  }, [user, location.pathname, navigate]);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#111827",
          color: "#E5E7EB",
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  if (!user) return null;

  // 🔹 Determine role from DB flags
  let role = "investor";
  if (user.is_admin) role = "admin";
  else if (user.is_associate) role = "associate";

  // 🔹 Sidebar menu items
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
      {
        key: "commissions",
        label: "Referrals & Commissions",
        path: "/associate/commissions",
      },
    ],
    admin: [
      { key: "dashboard", label: "Dashboard", path: "/admin" },
      { key: "users", label: "Users", path: "/admin/users" },
      { key: "roi", label: "ROI Config", path: "/admin/roi" },
      {
        key: "commission",
        label: "Commission Config",
        path: "/admin/commission",
      },
      {
        key: "approvals",
        label: "Withdrawal Approvals",
        path: "/admin/approvals",
      },
      { key: "transactions", label: "Transactions", path: "/admin/transactions" },
    ],
  };

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#0B1220", color: "#E5E7EB" }}
    >
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
            <div key={item.key} style={{ margin: "6px 0" }}>
              <Link
                to={item.path}
                style={{
                  display: "block",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: location.pathname === item.path ? "#3B82F6" : "#E5E7EB",
                  backgroundColor:
                    location.pathname === item.path ? "#1E293B" : "transparent",
                  fontWeight: location.pathname === item.path ? "600" : "400",
                }}
              >
                {item.label}
              </Link>
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
            backgroundColor: "#EF4444",
            textAlign: "center",
            fontWeight: "600",
            color: "#fff",
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
            Balance: ${user.wallet_balance ? user.wallet_balance.toLocaleString() : "0"}
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

        {/* Dynamic Content */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
