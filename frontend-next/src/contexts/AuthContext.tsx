"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api, SessionResponse, User } from "@/lib/api";
import { clearStoredToken, getStoredToken, storeToken } from "@/lib/authToken";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  requiresOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  ssoLogin: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresOnboarding, setRequiresOnboarding] = useState(false);

  const applySession = (session: SessionResponse) => {
    setUser(session.user);
    setRequiresOnboarding(session.onboarding_required);
  };

  const restoreAccessTokenFromRefreshCookie = useCallback(async () => {
    const refreshedSession = await api.refreshAuth();
    storeToken(refreshedSession.access_token);
  }, []);

  const refreshSession = useCallback(async () => {
    const token = getStoredToken();

    try {
      if (!token) {
        await restoreAccessTokenFromRefreshCookie();
      }

      const session = await api.getSession();
      applySession(session);
    } catch {
      try {
        await restoreAccessTokenFromRefreshCookie();
        const session = await api.getSession();
        applySession(session);
      } catch {
        clearStoredToken();
        setUser(null);
        setRequiresOnboarding(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [restoreAccessTokenFromRefreshCookie]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const authenticate = async (
    action: () => Promise<{ access_token: string }>,
  ) => {
    const result = await action();
    storeToken(result.access_token);
    const session = await api.getSession();
    applySession(session);
  };

  const login = async (email: string, password: string) => {
    await authenticate(() => api.login(email, password));
  };

  const ssoLogin = async (token: string) => {
    await authenticate(() => api.consumeSsoToken(token));
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      toast.error("Session logout request failed, clearing local session.");
    } finally {
      clearStoredToken();
      setUser(null);
      setRequiresOnboarding(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        isLoading,
        requiresOnboarding,
        login,
        ssoLogin,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
