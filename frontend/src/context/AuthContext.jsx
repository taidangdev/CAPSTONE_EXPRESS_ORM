import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as userApi from "../api/userApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  // "loading" chỉ đúng lúc đầu app khởi động: kiểm tra token cũ trong
  // localStorage còn dùng được không, tránh nháy màn hình đăng nhập.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const me = await userApi.getMe();
        if (!cancelled) {
          setUser(me);
          setToken(savedToken);
        }
      } catch {
        localStorage.removeItem("token");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  }, []);

  // axiosClient bắn sự kiện này khi API trả 401, để tự đăng xuất mà không
  // cần axiosClient biết gì về React/router.
  useEffect(() => {
    window.addEventListener("auth:unauthorized", logout);
    return () => window.removeEventListener("auth:unauthorized", logout);
  }, [logout]);

  const login = useCallback((nextUser, nextToken) => {
    localStorage.setItem("token", nextToken);
    setUser(nextUser);
    setToken(nextToken);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = { user, token, loading, isAuthenticated: Boolean(token), login, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  return ctx;
}
