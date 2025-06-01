import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as authApi from '../api/auth';

interface User {
  id: number;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string, email?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    const data = await authApi.login({ username, password });
    setToken(data.access);
    const userData = await authApi.getCurrentUser(data.access);
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    authApi.logout();
  };

  const register = async (username: string, password: string, email?: string) => {
    await authApi.register({ username, password, email });
    await login(username, password);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}; 