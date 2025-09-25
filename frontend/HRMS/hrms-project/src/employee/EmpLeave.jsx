// src/employee/EmpLeave.jsx
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { EmailContext } from '../components/EmailContext';
import '../components/NavBar.css';

const API = 'http://localhost:8080/api/leave';
const EMP_API = "http://localhost:8080/api/employees";

const EmpLeave = () => {
  const { email } = useContext(EmailContext);

  // include reason in state
  const [leave, setLeave] = useState({ email: email || '', date: '', reason: '' });
  const [employees, setEmployees] = useState([]);
  const [currentlea, setCurrentlea] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(EMP_API)
      .then(res => setEmployees(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Failed to load employees:", err));
  }, []);

  useEffect(() => {
    if (!email || employees.length === 0) {
      setCurrentlea(0);
      return;
    }
    const matched = employees.find(emp => {
      const empEmail = (emp?.user?.email || emp?.email || "").toString().trim().toLowerCase();
      return empEmail && empEmail === email.toLowerCase();
    });
    if (matched) {
      setCurrentlea(Number(matched.leaves || 0));
    } else {
      setCurrentlea(0);
    }
    // prefill email field if available
    setLeave(prev => ({ ...prev, email: email || prev.email }));
  }, [employees, email]);

  const handleLeave = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("You are not logged in.");
      return;
    }

    if (leave.email.trim().toLowerCase() !== email.toLowerCase()) {
      toast.error("You can only apply leave for your own account.");
      return;
    }

    if (!leave.date) {
      toast.error("Please choose a date for leave.");
      return;
    }

    const trimmedReason = (leave.reason || "").trim();
    if (trimmedReason.length < 3) {
      toast.error("Please enter a brief reason (min 3 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        email: leave.email.trim(),
        date: leave.date,
        reason: trimmedReason
      };
      console.log("POST /api/leave payload:", payload);

      await axios.post(API, payload);
      toast.success("Leave request sent successfully");
      setLeave({ email: email || '', date: '', reason: '' });
    } catch (err) {
      console.error("Leave submit error:", err);
      const msg = err?.response?.data?.error || err?.response?.data || err.message || "Failed to send leave request";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = 30 - Number(currentlea || 0);

  return (
    <div className='emp-leave-first-div' style={{ padding: 20 }}>
      <h1>Remaining Leaves : {Number.isFinite(remaining) ? remaining : 30}</h1>

      <form className='emp-leave-first-div-form' onSubmit={handleLeave} style={{ maxWidth: 620 }}>
        <input
          required
          type="email"
          placeholder='Enter email'
          value={leave.email}
          onChange={e => setLeave({ ...leave, email: e.target.value })}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />

        <input
          required
          type="date"
          value={leave.date}
          onChange={e => setLeave({ ...leave, date: e.target.value })}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />

        <textarea
          required
          placeholder="Reason for leave (brief)"
          value={leave.reason}
          onChange={e => setLeave({ ...leave, reason: e.target.value })}
          rows={4}
          style={{ width: '100%', padding: '8px', marginBottom: '10px', resize: 'vertical' }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={submitting} style={{ padding: '8px 16px' }}>
            {submitting ? 'Submitting...' : 'Apply for Leave'}
          </button>
          <button type="button" onClick={() => setLeave({ email: email || '', date: '', reason: '' })} style={{ padding: '8px 12px' }}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmpLeave;
