import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

export type UserRole = 'Admin' | 'HR' | 'Employee';

export interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthResponse {
  token: string;
  user: UserPayload;
}

interface AuthContextType {
  currentUser: UserPayload | null;
  user: UserPayload | null;
  token: string | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserPayload>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<UserPayload | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'hrms_user';

const getStoredUser = (): UserPayload | null => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as UserPayload;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserPayload | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(() => getStoredUser()?.role ?? null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((nextUser: UserPayload, nextToken?: string | null) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    setCurrentUser(nextUser);
    setRole(nextUser.role);

    if (nextToken) {
      setToken(nextToken);
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setCurrentUser(null);
    setToken(null);
    setRole(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<UserPayload | null> => {
    try {
      const response = await api.get('/auth/me');
      const refreshedUser = response.data.user as UserPayload;

      persistSession(refreshedUser);
      return refreshedUser;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession, persistSession]);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<UserPayload> => {
    const response = await api.post('/auth/signin', { email, password });
    const { token: returnedToken, user: returnedUser } = response.data as AuthResponse;

    persistSession(returnedUser, returnedToken);

    return returnedUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        token,
        role,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
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
