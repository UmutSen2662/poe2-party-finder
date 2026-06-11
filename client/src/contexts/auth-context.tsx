import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/eden";

export interface AuthUser {
  id: number;
  ign: string;
  email: string | null;
  hostRating: number;
  customerRating: number;
  hostThumbsUp: number;
  hostThumbsDown: number;
  customerThumbsUp: number;
  customerThumbsDown: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  serverError: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async (authToken: string) => {
      try {
        const response = await api.auth.me.get({
          $fetch: {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        });
        setUser(response.data);
        setServerError(false);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setServerError(true);
      } finally {
        setLoading(false);
      }
    };

    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.auth.login.post({ email, password });
    if (!response.data) {
      throw new Error("Login failed");
    }
    setToken(response.data.token);
    setUser(response.data.user);
    setServerError(false);
    localStorage.setItem(TOKEN_KEY, response.data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setServerError(false);
    localStorage.removeItem(TOKEN_KEY);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    serverError,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
