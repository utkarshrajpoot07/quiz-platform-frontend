import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

/* ── helper — decode token safely ── */

const decodeToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return {
      token,
      UserId : decoded.UserId
               || decoded.userId
               || decoded.sub
               || "",

      // ✅ FIX — .NET long claim names
      name   : decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
               || decoded.name
               || decoded.Name
               || "",

      email  : decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
               || decoded.email
               || decoded.Email
               || "",

      role   : decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
               || decoded.role
               || decoded.Role
               || "",
    };
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? decodeToken(token) : null;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      setUser(decoded);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setUser(decodeToken(token));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      // ✅ Direct access — no user?.name needed anywhere
      token  : user?.token,
      UserId : user?.UserId,
      name   : user?.name,
      email  : user?.email,
      role   : user?.role,
    }}>
      {children}
    </AuthContext.Provider>
  );

};