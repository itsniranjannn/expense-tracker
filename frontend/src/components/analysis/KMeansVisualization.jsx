import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { Brain, Filter, Target, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

const KMeansVisualization = ({ analysisResult }) => {
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [viewMode, setViewMode] = useState('scatter'); // 'scatter' or 'insights'

  if (!analysisResult || !analysisResult.insights) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No analysis data available</p>
          <p className="text-sm text-gray-400 mt-1">Run K-Means analysis to see visualization</p>
        </div>
      </div>
    );
  }

  const { insights, centroids } = analysisResult;
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Prepare scatter plot data
  const scatterData = [];
  insights.clusterDetails.forEach((cluster, clusterIndex) => {
    if (cluster.examples) {
      cluster.examples.forEach(expense => {
        scatterData.push({
          x: Math.random() * 100, // For demo - replace with actual coordinates
          y: expense.amount,
          z: cluster.size,
          cluster: cluster.clusterId,
          category: expense.category,
          name: expense.title,
          amount: expense.amount
        });
      });
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">K-Means Analysis</h3>
          <p className="text-sm text-gray-600">AI-powered expense clustering</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <button
            onClick={() => setViewMode('scatter')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${viewMode === 'scatter' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Target className="w-4 h-4 inline mr-1" />
            Clusters
          </button>
          <button
            onClick={() => setViewMode('insights')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${viewMode === 'insights' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Brain className="w-4 h-4 inline mr-1" />
            Insights
          </button>
        </div>
      </div>

      {viewMode === 'scatter' ? (
        /* Scatter Plot View */
        <div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Feature 1"
                  stroke="#666"
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Amount (₹)"
                  stroke="#666"
                  tickFormatter={(value) => `₹${value}`}
                />
                <ZAxis type="number" dataKey="z" range={[50, 300]} name="Size" />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'Amount (₹)') return [`₹${value}`, name];
                    if (name === 'y') return [`₹${value}`, 'Amount'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => ''}
                />
                <Legend />
                {Array.from(new Set(scatterData.map(d => d.cluster))).map((clusterId, index) => (
                  <Scatter
                    key={clusterId}
                    name={`Cluster ${clusterId}`}
                    data={scatterData.filter(d => d.cluster === clusterId)}
                    fill={colors[index % colors.length]}
                    shape="circle"
                  >
                    {scatterData
                      .filter(d => d.cluster === clusterId)
                      .map((entry, entryIndex) => (
                        <Cell key={`cell-${entryIndex}`} fill={colors[index % colors.length]} />
                      ))
                    }
                  </Scatter>
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          {/* Cluster Summary */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            {insights.clusterDetails.map((cluster, index) => (
              <button
                key={cluster.clusterId}
                onClick={() => setSelectedCluster(selectedCluster === cluster.clusterId ? null : cluster.clusterId)}
                className={`p-3 rounded-lg border text-left transition-all ${selectedCluster === cluster.clusterId ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">Cluster {cluster.clusterId}</span>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{cluster.averageAmount?.toFixed(0) || '0'}
                </p>
                <p className="text-xs text-gray-600">
                  {cluster.size} expenses • {cluster.mostCommonCategory}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Insights View */
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Total Clusters</p>
              <p className="text-2xl font-bold text-gray-900">{insights.totalClusters}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{insights.summary?.totalExpenses || 0}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-700 font-medium">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{insights.summary?.totalSpent?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-700 font-medium">Avg per Expense</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{insights.summary?.averagePerExpense?.toFixed(2) || '0'}
              </p>
            </div>
          </div>

          {/* Spending Patterns */}
          {insights.spendingPatterns && insights.spendingPatterns.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Spending Patterns Found
              </h4>
              <div className="space-y-2">
                {insights.spendingPatterns.map((pattern, index) => (
                  <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{pattern}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations && insights.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                AI Recommendations
              </h4>
              <div className="space-y-2">
                {insights.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Cluster Info */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <PieChartIcon className="w-4 h-4 mr-2" />
              Cluster Details
            </h4>
            <div className="space-y-3">
              {insights.clusterDetails.map((cluster, index) => (
                <div key={cluster.clusterId} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="font-semibold text-gray-900">
                        Cluster {cluster.clusterId}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {cluster.size} expenses
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Avg Amount</p>
                      <p className="font-semibold">₹{cluster.averageAmount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Amount</p>
                      <p className="font-semibold">₹{cluster.totalAmount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Top Category</p>
                      <p className="font-semibold">{cluster.mostCommonCategory}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Range</p>
                      <p className="font-semibold">
                        ₹{cluster.minAmount?.toFixed(0)} - ₹{cluster.maxAmount?.toFixed(0)}
                      </p>
                    </div>
                  </div>
                  
                  {cluster.examples && cluster.examples.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-600 mb-1">Example Expenses:</p>
                      <div className="flex flex-wrap gap-2">
                        {cluster.examples.map((exp, expIndex) => (
                          <span key={expIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {exp.title} (₹{exp.amount})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default KMeansVisualization;