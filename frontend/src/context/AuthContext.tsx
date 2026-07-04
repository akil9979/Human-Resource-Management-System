import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

export interface UserPayload {
  id: string;
  email: string;
  role: 'Admin' | 'HR' | 'Manager' | 'Employee';
}

interface AuthContextType {
  token: string | null;
  user: UserPayload | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserPayload>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('hrms_token');
    const storedUser = localStorage.getItem('hrms_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<UserPayload> => {
    const response = await api.post('/auth/signin', { email, password });
    const { token: returnedToken, user: returnedUser } = response.data;

    localStorage.setItem('hrms_token', returnedToken);
    localStorage.setItem('hrms_user', JSON.stringify(returnedUser));

    setToken(returnedToken);
    setUser(returnedUser);

    return returnedUser as UserPayload;
  };

  const logout = () => {
    localStorage.removeItem('hrms_token');
    localStorage.removeItem('hrms_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
