import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart as PieChartIcon,
  Target,
  Plus,
  Download,
  Filter,
  AlertCircle,
  Calendar,
  BarChart3,
  Wallet,
  TrendingDown,
  CheckCircle,
  Clock,
  ShoppingBag,
  Receipt,
  Users
} from 'lucide-react';
import StatsCards from '../components/dashboard/StatsCards';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import CategoryChart from '../components/dashboard/CategoryChart';
import RecentExpenses from '../components/dashboard/RecentExpenses';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import { expenseService } from '../services/expenseService';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalExpenses: 0,
    totalCategories: 0,
    currentMonthTotal: 0,
    percentageChange: 0,
    averageExpense: 0,
    highestExpense: 0,
    recentExpenses: [],
    topCategories: []
  });
  
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, []);

 const fetchDashboardData = async () => {
  setLoading(true);
  try {
    // Fetch all data in parallel
    const [dashboardRes, expensesRes, categoryRes] = await Promise.all([
      expenseService.getDashboardStats(),
      expenseService.getAllExpenses(),
      expenseService.getCategoryBreakdown()
    ]);

    console.log('Dashboard Response:', dashboardRes);
    console.log('Expenses Response:', expensesRes);
    console.log('Category Response:', categoryRes);

    // Process dashboard data
    const dashboardData = dashboardRes?.stats || dashboardRes || {};
    const allExpenses = expensesRes?.expenses || expensesRes?.data?.expenses || expensesRes || [];
    const categories = categoryRes?.categories || categoryRes?.data?.categories || categoryRes || [];

    // Ensure categories is an array
    const categoriesArray = Array.isArray(categories) ? categories : [];
    
    // Calculate totals
    const totalAmount = Array.isArray(allExpenses) 
      ? allExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0)
      : 0;
      
    const currentMonth = new Date().getMonth();
    const currentMonthExpenses = Array.isArray(allExpenses) 
      ? allExpenses.filter(exp => {
          if (!exp || !exp.expense_date) return false;
          const expenseDate = new Date(exp.expense_date);
          return expenseDate.getMonth() === currentMonth && 
                 expenseDate.getFullYear() === new Date().getFullYear();
        })
      : [];
      
    const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    // Find highest expense
    const highestExpense = Array.isArray(allExpenses) && allExpenses.length > 0 
      ? Math.max(...allExpenses.map(exp => parseFloat(exp.amount) || 0)) 
      : 0;

    // Calculate average
    const averageExpense = Array.isArray(allExpenses) && allExpenses.length > 0 
      ? totalAmount / allExpenses.length 
      : 0;

    // Get recent expenses (last 5)
    const recentExpensesList = Array.isArray(allExpenses) 
      ? allExpenses
          .sort((a, b) => new Date(b.expense_date || 0) - new Date(a.expense_date || 0))
          .slice(0, 5)
      : [];

    // Format category data for chart
    const formattedCategoryData = categoriesArray.map(cat => {
      // Handle different response structures
      const categoryName = cat?.category || cat?.name || 'Unknown';
      const categoryTotal = cat?.total || cat?.amount || cat?.value || 0;
      const categoryCount = cat?.count || 1;
      
      return {
        category: categoryName,
        total: parseFloat(categoryTotal) || 0,
        count: categoryCount,
        percentage: totalAmount > 0 ? ((parseFloat(categoryTotal) || 0) / totalAmount * 100) : 0
      };
    }).filter(cat => cat.total > 0); // Filter out zero amounts

    // Set stats
    setStats({
      totalAmount,
      totalExpenses: Array.isArray(allExpenses) ? allExpenses.length : 0,
      totalCategories: formattedCategoryData.length,
      currentMonthTotal,
      percentageChange: dashboardData.percentageChange || 0,
      averageExpense,
      highestExpense,
      recentExpenses: recentExpensesList,
      topCategories: formattedCategoryData.slice(0, 5)
    });
    
    // Set category data for chart
    setCategoryData(formattedCategoryData);
    
    // Generate monthly data from actual expenses
    generateMonthlyData(Array.isArray(allExpenses) ? allExpenses : []);
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    toast.error('Failed to load dashboard data');
  } finally {
    setLoading(false);
  }
};

  const generateMonthlyData = (expenses) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Group expenses by month
    const monthlyExpenses = {};
    expenses.forEach(expense => {
      const date = new Date(expense.expense_date);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        const monthKey = months[monthIndex];
        
        if (!monthlyExpenses[monthKey]) {
          monthlyExpenses[monthKey] = 0;
        }
        monthlyExpenses[monthKey] += expense.amount || 0;
      }
    });
    
    // Create monthly data array
    const monthlyData = months.map((month, index) => {
      const amount = monthlyExpenses[month] || 0;
      const budget = 5000; // Default budget for each month
      
      return {
        month,
        amount,
        budget,
        percentage: budget > 0 ? Math.min((amount / budget) * 100, 100) : 0
      };
    });
    
    setMonthlyData(monthlyData);
  };

const handleAddExpense = async (expenseData) => {
  try {
    // expenseData will be FormData from AddExpenseModal
    await expenseService.addExpense(expenseData);
    setShowAddModal(false);
    toast.success('Expense added successfully!');
    fetchDashboardData(); // Refresh data
  } catch (error) {
    console.error('Error adding expense:', error);
    toast.error('Failed to add expense');
  }
};
  const getTimeRangeData = () => {
    switch(timeRange) {
      case 'week':
        return monthlyData.slice(-4);
      case 'month':
        return monthlyData.slice(-6);
      case 'year':
        return monthlyData;
      default:
        return monthlyData.slice(-6);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-center"
        >
          <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Dashboard</h3>
          <p className="text-gray-600">Analyzing your expense patterns...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-blue-200/10 to-purple-200/10 blur-3xl"
            initial={{ 
              x: Math.random() * 1000 - 500,
              y: Math.random() * 1000 - 500,
              scale: 0.5 + Math.random() * 0.5
            }}
            animate={{ 
              x: [null, Math.random() * 100 - 50],
              y: [null, Math.random() * 100 - 50],
              scale: [null, 0.5 + Math.random() * 0.5]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-90"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`
        }}></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
          >
            <div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4"
              >
                <span className="text-white text-sm font-medium">📊 Real-time Analytics</span>
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Financial Dashboard</h1>
              <p className="text-indigo-100 text-lg">Smart insights for smarter spending</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Expense
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Export Report
              </motion.button>
            </div>
          </motion.div>

          {/* Quick Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
          >
            {/* Total Spent Card */}
            <motion.div variants={itemVariants} className="relative group">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Total Spent</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      Rs {stats.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center mt-2">
                      {stats.percentageChange >= 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-emerald-300 mr-1" />
                          <span className="text-emerald-300 text-sm">+{Math.abs(stats.percentageChange).toFixed(1)}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-rose-300 mr-1" />
                          <span className="text-rose-300 text-sm">-{Math.abs(stats.percentageChange).toFixed(1)}%</span>
                        </>
                      )}
                      <span className="text-indigo-200 text-sm ml-2">from last month</span>
                    </div>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <DollarSign className="w-7 h-7 text-white" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Total Expenses Card */}
            <motion.div variants={itemVariants} className="relative group">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Total Expenses</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.totalExpenses}</p>
                    <div className="flex items-center mt-2">
                      <Receipt className="w-4 h-4 text-purple-200 mr-1" />
                      <span className="text-purple-200 text-sm">Transactions</span>
                    </div>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: -5, scale: 1.1 }}
                    className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <TrendingUp className="w-7 h-7 text-white" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Categories Card */}
            <motion.div variants={itemVariants} className="relative group">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Categories</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.totalCategories}</p>
                    <div className="flex items-center mt-2">
                      <ShoppingBag className="w-4 h-4 text-emerald-200 mr-1" />
                      <span className="text-emerald-200 text-sm">Active categories</span>
                    </div>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <ShoppingBag className="w-7 h-7 text-white" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Average Expense Card */}
            <motion.div variants={itemVariants} className="relative group">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Average Expense</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      Rs {stats.averageExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center mt-2">
                      <Wallet className="w-4 h-4 text-amber-200 mr-1" />
                      <span className="text-amber-200 text-sm">Per transaction</span>
                    </div>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: -5, scale: 1.1 }}
                    className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <BarChart3 className="w-7 h-7 text-white" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Time Range Filter */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="mb-8"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ rotate: 15 }}>
                  <Filter className="w-5 h-5 text-indigo-600" />
                </motion.div>
                <span className="font-bold text-gray-700">View Data For:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['week', 'month', 'year'].map((range) => (
                  <motion.button
                    key={range}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTimeRange(range)}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                      timeRange === range
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Left Column */}
          <div className="space-y-8">
            {/* Spending Trend Chart */}
            <motion.div variants={itemVariants}>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Spending Trend</h2>
                    <p className="text-gray-600 mt-1">Track your expenses over time</p>
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="mt-2 sm:mt-0"
                  >
                    <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                      {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}ly View
                    </span>
                  </motion.div>
                </div>
                <div className="h-80">
                  <ExpenseChart data={getTimeRangeData()} />
                </div>
              </div>
            </motion.div>

            {/* Recent Expenses */}
            <motion.div variants={itemVariants}>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Recent Expenses</h2>
                    <p className="text-gray-600 mt-1">Latest transactions</p>
                  </div>
                  <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
                    <Clock className="w-6 h-6 text-gray-400" />
                  </motion.div>
                </div>
                <div className="h-96 overflow-y-auto">
                  <RecentExpenses expenses={stats.recentExpenses} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Category Distribution */}
            <motion.div variants={itemVariants}>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Category Distribution</h2>
                    <p className="text-gray-600 mt-1">Where your money goes</p>
                  </div>
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    <PieChartIcon className="w-6 h-6 text-gray-400" />
                  </motion.div>
                </div>
                <div className="h-80">
                  <CategoryChart data={categoryData.slice(0, 8)} />
                </div>
              </div>
            </motion.div>

            {/* Top Categories */}
            <motion.div variants={itemVariants}>
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Top Categories</h2>
                    <p className="text-gray-300 mt-1">Highest spending areas</p>
                  </div>
                  <Target className="w-6 h-6 text-indigo-300" />
                </div>
                <div className="space-y-5">
                  {stats.topCategories.map((category, index) => {
                    const percentage = (category.total / stats.totalAmount) * 100;
                    const colors = [
                      'bg-gradient-to-r from-indigo-500 to-blue-400',
                      'bg-gradient-to-r from-emerald-500 to-green-400',
                      'bg-gradient-to-r from-amber-500 to-yellow-400',
                      'bg-gradient-to-r from-rose-500 to-pink-400',
                      'bg-gradient-to-r from-purple-500 to-violet-400'
                    ];
                    
                    return (
                      <div key={index} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{category.category}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Rs {category.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            {percentage > 30 ? (
                              <AlertCircle className="w-4 h-4 text-rose-400" />
                            ) : percentage > 20 ? (
                              <AlertCircle className="w-4 h-4 text-amber-400" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>
                        </div>
                        <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-full ${colors[index % colors.length]} rounded-full`}
                          ></motion.div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{percentage.toFixed(1)}% of total</span>
                          <span className={`font-medium ${
                            percentage > 30 ? 'text-rose-400' :
                            percentage > 20 ? 'text-amber-400' :
                            'text-emerald-400'
                          }`}>
                            {percentage > 30 ? 'High' : percentage > 20 ? 'Medium' : 'Low'} spend
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Quick Insights */}
            <motion.div variants={itemVariants}>
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Smart Insights</h2>
                  <motion.div 
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                  >
                    <TrendingUp className="w-5 h-5" />
                  </motion.div>
                </div>
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-start space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all duration-200"
                  >
                    <div className="w-10 h-10 bg-rose-400/20 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-rose-300" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Budget Alert</h4>
                      <p className="text-indigo-100 text-sm mt-1">
                        {stats.totalAmount > 10000 
                          ? `Total spending (Rs ${stats.totalAmount.toLocaleString()}) is high this month`
                          : 'Spending is within normal range'}
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-start space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all duration-200"
                  >
                    <div className="w-10 h-10 bg-emerald-400/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Good Job!</h4>
                      <p className="text-indigo-100 text-sm mt-1">
                        {stats.totalExpenses <= 10 
                          ? 'You have minimal expenses this month' 
                          : `Tracked ${stats.totalExpenses} expenses so far`}
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-start space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all duration-200"
                  >
                    <div className="w-10 h-10 bg-amber-400/20 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Savings Opportunity</h4>
                      <p className="text-indigo-100 text-sm mt-1">
                        {stats.averageExpense > 2000 
                          ? 'Consider reducing average transaction size' 
                          : 'Average transaction size is well controlled'}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Stats Cards Component */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
        >
          <StatsCards stats={stats} loading={loading} />
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all duration-300 z-50 group"
      >
        <Plus className="w-8 h-8" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
          {stats.recentExpenses.length || 0}
        </div>
      </motion.button>

      {/* Add Expense Modal */}
      {showAddModal && (
        <AddExpenseModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddExpense}
        />
      )}
    </div>
  );
};

export default Dashboard;