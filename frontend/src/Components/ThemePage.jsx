// src/components/ThemePage.jsx
import React from "react";

export default function ThemePage({ children }) {
  return (
    <div
      style={{
        background: "var(--fx-hero)", // 🔹 global dark theme bg
        color: "var(--fx-ink)",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}
