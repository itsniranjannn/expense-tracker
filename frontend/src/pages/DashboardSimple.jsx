import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services/expenseService';
import ExpenseChart from '../components/charts/ExpenseChart';
import CategoryDistribution from '../components/charts/CategoryDistribution';
import RecentExpenses from '../components/expenses/RecentExpenses';
import QuickAddExpense from '../components/expenses/QuickAddExpense';
import { 
  Wallet, TrendingUp, PieChart, BarChart3, 
  Calendar, Filter, RefreshCw, LogOut,
  AlertCircle, DollarSign, CreditCard, TrendingDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DashboardSimple = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalAmount: 0,
    averageExpense: 0,
    totalExpenses: 0
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [recentRes, categoryRes] = await Promise.all([
        expenseService.getRecentExpenses(10),
        expenseService.getCategoryBreakdown()
      ]);

      // 🟢 Recent expenses
      setRecentExpenses(recentRes.expenses || []);

      // 🟢 Safe category data handling
      let categoryBreakdown = [];
      if (categoryRes && categoryRes.breakdown) {
        categoryBreakdown = Array.isArray(categoryRes.breakdown)
          ? categoryRes.breakdown
          : [];
      }
      setCategoryData(categoryBreakdown);

      // 🟢 Stats processing
      if (recentRes.expenses && recentRes.expenses.length > 0) {
        const amounts = recentRes.expenses.map(exp => parseFloat(exp.amount) || 0);

        const totalAmount = amounts.reduce((sum, amt) => sum + amt, 0);
        const averageExpense = totalAmount / amounts.length;

        setStats({
          totalAmount,
          averageExpense,
          totalExpenses: amounts.length
        });

        // 🟢 Line chart data
        const sortedExpenses = [...recentRes.expenses].sort(
          (a, b) => new Date(a.expense_date) - new Date(b.expense_date)
        );

        const lineChartData = sortedExpenses.map(exp => ({
          date: exp.expense_date,
          amount: parseFloat(exp.amount) || 0
        }));

        setLineData(lineChartData);
      } else {
        // Reset if no data
        setStats({
          totalAmount: 0,
          averageExpense: 0,
          totalExpenses: 0
        });
        setLineData([]);
      }

      toast.success('Dashboard updated!');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');

      setRecentExpenses([]);
      setCategoryData([]);
      setLineData([]);
      setStats({
        totalAmount: 0,
        averageExpense: 0,
        totalExpenses: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);


  const handleExpenseAdded = () => fetchDashboardData();
  const handleExpenseEdited = () => fetchDashboardData();

  const handleExpenseDeleted = (expenseId) => {
    setRecentExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    fetchDashboardData();
  };

  const handleRunAnalysis = () => {
    toast.loading('Analysis feature coming soon...');
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">Smart Expense Tracker Dashboard</p>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={handleRunAnalysis}
              className="btn-primary flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Run Analysis</span>
            </button>

            <button
              onClick={logout}
              className="btn-secondary flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Total Spent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              ₹{stats.totalAmount.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600">Total Spent</p>
          </motion.div>

          {/* Average Expense */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Avg
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              ₹{stats.averageExpense.toFixed(2)}
            </h3>
            <p className="text-sm text-gray-600">Average Expense</p>
          </motion.div>

          {/* Total Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                {recentExpenses.length} items
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalExpenses}
            </h3>
            <p className="text-sm text-gray-600">Total Expenses</p>
          </motion.div>

          {/* Monthly Projection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                Projected
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              ₹{(stats.totalAmount * 30).toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600">Monthly Projection</p>
          </motion.div>

        </div>
      </header>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* LEFT SIDE */}
        <div className="space-y-6">

          {/* Expense Chart */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Spending Trend</h3>
                <p className="text-sm text-gray-600">Recent expense pattern</p>
              </div>

              {lineData.length > 1 && (
                <div className="flex items-center space-x-2">
                  {lineData[lineData.length - 1].amount > lineData[0].amount ? (
                    <>
                      <TrendingUp className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-medium text-red-600">
                        {(
                          ((lineData[lineData.length - 1].amount - lineData[0].amount) /
                          lineData[0].amount) * 100
                        ).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        {(
                          ((lineData[0].amount - lineData[lineData.length - 1].amount) /
                          lineData[0].amount) * 100
                        ).toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {lineData.length > 0 ? (
              <ExpenseChart data={lineData} />
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No chart data available</p>
                  <p className="text-sm text-gray-400 mt-1">Add expenses to see trends</p>
                </div>
              </div>
            )}
          </div>

          <RecentExpenses 
            expenses={recentExpenses}
            onDelete={handleExpenseDeleted}
            onEdit={handleExpenseEdited}
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* Category Distribution */}
     {categoryData && categoryData.length > 0 ? (
  <CategoryDistribution data={categoryData} />
) : (
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
                  <p className="text-sm text-gray-600">Spending by category</p>
                </div>
                <PieChart className="w-6 h-6 text-primary-600" />
              </div>

              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No category data available</p>
                  <p className="text-sm text-gray-400 mt-1">Add expenses with categories</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Tips */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Quick Tips</h3>
            <div className="space-y-3">
              {[
                "Track daily expenses to identify spending patterns",
                "Set monthly budgets for each category",
                "Review expenses weekly to stay on track",
                "Use categories to organize your spending",
                "Upload receipts for better record keeping"
              ].map((tip, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={fetchDashboardData}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="w-6 h-6 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Refresh Data</span>
              </button>

              <button
                onClick={() => document.querySelector('[aria-label="Add Expense"]')?.click()}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <DollarSign className="w-6 h-6 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Add Expense</span>
              </button>

            </div>
          </div>

        </div>
      </div>

      <QuickAddExpense onExpenseAdded={handleExpenseAdded} />
    </div>
  );
};

export default DashboardSimple;
