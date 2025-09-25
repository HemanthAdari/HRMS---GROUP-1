// src/employee/EmpApprLeave.jsx
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { EmailContext } from "../components/EmailContext";
import "../components/NavBar.css";
import "../components/EmpApprLeave.css"; // <-- new scoped styles

const API = "http://localhost:8080/api/leave";
const EMP_LEAV_API = "http://localhost:8080/api/employees/t-leaves";

// normalize backend responses to a consistent object
function normalizeLeave(raw) {
  const id = raw.leaveId ?? raw.id;
  const email = raw.user?.email ?? raw.email ?? "";
  const dateStr = raw.startDate ?? raw.date ?? raw.start_date ?? "";
  const date = dateStr ? dateStr.toString().slice(0, 10) : "";
  const submittedReason = raw.reason ?? raw.leaveReason ?? "";
  const status = (raw.status ?? "PENDING").toString().toUpperCase();
  return { id, email, date, submittedReason, status, raw };
}

const EmpApprLeave = () => {
  const { email } = useContext(EmailContext);
  const [leaves, setLeaves] = useState([]);

  // load leaves from API
  useEffect(() => {
    axios
      .get(API)
      .then((res) => {
        const arr = Array.isArray(res.data) ? res.data : [];
        setLeaves(arr.map(normalizeLeave));
      })
      .catch((err) => console.error("Failed to load leaves:", err));
  }, []);

  const filteredLeaves = leaves.filter(
    (lv) => (lv.email || "").toLowerCase() === (email || "").toLowerCase()
  );
  const approvedLeavesCount = filteredLeaves.filter(
    (lv) => lv.status === "APPROVED"
  ).length;

  // update employee approved leave count in backend
  useEffect(() => {
    if (email) {
      axios
        .put(EMP_LEAV_API, { email, leaves: approvedLeavesCount })
        .then(() => console.log("Employee leave count updated"))
        .catch((err) =>
          console.log("Failed to update employee leave count:", err)
        );
    }
  }, [email, approvedLeavesCount]);

  return (
    <div className="emp-apr-leave-first-div">
      <h1>My Leave Requests</h1>
      <h2>Total Approved Leaves: {approvedLeavesCount}</h2>

      <div className="emp-apr-table-wrap">
        <table className="emp-apr-leave-first-div-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Date</th>
              <th>Submitted Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((lv) => (
                <tr key={lv.id}>
                  <td>{lv.id}</td>
                  <td>{lv.email}</td>
                  <td>{lv.date}</td>
                  <td style={{ maxWidth: 300, whiteSpace: "pre-wrap" }}>
                    {lv.status === "PENDING"
                      ? lv.submittedReason || "-"
                      : "-"}
                  </td>
                  <td>
                    {lv.status === "APPROVED" ? (
                      <span style={{ color: "green" }}>Approved</span>
                    ) : lv.status === "REJECTED" ? (
                      <span style={{ color: "red" }}>Rejected</span>
                    ) : (
                      <span style={{ color: "orange" }}>Pending</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No leave records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmpApprLeave;
