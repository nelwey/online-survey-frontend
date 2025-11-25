/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  createdAt: string;
}

interface StoredAuth {
  user: User;
  token: string;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null, token?: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = 'online_survey_auth';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const parsed: StoredAuth = JSON.parse(storedAuth);
        setUserState(parsed.user);
        setToken(parsed.token);
        apiClient.setAuthToken(parsed.token);
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  const setUser = (newUser: User | null, newToken?: string | null) => {
    setUserState(newUser);

    if (newToken !== undefined) {
      setToken(newToken);
      apiClient.setAuthToken(newToken);
    } else if (!newUser) {
      setToken(null);
      apiClient.setAuthToken(null);
    }

    const tokenToStore = newToken ?? token;

    if (newUser && tokenToStore) {
      const payload: StoredAuth = { user: newUser, token: tokenToStore };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const logout = () => {
    setUser(null, null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        setUser,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

