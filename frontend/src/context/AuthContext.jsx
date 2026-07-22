import React, { createContext, useState, useContext, useEffect } from 'react';
import authApi from '../api/auth.api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false); // ✅ Login loading state

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ User restored:', userData.full_name || userData.username);
      } catch (error) {
        console.error('❌ Error restoring user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    // ✅ Simulate loading for animation
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const login = async (username, password) => {
    setAuthLoading(true); // ✅ Show loading animation
    try {
      const response = await authApi.login({ username, password });
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      
      console.log('✅ Login success:', user.full_name || user.username);
      
      return { success: true, user };
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setAuthLoading(false); // ✅ Hide loading animation
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    setUser,
    loading,
    authLoading, // ✅ Add to context
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};