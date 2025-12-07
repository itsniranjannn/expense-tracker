const { pool } = require('../config/database');

class Budget {
    // Create or update budget
    static async upsert({ user_id, category, amount, month_year, color, icon }) {
        const [result] = await pool.execute(
            `INSERT INTO budgets (user_id, category, amount, month_year, color, icon) 
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            amount = VALUES(amount), 
            color = VALUES(color), 
            icon = VALUES(icon)`,
            [user_id, category, amount, month_year, color, icon]
        );
        return result.insertId || result.affectedRows;
    }

    // Get budgets for user
    static async findByUser(userId, month_year = null) {
        let query = `SELECT * FROM budgets WHERE user_id = ?`;
        const params = [userId];
        
        if (month_year) {
            query += ` AND month_year = ?`;
            params.push(month_year);
        }
        
        query += ` ORDER BY category`;
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    // Delete budget
    static async delete(id, userId) {
        const [result] = await pool.execute(
            'DELETE FROM budgets WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result.affectedRows > 0;
    }

    // Get budget vs actual comparison
    static async getBudgetVsActual(userId, month_year) {
        const [budgets] = await pool.execute(
            `SELECT b.*, 
            COALESCE(SUM(e.amount), 0) as actual_spent,
            (b.amount - COALESCE(SUM(e.amount), 0)) as remaining
            FROM budgets b
            LEFT JOIN expenses e ON b.user_id = e.user_id 
                AND b.category = e.category 
                AND DATE_FORMAT(e.expense_date, '%Y-%m-01') = b.month_year
            WHERE b.user_id = ? AND b.month_year = ?
            GROUP BY b.id, b.category, b.amount`,
            [userId, month_year]
        );
        return budgets;
    }
}

module.exports = Budget;