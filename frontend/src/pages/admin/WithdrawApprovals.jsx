import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function WithdrawApprovals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState({});

  const API = "http://127.0.0.1:8000/api";
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
    <div style={{ color: "#E5E7EB" }}>
      <h2 style={{ marginBottom: "20px" }}>Withdrawal Approvals</h2>

      {loading ? (
        <p>Loading withdrawals...</p>
      ) : withdrawals.length === 0 ? (
        <p>No withdrawal requests found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1F2937", color: "#E5E7EB" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>User Email</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Wallet</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Amount</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Fee</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Final Amount</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Tx Hash</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id} style={{ borderBottom: "1px solid #374151" }}>
                <td style={{ padding: "10px" }}>{w.email}</td>
                <td style={{ padding: "10px" }}>{w.wallet}</td>
                <td style={{ padding: "10px" }}>${w.amount}</td>
                <td style={{ padding: "10px" }}>${w.fee}</td>
                <td style={{ padding: "10px" }}>${w.final_amount}</td>
                <td
                  style={{
                    padding: "10px",
                    color:
                      w.status === "pending"
                        ? "#FACC15"
                        : w.status === "approved"
                        ? "#22C55E"
                        : "#EF4444",
                  }}
                >
                  {w.status}
                </td>
                <td style={{ padding: "10px" }}>
                  {w.status === "pending" ? (
                    <input
                      type="text"
                      placeholder="Enter Tx Hash"
                      value={txHash[w.id] || ""}
                      onChange={(e) =>
                        setTxHash((prev) => ({ ...prev, [w.id]: e.target.value }))
                      }
                      style={{
                        width: "150px",
                        padding: "5px",
                        borderRadius: "4px",
                      }}
                    />
                  ) : (
                    w.tx_hash || "-"
                  )}
                </td>
                <td style={{ padding: "10px" }}>
                  {w.status === "pending" && (
                    <>
                      <button
                        onClick={() => approveWithdrawal(w.id)}
                        style={{
                          marginRight: "10px",
                          padding: "6px 12px",
                          border: "none",
                          borderRadius: "4px",
                          background: "#22C55E",
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
                          borderRadius: "4px",
                          background: "#EF4444",
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
      )}
    </div>
  );
}
