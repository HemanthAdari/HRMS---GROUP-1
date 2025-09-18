// EmailContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const EmailContext = createContext();

const EmailProvider = ({ children }) => {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState("");

  // Load saved values on startup
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedUserId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("role");

    if (storedEmail) setEmail(storedEmail);
    if (storedUserId) setUserId(parseInt(storedUserId, 10));
    if (storedRole) setRole(storedRole);
  }, []);

  // Sync values into localStorage
  useEffect(() => {
    if (email) localStorage.setItem("email", email);
  }, [email]);

  useEffect(() => {
    if (userId !== null) localStorage.setItem("userId", String(userId));
  }, [userId]);

  useEffect(() => {
    if (role) localStorage.setItem("role", role);
  }, [role]);

  return (
    <EmailContext.Provider value={{ email, setEmail, userId, setUserId, role, setRole }}>
      {children}
    </EmailContext.Provider>
  );
};

export default EmailProvider;
