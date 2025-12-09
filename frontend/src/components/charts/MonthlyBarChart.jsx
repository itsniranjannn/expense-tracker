import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MonthlyBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Monthly Spending Trend</h3>
            <p className="text-sm text-gray-600">Last 6 months overview</p>
          </div>
        </div>
        <div className="h-72 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">No monthly data available</p>
            <p className="text-sm text-gray-400">Add expenses to see trends</p>
          </div>
        </div>
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map(item => ({
    month: item.month?.split('-')[1] || 'MM',
    amount: parseFloat(item.total) || 0,
    name: item.month || 'Unknown'
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Monthly Spending Trend</h3>
          <p className="text-sm text-gray-600">Last 6 months overview</p>
        </div>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#666"
              tickFormatter={(value) => {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return months[parseInt(value) - 1] || value;
              }}
            />
            <YAxis 
              stroke="#666"
              tickFormatter={(value) => `Rs ${value}`}
            />
            <Tooltip
              formatter={(value) => [`Rs ${parseFloat(value).toLocaleString()}`, 'Amount']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Bar 
              dataKey="amount" 
              name="Spending" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyBarChart;