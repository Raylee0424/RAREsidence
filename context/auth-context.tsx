"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type { AuthResponse, SessionUser } from "@/lib/types";

interface AuthContextType {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<SessionUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The session cookie is httpOnly, so ask the API who we are instead of
  // decoding a token in the browser. A 401 here just means "logged out".
  useEffect(() => {
    // Tokens used to live here; clear any left over from before cookies.
    localStorage.removeItem("token");

    let cancelled = false;
    apiGet<SessionUser>("/users/me", { allowUnauthorized: true })
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<SessionUser> => {
    // The API sets the session cookie on this response.
    const { user: loggedIn } = await apiPost<AuthResponse>("/auth/login", { email, password });
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(async () => {
    // Only the server can clear an httpOnly cookie.
    await apiPost("/auth/logout").catch(() => {});
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
