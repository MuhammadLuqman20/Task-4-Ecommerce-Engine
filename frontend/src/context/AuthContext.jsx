import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('aura_token');
    const storedUser = localStorage.getItem('aura_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse cached user data:', err);
        localStorage.removeItem('aura_token');
        localStorage.removeItem('aura_user');
      }
    }
    setLoading(false);

    const handleAuthLogout = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: receivedToken, ...userData } = response.data.data;

    setToken(receivedToken);
    setUser(userData);
    localStorage.setItem('aura_token', receivedToken);
    localStorage.setItem('aura_user', JSON.stringify(userData));

    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { token: receivedToken, ...userData } = response.data.data;

    setToken(receivedToken);
    setUser(userData);
    localStorage.setItem('aura_token', receivedToken);
    localStorage.setItem('aura_user', JSON.stringify(userData));

    return response.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
