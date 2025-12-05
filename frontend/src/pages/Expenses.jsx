import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Tag, DollarSign } from 'lucide-react';

const Expenses = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">Expense Management</h1>
        <p className="text-gray-600">Track and manage your expenses</p>
      </motion.div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 rounded-lg">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Expense Tracker</h2>
            <p className="text-gray-600">Coming Soon - Under Development</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: DollarSign, title: 'Add Expense', desc: 'Record new expenses with categories' },
              { icon: Calendar, title: 'Monthly View', desc: 'View expenses by month and date' },
              { icon: Tag, title: 'Categories', desc: 'Organize expenses into categories' },
            ].map((feature, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <feature.icon className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <span className="font-semibold">Development Status:</span> The expense management 
              module is currently being developed. Backend API endpoints are ready and will be 
              connected soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;