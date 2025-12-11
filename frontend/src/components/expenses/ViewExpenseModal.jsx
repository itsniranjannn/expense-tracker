import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, DollarSign, CreditCard, FileText, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PaymentIcon } from '../common/ImageAssets';

const ViewExpenseModal = ({ isOpen, onClose, expense }) => {
  if (!isOpen || !expense) return null;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const handleViewReceipt = () => {
    if (expense.receipt_image) {
      window.open(`http://localhost:5000${expense.receipt_image}`, '_blank');
    } else {
      toast.error('No receipt available');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': 'bg-blue-100 text-blue-800',
      'Transportation': 'bg-emerald-100 text-emerald-800',
      'Shopping': 'bg-amber-100 text-amber-800',
      'Bills & Utilities': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Healthcare': 'bg-rose-100 text-rose-800',
      'Education': 'bg-indigo-100 text-indigo-800',
      'Groceries': 'bg-green-100 text-green-800',
      'Travel': 'bg-cyan-100 text-cyan-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Expense Details</h2>
                  <p className="text-indigo-100">Complete information about this expense</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-indigo-200 p-2 rounded-full hover:bg-white/10 transition duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Main Info */}
            <div className="space-y-6">
              {/* Title and Amount */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{expense.title}</h3>
                  <p className="text-gray-600 mt-1">{expense.description || 'No description'}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    Rs {expense.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Amount</div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Tag className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Category</span>
                  </div>
                  <span className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-full ${getCategoryColor(expense.category)}`}>
                    {expense.category}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Payment Method</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PaymentIcon method={expense.payment_method} className="w-8 h-8" />
                    <span className="font-medium text-gray-900">{expense.payment_method}</span>
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Date & Time</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{formatDate(expense.expense_date)}</div>
                    <div className="text-sm text-gray-500">{formatTime(expense.created_at)}</div>
                  </div>
                </div>

                {/* Created At */}
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Recorded On</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {new Date(expense.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(expense.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recurring Info */}
              {expense.is_recurring && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">Recurring Expense</div>
                      <div className="text-sm text-blue-700">
                        Frequency: {expense.recurring_frequency || 'Monthly'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Receipt Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-900">Receipt</span>
                  </div>
                  {expense.receipt_image && (
                    <button
                      onClick={handleViewReceipt}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition duration-200 flex items-center"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      View Receipt
                    </button>
                  )}
                </div>
                
                {expense.receipt_image ? (
                  <div className="relative group">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-indigo-300 transition duration-200">
                      <div className="flex items-center justify-center space-x-3">
                        <Image className="w-12 h-12 text-gray-400" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900">Receipt Attached</div>
                          <div className="text-sm text-gray-500">
                            Click "View Receipt" to see the full image
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <div className="font-medium text-gray-900">No receipt uploaded</div>
                    <div className="text-sm text-gray-500 mt-1">
                      This expense doesn't have a receipt attached
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ViewExpenseModal;