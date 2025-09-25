import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './Employee.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API = 'http://localhost:8080/api/employees';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    axios.get(API)
      .then(res => {
        setEmployees(res.data || []);
      })
      .catch(err => {
        console.error('❌ Error fetching employees:', err);
        toast.error('Failed to load employees');
      });
  }, []);

  const handleUpdate = (emp) => {
    navigate('/a/emp/update', { state: emp });
  };

  const handleDelete = async (emp) => {
    const id = emp?.employeeId || emp?.id;
    if (!id) { 
      toast.error("Employee id missing"); 
      return; 
    }
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`${API}/${id}`);
      toast.success('Employee deleted');
      setEmployees(prev => prev.filter(e => (e.employeeId || e.id) !== id));
    } catch (err) {
      console.error('Delete error', err);
      toast.error('Failed to delete employee');
    }
  };

  return (
    <div className='emp'>
      <h1>List Of Employees</h1>
      <div className='main1'>
        {employees.map((emp) => {
          const id = emp?.employeeId || emp?.id || '—';
          const email = emp?.user?.email || emp?.email || '—';
          const fullName = emp?.fullName || `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim() || '—';
          const hireDate = emp?.hireDate ? (new Date(emp.hireDate)).toLocaleDateString() : '—';
          const addressLine1 = emp?.address || '—';
          const addressLine2 = emp?.address2 || '—';
          const salary = emp?.salary ?? '—';
          const phone = emp?.phone || '—';
          const gender = emp?.gender || '—';

          return (
            <div key={id} className='cards'>
              <h2>{id}</h2>
              <p><b>Email :</b> {email}</p>
              <p><b>Address :</b> {addressLine1}</p>
              <p><b>Address 2 :</b> {addressLine2}</p>
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
