import React, { useContext, useEffect, useState } from 'react'
import { EmailContext } from './EmailContext';
import axios from 'axios';
import './Dashboard.css'
import Clock from "react-clock";
import './Employee.css';
import "react-clock/dist/Clock.css";
import hrms_logo from '../assets/hrms_logo.png'
import { Link, useNavigate } from 'react-router-dom';

const API = 'http://localhost:8080/api/employees/{email}';

const EMP_API = "http://localhost:8080/api/employees";
const ATT_API = "http://localhost:8080/api/attendance";
const LEAVE_API = "http://localhost:8080/api/leave";
const APPLY_JOB_API = "http://localhost:8080/api/apply-job";

const Dashboard = () => {
  const { email } = useContext(EmailContext);
  const [employee, setEmployee] = useState('');
  const [value, setValue] = useState(new Date());

  const [visibleFields, setVisibleFields] = useState({});


  const navigate = useNavigate();
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalAttendance, setTotalAttendance] = useState(0);
  const [totalLeaves, setTotalLeaves] = useState(0);
  const [totalPendingLeaves, setTotalPendingLeaves] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);

  const boxStyle = {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0px 20px 5px rgba(0,0,0,0.1)",
    fontSize: "18px",
  };

  useEffect(() => {
    // 1. Employees
    axios.get(EMP_API).then((res) => setTotalEmployees(res.data.length));

    // 2. Attendance (today)
    axios.get(ATT_API).then((res) => {
      const today = new Date().toISOString().split("T")[0]; // e.g. "2025-09-13"
      const presentCount = res.data.filter(
        (a) => a.date === today && a.attendance === "present_full_day"
      ).length;
      setTotalAttendance(presentCount);
    });

    // 3. Pending Leaves
    axios.get(LEAVE_API).then((res) => {
      const leaveCount = res.data.filter((l) => l.response === null).length;

      setTotalPendingLeaves(leaveCount);
    });

    // 3. Leaves
    axios.get(LEAVE_API).then((res) => {
      console.log("Leaves API:", res.data);

      const today = new Date().toISOString().split("T")[0]; // e.g. "2025-09-13"

      const leaveCount = res.data.filter(
        (l) =>
          l.date === today &&
          (l.response === "yes" || l.response === "Yes")
      ).length;

      setTotalLeaves(leaveCount);
    });


    // 4. Job Applications
    axios.get(APPLY_JOB_API).then((res) => setTotalJobs(res.data.length));
  }, []);

  const toggleField = (field) => {
    setVisibleFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  useEffect(() => {
    axios.get(`http://localhost:8080/api/employees/${email}`)
      .then(res => setEmployee(res.data))
      .catch(err => console.log(err));
  }, [])

  // ✅ Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setValue(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!employee) {
    return <p>Loading employee details...</p>;
  }

  const emp = employee[0]; // since you're using employee[0]

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
          {/* <label htmlFor="">Add new employee</label> */}
          <Link to="/a/dash/regi" ><button>Register</button></Link>
        </div>
        <div className='aDashboard-add-new-job'>
          <h1>Add new job position</h1>
          <Link to="/a/dash/add-job" ><button>Add</button></Link>
          <Link to="/a/dash/get-all-job" ><button>get all</button></Link>
          <Link to="/a/dash/get-single-job" ><button>search</button></Link>
          <Link to="/a/dash/get-single-job" ><button>update</button></Link>
          <Link to="/a/dash/get-single-job" ><button>delete</button></Link>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginTop: "20px" }}>
            <div style={boxStyle}>
              <h3>Leaves (Today)</h3>
              <p>{totalLeaves}</p>
            </div>

            <div style={boxStyle}>
              <h3>Job Applications</h3>
              <p>{totalJobs}</p>
              {/* <button
                onClick={() => navigate("/a/dash/apply-jobs")}
                style={{ marginTop: "10px", padding: "5px 10px", cursor: "pointer", background:"greenyellow", borderRadius:"10px"}}
              >
                See All
              </button> */}
            </div>
          </div>
          <div style={{marginTop:"20px"}}>
          <button
                onClick={() => navigate("/a/dash/apply-jobs")}
                style={{ marginTop: "10px", padding: "5px 10px", cursor: "pointer", background:"greenyellow", borderRadius:"10px"}}
              >
                See All Job Applications
              </button>
              </div>
        </div>









        {employee ? (
          <div className='aDashboardDiv'>
            <p onClick={() => toggleField("email")}>
              <b>Email :</b>{" "}
              {visibleFields.email ? emp.email : "****** (click to view)"}
            </p>
            <p onClick={() => toggleField("address")}>
              <b>Address :</b>{" "}
              {visibleFields.address ? emp.address : "****** (click to view)"}
            </p>
            <p onClick={() => toggleField("salary")}>
              <b>Salary :</b>{" "}
              {visibleFields.salary ? emp.salary : "****** (click to view)"}
            </p>
            <p onClick={() => toggleField("fullName")}>
              <b>Full Name :</b>{" "}
              {visibleFields.fullName ? emp.fullName : "****** (click to view)"}
            </p>
            <p onClick={() => toggleField("gender")}>
              <b>Gender :</b>{" "}
              {visibleFields.gender ? emp.gender : "****** (click to view)"}
            </p>
            <p onClick={() => toggleField("hireDate")}>
              <b>Hire Date :</b>{" "}
              {visibleFields.hireDate ? emp.hireDate : "****** (click to view)"}
            </p>
            <p onClick={() => toggleField("password")}>
              <b>Password :</b>{" "}
              {visibleFields.password ? emp.password : "****** (click to view)"}
            </p>
            <p onClick={() => toggleField("phone")}>
              <b>Phone :</b>{" "}
              {visibleFields.phone ? emp.phone : "****** (click to view)"}
            </p>
          </div>
        ) : (
          <p>Loading employee details...</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
