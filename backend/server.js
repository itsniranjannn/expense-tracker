const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory:', uploadsDir);
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// ✅ FIXED: CORS configuration - place BEFORE static files
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With']
}));

// ✅ FIXED: Configure Helmet with less restrictive CORS policy for static files
app.use(
    helmet({
        crossOriginResourcePolicy: false, // Allow images from different origins
        crossOriginEmbedderPolicy: false, // Allow embedding resources
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "http://localhost:5000", "http://localhost:5173", "https://ui-avatars.com"],
                connectSrc: ["'self'", "http://localhost:5000"],
            },
        },
    })
);

// ✅ FIXED: Serve static files BEFORE routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    }
}));

// Database connection test
const { pool } = require('./config/database');

// Test database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('Error details:', err);
    } else {
        console.log('✅ Database connected successfully');
        connection.release();
        
        // Test query to check if budgets table exists
        pool.query('SHOW TABLES LIKE "budgets"', (err, results) => {
            if (err) {
                console.error('❌ Error checking budgets table:', err.message);
            } else if (results.length === 0) {
                console.log('⚠️  Budgets table not found. Creating table...');
                // Create budgets table if it doesn't exist
                const createTableQuery = `
                    CREATE TABLE IF NOT EXISTS budgets (
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        user_id INT NOT NULL,
                        category VARCHAR(50),
                        amount DECIMAL(12, 2) NOT NULL,
                        month_year DATE NOT NULL,
                        color VARCHAR(7) DEFAULT '#3B82F6',
                        icon VARCHAR(50) DEFAULT '💰',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                        UNIQUE KEY unique_user_category_month (user_id, category, month_year)
                    )
                `;
                pool.query(createTableQuery, (err) => {
                    if (err) {
                        console.error('❌ Error creating budgets table:', err.message);
                    } else {
                        console.log('✅ Budgets table created successfully');
                    }
                });
            } else {
                console.log('✅ Budgets table exists');
            }
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    pool.query('SELECT 1', (err) => {
        if (err) {
            return res.status(500).json({ 
                success: false,
                status: 'ERROR', 
                message: 'Database connection failed',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
        res.json({ 
            success: true,
            status: 'OK', 
            message: 'Smart Budget Analyzer API is running',
            database: 'Connected',
            version: '3.0.0',
            endpoints: [
                '/api/auth',
                '/api/expenses',
                '/api/analysis',
                '/api/budgets',
                '/api/health'
            ]
        });
    });
});

// Routes - AFTER static files
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/budgets', budgetRoutes);

// Debug route to check all registered routes
app.get('/api/debug/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    routes.push({
                        path: handler.route.path,
                        methods: Object.keys(handler.route.methods)
                    });
                }
            });
        }
    });
    res.json({ routes });
});

// Test endpoint for images
app.get('/api/test-image/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        // Try other locations
        const possiblePaths = [
            path.join(__dirname, 'uploads', 'profiles', filename),
            path.join(__dirname, 'uploads', 'receipts', filename)
        ];
        
        for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
                return res.sendFile(possiblePath);
            }
        }
        
        res.status(404).json({ 
            success: false, 
            message: 'Image not found',
            searchedPaths: possiblePaths.map(p => p.replace(__dirname, ''))
        });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size is 5MB.'
        });
    }
    
    // Handle multer errors
    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler - ONLY for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found',
        requestedUrl: req.originalUrl
    });
});

// For non-API routes, check if it's a static file
app.use('*', (req, res, next) => {
    const requestedPath = req.originalUrl;
    
    // Check if it's a static file request (starts with /uploads/)
    if (requestedPath.startsWith('/uploads/')) {
        // Try to serve the static file
        const filePath = path.join(__dirname, requestedPath);
        
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).json({
                success: false,
                message: 'File not found',
                filePath: requestedPath
            });
        }
    } else if (!requestedPath.startsWith('/api/')) {
        // For non-API, non-static routes
        res.status(404).json({
            success: false,
            message: 'Route not found. Available routes start with /api/ or /uploads/',
            requestedUrl: req.originalUrl
        });
    } else {
        // Should have been caught by the /api/* handler
        next();
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📁 Static files: http://localhost:${PORT}/uploads/`);
    console.log(`📊 Budgets API: http://localhost:${PORT}/api/budgets`);
    console.log(`🔍 Debug routes: http://localhost:${PORT}/api/debug/routes`);
    console.log(`\n✅ All routes registered:`);
    console.log(`   POST /api/budgets - Create new budget`);
    console.log(`   GET  /api/budgets - Get all budgets`);
    console.log(`   PUT  /api/budgets/:id - Update budget`);
    console.log(`   DELETE /api/budgets/:id - Delete budget`);
    console.log(`   GET  /api/budgets/stats - Get budget statistics`);
    console.log(`\n✅ Ready to accept requests!\n`);
});