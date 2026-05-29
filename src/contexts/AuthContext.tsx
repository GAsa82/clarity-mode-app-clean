import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  type AuthUser,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  signIn as authSignIn,
  signUp as authSignUp,
  signOutUser,
} from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => AuthUser | null;
  signUp: (email: string, password: string, name: string) => AuthUser | null;
  signOut: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const signIn = (email: string, password: string) => {
    const u = authSignIn(email, password);
    setUser(u);
    return u;
  };

  const signUp = (email: string, password: string, name: string) => {
    const u = authSignUp(email, password, name);
    setUser(u);
    return u;
  };

  const signOut = () => {
    signOutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin: user?.role === "admin",
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