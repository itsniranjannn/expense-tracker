const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes are protected
router.use(authMiddleware);

// Expense CRUD operations
router.post('/', createExpense);
router.get('/', getExpenses);
router.get('/recent', getRecentExpenses);
router.get('/stats', getStats);
router.get('/categories', getCategoryBreakdown);
router.get('/budget-vs-actual', getBudgetVsActual);
router.get('/:id', getExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

// File upload
router.post('/upload-receipt', uploadReceipt);

module.exports = router;