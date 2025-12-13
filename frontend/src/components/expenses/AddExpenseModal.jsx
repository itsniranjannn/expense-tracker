import React, { useState } from 'react';
import { X, Upload, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AddExpenseModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Food & Dining',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
    payment_method: 'Cash',
    is_recurring: false,
    recurring_frequency: 'Monthly'
  });

  const [loading, setLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Groceries',
    'Travel',
    'Personal Care',
    'Savings',
    'Investment',
    'Gifts & Donations',
    'Other'
  ];

  const paymentMethods = [
    'Cash',
    'Card',
    'Esewa',
    'Khalti',
    'Other'
  ];

  const recurringFrequencies = [
    'Daily',
    'Weekly',
    'Monthly',
    'Yearly'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!formData.title || !formData.amount || !formData.expense_date) {
    toast.error('Please fill all required fields');
    return;
  }

  if (parseFloat(formData.amount) <= 0) {
    toast.error('Amount must be greater than 0');
    return;
  }

  setLoading(true);
  
  try {
    // Create FormData object (important for file upload)
    const formDataToSend = new FormData();
    
    // Append all fields to FormData
    formDataToSend.append('title', formData.title);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('amount', formData.amount);
    formDataToSend.append('expense_date', formData.expense_date);
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('payment_method', formData.payment_method);
    formDataToSend.append('is_recurring', formData.is_recurring.toString());
    
    if (formData.is_recurring) {
      formDataToSend.append('recurring_frequency', formData.recurring_frequency);
    }
    
    // Append receipt file if exists
    if (receiptFile) {
      formDataToSend.append('receipt', receiptFile);
    }
    
    await onSubmit(formDataToSend);
    toast.success('Expense added successfully!');
    handleClose();
  } catch (error) {
    console.error('Error adding expense:', error);
    toast.error(error.message || 'Failed to add expense');
  } finally {
    setLoading(false);
  }
};
  const handleClose = () => {
    setFormData({
      title: '',
      category: 'Food & Dining',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      description: '',
      payment_method: 'Cash',
      is_recurring: false,
      recurring_frequency: 'Monthly'
    });
    setReceiptFile(null);
    setReceiptPreview(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Add New Expense</h2>
                <p className="text-indigo-100">Track your spending to analyze patterns</p>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:text-indigo-200 p-2 rounded-full hover:bg-white/10 transition duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Dinner at Restaurant, Monthly Rent, etc."
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (Rs) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="expense_date"
                    value={formData.expense_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  <Calendar className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              {/* Recurring Expense */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_recurring"
                      checked={formData.is_recurring}
                      onChange={handleChange}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Recurring Expense</span>
                  </label>
                  
                  {formData.is_recurring && (
                    <select
                      name="recurring_frequency"
                      value={formData.recurring_frequency}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {recurringFrequencies.map(freq => (
                        <option key={freq} value={freq}>{freq}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Receipt Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition duration-200 cursor-pointer">
                  <input
                    type="file"
                    id="receipt"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="receipt" className="cursor-pointer block">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {receiptPreview ? 'Change receipt image' : 'Click to upload receipt'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PNG, JPG, PDF (MAX. 5MB)
                    </p>
                  </label>
                </div>
                
                {receiptPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Add any additional details about this expense..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding...
                  </>
                ) : (
                  'Add Expense'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddExpenseModal;