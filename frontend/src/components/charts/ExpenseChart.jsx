import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ExpenseChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Calculate trend
  const getTrend = () => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };
    
    const firstAmount = data[0].amount;
    const lastAmount = data[data.length - 1].amount;
    const percentage = ((lastAmount - firstAmount) / firstAmount) * 100;
    
    return {
      direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable',
      percentage: Math.abs(percentage).toFixed(1)
    };
  };

  const trend = getTrend();

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Spending Trend</h3>
          <p className="text-sm text-gray-600">Daily expense overview</p>
        </div>
        <div className="flex items-center space-x-2">
          {trend.direction === 'up' ? (
            <TrendingUp className="w-5 h-5 text-red-500" />
          ) : trend.direction === 'down' ? (
            <TrendingDown className="w-5 h-5 text-green-500" />
          ) : null}
          <span className={`text-sm font-medium ${
            trend.direction === 'up' ? 'text-red-600' :
            trend.direction === 'down' ? 'text-green-600' :
            'text-gray-600'
          }`}>
            {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
            {trend.percentage}%
          </span>
        </div>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="#666"
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip
              formatter={(value) => [`₹${value}`, 'Amount']}
              labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseChart;