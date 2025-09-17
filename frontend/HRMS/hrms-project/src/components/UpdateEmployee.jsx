import axios from 'axios';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './UpdateEmployee.css'

const API = "http://localhost:8080/api/employees/update";

const UpdateEmployee = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const emp = location.state;

    const [form, setForm] = useState({
        email: emp.email || "",
        address: emp.address || "",
        fullName: emp.fullName || "",
        gender: emp.gender || "",
        hireDate: emp.hireDate || "",
        password: emp.password || "",
        phone: emp.phone || "",
        salary: emp.salary || "",
    });

    const handleUpdate = async (e) => {
        e.preventDefault();

        // Optional basic validation
        if (!form.email || !form.fullName) {
            toast.error("Email and Full Name are required");
            return;
        }

        try {
            const res = await axios.put(`${API}/${emp.email}`, form, {
                headers: { "Content-Type": "application/json" },
            });
            console.log("✅ Response:", res.data);

            toast.success("Employee updated successfully");

            // Optional: navigate back to employee list after update
            // navigate("/employees");

        } catch (err) {
            console.error("❌ Error:", err.response || err);
            toast.error("Error updating employee");
        }
    };

    return (
        <div className="update-emp-first-div" style={{ padding: '20px' }}>
            <h2>Current Employee Details</h2>
            <div className="update-emp-second-div" style={{ marginBottom: '20px' }}>
                <p><b>Email:</b> {emp.email}</p>
                <p><b>Address:</b> {emp.address}</p>
                <p><b>Salary:</b> {emp.salary}</p>
                <p><b>Full name:</b> {emp.fullName}</p>
                <p><b>Gender:</b> {emp.gender}</p>
                <p><b>Hire date:</b> {emp.hireDate}</p>
                <p><b>Password:</b> {emp.password}</p>
                <p><b>Phone:</b> {emp.phone}</p>
            </div>

            <h2>Update Employee</h2>
            <form className="update-emp-second-div-form" onSubmit={handleUpdate}>
                <input
                    type="email"
                    placeholder="Enter email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                />
                <br /><br />

                <input
                    type="text"
                    placeholder="Address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
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

                <h3>Select Gender</h3>
                <label>
                    <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={form.gender === "male"}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    /> Male
                </label>
                <br />
                <label>
                    <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={form.gender === "female"}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    /> Female
                </label>
                <br />
                <label>
                    <input
                        type="radio"
                        name="gender"
                        value="other"
                        checked={form.gender === "other"}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    /> Other
                </label>
                <br /><br />

                <input
                    type="date"
                    value={form.hireDate}
                    onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                />
                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
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
