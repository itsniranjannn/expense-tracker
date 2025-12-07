import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const CategoryDistribution = ({ data }) => {
  // Ensure data is an array and has values
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="card"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
          <p className="text-sm text-gray-600">Spending by category</p>
        </div>
        <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500">No category data available</p>
            <p className="text-sm text-gray-400 mt-1">Add expenses with categories</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  // Prepare chart data - ensure all values are numbers
  const chartData = data.map(item => ({
    category: item.category || 'Unknown',
    amount: parseFloat(item.amount) || 0,
    percentage: parseFloat(item.percentage) || 0
  })).filter(item => item.amount > 0); // Filter out zero amounts

  if (chartData.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="card"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
          <p className="text-sm text-gray-600">Spending by category</p>
        </div>
        <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500">No category spending data</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="card"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
        <p className="text-sm text-gray-600">Spending by category</p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, amount }) => `${category}: ₹${amount.toLocaleString()}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
              nameKey="category"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`₹${parseFloat(value).toLocaleString()}`, 'Amount']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.slice(0, 4).map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: colors[index] }}
              />
              <span className="text-sm font-medium text-gray-700 truncate">
                {item.category}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              ₹{(parseFloat(item.amount) || 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CategoryDistribution;