import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './Employee.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // make sure you import this

const API = 'http://localhost:8080/api/employees';

const Employees = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [value, setValue] = useState(new Date());

  // ✅ fetch employees only once
  useEffect(() => {
    axios.get(API)
      .then(res => setEmployees(res.data))
      .catch(err => console.error("❌ Error fetching employees:", err));
  }, []);

  // ✅ update clock every second
  useEffect(() => {
    const timer = setInterval(() => setValue(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdate = (emp) => {
    navigate("/a/emp/update", { state: emp });
  };

  const handleDelete = async (empId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await axios.delete(`${API}/${empId}`);
      toast.success("Employee deleted successfully");

      // Remove from local state without refetch
      setEmployees((prev) => prev.filter((e) => e.empId !== empId));
    } catch (err) {
      console.error("❌ Error deleting employee:", err);
      toast.error("Error deleting employee");
    }
  };

  return (
    <div className='emp'>
      <h1>List Of Users</h1>
      <div className='main1'>
        {employees.map((emp) => (
          <div key={emp.empId} className='cards'>
            <h2>{emp.empId}</h2>
            <p><b>Email :</b> {emp.email}</p>
            <p><b>Address :</b> {emp.address}</p>
            <p><b>Salary :</b> {emp.salary}</p>
            <p><b>Full name :</b> {emp.fullName}</p>
            <p><b>Gender :</b> {emp.gender}</p>
            <p><b>HireDate :</b> {emp.hireDate}</p>
            <p><b>Password :</b> {emp.password}</p>
            <p><b>Phone :</b> {emp.phone}</p>
            <button onClick={() => handleUpdate(emp)} className='cards-btn1'>Update</button>
            <button onClick={() => handleDelete(emp.empId)} className="cards-btn2">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Employees;
