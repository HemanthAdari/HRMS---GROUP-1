import React, { useContext, useEffect, useState } from 'react';
import { EmailContext } from './EmailContext';
import axios from 'axios';
import './Dashboard.css';
import Clock from "react-clock";
import './Employee.css';
import "react-clock/dist/Clock.css";
import hrms_logo from '../assets/hrms_logo.png';
import { Link, useNavigate } from 'react-router-dom';

const EMP_API = "http://localhost:8080/api/employees";
const ATT_API = "http://localhost:8080/api/attendance";
const LEAVE_API = "http://localhost:8080/api/leave";
const APPLY_JOB_API = "http://localhost:8080/api/apply-job";

const Dashboard = () => {
  const { email } = useContext(EmailContext);
  const [employee, setEmployee] = useState(null);
  const [value, setValue] = useState(new Date());
  const [visibleFields, setVisibleFields] = useState({});
  const navigate = useNavigate();

  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalAttendance, setTotalAttendance] = useState(0);
  const [totalLeaves, setTotalLeaves] = useState(0);
  const [totalPendingLeaves, setTotalPendingLeaves] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    axios.get(EMP_API).then((res) => {
      setTotalEmployees(Array.isArray(res.data) ? res.data.length : 0);
    }).catch(err => console.warn('EMP_API error', err));

    axios.get(ATT_API).then((res) => {
      console.log('[Dashboard] attendance raw sample:', (res.data || []).slice(0,6));
      const today = new Date().toISOString().split("T")[0];
      const presentCount = (res.data || []).filter(a => {
        // accept multiple possible field names
        const date = a.date || a.attendance_date || a.attendanceDate;
        const status = (a.status || a.attendance || '').toString().toUpperCase();
        if (!date) return false;
        const d = (new Date(date)).toISOString().split('T')[0];
        return d === today && (status === 'FULL_DAY' || status === 'HALF_DAY' || status.includes('PRESENT'));
      }).length;
      setTotalAttendance(presentCount);
    }).catch(err => {
      console.warn('ATT_API error', err);
      setTotalAttendance(0);
    });

    axios.get(LEAVE_API).then((res) => {
      const leaveCount = (res.data || []).filter((l) => l.response === null).length;
      setTotalPendingLeaves(leaveCount);
    }).catch(err => console.warn('LEAVE_API error', err));

    axios.get(LEAVE_API).then((res) => {
      const today = new Date().toISOString().split("T")[0];
      const leaveCount = (res.data || []).filter(l => {
        const date = l.date || l.startDate || l.start_date;
        if (!date) return false;
        const d = (new Date(date)).toISOString().split('T')[0];
        return d === today && (String(l.response).toLowerCase() === "yes" || String(l.response).toLowerCase() === "approved");
      }).length;
      setTotalLeaves(leaveCount);
    }).catch(err => console.warn('LEAVE_API error', err));

    axios.get(APPLY_JOB_API).then((res) => setTotalJobs(Array.isArray(res.data) ? res.data.length : 0))
      .catch(err => console.warn('APPLY_JOB_API error', err));
  }, []);

  const toggleField = (field) => {
    setVisibleFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    if (!email) return;
    axios.get(`http://localhost:8080/api/employees/by-email/${encodeURIComponent(email)}`)
      .then((res) => {
        console.log('[Dashboard] /employees/by-email:', res.data);
        let emp = res.data;
        if (Array.isArray(emp)) emp = emp.length ? emp[0] : null;
        setEmployee(emp);
      })
      .catch(err => {
        console.warn('[Dashboard] fetch employee by email failed', err?.response?.status, err?.response?.data);
        setEmployee(null);
      });
  }, [email]);

  useEffect(() => {
    const timer = setInterval(() => setValue(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (employee === null) {
    // show message instead of spinner so user can still interact with other parts
    return (
      <div className='aMainDashboard'>
        <div className='aFirDashboard'>
          <div style={{ margin: "20px auto", textAlign: "center", marginTop: "50px" }}>
            <Clock value={value} size={150} renderNumbers={true} />
          </div>
          <img src={hrms_logo} alt="" />
        </div>
        <div className='aDashboard'>
          <h2>Welcome, <span className="highlight-email">{email}</span> dashboard</h2>
          <p>No employee profile found for this user.</p>
          {/* keep the rest of UI (counts etc) visible */}
          <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Dashboard</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginTop: "20px" }}>
              <div style={{ border: "1px solid #ddd", padding: "20px" }}>
                <h3>Total Employees</h3><p>{totalEmployees}</p>
              </div>
              <div style={{ border: "1px solid #ddd", padding: "20px" }}>
                <h3>Attendance (Today)</h3><p>{totalAttendance}</p>
              </div>
              <div style={{ border: "1px solid #ddd", padding: "20px" }}>
                <h3>Total pending leave</h3><p>{totalPendingLeaves}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const emp = employee; // emp object

  const boxStyle = {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0px 20px 5px rgba(0,0,0,0.1)",
    fontSize: "18px",
  };

  return (
    <div className='aMainDashboard'>
      <div className='aFirDashboard'>
        <div style={{ margin: "20px auto", textAlign: "center", marginTop: "50px" }}>
          <Clock value={value} size={150} renderNumbers={true} />
        </div>
        <img src={hrms_logo} alt="" />
      </div>

      <div className='aDashboard'>
        <h2>
          Welcome, <span className="highlight-email">{email}</span> dashboard
        </h2>

        <div className='aDashboard-add-new-emp'>
          <h1>Add new employee</h1>
          <Link to="/a/dash/regi"><button>Register</button></Link>
        </div>

        <div style={{ textAlign: "center", padding: "20px" }}>
          <h1>Dashboard</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginTop: "20px" }}>
            <div style={boxStyle}>
              <h3>Total Employees</h3>
              <p>{totalEmployees}</p>
            </div>

            <div style={boxStyle}>
              <h3>Attendance (Today)</h3>
              <p>{totalAttendance}</p>
            </div>

            <div style={boxStyle}>
              <h3>Total pending leave</h3>
              <p>{totalPendingLeaves}</p>
            </div>
          </div>
        </div>

        <div className='aDashboardDiv'>
          <p onClick={() => toggleField("email")}><b>Email :</b> {visibleFields.email ? (emp.email || emp.user?.email) : "****** (click to view)"}</p>
          <p onClick={() => toggleField("address")}><b>Address :</b> {visibleFields.address ? emp.address : "****** (click to view)"}</p>
          <p onClick={() => toggleField("salary")}><b>Salary :</b> {visibleFields.salary ? emp.salary : "****** (click to view)"}</p>
          <p onClick={() => toggleField("fullName")}><b>Full Name :</b> {visibleFields.fullName ? (emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`) : "****** (click to view)"}</p>
          <p onClick={() => toggleField("phone")}><b>Phone :</b> {visibleFields.phone ? emp.phone : "****** (click to view)"}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
