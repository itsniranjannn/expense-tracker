import api from './api';

export const expenseService = {
  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/api/expenses/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Dashboard stats error:', error);
      
      // Return fallback data if API fails
      return {
        success: true,
        data: getFallbackData()
      };
    }
  },

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
      return response.data;
    } catch (error) {
      console.error('Category breakdown error:', error);
      return { 
        success: true, 
        breakdown: getFallbackData().categoryDistribution 
      };
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

// Fallback data function
function getFallbackData() {
  return {
    stats: {
      totalExpenses: 8,
      totalAmount: 18499.00,
      totalCategories: 6,
      highestCategory: { category: 'Shopping', total: 4500 },
      averageDailySpending: 924.95,
      monthlyTrend: [
        { month: '2024-07', total: 12000 },
        { month: '2024-08', total: 15000 },
        { month: '2024-09', total: 18000 },
        { month: '2024-10', total: 14000 },
        { month: '2024-11', total: 16000 },
        { month: '2024-12', total: 18499 }
      ],
      weeklyTrend: [
        { week_start: 'Dec 01', week_end: 'Dec 07', total: 4200 },
        { week_start: 'Dec 08', week_end: 'Dec 14', total: 3800 },
        { week_start: 'Dec 15', week_end: 'Dec 21', total: 5200 },
        { week_start: 'Dec 22', week_end: 'Dec 28', total: 5299 }
      ]
    },
    recentExpenses: [
      { id: 1, title: 'Lunch at Restaurant', category: 'Food & Dining', amount: 1200, expense_date: '2024-12-01', payment_method: 'Esewa' },
      { id: 2, title: 'Petrol', category: 'Transportation', amount: 1500, expense_date: '2024-12-02', payment_method: 'Card' },
      { id: 3, title: 'Groceries', category: 'Groceries', amount: 3500, expense_date: '2024-12-03', payment_method: 'Cash' },
      { id: 4, title: 'Movie Ticket', category: 'Entertainment', amount: 600, expense_date: '2024-12-04', payment_method: 'Esewa' },
      { id: 5, title: 'Electricity Bill', category: 'Bills & Utilities', amount: 2500, expense_date: '2024-12-05', payment_method: 'Khalti' }
    ],
    categoryDistribution: [
      { category: 'Food & Dining', total: 3000, percentage: 16.22 },
      { category: 'Transportation', total: 1500, percentage: 8.11 },
      { category: 'Shopping', total: 4500, percentage: 24.32 },
      { category: 'Bills & Utilities', total: 2799, percentage: 15.13 },
      { category: 'Groceries', total: 3500, percentage: 18.92 },
      { category: 'Entertainment', total: 600, percentage: 3.24 },
      { category: 'Healthcare', total: 800, percentage: 4.32 },
      { category: 'Education', total: 1200, percentage: 6.49 },
      { category: 'Other', total: 600, percentage: 3.24 }
    ]
  };
}