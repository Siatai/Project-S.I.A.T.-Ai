import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function WithdrawApprovals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState({});

  const API = "https://project-s-i-a-t-ai.onrender.com";
  const token = localStorage.getItem("token");

  // ✅ Fetch all withdrawals (wrapped in useCallback so ESLint is happy)
  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWithdrawals(res.data || []);
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
      alert("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  // ✅ Run on component mount
  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  // Approve withdrawal
  const approveWithdrawal = async (id) => {
    if (!txHash[id]) {
      alert("Please enter a transaction hash before approving.");
      return;
    }
    try {
      await axios.post(
        `${API}/withdrawals/approve/${id}`,
        { tx_hash: txHash[id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Withdrawal approved");
      fetchWithdrawals(); // refresh after approve
    } catch (err) {
      console.error("Approve error:", err);
      alert(err?.response?.data?.detail || "Approval failed");
    }
  };

  // Reject withdrawal
  const rejectWithdrawal = async (id) => {
    try {
      await axios.post(
        `${API}/withdrawals/reject/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("❌ Withdrawal rejected");
      fetchWithdrawals(); // refresh after reject
    } catch (err) {
      console.error("Reject error:", err);
      alert(err?.response?.data?.detail || "Rejection failed");
    }
  };

  return (
    <div style={{ color: "var(--fx-ink)" }}>
      <h2 style={{ marginBottom: "20px" }}>Withdrawal Approvals</h2>

      {loading ? (
        <p>Loading withdrawals...</p>
      ) : withdrawals.length === 0 ? (
        <p>No withdrawal requests found.</p>
      ) : (
        <div className="fx-table-wrap">
          <table className="fx-table">
          <thead>
            <tr>
              <th>User Email</th>
              <th>Wallet</th>
              <th>Amount</th>
              <th>Fee</th>
              <th>Final Amount</th>
              <th>Status</th>
              <th>Tx Hash</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id}>
                <td>{w.email}</td>
                <td>{w.wallet}</td>
                <td>${w.amount}</td>
                <td>${w.fee}</td>
                <td>${w.final_amount}</td>
                <td
                  style={{
                    color:
                      w.status === "pending"
                        ? "var(--fx-gold)"
                        : w.status === "approved"
                        ? "var(--fx-success)"
                        : "var(--fx-danger)",
                  }}
                >
                  {w.status}
                </td>
                <td>
                  {w.status === "pending" ? (
                    <input
                      type="text"
                      placeholder="Enter Tx Hash"
                      value={txHash[w.id] || ""}
                      onChange={(e) =>
                        setTxHash((prev) => ({ ...prev, [w.id]: e.target.value }))
                      }
                      className="fx-input"
                      style={{
                        width: "180px",
                      }}
                    />
                  ) : (
                    w.tx_hash || "-"
                  )}
                </td>
                <td>
                  {w.status === "pending" && (
                    <>
                      <button
                        onClick={() => approveWithdrawal(w.id)}
                        style={{
                          marginRight: "10px",
                          padding: "6px 12px",
                          border: "none",
                          borderRadius: "8px",
                          background: "var(--fx-success)",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectWithdrawal(w.id)}
                        style={{
                          padding: "6px 12px",
                          border: "none",
                          borderRadius: "8px",
                          background: "var(--fx-danger)",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
