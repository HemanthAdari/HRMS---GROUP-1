// src/components/HrPendingUsers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API = "http://localhost:8080/api/admin";

const HrPendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(null); // userId currently being processed
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line
  }, [refreshKey]);

  // Fetch pending users and dispatch update event so NavBar badge refreshes
  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/pending-employees`);
      const data = Array.isArray(res.data) ? res.data : [];
      setUsers(data);
      // notify other components (NavBar) that pending set changed
      window.dispatchEvent(new Event("pending-updated"));
    } catch (err) {
      console.error("Error fetching pending users:", err);
      toast.error("Failed to load pending users");
      setUsers([]);
      window.dispatchEvent(new Event("pending-updated"));
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
      // remove from list locally
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
      // notify navbar etc
      window.dispatchEvent(new Event("pending-updated"));
      console.log("Created employee:", res.data);
    } catch (err) {
      console.error("Approve error:", err?.response || err);
      toast.error(err?.response?.data?.error || "Approve failed");
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
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
      window.dispatchEvent(new Event("pending-updated"));
    } catch (err) {
      console.error("Reject error:", err?.response || err);
      toast.error(err?.response?.data?.error || "Reject failed");
    } finally {
      setActing(null);
    }
  };

  const handleRefresh = () => {
    // bump key to re-trigger fetch effect
    setRefreshKey((k) => k + 1);
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading pending users...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Pending Employee Registrations</h2>
        <div>
          <button
            onClick={handleRefresh}
            style={{
              marginRight: 8,
              padding: "8px 12px",
              background: "#3498db",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div style={{ padding: 12, borderRadius: 8, background: "#fff", border: "1px solid #eee" }}>
          <p style={{ margin: 0 }}>No pending employee registrations.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {users.map((u) => (
            <div
              key={u.userId}
              style={{
                border: "1px solid #e5e5e5",
                padding: 12,
                borderRadius: 8,
                background: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {u.email} <small style={{ color: "#777" }}>({u.status || "PENDING"})</small>
                </div>
                <div style={{ color: "#333", marginTop: 4 }}>
                  {u.firstName || ""} {u.lastName || ""}
                </div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                  Registered: {u.createdAt || "—"}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleApprove(u.userId)}
                  disabled={acting === u.userId}
                  style={{
                    padding: "8px 12px",
                    background: acting === u.userId ? "#95d5b2" : "#2ecc71",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: acting === u.userId ? "not-allowed" : "pointer",
                  }}
                >
                  {acting === u.userId ? "Processing…" : "Approve"}
                </button>

                <button
                  onClick={() => handleReject(u.userId)}
                  disabled={acting === u.userId}
                  style={{
                    padding: "8px 12px",
                    background: acting === u.userId ? "#f1a9a0" : "#e74c3c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: acting === u.userId ? "not-allowed" : "pointer",
                  }}
                >
                  {acting === u.userId ? "Processing…" : "Reject"}
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
