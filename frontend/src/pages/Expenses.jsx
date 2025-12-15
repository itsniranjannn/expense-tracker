import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Download,
  TrendingUp,
  Calendar,
  BarChart3,
  Filter,
  Search,
  ChevronRight,
  Tag,
  DollarSign,
  Sparkles,
  Target,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Wallet,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  BarChart,
  TrendingDown,
  Bell,
  Zap,
  Shield,
  Info,
  ExternalLink,
  TrendingUp as TrendingUpIcon,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import ExpenseTable from '../components/expenses/ExpenseTable';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import RecentExpenses from '../components/expenses/RecentExpenses';
import QuickAddExpense from '../components/expenses/QuickAddExpense';
import { expenseService } from '../services/expenseService';
import { budgetService } from '../services/budgetService';
import { toast } from 'react-hot-toast';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [budgetStats, setBudgetStats] = useState({
    totalBudgets: 0,
    budgetsExceeded: 0,
    budgetsWarning: 0,
    budgetsOnTrack: 0,
    budgetsUnderBudget: 0,
    totalBudgeted: 0,
    totalSpentVsBudget: 0,
    overallProgress: 0,
    topOverBudgetCategories: [],
    exceededBudgetsDetails: []
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    highest: 0,
    thisMonth: 0,
    categoryBreakdown: [],
    totalCount: 0
  });
  const [viewMode, setViewMode] = useState('table');
  const [filters, setFilters] = useState({
    category: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [showBudgetAlerts, setShowBudgetAlerts] = useState(true);
  const [exceededBudgets, setExceededBudgets] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Update filtered expenses whenever expenses or filters change
  useEffect(() => {
    applyFilters();
    calculateExceededBudgets();
  }, [expenses, filters, searchTerm, budgets]);

  // Fetch all data including budgets
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch expenses and budgets in parallel
      const [expensesData, budgetsData] = await Promise.all([
        expenseService.getAllExpenses(),
        budgetService.getAllBudgets()
      ]);
      
      // Set expenses
      if (expensesData && expensesData.success) {
        setExpenses(expensesData.expenses || []);
      }
      
      // Set budgets
      if (budgetsData && budgetsData.success) {
        setBudgets(budgetsData.budgets || []);
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate expense statistics
  const calculateExpenseStats = (expensesList) => {
    const total = expensesList.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const avg = expensesList.length > 0 ? total / expensesList.length : 0;
    const highest = expensesList.length > 0 ? Math.max(...expensesList.map(exp => exp.amount || 0)) : 0;
    
    // Current month total
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthTotal = expensesList
      .filter(exp => {
        const expDate = new Date(exp.expense_date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      })
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Category breakdown
    const categoryBreakdown = expensesList.reduce((acc, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = { amount: 0, count: 0 };
      }
      acc[exp.category].amount += exp.amount || 0;
      acc[exp.category].count += 1;
      return acc;
    }, {});

    setStats({
      total: total || 0,
      average: avg || 0,
      highest: highest || 0,
      thisMonth: thisMonthTotal || 0,
      categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count
      })),
      totalCount: expensesList.length
    });
  };

  // Calculate budget statistics with detailed tracking
  const calculateBudgetStats = (budgetsList, expensesList) => {
    if (!budgetsList.length) {
      setBudgetStats({
        totalBudgets: 0,
        budgetsExceeded: 0,
        budgetsWarning: 0,
        budgetsOnTrack: 0,
        budgetsUnderBudget: 0,
        totalBudgeted: 0,
        totalSpentVsBudget: 0,
        overallProgress: 0,
        topOverBudgetCategories: [],
        exceededBudgetsDetails: []
      });
      return;
    }
    
    let budgetsExceeded = 0;
    let budgetsWarning = 0;
    let budgetsOnTrack = 0;
    let budgetsUnderBudget = 0;
    let totalBudgeted = 0;
    let totalSpentVsBudget = 0;
    const categoryStatus = {};
    const exceededDetails = [];
    
    budgetsList.forEach(budget => {
      totalBudgeted += parseFloat(budget.amount || 0);
      
      // Get expenses for this budget's category and month
      const budgetDate = new Date(budget.month_year);
      const budgetMonth = budgetDate.getMonth();
      const budgetYear = budgetDate.getFullYear();
      
      const categoryMonthExpenses = expensesList.filter(expense => {
        const expenseDate = new Date(expense.expense_date);
        return expense.category === budget.category && 
               expenseDate.getMonth() === budgetMonth &&
               expenseDate.getFullYear() === budgetYear;
      });
      
      const spent = categoryMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      totalSpentVsBudget += spent;
      
      const percentage = budget.amount > 0 ? (spent / parseFloat(budget.amount)) * 100 : 0;
      
      // Track budget status with details
      if (percentage >= 100) {
        budgetsExceeded++;
        if (!categoryStatus[budget.category]) {
          categoryStatus[budget.category] = { exceeded: 0, warning: 0, onTrack: 0, underBudget: 0 };
        }
        categoryStatus[budget.category].exceeded++;
        
        // Add to exceeded details for display
        exceededDetails.push({
          id: budget.id,
          category: budget.category,
          month: budgetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          budgetAmount: parseFloat(budget.amount),
          spentAmount: spent,
          percentage: percentage,
          overspentBy: spent - parseFloat(budget.amount),
          color: budget.color || '#EF4444'
        });
      } else if (percentage >= 80) {
        budgetsWarning++;
        if (!categoryStatus[budget.category]) {
          categoryStatus[budget.category] = { exceeded: 0, warning: 0, onTrack: 0, underBudget: 0 };
        }
        categoryStatus[budget.category].warning++;
      } else if (percentage >= 50) {
        budgetsOnTrack++;
        if (!categoryStatus[budget.category]) {
          categoryStatus[budget.category] = { exceeded: 0, warning: 0, onTrack: 0, underBudget: 0 };
        }
        categoryStatus[budget.category].onTrack++;
      } else {
        budgetsUnderBudget++;
        if (!categoryStatus[budget.category]) {
          categoryStatus[budget.category] = { exceeded: 0, warning: 0, onTrack: 0, underBudget: 0 };
        }
        categoryStatus[budget.category].underBudget++;
      }
    });
    
    // Sort exceeded details by overspent amount (highest first)
    exceededDetails.sort((a, b) => b.overspentBy - a.overspentBy);
    
    // Find top over-budget categories
    const topOverBudgetCategories = Object.entries(categoryStatus)
      .filter(([_, counts]) => counts.exceeded > 0)
      .sort((a, b) => b[1].exceeded - a[1].exceeded)
      .slice(0, 3)
      .map(([category, counts]) => ({ 
        category, 
        exceededCount: counts.exceeded,
        warningCount: counts.warning 
      }));
    
    setBudgetStats({
      totalBudgets: budgetsList.length,
      budgetsExceeded,
      budgetsWarning,
      budgetsOnTrack,
      budgetsUnderBudget,
      totalBudgeted,
      totalSpentVsBudget,
      overallProgress: totalBudgeted > 0 ? (totalSpentVsBudget / totalBudgeted) * 100 : 0,
      topOverBudgetCategories,
      exceededBudgetsDetails: exceededDetails
    });
  };

  // Calculate which budgets are currently exceeded
  const calculateExceededBudgets = () => {
    const exceeded = [];
    
    budgets.forEach(budget => {
      const budgetDate = new Date(budget.month_year);
      const budgetMonth = budgetDate.getMonth();
      const budgetYear = budgetDate.getFullYear();
      
      const categoryMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.expense_date);
        return expense.category === budget.category && 
               expenseDate.getMonth() === budgetMonth &&
               expenseDate.getFullYear() === budgetYear;
      });
      
      const spent = categoryMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      const percentage = budget.amount > 0 ? (spent / parseFloat(budget.amount)) * 100 : 0;
      
      if (percentage >= 100) {
        exceeded.push({
          id: budget.id,
          category: budget.category,
          month: budgetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          budgetAmount: parseFloat(budget.amount),
          spentAmount: spent,
          percentage: percentage.toFixed(1),
          overspentBy: spent - parseFloat(budget.amount),
          color: budget.color || '#EF4444',
          icon: budget.icon || '💰'
        });
      }
    });
    
    setExceededBudgets(exceeded);
  };

  // Apply filters locally (instant response)
  const applyFilters = () => {
    let filtered = [...expenses];

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(expense => expense.category === filters.category);
    }

    // Apply date filters
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter(expense => new Date(expense.expense_date) >= start);
    }
    
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(expense => new Date(expense.expense_date) <= end);
    }

    // Apply amount filters
    if (filters.minAmount) {
      filtered = filtered.filter(expense => expense.amount >= parseFloat(filters.minAmount));
    }
    
    if (filters.maxAmount) {
      filtered = filtered.filter(expense => expense.amount <= parseFloat(filters.maxAmount));
    }

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.title.toLowerCase().includes(searchLower) ||
        expense.description?.toLowerCase().includes(searchLower) ||
        expense.category.toLowerCase().includes(searchLower)
      );
    }

    setFilteredExpenses(filtered);
    
    // Calculate stats on filtered data
    calculateExpenseStats(filtered);
    calculateBudgetStats(budgets, filtered);
  };

  // Handle category filter click (instant response)
  const handleCategoryClick = (category) => {
    const newFilters = {
      ...filters,
      category: category === 'All' ? 'all' : category
    };
    setFilters(newFilters);
    setSelectedCategory(category === 'All' ? null : category);
  };

  const handleAddExpense = async (expenseData) => {
    try {
      const response = await expenseService.addExpense(expenseData);
      if (response.success) {
        toast.success('Expense added successfully! 💰');
        fetchData(); // Refresh all data
      }
      return response;
    } catch (err) {
      console.error('Error adding expense:', err);
      toast.error(err.message || 'Failed to add expense');
      throw err;
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      const response = await expenseService.deleteExpense(id);
      if (response.success) {
        toast.success('Expense deleted successfully! 🗑️');
        fetchData();
      }
      return response;
    } catch (err) {
      console.error('Error deleting expense:', err);
      toast.error('Failed to delete expense');
      throw err;
    }
  };

  const handleUpdateExpense = async (id, expenseData) => {
    try {
      const response = await expenseService.updateExpense(id, expenseData);
      if (response.success) {
        toast.success('Expense updated successfully! ✏️');
        fetchData();
      }
      return response;
    } catch (err) {
      console.error('Error updating expense:', err);
      toast.error('Failed to update expense');
      throw err;
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    applyFilters();
    setShowFilters(false);
    toast.success('Filters applied successfully! 🔍');
  };

  const handleResetFilters = () => {
    const newFilters = {
      category: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    };
    setFilters(newFilters);
    setSearchTerm('');
    setSelectedCategory(null);
    toast.success('Filters reset! 🔄');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const exportToCSV = () => {
    if (filteredExpenses.length === 0) {
      toast.error('No expenses to export');
      return;
    }
    
    const headers = ['Title', 'Category', 'Amount', 'Date', 'Payment Method', 'Description'];
    const csvData = filteredExpenses.map(exp => [
      `"${exp.title}"`,
      exp.category,
      exp.amount,
      exp.expense_date,
      exp.payment_method,
      `"${exp.description || ''}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully! 📥');
  };

  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities',
    'Entertainment', 'Healthcare', 'Education', 'Groceries', 
    'Travel', 'Personal Care', 'Savings', 'Investment', 
    'Gifts & Donations', 'Other'
  ];

  // Calculate category budget progress
  const getCategoryBudgetProgress = (category) => {
    const categoryBudgets = budgets.filter(b => b.category === category);
    const categoryExpenses = filteredExpenses.filter(e => e.category === category);
    const totalSpent = categoryExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalBudget = categoryBudgets.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
    const progress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    return { totalSpent, totalBudget, progress };
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

  // Get budget progress color
  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-red-500';
    if (progress >= 80) return 'bg-amber-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  // Get budget status text
  const getBudgetStatusText = (progress) => {
    if (progress >= 100) return 'Exceeded';
    if (progress >= 80) return 'Warning';
    if (progress >= 50) return 'On Track';
    return 'Under Budget';
  };

  // Get budget status icon
  const getBudgetStatusIcon = (progress) => {
    if (progress >= 100) return <AlertTriangle className="w-4 h-4" />;
    if (progress >= 80) return <AlertCircle className="w-4 h-4" />;
    if (progress >= 50) return <CheckCircle className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/20 to-purple-50/20 p-4 md:p-6 lg:p-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-blue-200/10 to-purple-200/10 blur-3xl"
            initial={{ 
              x: Math.random() * 800 - 400,
              y: Math.random() * 800 - 400,
              scale: 0.3 + Math.random() * 0.4
            }}
            animate={{ 
              x: [null, Math.random() * 80 - 40],
              y: [null, Math.random() * 80 - 40],
              scale: [null, 0.3 + Math.random() * 0.4]
            }}
            transition={{
              duration: 15 + Math.random() * 15,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      <div className="relative container mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 lg:mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full mb-4"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Smart Expense Tracking with Budgets</span>
              </motion.div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
                Expense Management
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl">
                Track expenses against your budgets with intelligent insights
              </p>
            </div>
            
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToCSV}
                className="flex items-center justify-center px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                <Download className="w-5 h-5 mr-2" />
                Export CSV
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Expense
              </motion.button>
            </motion.div>
          </div>

          {/* Stats Cards Grid with Budget Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8"
          >
            {/* Total Expenses Card */}
            <motion.div variants={itemVariants} className="relative group">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/30 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Expenses</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">
                      Rs {stats.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{stats.totalCount} transactions</p>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <DollarSign className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </motion.div>
                </div>
                <div className="mt-4 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
              </div>
            </motion.div>

            {/* Average Expense Card */}
            <motion.div variants={itemVariants} className="relative group">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/30 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Average Expense</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">
                      Rs {stats.average.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Per transaction</p>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: -5, scale: 1.1 }}
                    className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-emerald-500 to-green-400 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <BarChart3 className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </motion.div>
                </div>
                <div className="mt-4 h-1.5 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"></div>
              </div>
            </motion.div>

            {/* This Month Card */}
            <motion.div variants={itemVariants} className="relative group">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/30 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-200/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">This Month</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">
                      Rs {stats.thisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Current spending</p>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: -5, scale: 1.1 }}
                    className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <Calendar className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </motion.div>
                </div>
                <div className="mt-4 h-1.5 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"></div>
              </div>
            </motion.div>

            {/* Budget Overview Card */}
            <motion.div variants={itemVariants} className="relative group">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/30 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-200/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Budget Status</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">
                      {budgetStats.totalBudgets} Active
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <div className="flex items-center">
                        <CheckCircle className="w-3 h-3 text-emerald-500 mr-1" />
                        <span className="text-xs text-gray-600">{budgetStats.budgetsOnTrack}</span>
                      </div>
                      <div className="flex items-center">
                        <AlertCircle className="w-3 h-3 text-amber-500 mr-1" />
                        <span className="text-xs text-gray-600">{budgetStats.budgetsWarning}</span>
                      </div>
                      <div className="flex items-center">
                        <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />
                        <span className="text-xs text-gray-600">{budgetStats.budgetsExceeded}</span>
                      </div>
                    </div>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-500 to-orange-400 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <Target className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </motion.div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Budget Usage</span>
                    <span className="font-medium text-gray-900">
                      {budgetStats.overallProgress?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(budgetStats.overallProgress || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Budget vs Expense Card */}
            <motion.div variants={itemVariants} className="relative group">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/30 shadow-lg hover:shadow-2xl hover:shadow-rose-500/10 hover:border-rose-200/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Budget vs Expense</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">
                      {budgetStats.totalBudgeted > 0 
                        ? `${((budgetStats.totalSpentVsBudget / budgetStats.totalBudgeted) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Rs {budgetStats.totalSpentVsBudget?.toFixed(0) || 0} / {budgetStats.totalBudgeted?.toFixed(0) || 0}
                    </p>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: -5, scale: 1.1 }}
                    className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-rose-500 to-pink-400 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </motion.div>
                </div>
                <div className="mt-4 h-1.5 bg-gradient-to-r from-rose-500 to-pink-400 rounded-full"></div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Budget Warning Alert with Exceeded Budgets Details */}
        {budgetStats.budgetsExceeded > 0 && showBudgetAlerts && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-red-50 via-orange-50 to-rose-50 border border-red-200 rounded-2xl p-5 md:p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-800 text-lg mb-1">Budget Alert! 🚨</h3>
                    <p className="text-red-700">
                      {budgetStats.budgetsExceeded} budget{budgetStats.budgetsExceeded > 1 ? 's are' : ' is'} currently exceeded. 
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowBudgetAlerts(false)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                  >
                    <EyeOff className="w-4 h-4" />
                  </motion.button>
                  <a
                    href="/budgets"
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:from-red-700 hover:to-orange-700 transition duration-200 shadow-md"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Manage Budgets
                  </a>
                </div>
              </div>
              
              {/* Detailed Exceeded Budgets */}
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {budgetStats.exceededBudgetsDetails.slice(0, 3).map((budget, index) => (
                    <motion.div
                      key={budget.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-red-100 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3"
                            style={{ backgroundColor: `${budget.color}20` }}
                          >
                            {budget.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{budget.category}</h4>
                            <p className="text-xs text-gray-500">{budget.month}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          {budget.percentage}%
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Budget</span>
                          <span className="font-medium text-gray-900">
                            Rs {budget.budgetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Spent</span>
                          <span className="font-medium text-red-600">
                            Rs {budget.spentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Overspent By</span>
                          <span className="font-bold text-red-700">
                            Rs {budget.overspentBy.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {budgetStats.exceededBudgetsDetails.length > 3 && (
                  <div className="mt-4 text-center">
                    <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                      + {budgetStats.exceededBudgetsDetails.length - 3} more exceeded budgets
                    </button>
                  </div>
                )}
                
                {/* Tips for reducing overspending */}
                <div className="mt-6 pt-4 border-t border-red-200">
                  <div className="flex items-center mb-3">
                    <Zap className="w-5 h-5 text-amber-500 mr-2" />
                    <h4 className="font-semibold text-gray-900">Tips to Reduce Overspending</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 mr-2 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Review your highest spending categories</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 mr-2 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Consider adjusting budget limits for next month</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 mr-2 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Set spending alerts for high-risk categories</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 mr-2 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Track daily spending to stay aware</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Budget Warning Alert (for budgets at 80-99%) */}
        {budgetStats.budgetsWarning > 0 && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 md:p-6">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mr-4">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800 mb-1">Budget Warning!</h3>
                  <p className="text-amber-700 mb-3">
                    {budgetStats.budgetsWarning} budget{budgetStats.budgetsWarning > 1 ? 's are' : ' is'} approaching its limit (80-99% used).
                    Consider adjusting your spending to stay within budget.
                  </p>
                  {budgetStats.topOverBudgetCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm text-amber-600">High-risk categories:</span>
                      {budgetStats.topOverBudgetCategories.map((item, index) => (
                        <span key={index} className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full flex items-center">
                          {item.category}
                          <span className="ml-1 text-xs">
                            ({item.exceededCount > 0 ? `${item.exceededCount} exceeded` : `${item.warningCount} warning`})
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition duration-200"
                  >
                    <Bell className="w-4 h-4 inline mr-2" />
                    Set Alert
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Budget Success Alert (for budgets under 50%) */}
        {budgetStats.budgetsUnderBudget > 0 && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5 md:p-6">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-800 mb-1">Great Job! 🎉</h3>
                  <p className="text-emerald-700 mb-3">
                    {budgetStats.budgetsUnderBudget} budget{budgetStats.budgetsUnderBudget > 1 ? 's are' : ' is'} under 50% utilization.
                    You're doing an excellent job managing your finances!
                  </p>
                  <div className="flex items-center">
                    <TrendingDown className="w-4 h-4 text-emerald-500 mr-2" />
                    <span className="text-sm text-emerald-600">
                      You've saved Rs {(budgetStats.totalBudgeted * 0.5).toFixed(0)} from your total budget
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Add Expense Component */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 lg:mb-10"
        >
          <QuickAddExpense onAdd={handleAddExpense} />
        </motion.div>

        {/* Controls Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 md:p-6 border border-white/30">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search expenses by title, category, or description..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-3">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {['table', 'recent'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        viewMode === mode
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {mode === 'table' ? '📊 Table' : '🕐 Recent'}
                    </button>
                  ))}
                </div>

                {/* Filter Toggle Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100 rounded-xl font-medium hover:from-indigo-100 hover:to-purple-100 transition-all duration-200"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                  <ChevronRight className={`w-4 h-4 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-90' : ''}`} />
                </motion.button>
              </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {/* Category Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Tag className="w-4 h-4 inline mr-1" />
                          Category
                        </label>
                        <select
                          value={filters.category}
                          onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="all">All Categories</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Date Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange({ ...filters, startDate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          End Date
                        </label>
                        <input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => handleFilterChange({ ...filters, endDate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      {/* Amount Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <DollarSign className="w-4 h-4 inline mr-1" />
                          Min Amount
                        </label>
                        <input
                          type="number"
                          value={filters.minAmount}
                          onChange={(e) => handleFilterChange({ ...filters, minAmount: e.target.value })}
                          placeholder="0.00"
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex justify-end space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleResetFilters}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                      >
                        Reset All
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleApplyFilters}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                      >
                        Apply Filters
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Category Quick Filters with Budget Progress - Toggle Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 md:p-6 border border-white/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <PieChart className="w-5 h-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Categories with Budget Progress</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{filteredExpenses.length} expenses</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg font-medium hover:from-indigo-100 hover:to-purple-100 transition-all duration-200"
                >
                  {showCategories ? 'Hide Categories' : 'Show Categories'}
                  {showCategories ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </motion.button>
              </div>
            </div>
            
            {/* Categories Grid - Shown when toggled */}
            <AnimatePresence>
              {showCategories && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-gray-200">
                    {/* Active Filter Indicator */}
                    {filters.category !== 'all' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-lg font-medium">
                              Active Filter: {filters.category}
                            </div>
                            <button
                              onClick={() => handleCategoryClick('All')}
                              className="ml-3 px-2 py-1 text-gray-500 hover:text-gray-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={handleResetFilters}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {['All', ...categories].map((category) => {
                        const { totalSpent, totalBudget, progress } = getCategoryBudgetProgress(category);
                        const isSelected = category === 'All' 
                          ? filters.category === 'all'
                          : filters.category === category;
                        
                        return (
                          <motion.button
                            key={category}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCategoryClick(category)}
                            className={`relative p-4 rounded-xl text-left transition-all duration-200 ${
                              isSelected
                                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-md'
                                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-medium text-gray-900 truncate">
                                {category === 'All' ? 'All Categories' : category}
                              </div>
                              {isSelected && (
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                              )}
                            </div>
                            
                            {category !== 'All' && totalBudget > 0 && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-600">Budget</span>
                                  <span className={`font-medium flex items-center ${
                                    progress >= 100 ? 'text-red-600' :
                                    progress >= 80 ? 'text-amber-600' :
                                    'text-emerald-600'
                                  }`}>
                                    {getBudgetStatusIcon(progress)}
                                    <span className="ml-1">{getBudgetStatusText(progress)}</span>
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  />
                                </div>
                                <div className="text-xs text-gray-500 mt-1 truncate">
                                  Rs {totalSpent.toFixed(0)} / {totalBudget.toFixed(0)}
                                </div>
                              </div>
                            )}
                            
                            {category !== 'All' && totalBudget === 0 && (
                              <div className="mt-2 text-xs text-gray-500">
                                No budget set
                              </div>
                            )}
                            
                            {/* Expense count for each category */}
                            {category !== 'All' && (
                              <div className="mt-2 text-xs">
                                <span className="text-gray-600">
                                  {expenses.filter(e => e.category === category).length} expenses
                                </span>
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {viewMode === 'table' ? (
            <ExpenseTable
              expenses={filteredExpenses}
              loading={loading}
              onDelete={handleDeleteExpense}
              onEdit={handleUpdateExpense}
              budgets={budgets}
              exceededBudgets={exceededBudgets}
            />
          ) : (
            <RecentExpenses
              expenses={filteredExpenses.slice(0, 10)}
              loading={loading}
              onDelete={handleDeleteExpense}
              onEdit={handleUpdateExpense}
              exceededBudgets={exceededBudgets}
            />
          )}
        </motion.div>

        {/* Add Expense Modal */}
        <AnimatePresence>
          {showAddModal && (
            <AddExpenseModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSubmit={handleAddExpense}
              budgets={budgets}
              expenses={expenses}
              exceededBudgets={exceededBudgets}
            />
          )}
        </AnimatePresence>

        {/* Floating Budget Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-indigo-200/30 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Budget Protection Status</h4>
                <p className="text-sm text-gray-600">
                  {budgetStats.budgetsExceeded > 0 
                    ? `⚠️ ${budgetStats.budgetsExceeded} budget${budgetStats.budgetsExceeded !== 1 ? 's' : ''} need attention`
                    : '✅ All budgets are under control'
                  }
                </p>
                <div className="flex items-center mt-2">
                  {budgetStats.budgetsExceeded > 0 && (
                    <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded mr-2">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {budgetStats.budgetsExceeded} exceeded
                    </span>
                  )}
                  {budgetStats.budgetsWarning > 0 && (
                    <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded mr-2">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {budgetStats.budgetsWarning} warning
                    </span>
                  )}
                  {budgetStats.budgetsOnTrack > 0 && (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded mr-2">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {budgetStats.budgetsOnTrack} on track
                    </span>
                  )}
                  {budgetStats.budgetsUnderBudget > 0 && (
                    <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {budgetStats.budgetsUnderBudget} under budget
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="/budgets"
                className="flex items-center px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg font-medium hover:bg-gray-50 transition duration-200"
              >
                <Target className="w-4 h-4 mr-2" />
                Manage Budgets →
              </a>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition duration-200 shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Expenses;