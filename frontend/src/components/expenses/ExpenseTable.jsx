import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { PaymentIcon } from '../common/ImageAssets';
import ViewExpenseModal from './ViewExpenseModal';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle,
  AlertCircle,
  TrendingDown
} from 'lucide-react';

const ExpenseTable = ({ expenses, loading, onDelete, onEdit, budgets }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [budgetStatuses, setBudgetStatuses] = useState({});
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = expenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(expenses.length / itemsPerPage);

  // Calculate budget statuses when expenses or budgets change
  useEffect(() => {
    if (expenses.length && budgets.length) {
      calculateBudgetStatuses();
    }
  }, [expenses, budgets]);

  // Calculate if expense exceeds budget
  const calculateBudgetStatuses = () => {
    const statuses = {};
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.expense_date);
      const expenseMonth = expenseDate.getMonth();
      const expenseYear = expenseDate.getFullYear();
      
      // Find matching budget for this category and month
      const matchingBudget = budgets.find(budget => {
        if (!budget.month_year) return false;
        const budgetDate = new Date(budget.month_year);
        return budget.category === expense.category && 
               budgetDate.getMonth() === expenseMonth &&
               budgetDate.getFullYear() === expenseYear;
      });
      
      if (matchingBudget) {
        // Get all expenses for this category in this month
        const categoryMonthExpenses = expenses.filter(e => {
          const eDate = new Date(e.expense_date);
          return e.category === expense.category && 
                 eDate.getMonth() === expenseMonth &&
                 eDate.getFullYear() === expenseYear;
        });
        
        const totalSpent = categoryMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        const budgetAmount = parseFloat(matchingBudget.amount || 0);
        const percentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;
        
        statuses[expense.id] = {
          budgeted: budgetAmount,
          spent: totalSpent,
          remaining: budgetAmount - totalSpent,
          percentage: percentage,
          status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'on_track'
        };
      }
    });
    
    setBudgetStatuses(statuses);
  };

  // Budget status badge component
  const BudgetStatusBadge = ({ expenseId }) => {
    const status = budgetStatuses[expenseId];
    
    if (!status) return null;
    
    const getStatusColor = () => {
      switch (status.status) {
        case 'exceeded': return 'bg-red-100 text-red-800 border-red-200';
        case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      }
    };
    
    const getStatusIcon = () => {
      switch (status.status) {
        case 'exceeded': return <AlertTriangle className="w-3 h-3" />;
        case 'warning': return <AlertCircle className="w-3 h-3" />;
        default: return <CheckCircle className="w-3 h-3" />;
      }
    };
    
    return (
      <div className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs border ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="ml-1">
          {status.status === 'exceeded' ? 'Budget Exceeded' : 
           status.status === 'warning' ? `${status.percentage.toFixed(0)}% Used` : 
           `${status.percentage.toFixed(0)}% Used`}
        </span>
      </div>
    );
  };

  // Budget tooltip for more details
  const BudgetTooltip = ({ expenseId }) => {
    const status = budgetStatuses[expenseId];
    
    if (!status) return null;
    
    return (
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
          <div className="font-medium mb-1">Budget Status</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>Budgeted:</div>
            <div className="text-right">Rs {status.budgeted.toFixed(2)}</div>
            <div>Spent:</div>
            <div className="text-right">Rs {status.spent.toFixed(2)}</div>
            <div>Remaining:</div>
            <div className={`text-right ${status.remaining >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              Rs {status.remaining.toFixed(2)}
            </div>
            <div>Usage:</div>
            <div className="text-right">{status.percentage.toFixed(1)}%</div>
          </div>
        </div>
        <div className="w-3 h-3 bg-gray-900 transform rotate-45 absolute left-1/2 -bottom-1 -translate-x-1/2"></div>
      </div>
    );
  };

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Status</th>
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
                    <div className="flex items-center">
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
                      <div className="relative group">
                        <BudgetStatusBadge expenseId={expense.id} />
                        <BudgetTooltip expenseId={expense.id} />
                      </div>
                    </div>
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
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative group">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                        budgetStatuses[expense.id]?.status === 'exceeded' 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : budgetStatuses[expense.id]?.status === 'warning'
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          : budgetStatuses[expense.id] 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}>
                        {budgetStatuses[expense.id] ? (
                          <>
                            {budgetStatuses[expense.id].status === 'exceeded' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {budgetStatuses[expense.id].status === 'warning' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {budgetStatuses[expense.id].status === 'on_track' && <CheckCircle className="w-3 h-3 mr-1" />}
                            <span>
                              {budgetStatuses[expense.id].status === 'exceeded' ? 'Exceeded' : 
                               budgetStatuses[expense.id].status === 'warning' ? 'Warning' : 
                               'On Track'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Target className="w-3 h-3 mr-1" />
                            <span>No Budget</span>
                          </>
                        )}
                      </div>
                      
                      {/* Budget Details Tooltip */}
                      {budgetStatuses[expense.id] && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
                            <div className="font-medium mb-1">Budget Details</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              <div>Budgeted:</div>
                              <div className="text-right">Rs {budgetStatuses[expense.id].budgeted.toFixed(2)}</div>
                              <div>Spent:</div>
                              <div className="text-right">Rs {budgetStatuses[expense.id].spent.toFixed(2)}</div>
                              <div>Remaining:</div>
                              <div className={`text-right ${
                                budgetStatuses[expense.id].remaining >= 0 ? 'text-emerald-300' : 'text-red-300'
                              }`}>
                                Rs {budgetStatuses[expense.id].remaining.toFixed(2)}
                              </div>
                              <div>Usage:</div>
                              <div className="text-right">{budgetStatuses[expense.id].percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                          <div className="w-3 h-3 bg-gray-900 transform rotate-45 absolute left-1/2 -bottom-1 -translate-x-1/2"></div>
                        </div>
                      )}
                    </div>
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
        budgetStatus={budgetStatuses[viewingExpense?.id]}
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
