import api from './api';

export const expenseService = {
  // Create new expense
  async createExpense(expenseData) {
    const formData = new FormData();
    
    Object.keys(expenseData).forEach(key => {
      if (expenseData[key] !== undefined && expenseData[key] !== null) {
        formData.append(key, expenseData[key]);
      }
    });
    
    const response = await api.post('/api/expenses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all expenses
  async getExpenses(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/api/expenses?${params.toString()}`);
    return response.data;
  },

  // Get recent expenses
  async getRecentExpenses(limit = 10) {
    const response = await api.get(`/api/expenses/recent?limit=${limit}`);
    return response.data;
  },

  // Get expense by ID
  async getExpense(id) {
    const response = await api.get(`/api/expenses/${id}`);
    return response.data;
  },

  // Update expense
  async updateExpense(id, expenseData) {
    const formData = new FormData();
    
    Object.keys(expenseData).forEach(key => {
      if (expenseData[key] !== undefined && expenseData[key] !== null) {
        formData.append(key, expenseData[key]);
      }
    });
    
    const response = await api.put(`/api/expenses/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete expense
  async deleteExpense(id) {
    const response = await api.delete(`/api/expenses/${id}`);
    return response.data;
  },

  // Get expense statistics
  async getStats(startDate = null, endDate = null) {
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/api/expenses/stats?${params.toString()}`);
    return response.data;
  },


// Get category breakdown
async getCategoryBreakdown() {
  try {
    const response = await api.get('/api/expenses/categories');
    // Ensure the response has the expected structure
    if (response.data && response.data.breakdown) {
      return response.data;
    } else if (response.data && Array.isArray(response.data)) {
      // If the response is already an array
      return { breakdown: response.data };
    }
    return { breakdown: [] };
  } catch (error) {
    console.error('Get category breakdown error:', error);
    // Return empty array instead of throwing error
    return { breakdown: [] };
  }
},

  // Get budget vs actual
  async getBudgetVsActual(month = null) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    
    const response = await api.get(`/api/expenses/budget-vs-actual?${params.toString()}`);
    return response.data;
  },

  // Upload receipt
  async uploadReceipt(file) {
    const formData = new FormData();
    formData.append('receipt_image', file);
    
    const response = await api.post('/api/expenses/upload-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};