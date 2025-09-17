import axios from 'axios';
import React, { useEffect, useState } from 'react'
import './Menu.css'
import hrms_logo from '../assets/hrms_logo.png'

const API = 'http://localhost:8080/api/attendance';

const Attendance = () => {

  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    axios
      .get(API)
      .then((res) => setAttendance(res.data))
      .catch((err) => console.log(err));
  }, []);

  const filtered = attendance.filter((att) => {
    const emailMatch = att.email.toLowerCase().includes(search.toLowerCase());

    // Convert att.date to Date object (assuming backend returns yyyy-MM-dd)
    const attDate = new Date(att.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const dateMatch =
      (!start || attDate >= start) && (!end || attDate <= end);

    return emailMatch && dateMatch;
  });

  return (
    <div className='attendance'>
      {/* <div className='aFirAttendance'>
        <img src={hrms_logo} alt="" />
      </div> */}

      <div className='aSecAttendance'>
        <h1>List Of Attendance</h1>
        <input
          type="text"
          className='attendanceFirstInp'
          placeholder="Search by email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: "10px", padding: "5px", borderRadius: "50px", width: "200px" }}
        />
        <div style={{ marginBottom: "10px" }} className='attendanceFirstDiv'>
          <label>Start Date: </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <label style={{ marginLeft: "10px" }}>End Date: </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <table border="1" className="attendanceTable">
          <thead>
            <tr>
              <th>Sr no</th>
              <th>Email</th>
              <th>Date</th>
              <th>Attendance</th>
              <th>Current at</th>
            </tr>
          </thead>
          <tbody>
            {
              filtered.map((att, i) => (
                <tr key={att.srId || i}>
                  <td>{att.srNo}</td>
                  <td>{att.email}</td>
                  <td>{att.date}</td>
                  <td>{att.attendance}</td>
                  <td>{att.currentAt}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Attendance
