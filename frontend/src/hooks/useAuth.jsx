import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { TOKEN_KEY, USER_KEY, ROLES } from '../utils/constants';
import { getErrorMessage } from '../utils/formatters';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const persistAuth = useCallback((token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.getProfile();
      setUser(data);
      localStorage.setItem(USER_KEY, JSON.stringify(data));
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email, password) => {
    setError(null);
    try {
      const { data: tokenData } = await authAPI.login({ email, password });
      localStorage.setItem(TOKEN_KEY, tokenData.access_token);
      const { data: profile } = await authAPI.getProfile();
      persistAuth(tokenData.access_token, profile);
      return profile;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      await authAPI.register(formData);
      return await login(formData.email, formData.password);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    clearAuth();
  };

  const isAdmin = user?.role === ROLES.ADMIN;
  const isAgent = user?.role === ROLES.SUPPORT_AGENT;
  const isStaff = isAdmin || isAgent;
  const hasRole = (...roles) => roles.includes(user?.role);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout, isAdmin, isAgent, isStaff, hasRole, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
