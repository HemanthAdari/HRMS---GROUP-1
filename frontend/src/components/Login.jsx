import React, { useState } from "react";
import "./Login.css"; // Import CSS file
import illustration from "../Assests/illustration.png";

const Login = () => {
  const [activeTab, setActiveTab] = useState("login"); // "login" or "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regContact, setRegContact] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Login with ${username} / ${password}`);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      alert("Passwords do not match ❌");
      return;
    }
    alert(
      `Registered:\nName: ${regName}\nEmail: ${regEmail}\nContact: ${regContact}`
    );
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Left Illustration */}
        <div className="login-illustration">
          <img src={illustration} alt="HR Illustration" />
        </div>

        {/* Right Forms */}
        <div className="login-form">
          <h2>
            <span className="highlight">HR</span> PORTAL
          </h2>

          {/* Tabs */}
          <div className="tab-buttons">
            <button
              className={activeTab === "login" ? "active" : ""}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={activeTab === "register" ? "active" : ""}
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin}>
              <label>Email</label>
              <input
                type="email"
                placeholder="ex - johndoe11@gmail.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <div className="right-link">
                <a href="#">Change Password</a>
              </div>

              <button type="submit" className="login-btn">
                Login
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister}>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />

              <label>Email</label>
              <input
                type="email"
                placeholder="ex - johndoe11@gmail.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />

              <label>Contact Number</label>
              <input
                type="tel"
                placeholder="9876543210"
                value={regContact}
                onChange={(e) => setRegContact(e.target.value)}
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="********"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />

              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="********"
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
              />

              <button type="submit" className="login-btn">
                Register
              </button>
            </form>
          )}

          <p className="support-text">
            Having issues? Kindly connect with{" "}
            <a href="#">IT Support Team</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
