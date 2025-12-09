import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeeklyLineChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekly Spending Trend</h3>
            <p className="text-sm text-gray-600">Last 4 weeks overview</p>
          </div>
        </div>
        <div className="h-72 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">No weekly data available</p>
            <p className="text-sm text-gray-400">Add expenses to see trends</p>
          </div>
        </div>
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map(item => ({
    week: `${item.week_start} - ${item.week_end}`,
    amount: parseFloat(item.total) || 0,
    name: `Week ${item.week}`
  })).reverse(); // Reverse to show oldest to newest

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Weekly Spending Trend</h3>
          <p className="text-sm text-gray-600">Last 4 weeks overview</p>
        </div>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="week" 
              stroke="#666"
            />
            <YAxis 
              stroke="#666"
              tickFormatter={(value) => `Rs ${value}`}
            />
            <Tooltip
              formatter={(value) => [`Rs ${parseFloat(value).toLocaleString()}`, 'Amount']}
              labelFormatter={(label) => `Week: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="amount" 
              name="Spending" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyLineChart;