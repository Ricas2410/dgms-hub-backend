import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { authAPI } from '../services/api';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  // Check for existing token on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      const response = await authAPI.verifyToken();
      if (response.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const { token, user: userData } = response.data;
        
        // Store token
        localStorage.setItem('auth_token', token);
        
        // Set user data
        setUser(userData);
        
        enqueueSnackbar('Login successful', { variant: 'success' });
        return { success: true };
      } else {
        enqueueSnackbar(response.message || 'Login failed', { variant: 'error' });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      enqueueSnackbar(message, { variant: 'error' });
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('auth_token');
      setUser(null);
      enqueueSnackbar('Logged out successfully', { variant: 'info' });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        setUser(response.data.user);
        enqueueSnackbar('Profile updated successfully', { variant: 'success' });
        return { success: true };
      } else {
        enqueueSnackbar(response.message || 'Profile update failed', { variant: 'error' });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      enqueueSnackbar(message, { variant: 'error' });
      return { success: false, message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        enqueueSnackbar('Password changed successfully', { variant: 'success' });
        return { success: true };
      } else {
        enqueueSnackbar(response.message || 'Password change failed', { variant: 'error' });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Password change failed';
      enqueueSnackbar(message, { variant: 'error' });
      return { success: false, message };
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken();
      
      if (response.success) {
        localStorage.setItem('auth_token', response.data.token);
        return { success: true };
      } else {
        // Token refresh failed, logout user
        logout();
        return { success: false };
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
