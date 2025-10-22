import React, { createContext, useState, useEffect, useCallback } from 'react';
import { AUTH_KEY, API_URL } from '../config/constants';

const TOKEN_KEY = 'magiloc-auth-token';
const TOKEN_EXPIRY_KEY = 'magiloc-token-expiry';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Vérifier d'abord si un token valide existe
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (token && expiry && new Date().getTime() < parseInt(expiry)) {
      return true;
    }

    // Fallback à l'ancienne méthode pour compatibilité
    return localStorage.getItem(AUTH_KEY) === 'true';
  });

  const [token, setToken] = useState(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (token && expiry && new Date().getTime() < parseInt(expiry)) {
      return token;
    }
    return null;
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (password) => {
    setLoading(true);
    setError(null);

    try {
      // Essayer d'authentifier avec JWT d'abord
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        throw new Error('Invalid password');
      }

      const data = await response.json();
      const newToken = data.token;

      // Stocker le token et sa date d'expiration
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(TOKEN_EXPIRY_KEY, (new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toString());

      // Compatibilité: garder aussi l'ancienne clé
      localStorage.setItem(AUTH_KEY, 'true');

      setToken(newToken);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('❌ Login error:', err.message);
      setError(err.message);
      setLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(AUTH_KEY);
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const getToken = useCallback(() => {
    return token;
  }, [token]);

  const getAuthHeader = useCallback(() => {
    if (token) {
      return {
        'Authorization': `Bearer ${token}`
      };
    }
    return {};
  }, [token]);

  // Vérifier la validité du token périodiquement (optionnel)
  useEffect(() => {
    if (token) {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (expiry && new Date().getTime() > parseInt(expiry)) {
        logout();
      }
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      token,
      getToken,
      getAuthHeader,
      error,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
