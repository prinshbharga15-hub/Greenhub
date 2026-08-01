import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('greenhub_token');
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.error('Failed to load user info', err);
          localStorage.removeItem('greenhub_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('greenhub_token', res.data.token);
      setUser(res.data.user);
      setLoading(false);
      return res.data.user;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.error || 'Login failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (name, email, password, phone, address) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', { name, email, password, phone, address });
      localStorage.setItem('greenhub_token', res.data.token);
      setUser(res.data.user);
      setLoading(false);
      return res.data.user;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.error || 'Registration failed.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await api.put('/api/profile', profileData);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to update profile.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('greenhub_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
