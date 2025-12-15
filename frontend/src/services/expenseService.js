import api from './api';

export const expenseService = {
  // Get all expenses for current user
  async getAllExpenses(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters if provided
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.category) params.append('category', filters.category);
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
      
      const queryString = params.toString();
      const url = queryString ? `/api/expenses?${queryString}` : '/api/expenses';
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },

  // Create new expense (with file upload support)
  async createExpense(expenseData) {
    try {
      // Check if expenseData is FormData or regular object
      let dataToSend;
      let config = {};
      
      if (expenseData instanceof FormData) {
        dataToSend = expenseData;
        config.headers = {
          'Content-Type': 'multipart/form-data',
        };
      } else {
        dataToSend = expenseData;
      }
      
      const response = await api.post('/api/expenses', dataToSend, config);
      return response;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  },

  // Add alias for createExpense
  async addExpense(expenseData) {
    return this.createExpense(expenseData);
  },

  // Update expense
  async updateExpense(id, expenseData) {
    try {
      const response = await api.put(`/api/expenses/${id}`, expenseData);
      return response;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  // Delete expense
  async deleteExpense(id) {
    try {
      const response = await api.delete(`/api/expenses/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },

  // Get recent expenses
  async getRecentExpenses(limit = 10) {
    try {
      const response = await api.get(`/api/expenses/recent?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Error fetching recent expenses:', error);
      throw error;
    }
  },

  // Get expense by ID
  async getExpenseById(id) {
    try {
      const response = await api.get(`/api/expenses/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching expense:', error);
      throw error;
    }
  },

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/api/expenses/dashboard-stats');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get category breakdown
  async getCategoryBreakdown() {
    try {
      const response = await api.get('/api/expenses/categories');
      return response;
    } catch (error) {
      console.error('Error fetching category breakdown:', error);
      throw error;
    }
  },

  // Upload receipt image
  async uploadReceipt(expenseId, file) {
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      
      const response = await api.post(`/api/expenses/${expenseId}/receipt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      throw error;
    }
  }
};