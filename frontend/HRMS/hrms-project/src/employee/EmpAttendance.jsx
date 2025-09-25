import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { EmailContext } from "../components/EmailContext";
import "./EmpNav.css";

const ATT_API = "http://localhost:8080/api/attendance";
const LEAVE_API = "http://localhost:8080/api/leave";

const EmpAttendance = () => {
  const { email, userId } = useContext(EmailContext); // logged-in employee info
  const [attendanceList, setAttendanceList] = useState([]);
  const [leaveList, setLeaveList] = useState([]);
  const [date, setDate] = useState(new Date());

  // ✅ Month-Year filter state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0=Jan
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // ✅ Fetch attendance + leaves
  useEffect(() => {
    if (!userId) return;

    const fetchAttendance = () => {
      axios
        .get(`${ATT_API}?userId=${userId}`)
        .then((res) => setAttendanceList(res.data))
        .catch((err) => console.error("Error fetching attendance:", err));
    };

    const fetchLeaves = () => {
      axios
        .get(LEAVE_API)
        .then((res) =>
          setLeaveList(res.data.filter((lv) => lv.user?.email === email))
        )
        .catch((err) => console.error("Error fetching leaves:", err));
    };

    fetchAttendance();
    fetchLeaves();
  }, [email, userId]);

  // ✅ Save attendance for selected date
  const handleAttendance = (status) => {
    const formattedDate = date.toISOString().split("T")[0]; // yyyy-mm-dd

    const record = { userId, date: formattedDate, status };

    axios
      .post(ATT_API, record)
      .then(() => {
        toast.success("Attendance saved");
        // refresh attendance only
        axios
          .get(`${ATT_API}?userId=${userId}`)
          .then((res) => setAttendanceList(res.data))
          .catch((err) => console.error("Error refreshing attendance:", err));
      })
      .catch(() => toast.error("Failed to save attendance"));
  };

  // ✅ Normalize date (yyyy-mm-dd)
  const formatDate = (d) => {
    if (!d) return "";
    const dateObj = new Date(d);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ✅ Highlight attendance + leave on calendar
  const tileContent = ({ date }) => {
    const formattedDate = formatDate(date);

    const attendance = attendanceList.find((a) => a.date === formattedDate);

    const leave = leaveList.find((l) => {
      if (l.status?.toLowerCase() !== "approved") return false;
      if (l.startDate && l.endDate) {
        const start = formatDate(l.startDate);
        const end = formatDate(l.endDate);
        return formattedDate >= start && formattedDate <= end;
      } else {
        return formatDate(l.startDate) === formattedDate;
      }
    });

    return (
      <div style={{ fontSize: "12px", textAlign: "center" }}>
        {/* Attendance Marks */}
        {attendance ? (
          attendance.status === "FULL_DAY" ? (
            <span style={{ color: "green", fontWeight: "bold" }}>✔</span>
          ) : attendance.status === "HALF_DAY" ? (
            <span
              style={{
                color: "orange",
                fontWeight: "bold",
                border: "2px solid orange",
              }}
            >
              ½
            </span>
          ) : attendance.status === "ABSENT" ? (
            <span style={{ color: "red", fontWeight: "bold" }}>✖</span>
          ) : null
        ) : null}

        {/* Leave marker */}
        {leave && (
          <span
            title={leave.reason || "Leave"}
            style={{
              display: "inline-block",
              marginTop: "1px",
              padding: "1px 4px",
              borderRadius: "4px",
              backgroundColor: "#ff3030ff",
              color: "white",
              fontSize: "10px",
              fontWeight: "bold",
            }}
          >
            𝐋
          </span>
        )}
      </div>
    );
  };

  // ✅ Filter records for chosen month & year
  const getMonthlySummary = () => {
    return attendanceList.filter((a) => {
      const recordDate = new Date(a.date);
      return (
        recordDate.getFullYear() === selectedYear &&
        recordDate.getMonth() === selectedMonth
      );
    });
  };

  const monthlyAttendance = getMonthlySummary();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="emp-att-first-div" style={{ padding: "20px" }}>
      <h2>Attendance & Leave for {email}</h2>

      {/* Calendar */}
      <Calendar value={date} onChange={setDate} tileContent={tileContent} />

      {/* Mark Attendance */}
      <div className="emp-att-second-div" style={{ marginTop: "20px" }}>
        <p>
          Selected Date: <b>{date.toDateString()}</b>
        </p>
        <button onClick={() => handleAttendance("FULL_DAY")}>
          Mark Present (Full Day)
        </button>
        <button
          style={{ marginLeft: "10px" }}
          onClick={() => handleAttendance("HALF_DAY")}
        >
          Mark Present (Half Day)
        </button>
        <button
          style={{ marginLeft: "10px" }}
          onClick={() => handleAttendance("ABSENT")}
        >
          Mark Absent
        </button>
      </div>

      {/* Attendance Summary */}
      <div className="emp-att-third-div" style={{ marginTop: "30px" }}>
        <h3>Monthly Attendance Summary</h3>
        <div className="emp-att-third-fir-div" style={{ marginBottom: "15px" }}>
          <label>
            Select Month:{" "}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {months.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label style={{ marginLeft: "15px" }}>
            Select Year:{" "}
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ width: "100px" }}
            />
          </label>
        </div>

        <ul>
          <li>
            Present Full Day:{" "}
            {monthlyAttendance.filter((a) => a.status === "FULL_DAY").length}
          </li>
          <li>
            Present Half Day:{" "}
            {monthlyAttendance.filter((a) => a.status === "HALF_DAY").length}
          </li>
          <li>
            Absent:{" "}
            {monthlyAttendance.filter((a) => a.status === "ABSENT").length}
          </li>
          <li>
            Leaves:{" "}
            {
              leaveList.filter((l) => {
                const start = new Date(l.startDate);
                return (
                  start.getFullYear() === selectedYear &&
                  start.getMonth() === selectedMonth &&
                  l.status?.toLowerCase() === "approved"
                );
              }).length
            }
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EmpAttendance;
