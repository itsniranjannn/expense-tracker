import api from './api';

export const budgetService = {
  // Get all budgets - WORKING VERSION
  async getAllBudgets() {
    try {
      console.log('📊 Fetching budgets from API...');
      
      // Your api.js returns response.data directly, so we get the data
      const data = await api.get('/api/budgets');
      
      console.log('📊 Budgets API data:', {
        success: data?.success,
        budgetsCount: data?.budgets?.length,
        fullData: data
      });
      
      // Return in the expected format
      if (data && data.success) {
        return {
          success: true,
          budgets: data.budgets || [],
          message: data.message || 'Budgets fetched successfully'
        };
      } else {
        console.error('❌ Invalid response from API:', data);
        return {
          success: false,
          budgets: [],
          message: data?.message || 'Failed to fetch budgets'
        };
      }
    } catch (error) {
      console.error('❌ Error fetching budgets:', error);
      
      // Return error in expected format
      return {
        success: false,
        budgets: [],
        message: error.message || 'Failed to fetch budgets'
      };
    }
  },

  // Get budget by ID
  async getBudgetById(id) {
    try {
      const data = await api.get(`/api/budgets/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching budget:', error);
      throw error;
    }
  },

  // Create new budget
  async createBudget(budgetData) {
    try {
      const data = await api.post('/api/budgets', budgetData);
      return data;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  },

  // Update budget
  async updateBudget(id, budgetData) {
    try {
      const data = await api.put(`/api/budgets/${id}`, budgetData);
      return data;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  },

  // Delete budget
  async deleteBudget(id) {
    try {
      const data = await api.delete(`/api/budgets/${id}`);
      return data;
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  },

  // Get budget statistics
  async getBudgetStats() {
    try {
      const data = await api.get('/api/budgets/stats');
      return data;
    } catch (error) {
      console.error('Error fetching budget stats:', error);
      throw error;
    }
  }
};
