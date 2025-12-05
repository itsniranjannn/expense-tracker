import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, PieChart, BarChart3, CheckCircle, ExternalLink } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to your expense analyzer</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Spent', value: '₹25,430', change: '+12%', icon: Wallet, color: 'primary' },
          { title: 'This Month', value: '₹8,560', change: '-5%', icon: TrendingUp, color: 'secondary' },
          { title: 'Categories', value: '8', change: 'Active', icon: PieChart, color: 'purple' },
          { title: 'Avg Daily', value: '₹285', change: 'Per day', icon: BarChart3, color: 'orange' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                <p className={`text-sm mt-1 ${
                  stat.change.startsWith('+') ? 'text-green-600' : 
                  stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">🎉 Project Setup Complete!</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Your full-stack application is ready. Both frontend and backend are running successfully.
          </p>
          
          <div className="space-y-3 bg-white/50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Frontend: Running on port 5173</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Backend: Running on port 5000</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700">MySQL: Configured (ready to connect)</span>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <a 
              href="http://localhost:5000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2"
            >
              <ExternalLink size={18} />
              Visit Backend API
            </a>
            <a 
              href="http://localhost:5000/api/health" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Check Health
            </a>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full btn-primary">+ Add New Expense</button>
            <button className="w-full btn-secondary">View Expense Report</button>
            <button className="w-full btn-secondary">Run K-Means Analysis</button>
            <button className="w-full btn-secondary">Export Data</button>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Next Development Steps</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Connect to Backend API', status: 'pending', desc: 'Make real API calls to Node.js backend' },
            { step: '2', title: 'Implement Authentication', status: 'pending', desc: 'JWT-based login/register system' },
            { step: '3', title: 'MySQL Database Setup', status: 'pending', desc: 'Create tables and seed data' },
            { step: '4', title: 'K-Means Algorithm', status: 'pending', desc: 'Implement clustering for expense analysis' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="font-semibold text-gray-700">{item.step}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
              </div>
              <div className="flex-shrink-0">
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;