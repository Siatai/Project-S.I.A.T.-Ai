import React from "react";

export default function TermsModal({ open, onClose }) {
  if (!open) return null; // don't render if closed

  return (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <h2 style={{ marginTop: 0, color: "#17E8E5" }}>Terms & Conditions</h2>
        <div style={modalContent}>
          <p>
            These Terms and Conditions (“Terms”) govern the use of AlgoMcube’s
            services. AlgoMcube acts solely as a{" "}
            <strong>facilitator of trade</strong> and is not a broker, exchange,
            or financial advisor. By creating an account, making a deposit, or
            engaging in trading activities, you confirm that you have read and
            agree to these Terms in full.
          </p>

          <hr />
          <h3>1. Account Registration and Verification</h3>
          <p>
            1.1 <strong>Single Account Rule:</strong> Each user may only
            register one account. Multiple accounts linked to the same person
            may be suspended or terminated.
          </p>
          <p>
            1.2 <strong>Accurate Information:</strong> You agree to provide
            truthful and accurate information during signup and KYC.
          </p>
          <p>
            1.3 <strong>Wallet Binding:</strong> The first deposit wallet is
            permanently linked to your account. All future withdrawals will be
            sent only to this registered wallet. Wallet changes are not
            permitted except under strict verification and AlgoMcube approval.
          </p>

          <hr />
          <h3>2. Minimum Deposit and Withdrawal</h3>
          <p>
            2.1 <strong>Minimum Deposit:</strong> $100
          </p>
          <p>
            2.2 <strong>Minimum Withdrawal:</strong> $20
          </p>
          <p>
            2.3 Withdrawals are processed in USDT (TRC20). You must ensure your
            receiving wallet supports TRC20.
          </p>

          <hr />
          <h3>3. Deposits and Fund Management</h3>
          <p>
            3.1 All deposits must originate from your registered wallet address.
          </p>
          <p>
            3.2 Deposits made from third-party wallets may be rejected, and
            associated fees will be deducted.
          </p>
          <p>
            3.3 Funds deposited are allocated towards live forex trading
            strategies using AlgoMcube’s proprietary systems and external
            partners.
          </p>
          <p>
            3.4 AlgoMcube does not guarantee continuous availability of trading
            services and reserves the right to pause or adjust operations.
          </p>

          <hr />
          <h3>4. Withdrawal Policy</h3>
          <ul>
            <li>
              4.1 Withdrawals are permitted only on <strong>Saturdays</strong>{" "}
              and <strong>Sundays</strong>.
            </li>
            <li>
              4.2 Requests for capital withdrawal must be submitted with{" "}
              <strong>two weeks’ advance notice</strong>.
            </li>
            <li>
              4.3 Withdrawal fees apply, covering commissions, spread charges,
              and blockchain network costs.
            </li>
            <li>
              4.4 AlgoMcube reserves the right to delay withdrawals due to
              market volatility, liquidity constraints, or force majeure.
            </li>
          </ul>

          <hr />
          <h3>5. Capital Locking Period</h3>
          <p>
            5.1 Your capital is locked for a minimum period of{" "}
            <strong>120 days</strong>.
          </p>
          <p>
            5.2 Early withdrawal before the completion of the lock period will
            incur a <strong>30% penalty</strong> on the requested amount.
          </p>
          <p>
            5.3 This penalty is deducted prior to disbursement.
          </p>

          <hr />
          <h3>6. Return on Investment (ROI)</h3>
          <p>
            6.1 Target ROI: <strong>8-10% monthly</strong>. This is an expected
            performance range and <strong>not guaranteed</strong>.
          </p>
          <p>
            6.2 ROI depends on real-time forex market conditions, which may
            fluctuate beyond AlgoMcube’s control.
          </p>
          <p>
            6.3 ROI payouts will continue only until you have cumulatively
            withdrawn <strong>2× (200%) of your original investment</strong>. At
            that point, ROI payouts stop, and only your remaining capital (if
            eligible) is withdrawable.
          </p>
          <p>
            6.4 ROI will be calculated daily but credited on a weekly/monthly
            cycle, as specified in your account dashboard.
          </p>

          <hr />
          <h3>7. Referral Program</h3>
          <p>
            7.1 Referrals may earn a percentage of the deposits made by direct
            referrals, as published in AlgoMcube’s referral plan.
          </p>
          <p>
            7.2 Referral rewards are subject to change and may be capped.
          </p>
          <p>
            7.3 Abusive or fake referrals will result in immediate account
            suspension.
          </p>

          <hr />
          <h3>8. User Responsibilities</h3>
          <p>
            8.1 You agree not to misuse the platform for money laundering, fraud
            or illegal activities.
          </p>
          <p>
            8.2 You are solely responsible for securing your account
            credentials.
          </p>
          <p>
            8.3 AlgoMcube is not responsible for lost, stolen, or compromised
            accounts.
          </p>

          <hr />
          <h3>9. Platform Operations</h3>
          <p>
            9.1 AlgoMcube may conduct system maintenance, upgrades, or
            improvements, during which services may be temporarily unavailable.
          </p>
          <p>
            9.2 The platform reserves the right to alter strategies, fees, and
            ROI schedules without prior notice, while updating terms
            accordingly.
          </p>

          <hr />
          <h3>10. Risk Disclaimer</h3>
          <p>
            10.1 Forex trading is highly volatile and involves significant
            financial risk.
          </p>
          <p>
            10.2 You may lose part or all of your invested capital.
          </p>
          <p>
            10.3 AlgoMcube shall not be liable for direct, indirect,
            consequential, or incidental damages including lost opportunities.
          </p>
          <p>
            10.4 By using AlgoMcube, you acknowledge and accept all associated
            risks.
          </p>

          <hr />
          <h3>11. Governing Law</h3>
          <p>
            11.1 These Terms shall be governed by and construed in accordance
            with the applicable laws of the jurisdiction of incorporation.
          </p>
          <p>
            11.2 Any disputes shall be subject to arbitration or courts
            designated by AlgoMcube.
          </p>

          <hr />
          <h3>12. Amendments</h3>
          <p>
            12.1 AlgoMcube reserves the right to modify these Terms at any time.
          </p>
          <p>
            12.2 Updates will be effective once posted on the platform.
          </p>
          <p>
            12.3 Continued use of the platform implies acceptance of amended
            Terms.
          </p>
        </div>

        <button style={buttonStyleTeal} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

/* === Styles === */
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalBox = {
  background: "#1E293B",
  padding: "20px",
  borderRadius: "12px",
  maxWidth: "650px",
  width: "90%",
  color: "#E5E7EB",
  boxShadow: "0 0 20px rgba(23,232,229,0.4)",
};

const modalContent = {
  maxHeight: "400px",
  overflowY: "auto",
  marginBottom: "15px",
  fontSize: "14px",
  lineHeight: "1.6",
};

const buttonStyleTeal = {
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "#17E8E5",
  color: "#0B1220",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.3s ease",
};
