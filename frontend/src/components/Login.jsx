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
  const [registering, setRegistering] = useState(false); // disable while in progress

  // ---------- LOGIN: calls backend API ----------
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/auth/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: username, password: password })
      });

      console.log("Login response status:", response.status);

      if (!response.ok) {
        let text = "";
        try {
          text = await response.text();
        } catch {
          text = "(no response body)";
        }
        alert(`Login failed: ${response.status} — ${text}`);
        return;
      }

      const data = await response.json();
      console.log("Login success, response body:", data);
      alert(`Login successful: ${data.email || username}`);

      // redirect if you want
      // window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      alert("Login error: " + (err.message || err));
    }
  };

  // ---------- REGISTER: calls backend API ----------
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!regName || !regEmail || !regContact || !regPassword || !regConfirm) {
      alert("Please fill all registration fields.");
      return;
    }
    if (regPassword !== regConfirm) {
      alert("Passwords do not match ❌");
      return;
    }

    setRegistering(true);
    try {
      // Send name and contact as well (backend must accept these or ignore)
      const res = await fetch("http://localhost:8080/auth/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          contact: regContact,
          email: regEmail,
          password: regPassword,
          role: "employee"
        })
      });

      console.log("Register response status:", res.status);

      // Try to read JSON body (if server returned JSON)
      let body = null;
      try {
        body = await res.json();
      } catch (e) {
        body = null;
      }

      if (res.status === 400) {
        // backend returns 400 for validation/duplicate
        const msg = (body && body.error) ? body.error : "Bad request";
        alert("Registration failed: " + msg);
        return;
      }

      if (!res.ok) {
        // 500 or other error
        const serverMsg = (body && body.error) ? body.error : (await res.text().catch(() => ""));
        alert("Registration error: " + res.status + " — " + serverMsg);
        return;
      }

      // success (200 OK)
      console.log("Register success, response:", body);
      alert("Registration successful ✅\nPlease login with your new account.");

      // reset fields and switch to login tab
      setRegName("");
      setRegEmail("");
      setRegContact("");
      setRegPassword("");
      setRegConfirm("");
      setActiveTab("login");
    } catch (err) {
      console.error("Register error:", err);
      alert("Register failed: " + (err.message || err));
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-illustration">
          <img src={illustration} alt="HR Illustration" />
        </div>

        <div className="login-form">
          <h2>
            <span className="highlight">HR</span> PORTAL
          </h2>

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

              <button type="submit" className="login-btn" disabled={registering}>
                {registering ? "Registering..." : "Register"}
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
