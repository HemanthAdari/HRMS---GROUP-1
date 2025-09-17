// EmailContext.js
import React, { createContext, useState } from "react";

export const EmailContext = createContext();

const EmailProvider = ({ children }) => {
  const [email, setEmail] = useState(""); // keep email state here

  return (
    <EmailContext.Provider value={{ email, setEmail }}>
      {children}
    </EmailContext.Provider>
  );
};

export default EmailProvider;
