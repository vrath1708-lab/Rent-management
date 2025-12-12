import { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    loadUser();
  }, []);

  // Get currently logged-in user
  const loadUser = async () => {
    try {
      const res = await api.get("/auth/profile");

      // If backend returns user directly
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      });
    } catch (err) {
      console.error("Profile load failed:", err);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // LOGIN FUNCTION
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      // Save token
      localStorage.setItem("token", res.data.token);

      // Save user info from login response
      const currentUser = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      };

      setUser(currentUser);
      setLoading(false);

      // Redirect based on role
      if (currentUser.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/tenant-dashboard";
      }

    } catch (err) {
      console.error("Login Failed:", err);
      throw err; // sends error back to Login.jsx
    }
  };

  // LOGOUT FUNCTION
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
