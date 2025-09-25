// src/components/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminStyles.css";

const EMP_API = "http://localhost:8080/api/employees";

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(EMP_API)
      .then((res) => setEmployees(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Failed loading employees:", err);
        setEmployees([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalEmployees = employees.length;
  const hrCount = (() => {
    const map = new Map();
    employees.forEach((e) => {
      const hr = e.hrEmail || e.managerEmail || e.reportingTo || "unassigned";
      map.set(hr, (map.get(hr) || 0) + 1);
    });
    return map.size;
  })();

  return (
    <div className="admin-root">
      <div className="admin-hero">
        <div className="hero-text">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-sub">Overview — quick stats and admin actions</p>
        </div>

        <img
          className="hero-image"
          src="https://via.placeholder.com/300x200.png?text=Admin+Panel"
          alt="admin"
        />
      </div>

      <div className="admin-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>Welcome, Admin</h2>
            <div className="small-muted">Manage HR, employees and view reports</div>
          </div>
        </div>

        <div className="stats" style={{ marginTop: 18 }}>
          <div className="stat-box">
            <div className="stat-value">{loading ? "..." : totalEmployees}</div>
            <div className="stat-label">Total Employees</div>
          </div>

          <div className="stat-box">
            <div className="stat-value">{loading ? "..." : hrCount}</div>
            <div className="stat-label">HRs (managers)</div>
          </div>

          <div className="stat-box">
            <div className="stat-value">--</div>
            <div className="stat-label">Open positions</div>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <h3 style={{ marginBottom: 10 }}>Quick actions</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#22a6b3", color: "#fff", cursor: "pointer" }}>
              View Employees
            </button>
            <button style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #eee", background: "#fff", color: "#333", cursor: "pointer" }}>
              Add HR
            </button>
            <button style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #eee", background: "#fff", color: "#333", cursor: "pointer" }}>
              Job Openings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
