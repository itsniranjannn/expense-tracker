import api from './api';

export const analysisService = {
  // Run K-Means clustering - FIXED VERSION
  async runClustering(k = null, algorithm = 'kmeans-v2') {
    try {
      console.log('🚀 Starting K-Means clustering...');
      
      const requestData = { 
        k: k || 3,
        algorithm,
        features: ['amount', 'category', 'date'] 
      };
      
      console.log('📤 Request data:', requestData);
      
      // Use the api instance that already has interceptors
      const response = await api.post('/api/analysis/cluster', requestData);
      console.log('📥 Received response:', response);
      
      // ✅ FIXED: Directly return the response (axios interceptor already returns data)
      // The response IS the data object from backend
      return response;
      
    } catch (error) {
      console.error('❌ Clustering failed:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to run K-Means analysis';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.success === false && error.message) {
        // Already in correct format from interceptor
        errorMessage = error.message;
      }
      
      console.error('Error details:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data
      });
      
      throw new Error(errorMessage);
    }
  },

  // Get all analyses for user
  async getAnalyses() {
    try {
      const response = await api.get('/api/analysis/results');
      console.log('📋 Analyses response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch analyses:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { success: false, message: 'Please login again' };
      }
      
      return {
        success: false,
        analyses: [],
        count: 0,
        message: 'Could not load analyses'
      };
    }
  },

  // Get spending insights
  async getSpendingInsights() {
    try {
      const response = await api.get('/api/analysis/insights');
      console.log('💡 Insights response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch insights:', error);
      
      if (error.response?.status === 401) {
        window.location.href = '/login';
        return { success: false, message: 'Please login again' };
      }
      
      return {
        success: true,
        insights: {
          recommendations: [],
          statistics: {
            totalExpenses: 0,
            totalSpent: 0,
            averageExpense: 0
          }
        },
        summary: {
          message: 'Add more expenses for personalized insights',
          confidence: '0%'
        }
      };
    }
  },

  // Get visualization data
  async getVisualizationData(analysisId = null) {
    try {
      let url = '/api/analysis/visualize';
      if (analysisId) {
        url += `?analysisId=${analysisId}`;
      }
      const response = await api.get(url);
      console.log('📈 Visualization response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch visualization data:', error);
      
      if (error.response?.status === 401) {
        window.location.href = '/login';
        return { success: false, message: 'Please login again' };
      }
      
      return {
        success: true,
        clusters: [],
        scatterData: [],
        lineData: [],
        categoryData: [],
        paymentData: [],
        statistics: {
          totalPoints: 0,
          totalAmount: 0,
          averageAmount: 0
        },
        message: 'Run K-Means analysis to generate visualization data'
      };
    }
  },

  // Delete analysis
  async deleteAnalysis(id) {
    try {
      const response = await api.delete(`/api/analysis/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete analysis:', error);
      
      if (error.response?.status === 401) {
        window.location.href = '/login';
        throw new Error('Please login again');
      }
      
      throw new Error('Failed to delete analysis. Please try again.');
    }
  },

  // Test function to debug the API directly
  async testApiDirectly() {
    try {
      console.log('🧪 Testing API directly...');
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/analysis/cluster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          k: 3, 
          algorithm: 'kmeans-v2', 
          features: ['amount', 'category', 'date'] 
        })
      });
      
      const data = await response.json();
      console.log('Direct fetch response:', data);
      return data;
    } catch (error) {
      console.error('Direct API test failed:', error);
      throw error;
    }
  }
};