
import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser || savedUser === "undefined") {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      localStorage.removeItem("user");
      return null;
    }
  });

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password
    });

    const userData = response.data.user;
    const token = response.data.token;

    if (!userData || !token) {
      throw new Error("Invalid login response from server");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);

    return response.data;
  };

  const register = async (name, email, password) => {
    return api.post("/auth/register", {
      name,
      email,
      password
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
