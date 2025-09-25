// src/App.jsx
import React, { useState, useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from './components/Login'
import NavBar from './components/NavBar'
import Dashboard from './components/Dashboard'
import Employees from './components/Employees'
import Attendance from './components/Attendance'
import Salary from './components/Salary'
import HrAttendance from './components/HrAttendance';

import EmpNav from './employee/EmpNav'
import EmpDashboard from './employee/EmpDashboard'
import EmpAttendance from './employee/EmpAttendance'
import EmpLeave from './employee/EmpLeave'
import EmpApprLeave from './employee/EmpApprLeave'
import RequestLeave from './components/RequestLeave';
import ApproveLeave from './components/ApproveLeave';
import Register from './components/Register';
import UpdateEmployee from './components/UpdateEmployee';
import AddJobPosition from './components/AddJobPosition';
import GetAllJob from './job/GetAllJob';
import GetSingleJob from './job/GetSingleJob';
import ApplyJobForm from './components/ApplyJobForm';
import ApplyJobsPositionEmp from './components/ApplyJobsPositionEmp';
import HrPendingUsers from './components/HrPendingUsers';

const App = () => {
  // 🚨 Clear session every time the app mounts → force login screen
  useEffect(() => {
    localStorage.clear();
  }, []);

  // role is set by Login via setRole("hr"|"emp"|"admin")
  const [role, setRoleState] = useState("");

  const setRole = (r) => {
    setRoleState(r || "");
  };

  const logout = () => {
    // clear on logout as well, then go to login
    localStorage.clear();
    setRole("");
  };

  return (
    <div>
      <BrowserRouter>
        <ToastContainer />

        {/* Always show Login first if no role */}
        {!role && <Login setRole={setRole} />}

        {role === "hr" && (
          <>
            <NavBar logout={logout} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path='/a/dash/regi' element={<Register/>}/>
              <Route path='/a/dash/add-job' element={<AddJobPosition/>}/>
              <Route path='/a/dash/get-all-job' element={<GetAllJob/>}/>
              <Route path='/a/dash/get-single-job' element={<GetSingleJob/>}/>
              <Route path='/a/dash/apply-jobs' element={<ApplyJobsPositionEmp/>}/>
              <Route path="/a/emp" element={<Employees />} />
              <Route path='/a/emp/update' element={<UpdateEmployee/>}/>
              {/* HR attendance view */}
              <Route path="/a/att" element={<HrAttendance />} />
              <Route path="/a/leave/request" element={<RequestLeave />} />
              <Route path="/a/leave/approved" element={<ApproveLeave />} />
              <Route path="/a/sal" element={<Salary />} />
              <Route path="/a/pending-users" element={<HrPendingUsers />} />
            </Routes>
          </>
        )}

        {role === "emp" && (
          <>
            <EmpNav logout={logout} />
            <Routes>
              <Route path="/" element={<Navigate to="/e/dash" replace />} />
              <Route path="/e/dash" element={<EmpDashboard />} />
              <Route path="/e/att" element={<EmpAttendance />} />
              <Route path="/e/lea" element={<EmpLeave />} />
              <Route path="/e/ale" element={<EmpApprLeave />} />
            </Routes>
          </>
        )}
      </BrowserRouter>
    </div>
  )
}

export default App
