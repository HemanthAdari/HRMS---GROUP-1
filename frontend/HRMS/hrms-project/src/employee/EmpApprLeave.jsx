// src/employee/EmpApprLeave.jsx
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { EmailContext } from '../components/EmailContext';
import './EmpNav.css'

const API = 'http://localhost:8080/api/leave';
const EMP_LEAV_API = "http://localhost:8080/api/employees/t-leaves";

function normalizeLeave(raw, index) {
  const originalId = raw.leaveId ?? raw.leave_id ?? raw.id;
  const srNo = raw.srNo ?? raw.sr_no ?? (originalId ? originalId : index + 1);
  const email = raw.email ?? raw.user?.email ?? "";
  const dateStr = raw.date ?? raw.startDate ?? raw.start_date;
  const date = dateStr ? dateStr.toString().slice(0, 10) : "";
  let response = raw.response ?? null;
  if (!response && raw.status) {
    const s = String(raw.status).toUpperCase();
    if (s === "APPROVED") response = "Yes";
    else if (s === "REJECTED") response = "No";
    else response = null;
  }
  return { originalId, srNo, email, date, response, raw };
}

const EmpApprLeave = () => {
  const { email } = useContext(EmailContext);
  const [leave, setLeave] = useState([]);

  useEffect(() => {
    axios.get(API)
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : [];
        setLeave(arr.map((r, i) => normalizeLeave(r, i)));
      })
      .catch(err => console.log(err));
  }, []);

  const filteredLeaves = leave.filter(lv => (lv.email || "").toLowerCase() === (email || "").toLowerCase());
  const approvedLeaves = filteredLeaves.filter(lv => lv.response && lv.response.toLowerCase() === "yes").length;

  useEffect(() => {
    if (email) {
      axios.put(EMP_LEAV_API, { email, leaves: approvedLeaves })
        .then(() => console.log("Employee leave count updated"))
        .catch(err => console.log(err));
    }
  }, [email, approvedLeaves]);

  return (
    <div className='emp-apr-leave-first-div'>
      <h1>list of leaves</h1>
      <h2>Total Approved Leaves: {approvedLeaves}</h2>
      <table className='emp-apr-leave-first-div-table' border="1" style={{ width: "80%", margin: "0 auto" }}>
        <thead>
          <tr>
            <th>Sr no</th>
            <th>Email</th>
            <th>Leave date</th>
            <th>Mark</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeaves.length > 0 ? (
            filteredLeaves.map((lv, i) => (
              <tr key={lv.originalId ?? i}>
                <td>{lv.srNo}</td>
                <td>{lv.email}</td>
                <td>{lv.date}</td>
                <td>{lv.response || <span style={{ color: "red" }}>pending</span>}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" style={{ textAlign: "center" }}>No leave records found for {email}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default EmpApprLeave;
