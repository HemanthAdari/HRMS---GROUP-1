// Attendance.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import "./Menu.css";

const API = "http://localhost:8080/api/attendance";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // For marking attendance
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("FULL_DAY");

  // Get user info from localStorage
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  // Load attendance based on role
  useEffect(() => {
    let url;
    if (role === "ADMIN" || role === "HR_MANAGER") {
      url = API + "/all";
    } else {
      url = API + `/user/${userId}`;
    }

    axios
      .get(url)
      .then((res) => setAttendance(res.data))
      .catch((err) => console.error("Error fetching attendance:", err));
  }, [role, userId]);

  // Mark attendance (for employees only)
  const handleMarkAttendance = (e) => {
    e.preventDefault();
    const payload = {
      userId: parseInt(userId), // use logged-in userId
      date,
      status,
    };
    axios
      .post(API + "/mark", payload)
      .then((res) => {
        alert("Attendance marked successfully");
        setAttendance([...attendance, res.data]); // update list immediately
      })
      .catch((err) => {
        console.error("Error marking attendance:", err.response?.data || err);
        alert(err.response?.data?.error || "Failed to mark attendance");
      });
  };

  // Filtering logic
  const filtered = attendance.filter((att) => {
    const emailMatch = att.user.email
      .toLowerCase()
      .includes(search.toLowerCase());

    const attDate = new Date(att.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const dateMatch = (!start || attDate >= start) && (!end || attDate <= end);

    return emailMatch && dateMatch;
  });

  return (
    <div className="attendance">
      <div className="aSecAttendance">
        {role === "EMPLOYEE" && (
          <>
            <h1>Mark Attendance</h1>
            <form onSubmit={handleMarkAttendance} style={{ marginBottom: "20px" }}>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="FULL_DAY">Full Day</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="ABSENT">Absent</option>
              </select>
              <button type="submit">Mark</button>
            </form>
          </>
        )}

        <h1>List Of Attendance</h1>
        <input
          type="text"
          placeholder="Search by email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            marginBottom: "10px",
            padding: "5px",
            borderRadius: "50px",
            width: "200px",
          }}
        />
        <div style={{ marginBottom: "10px" }} className="attendanceFirstDiv">
          <label>Start Date: </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label style={{ marginLeft: "10px" }}>End Date: </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <table border="1" className="attendanceTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Date</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((att) => (
              <tr key={att.attendanceId}>
                <td>{att.attendanceId}</td>
                <td>{att.user.email}</td>
                <td>{att.date}</td>
                <td>{att.status}</td>
                <td>{att.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
