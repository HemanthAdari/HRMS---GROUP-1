import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import "./Register.css";

const API = "http://localhost:8080/api/employees"; // ✅ check plural

const Register = () => {
  const [form, setForm] = useState({
    email: "",
    address: "",
    fullName: "",
    gender: "",
    hireDate: "",
    password: "",
    phone: "",
    salary: "",
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API, form, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("✅ Response:", res.data);

      toast.success("Employee registered successfully");

      // clear form
      setForm({
        email: "",
        address: "",
        fullName: "",
        gender: "",
        hireDate: "",
        password: "",
        phone: "",
        salary: "",
      });
    } catch (err) {
      console.error("❌ Error:", err.response || err);
      toast.error("Error registering employee");
    }
  };

  return (
    <div className="Register-first-div">
      <form className="Register-first-div-form" onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="enter email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <br />

        <input
          type="text"
          placeholder="address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <br />

        <input
          type="text"
          placeholder="full name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <br />

        <h3>Select Gender</h3>
        <label>
          <input
            type="radio"
            name="gender"
            value="male"
            checked={form.gender === "male"}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          />
          Male
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="gender"
            value="female"
            checked={form.gender === "female"}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          />
          Female
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="gender"
            value="other"
            checked={form.gender === "other"}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          />
          Other
        </label>
        <br />

        <input
          type="date"
          value={form.hireDate}
          onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
        />
        <br />

        <input
          type="password"
          placeholder="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <br />

        <input
          type="tel"
          placeholder="phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <br />

        <input
          type="text"
          placeholder="salary"
          value={form.salary}
          onChange={(e) => setForm({ ...form, salary: e.target.value })}
        />
        <br />

        <button className="Register-first-div-form-sub-btn" type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
