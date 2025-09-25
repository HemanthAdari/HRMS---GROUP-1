// src/components/AdminEmployees.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminStyles.css";

const API = "http://localhost:8080/api/employees";

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(API)
      .then((res) => setEmployees(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Failed to load employees:", err);
        setEmployees([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => {
    if (!d) return "Not available";
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString();
  };

  return (
    <div className="admin-root">
      <div className="admin-container">
        <h2>All Employees (Admin view)</h2>
        <div className="small-muted">Only basic info: name, hire date and role. No private details.</div>

        {loading ? (
          <div style={{ marginTop: 18 }}>Loading employees...</div>
        ) : employees.length === 0 ? (
          <div style={{ marginTop: 18 }}>No employees found.</div>
        ) : (
          <div className="admin-grid" style={{ marginTop: 14 }}>
            {employees.map((emp) => {
              const firstName = emp.firstName || emp.name || "";
              const lastName = emp.lastName || emp.surname || "";
              const displayName = `${firstName} ${lastName}`.trim() || "Unnamed";
              const hireDate = emp.hireDate || emp.joiningDate || emp.hiredOn || "";
              const formatted = formatDate(hireDate);
              const id = emp.id || emp.employeeId || emp.userId || displayName;

              return (
                <div key={id} className="admin-card">
                  <div className="left">
                    <div className="name">{displayName}</div>
                    <div className="meta">Hired: {formatted} &nbsp; Role: {emp.role || emp.designation || "—"}</div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div className="badge" title="Department">{emp.department || "IT"}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>ID: {emp.employeeId || emp.id || "—"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEmployees;
