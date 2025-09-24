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

const ROLE_KEY = "hrms_role";

const App = () => {
  // initialize role from localStorage (so refresh keeps user logged in)
  const initialRole = typeof window !== "undefined" ? localStorage.getItem(ROLE_KEY) || "" : "";
  const [role, setRoleState] = useState(initialRole);

  // wrapper so every change persists to localStorage
  const setRole = (r) => {
    setRoleState(r || "");
    if (r) {
      localStorage.setItem(ROLE_KEY, r);
    } else {
      localStorage.removeItem(ROLE_KEY);
    }
  };

  // Optional: expose logout handler to pass down
  const logout = () => setRole("");

  // If you want to auto-redirect on mount based on role, you could do that here
  useEffect(() => {
    // example: console.log("current role:", role);
  }, [role]);

  return (
    <div>
      <BrowserRouter>
        <ToastContainer />

        {/* Login component should call setRole(...) on success */}
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
              <Route path="/a/att" element={<Attendance />} />
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
