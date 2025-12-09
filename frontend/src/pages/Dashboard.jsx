import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services/expenseService';
import Navigation from '../components/layout/Navigation';
import StatsCards from '../components/dashboard/StatsCards';
import CategoryDistribution from '../components/charts/CategoryDistribution';
import MonthlyBarChart from '../components/charts/MonthlyBarChart';
import WeeklyLineChart from '../components/charts/WeeklyLineChart';
import RecentExpenses from '../components/expenses/RecentExpenses';
import QuickAddExpense from '../components/expenses/QuickAddExpense';
import { 
  Filter, Calendar, Download, RefreshCw,
  TrendingUp, TrendingDown, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [timeFilter, setTimeFilter] = useState('month'); // month, week, year

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await expenseService.getDashboardStats();
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm h-80"></div>
              <div className="bg-white rounded-xl p-6 shadow-sm h-80"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's your spending overview for this month
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            {/* Time Filters */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['Week', 'Month', 'Year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period.toLowerCase())}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    timeFilter === period.toLowerCase()
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            
            {/* Action Buttons */}
            <button
              onClick={fetchDashboardData}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => toast.success('Export feature coming soon!')}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={dashboardData?.stats} loading={loading} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Distribution */}
          <CategoryDistribution 
            data={dashboardData?.categoryDistribution} 
            loading={loading}
          />
          
          {/* Monthly Bar Chart */}
          <MonthlyBarChart 
            data={dashboardData?.stats?.monthlyTrend} 
            loading={loading}
          />
        </div>

        {/* Weekly Trend Line Chart */}
        <div className="mb-8">
          <WeeklyLineChart 
            data={dashboardData?.stats?.weeklyTrend} 
            loading={loading}
          />
        </div>

        {/* Recent Expenses & K-Means Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Expenses - Takes 2/3 width */}
          <div className="lg:col-span-2">
            <RecentExpenses 
              expenses={dashboardData?.recentExpenses} 
              loading={loading}
              onRefresh={fetchDashboardData}
            />
          </div>
          
          {/* K-Means Insights Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                <p className="text-sm text-gray-600">Powered by K-Means Algorithm</p>
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                BETA
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Cluster 1 - Daily Essentials */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 mr-3"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Daily Essentials</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Your regular expenses like groceries and transport
                    </p>
                    <div className="flex items-center mt-2 text-sm text-blue-700">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span>Stay within Rs 200 daily limit</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Cluster 2 - Medium Expenses */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1 mr-3"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Medium Expenses</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Shopping, dining out, and entertainment
                    </p>
                    <div className="flex items-center mt-2 text-sm text-green-700">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>15% increase this month</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Cluster 3 - High Spending */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1 mr-3"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">High Spending</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Large purchases and one-time expenses
                    </p>
                    <div className="flex items-center mt-2 text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span>Consider spreading large purchases</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Run Analysis Button */}
            <button
              onClick={() => toast.success('K-Means analysis feature coming soon!')}
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-md transition-shadow"
            >
              Run K-Means Analysis
            </button>
          </div>
        </div>
      </main>

      {/* Quick Add Expense Floating Button */}
      <QuickAddExpense onExpenseAdded={fetchDashboardData} />
    </div>
  );
};

export default Dashboard;