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
    payment_method = 'Cash',
    is_recurring = false,
    recurring_frequency = null,
    receipt_image = null
  }) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO expenses 
         (user_id, title, category, amount, expense_date, description, 
          payment_method, is_recurring, recurring_frequency, receipt_image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id, title, category, amount, expense_date, description,
          payment_method, is_recurring, recurring_frequency, receipt_image
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  // Find all expenses for user
  static async findAllByUser(userId, filters = {}) {
    try {
      let query = `
        SELECT * FROM expenses 
        WHERE user_id = ?
      `;
      const params = [userId];
      
      // Add filters
      if (filters.startDate) {
        query += ` AND expense_date >= ?`;
        params.push(filters.startDate);
      }
      
      if (filters.endDate) {
        query += ` AND expense_date <= ?`;
        params.push(filters.endDate);
      }
      
      if (filters.category && filters.category !== 'all') {
        query += ` AND category = ?`;
        params.push(filters.category);
      }
      
      if (filters.minAmount) {
        query += ` AND amount >= ?`;
        params.push(filters.minAmount);
      }
      
      if (filters.maxAmount) {
        query += ` AND amount <= ?`;
        params.push(filters.maxAmount);
      }
      
      // Add sorting
      const sortBy = filters.sortBy || 'expense_date';
      const sortOrder = filters.sortOrder || 'DESC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
      
      // Add limit
      if (filters.limit) {
        query += ` LIMIT ?`;
        params.push(parseInt(filters.limit));
      }
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error finding expenses:', error);
      throw error;
    }
  }

  // Find expense by ID and user
  static async findByIdAndUser(id, userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding expense:', error);
      throw error;
    }
  }

  // Update expense
  static async update(id, userId, updateData) {
    try {
      const fields = [];
      const values = [];
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });
      
      if (fields.length === 0) {
        return false;
      }
      
      values.push(id, userId);
      
      const [result] = await pool.execute(
        `UPDATE expenses SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  // Delete expense
  static async delete(id, userId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM expenses WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // Get expense statistics
  static async getStatistics(userId) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          COUNT(*) as count,
          SUM(amount) as total,
          AVG(amount) as average,
          MAX(amount) as highest,
          MIN(amount) as lowest,
          DATE_FORMAT(expense_date, '%Y-%m') as month,
          category
        FROM expenses 
        WHERE user_id = ?
        GROUP BY category, DATE_FORMAT(expense_date, '%Y-%m')
        ORDER BY month DESC
      `, [userId]);
      
      return rows;
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }

  // Get category breakdown
  static async getCategoryBreakdown(userId) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          category,
          COUNT(*) as count,
          SUM(amount) as total,
          AVG(amount) as average
        FROM expenses 
        WHERE user_id = ?
        GROUP BY category
        ORDER BY total DESC
      `, [userId]);
      
      return rows;
    } catch (error) {
      console.error('Error getting category breakdown:', error);
      throw error;
    }
  }

  // Get recent expenses
  static async getRecent(userId, limit = 10) {
    try {
      const [rows] = await pool.execute(`
        SELECT * FROM expenses 
        WHERE user_id = ?
        ORDER BY expense_date DESC, created_at DESC
        LIMIT ?
      `, [userId, limit]);
      
      return rows;
    } catch (error) {
      console.error('Error getting recent expenses:', error);
      throw error;
    }
  }

  // Get expenses by month
  static async getByMonth(userId, year, month) {
    try {
      const [rows] = await pool.execute(`
        SELECT * FROM expenses 
        WHERE user_id = ? 
          AND YEAR(expense_date) = ? 
          AND MONTH(expense_date) = ?
        ORDER BY expense_date DESC
      `, [userId, year, month]);
      
      return rows;
    } catch (error) {
      console.error('Error getting monthly expenses:', error);
      throw error;
    }
  }

  // Get dashboard statistics
  static async getDashboardStats(userId) {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      
      // Get current month total
      const [currentMonthRows] = await pool.execute(`
        SELECT SUM(amount) as total FROM expenses 
        WHERE user_id = ? 
          AND YEAR(expense_date) = ? 
          AND MONTH(expense_date) = ?
      `, [userId, currentYear, currentMonth]);
      
      // Get last month total
      const [lastMonthRows] = await pool.execute(`
        SELECT SUM(amount) as total FROM expenses 
        WHERE user_id = ? 
          AND YEAR(expense_date) = ? 
          AND MONTH(expense_date) = ?
      `, [userId, lastMonthYear, lastMonth]);
      
      // Get top categories for current month
      const [categoryRows] = await pool.execute(`
        SELECT category, SUM(amount) as total
        FROM expenses 
        WHERE user_id = ? 
          AND YEAR(expense_date) = ? 
          AND MONTH(expense_date) = ?
        GROUP BY category
        ORDER BY total DESC
        LIMIT 5
      `, [userId, currentYear, currentMonth]);
      
      // Get recent expenses
      const [recentExpensesRows] = await pool.execute(`
        SELECT * FROM expenses 
        WHERE user_id = ?
        ORDER BY expense_date DESC, created_at DESC
        LIMIT 5
      `, [userId]);
      
      return {
        currentMonthTotal: currentMonthRows[0]?.total || 0,
        lastMonthTotal: lastMonthRows[0]?.total || 0,
        topCategories: categoryRows,
        recentExpenses: recentExpensesRows
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }
}

module.exports = Expense;