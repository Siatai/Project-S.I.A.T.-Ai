// src/components/ThemePage.jsx
import React from "react";

export default function ThemePage({ children }) {
  return (
    <div
      style={{
        backgroundColor: "#0f172a", // 🔹 global dark theme bg
        color: "#E5E7EB",
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
