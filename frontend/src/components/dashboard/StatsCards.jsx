import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Wallet, Tag, 
  PieChart as PieChartIcon, Calendar,
  DollarSign,
  BarChart,
  Target,
  ShoppingBag
} from 'lucide-react';

const StatsCards = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-10 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Spending',
      value: `Rs ${stats?.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}`,
      subtitle: `${stats?.totalExpenses || 0} transactions`,
      icon: Wallet,
      color: 'from-indigo-500 to-blue-500',
      trend: stats?.percentageChange >= 0 ? 'up' : 'down',
      trendValue: `${Math.abs(stats?.percentageChange || 0).toFixed(1)}%`,
    },
    {
      title: 'Categories Used',
      value: stats?.totalCategories || 0,
      subtitle: 'Active categories',
      icon: ShoppingBag,
      color: 'from-emerald-500 to-green-500',
      trend: stats?.totalCategories > 5 ? 'up' : 'stable',
      trendValue: stats?.totalCategories > 5 ? 'Good' : 'Normal',
    },
    {
      title: 'Highest Expense',
      value: `Rs ${stats?.highestExpense?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}`,
      subtitle: 'Single transaction',
      icon: Target,
      color: 'from-rose-500 to-pink-500',
      trend: stats?.highestExpense > 5000 ? 'alert' : 'safe',
      trendValue: stats?.highestExpense > 5000 ? 'High' : 'Normal',
    },
    {
      title: 'Monthly Average',
      value: `Rs ${stats?.averageExpense?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}`,
      subtitle: 'Per transaction',
      icon: BarChart,
      color: 'from-amber-500 to-orange-500',
      trend: stats?.averageExpense > 2000 ? 'up' : 'down',
      trendValue: `${stats?.averageExpense > 2000 ? 'High' : 'Low'} avg`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100 hover:border-gray-200 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-6">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.1 }}
              className={`p-3 bg-gradient-to-br ${card.color} rounded-xl shadow-lg`}
            >
              <card.icon className="w-6 h-6 text-white" />
            </motion.div>
            <div className={`flex items-center text-sm font-medium ${
              card.trend === 'up' ? 'text-emerald-600' :
              card.trend === 'down' ? 'text-rose-600' :
              card.trend === 'alert' ? 'text-amber-600' :
              'text-gray-600'
            }`}>
              {card.trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
              {card.trend === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{card.trendValue}</span>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {card.value}
          </h3>
          <p className="text-sm font-medium text-gray-900 mb-1">{card.title}</p>
          <p className="text-sm text-gray-500">{card.subtitle}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;