import React, { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

export default function AuthModal({ open, onClose }) {
  const [tab, setTab] = useState("signin");

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        fontFamily: "var(--fx-font-body)",
      }}
    >
      <div
        style={{
          background: "var(--fx-card)",
          color: "var(--fx-ink)",
          padding: "25px 20px",
          borderRadius: "14px",
          width: "400px",
          border: "1px solid var(--fx-border)",
          boxShadow: "0 18px 45px rgba(var(--fx-accent-rgb),0.18)",
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <button
            onClick={() => setTab("signin")}
            style={{
              flex: 1,
              padding: "12px",
              background:
                tab === "signin"
                  ? "linear-gradient(135deg, var(--fx-button), var(--fx-button-2))"
                  : "transparent",
              color: tab === "signin" ? "var(--fx-bg)" : "var(--fx-muted)",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              borderRadius: "8px 8px 0 0",
              transition: "all 0.3s ease",
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab("signup")}
            style={{
              flex: 1,
              padding: "12px",
              background:
                tab === "signup"
                  ? "linear-gradient(135deg, var(--fx-button), var(--fx-button-2))"
                  : "transparent",
              color: tab === "signup" ? "var(--fx-bg)" : "var(--fx-muted)",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              borderRadius: "8px 8px 0 0",
              transition: "all 0.3s ease",
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        <div style={{ marginTop: "10px" }}>
          {tab === "signin" ? <SignInForm /> : <SignUpForm />}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "12px",
            background: "rgba(255,255,255,0.06)",
            color: "var(--fx-ink)",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.target.style.background = "rgba(var(--fx-accent-rgb),0.2)")
          }
          onMouseOut={(e) =>
            (e.target.style.background = "rgba(255,255,255,0.06)")
          }
        >
          Close
        </button>
      </div>
    </div>
  );
}
