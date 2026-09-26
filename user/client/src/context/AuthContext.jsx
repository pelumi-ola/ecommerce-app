import { createContext, useEffect, useState } from "react";

import api from "../api";

/* eslint-disable react-refresh/only-export-components */

export const AuthContext = createContext();

function getTokenExpiration(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("authToken"));

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  const login = async (email, password) => {
    const response = await api.post("/user/login", {
      email,
      password,
    });

    const data = response.data;

    localStorage.setItem("authToken", data.authToken);

    const userData = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    };

    localStorage.setItem("user", JSON.stringify(userData));

    setToken(data.authToken);
    setUser(userData);

    return data;
  };

  const register = async (name, email, password) => {
    const response = await api.post("/user/register", {
      name,
      email,
      password,
    });

    return response.data;
  };

  const googleLogin = async (credential) => {
    const response = await api.post("/user/google-login", {
      credential,
    });

    const data = response.data;

    localStorage.setItem("authToken", data.authToken);

    const userData = {
      id: data.id,
      name: data.name,
      email: data.email,
      picture: data.picture || null,
      role: data.role,
    };

    localStorage.setItem("user", JSON.stringify(userData));

    setToken(data.authToken);
    setUser(userData);

    return data;
  };

  /*
   * Automatically logout when JWT expires.
   */
  useEffect(() => {
    if (!token) return;

    const expiresAt = getTokenExpiration(token);

    if (!expiresAt) {
      logout();
      return;
    }

    const remainingTime = expiresAt - Date.now();

    // Token has already expired.
    if (remainingTime <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      logout();
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
