"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "./api";
import type { User } from "./api";

interface AuthContextType { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => void; }
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sentinelops_token");
    if (token) {
      api.getMe().then(setUser).catch(() => localStorage.removeItem("sentinelops_token")).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const login = async (email: string, password: string) => { await api.login(email, password); const me = await api.getMe(); setUser(me); };
  const logout = () => { localStorage.removeItem("sentinelops_token"); setUser(null); window.location.href = "/login"; };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error("useAuth doit être dans AuthProvider"); return ctx; }
