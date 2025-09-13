import React, { useEffect, useState } from "react";
import axios from "axios";

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

  const filteredUsers = users.filter((u) => {
    if (!filter) return true;
    const refName = u.referrer_name?.toLowerCase() || "";
    return refName.includes(filter.toLowerCase());
  });

  return (
    <div style={{ color: "#E5E7EB" }}>
      <h2>Manage Users</h2>

      <h3 style={{ margin: "10px 0", color: "#17E8E5" }}>
        Total Deposits: ${totalDeposits}
      </h3>

      <input
        type="text"
        placeholder="Filter by Referrer Name"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          padding: "8px",
          margin: "10px 0",
          borderRadius: "6px",
          border: "1px solid #374151",
          background: "#111827",
          color: "#E5E7EB",
        }}
      />

      <table
        style={{
          width: "100%",
          marginTop: 20,
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #374151" }}>
            <th>Email</th>
            <th>Referrer</th>
            <th>Role</th>
            <th>Balance</th>
            <th>Deposits</th>
            <th>Associate Request</th> {/* ✅ new column */}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #374151" }}>
              <td>{u.email}</td>
              <td>{u.referrer_name || "—"}</td>
              <td>
                {u.is_admin
                  ? "Admin"
                  : u.is_associate
                  ? "Associate"
                  : "Investor"}
              </td>
              <td>${u.balance}</td>
              <td>${u.deposit || 0}</td>
              <td style={{ textAlign: "center" }}>
                {u.pending_associate ? (
                  <span
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: "#22C55E", // green light
                      boxShadow: "0 0 6px #22C55E",
                    }}
                  ></span>
                ) : (
                  "-"
                )}
              </td>
              <td>
                {!u.is_admin && (
                  <>
                    <button
                      onClick={() => updateRole(u.id, "associate")}
                      style={{ marginRight: 10 }}
                    >
                      Make Associate
                    </button>
                    <button onClick={() => updateRole(u.id, "investor")}>
                      Make Investor
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
