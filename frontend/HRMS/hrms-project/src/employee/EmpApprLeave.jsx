import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { EmailContext } from '../components/EmailContext';
import './EmpNav.css'

const API = 'http://localhost:8080/api/leave';
const EMP_LEAV_API = "http://localhost:8080/api/employees/t-leaves";

const EmpApprLeave = () => {

    const { email } = useContext(EmailContext);

    const [leave, setLeave] = useState([]);

    useEffect(() => {
        axios.get(API)
            .then(res => setLeave(res.data))
            .catch(err => console.log(err))
    }, []);

    const filteredLeaves = leave.filter(lv => lv.email === email);
    // Calculate total approved leaves
const approvedLeaves = filteredLeaves.filter(
  lv => lv.response === "yes" || lv.response === "Yes"
).length;

    console.log(approvedLeaves);
    useEffect(() => {
  if (email && approvedLeaves >= 0) {
    axios.put(EMP_LEAV_API, {
      email: email,
      leaves: approvedLeaves
    })
    .then(() => console.log("✅ Leaves updated"))
    .catch(err => console.log(err));
  }
}, [email, approvedLeaves]);   // <---- run only when these change


    return (
        <div className='emp-apr-leave-first-div'>
            <h1>list of leaves</h1>
            <h2>Total Approved Leaves: {approvedLeaves}</h2>
            <table className='emp-apr-leave-first-div-table' border="1" >
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
                            <tr key={lv.srNo || i}>
                                <td>{lv.srNo}</td>
                                <td>{lv.email}</td>
                                <td>{lv.date}</td>
                                <td>{lv.response || <h4 style={{color: "red"}}>pending</h4>}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No leave records found for {email}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default EmpApprLeave
