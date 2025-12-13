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
  Receipt,
  ChevronRight,
  CreditCard,
  Tag,
  DollarSign,
  Sparkles,
  Target,
  PieChart
} from 'lucide-react';
import ExpenseTable from '../components/expenses/ExpenseTable';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import RecentExpenses from '../components/expenses/RecentExpenses';
import QuickAddExpense from '../components/expenses/QuickAddExpense';
import { expenseService } from '../services/expenseService';
import { toast } from 'react-hot-toast';
import { PaymentIcon } from '../components/common/ImageAssets';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
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
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await expenseService.getAllExpenses(filters);
      setExpenses(response.expenses || []);
      toast.success(`Loaded ${response.expenses?.length || 0} expenses`);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [expensesRes, categoryRes] = await Promise.all([
        expenseService.getAllExpenses(),
        expenseService.getCategoryBreakdown()
      ]);
      
      const allExpenses = expensesRes.expenses || [];
      const categories = categoryRes.breakdown || [];
      
      // Calculate statistics
      const total = allExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const avg = allExpenses.length > 0 ? total / allExpenses.length : 0;
      const highest = Math.max(...allExpenses.map(exp => exp.amount || 0));
      
      // Current month total
      const currentMonth = new Date().getMonth();
      const thisMonthTotal = allExpenses
        .filter(exp => new Date(exp.expense_date).getMonth() === currentMonth)
        .reduce((sum, exp) => sum + (exp.amount || 0), 0);

      setStats({
        total: total || 0,
        average: avg || 0,
        highest: highest || 0,
        thisMonth: thisMonthTotal || 0,
        categoryBreakdown: categories,
        totalCount: allExpenses.length
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      toast.error('Failed to load statistics');
    }
  };

const handleAddExpense = async (expenseData) => {
  try {
    const response = await expenseService.addExpense(expenseData);
    if (response.success) {
      toast.success('Expense added successfully! 💰');
      fetchExpenses();
      fetchStats();
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
        fetchExpenses();
        fetchStats();
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
        fetchExpenses();
        fetchStats();
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
    fetchExpenses();
    setShowFilters(false);
    toast.success('Filters applied successfully! 🔍');
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
    setSearchTerm('');
    fetchExpenses();
    toast.success('Filters reset! 🔄');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Implement search logic here
  };

  const exportToCSV = () => {
    if (expenses.length === 0) {
      toast.error('No expenses to export');
      return;
    }
    
    const headers = ['Title', 'Category', 'Amount', 'Date', 'Payment Method', 'Description'];
    const csvData = expenses.map(exp => [
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

  const filteredExpenses = expenses.filter(expense => {
    if (!searchTerm) return true;
    return expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           expense.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities',
    'Entertainment', 'Healthcare', 'Education', 'Groceries', 'Other'
  ];

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
                <span className="text-sm font-medium">Smart Expense Tracking</span>
              </motion.div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
                Expense Management
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl">
                Track, analyze, and optimize your spending with intelligent insights
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

          {/* Stats Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
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

            {/* Highest Expense Card */}
            <motion.div variants={itemVariants} className="relative group">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/30 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-200/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Highest Expense</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">
                      Rs {stats.highest.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Single transaction</p>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </motion.div>
                </div>
                <div className="mt-4 h-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"></div>
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
          </motion.div>
        </motion.div>

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

        {/* Category Quick Filters */}
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
                <h3 className="text-lg font-semibold text-gray-900">Quick Category Filters</h3>
              </div>
              <span className="text-sm text-gray-500">{expenses.length} expenses</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['All', ,...categories].map(category => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setFilters({ ...filters, category: category === 'All' ? 'all' : category });
                    fetchExpenses();
                  }}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    (filters.category === category || (category === 'All' && filters.category === 'all'))
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
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
            />
          ) : (
            <RecentExpenses
              expenses={filteredExpenses.slice(0, 10)}
              loading={loading}
              onDelete={handleDeleteExpense}
              onEdit={handleUpdateExpense}
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
            />
          )}
        </AnimatePresence>

        {/* Floating Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-200/30 rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Smart Expense Insights</h4>
                <p className="text-sm text-gray-600">
                  Track your spending patterns and get personalized recommendations
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-50 transition duration-200">
              View Analytics →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Expenses;