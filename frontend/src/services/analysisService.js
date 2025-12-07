import api from './api';

export const analysisService = {
  // Run K-Means clustering
  async runClustering(k = null) {
    const response = await api.post('/api/analysis/cluster', { k });
    return response.data;
  },

  // Get analysis results
  async getAnalyses() {
    const response = await api.get('/api/analysis/results');
    return response.data;
  },

  // Get spending insights
  async getSpendingInsights() {
    const response = await api.get('/api/analysis/insights');
    return response.data;
  },

  // Get visualization data
  async getVisualizationData(analysisId = null) {
    const params = new URLSearchParams();
    if (analysisId) params.append('analysisId', analysisId);
    
    const response = await api.get(`/api/analysis/visualize?${params.toString()}`);
    return response.data;
  }
};