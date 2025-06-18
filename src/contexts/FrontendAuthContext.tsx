
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  userId: string;
  username: string;
  role: string;
}

interface FrontendAuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const FrontendAuthContext = createContext<FrontendAuthContextType | undefined>(undefined);

export const FrontendAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Decode JWT payload helper
  const parseJwt = (token: string): User | null => {
    try {
      const base64Payload = token.split('.')[1];
      const payload = atob(base64Payload);
      const decoded = JSON.parse(payload);
      return {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (token) {
      const parsedUser = parseJwt(token);
      if (parsedUser) {
        setUser(parsedUser);
      } else {
        // Invalid token, clear it
        localStorage.removeItem('jwt_token');
        setToken(null);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('jwt_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return (
    <FrontendAuthContext.Provider value={value}>
      {children}
    </FrontendAuthContext.Provider>
  );
};

export const useFrontendAuth = () => {
  const context = useContext(FrontendAuthContext);
  if (context === undefined) {
    throw new Error('useFrontendAuth must be used within a FrontendAuthProvider');
  }
  return context;
};
