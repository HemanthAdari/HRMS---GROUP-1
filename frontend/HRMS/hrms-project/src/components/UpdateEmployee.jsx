import axios from 'axios';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './UpdateEmployee.css';

const API = "http://localhost:8080/api/employees";

const UpdateEmployee = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emp = location.state;

  const [form, setForm] = useState({
    fullName: emp?.fullName || `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim(),
    address: emp?.address || '',
    address2: emp?.address2 || '',
    gender: emp?.gender || '',
    hireDate: emp?.hireDate ? emp.hireDate.split('T')[0] : '',
    phone: emp?.phone || '',
    salary: emp?.salary != null ? String(emp.salary) : ''
  });

  if (!emp) {
    return (
      <div style={{ padding: 20 }}>
        <h2>No employee selected</h2>
        <p>Please open the update page from the employee list.</p>
      </div>
    );
  }

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!form.fullName) {
      toast.error('Full Name is required');
      return;
    }

    const id = emp?.employeeId || emp?.id;
    if (!id) {
      toast.error("Employee id is missing. Can't update.");
      return;
    }

    // split fullName into firstName and lastName
    const parts = (form.fullName || '').trim().split(/\s+/);
    const firstName = parts.length > 0 ? parts.shift() : '';
    const lastName = parts.join(' ') || '';

    const payload = {
      firstName,
      lastName,
      address: form.address || null,
      address2: form.address2 || null,
      phone: form.phone || null,
      gender: form.gender || null,
      hireDate: form.hireDate || null,
      salary: form.salary ? Number(form.salary) : null
    };

    try {
      const res = await axios.put(`${API}/${id}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      toast.success('Employee updated successfully');
      // optionally navigate back to list
      navigate('/a/emp');
    } catch (err) {
      console.error('❌ Error:', err.response || err);
      const msg = err?.response?.data?.message || 'Error updating employee';
      toast.error(msg);
    }
  };

  return (
    <div className="update-emp-first-div" style={{ padding: '20px' }}>
      <h2>Current Employee Details</h2>

      <div className="update-emp-second-div" style={{ marginBottom: '20px' }}>
        <p><b>Employee Id:</b> {emp.employeeId || emp.id || '—'}</p>
        <p><b>Email:</b> {emp.user?.email || emp.email || '—'}</p>
        <p><b>Address:</b> {emp.address || '—'}</p>
        <p><b>Address 2:</b> {emp.address2 || '—'}</p>
        <p><b>Salary:</b> {emp.salary ?? '—'}</p>
        <p><b>Full name:</b> {emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`}</p>
        <p><b>Gender:</b> {emp.gender || '—'}</p>
        <p><b>Hire date:</b> {emp.hireDate || '—'}</p>
        <p><b>Phone:</b> {emp.phone || '—'}</p>
      </div>

      <h2>Update Employee</h2>

      <form className="update-emp-second-div-form" onSubmit={handleUpdate}>
        <input
          type="text"
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
        />
        <br /><br />

        <input
          type="text"
          placeholder="Address Line 1"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Address Line 2"
          value={form.address2}
          onChange={(e) => setForm({ ...form, address2: e.target.value })}
        />
        <br /><br />

        <h3>Select Gender</h3>
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

        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Hire Date</label>
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

        <button className="update-emp-second-div-sub-btn" type="submit">Update</button>
      </form>
    </div>
  );
};

export default UpdateEmployee;
