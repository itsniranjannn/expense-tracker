import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#84cc16', // Lime
];

const CategoryChart = ({ data }) => {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + (item.total || 0), 0);
  
  // Add percentage to data
  const chartData = data.length > 0 
    ? data.map(item => ({
        ...item,
        percentage: total > 0 ? ((item.total || 0) / total * 100).toFixed(1) : 0
      }))
    : [{ category: 'No Data', total: 1, percentage: 100 }];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => {
              if (entry.category === 'No Data') return 'No Data';
              return `${entry.category}: ${entry.percentage}%`;
            }}
            outerRadius={100}
            innerRadius={40}
            fill="#8884d8"
            dataKey="total"
            nameKey="category"
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => [
              `Rs ${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 
              props.payload.category
            ]}
            labelFormatter={() => ''}
            contentStyle={{ 
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend 
            formatter={(value, entry) => (
              <span style={{ color: '#666', fontSize: '12px' }}>
                {value}: {entry.payload?.percentage || 0}%
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;