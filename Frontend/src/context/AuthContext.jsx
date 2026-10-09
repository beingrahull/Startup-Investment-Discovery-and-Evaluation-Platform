import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const d = await api.post("/api/auth/login", { email, password });
    setUser(d.user);
    return d.user;
  }

  async function register(payload) {
    const d = await api.post("/api/auth/register", payload);
    return d.user;
  }

  async function logout() {
    await api.post("/api/auth/logout").catch(() => {});
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
