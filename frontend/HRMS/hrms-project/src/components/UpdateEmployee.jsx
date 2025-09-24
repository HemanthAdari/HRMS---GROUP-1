// src/components/UpdateEmployee.jsx
import axios from 'axios';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './UpdateEmployee.css';

const API = "http://localhost:8080/api/employees";

const UpdateEmployee = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const empFromLocation = location.state || null;

  // Hooks must be unconditional
  const [form, setForm] = useState({
    // split of fields for UI
    address1: empFromLocation?.address || '',      // Address Line 1 (or full address if backend stored single column)
    address2: '',                                  // user-editable second line
    fullName: (empFromLocation?.fullName) || `${empFromLocation?.firstName || ''} ${empFromLocation?.lastName || ''}`.trim() || '',
    gender: empFromLocation?.gender || '',
    hireDate: empFromLocation?.hireDate || '',
    phone: empFromLocation?.phone || '',
    salary: empFromLocation?.salary !== undefined ? String(empFromLocation.salary) : ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!form.fullName) {
      toast.error('Full Name is required');
      return;
    }

    // find employee id robustly
    const id = empFromLocation?.employeeId || empFromLocation?.empId || empFromLocation?.id;
    if (!id) {
      toast.error("Employee id is missing. Can't update.");
      return;
    }

    // split fullName into firstName and lastName
    const parts = (form.fullName || '').trim().split(/\s+/, 2);
    const firstName = parts[0] || '';
    const lastName = parts[1] || '';

    // combine address lines (backend expects single 'address' column currently)
    const combinedAddress = [form.address1, form.address2].filter(Boolean).join(', ') || null;

    // Build the payload matching backend fields
    const payload = {
      firstName,
      lastName,
      address: combinedAddress,
      phone: form.phone || null,
      salary: form.salary ? Number(form.salary) : null,
      // extras: if your backend supports gender/hireDate, include them; otherwise they'll be ignored.
      gender: form.gender || null,
      hireDate: form.hireDate || null
    };

    setSubmitting(true);
    try {
      const res = await axios.put(`${API}/${id}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ Update response:', res.data);
      toast.success('Employee updated successfully');

      // Optionally navigate back to list
      // navigate('/a/emp');
    } catch (err) {
      console.error('❌ Update error:', err?.response || err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Error updating employee';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Safe early-return UI (hooks already executed)
  if (!empFromLocation) {
    return (
      <div style={{ padding: 20 }}>
        <h2>No employee selected</h2>
        <p>Please open the update page from the employee list (click Update on an employee card).</p>
      </div>
    );
  }

  // Derived display name
  const displayFullName = empFromLocation?.fullName || `${empFromLocation?.firstName || ''} ${empFromLocation?.lastName || ''}`.trim();

  return (
    <div className="update-emp-first-div" style={{ padding: '20px' }}>
      <h2>Current Employee Details</h2>

      <div className="update-emp-second-div" style={{ marginBottom: '20px' }}>
        <p><b>Employee Id:</b> {empFromLocation.employeeId || empFromLocation.id || '—'}</p>
        {/* Email and password intentionally NOT shown per your request */}
        <p><b>Address:</b> {empFromLocation.address || '—'}</p>
        <p><b>Salary:</b> {empFromLocation.salary ?? '—'}</p>
        <p><b>Full name:</b> {displayFullName || '—'}</p>
        <p><b>Gender:</b> {empFromLocation.gender || '—'}</p>
        <p><b>Hire date:</b> {empFromLocation.hireDate || '—'}</p>
        <p><b>Phone:</b> {empFromLocation.phone || '—'}</p>
      </div>

      <h2>Update Employee</h2>

      <form className="update-emp-second-div-form" onSubmit={handleUpdate}>
        <input
          type="text"
          placeholder="Address Line 1"
          value={form.address1}
          onChange={(e) => setForm({ ...form, address1: e.target.value })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Address Line 2"
          value={form.address2}
          onChange={(e) => setForm({ ...form, address2: e.target.value })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
        />
        <br /><br />

        <h3 style={{ textAlign: 'left', width: '100%' }}>Select Gender</h3>
        <label>
          <input
            type="radio"
            name="gender"
            value="male"
            checked={form.gender === 'male'}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          /> Male
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="gender"
            value="female"
            checked={form.gender === 'female'}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          /> Female
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="gender"
            value="other"
            checked={form.gender === 'other'}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          /> Other
        </label>
        <br /><br />

        <label className="hire-date-label" style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 6 }}>
          Hire Date
        </label>
        <input
          type="date"
          value={form.hireDate}
          onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
        />
        <br /><br />

        <input
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Salary"
          value={form.salary}
          onChange={(e) => setForm({ ...form, salary: e.target.value })}
        />
        <br /><br />

        <button className="update-emp-second-div-sub-btn" type="submit" disabled={submitting}>
          {submitting ? 'Updating…' : 'Update'}
        </button>
      </form>
    </div>
  );
};

export default UpdateEmployee;
