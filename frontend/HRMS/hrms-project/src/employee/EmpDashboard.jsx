// src/employee/EmpDashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { EmailContext } from '../components/EmailContext';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import './EmpNav.css';

const ATT_API = "http://localhost:8080/api/attendance";
const LEAVE_API = "http://localhost:8080/api/leave";
const EMP_BY_EMAIL_API = "http://localhost:8080/api/employees/by-email"; // append /{email}

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

  // Helper: normalize attendance record fields for robust matching
  const normalizeAttendance = (a) => {
    const date =
      a.date ||
      a.attendance_date ||
      a.attendanceDate ||
      a.attendance_date_string ||
      a.attendanceDateString ||
      a.attendance_date_time ||
      null;

    const status =
      a.status ||
      a.attendance ||
      a.state ||
      a.attendanceStatus ||
      null;

    const emailVal =
      (a.user && (a.user.email || a.userEmail)) ||
      a.userEmail ||
      a.email ||
      (typeof a.user === 'string' ? a.user : null);

    return {
      raw: a,
      date,
      status,
      email: emailVal
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!email) return;
      try {
        // fetch all attendance & leave (we will filter on client)
        const [attRes, leaveRes] = await Promise.allSettled([
          axios.get(ATT_API),
          axios.get(LEAVE_API)
        ]);

        const attData = attRes.status === 'fulfilled' ? attRes.value.data : [];
        const leaveData = leaveRes.status === 'fulfilled' ? leaveRes.value.data : [];

        // normalize & filter to this user's email
        const normalized = (attData || []).map(normalizeAttendance);

        const attendanceForUser = normalized.filter(n => {
          const recordEmail = (n.email || '').toString().toLowerCase();
          return recordEmail === (email || '').toString().toLowerCase();
        });

        // filter by month/year
        const monthlyAttendance = attendanceForUser.filter(n => {
          if (!n.date) return false;
          let d;
          try {
            d = new Date(n.date);
            if (isNaN(d)) {
              d = new Date(String(n.date).split('T')[0]);
            }
          } catch (e) {
            return false;
          }
          return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
        });

        // compute counts using normalized status values (case-insensitive)
        const fullDay = monthlyAttendance.filter(a => {
          const s = (a.status || '').toString().toUpperCase();
          return s === 'FULL_DAY' || s === 'PRESENT_FULL_DAY' || s === 'PRESENT_FULL' || s === 'PRESENT_FULLDAY';
        }).length;

        const halfDay = monthlyAttendance.filter(a => {
          const s = (a.status || '').toString().toUpperCase();
          return s === 'HALF_DAY' || s === 'PRESENT_HALF_DAY' || s === 'PRESENT_HALF';
        }).length;

        const absent = monthlyAttendance.filter(a => {
          const s = (a.status || '').toString().toUpperCase();
          return s === 'ABSENT' || s === 'A' || s === 'ABS';
        }).length;

        // normalize leaves: check response/approved flag
        const normalizedLeaves = (leaveData || []).map(l => {
          return {
            raw: l,
            date: l.date || l.startDate || l.start_date || null,
            response: (l.response || l.status || l.approved || '').toString()
          };
        });

        const monthlyLeaves = normalizedLeaves.filter(l => {
          if (!l.date) return false;
          const d = new Date(l.date);
          if (isNaN(d)) return false;
          return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth &&
                 (String(l.response || '').toLowerCase() === 'yes' || String(l.response || '').toLowerCase() === 'approved' || String(l.response || '').toLowerCase() === 'true');
        });

        const leaveCount = monthlyLeaves.length;

        setTotals({
          fullDay,
          halfDay,
          absent,
          leaves: leaveCount
        });

      } catch (err) {
        console.error('[EmpDashboard] Error fetch attendance/leave', err);
      }
    };

    fetchData();
  }, [email, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!email) return;
    // fetch employee by email (backend may return array or object)
    axios.get(`${EMP_BY_EMAIL_API}/${encodeURIComponent(email)}`)
      .then(res => {
        let emp = res.data;
        if (Array.isArray(emp)) {
          emp = emp.length ? emp[0] : null;
        }
        if (!emp) {
          setEmployee(null);
        } else {
          setEmployee(emp);
        }
      })
      .catch(err => {
        console.warn('[EmpDashboard] Failed to fetch employee by email', err?.response?.status, err?.response?.data);
        setEmployee(null);
      });
  }, [email]);

  const handleDownloadReceipt = () => {
    // If employee object missing, create a lightweight fallback using email + defaults,
    // so PDF generation still works for users who have attendance/leave but no employee row.
    const emp = employee || {
      email: email || '',
      firstName: '',
      lastName: '',
      fullName: email || '',
      phone: '',
      address: '',
      gender: '',
      hireDate: '',
      salary: 0,
      user: { email: email || '' }
    };

    const { fullDay, halfDay, leaves } = totals;
    const fullDaySalary = fullDay * 500;
    const halfDaySalary = halfDay * 250;
    const leaveSalary = leaves <= 30 ? leaves * 500 : 0;
    const totalSalary = fullDaySalary + halfDaySalary + leaveSalary;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Salary Receipt", 70, 20);

    doc.setFontSize(12);

    const displayName = emp.fullName || (emp.firstName ? `${emp.firstName} ${emp.lastName || ''}` : emp.email || emp.user?.email || '');

    doc.text(`Full Name: ${displayName}`, 20, 40);
    doc.text(`Email: ${emp.email || emp.user?.email || ''}`, 20, 50);
    doc.text(`Phone: ${emp.phone || ''}`, 20, 60);
    doc.text(`Address: ${emp.address || ''}`, 20, 70);
    doc.text(`Gender: ${emp.gender || ''}`, 20, 80);
    doc.text(`Hire Date: ${emp.hireDate || ''}`, 20, 90);

    doc.text(`Month: ${selectedMonth + 1}/${selectedYear}`, 20, 100);

    doc.text(`Full Day Present: ${fullDay} × 500 = ${fullDaySalary}`, 20, 110);
    doc.text(`Half Day Present: ${halfDay} × 250 = ${halfDaySalary}`, 20, 120);
    doc.text(`Leaves: ${leaves} × 500 = ${leaveSalary}`, 20, 130);

    doc.setFontSize(14);
    doc.text(`Total Salary: ${totalSalary}`, 20, 150);

    doc.line(20, 155, 190, 155);
    doc.setFontSize(12);
    doc.text("This is a system-generated salary receipt.", 20, 165);

    const fileNameSafe = (displayName || 'employee').replace(/[^a-z0-9_\-]/gi, '_');
    doc.save(`SalaryReceipt_${fileNameSafe}_${selectedMonth + 1}_${selectedYear}.pdf`);
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
          <p>Email: {employee.email || employee.user?.email}</p>
          <p>Address: {employee.address || '—'}</p>
          <p>Salary: {employee.salary || '—'}</p>
          <p>Full Name: {employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`}</p>
          <p>Gender: {employee.gender || ''}</p>
          <p>Hire Date: {employee.hireDate || ''}</p>
          <p>Phone: {employee.phone || ''}</p>
        </div>
      ) : (
        <p>No employee profile found for this user.</p>
      )}

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

      <button className='emp-dash-thied-div-sal-rec-btn' onClick={handleDownloadReceipt}>
        Salary Receipt
      </button>
    </div>
  );
};

export default EmpDashboard;
