import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area } from 'recharts';

const ExpenseChart = ({ data }) => {
  // Add color gradient for area
  const gradientColor = '#3b82f6';
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientColor} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={gradientColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis 
            dataKey="month" 
            stroke="#666"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
            tickFormatter={(value) => `Rs ${value.toLocaleString()}`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Amount']}
            labelFormatter={(label) => `Month: ${label}`}
            contentStyle={{ 
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="amount"
            stroke={gradientColor}
            strokeWidth={3}
            dot={{ fill: gradientColor, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 8, stroke: gradientColor, strokeWidth: 2, fill: '#fff' }}
            name="Actual Spending"
          />
          <Line
            type="monotone"
            dataKey="budget"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Budget Limit"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseChart;