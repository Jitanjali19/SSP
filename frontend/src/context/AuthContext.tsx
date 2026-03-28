import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { User, AuthResponse, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const ENABLE_AUTH_PERSISTENCE = true; // set false to disable persisted login for dev/testing

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuth();
  }, []);

  const loadAuth = async () => {
    if (!ENABLE_AUTH_PERSISTENCE) {
      setIsLoading(false);
      return;
    }

    const t = await AsyncStorage.getItem('token');
    const u = await AsyncStorage.getItem('user');

    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
      api.defaults.headers.common.Authorization = `Bearer ${t}`;
    }

    setIsLoading(false);
  };

  const login = async (data: AuthResponse) => {
    console.log('LOGIN:', data);

    const normalizedUser = {
      ...data.user,
      role: data.user.role?.toUpperCase() as UserRole,
    };

    setUser(normalizedUser);
    setToken(data.token);

    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

    if (ENABLE_AUTH_PERSISTENCE) {
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common.Authorization;

    // always clear persisted data (when present)
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};