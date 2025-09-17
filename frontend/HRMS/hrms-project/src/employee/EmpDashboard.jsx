import React, { useContext, useEffect, useState } from 'react';
import { EmailContext } from '../components/EmailContext';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import './EmpNav.css'

const ATT_API = "http://localhost:8080/api/attendance";
const LEAVE_API = "http://localhost:8080/api/leave";

const EmpDashboard = () => {
  const { email } = useContext(EmailContext);
  const [employee, setEmployee] = useState(null);

  const [totals, setTotals] = useState({
    fullDay: 0,
    halfDay: 0,
    absent: 0,
    leaves: 0
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, leaveRes] = await Promise.all([
          axios.get(ATT_API),
          axios.get(LEAVE_API)
        ]);

        const attendance = attRes.data.filter(a => a.email === email);
        const leaves = leaveRes.data.filter(l => l.email === email);

        const monthlyAttendance = attendance.filter(a => {
          const d = new Date(a.date);
          return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
        });

        const monthlyLeaves = leaves.filter(l => {
          const d = new Date(l.startDate || l.date);
          return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth &&
                                    l.response?.toLowerCase() === "yes";
        });

        const fullDay = monthlyAttendance.filter(a => a.attendance === "present_full_day").length;
        const halfDay = monthlyAttendance.filter(a => a.attendance === "present_half_day").length;
        const absent = monthlyAttendance.filter(a => a.attendance === "absent").length;
        const leaveCount = monthlyLeaves.length;

        setTotals({ fullDay, halfDay, absent, leaves: leaveCount });
      } catch (err) {
        console.log(err);
      }
    };

    if (email) fetchData();
  }, [email, selectedMonth, selectedYear]);

  useEffect(() => {
    if (email) {
      axios
        .get(`http://localhost:8080/api/employees/${email}`)
        .then((res) => setEmployee(res.data[0]))
        .catch((err) => console.log(err));
    }
  }, [email]);

  const handleDownloadReceipt = () => {
    if (!employee) return;

    const { fullDay, halfDay, leaves } = totals;
    const fullDaySalary = fullDay * 500;
    const halfDaySalary = halfDay * 250;
    // const leaveSalary = leaves > 0 ? leaves * 500 : 0;
    const leaveSalary = leaves <= 30 ? leaves * 500 : 0;
    const totalSalary = fullDaySalary + halfDaySalary + leaveSalary;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Salary Receipt", 70, 20);

    doc.setFontSize(12);
    doc.text(`Full Name: ${employee.fullName}`, 20, 40);
    doc.text(`Email: ${employee.email}`, 20, 50);
    doc.text(`Phone: ${employee.phone}`, 20, 60);
    doc.text(`Address: ${employee.address}`, 20, 70);
    doc.text(`Gender: ${employee.gender}`, 20, 80);
    doc.text(`Hire Date: ${employee.hireDate}`, 20, 90);

    doc.text(`Month: ${selectedMonth + 1}/${selectedYear}`, 20, 100);

    doc.text(`Full Day Present: ${fullDay} × 500 = ${fullDaySalary}`, 20, 110);
    doc.text(`Half Day Present: ${halfDay} × 250 = ${halfDaySalary}`, 20, 120);
    doc.text(`Leaves: ${leaves} × 500 = ${leaveSalary}`, 20, 130);

    doc.setFontSize(14);
    doc.text(`Total Salary: ${totalSalary}`, 20, 150);

    doc.line(20, 155, 190, 155);
    doc.setFontSize(12);
    doc.text("This is a system-generated salary receipt.", 20, 165);

    doc.save(`SalaryReceipt_${employee.fullName}_${selectedMonth + 1}_${selectedYear}.pdf`);
  };

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  return (
    <div className='emp-dash-first-div'>
      <h2>Welcome, {email} Dashboard</h2>

      {employee ? (
        <div className='emp-dash-second-div'>
          <p>Email: {employee.email}</p>
          <p>Address: {employee.address}</p>
          <p>Salary: {employee.salary}</p>
          <p>Full Name: {employee.fullName}</p>
          <p>Gender: {employee.gender}</p>
          <p>Hire Date: {employee.hireDate}</p>
          <p>Phone: {employee.phone}</p>
        </div>
      ) : (
        <p>Loading employee details...</p>
      )}

      {/* Month-Year Filter */}
      <div className='emp-dash-third-div' style={{ marginTop: "20px", padding: "20px" }}>
        <h3>Monthly Attendance Summary</h3>
        <label>
          Month: 
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
            {months.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
          </select>
        </label>
        <label style={{ marginLeft: "15px" }}>
          Year: 
          <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ width: "100px" }} />
        </label>

        <ul style={{ marginTop: "10px" }}>
          <li>Full Day Present: {totals.fullDay}</li>
          <li>Half Day Present: {totals.halfDay}</li>
          <li>Absent: {totals.absent}</li>
          <li>Leaves: {totals.leaves}</li>
        </ul>
      </div>

      <button className='emp-dash-thied-div-sal-rec-btn' onClick={handleDownloadReceipt}>Salary Receipt</button>
    </div>
  );
};

export default EmpDashboard;
