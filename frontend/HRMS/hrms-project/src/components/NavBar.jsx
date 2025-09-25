// src/components/NavBar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./NavBar.css";

const PENDING_COUNT_API = "http://localhost:8080/api/admin/pending-employees";

export default function NavBar({ logout }) {
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();

  const fetchPendingCount = async () => {
    try {
      const res = await axios.get(PENDING_COUNT_API, { withCredentials: true });
      if (Array.isArray(res.data)) {
        setPendingCount(res.data.length);
      } else {
        setPendingCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch pending count:", err);
      setPendingCount(0);
    }
  };

  useEffect(() => {
    fetchPendingCount();

    // Update when HrPendingUsers dispatches event
    const handler = () => fetchPendingCount();
    window.addEventListener("pending-updated", handler);

    return () => {
      window.removeEventListener("pending-updated", handler);
    };
  }, [location.pathname]);

  return (
    <header style={{ borderBottom: "2px solid #ddd", background: "#fff" }}>
      {/* HRMS Title */}
      <div style={{ padding: "16px 24px", fontSize: "32px", fontWeight: "bold", color: "#f39c12" }}>
        HRMS
      </div>

      {/* Navigation Links */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        gap: "32px",
        padding: "12px 24px",
        fontSize: "18px",
        fontWeight: 500,
      }}>
        <Link to="/" className="nav-link">Dashboard</Link>
        <Link to="/a/emp" className="nav-link">Employees</Link>
        <Link to="/a/att" className="nav-link">Attendance</Link>
        <Link to="/a/leave/request" className="nav-link">Leave</Link>
        <Link to="/a/sal" className="nav-link">Salary</Link>

        <Link to="/a/pending-users" className="nav-link" style={{ display: "inline-flex", alignItems: "center" }}>
          Pending Users
          <span style={{
            marginLeft: 8,
            background: pendingCount > 0 ? "#e74c3c" : "#999",
            color: "#fff",
            borderRadius: "50%",
            padding: "4px 10px",
            fontSize: "14px",
            fontWeight: "bold",
            minWidth: "28px",
            textAlign: "center"
          }}>
            {pendingCount}
          </span>
        </Link>

        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={() => { logout && logout(); }}
            style={{
              background: "#ff6b6b",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
