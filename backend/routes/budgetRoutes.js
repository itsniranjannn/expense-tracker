const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { pool } = require('../config/database');

// Get all budgets for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [budgets] = await pool.execute(
      `SELECT * FROM budgets WHERE user_id = ? ORDER BY month_year DESC, created_at DESC`,
      [userId]
    );
    
    res.json({
      success: true,
      budgets
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budgets'
    });
  }
});

// Create new budget
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, amount, month_year, color, icon } = req.body;
    
    // Validate required fields
    if (!category || !amount || !month_year) {
      return res.status(400).json({
        success: false,
        message: 'Category, amount, and month are required'
      });
    }
    
    // Check if budget already exists for this category and month
    const [existing] = await pool.execute(
      `SELECT * FROM budgets 
       WHERE user_id = ? AND category = ? AND month_year = ?`,
      [userId, category, month_year]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category and month'
      });
    }
    
    // Insert new budget
    const [result] = await pool.execute(
      `INSERT INTO budgets (user_id, category, amount, month_year, color, icon) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, category, amount, month_year, color || '#3B82F6', icon || '💰']
    );
    
    // Get the created budget
    const [budget] = await pool.execute(
      `SELECT * FROM budgets WHERE id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      budget: budget[0]
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create budget'
    });
  }
});

// Update budget
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;
    const { category, amount, month_year, color, icon } = req.body;
    
    // Validate required fields
    if (!category || !amount || !month_year) {
      return res.status(400).json({
        success: false,
        message: 'Category, amount, and month are required'
      });
    }
    
    // Check if budget exists and belongs to user
    const [existing] = await pool.execute(
      `SELECT * FROM budgets WHERE id = ? AND user_id = ?`,
      [budgetId, userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    // Update budget
    await pool.execute(
      `UPDATE budgets 
       SET category = ?, amount = ?, month_year = ?, color = ?, icon = ? 
       WHERE id = ? AND user_id = ?`,
      [category, amount, month_year, color || '#3B82F6', icon || '💰', budgetId, userId]
    );
    
    // Get updated budget
    const [budget] = await pool.execute(
      `SELECT * FROM budgets WHERE id = ?`,
      [budgetId]
    );
    
    res.json({
      success: true,
      message: 'Budget updated successfully',
      budget: budget[0]
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update budget'
    });
  }
});

// Delete budget
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;
    
    // Check if budget exists and belongs to user
    const [existing] = await pool.execute(
      `SELECT * FROM budgets WHERE id = ? AND user_id = ?`,
      [budgetId, userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    // Delete budget
    await pool.execute(
      `DELETE FROM budgets WHERE id = ? AND user_id = ?`,
      [budgetId, userId]
    );
    
    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete budget'
    });
  }
});

// Get budget statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [budgetStats] = await pool.execute(
      `SELECT 
        COUNT(*) as totalBudgets,
        COALESCE(SUM(amount), 0) as totalBudgeted,
        COALESCE(AVG(amount), 0) as averageBudget
      FROM budgets 
      WHERE user_id = ?`,
      [userId]
    );
    
    res.json({
      success: true,
      stats: budgetStats[0]
    });
  } catch (error) {
    console.error('Get budget stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget statistics'
    });
  }
});

module.exports = router;