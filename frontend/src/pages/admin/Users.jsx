import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatAmount } from "../../utils/format";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [filter, setFilter] = useState("");
  const API = "https://project-s-i-a-t-ai.onrender.com";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data.users || []);
      setTotalDeposits(res.data.total_deposits || 0);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const updateRole = async (id, role) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/admin/update-role`,
        { id, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const denyAssociate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/admin/deny-associate`,
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.error("Error denying associate request:", err);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!filter) return true;
    const refName = u.referrer_name?.toLowerCase() || "";
    return refName.includes(filter.toLowerCase());
  });

  return (
    <div style={{ color: "var(--fx-ink)" }}>
      <h2>Manage Users</h2>

      <h3 style={{ margin: "10px 0", color: "var(--fx-accent)" }}>
        Total Deposits: ${formatAmount(totalDeposits)}
      </h3>

      <input
        type="text"
        placeholder="Filter by Referrer Name"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="fx-input"
        style={{
          margin: "10px 0",
          maxWidth: "320px",
        }}
      />
      <div className="fx-table-wrap" style={{ marginTop: 20 }}>
        <table className="fx-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Referrer</th>
              <th>Role</th>
              <th>Balance</th>
              <th>Deposits</th>
              <th>Associate Request</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.referrer_name || "-"}</td>
                <td>
                  {u.is_admin
                    ? "Admin"
                    : u.is_associate
                    ? "Associate"
                    : "Investor"}
                </td>
                <td>${formatAmount(u.balance)}</td>
                <td>${formatAmount(u.deposit || 0)}</td>
                <td style={{ textAlign: "center" }}>
                  {u.pending_associate ? (
                    <span
                      style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: "var(--fx-gold)",
                        boxShadow: "0 0 6px rgba(255, 209, 102, 0.6)",
                      }}
                    ></span>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {!u.is_admin && u.pending_associate && (
                    <>
                      <button
                        onClick={() => updateRole(u.id, "associate")}
                        style={{
                          marginRight: 10,
                          background: "var(--fx-success)",
                          color: "#00130b",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => denyAssociate(u.id)}
                        style={{
                          background: "var(--fx-danger)",
                          color: "#1a0006",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        Deny
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
