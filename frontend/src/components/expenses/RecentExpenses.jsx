import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { PaymentIcon } from '../common/ImageAssets';
import ViewExpenseModal from './ViewExpenseModal';

const RecentExpenses = ({ expenses, loading, onDelete, onEdit }) => {
  const [viewingExpense, setViewingExpense] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': 'bg-blue-100 text-blue-800 border border-blue-200',
      'Transportation': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      'Shopping': 'bg-amber-100 text-amber-800 border border-amber-200',
      'Bills & Utilities': 'bg-purple-100 text-purple-800 border border-purple-200',
      'Entertainment': 'bg-pink-100 text-pink-800 border border-pink-200',
      'Healthcare': 'bg-rose-100 text-rose-800 border border-rose-200',
      'Education': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      'Groceries': 'bg-green-100 text-green-800 border border-green-200',
      'Travel': 'bg-cyan-100 text-cyan-800 border border-cyan-200',
      'Other': 'bg-gray-100 text-gray-800 border border-gray-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleEditClick = (expense) => {
    setEditingId(expense.id);
    setEditForm({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      payment_method: expense.payment_method
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await onEdit(id, editForm);
      setEditingId(null);
      toast.success('Expense updated successfully!');
    } catch (error) {
      toast.error('Failed to update expense');
      console.error('Error updating expense:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await onDelete(id);
        toast.success('Expense deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete expense');
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleViewExpense = (expense) => {
    setViewingExpense(expense);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 animate-pulse rounded-xl p-4 h-24"></div>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">💸</span>
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">No recent expenses</h3>
        <p className="text-gray-500 text-sm">Start adding expenses to see them here</p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {expenses.map((expense, index) => (
          <motion.div
            key={expense.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => handleViewExpense(expense)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <PaymentIcon method={expense.payment_method} className="w-10 h-10" />
                  <div>
                    <h4 className="font-semibold text-gray-900 truncate">{expense.title}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm text-gray-500">{formatDate(expense.expense_date)}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-lg font-bold text-gray-900">
                  Rs {expense.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            
            {expense.description && (
              <p className="text-sm text-gray-600 mt-3 line-clamp-2">{expense.description}</p>
            )}
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Added {new Date(expense.created_at).toLocaleDateString()}
              </div>
              <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEditClick(expense)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(expense.id, expense.title);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View Expense Modal */}
      <ViewExpenseModal
        isOpen={!!viewingExpense}
        onClose={() => setViewingExpense(null)}
        expense={viewingExpense}
      />
    </>
  );
};

export default RecentExpenses;