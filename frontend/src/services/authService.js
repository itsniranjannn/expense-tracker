// services/authService.js - FULL UPDATED VERSION
import api from './api';

export const authService = {
  // ✅ FIXED: Register new user
  async register(name, email, password) {
    const userData = {
      name: name.trim(),
      email: email.trim(),
      password: password
    };
    
    console.log('📝 Registering user:', { name: userData.name, email: userData.email });
    
    const response = await api.post('/api/auth/register', userData);
    
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // ✅ FIXED: Login user
  async login(email, password) {
    try {
      const credentials = {
        email: email.trim(),
        password: password
      };
      
      console.log('🔐 Attempting login with:', { email: credentials.email });
      
      const response = await api.post('/api/auth/login', credentials);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  // Get user profile
  async getProfile() {
    const response = await api.get('/api/auth/profile');
    return response;
  },

  // Change password
  async changePassword(passwordData) {
    const response = await api.put('/api/auth/change-password', passwordData);
    return response;
  },

  // Update profile
  async updateProfile(profileData) {
    // Check if profileData is FormData
    if (profileData instanceof FormData) {
      const response = await api.put('/api/auth/profile', profileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } else {
      // If it's a regular object, convert to FormData
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== undefined && profileData[key] !== null) {
          formData.append(key, profileData[key]);
        }
      });
      
      const response = await api.put('/api/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    }
  },

  // Delete account
  async deleteAccount(password) {
    const response = await api.delete('/api/auth/account', {
      data: { password }
    });
    return response;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Check if token is expired (basic check)
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const isExpired = tokenData.exp * 1000 < Date.now();
      return !isExpired;
    } catch (error) {
      return false;
    }
  },

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get auth token
  getToken() {
    return localStorage.getItem('token');
  },

  // Update user in localStorage
  updateLocalUser(userData) {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  },

  // Test connection
  async testConnection() {
    try {
      const response = await api.get('/api/health');
      return response;
    } catch (error) {
      console.error('Connection test failed:', error);
      return { success: false, message: 'Cannot connect to server' };
    }
  },

  // Clear authentication data
  clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if token is about to expire
  isTokenExpiringSoon() {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = tokenData.exp * 1000 - Date.now();
      // If token expires in less than 1 hour
      return expiresIn < 60 * 60 * 1000;
    } catch (error) {
      return true;
    }
  }
};