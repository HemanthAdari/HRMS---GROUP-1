// src/components/Employees.jsx
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './Employee.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API = 'http://localhost:8080/api/employees';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [value, setValue] = useState(new Date());

  useEffect(() => {
    axios.get(API)
      .then(res => setEmployees(res.data))
      .catch(err => console.error('❌ Error fetching employees:', err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setValue(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdate = (emp) => {
    // pass full employee object to update page
    navigate('/a/emp/update', { state: emp });
  };

  const handleDelete = async (empOrId) => {
    const id = typeof empOrId === 'number' || typeof empOrId === 'string'
      ? empOrId
      : (empOrId?.employeeId || empOrId?.empId || empOrId?.id || null);

    if (!id) {
      toast.error("Employee id is missing. Can't delete.");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await axios.delete(`${API}/${id}`);
      toast.success('Employee deleted successfully');

      setEmployees((prev) => prev.filter((e) => {
        const eid = e?.employeeId || e?.empId || e?.id || null;
        return eid !== id;
      }));
    } catch (err) {
      console.error('❌ Error deleting employee:', err?.response || err);
      const msg = err?.response?.data?.message || 'Error deleting employee';
      toast.error(msg);
    }
  };

  return (
    <div className='emp'>
      <h1>List Of Employees</h1>
      <div className='main1'>
        {employees.map((emp) => {
          const id = emp?.employeeId || emp?.empId || emp?.id || '—';
          // if backend returned nested user, prefer user.email
          const email = emp?.email || emp?.user?.email || '—';
          const fullName = emp?.fullName || `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim() || '—';
          const hireDate = emp?.hireDate || '—';
          const salary = emp?.salary ?? '—';
          const address = emp?.address || '—';
          const gender = emp?.gender || '—';
          const phone = emp?.phone || '—';

          return (
            <div key={id} className='cards'>
              <h2>{id}</h2>
              <p><b>Email :</b> {email}</p>
              <p><b>Address :</b> {address}</p>
              <p><b>Salary :</b> {salary}</p>
              <p><b>Full name :</b> {fullName}</p>
              <p><b>Gender :</b> {gender}</p>
              <p><b>HireDate :</b> {hireDate}</p>
              <p><b>Phone :</b> {phone}</p>

              <button onClick={() => handleUpdate(emp)} className='cards-btn1'>Update</button>
              <button onClick={() => handleDelete(emp)} className="cards-btn2">Delete</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Employees;
