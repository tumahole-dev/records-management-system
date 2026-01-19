import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig'; // Change from 'axios' to this

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set token in localStorage and axios instance
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // The interceptor in axiosConfig.js will handle adding the header
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      // Use axiosInstance instead of axios
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const checkAuth = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Use axiosInstance instead of axios
      const response = await axiosInstance.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      // The interceptor will handle 401/403 errors
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, token }}>
      {children}
    </AuthContext.Provider>
  );
};