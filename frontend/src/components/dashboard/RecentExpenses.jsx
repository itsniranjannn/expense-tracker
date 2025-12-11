import React from 'react';
import { Trash2, Edit, ExternalLink, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { expenseService } from '../../services/expenseService';
import { toast } from 'react-hot-toast';

// Import payment method images
const paymentImages = {
  'Cash': '/src/images/cash.png',
  'Card': '/src/images/card.png',
  'Esewa': '/src/images/esewa.png',
  'Khalti': '/src/images/khalti.png',
  'Other': '/src/images/card.png' // fallback
};

const RecentExpenses = ({ expenses, onExpenseDeleted, onExpenseUpdated }) => {
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleViewDetails = (expense) => {
    // Create a modal or detailed view for expense
    const details = `
Title: ${expense.title}
Category: ${expense.category}
Amount: Rs ${expense.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Date: ${formatDate(expense.expense_date)}
Payment: ${expense.payment_method}
${expense.description ? `Description: ${expense.description}` : ''}
    `.trim();
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">Expense Details</h2>
            <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-indigo-200">✕</button>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500">Title</label>
              <p class="font-semibold text-gray-900">${expense.title}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Category</label>
              <span class="${getCategoryColor(expense.category)} text-xs font-semibold px-2 py-1 rounded-full">
                ${expense.category}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Amount</label>
              <p class="font-bold text-gray-900 text-lg">Rs ${expense.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Payment Method</label>
              <div class="flex items-center space-x-2">
                <img src="${paymentImages[expense.payment_method] || paymentImages.Other}" alt="${expense.payment_method}" class="w-6 h-6" />
                <span class="font-medium">${expense.payment_method}</span>
              </div>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-500">Date</label>
              <p class="text-gray-700">${formatDate(expense.expense_date)}</p>
            </div>
            ${expense.description ? `
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-500">Description</label>
              <p class="text-gray-700 bg-gray-50 p-3 rounded-lg">${expense.description}</p>
            </div>` : ''}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Add close event
    modal.querySelector('button').addEventListener('click', () => {
      modal.remove();
    });
  };

  const handleEdit = async (expense) => {
    // In a real app, you'd open an edit modal
    toast('Edit feature coming soon!');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(id);
        toast.success('Expense deleted successfully!');
        if (onExpenseDeleted) {
          onExpenseDeleted();
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error('Failed to delete expense');
      }
    }
  };

  if (expenses.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full py-12"
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
    <div className="space-y-4">
      {expenses.map((expense, index) => (
        <motion.div
          key={expense.id || index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleViewDetails(expense)}>
                <div className="relative">
                  <img 
                    src={paymentImages[expense.payment_method] || paymentImages.Other} 
                    alt={expense.payment_method}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.target.src = paymentImages.Other;
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                    {expense.title}
                  </h4>
                  <p className="text-sm text-gray-500">{formatDate(expense.expense_date)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 ml-4">
              <span className="text-lg font-bold text-gray-900">
                Rs {expense.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(expense.category)}`}>
                {expense.category}
              </span>
            </div>
          </div>
          
          {expense.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-1">{expense.description}</p>
          )}
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Added {new Date(expense.created_at).toLocaleDateString()}
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleViewDetails(expense)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEdit(expense)}
                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDelete(expense.id)}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RecentExpenses;