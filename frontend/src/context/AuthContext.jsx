import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('eduflow_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and check current token session
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const data = await authAPI.getMe();
          if (data && data.user) {
            setUser(data.user);
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error('[Auth] Failed to restore session:', error.message);
          handleLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const handleLogin = (authToken, authUser) => {
    localStorage.setItem('eduflow_token', authToken);
    setToken(authToken);
    setUser(authUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('eduflow_token');
    setToken(null);
    setUser(null);
  };

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    handleLogin(data.token, data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authAPI.register(userData);
    handleLogin(data.token, data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      handleLogout();
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isStudent: user?.role === 'STUDENT',
    isInstructor: user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN',
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
