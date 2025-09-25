// src/components/RequestLeave.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import './Menu.css'

const API = 'http://localhost:8080/api/leave';
const EMP_LEAV_API = "http://localhost:8080/api/employees/t-leaves";

function normalizeLeave(raw, index) {
  // raw may be { srNo, email, date, response, ... }
  // or { leaveId, user:{email}, startDate, endDate, status, ... }
  const originalId = raw.leaveId ?? raw.leave_id ?? raw.id ?? raw.leaveId ?? raw.leaveId;
  const srNo = raw.srNo ?? raw.sr_no ?? (originalId ? originalId : index + 1);
  const email = raw.email ?? raw.user?.email ?? raw.userEmail ?? "";
  // pick date: prefer single date, else startDate
  const dateStr = raw.date ?? raw.startDate ?? raw.start_date ?? raw.startDate;
  // if it's a long ISO + time, truncate to yyyy-mm-dd
  const date = dateStr ? dateStr.toString().slice(0, 10) : "";
  // map response/status
  let response = raw.response ?? null;
  if (!response && raw.status) {
    const s = String(raw.status).toUpperCase();
    if (s === "APPROVED") response = "Yes";
    else if (s === "REJECTED") response = "No";
    else response = null; // pending
  }
  // some backends return 'PENDING' or null
  return {
    originalId, // used for PUT endpoint
    srNo,
    email,
    date,
    response,
    raw
  };
}

const RequestLeave = () => {
  const [leave, setLeave] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = () => {
    axios.get(API)
      .then(res => {
        // Normalize all items
        const arr = Array.isArray(res.data) ? res.data : [];
        const norm = arr.map((r, i) => normalizeLeave(r, i));
        setLeave(norm);
      })
      .catch(err => {
        console.error("Failed to load leaves", err);
        toast.error("Unable to load leave requests");
      });
  };

  // Keep employee table summary in sync (approved counts)
  useEffect(() => {
    if (leave.length === 0) return;
    const allEmails = [...new Set(leave.map(lv => lv.email).filter(Boolean))];
    const approvedCount = {};
    leave.forEach(lv => {
      if (lv.response && lv.response.toLowerCase() === "yes") {
        approvedCount[lv.email] = (approvedCount[lv.email] || 0) + 1;
      }
    });
    allEmails.forEach(email => {
      const count = approvedCount[email] || 0;
      axios.put(EMP_LEAV_API, { email, leaves: count })
        .then(() => console.log(`Updated ${email} -> ${count}`))
        .catch(err => console.error("Error updating employee leaves:", err));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leave]);

  const handleResponse = (srNo, email, response) => {
    // find item by srNo (or fallback by email+date)
    const idx = leave.findIndex(l => String(l.srNo) === String(srNo) && l.email === email);
    if (idx === -1) {
      console.warn("leave row not found for", srNo, email);
      toast.error("Record not found");
      return;
    }

    const item = leave[idx];
    const id = item.originalId ?? item.raw?.leaveId ?? item.raw?.leave_id;

    // optimistic UI update
    const updated = [...leave];
    updated[idx] = { ...updated[idx], response };
    setLeave(updated);

    if (!id) {
      // backend id missing — attempt best-effort PUT using srNo path
      axios.put(`${API}/${srNo}`, { email, response })
        .then(() => toast.success("Updated"))
        .catch(err => {
          console.error(err);
          toast.error("Failed to update");
          fetchLeaves();
        });
      return;
    }

    axios.put(`${API}/${id}`, { email, response })
      .then(() => {
        toast.success("Response saved");
        // optional: refresh from server to keep canonical data
        fetchLeaves();
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to save response");
        fetchLeaves();
      });
  };

  return (
    <div className='leave'>
      <div className='secondLeave'>
        <h1>LIST OF LEAVES</h1>
        <table border="1" className='leaveTable' style={{ width: "80%", margin: "0 auto" }}>
          <thead>
            <tr>
              <th>Sr no</th>
              <th>Email</th>
              <th>Leave date</th>
              <th>Response</th>
              <th>Mark</th>
            </tr>
          </thead>
          <tbody>
            {leave.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No leave requests</td></tr>
            ) : leave.map((lv, i) => (
              <tr key={lv.originalId ?? i}>
                <td>{lv.srNo}</td>
                <td>{lv.email || ""}</td>
                <td>{lv.date || ""}</td>
                <td>
                  <button onClick={() => handleResponse(lv.srNo, lv.email, "Yes")} className='leaveTableBtnFirst'>Yes</button>
                  <button onClick={() => handleResponse(lv.srNo, lv.email, "No")} className='leaveTableBtnSecond'>No</button>
                </td>
                <td>{lv.response || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestLeave;
