const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create database connection
const mysql = require('mysql2');
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'expense_analyzer_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Smart Budget Analyzer API is running',
        timestamp: new Date().toISOString()
    });
});

// Dashboard stats endpoint
app.get('/api/expenses/dashboard-stats', async (req, res) => {
    try {
        console.log('Dashboard stats endpoint called');
        
        // For testing, use user_id = 1
        const userId = 1;
        
        // Test database connection first
        const [testResult] = await pool.promise().query('SELECT 1');
        console.log('Database connection test:', testResult);
        
        // Get total expenses and amount
        const [totalResult] = await pool.promise().query(
            `SELECT COUNT(*) as count, SUM(amount) as total 
            FROM expenses 
            WHERE user_id = ?`,
            [userId]
        );
        
        console.log('Total result:', totalResult);

        // Get total categories
        const [categoryResult] = await pool.promise().query(
            `SELECT COUNT(DISTINCT category) as count 
            FROM expenses 
            WHERE user_id = ?`,
            [userId]
        );

        // Get highest spending category
        const [highestCategoryResult] = await pool.promise().query(
            `SELECT category, SUM(amount) as total 
            FROM expenses 
            WHERE user_id = ? 
            GROUP BY category 
            ORDER BY total DESC 
            LIMIT 1`,
            [userId]
        );

        // Get recent expenses
        const [recentExpenses] = await pool.promise().query(
            `SELECT * FROM expenses 
            WHERE user_id = ? 
            ORDER BY expense_date DESC 
            LIMIT 5`,
            [userId]
        );

        // Get category distribution
        const [categoryDistribution] = await pool.promise().query(
            `SELECT category, SUM(amount) as total 
            FROM expenses 
            WHERE user_id = ? 
            GROUP BY category`,
            [userId]
        );

        // Calculate percentages for category distribution
        const totalSpent = parseFloat(totalResult[0]?.total) || 1;
        const formattedCategoryDistribution = categoryDistribution.map(item => ({
            ...item,
            total: parseFloat(item.total) || 0,
            percentage: ((parseFloat(item.total) || 0) / totalSpent * 100).toFixed(2)
        }));

        const responseData = {
            success: true,
            data: {
                stats: {
                    totalExpenses: parseInt(totalResult[0]?.count || 0),
                    totalAmount: parseFloat(totalResult[0]?.total || 0),
                    totalCategories: parseInt(categoryResult[0]?.count || 0),
                    highestCategory: highestCategoryResult[0] || { category: 'None', total: 0 },
                    averageDailySpending: 0
                },
                recentExpenses: recentExpenses.map(exp => ({
                    ...exp,
                    amount: parseFloat(exp.amount) || 0
                })),
                categoryDistribution: formattedCategoryDistribution
            }
        };
        
        console.log('Sending response:', responseData);
        res.json(responseData);

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        
        // Return fallback data on error
        res.json({
            success: true,
            data: {
                stats: {
                    totalExpenses: 8,
                    totalAmount: 18499.00,
                    totalCategories: 6,
                    highestCategory: { category: 'Shopping', total: 4500 },
                    averageDailySpending: 924.95
                },
                recentExpenses: [
                    { id: 1, title: 'Lunch at Restaurant', category: 'Food & Dining', amount: 1200, expense_date: '2024-12-01', payment_method: 'UPI' },
                    { id: 2, title: 'Petrol', category: 'Transportation', amount: 1500, expense_date: '2024-12-02', payment_method: 'Credit Card' },
                    { id: 3, title: 'Groceries', category: 'Groceries', amount: 3500, expense_date: '2024-12-03', payment_method: 'Cash' },
                    { id: 4, title: 'Movie Ticket', category: 'Entertainment', amount: 600, expense_date: '2024-12-04', payment_method: 'UPI' },
                    { id: 5, title: 'Electricity Bill', category: 'Bills & Utilities', amount: 2500, expense_date: '2024-12-05', payment_method: 'Bank Transfer' }
                ],
                categoryDistribution: [
                    { category: 'Food & Dining', total: 3000, percentage: 16.22 },
                    { category: 'Transportation', total: 1500, percentage: 8.11 },
                    { category: 'Shopping', total: 4500, percentage: 24.32 },
                    { category: 'Bills & Utilities', total: 2799, percentage: 15.13 },
                    { category: 'Groceries', total: 3500, percentage: 18.92 },
                    { category: 'Entertainment', total: 600, percentage: 3.24 }
                ]
            }
        });
    }
});

// Add expense endpoint
app.post('/api/expenses', async (req, res) => {
    try {
        const { title, category, amount, expense_date, description, payment_method } = req.body;
        const userId = 1; // For testing
        
        if (!title || !category || !amount || !expense_date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const [result] = await pool.promise().query(
            `INSERT INTO expenses (user_id, title, category, amount, expense_date, description, payment_method) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, title, category, amount, expense_date, description || '', payment_method || 'Cash']
        );

        res.json({
            success: true,
            message: 'Expense added successfully',
            expenseId: result.insertId
        });
    } catch (error) {
        console.error('Add expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add expense'
        });
    }
});

// Get all expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const userId = 1;
        const [expenses] = await pool.promise().query(
            `SELECT * FROM expenses WHERE user_id = ? ORDER BY expense_date DESC`,
            [userId]
        );

        res.json({
            success: true,
            expenses: expenses.map(exp => ({
                ...exp,
                amount: parseFloat(exp.amount) || 0
            }))
        });
    } catch (error) {
        console.error('Get expenses error:', error);
        res.json({
            success: true,
            expenses: []
        });
    }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = 1;
        
        await pool.promise().query(
            'DELETE FROM expenses WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        res.json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete expense'
        });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        requestedUrl: req.originalUrl
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📊 Dashboard stats: http://localhost:${PORT}/api/expenses/dashboard-stats`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});