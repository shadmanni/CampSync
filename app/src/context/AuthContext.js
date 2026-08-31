import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [onboarded, setOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore existing session from storage on startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await authService.getToken();
        const storedUser = await authService.getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          setOnboarded(true);
        }
      } catch (err) {
        console.warn("[AuthContext] Failed to restore session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, otp) => {
    const data = await authService.verifyOtp(email, otp);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const enterCampus = () => {
    setOnboarded(true);
  };

  const logout = async () => {
    await authService.clearSession();
    setToken(null);
    setUser(null);
    setOnboarded(false);
  };

  const refreshProfile = async () => {
    try {
      const data = await authService.getMe();
      if (data?.user) {
        setUser(data.user);
        await authService.saveUser(data.user);
      }
    } catch (err) {
      console.warn("[AuthContext] Failed to refresh profile:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        onboarded,
        isLoading,
        login,
        enterCampus,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
