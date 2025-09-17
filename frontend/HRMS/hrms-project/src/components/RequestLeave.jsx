import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import './Menu.css'
import hrms_logo from '../assets/hrms_logo.png'

const API = 'http://localhost:8080/api/leave';
const EMP_LEAV_API = "http://localhost:8080/api/employees/t-leaves";

const RequestLeave = () => {

    const [leave, setLeave] = useState([]);

    useEffect(() => {
        if (leave.length === 0) return;

        // 1. Get all unique emails
        const allEmails = [...new Set(leave.map(lv => lv.email))];

        // 2. Count approved "Yes" leaves
        const approvedCount = {};
        leave.forEach(lv => {
            if (lv.response?.toLowerCase() === "yes") {
                approvedCount[lv.email] = (approvedCount[lv.email] || 0) + 1;
            }
        });

        // 3. Update backend for all emails (default 0 if not found)
        allEmails.forEach(email => {
            const count = approvedCount[email] || 0;
            axios.put(EMP_LEAV_API, { email, leaves: count })
                .then(() => console.log(`✅ Updated ${email} with ${count} approved leaves`))
                .catch(err => console.error("❌ Error updating:", email, err));
        });

    }, [leave]); // runs whenever leave data changes



    const [lea, setLea] = useState({ email: '', response: '' });

    useEffect(() => {
        axios.get(API)
            .then(res => setLeave(res.data))
            .catch(err => console.log(err))
    }, []);

    let handleResponse = (srNo, email, response) => {
        // console.log(email);
        // console.log(response);

        setLeave(prev =>
            prev.map((lv) =>
                lv.srNo === srNo && lv.email === email ? { ...lv, response } : lv
            )
        );
        console.log(email);
        axios.put(`${API}/${srNo}`, { email, response })
            .then(res => toast.success("success"))
            .catch(err => console.log(err));
    }

    return (
        <div className='leave'>
            {/* <div className='firstLeave'>
                <img src={hrms_logo} alt="" />
            </div> */}
            <div className='secondLeave'>
                <h1>list of leaves</h1>
                <table border="1" className='leaveTable'>
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
                        {
                            leave.map((lv, i) => (
                                <tr key={lv.srNo || i}>
                                    <td>{lv.srNo}</td>
                                    <td>{lv.email}</td>
                                    <td>{lv.date}</td>
                                    <td>
                                        <button onClick={() => handleResponse(lv.srNo, lv.email, "Yes")} className='leaveTableBtnFirst'>Yes</button>
                                        <button onClick={() => handleResponse(lv.srNo, lv.email, "No")} className='leaveTableBtnSecond'>No</button>
                                    </td>
                                    <td>{lv.response || ""}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RequestLeave
