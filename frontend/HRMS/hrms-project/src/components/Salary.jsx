import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";

const EMP_API = "http://localhost:8080/api/employees";
const ATT_API = "http://localhost:8080/api/attendance";
const LEAVE_API = "http://localhost:8080/api/leave";
const UPDATE_API = "http://localhost:8080/api/employees/update-salary";

const Salary = () => {
  const [summary, setSummary] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leave, setLeave] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [newSalary, setNewSalary] = useState("");

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // Month-Year state for each employee
  const [selectedDates, setSelectedDates] = useState({}); // { email: { month, year } }

  useEffect(() => {
    axios.get(EMP_API).then((res) => setEmployees(res.data)).catch(console.log);
    axios.get(ATT_API).then((res) => setAttendance(res.data)).catch(console.log);
    axios.get(LEAVE_API).then((res) => setLeave(res.data)).catch(console.log);
  }, []);

  useEffect(() => {
    calculateSummary(employees, attendance, leave);
  }, [employees, attendance, leave]);

  const calculateSummary = (employees, attendance, leave) => {
    const grouped = {};

    employees.forEach((emp) => {
      const email = emp.email?.trim().toLowerCase();
      grouped[email] = {
        email: emp.email,
        fullDay: 0,
        halfDay: 0,
        absent: 0,
        leave: 0,
        salary: emp.salary || 0,
      };
    });

    attendance.forEach((dt) => {
      const email = dt.email?.trim().toLowerCase();
      if (!grouped[email]) return;
      const status = dt.attendance;
      if (status === "present_full_day") grouped[email].fullDay++;
      else if (status === "present_half_day") grouped[email].halfDay++;
      else if (status === "absent") grouped[email].absent++;
    });

    leave.forEach((lv) => {
      const email = lv.email?.trim().toLowerCase();
      const approved = lv.response?.toLowerCase() === "yes";
      if (approved && grouped[email]) {
        grouped[email].leave += lv.days ? lv.days : 1;
      }
    });

    setSummary(Object.values(grouped));
  };

  const handleSaveSalary = async (email) => {
    try {
      const res = await axios.put(UPDATE_API, {
        email: email,
        salary: parseFloat(newSalary),
      });
      setSummary((prev) =>
        prev.map((row) =>
          row.email === email ? { ...row, salary: res.data.salary } : row
        )
      );
      setEditRow(null);
      setNewSalary("");
    } catch (err) {
      console.error("Error updating salary:", err);
    }
  };

  const handleDownload = (row) => {
    const email = row.email;
    const employee = employees.find(
      (emp) => emp.email.toLowerCase() === email.toLowerCase()
    );

    const { month = new Date().getMonth(), year = new Date().getFullYear() } =
      selectedDates[email] || {};

    // Filter employee attendance and leave by month/year
    const empAttendance = attendance.filter(
      (a) =>
        a.email.toLowerCase() === email.toLowerCase() &&
        new Date(a.date).getFullYear() === year &&
        new Date(a.date).getMonth() === month
    );
    const empLeave = leave.filter(
      (l) =>
        l.email.toLowerCase() === email.toLowerCase() &&
        new Date(l.startDate || l.date).getFullYear() === year &&
        new Date(l.startDate || l.date).getMonth() === month
    );

    const fullDay = empAttendance.filter((a) => a.attendance === "present_full_day").length;
    const halfDay = empAttendance.filter((a) => a.attendance === "present_half_day").length;
    const leaveCount = empLeave.length;
    const fullDaySalary = fullDay * 500;
    const halfDaySalary = halfDay * 250;
    // const leaveSalary = leaveCount > 0 ? leaveCount * 500 : 0;
    const leaveSalary = leaveCount <= 30 ? leaveCount * 500 : 0;
    const totalSalary = fullDaySalary + halfDaySalary + leaveSalary;

    // ---- Generate PDF ----
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Salary Receipt", 80, 20);

    doc.setFontSize(12);
    doc.text(`Full Name: ${employee?.fullName || ""}`, 20, 40);
    doc.text(`Email: ${employee?.email || ""}`, 20, 50);
    doc.text(`Phone: ${employee?.phone || ""}`, 20, 60);
    doc.text(`Address: ${employee?.address || ""}`, 20, 70);
    doc.text(`Gender: ${employee?.gender || ""}`, 20, 80);
    doc.text(`Hire Date: ${employee?.hireDate || ""}`, 20, 90);
    doc.text(`Month: ${months[month]} / ${year}`, 20, 100);

    doc.text(`Full Day Present: ${fullDay} × 500 = ${fullDaySalary}`, 20, 120);
    doc.text(`Half Day Present: ${halfDay} × 250 = ${halfDaySalary}`, 20, 130);
    doc.text(`Leaves: ${leaveCount} × 500 = ${leaveSalary}`, 20, 140);

    doc.setFontSize(14);
    doc.text(`Total Salary: ${totalSalary}`, 20, 160);

    doc.setFontSize(10);
    doc.text("This is a system-generated salary receipt.", 20, 180);

    doc.save(`SalaryReceipt_${employee?.fullName || email}_${month + 1}_${year}.pdf`);
  };

  return (
    <div className="salary-container">
      <h2>Attendance Summary Report</h2>
      <table className="salary-table" border="1" style={{ marginTop: "20px", width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Full Day Present</th>
            <th>Half Day Present</th>
            <th>Absent</th>
            <th>Leave</th>
            <th>Total Days</th>
            <th>Salary</th>
            <th>Change Salary</th>
            <th>Pay Slip</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((row, i) => {
            const { month = new Date().getMonth(), year = new Date().getFullYear() } =
              selectedDates[row.email] || {};
            return (
              <tr key={i}>
                <td>{row.email}</td>
                <td>{row.fullDay}</td>
                <td>{row.halfDay}</td>
                <td>{row.absent}</td>
                <td>{row.leave}</td>
                <td>{row.fullDay + row.halfDay + row.absent + row.leave}</td>
                <td>
                  {editRow === row.email ? (
                    <input
                      type="number"
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                    />
                  ) : (
                    row.salary
                  )}
                </td>
                <td>
                  {editRow === row.email ? (
                    <button onClick={() => handleSaveSalary(row.email)}>Save</button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditRow(row.email);
                        setNewSalary(row.salary);
                      }}
                    >
                      Change
                    </button>
                  )}
                </td>
                <td>
                  <select
                    value={month}
                    onChange={(e) =>
                      setSelectedDates((prev) => ({
                        ...prev,
                        [row.email]: { month: Number(e.target.value), year },
                      }))
                    }
                  >
                    {months.map((m, idx) => (
                      <option key={idx} value={idx}>{m}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) =>
                      setSelectedDates((prev) => ({
                        ...prev,
                        [row.email]: { month, year: Number(e.target.value) },
                      }))
                    }
                    style={{ width: "80px", marginLeft: "5px" }}
                  />
                  <button onClick={() => handleDownload(row)} style={{ marginLeft: "5px" }}>
                    Download
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Salary;
