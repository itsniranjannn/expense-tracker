import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit2, Receipt, Calendar, Tag, CreditCard } from 'lucide-react';
import { expenseService } from '../../services/expenseService';
import { toast } from 'react-hot-toast';

const RecentExpenses = ({ expenses, onDelete, onEdit }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': 'bg-red-100 text-red-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Bills & Utilities': 'bg-yellow-100 text-yellow-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'Education': 'bg-indigo-100 text-indigo-800',
      'Groceries': 'bg-teal-100 text-teal-800',
      'Travel': 'bg-orange-100 text-orange-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(id);
        toast.success('Expense deleted successfully');
        onDelete(id);
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
          <p className="text-sm text-gray-600">Latest expense transactions</p>
        </div>
        <span className="text-sm font-medium text-gray-500">
          {expenses.length} transactions
        </span>
      </div>
      
      <div className="space-y-3">
        <AnimatePresence>
          {expenses.map((expense) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* Left side: Expense info */}
              <div className="flex items-center space-x-4 flex-1">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Receipt className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {expense.title}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(expense.expense_date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CreditCard className="w-3 h-3 mr-1" />
                      {expense.payment_method}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right side: Amount and actions */}
              <div className="flex items-center space-x-4">
                {/* Category */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                  <Tag className="w-3 h-3 inline mr-1" />
                  {expense.category}
                </span>
                
                {/* Amount */}
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ₹{parseFloat(expense.amount).toLocaleString()}
                  </p>
                  {expense.description && (
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                      {expense.description}
                    </p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(expense)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {expenses.length === 0 && (
        <div className="text-center py-8">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No expenses found</p>
          <p className="text-sm text-gray-400 mt-1">Add your first expense to get started</p>
        </div>
      )}
    </div>
  );
};

export default RecentExpenses;