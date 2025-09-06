import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
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
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const updateRole = async (id, role) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/admin/update-role`, { id, role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  return (
    <div style={{ color: "#E5E7EB" }}>
      <h2>Manage Users</h2>
      <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #374151" }}>
            <th>Email</th>
            <th>Role</th>
            <th>Balance</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: "1px solid #374151" }}>
              <td>{u.email}</td>
              <td>{u.is_admin ? "Admin" : u.is_associate ? "Associate" : "Investor"}</td>
              <td>${u.balance}</td>
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
