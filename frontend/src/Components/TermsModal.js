import React from "react";

export default function TermsModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <h2 style={headingMain}>Terms & Conditions</h2>

        {/* Window box inside modal */}
        <div style={windowBox}>
          <div style={modalContent}>
            <p>
              These Terms and Conditions (“Terms”) govern the use of AlgoMcube’s
              services. AlgoMcube acts solely as a{" "}
              <strong>facilitator of trade</strong> and is not a broker,
              exchange, or financial advisor. By creating an account, making a
              deposit, or engaging in trading activities, you confirm that you
              have read and agree to these Terms in full.
            </p>

      <hr />
          <h3 style={headingStyle}>1. Company Introduction</h3>
          <p>1.1 AlgoMcube is a digital platform dedicated to structured financial services in the forex domain.</p>
          <p>1.2 The company operates with transparency, efficiency, and innovation as its guiding principles.</p>
          <p>1.3 Our mission is to create sustainable opportunities for individuals to participate in forex-driven growth.</p>
          <p>1.4 We believe in structured systems where every participant follows a uniform set of rules.</p>
          <p>1.5 AlgoMcube does not function as a bank or brokerage but as a service provider offering managed solutions.</p>
          <p>1.6 The platform operates digitally and is accessible worldwide, subject to technological availability.</p>
          <p>1.7 All services are designed with a focus on simplicity and user empowerment.</p>
          <p>1.8 The purpose of these Terms is to outline how users interact with the platform.</p>
          <p>1.9 Users acknowledge that the company may evolve its structure over time.</p>
          <p>1.10 All participants are expected to act responsibly and in line with the values of AlgoMcube.</p>

          {/* SECTION 2 */}
          <hr />
          <h3 style={headingStyle}>2. Account Creation</h3>
          <p>2.1 Each participant must create a personal account using a valid email.</p>
          <p>2.2 Account details must be kept accurate and updated at all times.</p>
          <p>2.3 A single account per individual is allowed.</p>
          <p>2.4 Multiple accounts under one identity will result in account suspension.</p>
          <p>2.5 The account creation process requires agreeing to these Terms.</p>
          <p>2.6 AlgoMcube may request additional verification before account activation.</p>
          <p>2.7 Your account represents your relationship with AlgoMcube.</p>
          <p>2.8 The security of your account is your responsibility.</p>
          <p>2.9 Users must not share login credentials with others.</p>
          <p>2.10 All activities carried out through your account are your responsibility.</p>

          {/* SECTION 3 */}
          <hr />
          <h3 style={headingStyle}>3. Wallet Binding</h3>
          <p>3.1 At the time of your first deposit, the wallet address you use will be linked permanently to your account.</p>
          <p>3.2 All withdrawals will only be processed to the registered wallet.</p>
          <p>3.3 Wallet binding ensures consistency and prevents misuse.</p>
          <p>3.4 Users cannot change their wallet without company approval.</p>
          <p>3.5 Wallet changes are rare and subject to strong justification.</p>
          <p>3.6 Deposits from unregistered wallets may be rejected.</p>
          <p>3.7 AlgoMcube is not responsible for funds sent to incorrect wallets.</p>
          <p>3.8 The user bears full responsibility for ensuring wallet accuracy.</p>
          <p>3.9 Wallet binding is a one-time permanent feature.</p>
          <p>3.10 This policy is designed for transparency and operational security.</p>

          {/* SECTION 4 */}
          <hr />
          <h3 style={headingStyle}>4. Deposits</h3>
          <p>4.1 The minimum deposit amount is $100.</p>
          <p>4.2 Deposits must be made only through TRC20 (USDT).</p>
          <p>4.3 Deposits below the minimum will not activate investment packages.</p>
          <p>4.4 Users must verify the address before sending funds.</p>
          <p>4.5 AlgoMcube does not cover network transaction errors.</p>
          <p>4.6 Deposits are credited after network confirmations.</p>
          <p>4.7 Deposits serve as your entry into active participation.</p>
          <p>4.8 Funds are pooled for structured trading allocation.</p>
          <p>4.9 Every deposit is recorded against your account balance.</p>
          <p>4.10 Users acknowledge that deposits signify acceptance of these Terms.</p>

          {/* SECTION 5 */}
          <hr />
          <h3 style={headingStyle}>5. Withdrawals</h3>
          <p>5.1 The minimum withdrawal amount is $20.</p>
          <p>5.2 Withdrawals are processed only on Saturdays and Sundays.</p>
          <p>5.3 Requests made outside these days will be queued.</p>
          <p>5.4 Withdrawals are only sent to your registered wallet.</p>
          <p>5.5 Advance notice of two weeks is required for capital withdrawals.</p>
          <p>5.6 Fees will be deducted before release of funds.</p>
          <p>5.7 Withdrawals may be delayed during high-volume periods.</p>
          <p>5.8 Withdrawals are irreversible once processed.</p>
          <p>5.9 AlgoMcube maintains transparency in withdrawal records.</p>
          <p>5.10 Users are encouraged to plan withdrawals responsibly.</p>

          {/* SECTION 6 */}
          <hr />
          <h3 style={headingStyle}>6. Capital Packages & ROI</h3>
          <p>6.1 All user deposits are treated as capital packages within AlgoMcube.</p>
          <p>6.2 Capital packages activate once the minimum deposit threshold is met.</p>
          <p>6.3 ROI is targeted at 8–10% monthly but is not guaranteed.</p>
          <p>6.4 ROI depends on active forex market conditions and platform performance.</p>
          <p>6.5 ROI is calculated daily but credited on a scheduled cycle.</p>
          <p>6.6 ROI payouts will continue until you have cumulatively withdrawn 2× of your original deposit.</p>
          <p>6.7 Upon achieving this milestone, the capital package will automatically flush out.</p>
          <p>6.8 A flushed package means ROI payments stop and the capital is considered settled.</p>
          <p>6.9 Users may purchase new packages by depositing fresh funds after flush-out.</p>
          <p>6.10 This model ensures sustainability and fairness across all participants.</p>

          {/* SECTION 7 */}
          <hr />
          <h3 style={headingStyle}>7. Referral Program</h3>
          <p>7.1 AlgoMcube provides a structured referral system to reward users.</p>
          <p>7.2 Direct referrals generate commission percentages as outlined in the plan.</p>
          <p>7.3 Referral earnings are credited alongside ROI cycles.</p>
          <p>7.4 Referral rewards are subject to limits and caps for sustainability.</p>
          <p>7.5 Fraudulent or fake referrals will lead to suspension.</p>
          <p>7.6 Referral rewards may also be subject to withdrawal rules.</p>
          <p>7.7 Referrals strengthen community growth within AlgoMcube.</p>
          <p>7.8 Referral percentages may change as part of company policy updates.</p>
          <p>7.9 Users are encouraged to promote responsibly.</p>
          <p>7.10 Abuse of the referral system will not be tolerated.</p>

          {/* SECTION 8 */}
          <hr />
          <h3 style={headingStyle}>8. User Conduct</h3>
          <p>8.1 Users must act responsibly and ethically within the platform.</p>
          <p>8.2 Misuse of accounts for unlawful activity is strictly prohibited.</p>
          <p>8.3 Account sharing is not allowed under any circumstance.</p>
          <p>8.4 Users must respect community guidelines set by AlgoMcube.</p>
          <p>8.5 Spamming or misrepresenting AlgoMcube publicly is forbidden.</p>
          <p>8.6 All communications must remain professional and respectful.</p>
          <p>8.7 Users agree not to exploit system bugs for unfair advantage.</p>
          <p>8.8 Breach of conduct rules may result in suspension or termination.</p>
          <p>8.9 AlgoMcube promotes transparency in all member interactions.</p>
          <p>8.10 Each participant is an ambassador of the platform’s values.</p>

          {/* SECTION 9 */}
          <hr />
          <h3 style={headingStyle}>9. Platform Operations</h3>
          <p>9.1 AlgoMcube is a technology-driven system operating 24/7 online.</p>
          <p>9.2 Routine maintenance may cause temporary downtime.</p>
          <p>9.3 System upgrades are performed to enhance security and performance.</p>
          <p>9.4 The platform reserves the right to adjust its structure anytime.</p>
          <p>9.5 Service interruptions may occur during high traffic or upgrades.</p>
          <p>9.6 All important updates will be communicated to users via dashboard or email.</p>
          <p>9.7 Data records are maintained for transparency and auditing.</p>
          <p>9.8 The company ensures fairness in all operational processes.</p>
          <p>9.9 Features may be added or removed to optimize performance.</p>
          <p>9.10 Users accept that system adjustments are part of long-term growth.</p>

          {/* SECTION 10 */}
          <hr />
          <h3 style={headingStyle}>10. Risk Awareness</h3>
          <p>10.1 Forex trading is volatile and carries potential losses.</p>
          <p>10.2 AlgoMcube cannot guarantee consistent profits for all users.</p>
          <p>10.3 Users should only invest amounts they are comfortable risking.</p>
          <p>10.4 ROI percentages may vary from time to time.</p>
          <p>10.5 Past performance is not a guarantee of future results.</p>
          <p>10.6 Users acknowledge that capital packages carry inherent risks.</p>
          <p>10.7 Platform strategies are proprietary and may shift based on conditions.</p>
          <p>10.8 Risk is shared across all participants equally.</p>
          <p>10.9 Users are advised to make informed decisions.</p>
          <p>10.10 By using AlgoMcube, you accept these risks voluntarily.</p>

          {/* SECTION 11 */}
          <hr />
          <h3 style={headingStyle}>11. Transparency</h3>
          <p>11.1 AlgoMcube values clear communication with all users.</p>
          <p>11.2 Deposit and withdrawal histories are always visible in your account.</p>
          <p>11.3 ROI statements are published in detail for every package.</p>
          <p>11.4 Users can track package flush-out status via the dashboard.</p>
          <p>11.5 Transparency ensures fairness for the entire community.</p>
          <p>11.6 Regular updates are posted in the announcements section.</p>
          <p>11.7 Clear visibility into system operations builds trust.</p>
          <p>11.8 Users may request clarification via support channels.</p>
          <p>11.9 AlgoMcube commits to honest reporting at all times.</p>
          <p>11.10 Transparency is central to sustainable growth.</p>

          {/* SECTION 12 */}
          <hr />
          <h3 style={headingStyle}>12. Amendments</h3>
          <p>12.1 AlgoMcube reserves the right to update these Terms when necessary.</p>
          <p>12.2 Changes are applied to improve sustainability and operations.</p>
          <p>12.3 Users will be notified of major changes via platform communication.</p>
          <p>12.4 Continued use of the platform after changes means acceptance.</p>
          <p>12.5 Amendments ensure long-term growth for the community.</p>
          <p>12.6 Updated Terms are always available inside the Terms modal.</p>
          <p>12.7 Minor adjustments may be rolled out without prior notice.</p>
          <p>12.8 All users are encouraged to review Terms periodically.</p>
          <p>12.9 The company strives to keep policies clear and user-friendly.</p>
          <p>12.10 Amendments are part of evolving with market conditions.</p>

            {/* Continue adding all your sections (up to 102 points) here */}

            <div style={fadeBottom}></div>
          </div>
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
  width: "60vw",          // 🔹 Wider rectangle
  height: "30vh",         // 🔹 Shorter height
  color: "#E5E7EB",
  border: "6px solid #00f4f099",
  boxShadow: "0 0 30px rgba(19, 255, 251, 0.3)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const windowBox = {
  width: "100%",           // inner window
  height: "60%",          // takes 60% height of modal
  background: "#0F172A",
  border: "2px solid #2b0808ff",
  borderRadius: "8px",
  overflow: "hidden",
  marginBottom: "10px",
};

const modalContent = {
  width: "100%",
  height: "100%",
  overflowY: "auto",
  fontSize: "6px",       // 🔹 Smaller font
  lineHeight: "1.6",
  fontWeight: 300,
  letterSpacing: "0.2px",
  padding: "10px",
};

const headingMain = {
  fontWeight: 400,
  fontSize: "18px",
  letterSpacing: "0.5px",
  color: "#17E8E5",
  textAlign: "center",
  marginBottom: "10px",
};

const headingStyle = {
  fontWeight: 400,
  fontSize: "13px",
  color: "#17E8E5",
  marginTop: "12px",
  marginBottom: "4px",
};

const fadeBottom = {
  position: "sticky",
  bottom: 0,
  height: "30px",
  background: "linear-gradient(to bottom, rgba(15,23,42,0) 0%, #0F172A 100%)",
  pointerEvents: "none",
};

const buttonStyleTeal = {
  width: "50%",
  padding: "8px",
  border: "none",
  borderRadius: "8px",
  background: "#17E8E5",
  color: "#0B1220",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.3s ease",
};
