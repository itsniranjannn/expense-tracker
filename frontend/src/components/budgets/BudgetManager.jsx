import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Plus, Edit2, Trash2, TrendingUp, TrendingDown,
  CheckCircle, AlertCircle, DollarSign, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BudgetManager = ({ userId }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities',
    'Entertainment', 'Healthcare', 'Education', 'Groceries',
    'Travel', 'Personal Care', 'Savings', 'Investment'
  ];

  const [formData, setFormData] = useState({
    category: 'Food & Dining',
    amount: '',
    month_year: new Date().toISOString().slice(0, 7) + '-01'
  });

  useEffect(() => {
    fetchBudgets();
  }, [userId]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      // This would call your budget service
      // const response = await budgetService.getBudgets(userId);
      // setBudgets(response.budgets || []);
      
      // Mock data for now
      setBudgets([
        { id: 1, category: 'Food & Dining', amount: 5000, month_year: '2024-12-01', spent: 4200 },
        { id: 2, category: 'Transportation', amount: 3000, month_year: '2024-12-01', spent: 2800 },
        { id: 3, category: 'Groceries', amount: 4000, month_year: '2024-12-01', spent: 3500 },
        { id: 4, category: 'Entertainment', amount: 2000, month_year: '2024-12-01', spent: 2500 },
      ]);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      // This would call your budget service
      // await budgetService.createBudget({ ...formData, user_id: userId });
      
      toast.success('Budget set successfully!');
      setShowForm(false);
      setFormData({
        category: 'Food & Dining',
        amount: '',
        month_year: new Date().toISOString().slice(0, 7) + '-01'
      });
      
      fetchBudgets();
    } catch (error) {
      toast.error('Failed to set budget');
    }
  };

  const deleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        // await budgetService.deleteBudget(id);
        toast.success('Budget deleted');
        fetchBudgets();
      } catch (error) {
        toast.error('Failed to delete budget');
      }
    }
  };

  const getProgressColor = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage < 70) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (percentage < 90) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Budget Management</h3>
          <p className="text-sm text-gray-600">Set and track your spending limits</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Budget</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading budgets...</p>
        </div>
      ) : budgets.length > 0 ? (
        <div className="space-y-4">
          {budgets.map(budget => {
            const spent = budget.spent || 0;
            const remaining = budget.amount - spent;
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            
            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{budget.category}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(budget.month_year).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(spent, budget.amount)}
                    <button
                      onClick={() => deleteBudget(budget.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">
                      Spent: ₹{spent.toLocaleString()}
                    </span>
                    <span className="font-medium text-gray-700">
                      Budget: ₹{budget.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(spent, budget.amount)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                {/* Status */}
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className={`font-medium ${
                      remaining >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {remaining >= 0 ? 'Remaining: ' : 'Overspent: '}
                      ₹{Math.abs(remaining).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    {remaining >= 0 ? (
                      <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No budgets set yet</p>
          <p className="text-sm text-gray-400 mt-1">Set budgets to track your spending limits</p>
        </div>
      )}

      {/* Budget Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Set New Budget</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="input-field"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="input-field"
                  placeholder="5000"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <input
                  type="month"
                  value={formData.month_year.slice(0, 7)}
                  onChange={(e) => setFormData({...formData, month_year: e.target.value + '-01'})}
                  className="input-field"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Set Budget
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BudgetManager;