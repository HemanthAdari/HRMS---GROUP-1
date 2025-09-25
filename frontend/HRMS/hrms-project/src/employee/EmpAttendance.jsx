// src/employee/EmpAttendance.jsx
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { EmailContext } from "../components/EmailContext";
import "../components/NavBar.css";
import "../components/EmpApprLeave.css"; // <-- correct path to the scoped table styles

const API = "http://localhost:8080/api/attendance";

function buildLocalDateFromInput(value) {
  if (!value) return null;
  const parts = value.split("-");
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  return new Date(y, m - 1, d);
}

const EmpAttendance = () => {
  const { userId, email } = useContext(EmailContext);
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [status, setStatus] = useState("FULL_DAY");
  const [loading, setLoading] = useState(false);

  // fallback to localStorage if context not set
  const uid = userId || Number(localStorage.getItem("userId"));

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    axios
      .get(`${API}?userId=${uid}`)
      .then((res) => {
        setAttendance(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Error fetching attendance for user:", err);
        setAttendance([]);
      })
      .finally(() => setLoading(false));
  }, [uid]);

  const todayISO = (() => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, "0");
    const dd = String(t.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  })();

  const isWeekend = (value) => {
    if (!value) return false;
    const d = buildLocalDateFromInput(value);
    if (!d) return false;
    const day = d.getDay();
    return day === 0 || day === 6;
  };

  const isPastDate = (value) => {
    if (!value) return false;
    const today = new Date();
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const selected = buildLocalDateFromInput(value);
    if (!selected) return false;
    return selected < t;
  };

  const isFutureDate = (value) => {
    if (!value) return false;
    const today = new Date();
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const selected = buildLocalDateFromInput(value);
    if (!selected) return false;
    return selected > t;
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!uid) {
      alert("User not identified. Please login again.");
      return;
    }
    if (!date) {
      alert("Please select a date.");
      return;
    }
    if (isPastDate(date)) {
      alert("You cannot mark past days' attendance.");
      return;
    }
    if (isFutureDate(date)) {
      alert("You cannot mark future days' attendance.");
      return;
    }
    if (isWeekend(date)) {
      alert("This is a holiday (weekend). You cannot mark attendance on weekends.");
      return;
    }

    const payload = { userId: Number(uid), date, status };
    try {
      const res = await axios.post(API, payload);
      // append new row to local list
      setAttendance((prev) => [...prev, res.data]);
      alert("Attendance marked successfully");
      // optionally reset date/status
      setDate("");
      setStatus("FULL_DAY");
    } catch (err) {
      console.error("Error marking attendance:", err.response?.data || err);
      alert(err.response?.data?.error || "Failed to mark attendance");
    }
  };

  return (
    <div className="emp-apr-leave-first-div">
      <h1>My Attendance</h1>

      <div style={{ marginTop: 8, marginBottom: 16, color: "#444" }}>
        {email ? (
          <div>
            Signed in as: <strong>{email}</strong>
          </div>
        ) : null}
      </div>

      <div style={{ marginBottom: 18, display: "flex", gap: 12, alignItems: "center" }}>
        <form onSubmit={handleMarkAttendance} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontWeight: 600 }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={todayISO}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="FULL_DAY">Full Day</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ABSENT">Absent</option>
          </select>
          <button type="submit" style={{ padding: "8px 12px" }}>
            Mark
          </button>
        </form>

        <div style={{ marginLeft: "24px", color: "#666" }}>
          <div>Tip: You can only mark today's attendance (no past/future/weekends).</div>
        </div>
      </div>

      <div className="emp-apr-table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ padding: 18 }}>
                  Loading...
                </td>
              </tr>
            ) : attendance.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">
                  No attendance records found
                </td>
              </tr>
            ) : (
              attendance.map((a) => (
                <tr key={a.attendanceId}>
                  <td>{a.attendanceId}</td>
                  <td>{a.date}</td>
                  <td>{a.status}</td>
                  <td>{a.remarks || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmpAttendance;
