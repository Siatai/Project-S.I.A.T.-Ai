import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Wallet() {
  const [wallet, setWallet] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const API = "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("token");

  // ✅ Decode email from JWT token
  let email = "";
  if (token) {
    try {
      email = JSON.parse(atob(token.split(".")[1])).email;
    } catch (e) {
      console.error("Error decoding token:", e);
    }
  }

  // ✅ Fetch wallet on load
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await axios.get(`${API}/user-info`, {
          params: { email }, // <-- required by backend
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.wallet) {
          setWallet(res.data.wallet);
          setSaved(true);
        }
      } catch (err) {
        console.error("Error fetching wallet:", err);
      } finally {
        setLoading(false);
      }
    };
    if (email) fetchWallet();
  }, [token, email]);

  // ✅ Save wallet
  const saveWallet = async () => {
    if (!wallet.trim()) {
      alert("Please enter a valid TRC20 address.");
      return;
    }
    try {
      await axios.post(
        `${API}/save-wallet`,
        { email, wallet }, // <-- backend expects email + wallet
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Wallet saved successfully!");
      setSaved(true);
    } catch (err) {
      console.error("Error saving wallet:", err);
      alert(err?.response?.data?.detail || "Failed to save wallet");
    }
  };

  if (loading) return <p style={{ color: "#E5E7EB" }}>Loading...</p>;

  return (
    <div style={{ color: "#E5E7EB" }}>
      <h2 style={{ marginBottom: "20px" }}>My Wallet</h2>

      {saved ? (
        <div>
          <p>
            <strong>Bound TRC20 Wallet:</strong>
          </p>
          <p
            style={{
              marginTop: "10px",
              padding: "10px",
              background: "#1F2937",
              borderRadius: "6px",
              fontFamily: "monospace",
              wordBreak: "break-all",
            }}
          >
            {wallet}
          </p>
          <p style={{ marginTop: "10px", color: "#F87171" }}>
            ⚠️ You cannot change this wallet once saved.
          </p>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Enter your TRC20 wallet address"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "10px",
            }}
          />
          <button
            onClick={saveWallet}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              background: "#3B82F6",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Save Wallet
          </button>
        </div>
      )}
    </div>
  );
}
