import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layout
import DashboardLayout from "../Layouts/DashboardLayout";

// Public
import Landing from "../pages/Landing";
import ReferralSignup from "../pages/public/ReferralSignup";

// Investor pages
import InvestorHome from "../pages/investor/InvestorHome";
import Deposit from "../pages/shared/Deposit";
import Withdrawal from "../pages/shared/Withdrawal";
import Wallet from "../pages/shared/Wallet";
import TransactionHistory from "../pages/shared/TransactionHistory";

// Associate pages
import Commissions from "../pages/associate/Commissions";
import AssociateHome from "../pages/associate/AssociateHome";

// Admin pages
import Users from "../pages/admin/Users";
import ROIConfig from "../pages/admin/ROIConfig";
import CommissionConfig from "../pages/admin/CommissionConfig";
import WithdrawApprovals from "../pages/admin/WithdrawApprovals";
import Transactions from "../pages/admin/Transactions";
import AdminROICredit from "./pages/admin/AdminROICredit";

// --- Role Guards ---
function RequireAssociate({ children }) {
  const role = localStorage.getItem("role");
  if (role !== "associate") {
    return <Navigate to="/investor" replace />;
  }
  return children;
}

function RequireAdmin({ children }) {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    return <Navigate to="/investor" replace />;
  }
  return children;
}

// --- Routes ---
export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* 🌍 Public Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/referral-signup" element={<ReferralSignup />} />

        {/* 👤 Investor Dashboard */}
        <Route path="/investor/*" element={<DashboardLayout role="investor" />}>
          <Route index element={<InvestorHome />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="withdrawal" element={<Withdrawal />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="history" element={<TransactionHistory />} />
        </Route>

        {/* 🤝 Associate Dashboard */}
        <Route
          path="/associate/*"
          element={
            <RequireAssociate>
              <DashboardLayout role="associate" />
            </RequireAssociate>
          }
        >
          <Route index element={<AssociateHome />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="withdrawal" element={<Withdrawal />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="history" element={<TransactionHistory />} />
        </Route>

        {/* 🛠 Admin Dashboard */}
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <DashboardLayout role="admin" />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<Users />} />
          <Route path="roi" element={<ROIConfig />} />
          <Route path="commission" element={<CommissionConfig />} />
          <Route path="approvals" element={<WithdrawApprovals />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="/admin/roi-credit" element={<AdminROICredit />} />
        </Route>

        {/* 🚨 Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/investor" replace />} />
      </Routes>
    </Router>
  );
}
