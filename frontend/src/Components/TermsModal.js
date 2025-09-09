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
            agree to these Terms.
          </p>

          <hr />
          <h3>1. Account Registration and Verification</h3>
          <p>
            <strong>Single Account Rule:</strong> One account per person.
            Multiple accounts may be suspended.
          </p>
          <p>
            <strong>Wallet Binding:</strong> First deposit wallet is permanently
            linked. All withdrawals go to the same wallet.
          </p>

          <hr />
          <h3>2. Minimum Deposit and Withdrawal</h3>
          <p>
            Minimum Deposit: <strong>$100</strong>
          </p>
          <p>
            Minimum Withdrawal: <strong>$20</strong>
          </p>

          <hr />
          <h3>3. Deposits and Fund Management</h3>
          <p>
            Deposits must be from your registered wallet. Third-party deposits
            may be rejected with fees.
          </p>
          <p>
            Deposits are allocated towards live forex trading with AlgoMcube’s
            systems and partners.
          </p>

          <hr />
          <h3>4. Withdrawal Policy</h3>
          <ul>
            <li>Withdrawals only on <strong>Saturdays & Sundays</strong>.</li>
            <li>2-week advance notice required for capital withdrawals.</li>
            <li>Withdrawal fees apply (commissions, spreads, network costs).</li>
          </ul>

          <hr />
          <h3>5. Capital Locking Period</h3>
          <p>
            Capital is locked for <strong>120 days</strong>. Early withdrawal
            before lock period incurs a <strong>30% penalty</strong>.
          </p>

          <hr />
          <h3>6. Return on Investment (RoI)</h3>
          <p>
            Target ROI: <strong>8-10% monthly</strong> (not guaranteed).
            Performance may vary with market conditions.
          </p>

          <hr />
          <h3>7. Risk Disclaimer</h3>
          <p>
            Forex trading is highly volatile and risky. You may lose part or all
            of your capital. AlgoMcube shall not be liable for financial losses,
            lost opportunities, or indirect damages.
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
