import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { endpoints } from "../api/endpoints";
import { http } from "../api/http";
import { AuthLoginResponse, Role, User } from "../api/types";
import { tokenStorage } from "./tokenStorage";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { age?: number | null; phone?: string | null; fullName?: string }) => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Try to load session if tokens exist
    (async () => {
      try {
        const access = tokenStorage.getAccessToken();
        if (!access) {
          setUser(null);
          setIsAuthenticated(false);
          return;
        }
        // fetch current user (will refresh if access expired via http.ts)
        const data = await http.get<{ user: User }>(endpoints.auth.me, true);
        setUser(data.user);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
        tokenStorage.clear();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const data = await http.post<AuthLoginResponse>(
      endpoints.auth.login,
      { email, password },
      false
    );
    tokenStorage.setAccessToken(data.accessToken);
    tokenStorage.setRefreshToken(data.refreshToken);
    setUser(data.user);
    setIsAuthenticated(true);
  }

  async function register(fullName: string, email: string, password: string) {
    await http.post<void>(endpoints.auth.register, { fullName, email, password }, false);
    // Option: auto-login after register
    await login(email, password);
  }

  async function updateProfile(data: { age?: number | null; phone?: string | null; fullName?: string }) {
    const result = await http.put<{ user: User }>(endpoints.auth.profile, data, true);
    setUser(result.user);
  }
  async function logout() {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      await http.post<void>(endpoints.auth.logout, { refreshToken }, true);
    } catch {
      // ignore
    } finally {
      tokenStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
    }
  }

  function hasRole(...roles: Role[]) {
    if (!user) return false;
    return roles.includes(user.role);
  }

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile,
      hasRole
    }),
    [user, isLoading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}






