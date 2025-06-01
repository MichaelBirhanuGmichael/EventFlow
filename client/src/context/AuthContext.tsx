import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as authApi from '../api/auth';

interface User {
  id: number;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string, email?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      authApi.getCurrentUser(storedToken)
        .then(userData => {
          setUser(userData);
        })
        .catch(error => {
          console.error('Error fetching user with stored token:', error);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = !!user;

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const data = await authApi.login({ username, password });
      setToken(data.access);
      localStorage.setItem('authToken', data.access);
      const userData = await authApi.getCurrentUser(data.access);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    authApi.logout();
  };

  const register = async (username: string, password: string, email?: string) => {
    setLoading(true);
    try {
      await authApi.register({ username, password, email });
      await login(username, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}; 