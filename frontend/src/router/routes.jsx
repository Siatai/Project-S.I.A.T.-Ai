import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layout (only for Admin now)
import DashboardLayout from "../Layouts/DashboardLayout";

// Public
import Landing from "../pages/Landing";
import ReferralSignup from "../pages/public/ReferralSignup";

// Investor pages
import InvestorHome from "../pages/investor/InvestorHome";
import Withdrawal from "../pages/shared/Withdrawal";
import TransactionHistory from "../pages/shared/TransactionHistory";
import WalletPage from "../pages/investor/WalletPage"; 
import InvestorEarn from "../pages/investor/InvestorEarn"; 

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

        {/* 👤 Investor Pages (no DashboardLayout) */}
        <Route path="/investor" element={<InvestorHome />} />
        <Route path="/investor/wallet" element={<WalletPage />} />
        <Route path="/investor/withdrawal" element={<Withdrawal />} />
        <Route path="/investor/history" element={<TransactionHistory />} />
        <Route path="/investor/earn" element={<InvestorEarn />} />
        <Route path="/investor/*" element={<Navigate to="/investor" replace />} />

        {/* 🤝 Associate Pages (no DashboardLayout) */}
        <Route
          path="/associate"
          element={
            <RequireAssociate>
              <AssociateHome />
            </RequireAssociate>
          }
        />
        <Route
          path="/associate/wallet"
          element={
            <RequireAssociate>
              <AssociateWalletPage />
            </RequireAssociate>
          }
        />
        <Route
          path="/associate/referrals"
          element={
            <RequireAssociate>
              <Referrals />
            </RequireAssociate>
          }
        />
        <Route
          path="/associate/withdrawal"
          element={
            <RequireAssociate>
              <AssociateWithdrawal />
            </RequireAssociate>
          }
        />
        <Route
          path="/associate/history"
          element={
            <RequireAssociate>
              <AssociateHistory />
            </RequireAssociate>
          }
        />
        <Route
          path="/associate/*"
          element={<Navigate to="/associate" replace />}
        />

        {/* 🛠 Admin Dashboard (keeps DashboardLayout) */}
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
