const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

// ✅ FIXED: Middleware - Relax JSON parsing
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection test
const pool = require('./config/database').pool;

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('💡 Make sure:');
    console.log('1. MySQL is running');
    console.log('2. Database "expense_analyzer_db" exists');
    console.log('3. Check .env file configuration');
  } else {
    console.log('✅ Database connected successfully');
    connection.release();
  }
});

// Simple health check
app.get('/api/health', (req, res) => {
  pool.query('SELECT 1', (err) => {
    if (err) {
      return res.json({ 
        status: 'ERROR', 
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    res.json({ 
      status: 'OK', 
      message: 'Smart Budget Analyzer API is running',
      timestamp: new Date().toISOString()
    });
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Test endpoint for quick verification
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      expenses: {
        getAll: 'GET /api/expenses',
        dashboard: 'GET /api/expenses/dashboard-stats',
        add: 'POST /api/expenses'
      }
    }
  });
});

// Test login endpoint directly
app.post('/api/test-login', (req, res) => {
  console.log('Test login body:', req.body);
  console.log('Raw body:', req.rawBody);
  res.json({
    success: true,
    message: 'Test successful',
    receivedData: req.body
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body',
      receivedBody: req.rawBody ? req.rawBody.substring(0, 200) : 'No body received'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedUrl: req.originalUrl,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/expenses',
      'GET /api/expenses/dashboard-stats',
      'POST /api/test-login'
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`🧪 Test login: POST http://localhost:${PORT}/api/test-login`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/expenses/dashboard-stats`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test\n`);
});