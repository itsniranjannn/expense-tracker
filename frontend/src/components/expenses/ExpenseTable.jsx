import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { PaymentIcon } from '../common/ImageAssets';
import ViewExpenseModal from './ViewExpenseModal';

const ExpenseTable = ({ expenses, loading, onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewingExpense, setViewingExpense] = useState(null);
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = expenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(expenses.length / itemsPerPage);

  // Pagination functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
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
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">💸</span>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No expenses found</h3>
        <p className="text-gray-600">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((expense) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === expense.id ? (
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="cursor-pointer hover:text-blue-600" onClick={() => handleViewExpense(expense)}>
                        <div className="font-medium text-gray-900">{expense.title}</div>
                        {expense.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{expense.description}</div>
                        )}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === expense.id ? (
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Food & Dining">Food & Dining</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Bills & Utilities">Bills & Utilities</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        expense.category === 'Food & Dining' ? 'bg-blue-100 text-blue-800' :
                        expense.category === 'Transportation' ? 'bg-emerald-100 text-emerald-800' :
                        expense.category === 'Shopping' ? 'bg-amber-100 text-amber-800' :
                        expense.category === 'Bills & Utilities' ? 'bg-purple-100 text-purple-800' :
                        expense.category === 'Entertainment' ? 'bg-pink-100 text-pink-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {expense.category}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === expense.id ? (
                      <input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        step="0.01"
                      />
                    ) : (
                      <span className="font-bold text-gray-900">
                        Rs {expense.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(expense.expense_date)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === expense.id ? (
                      <select
                        value={editForm.payment_method}
                        onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="Esewa">Esewa</option>
                        <option value="Khalti">Khalti</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <PaymentIcon method={expense.payment_method} className="w-6 h-6" />
                        <span className="text-sm text-gray-700">{expense.payment_method}</span>
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {editingId === expense.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(expense.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition duration-150"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition duration-150"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleViewExpense(expense)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition duration-150"
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleEditClick(expense)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition duration-150"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id, expense.title)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-150"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, expenses.length)}
                </span>{' '}
                of <span className="font-medium">{expenses.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg font-medium ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`w-8 h-8 rounded-lg font-medium ${
                        currentPage === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
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

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export default ExpenseTable;