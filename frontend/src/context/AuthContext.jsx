// context/AuthContext.jsx - FULL UPDATED VERSION
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getProfile();
          setUser(userData.user);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // ✅ FIXED: Login function
  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const { token, user } = response;
    
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    return response;
  };

  // ✅ FIXED: Register function
  const register = async (name, email, password) => {
    const response = await authService.register(name, email, password);
    const { token, user } = response;
    
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const response = await authService.updateProfile(profileData);
    setUser(response.user);
    return response;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};