const { pool } = require('../config/database');

class Expense {
    // Create new expense
    static async create({ 
        user_id, 
        title, 
        category, 
        amount, 
        expense_date, 
        description, 
        payment_method, 
        receipt_image,
        is_recurring,
        recurring_frequency 
    }) {
        const [result] = await pool.execute(
            `INSERT INTO expenses 
            (user_id, title, category, amount, expense_date, description, 
            payment_method, receipt_image, is_recurring, recurring_frequency) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, title, category, amount, expense_date, description, 
            payment_method, receipt_image, is_recurring, recurring_frequency]
        );
        return result.insertId;
    }

    // Get all expenses for a user with filters
    static async findAll(userId, filters = {}) {
        let query = `SELECT * FROM expenses WHERE user_id = ?`;
        const params = [userId];
        
        if (filters.startDate) {
            query += ` AND expense_date >= ?`;
            params.push(filters.startDate);
        }
        
        if (filters.endDate) {
            query += ` AND expense_date <= ?`;
            params.push(filters.endDate);
        }
        
        if (filters.category) {
            query += ` AND category = ?`;
            params.push(filters.category);
        }
        
        query += ` ORDER BY expense_date DESC`;
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    // Get expense by ID
    static async findById(id, userId) {
        const [rows] = await pool.execute(
            'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return rows[0];
    }

    // Update expense
    static async update(id, userId, expenseData) {
        const fields = [];
        const values = [];
        
        Object.keys(expenseData).forEach(key => {
            if (expenseData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(expenseData[key]);
            }
        });
        
        if (fields.length === 0) return false;
        
        values.push(id, userId);
        const query = `UPDATE expenses SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
        
        const [result] = await pool.execute(query, values);
        return result.affectedRows > 0;
    }

    // Delete expense
    static async delete(id, userId) {
        const [result] = await pool.execute(
            'DELETE FROM expenses WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result.affectedRows > 0;
    }

    // Get expense statistics
    static async getStats(userId, startDate = null, endDate = null) {
        let query = `
            SELECT 
                COUNT(*) as total_expenses,
                SUM(amount) as total_amount,
                AVG(amount) as average_expense,
                MIN(amount) as min_expense,
                MAX(amount) as max_expense,
                DATE(expense_date) as date,
                category,
                COUNT(*) as category_count,
                SUM(amount) as category_total
            FROM expenses 
            WHERE user_id = ?
        `;
        
        const params = [userId];
        
        if (startDate) {
            query += ` AND expense_date >= ?`;
            params.push(startDate);
        }
        
        if (endDate) {
            query += ` AND expense_date <= ?`;
            params.push(endDate);
        }
        
        query += ` GROUP BY category, DATE(expense_date)`;
        
        const [rows] = await pool.execute(query, params);
        
        // Process statistics
        const stats = {
            totalExpenses: 0,
            totalAmount: 0,
            averageExpense: 0,
            minExpense: 0,
            maxExpense: 0,
            categoryBreakdown: {},
            dailyBreakdown: {}
        };
        
        rows.forEach(row => {
            stats.totalExpenses += row.category_count;
            stats.totalAmount += parseFloat(row.category_total);
            
            if (!stats.categoryBreakdown[row.category]) {
                stats.categoryBreakdown[row.category] = 0;
            }
            stats.categoryBreakdown[row.category] += parseFloat(row.category_total);
            
            if (!stats.dailyBreakdown[row.date]) {
                stats.dailyBreakdown[row.date] = 0;
            }
            stats.dailyBreakdown[row.date] += parseFloat(row.category_total);
        });
        
        if (stats.totalExpenses > 0) {
            stats.averageExpense = stats.totalAmount / stats.totalExpenses;
            stats.minExpense = Math.min(...rows.map(r => parseFloat(r.amount)));
            stats.maxExpense = Math.max(...rows.map(r => parseFloat(r.amount)));
        }
        
        return stats;
    }

    // Get recent expenses
    static async getRecent(userId, limit = 10) {
        const [rows] = await pool.execute(
            `SELECT * FROM expenses 
            WHERE user_id = ? 
            ORDER BY expense_date DESC, created_at DESC 
            LIMIT ?`,
            [userId, limit]
        );
        return rows;
    }

    // Get expenses by category
    static async getByCategory(userId) {
        const [rows] = await pool.execute(
            `SELECT category, COUNT(*) as count, SUM(amount) as total 
            FROM expenses 
            WHERE user_id = ? 
            GROUP BY category 
            ORDER BY total DESC`,
            [userId]
        );
        return rows;
    }

    // Get dashboard statistics
    static async getDashboardStats(userId, month = null, year = null) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        
        const monthParam = month || currentMonth;
        const yearParam = year || currentYear;

        // Total expenses this month
        const [totalResult] = await pool.execute(
            `SELECT COUNT(*) as count, SUM(amount) as total 
            FROM expenses 
            WHERE user_id = ? 
            AND MONTH(expense_date) = ? 
            AND YEAR(expense_date) = ?`,
            [userId, monthParam, yearParam]
        );

        // Total categories used
        const [categoryResult] = await pool.execute(
            `SELECT COUNT(DISTINCT category) as count 
            FROM expenses 
            WHERE user_id = ? 
            AND MONTH(expense_date) = ? 
            AND YEAR(expense_date) = ?`,
            [userId, monthParam, yearParam]
        );

        // Highest spending category
        const [highestCategoryResult] = await pool.execute(
            `SELECT category, SUM(amount) as total 
            FROM expenses 
            WHERE user_id = ? 
            AND MONTH(expense_date) = ? 
            AND YEAR(expense_date) = ? 
            GROUP BY category 
            ORDER BY total DESC 
            LIMIT 1`,
            [userId, monthParam, yearParam]
        );

        // Average daily spending this month
        const [dailyAvgResult] = await pool.execute(
            `SELECT AVG(daily_total) as avg_daily 
            FROM (
                SELECT expense_date, SUM(amount) as daily_total 
                FROM expenses 
                WHERE user_id = ? 
                AND MONTH(expense_date) = ? 
                AND YEAR(expense_date) = ? 
                GROUP BY expense_date
            ) as daily_totals`,
            [userId, monthParam, yearParam]
        );

        // Monthly spending trend (last 6 months)
        const [monthlyTrendResult] = await pool.execute(
            `SELECT 
                DATE_FORMAT(expense_date, '%Y-%m') as month,
                SUM(amount) as total 
            FROM expenses 
            WHERE user_id = ? 
            AND expense_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
            ORDER BY month`,
            [userId]
        );

        // Weekly trend (last 4 weeks)
        const [weeklyTrendResult] = await pool.execute(
            `SELECT 
                YEARWEEK(expense_date) as week,
                DATE_FORMAT(MIN(expense_date), '%b %d') as week_start,
                DATE_FORMAT(MAX(expense_date), '%b %d') as week_end,
                SUM(amount) as total 
            FROM expenses 
            WHERE user_id = ? 
            AND expense_date >= DATE_SUB(NOW(), INTERVAL 28 DAY)
            GROUP BY YEARWEEK(expense_date)
            ORDER BY week DESC
            LIMIT 4`,
            [userId]
        );

        return {
            totalExpenses: parseInt(totalResult[0]?.count || 0),
            totalAmount: parseFloat(totalResult[0]?.total || 0),
            totalCategories: parseInt(categoryResult[0]?.count || 0),
            highestCategory: highestCategoryResult[0] || null,
            averageDailySpending: parseFloat(dailyAvgResult[0]?.avg_daily || 0),
            monthlyTrend: monthlyTrendResult,
            weeklyTrend: weeklyTrendResult
        };
    }

    // Get category distribution for pie chart
    static async getCategoryDistribution(userId, month = null, year = null) {
        const currentDate = new Date();
        const monthParam = month || currentDate.getMonth() + 1;
        const yearParam = year || currentDate.getFullYear();

        const [rows] = await pool.execute(
            `SELECT 
                category,
                COUNT(*) as count,
                SUM(amount) as total,
                ROUND((SUM(amount) / (SELECT SUM(amount) FROM expenses WHERE user_id = ? AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?)) * 100, 2) as percentage
            FROM expenses 
            WHERE user_id = ? 
            AND MONTH(expense_date) = ? 
            AND YEAR(expense_date) = ?
            GROUP BY category 
            ORDER BY total DESC`,
            [userId, monthParam, yearParam, userId, monthParam, yearParam]
        );

        return rows;
    }
}

module.exports = Expense;