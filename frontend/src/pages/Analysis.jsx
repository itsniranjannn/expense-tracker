import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { analysisService } from '../services/analysisService';
import { expenseService } from '../services/expenseService';
import KMeansVisualization from '../components/analysis/KMeansVisualization';
import { 
  Brain, TrendingUp, PieChart, BarChart3, 
  RefreshCw, Download, Filter, AlertCircle,
  ChevronRight, Clock, Zap, Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AnalysisPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [previousAnalyses, setPreviousAnalyses] = useState([]);
  const [expenseCount, setExpenseCount] = useState(0);
  const [selectedK, setSelectedK] = useState(3);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get expense count
      const expensesRes = await expenseService.getRecentExpenses();
      setExpenseCount(expensesRes.expenses?.length || 0);
      
      // Get previous analyses
      const analysesRes = await analysisService.getAnalyses();
      setPreviousAnalyses(analysesRes.analyses || []);
      
    } catch (error) {
      console.error('Error fetching analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (expenseCount < 3) {
      toast.error('Need at least 3 expenses to run analysis');
      return;
    }

    try {
      setAnalyzing(true);
      toast.loading('Running K-Means analysis...');
      
      const result = await analysisService.runClustering(selectedK);
      
      if (result.success) {
        setAnalysisResult(result);
        toast.success(`Analysis completed! Found ${result.clusters} clusters`);
        
        // Refresh previous analyses
        fetchData();
      } else {
        toast.error(result.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to run analysis');
    } finally {
      setAnalyzing(false);
      toast.dismiss();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analysis data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              AI-Powered Expense Analysis
            </h1>
            <p className="text-gray-600 mt-1">
              Using K-Means Clustering Algorithm to analyze spending patterns
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={fetchData}
              className="btn-secondary flex items-center space-x-2"
              disabled={analyzing}
            >
              <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{expenseCount}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {expenseCount >= 3 ? 'Ready for analysis' : 'Need at least 3 expenses'}
            </p>
          </div>
          
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Previous Analyses</p>
                <p className="text-2xl font-bold text-gray-900">{previousAnalyses.length}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Total analyses performed
            </p>
          </div>
          
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Optimal Clusters</p>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedK}
                    onChange={(e) => setSelectedK(parseInt(e.target.value))}
                    className="bg-transparent border-none text-2xl font-bold text-gray-900 focus:outline-none"
                    disabled={analyzing}
                  >
                    {[2, 3, 4, 5, 6].map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  <span className="text-gray-900">clusters</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">Number of clusters for analysis</p>
          </div>
          
          <div className="glass-card rounded-xl p-6">
            <button
              onClick={runAnalysis}
              disabled={analyzing || expenseCount < 3}
              className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg text-white hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-8 h-8 mb-2 animate-spin" />
                  <span className="font-semibold">Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="w-8 h-8 mb-2" />
                  <span className="font-semibold">Run Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Current Analysis */}
        <div className="lg:col-span-2">
          {analysisResult ? (
            <KMeansVisualization analysisResult={analysisResult} />
          ) : (
            <div className="card">
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Analysis Results Yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Click "Run Analysis" to use K-Means clustering algorithm to find patterns in your expenses
                </p>
                <button
                  onClick={runAnalysis}
                  disabled={analyzing || expenseCount < 3}
                  className="btn-primary inline-flex items-center"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Run K-Means Analysis
                </button>
              </div>
            </div>
          )}
          
          {/* Algorithm Explanation */}
          <div className="card mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 How K-Means Algorithm Works</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Initialization</h4>
                  <p className="text-sm text-gray-600">
                    Randomly select K points as initial cluster centroids
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Assignment</h4>
                  <p className="text-sm text-gray-600">
                    Assign each expense to the nearest centroid based on amount and date
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Update</h4>
                  <p className="text-sm text-gray-600">
                    Recalculate centroids as the mean of all points in the cluster
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Convergence</h4>
                  <p className="text-sm text-gray-600">
                    Repeat steps 2-3 until centroids don't change significantly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Previous Analyses & Info */}
        <div className="space-y-6">
          {/* Previous Analyses */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Previous Analyses</h3>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {previousAnalyses.length > 0 ? (
                previousAnalyses.map((analysis, index) => (
                  <div key={analysis.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">
                        Analysis #{analysis.id}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                        {analysis.cluster_count} clusters
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {new Date(analysis.analysis_date).toLocaleDateString()}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {analysis.expense_count || 0} expenses
                      </span>
                      <button
                        onClick={() => setAnalysisResult({
                          insights: analysis.insights,
                          clusters: analysis.cluster_count
                        })}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View <ChevronRight className="w-3 h-3 inline ml-1" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No previous analyses</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Benefits of K-Means */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Benefits for Expense Analysis</h3>
            <ul className="space-y-3">
              {[
                'Identifies spending patterns automatically',
                'Groups similar expenses together',
                'Helps find unusual spending behaviors',
                'Provides data-driven insights',
                'Optimizes budget allocation',
                'Detects potential savings opportunities'
              ].map((benefit, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={runAnalysis}
                disabled={analyzing || expenseCount < 3}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <Zap className="w-6 h-6 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Run Analysis</span>
              </button>
              
              <button
                onClick={() => toast.success('Feature coming soon!')}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Download className="w-6 h-6 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;