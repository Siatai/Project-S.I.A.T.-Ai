import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layout
import DashboardLayout from "../Layouts/DashboardLayout";

// Public
import Landing from "../pages/Landing";
import ReferralSignup from "../pages/public/ReferralSignup";

// Investor pages
import InvestorHome from "../pages/investor/InvestorHome";
import Withdrawal from "../pages/shared/Withdrawal";
import TransactionHistory from "../pages/shared/TransactionHistory";
import WalletPage from "../pages/investor/WalletPage"; // ✅ Combined Wallet + Deposit
import InvestorEarn from "../pages/investor/InvestorEarn"; // ✅ Make sure file exists: InvestorEarn.jsx or InvestorEarn.js

// Associate pages
import Referrals from "../pages/associate/Referrals"; 
import AssociateHome from "../pages/associate/AssociateHome";
import AssociateWalletPage from "../pages/associate/AssociateWalletPage"; 
import AssociateHistory from "../pages/associate/AssociateHistory";
import AssociateWithdrawal from "../pages/associate/AssociateWithdrawal";

// Admin pages
import Users from "../pages/admin/Users";
import ROIConfig from "../pages/admin/ROIConfig";
import CommissionConfig from "../pages/admin/CommissionConfig";
import WithdrawApprovals from "../pages/admin/WithdrawApprovals";
import Transactions from "../pages/admin/Transactions";
import AdminROICredit from "../pages/admin/AdminROICredit";
import AdminFinancialSummary from "../pages/admin/AdminFinancialSummary";

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
          <Route path="wallet" element={<WalletPage />} />
          <Route path="withdrawal" element={<Withdrawal />} />
          <Route path="history" element={<TransactionHistory />} />
          <Route path="earn" element={<InvestorEarn />} /> {/* ✅ New route */}
          <Route path="*" element={<Navigate to="/investor" replace />} />
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
          <Route path="wallet" element={<AssociateWalletPage />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="withdrawal" element={<AssociateWithdrawal />} />
          <Route path="history" element={<AssociateHistory />} />
          <Route path="*" element={<Navigate to="/associate" replace />} />
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
          <Route path="roi-config" element={<ROIConfig />} />
          <Route path="commission-config" element={<CommissionConfig />} />
          <Route path="roi-credit" element={<AdminROICredit />} />
          <Route path="financial-summary" element={<AdminFinancialSummary />} />
          <Route path="approvals" element={<WithdrawApprovals />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* 🚨 Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/investor" replace />} />
      </Routes>
    </Router>
  );
}
