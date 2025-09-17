import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { EmailContext } from "../components/EmailContext";
import './EmpNav.css'

const ATT_API = "http://localhost:8080/api/attendance";
const LEAVE_API = "http://localhost:8080/api/leave";
const EMP_API = "http://localhost:8080/api/employees"

const EmpAttendance = () => {
    const { email } = useContext(EmailContext); // current logged in email
    const [attendanceList, setAttendanceList] = useState([]);
    const [leaveList, setLeaveList] = useState([]);
    const [date, setDate] = useState(new Date());

    const [lea, setLea] = useState([]);
    const [currentlea, setCurrentlea] = useState('');

    useEffect(() => {
        axios.get(EMP_API)
            .then(res => setLea(res.data))
            .catch(err => console.log(err));
    }, []);

    useEffect(() => {

        if (lea.length > 0) {
            const matched = lea.find(lv => lv.email === email);

            console.log(matched);

            if (matched) {
                console.log("Leaves for", matched.email, "=", matched.leaves);
                setCurrentlea(matched.leaves);
            } else {
                console.log("not match");
            }
        }
    }, [lea, email]);





    // ✅ Month-Year filter state
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0=Jan
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // ✅ Fetch attendance + leaves in useEffect
    useEffect(() => {
        if (!email) return;

        const fetchAttendance = () => {
            axios
                .get(`${ATT_API}/${email}`)
                .then((res) => setAttendanceList(res.data))
                .catch((err) => console.log(err));
        };

        const fetchLeaves = () => {
            axios
                .get(LEAVE_API)
                .then((res) => {
                    setLeaveList(res.data.filter((lv) => lv.email === email));
                    //   console.log("leave list ", leaveList);
                })
                .catch((err) => console.log(err));
        };

        fetchAttendance();
        fetchLeaves();
    }, [email]); // ✅ no eslint warning now

    // ✅ Save attendance for selected date
    const handleAttendance = (status) => {
        const formattedDate = date.toISOString().split("T")[0]; // yyyy-mm-dd

        const record = { email, date: formattedDate, attendance: status };

        axios
            .post(ATT_API, record)
            .then(() => {
                toast.success("Attendance saved");

                // refresh attendance only
                axios
                    .get(`${ATT_API}/${email}`)
                    .then((res) => setAttendanceList(res.data))
                    .catch((err) => console.log(err));
            })
            .catch(() => toast.error("Failed to save attendance"));
    };

    // ✅ Normalize date (yyyy-mm-dd) helper
    //   const formatDate = (d) => new Date(d).toISOString().split("T")[0];
    const formatDate = (d) => {
        if (!d) return "";
        const dateObj = new Date(d);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`; // yyyy-mm-dd
    };

    // ✅ Highlight attendance + leave on calendar
    const tileContent = ({ date }) => {
        const formattedDate = formatDate(date);

        const attendance = attendanceList.find((a) => a.date === formattedDate);

        // check if date is in leave range
        // const leave = leaveList.find((l) => {
        //   const start = new Date(l.startDate || l.date);
        //   const end = new Date(l.endDate || l.date);
        //   return date >= start && date <= end;
        // });

        // const monthlyLeaves = leaves.filter(l => {
        //   const d = new Date(l.startDate || l.date);
        //   return d.getFullYear() === selectedYear &&
        //          d.getMonth() === selectedMonth &&
        //          l.response?.toLowerCase() === "yes"; // ✅ only approved
        // });

        // const leaveCount = monthlyLeaves.length;

        // ✅ Leave match (supports both single date & date range)
        const leave = leaveList.find((l) => {
            if (l.response?.toLowerCase() !== "yes") return false;
            if (l.startDate && l.endDate) {
                // leave has a range
                const start = formatDate(l.startDate);
                const end = formatDate(l.endDate);
                return formattedDate >= start && formattedDate <= end;
            } else {
                // single-day leave
                return formatDate(l.date) === formattedDate;
            }
        });

        // console.log(leave);

        return (
            <div style={{ fontSize: "12px", textAlign: "center" }}>
                {/* Attendance Marks */}
                {attendance ? (
                    attendance.attendance === "present_full_day" ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>✔</span>
                    ) : attendance.attendance === "present_half_day" ? (
                        <span style={{ color: "orange", fontWeight: "bold", border: "2px solid orange" }}>½</span>
                    ) : attendance.attendance === "absent" ? (
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
                            backgroundColor: "#ff3030ff", // purple
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

    // ✅ Month options
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
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
                <button onClick={() => handleAttendance("present_full_day")}>
                    Mark Present (Full Day)
                </button>
                <button
                    style={{ marginLeft: "10px" }}
                    onClick={() => handleAttendance("present_half_day")}
                >
                    Mark Present (Half Day)
                </button>
                <button
                    style={{ marginLeft: "10px" }}
                    onClick={() => handleAttendance("absent")}
                >
                    Mark Absent
                </button>
            </div>

            {/* Attendance Summary with Month Filter */}
            <div className="emp-att-third-div" style={{ marginTop: "30px" }}>
                <h3>Monthly Attendance Summary</h3>

                {/* Month & Year Filter */}
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
                        {monthlyAttendance.filter((a) => a.attendance === "present_full_day")
                            .length}
                    </li>
                    <li>
                        Present Half Day:{" "}
                        {monthlyAttendance.filter((a) => a.attendance === "present_half_day")
                            .length}
                    </li>
                    <li>
                        Absent:{" "}
                        {monthlyAttendance.filter((a) => a.attendance === "absent").length}
                    </li>
                    {/* <li>
                        Leaves:{" "}
                        {
                            leaveList.filter((l) => {
                                const start = new Date(l.startDate || l.date);
                                return (
                                    start.getFullYear() === selectedYear &&
                                    start.getMonth() === selectedMonth
                                );
                            }).length
                        }
                    </li> */}
                    {/* <li>Total Leaves: {currentlea}</li> */}
                    <li>
                        Leaves:{" "}
                        {
                            leaveList.filter((l) => {
                                const start = new Date(l.startDate || l.date);
                                return (
                                    start.getFullYear() === selectedYear &&
                                    start.getMonth() === selectedMonth &&
                                    l.response?.toLowerCase() === "yes"   // ✅ only approved leaves
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
