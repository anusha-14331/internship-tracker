import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { api, setAuthToken } from "../api/client.js";

const AuthContext = createContext(null);

const STORAGE_KEY = "internship_tracker_auth";

/** Normalize stored user so older sessions with `name` still work. */
function normalizeUser(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: raw.id,
    fullName: raw.fullName ?? raw.name ?? "",
    email: raw.email ?? "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token && parsed?.user) {
          const normalized = normalizeUser(parsed.user);
          setToken(parsed.token);
          setUser(normalized);
          setAuthToken(parsed.token);
          if (normalized && (normalized.fullName !== parsed.user.fullName || parsed.user.name)) {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ token: parsed.token, user: normalized })
            );
          }
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  function persist(nextToken, nextUser) {
    const u = normalizeUser(nextUser);
    setToken(nextToken);
    setUser(u);
    setAuthToken(nextToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: u }));
  }

  async function login(email, password) {
    const { data } = await api.post("/auth/login", {
      email: String(email).trim().toLowerCase(),
      password,
    });
    persist(data.token, data.user);
    return data;
  }

  async function register(fullName, email, password) {
    const { data } = await api.post("/auth/register", {
      fullName: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      password,
    });
    persist(data.token, data.user);
    return data;
  }

  function logout() {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [user, token, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
