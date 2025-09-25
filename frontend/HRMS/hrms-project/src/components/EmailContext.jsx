// src/components/EmailContext.jsx
import React, { createContext, useState } from "react";

export const EmailContext = createContext();

const EmailProvider = ({ children }) => {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState("");

  return (
    <EmailContext.Provider value={{ email, setEmail, userId, setUserId, role, setRole }}>
      {children}
    </EmailContext.Provider>
  );
};

export default EmailProvider;
