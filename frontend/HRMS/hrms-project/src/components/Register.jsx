import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import "./Register.css";

const API = "http://localhost:8080/auth/api/register";

const Register = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    address: "",
    fullName: "",
    gender: "",
    hireDate: "",
    phone: "",
    salary: "",
  });

  const handleRegister = async (e) => {
    e.preventDefault();

    // split fullName into firstName & lastName for backend DTO
    const name = (form.fullName || "").trim();
    const nameParts = name ? name.split(/\s+/) : [];

    const payload = {
      email: form.email,
      password: form.password,
      role: "EMPLOYEE", // 🔒 fixed role
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      address: form.address,
      gender: form.gender,
      hireDate: form.hireDate,
      phone: form.phone,
      salary: form.salary,
    };

    try {
      const res = await axios.post(API, payload, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Registered: " + (res.data.email || "Success"));

      setForm({
        email: "",
        password: "",
        address: "",
        fullName: "",
        gender: "",
        hireDate: "",
        phone: "",
        salary: "",
      });
    } catch (err) {
      console.error("❌ Error:", err.response?.data || err);
      const serverMsg =
        err.response?.data?.error || err.message || "Registration failed";
      toast.error(serverMsg);
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
          required
        />
        <br />

        <input
          type="password"
          placeholder="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <br />

        <input
          type="text"
          placeholder="Full name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <br />

        {/* 🔒 Removed role dropdown */}

        <input
          type="text"
          placeholder="address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
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

        <button className="Register-first-div-form-sub-btn" type="submit">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
