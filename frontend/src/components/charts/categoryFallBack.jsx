// frontend/src/components/charts/CategoryFallback.jsx
import React from 'react';
import { PieChart } from 'lucide-react';

const CategoryFallback = () => {
  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
        <p className="text-sm text-gray-600">Spending by category</p>
      </div>
      <div className="h-72 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
        <PieChart className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500">No category data available</p>
        <p className="text-sm text-gray-400 mt-1">Add expenses to see breakdown</p>
      </div>
    </div>
  );
};

export default CategoryFallback;