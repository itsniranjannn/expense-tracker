const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs'); // ADD THIS LINE
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const analysisRoutes = require('./routes/analysisRoutes');

// Import middleware
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// ✅ Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/receipts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadsDir);
}

// ✅ FIXED: Middleware - Relax JSON parsing
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(helmet());

// ✅ FIXED: CORS configuration for FormData support
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With']
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

// ✅ FIXED: Simple health check with database test
app.get('/api/health', (req, res) => {
  pool.query('SELECT 1', (err) => {
    if (err) {
      console.error('Health check DB error:', err.message);
      return res.status(500).json({ 
        success: false,
        status: 'ERROR', 
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    res.json({ 
      success: true,
      status: 'OK', 
      message: 'Smart Budget Analyzer API is running',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      version: '3.0.0'
    });
  });
});

// ✅ FIXED: Add route logging middleware
app.use((req, res, next) => {
    console.log(`🌐 ${new Date().toISOString()} ${req.method} ${req.path}`);
    
    // Log request body for debugging (except for FormData which contains files)
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        if (req.body && Object.keys(req.body).length > 0) {
            console.log('📦 Request body:', JSON.stringify(req.body).substring(0, 200));
        }
    } else if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        console.log('📁 FormData request detected (file upload)');
    }
    
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analysis', analysisRoutes);

// ✅ FIXED: Add debug endpoint to check auth
app.get('/api/debug/auth', authMiddleware, (req, res) => {
    res.json({
        success: true,
        user: req.user,
        message: 'Auth working correctly',
        timestamp: new Date().toISOString()
    });
});

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
        add: 'POST /api/expenses (supports FormData for file upload)'
      },
      analysis: {
        cluster: 'POST /api/analysis/cluster',
        results: 'GET /api/analysis/results',
        insights: 'GET /api/analysis/insights',
        visualize: 'GET /api/analysis/visualize'
      }
    },
    fileUpload: {
      supported: true,
      maxSize: '5MB',
      allowedTypes: 'JPEG, JPG, PNG, PDF',
      uploadDir: uploadsDir
    }
  });
});

// Special test endpoint for FormData testing
app.post('/api/test-upload', (req, res) => {
  console.log('Test upload request headers:', req.headers);
  console.log('Request body:', req.body);
  console.log('Files:', req.files);
  
  res.json({
    success: true,
    message: 'Test endpoint working',
    headers: req.headers,
    body: req.body,
    files: req.files || 'No files'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  
  // Handle multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum size is 5MB.'
    });
  }
  
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only JPEG, JPG, PNG, and PDF files are allowed.'
    });
  }
  
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
      'POST /api/expenses (with file upload)',
      'POST /api/analysis/cluster',
      'GET /api/analysis/results',
      'GET /api/analysis/insights',
      'GET /api/analysis/visualize',
      'POST /api/test-upload',
      'GET /api/debug/auth'
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
  console.log(`   GET  http://localhost:${PORT}/api/debug/auth (auth test)`);
  console.log(`📊 Expense endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/expenses (FormData supported)`);
  console.log(`   GET  http://localhost:${PORT}/api/expenses`);
  console.log(`📁 File Upload:`);
  console.log(`   Directory: ${uploadsDir}`);
  console.log(`   Max size: 5MB`);
  console.log(`🧪 Test endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/test-upload (FormData test)`);
  console.log(`   GET  http://localhost:${PORT}/api/test`);
  console.log(`\n✅ Ready to accept file uploads!\n`);
});