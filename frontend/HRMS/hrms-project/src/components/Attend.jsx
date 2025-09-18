import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";

const ATTENDANCE_API = "http://localhost:8080/api/attendance/mark";

// Hardcoded for now – replace with logged-in userId later
const USER_ID = 13;

const Attend = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  async function markAttendance(status) {
    const date = selectedDate.toISOString().slice(0, 10);
    const payload = { userId: USER_ID, date: date, status: status };

    try {
      const res = await axios.post(ATTENDANCE_API, payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Saved:", res.data);
      toast.success(`Attendance marked: ${status}`);
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.error || "Error marking attendance");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Mark Attendance</h2>
      <label>Select Date: </label>
      <input
        type="date"
        value={selectedDate.toISOString().slice(0, 10)}
        onChange={(e) => setSelectedDate(new Date(e.target.value))}
      />
      <br /><br />
      <button onClick={() => markAttendance("FULL_DAY")}>Mark Full Day</button>
      <button onClick={() => markAttendance("HALF_DAY")}>Mark Half Day</button>
      <button onClick={() => markAttendance("ABSENT")}>Mark Absent</button>
    </div>
  );
};

export default Attend;
