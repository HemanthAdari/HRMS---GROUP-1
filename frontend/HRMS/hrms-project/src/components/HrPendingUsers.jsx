// src/components/HrPendingUsers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API = "http://localhost:8080/api/admin";

const HrPendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(null);

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/pending-employees`);
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching pending users:", err);
      toast.error("Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm("Approve this user and create employee record?")) return;
    setActing(userId);
    try {
      const res = await axios.post(`${API}/users/${userId}/approve`, {});
      toast.success("User approved — employee created");
      setUsers(prev => prev.filter(u => u.userId !== userId));
      console.log("Created employee:", res.data);
    } catch (err) {
      console.error("Approve error:", err?.response || err);
      toast.error("Approve failed");
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm("Reject this user registration?")) return;
    setActing(userId);
    try {
      await axios.post(`${API}/users/${userId}/reject`, {});
      toast.info("User rejected");
      setUsers(prev => prev.filter(u => u.userId !== userId));
    } catch (err) {
      console.error("Reject error:", err?.response || err);
      toast.error("Reject failed");
    } finally {
      setActing(null);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading pending users...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Pending Employee Registrations</h2>
      {users.length === 0 ? (
        <p>No pending employee registrations.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {users.map(u => (
            <div key={u.userId} style={{
              border: "1px solid #ddd",
              padding: 12,
              borderRadius: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div><strong>{u.email}</strong> <small>({u.status})</small></div>
                <div>{u.firstName || ""} {u.lastName || ""}</div>
                <div style={{ fontSize: 12, color: "#666" }}>Registered: {u.createdAt || "—"}</div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleApprove(u.userId)} disabled={acting === u.userId}>
                  {acting === u.userId ? "Processing…" : "Approve"}
                </button>
                <button onClick={() => handleReject(u.userId)} disabled={acting === u.userId}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HrPendingUsers;
