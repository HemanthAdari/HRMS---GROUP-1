// Login.jsx
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./Login.css";
import profile from "../assets/profile.png";
import { EmailContext } from "./EmailContext";
import ApplyJobForm from "./ApplyJobForm";

const API = "http://localhost:8080/auth/api/login";
const REGISTER_API = "http://localhost:8080/auth/api/register";
const Job_API = "http://localhost:8080/api/job-opening/get-all-job";

const Login = ({ setRole }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "",
  });

  // from context
  const { setEmail, setUserId, setRole: setCtxRole } = useContext(EmailContext);

  const [job, setJob] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    axios
      .get(Job_API)
      .then((res) => setJob(res.data))
      .catch((err) => console.log(err));
  }, []);

  // Login submit
  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post(API, form, { headers: { "Content-Type": "application/json" } })
      .then((res) => {
        toast.success("Login success");

        const roleFromServer = res.data?.role || "";

        if (roleFromServer === "ADMIN") {
          setRole("admin");
          setCtxRole("ADMIN");
        } else if (roleFromServer === "HR_MANAGER") {
          setRole("hr");
          setCtxRole("HR_MANAGER");
        } else {
          setRole("emp");
          setCtxRole("EMPLOYEE");
        }

        // save in context
        setEmail(res.data?.email || form.email);
        setUserId(res.data?.userId);

        // save in localStorage
        localStorage.setItem("userId", String(res.data?.userId));
        localStorage.setItem("email", res.data?.email || form.email);
        localStorage.setItem("role", roleFromServer);
      })
      .catch((err) => {
        console.error("Login error:", err.response?.data || err);
        toast.error(err.response?.data?.error || "Invalid email or password");
      });
  };

  // Register submit
  const handleRegister = (e) => {
    e.preventDefault();

    const name = (registerForm.fullName || "").trim();
    const nameParts = name ? name.split(/\s+/) : [];
    const payload = {
      email: registerForm.email,
      password: registerForm.password,
      role: registerForm.role || "",
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      phone: registerForm.phone,
    };

    axios
      .post(REGISTER_API, payload, { headers: { "Content-Type": "application/json" } })
      .then(() => {
        toast.success("Registration successful! Please login.");
        setIsRegister(false);
      })
      .catch((err) => {
        console.error("Registration error:", err.response?.data || err);
        toast.error(err.response?.data?.error || "Registration failed. Try again.");
      });
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
  };

  return (
    <div>
      <div className="login-container">
        <div className="login-container-first-div">
          <h1>HR</h1>
          <h2>Management System</h2>
          <p>Welcome to HRMS – Manage employees, jobs, and more with ease!</p>
        </div>

        <div className="login-card">
          {/* Left Section */}
          <div className="welcome-section">
            <div className="welcome-content">
              <h1>Welcome</h1>
              <p>TO HRMS</p>
            </div>
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
          </div>

          {/* Right Section */}
          <div className="login-section">
            <div className="login-form-container">
              {isRegister ? (
                <>
                  <h2>Register New Account</h2>
                  <form onSubmit={handleRegister}>
                    <input
                      type="text"
                      className="inp"
                      placeholder="Full Name"
                      value={registerForm.fullName}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, fullName: e.target.value })
                      }
                    />
                    <br />
                    <input
                      type="email"
                      className="inp"
                      placeholder="Email"
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, email: e.target.value })
                      }
                    />
                    <br />
                    <input
                      type="password"
                      className="inp"
                      placeholder="Password"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, password: e.target.value })
                      }
                    />
                    <br />
                    <input
                      type="text"
                      className="inp"
                      placeholder="Phone"
                      value={registerForm.phone}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, phone: e.target.value })
                      }
                    />
                    <br />
                    <select
                      className="inp"
                      value={registerForm.role}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, role: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="ADMIN">Admin</option>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="HR_MANAGER">HR</option>
                    </select>
                    <br />
                    <input type="submit" className="sub" value="Register" />
                  </form>
                  <button
                    className="sub"
                    style={{ marginTop: "10px", backgroundColor: "#2196F3" }}
                    onClick={() => setIsRegister(false)}
                  >
                    Back to Login
                  </button>
                </>
              ) : (
                <>
                  <h2>Login to HRMS Portal</h2>
                  <form onSubmit={handleLogin}>
                    <hr className="titleLine" />
                    <img src={profile} alt="" />
                    <br />
                    <hr />
                    <input
                      type="email"
                      className="inp"
                      placeholder="Enter email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                    />
                    <br />
                    <input
                      type="password"
                      className="inp"
                      placeholder="Password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required
                    />
                    <br />
                    <hr />
                    <input type="submit" className="sub" value="Login" />
                  </form>
                  <button
                    className="sub"
                    style={{ marginTop: "10px", backgroundColor: "#4CAF50" }}
                    onClick={() => setIsRegister(true)}
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="job-openings-section">
        <h2>Current Job Openings</h2>
        {selectedJob ? (
          <ApplyJobForm job={selectedJob} />
        ) : (
          <div className="job-cards-container">
            {job.map((j) => (
              <div key={j.jobPositionId} className="job-card">
                <h3>{j.jobPosition}</h3>
                <p>
                  <b>Location: </b>
                  {j.location}
                </p>
                <p>
                  <b>Experience: </b>
                  {j.experience}
                </p>
                <p>
                  <b>Skills: </b>
                  {j.skills}
                </p>
                <button onClick={() => handleApplyClick(j)}>Apply Now</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
