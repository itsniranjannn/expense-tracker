const Expense = require('../models/Expense');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database').pool; // ADD THIS LINE for direct database queries

// Get all expenses for a user
const getAllExpenses = async (req, res) => {
  try {
    const userId = req.user.id; // CHANGED from userId to id (based on your auth middleware)
    const { 
      startDate, 
      endDate, 
      category, 
      minAmount, 
      maxAmount,
      sortBy = 'expense_date',
      sortOrder = 'desc',
      limit
    } = req.query;

    const filters = {};
    
    // Apply filters
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (category && category !== 'all') filters.category = category;
    if (minAmount) filters.minAmount = parseFloat(minAmount);
    if (maxAmount) filters.maxAmount = parseFloat(maxAmount);
    if (sortBy) filters.sortBy = sortBy;
    if (sortOrder) filters.sortOrder = sortOrder.toUpperCase();
    if (limit) filters.limit = parseInt(limit);

    const expenses = await Expense.findAllByUser(userId, filters);

    // Calculate summary
    const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const categorySummary = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
      return acc;
    }, {});

    res.json({
      success: true,
      count: expenses.length,
      totalAmount,
      categorySummary,
      expenses: expenses.map(exp => ({
        id: exp.id,
        title: exp.title,
        category: exp.category,
        amount: parseFloat(exp.amount),
        expense_date: exp.expense_date,
        description: exp.description,
        payment_method: exp.payment_method,
        receipt_image: exp.receipt_image,
        is_recurring: Boolean(exp.is_recurring),
        recurring_frequency: exp.recurring_frequency,
        created_at: exp.created_at
      }))
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses'
    });
  }
};

// NEW: Get dashboard statistics (your version)
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('📊 Getting dashboard stats for user:', userId);

        // Get total expenses and amount
        const [stats] = await pool.execute(
            `SELECT 
                COUNT(*) as totalExpenses,
                COALESCE(SUM(amount), 0) as totalSpent,
                COALESCE(AVG(amount), 0) as averageExpense,
                COALESCE(MIN(amount), 0) as minExpense,
                COALESCE(MAX(amount), 0) as maxExpense
            FROM expenses 
            WHERE user_id = ?`,
            [userId]
        );

        // Get this month's expenses
        const [monthStats] = await pool.execute(
            `SELECT 
                COALESCE(SUM(amount), 0) as thisMonthSpent,
                COUNT(*) as thisMonthCount
            FROM expenses 
            WHERE user_id = ? 
            AND MONTH(expense_date) = MONTH(CURRENT_DATE())
            AND YEAR(expense_date) = YEAR(CURRENT_DATE())`,
            [userId]
        );

        // Get today's expenses
        const [todayStats] = await pool.execute(
            `SELECT 
                COALESCE(SUM(amount), 0) as todaySpent,
                COUNT(*) as todayCount
            FROM expenses 
            WHERE user_id = ? 
            AND DATE(expense_date) = CURRENT_DATE()`,
            [userId]
        );

        // Get most expensive category
        const [categoryStats] = await pool.execute(
            `SELECT 
                category,
                COALESCE(SUM(amount), 0) as total
            FROM expenses 
            WHERE user_id = ?
            GROUP BY category
            ORDER BY total DESC
            LIMIT 1`,
            [userId]
        );

        res.json({
            success: true,
            stats: {
                ...stats[0],
                ...monthStats[0],
                ...todayStats[0],
                topCategory: categoryStats[0]?.category || 'No expenses',
                topCategoryAmount: categoryStats[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('❌ Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        });
    }
};

// NEW: Get paginated expenses with filters
const getAllExpensesPaginated = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, category, startDate, endDate } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM expenses WHERE user_id = ?';
        const params = [userId];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (startDate) {
            query += ' AND expense_date >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND expense_date <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY expense_date DESC, created_at DESC';

        // Get total count
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await pool.execute(countQuery, params);
        const total = countResult[0].total;

        // Get paginated data
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [expenses] = await pool.execute(query, params);

        res.json({
            success: true,
            expenses,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('❌ Get expenses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expenses'
        });
    }
};

// NEW: Get category breakdown
const getCategoryBreakdown = async (req, res) => {
    try {
        const userId = req.user.id;

        const [categories] = await pool.execute(
            `SELECT 
                category,
                COUNT(*) as count,
                COALESCE(SUM(amount), 0) as total,
                COALESCE(AVG(amount), 0) as average
            FROM expenses 
            WHERE user_id = ?
            GROUP BY category
            ORDER BY total DESC`,
            [userId]
        );

        // Calculate total for percentages
        const totalAmount = categories.reduce((sum, cat) => sum + parseFloat(cat.total), 0);

        const categoryData = categories.map(cat => ({
            ...cat,
            percentage: totalAmount > 0 ? (parseFloat(cat.total) / totalAmount * 100).toFixed(1) : 0
        }));

        res.json({
            success: true,
            categories: categoryData,
            totalAmount,
            categoryCount: categories.length
        });
    } catch (error) {
        console.error('❌ Get category breakdown error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category breakdown'
        });
    }
};

// Get recent expenses
const getRecentExpenses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;

    const expenses = await Expense.getRecent(userId, limit);

    res.json({
      success: true,
      expenses: expenses.map(exp => ({
        id: exp.id,
        title: exp.title,
        category: exp.category,
        amount: parseFloat(exp.amount),
        expense_date: exp.expense_date,
        description: exp.description,
        payment_method: exp.payment_method,
        created_at: exp.created_at
      }))
    });
  } catch (error) {
    console.error('Get recent expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent expenses'
    });
  }
};

// Get single expense
const getExpenseById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const expenseId = req.params.id;

    const expense = await Expense.findByIdAndUser(expenseId, userId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      expense: {
        id: expense.id,
        title: expense.title,
        category: expense.category,
        amount: parseFloat(expense.amount),
        expense_date: expense.expense_date,
        description: expense.description,
        payment_method: expense.payment_method,
        receipt_image: expense.receipt_image,
        is_recurring: Boolean(expense.is_recurring),
        recurring_frequency: expense.recurring_frequency,
        created_at: expense.created_at
      }
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense'
    });
  }
};

// Create expense
const createExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Handle both JSON and FormData
    let {
      title,
      category,
      amount,
      expense_date,
      description,
      payment_method,
      is_recurring,
      recurring_frequency
    } = req.body;

    // Parse amount
    amount = parseFloat(amount);
    
    // Handle file upload
    let receipt_image = null;
    if (req.file) {
      receipt_image = `/uploads/receipts/${req.file.filename}`;
    }

    // Parse boolean values
    const isRecurring = is_recurring === 'true' || is_recurring === true;

    // Create expense
    const expenseId = await Expense.create({
      user_id: userId,
      title,
      category,
      amount,
      expense_date,
      description: description || '',
      payment_method: payment_method || 'Cash',
      is_recurring: isRecurring,
      recurring_frequency: isRecurring ? (recurring_frequency || 'Monthly') : null,
      receipt_image
    });

    // Get the created expense
    const expense = await Expense.findByIdAndUser(expenseId, userId);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      expense: {
        id: expense.id,
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        expense_date: expense.expense_date,
        description: expense.description,
        payment_method: expense.payment_method,
        is_recurring: Boolean(expense.is_recurring),
        recurring_frequency: expense.recurring_frequency,
        receipt_image: expense.receipt_image,
        created_at: expense.created_at
      }
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating expense'
    });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const expenseId = req.params.id;
    const updateData = req.body;

    // Parse amount if present
    if (updateData.amount) {
      updateData.amount = parseFloat(updateData.amount);
    }

    // Parse boolean values
    if (updateData.is_recurring !== undefined) {
      updateData.is_recurring = updateData.is_recurring === 'true' || updateData.is_recurring === true;
    }

    // Update expense
    const updated = await Expense.update(expenseId, userId, updateData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Get the updated expense
    const expense = await Expense.findByIdAndUser(expenseId, userId);

    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense: {
        id: expense.id,
        title: expense.title,
        category: expense.category,
        amount: parseFloat(expense.amount),
        expense_date: expense.expense_date,
        description: expense.description,
        payment_method: expense.payment_method
      }
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense'
    });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const expenseId = req.params.id;

    // Get expense first to check for receipt
    const expense = await Expense.findByIdAndUser(expenseId, userId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Delete receipt image if exists
    if (expense.receipt_image) {
      const receiptPath = path.join(__dirname, '..', expense.receipt_image);
      if (fs.existsSync(receiptPath)) {
        fs.unlinkSync(receiptPath);
      }
    }

    // Delete expense from database
    const deleted = await Expense.delete(expenseId, userId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete expense'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense'
    });
  }
};

// Get expense statistics
const getStatistics = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all expenses
    const expenses = await Expense.findAllByUser(userId);
    
    // Get current month expenses
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentMonthExpenses = await Expense.getByMonth(userId, currentYear, currentMonth);

    // Calculate statistics
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const monthlyExpenses = currentMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(exp => parseFloat(exp.amount))) : 0;

    // Get category distribution
    const categoryDistribution = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + 1;
      return acc;
    }, {});

    // Get monthly trend (last 6 months)
    const monthlyStats = await Expense.getStatistics(userId);
    
    // Format monthly trend
    const monthlyTrend = monthlyStats.reduce((acc, stat) => {
      acc.push({
        month: stat.month,
        total: parseFloat(stat.total || 0),
        count: parseInt(stat.count || 0)
      });
      return acc;
    }, []).slice(0, 6).reverse(); // Last 6 months, oldest first

    res.json({
      success: true,
      statistics: {
        totalExpenses,
        monthlyExpenses,
        averageExpense,
        highestExpense,
        totalCount: expenses.length,
        categoryDistribution,
        monthlyTrend
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};

// Get old category breakdown (keep for compatibility)
const getCategoryBreakdownOld = async (req, res) => {
  try {
    const userId = req.user.userId;

    const breakdown = await Expense.getCategoryBreakdown(userId);

    res.json({
      success: true,
      breakdown: breakdown.map(item => ({
        category: item.category,
        total: parseFloat(item.total || 0),
        count: parseInt(item.count || 0),
        average: parseFloat(item.average || 0)
      }))
    });
  } catch (error) {
    console.error('Get category breakdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category breakdown'
    });
  }
};

// Get old dashboard statistics (keep for compatibility)
const getDashboardStatsOld = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const stats = await Expense.getDashboardStats(userId);

    // Calculate percentage change
    const percentageChange = stats.lastMonthTotal > 0 
      ? ((stats.currentMonthTotal - stats.lastMonthTotal) / stats.lastMonthTotal * 100)
      : 0;

    // Format top categories
    const topCategories = stats.topCategories.map(cat => ({
      category: cat.category,
      total: parseFloat(cat.total || 0)
    }));

    // Format recent expenses
    const recentExpenses = stats.recentExpenses.map(exp => ({
      id: exp.id,
      title: exp.title,
      category: exp.category,
      amount: parseFloat(exp.amount),
      expense_date: exp.expense_date,
      payment_method: exp.payment_method
    }));

    // Get total count of all expenses
    const allExpenses = await Expense.findAllByUser(userId);
    
    // Get category breakdown for total categories count
    const categoryBreakdown = await Expense.getCategoryBreakdown(userId);

    res.json({
      success: true,
      totalCurrentMonth: parseFloat(stats.currentMonthTotal || 0),
      totalLastMonth: parseFloat(stats.lastMonthTotal || 0),
      percentageChange: parseFloat(percentageChange.toFixed(2)),
      topCategories,
      recentExpenses,
      expenseCount: allExpenses.length,
      totalCategories: categoryBreakdown.length,
      highestExpense: Math.max(...allExpenses.map(e => parseFloat(e.amount))),
      averageExpense: allExpenses.length > 0 
        ? allExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0) / allExpenses.length 
        : 0
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

module.exports = {
  getAllExpenses,
  getRecentExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getStatistics,
  getCategoryBreakdownOld,
  getDashboardStatsOld,   
    getDashboardStats,    
  getAllExpensesPaginated,
  getCategoryBreakdown    
};