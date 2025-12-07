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
}

module.exports = Expense;