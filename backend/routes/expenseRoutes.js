const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for receipt uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads/receipts');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
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
      cb(new Error('Only images (jpeg, jpg, png) and PDF files are allowed'));
    }
  }
});

const {
  getAllExpenses,
  getRecentExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getStatistics,
  getCategoryBreakdown,
  getDashboardStats
} = require('../controllers/expenseController');

// All routes require authentication
router.use(authMiddleware);

// Expense CRUD operations
router.get('/', getAllExpenses);
router.get('/recent', getRecentExpenses);
router.get('/statistics', getStatistics);
router.get('/categories', getCategoryBreakdown);
router.get('/dashboard-stats', getDashboardStats);
router.get('/:id', getExpenseById);
router.post('/', upload.single('receipt'), createExpense); // Add file upload middleware
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;