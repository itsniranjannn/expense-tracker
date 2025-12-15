import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  PieChart,
  AlertTriangle,
  Info,
  Wallet,
  CreditCard,
  ShoppingBag,
  Car,
  Home,
  Heart,
  BookOpen,
  Plane,
  Coffee,
  Tag
} from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { budgetService } from '../services/budgetService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BudgetsPage = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month_year: new Date().toISOString().slice(0, 7) + '-01',
  });
  const toast = useToast();

  // Categories
  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Groceries',
    'Travel',
    'Personal Care',
    'Savings',
    'Investment',
    'Gifts & Donations',
    'Other'
  ];

  // Fetch all data
 const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Starting data fetch...');
      
      // Fetch budgets using service
      const budgetsResult = await budgetService.getAllBudgets();
      console.log('📊 Budgets service result:', budgetsResult);
      
      if (budgetsResult && budgetsResult.success) {
        setBudgets(budgetsResult.budgets || []);
        console.log(`✅ Loaded ${budgetsResult.budgets?.length || 0} budgets`);
      } else {
        console.error('❌ Failed to fetch budgets:', budgetsResult?.message);
        toast.error(budgetsResult?.message || 'Failed to load budgets');
        setBudgets([]);
      }
      
      // Fetch expenses - using api directly
      try {
        const expensesData = await api.get('/api/expenses');
        console.log('💰 Expenses data:', expensesData);
        
        if (expensesData && expensesData.success) {
          setExpenses(expensesData.expenses || []);
          console.log(`✅ Loaded ${expensesData.expenses?.length || 0} expenses`);
        } else {
          console.warn('⚠️ No expenses found or invalid response');
          setExpenses([]);
        }
      } catch (expenseError) {
        console.error('Error fetching expenses:', expenseError);
        setExpenses([]);
      }
      
    } catch (error) {
      console.error('❌ Error in fetchData:', error);
      toast.error('Failed to load data: ' + (error.message || 'Check connection'));
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Calculate spent amount for a budget
  const calculateSpentAmount = (category, monthYear) => {
    if (!expenses || !expenses.length) return 0;
    
    try {
      const targetDate = new Date(monthYear);
      if (isNaN(targetDate.getTime())) return 0;
      
      const targetMonth = targetDate.getMonth();
      const targetYear = targetDate.getFullYear();
      
      return expenses.reduce((total, expense) => {
        if (!expense || !expense.expense_date) return total;
        
        try {
          const expenseDate = new Date(expense.expense_date);
          if (isNaN(expenseDate.getTime())) return total;
          
          const expenseMonth = expenseDate.getMonth();
          const expenseYear = expenseDate.getFullYear();
          
          if (expense.category === category && 
              expenseMonth === targetMonth && 
              expenseYear === targetYear) {
            return total + parseFloat(expense.amount || 0);
          }
        } catch (err) {
          console.error('Error parsing expense date:', err);
        }
        return total;
      }, 0);
    } catch (error) {
      console.error('Error calculating spent amount:', error);
      return 0;
    }
  };

  // Calculate budget stats
  const calculateBudgetStats = (budget) => {
    const spent = calculateSpentAmount(budget.category, budget.month_year);
    const budgeted = parseFloat(budget.amount || 0);
    const progress = budgeted > 0 ? Math.min((spent / budgeted) * 100, 100) : 0;
    const remaining = budgeted - spent;
    
    let status = 'on_track';
    if (progress >= 100) status = 'exceeded';
    else if (progress >= 80) status = 'warning';
    else if (progress <= 30) status = 'under_budget';
    
    return { spent, progress, remaining, status };
  };

  // Calculate analytics
  const calculateAnalytics = () => {
    let totalBudgeted = 0;
    let totalSpent = 0;
    let onTrackCount = 0;
    
    budgets.forEach(budget => {
      const { spent, status } = calculateBudgetStats(budget);
      totalBudgeted += parseFloat(budget.amount || 0);
      totalSpent += spent;
      if (status === 'on_track') onTrackCount++;
    });
    
    const totalRemaining = totalBudgeted - totalSpent;
    const averageProgress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
    
    return {
      totalBudgeted,
      totalSpent,
      totalRemaining,
      averageProgress,
      onTrackCount
    };
  };

  const analytics = calculateAnalytics();

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': '#10B981',
      'Transportation': '#3B82F6',
      'Shopping': '#F59E0B',
      'Bills & Utilities': '#8B5CF6',
      'Entertainment': '#EC4899',
      'Healthcare': '#EF4444',
      'Education': '#6366F1',
      'Groceries': '#84CC16',
      'Travel': '#F97316',
      'Personal Care': '#06B6D4',
      'Savings': '#14B8A6',
      'Investment': '#8B5CF6',
      'Gifts & Donations': '#A855F7',
      'Other': '#6B7280'
    };
    return colors[category] || '#3B82F6';
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'Food & Dining': <Coffee className="w-5 h-5" />,
      'Transportation': <Car className="w-5 h-5" />,
      'Shopping': <ShoppingBag className="w-5 h-5" />,
      'Bills & Utilities': <Home className="w-5 h-5" />,
      'Entertainment': <CreditCard className="w-5 h-5" />,
      'Healthcare': <Heart className="w-5 h-5" />,
      'Education': <BookOpen className="w-5 h-5" />,
      'Groceries': <ShoppingBag className="w-5 h-5" />,
      'Travel': <Plane className="w-5 h-5" />,
      'Personal Care': <Heart className="w-5 h-5" />,
      'Savings': <Wallet className="w-5 h-5" />,
      'Investment': <TrendingUp className="w-5 h-5" />,
      'Gifts & Donations': <Tag className="w-5 h-5" />,
      'Other': <Info className="w-5 h-5" />
    };
    return icons[category] || <Tag className="w-5 h-5" />;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'Rs 0.00';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 'Rs 0.00';
    return `Rs ${numAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add budget
  const handleAddBudget = async (e) => {
    e.preventDefault();
    try {
      if (!formData.category || !formData.amount || !formData.month_year) {
        toast.error('Please fill all required fields');
        return;
      }

      const budgetData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        month_year: formData.month_year,
        color: getCategoryColor(formData.category),
        icon: '💰'
      };

      console.log('Creating budget:', budgetData);
      
      const response = await budgetService.createBudget(budgetData);
      console.log('Create budget response:', response);
      
      if (response && response.success) {
        toast.success(response.message || 'Budget created successfully!');
        setShowAddModal(false);
        setFormData({
          category: '',
          amount: '',
          month_year: new Date().toISOString().slice(0, 7) + '-01',
        });
        fetchData();
      } else {
        toast.error(response?.message || 'Failed to create budget');
      }
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error(error.message || 'Failed to create budget');
    }
  };

  // Handle edit budget
  const handleEditBudget = async (e) => {
    e.preventDefault();
    if (!editingBudget) return;

    try {
      if (!formData.category || !formData.amount || !formData.month_year) {
        toast.error('Please fill all required fields');
        return;
      }

      const budgetData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        month_year: formData.month_year,
        color: getCategoryColor(formData.category),
        icon: '💰'
      };

      const response = await budgetService.updateBudget(editingBudget.id, budgetData);
      if (response && response.success) {
        toast.success(response.message || 'Budget updated successfully!');
        setShowEditModal(false);
        setEditingBudget(null);
        setFormData({
          category: '',
          amount: '',
          month_year: new Date().toISOString().slice(0, 7) + '-01',
        });
        fetchData();
      } else {
        toast.error(response?.message || 'Failed to update budget');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error(error.message || 'Failed to update budget');
    }
  };

  // Handle delete budget
  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        const response = await budgetService.deleteBudget(id);
        if (response && response.success) {
          toast.success('Budget deleted successfully');
          fetchData();
        } else {
          toast.error(response?.message || 'Failed to delete budget');
        }
      } catch (error) {
        console.error('Error deleting budget:', error);
        toast.error('Failed to delete budget');
      }
    }
  };

  // Handle edit click
  const handleEditClick = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount,
      month_year: budget.month_year || new Date().toISOString().slice(0, 7) + '-01',
    });
    setShowEditModal(true);
  };

  // Get available months from budgets
  const getAvailableMonths = () => {
    const monthsSet = new Set();
    budgets.forEach(budget => {
      if (budget.month_year) {
        monthsSet.add(budget.month_year);
      }
    });
    
    const months = Array.from(monthsSet)
      .sort()
      .reverse()
      .map(month => ({
        value: month,
        label: formatDate(month)
      }));
    
    return [{ value: 'all', label: 'All Months' }, ...months];
  };

  // Filter budgets
  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.category?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesCategory = selectedCategory === 'all' || budget.category === selectedCategory;
    const matchesMonth = selectedMonth === 'all' || budget.month_year === selectedMonth;
    
    return matchesSearch && matchesCategory && matchesMonth;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full mx-auto"
          />
          <p className="mt-4 text-gray-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
            <p className="text-gray-600 mt-2">Track and manage your spending limits</p>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredBudgets.length} of {budgets.length} budgets
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Budget
            </motion.button>
          </div>
        </div>

        {/* Debug Info */}
        {budgets.length === 0 && !loading && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                No budgets found. Make sure you're logged in and try refreshing.
              </p>
            </div>
            <div className="mt-2 flex gap-2">
              <button 
                onClick={fetchData}
                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200"
              >
                Refresh Data
              </button>
              <button 
                onClick={() => console.log('Budgets state:', budgets)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                Debug Log
              </button>
            </div>
          </div>
        )}

        {/* Analytics Cards */}
        {budgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Budgeted</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(analytics.totalBudgeted)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-violet-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-violet-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(analytics.totalSpent)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(analytics.totalRemaining)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On Track</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.onTrackCount}/{budgets.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search budgets..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              >
                {getAvailableMonths().map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedMonth('all');
                }}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Budget Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets.map((budget) => {
            const { spent, progress, remaining, status } = calculateBudgetStats(budget);
            const color = getCategoryColor(budget.category);
            
            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
              >
                {/* Budget Header */}
                <div 
                  className="h-2"
                  style={{ backgroundColor: color }}
                />
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: color }}
                      >
                        {getCategoryIcon(budget.category)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{budget.category}</h3>
                        <p className="text-sm text-gray-500">{formatDate(budget.month_year)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClick(budget)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: color 
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Spent: {formatCurrency(spent)}</span>
                      <span>Budget: {formatCurrency(budget.amount)}</span>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Budgeted</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(budget.amount)}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className={`text-lg font-bold ${
                        remaining >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                    status === 'exceeded' ? 'bg-red-50 text-red-700' :
                    status === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                    status === 'under_budget' ? 'bg-emerald-50 text-emerald-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {status === 'exceeded' && <AlertTriangle className="w-4 h-4" />}
                    {status === 'warning' && <AlertCircle className="w-4 h-4" />}
                    {status === 'under_budget' && <TrendingDown className="w-4 h-4" />}
                    {status === 'on_track' && <CheckCircle className="w-4 h-4" />}
                    {status === 'exceeded' ? 'Exceeded' : 
                     status === 'warning' ? 'Warning' : 
                     status === 'under_budget' ? 'Under Budget' : 
                     'On Track'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredBudgets.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200 mt-6"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <Target className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {budgets.length === 0 ? 'No budgets created yet' : 'No matching budgets found'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {budgets.length === 0 
                ? 'Start by creating your first budget to track your spending limits'
                : 'Try adjusting your filters to see more results'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedMonth('all');
                setShowAddModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {budgets.length === 0 ? 'Create First Budget' : 'Create New Budget'}
            </button>
          </motion.div>
        )}

        {/* Add Budget Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Budget</h3>
                
                <form onSubmit={handleAddBudget} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (Rs) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleFormChange}
                      placeholder="0.00"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month *
                    </label>
                    <input
                      type="month"
                      value={formData.month_year ? formData.month_year.slice(0, 7) : ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        month_year: e.target.value + '-01'
                      }))}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all"
                    >
                      Create Budget
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Budget Modal */}
        <AnimatePresence>
          {showEditModal && editingBudget && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Budget</h3>
                
                <form onSubmit={handleEditBudget} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (Rs) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleFormChange}
                      placeholder="0.00"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month *
                    </label>
                    <input
                      type="month"
                      value={formData.month_year ? formData.month_year.slice(0, 7) : ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        month_year: e.target.value + '-01'
                      }))}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingBudget(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all"
                    >
                      Update Budget
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BudgetsPage;
