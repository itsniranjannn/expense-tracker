const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/receipts';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    }
}).single('receipt_image');

// Create new expense
const createExpense = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            title,
            category,
            amount,
            expense_date,
            description,
            payment_method,
            is_recurring,
            recurring_frequency
        } = req.body;

        // Validation
        if (!title || !category || !amount || !expense_date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const expenseId = await Expense.create({
            user_id: userId,
            title,
            category,
            amount: parseFloat(amount),
            expense_date,
            description,
            payment_method: payment_method || 'Cash',
            receipt_image: req.file ? `/uploads/receipts/${req.file.filename}` : null,
            is_recurring: is_recurring === 'true' || is_recurring === true,
            recurring_frequency: is_recurring ? (recurring_frequency || 'Monthly') : null
        });

        // Emit real-time update
        if (req.io) {
            req.io.to(`user_${userId}`).emit('expenseAdded', {
                id: expenseId,
                title,
                amount,
                category,
                date: expense_date
            });
        }

        res.status(201).json({
            success: true,
            message: 'Expense added successfully',
            expenseId
        });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get all expenses
const getExpenses = async (req, res) => {
    try {
        const userId = req.user.userId;
        const filters = req.query;
        
        const expenses = await Expense.findAll(userId, {
            startDate: filters.startDate,
            endDate: filters.endDate,
            category: filters.category
        });

        res.json({
            success: true,
            count: expenses.length,
            expenses
        });
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get single expense
const getExpense = async (req, res) => {
    try {
        const userId = req.user.userId;
        const expenseId = req.params.id;

        const expense = await Expense.findById(expenseId, userId);
        
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.json({
            success: true,
            expense
        });
    } catch (error) {
        console.error('Get expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update expense
const updateExpense = async (req, res) => {
    try {
        const userId = req.user.userId;
        const expenseId = req.params.id;
        const updateData = req.body;

        if (req.file) {
            updateData.receipt_image = `/uploads/receipts/${req.file.filename}`;
        }

        const updated = await Expense.update(expenseId, userId, updateData);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found or update failed'
            });
        }

        res.json({
            success: true,
            message: 'Expense updated successfully'
        });
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete expense
const deleteExpense = async (req, res) => {
    try {
        const userId = req.user.userId;
        const expenseId = req.params.id;

        const deleted = await Expense.delete(expenseId, userId);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Emit real-time update
        if (req.io) {
            req.io.to(`user_${userId}`).emit('expenseDeleted', { expenseId });
        }

        res.json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get expense statistics
const getStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { startDate, endDate } = req.query;

        const stats = await Expense.getStats(userId, startDate, endDate);
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
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
            expenses
        });
    } catch (error) {
        console.error('Get recent expenses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get expenses by category
const getCategoryBreakdown = async (req, res) => {
  try {
    const userId = req.user.userId;

    const breakdown = await Expense.getByCategory(userId);
    
    // Format the data properly
    const formattedBreakdown = breakdown.map(item => ({
      category: item.category || 'Other',
      amount: parseFloat(item.total) || 0,
      count: parseInt(item.count) || 0
    }));
    
    res.json({
      success: true,
      breakdown: formattedBreakdown
    });
  } catch (error) {
    console.error('Get category breakdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      breakdown: [] // Always return an array
    });
  }
};

// Upload receipt
const uploadReceipt = async (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        res.json({
            success: true,
            message: 'Receipt uploaded successfully',
            filePath: `/uploads/receipts/${req.file.filename}`
        });
    });
};

// Get budget vs actual
const getBudgetVsActual = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { month } = req.query;
        
        const month_year = month || new Date().toISOString().slice(0, 7) + '-01';
        const comparison = await Budget.getBudgetVsActual(userId, month_year);
        
        res.json({
            success: true,
            month_year,
            comparison
        });
    } catch (error) {
        console.error('Get budget vs actual error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    createExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
    getStats,
    getRecentExpenses,
    getCategoryBreakdown,
    uploadReceipt,
    getBudgetVsActual
};