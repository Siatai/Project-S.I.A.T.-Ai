import React, { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

export default function AuthModal({ open, onClose }) {
  const [tab, setTab] = useState("signin");

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#121A2B", color: "#E5E7EB",
        padding: "30px", borderRadius: "12px", width: "400px"
      }}>
        {/* Tabs */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <button
            onClick={() => setTab("signin")}
            style={{
              flex: 1, padding: "10px", background: tab === "signin" ? "#3B82F6" : "transparent",
              color: tab === "signin" ? "#fff" : "#E5E7EB", border: "none", cursor: "pointer"
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab("signup")}
            style={{
              flex: 1, padding: "10px", background: tab === "signup" ? "#3B82F6" : "transparent",
              color: tab === "signup" ? "#fff" : "#E5E7EB", border: "none", cursor: "pointer"
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        {tab === "signin" ? <SignInForm /> : <SignUpForm />}

        <button
          onClick={onClose}
          style={{
            marginTop: "20px", width: "100%", padding: "10px",
            background: "#DC2626", color: "#fff", border: "none",
            borderRadius: "6px", cursor: "pointer"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
