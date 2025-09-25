// src/components/AdminHrInfo.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminStyles.css";

const HR_LIST_API = "http://localhost:8080/api/admin/hr-list";
const EMP_API = "http://localhost:8080/api/employees";

const AdminHrInfo = () => {
  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    axios
      .get(HR_LIST_API, { withCredentials: true })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const normalized = res.data.map((r) => ({
            hrId: r.hrId || r.id || r.userId,
            email: r.email || r.username || "hr@example.com",
            employeeCount: typeof r.employeeCount === "number" ? r.employeeCount : r.employees?.length ?? 0,
          }));
          setHrs(normalized);
          setLoading(false);
        } else {
          return axios.get(EMP_API);
        }
      })
      .then((res) => {
        if (!res) return;
        const employees = Array.isArray(res.data) ? res.data : [];
        const map = new Map();
        employees.forEach((e) => {
          const hrEmail = e.hrEmail || e.managerEmail || e.reportingTo || "hr@example.com";
          map.set(hrEmail, (map.get(hrEmail) || 0) + 1);
        });
        const arr = Array.from(map.entries()).map(([email, count], idx) => ({
          hrId: `computed-${idx + 1}`,
          email,
          employeeCount: count,
        }));
        setHrs(arr);
      })
      .catch((err) => {
        console.error("Failed to fetch HR info:", err);
        setHrs([{ hrId: "fallback-1", email: "hr@example.com", employeeCount: 0 }]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-root">
      <div className="admin-container">
        <h2>HR — Basic Info</h2>
        <div className="small-muted">Showing HR email and number of employees reporting to each HR.</div>

        {loading ? (
          <div style={{ marginTop: 18 }}>Loading HR info...</div>
        ) : hrs.length === 0 ? (
          <div style={{ marginTop: 18 }}>No HR records found.</div>
        ) : (
          <div className="admin-grid" style={{ marginTop: 14 }}>
            {hrs.map((hr) => (
              <div className="admin-card" key={hr.hrId}>
                <div className="left">
                  <div className="name">{hr.email}</div>
                  <div className="meta">HR ID: {hr.hrId}</div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div className="badge">{hr.employeeCount}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>employees</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHrInfo;
