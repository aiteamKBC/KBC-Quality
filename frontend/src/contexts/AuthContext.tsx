import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, login as apiLogin, logout as apiLogout, clearTokens, getAccessToken } from '@/lib/api';

interface User {
  id: number;
  username: string;
  full_name: string;
  role: string;
  email: string;
  avatar_url: string;
  initials: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  initialised: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialised, setInitialised] = useState(false);

  // On mount: if a token exists in localStorage, restore the session
  useEffect(() => {
    if (!getAccessToken()) {
      setInitialised(true);
      return;
    }

    api.get<User>('/users/me/')
      .then(setUser)
      .catch(() => {
        // Token is expired or invalid — clear it
        clearTokens();
      })
      .finally(() => setInitialised(true));
  }, []);

  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const response = await apiLogin(email, password);
      // User profile comes embedded in the token response — no extra /me/ call needed
      setUser(response.user);
      return { ok: true };
    } catch (err) {
      clearTokens();
      const message = err instanceof Error ? err.message : 'Login failed';
      // Translate Django's generic auth message into a friendlier one
      const userFacing = message.includes('No active account')
        ? 'No account found with those credentials.'
        : message;
      return { ok: false, error: userFacing };
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, initialised, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
