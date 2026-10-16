import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ae_token') || '');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ae_me')); } catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (!['admin', 'sales_rep'].includes(data.user.role)) {
      throw new Error('Only staff accounts can access the admin console');
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('ae_token', data.token);
    localStorage.setItem('ae_me', JSON.stringify(data.user));
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    localStorage.removeItem('ae_token');
    localStorage.removeItem('ae_me');
  }, []);

  const checkSession = useCallback(async () => {
    if (!token) return false;
    try {
      await api('/api/auth/me');
      return true;
    } catch {
      logout();
      return false;
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, checkSession, isLoggedIn: !!token && !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
