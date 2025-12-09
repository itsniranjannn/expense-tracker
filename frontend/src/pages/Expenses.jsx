// frontend/src/pages/Expenses.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Filter, Download, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Expenses = () => {
  const [expenses, setExpenses] = useState([
    { id: 1, title: 'Groceries', category: 'Food & Dining', amount: 2500, date: '2024-12-01' },
    { id: 2, title: 'Electricity Bill', category: 'Bills & Utilities', amount: 1800, date: '2024-12-02' },
    { id: 3, title: 'Movie Tickets', category: 'Entertainment', amount: 800, date: '2024-12-03' },
    { id: 4, title: 'Petrol', category: 'Transportation', amount: 2000, date: '2024-12-04' },
    { id: 5, title: 'Amazon Purchase', category: 'Shopping', amount: 3500, date: '2024-12-05' },
  ]);
  
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'Food & Dining',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities',
    'Entertainment', 'Healthcare', 'Education', 'Groceries', 'Travel', 'Other'
  ];

  const handleAddExpense = () => {
    if (!newExpense.title || !newExpense.amount) {
      toast.error('Please fill all fields');
      return;
    }

    if (editingId) {
      // Update existing expense
      setExpenses(expenses.map(exp => 
        exp.id === editingId 
          ? { ...newExpense, id: editingId, amount: parseFloat(newExpense.amount) }
          : exp
      ));
      toast.success('Expense updated successfully');
      setEditingId(null);
    } else {
      // Add new expense
      const expenseToAdd = {
        ...newExpense,
        id: expenses.length + 1,
        amount: parseFloat(newExpense.amount)
      };
      setExpenses([expenseToAdd, ...expenses]);
      toast.success('Expense added successfully');
    }

    setNewExpense({
      title: '',
      category: 'Food & Dining',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const handleEdit = (expense) => {
    setNewExpense({
      title: expense.title,
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(exp => exp.id !== id));
      toast.success('Expense deleted successfully');
    }
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Expense Management</h1>
            <p className="text-gray-600">Track and manage all your expenses</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              {showForm ? 'Cancel' : 'Add Expense'}
            </button>
            
            <button className="btn-secondary flex items-center gap-2">
              <Download size={20} />
              Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-gradient-to-r from-blue-50 to-blue-100">
          <h3 className="text-gray-600 text-sm font-medium">Total Expenses</h3>
          <p className="text-2xl font-bold text-gray-800">{expenses.length}</p>
        </div>
        
        <div className="card bg-gradient-to-r from-green-50 to-green-100">
          <h3 className="text-gray-600 text-sm font-medium">Total Spent</h3>
          <p className="text-2xl font-bold text-gray-800">Rs{totalAmount.toLocaleString()}</p>
        </div>
        
        <div className="card bg-gradient-to-r from-purple-50 to-purple-100">
          <h3 className="text-gray-600 text-sm font-medium">Categories</h3>
          <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
        </div>
        
        <div className="card bg-gradient-to-r from-orange-50 to-orange-100">
          <h3 className="text-gray-600 text-sm font-medium">Avg per Expense</h3>
          <p className="text-2xl font-bold text-gray-800">
            Rs{expenses.length > 0 ? Math.round(totalAmount / expenses.length) : 0}
          </p>
        </div>
      </div>

      {/* Add/Edit Expense Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="card mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={newExpense.title}
                onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                className="input-field"
                placeholder="Enter expense title"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Category *</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                className="input-field"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Amount (Rs) *</label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                className="input-field"
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                className="input-field"
              />
            </div>
          </div>
          
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAddExpense}
              className="btn-primary"
            >
              {editingId ? 'Update Expense' : 'Add Expense'}
            </button>
            
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setNewExpense({
                  title: '',
                  category: 'Food & Dining',
                  amount: '',
                  date: new Date().toISOString().split('T')[0]
                });
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Search and Filter */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
                placeholder="Search expenses by title or category..."
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-2">
              <Filter size={20} />
              Filter
            </button>
            
            <select className="input-field">
              <option>Sort by: Date (Newest)</option>
              <option>Sort by: Amount (High to Low)</option>
              <option>Sort by: Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No expenses found. {searchTerm && 'Try a different search term.'}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{expense.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        expense.category === 'Food & Dining' ? 'bg-red-100 text-red-800' :
                        expense.category === 'Transportation' ? 'bg-blue-100 text-blue-800' :
                        expense.category === 'Shopping' ? 'bg-purple-100 text-purple-800' :
                        expense.category === 'Bills & Utilities' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">
                        Rs{expense.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(expense.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Category Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category) => {
            const categoryExpenses = expenses.filter(exp => exp.category === category);
            const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            const percentage = totalAmount > 0 ? (categoryTotal / totalAmount * 100).toFixed(1) : 0;
            
            if (categoryTotal === 0) return null;
            
            return (
              <div key={category} className="card">
                <h3 className="font-medium text-gray-700 mb-2">{category}</h3>
                <p className="text-2xl font-bold text-gray-800 mb-1">
                  Rs{categoryTotal.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {categoryExpenses.length} expenses • {percentage}%
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Expenses;