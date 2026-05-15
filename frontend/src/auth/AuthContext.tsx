import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { loginRequest } from "../api/authApi";
import { setAuthToken } from "../api/http";
import { clearStoredAuth, getStoredAuth, setStoredAuth } from "./authStorage";
import type { AuthSession, LoginCredentials } from "./types";

type AuthContextValue = {
  session: AuthSession | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredAuth());

  useEffect(() => {
    setAuthToken(session?.token ?? null);
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      login: async (credentials) => {
        const nextSession = await loginRequest(credentials);

        setStoredAuth(nextSession);
        setSession(nextSession);
      },
      logout: () => {
        clearStoredAuth();
        setSession(null);
      }
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
