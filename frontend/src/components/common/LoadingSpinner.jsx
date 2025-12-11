import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading Smart Budget Analyzer...</p>
        <p className="text-gray-500 text-sm mt-2">Preparing your financial insights</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;