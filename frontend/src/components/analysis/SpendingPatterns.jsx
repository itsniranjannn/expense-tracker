import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Filter,
  Download,
  Eye,
  EyeOff,
  DollarSign
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const SpendingPatterns = ({ patterns, timeSeriesData = [], categoryData = [] }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [realTimeSeriesData, setRealTimeSeriesData] = useState([]);
  const [realCategoryData, setRealCategoryData] = useState([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    averageExpense: 0,
    highestExpense: 0,
    lowestExpense: 0
  });

  // Load real data on component mount
  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      // Use provided data or fetch new
      if (timeSeriesData && timeSeriesData.length > 0) {
        setRealTimeSeriesData(timeSeriesData);
      } else {
        // Fetch expenses for time series
        const expenses = await expenseService.getAllExpenses();
        if (expenses && Array.isArray(expenses)) {
          const processedData = processExpensesForTimeSeries(expenses);
          setRealTimeSeriesData(processedData);
          
          // Calculate stats
          const amounts = expenses.map(exp => parseFloat(exp.amount) || 0);
          setStats({
            totalSpent: amounts.reduce((a, b) => a + b, 0),
            averageExpense: amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0,
            highestExpense: amounts.length > 0 ? Math.max(...amounts) : 0,
            lowestExpense: amounts.length > 0 ? Math.min(...amounts) : 0
          });
        }
      }

      if (categoryData && categoryData.length > 0) {
        setRealCategoryData(categoryData);
      } else {
        // Fetch category breakdown
        const categories = await expenseService.getCategoryBreakdown();
        if (categories && Array.isArray(categories)) {
          const processedCategories = processCategoriesForDisplay(categories);
          setRealCategoryData(processedCategories);
        }
      }
    } catch (error) {
      console.error('Error loading spending patterns data:', error);
    }
  };

  const processExpensesForTimeSeries = (expenses) => {
    if (!expenses || !Array.isArray(expenses)) return [];
    
    const dailyTotals = {};
    
    expenses.forEach(expense => {
      if (!expense.expense_date) return;
      
      let date;
      if (expense.expense_date instanceof Date) {
        date = expense.expense_date;
      } else if (typeof expense.expense_date === 'string') {
        date = new Date(expense.expense_date);
      } else if (expense.expense_date.getMonth) {
        date = expense.expense_date;
      } else {
        date = new Date();
      }
      
      const dateString = date.toISOString().split('T')[0];
      const amount = parseFloat(expense.amount) || 0;
      
      dailyTotals[dateString] = (dailyTotals[dateString] || 0) + amount;
    });
    
    // Convert to array and sort
    return Object.entries(dailyTotals)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, amount], index) => {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();
        
        return {
          date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: parseFloat(amount.toFixed(2)),
          weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          trend: index > 0 && amount > Object.values(dailyTotals)[index - 1] ? 'up' : 
                 index > 0 && amount < Object.values(dailyTotals)[index - 1] ? 'down' : 'stable'
        };
      });
  };

  const processCategoriesForDisplay = (categories) => {
    if (!categories || !Array.isArray(categories)) return [];
    
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6'];
    
    return categories.map((category, index) => ({
      category: category.category || 'Unknown',
      count: category.count || 0,
      amount: parseFloat(category.total || category.amount || 0),
      impact: getImpactLevel(category.total || category.amount),
      color: colors[index % colors.length]
    }));
  };

  const getImpactLevel = (amount) => {
    if (amount > 10000) return 'High';
    if (amount > 5000) return 'Medium';
    return 'Low';
  };

  // Calculate pattern statistics from real data
  const patternStats = {
    totalPatterns: patterns.length,
    highConfidence: patterns.filter(p => parseFloat(p.confidence) >= 85).length,
    highImpact: patterns.filter(p => p.impact === 'High').length,
    activePatterns: patterns.filter(p => p.confidence !== '0%').length
  };

  // Calculate weekend vs weekday spending
  const calculateWeekendStats = () => {
    if (realTimeSeriesData.length === 0) return { weekendAvg: 0, weekdayAvg: 0, peakDay: 0 };
    
    const weekendExpenses = realTimeSeriesData.filter(d => d.isWeekend);
    const weekdayExpenses = realTimeSeriesData.filter(d => !d.isWeekend);
    
    const weekendAvg = weekendExpenses.length > 0 
      ? weekendExpenses.reduce((sum, d) => sum + d.amount, 0) / weekendExpenses.length 
      : 0;
    
    const weekdayAvg = weekdayExpenses.length > 0 
      ? weekdayExpenses.reduce((sum, d) => sum + d.amount, 0) / weekdayExpenses.length 
      : 0;
    
    const peakDay = realTimeSeriesData.length > 0 
      ? Math.max(...realTimeSeriesData.map(d => d.amount))
      : 0;
    
    return { weekendAvg, weekdayAvg, peakDay };
  };

  const weekendStats = calculateWeekendStats();

  const getImpactColor = (impact) => {
    switch(impact) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence) => {
    const percent = parseFloat(confidence);
    if (percent >= 90) return 'text-green-600';
    if (percent >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <TrendingUp className="w-4 h-4 text-gray-400" />;
    }
  };

  const exportPatternsData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      patterns: patterns,
      timeSeriesData: realTimeSeriesData,
      categoryData: realCategoryData,
      statistics: {
        ...stats,
        ...weekendStats,
        patternStats
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `spending-patterns-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-blue-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Spent</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                Rs {stats.totalSpent.toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Across {realTimeSeriesData.length} days
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium">Patterns Detected</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {patternStats.totalPatterns}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7" />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {patternStats.highImpact} high impact patterns
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-yellow-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium">Average Expense</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                Rs {stats.averageExpense.toFixed(0)}
              </p>
            </div>
            <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7" />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Per transaction
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-purple-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium">Highest Expense</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                Rs {stats.highestExpense.toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Single largest purchase
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Time Range:</span>
              {['week', 'month', 'quarter', 'year'].map(range => (
                <motion.button
                  key={range}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </motion.button>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Chart Type:</span>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setChartType('bar')}
                  className={`p-2 rounded-lg transition-all ${
                    chartType === 'bar' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setChartType('line')}
                  className={`p-2 rounded-lg transition-all ${
                    chartType === 'line' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setChartType('area')}
                  className={`p-2 rounded-lg transition-all ${
                    chartType === 'area' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <PieChart className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDetails(!showDetails)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-medium ${
                showDetails 
                  ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportPatternsData}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg"
            >
              <Download className="w-5 h-5" />
              <span>Export Data</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Time Series Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Spending Timeline</h3>
              <p className="text-gray-600">Daily spending patterns over time</p>
            </div>
            <div className="text-sm text-blue-600 font-medium">
              {realTimeSeriesData.length} days of data
            </div>
          </div>
          
          {realTimeSeriesData.length > 0 ? (
            <>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={realTimeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `Rs ${value.toLocaleString()}`} />
                      <Tooltip 
                        formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Amount']}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.75rem'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="amount" 
                        fill="#3B82F6" 
                        name="Daily Spending"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  ) : chartType === 'line' ? (
                    <LineChart data={realTimeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `Rs ${value.toLocaleString()}`} />
                      <Tooltip 
                        formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Amount']}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.75rem'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        activeDot={{ r: 8 }}
                        name="Daily Spending"
                      />
                    </LineChart>
                  ) : (
                    <AreaChart data={realTimeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `Rs ${value.toLocaleString()}`} />
                      <Tooltip 
                        formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Amount']}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.75rem'
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        fill="url(#colorGradient)" 
                        fillOpacity={0.3}
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="Daily Spending"
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                  <div className="text-sm font-medium text-red-700 mb-1">Weekend Average</div>
                  <div className="text-2xl font-bold text-red-800">
                    Rs {weekendStats.weekendAvg.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="text-sm font-medium text-green-700 mb-1">Weekday Average</div>
                  <div className="text-2xl font-bold text-green-800">
                    Rs {weekendStats.weekdayAvg.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="text-sm font-medium text-blue-700 mb-1">Peak Day</div>
                  <div className="text-2xl font-bold text-blue-800">
                    Rs {weekendStats.peakDay.toLocaleString()}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
              <h4 className="text-lg font-bold text-gray-700 mb-2">No Data Available</h4>
              <p className="text-gray-500">Add expenses to see spending patterns</p>
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Category Distribution</h3>
              <p className="text-gray-600">Spending by category</p>
            </div>
            <div className="text-sm text-green-600 font-medium">
              {realCategoryData.length} categories
            </div>
          </div>
          
          {realCategoryData.length > 0 ? (
            <div className="space-y-6">
              {realCategoryData.slice(0, 5).map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-bold text-gray-800">{category.category}</span>
                    </div>
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${getImpactColor(category.impact)}`}>
                      {category.impact}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-gray-700">
                      <span className="text-sm">Amount: </span>
                      <span className="font-bold">Rs {category.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium">
                        {category.count} {category.count === 1 ? 'expense' : 'expenses'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(category.amount / Math.max(...realCategoryData.map(c => c.amount))) * 100}%` }}
                      transition={{ delay: index * 0.2, duration: 1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <PieChart className="w-16 h-16 text-gray-300 mb-4" />
              <h4 className="text-lg font-bold text-gray-700 mb-2">No Category Data</h4>
              <p className="text-gray-500">Categorize your expenses to see distribution</p>
            </div>
          )}

          <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-700">Data Updated</p>
                <p className="text-sm text-gray-600">Refreshes when you add new expenses</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patterns Table */}
      {patterns.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Detected Patterns</h3>
                <p className="text-gray-600">Patterns identified from your spending behavior</p>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full font-bold">
                {patterns.length} patterns
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Pattern
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Impact
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200">
                {patterns.map((pattern, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`hover:bg-blue-50/50 transition duration-300 ${
                      selectedPattern === index ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedPattern(index)}
                  >
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-800">{pattern.pattern}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Detected by K-Means algorithm
                      </div>
                    </td>
                    
                    <td className="px-8 py-5">
                      <div className={`text-xl font-bold ${getConfidenceColor(pattern.confidence)}`}>
                        {pattern.confidence}
                      </div>
                      <div className="text-xs text-gray-500">confidence level</div>
                    </td>
                    
                    <td className="px-8 py-5">
                      <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full ${getImpactColor(pattern.impact)}`}>
                        {pattern.impact}
                      </span>
                    </td>
                    
                    <td className="px-8 py-5">
                      <div className="text-gray-700 max-w-md">
                        {pattern.details || 'Analyzed from your spending data'}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {showDetails && selectedPattern !== null && patterns[selectedPattern] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-gray-800 text-xl mb-2">Pattern Analysis</h4>
                  <p className="text-gray-700 text-lg">{patterns[selectedPattern].pattern}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedPattern(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </motion.button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-500 mb-2">Confidence Level</div>
                  <div className="text-2xl font-bold text-blue-600">{patterns[selectedPattern].confidence}</div>
                  <div className="text-xs text-gray-500 mt-1">Based on data analysis</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-500 mb-2">Impact Level</div>
                  <div className={`text-2xl font-bold ${patterns[selectedPattern].impact === 'High' ? 'text-red-600' : patterns[selectedPattern].impact === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {patterns[selectedPattern].impact}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Effect on your budget</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-500 mb-2">Recommendation</div>
                  <div className="text-lg font-medium text-gray-800">
                    Review this pattern for optimization
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-5 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="font-bold text-gray-800">Action Required</span>
                </div>
                <p className="text-gray-700">
                  Consider adjusting your spending behavior for this pattern to optimize your budget.
                  {patterns[selectedPattern].details && ` ${patterns[selectedPattern].details}`}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Insights Section */}
      {patterns.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center mb-8">
            <AlertTriangle className="w-8 h-8 mr-4" />
            <h3 className="text-2xl font-bold">Key Insights from Your Spending</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Spending Patterns',
                description: patterns.length > 0 
                  ? `${patterns.length} distinct patterns identified in your spending behavior`
                  : 'Add more expenses to identify spending patterns',
                icon: '📊'
              },
              {
                title: 'Optimization Potential',
                description: 'Based on your patterns, there are opportunities to optimize your budget',
                icon: '💰'
              },
              {
                title: 'Next Steps',
                description: 'Review the patterns table above for specific action items',
                icon: '🎯'
              }
            ].map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition duration-300"
              >
                <div className="text-3xl mb-4">{insight.icon}</div>
                <h4 className="font-bold text-xl mb-3">{insight.title}</h4>
                <p className="text-blue-100">{insight.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingPatterns;