import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("campussync_user");
    return saved ? JSON.parse(saved) : {
      id: "u-demo",
      email: "alex.tech@college.edu",
      name: "Alex Rivera",
      department: "Computer Science",
      hostel: "Block B",
      isVerified: true
    };
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("campussync_user", JSON.stringify(userData));
    localStorage.setItem("campussync_token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("campussync_user");
    localStorage.removeItem("campussync_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthModalOpen, setIsAuthModalOpen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
