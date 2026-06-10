import React from "react";

const AUDIT_URL = "https://project-s-i-a-t-ai.onrender.com/AUDIT";

export default function AuditPortal() {
  return (
    <main style={{ width: "100vw", height: "100vh", background: "#f5efe6" }}>
      <iframe
        src={AUDIT_URL}
        title="SIAT Audit"
        style={{ width: "100%", height: "100%", border: "0" }}
        allow="clipboard-read; clipboard-write"
      />
    </main>
  );
}
