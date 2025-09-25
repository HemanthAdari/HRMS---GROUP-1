// src/employee/EmpLeave.jsx
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { EmailContext } from '../components/EmailContext';
import './EmpNav.css'

const API = 'http://localhost:8080/api/leave';
const EMP_API = "http://localhost:8080/api/employees"

const EmpLeave = () => {

    const { email } = useContext(EmailContext);
    // leave form state
    const [leave, setLeave] = useState({ email: '', date: '' });

    // list of employees (from /api/employees)
    const [employees, setEmployees] = useState([]);
    // current used leaves for the logged-in user (number)
    const [currentlea, setCurrentlea] = useState(0);

    // submit a leave request
    let handleLeave = e => {
        e.preventDefault();

        if (!email) {
            toast.error("You are not logged in.");
            return;
        }

        if (leave.email.trim().toLowerCase() !== email.toLowerCase()) {
            toast.error("Error: You can only apply leave for your own account!");
            return;
        }

        axios.post(API, leave)
            .then(res => {
                toast.success("Leave request sent successfully");
                // optionally clear date after submit
                setLeave(prev => ({ ...prev, date: '' }));
            })
            .catch(err => {
                console.error("Leave submit error:", err);
                toast.error("Failed to send leave request");
            });
    }

    // fetch employees once on mount
    useEffect(() => {
        axios.get(EMP_API)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                setEmployees(data);
            })
            .catch(err => {
                console.error("Failed to load employees:", err);
            });
    }, []);

    // when employees or email change, find matching employee record and set leaves
    useEffect(() => {
        if (!email || employees.length === 0) {
            // if no data yet, ensure default 0
            setCurrentlea(0);
            return;
        }

        // find by nested user.email or top-level email (defensive)
        const matched = employees.find(emp => {
            const empEmail = (emp?.user?.email || emp?.email || "").toString().trim().toLowerCase();
            return empEmail && empEmail === email.toLowerCase();
        });

        if (matched) {
            // support numeric or string leaves
            const leavesVal = matched.leaves;
            const parsed = typeof leavesVal === "number" ? leavesVal :
                           (typeof leavesVal === "string" && leavesVal.trim() !== "") ? Number(leavesVal) :
                           0;
            setCurrentlea(Number.isNaN(parsed) ? 0 : parsed);
            console.log("Leaves for", email, "=", matched.leaves);
        } else {
            // not found -> zero leaves used
            setCurrentlea(0);
            console.log("No employee record found for", email);
        }
    }, [employees, email]);

    const remaining = 30 - Number(currentlea || 0);

    return (
        <div className='emp-leave-first-div'>
            <h1>Remaining Leaves : {Number.isFinite(remaining) ? remaining : 30}</h1>

            <form className='emp-leave-first-div-form' onSubmit={handleLeave}>
                <input
                  type="email"
                  placeholder='enter email'
                  value={leave.email}
                  onChange={e => setLeave({ ...leave, email: e.target.value })}
                />
                <br />
                <br />
                <input
                  type="date"
                  value={leave.date}
                  onChange={e => setLeave({ ...leave, date: e.target.value })}
                />
                <br />
                <br />
                <hr />
                <input type="submit" value='leave' />
            </form>
        </div>
    )
}

export default EmpLeave
