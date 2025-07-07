'use client';

import { ApolloProvider } from '@apollo/client';
import { useEffect } from 'react';
import client from '../lib/apollo-client';
import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '../lib/utils';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = authUtils.getToken();
    const savedUser = authUtils.getUser();
    if (token && savedUser && !authUtils.isTokenExpired(token)) {
      setUser(savedUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      authUtils.clearAuthData();
    }
    setIsLoading(false);
  }, []);

  const login = (userData, token) => {
    authUtils.setAuthData(token, userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    setIsLoggingOut(true);
    await new Promise(res => setTimeout(res, 700));
    authUtils.clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    setIsLoggingOut(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, isLoggingOut, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default function Providers({ children }) {
  useEffect(() => {
    // Charger le CSS Leaflet côté client
    import('leaflet/dist/leaflet.css');
  }, []);

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
} 