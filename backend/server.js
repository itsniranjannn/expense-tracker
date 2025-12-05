const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Smart Budget & Expense Analyzer API',
        project: 'TU BCA 6th Semester Project II',
        author: 'niranjan',
        endpoints: {
            auth: '/api/auth',
            expenses: '/api/expenses',
            analysis: '/api/analysis'
        }
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Expense Analyzer API',
        version: '1.0.0'
    });
});

// Import routes (we'll create these next)
// const authRoutes = require('./routes/authRoutes');
// const expenseRoutes = require('./routes/expenseRoutes');
// const analysisRoutes = require('./routes/analysisRoutes');

// Use routes
// app.use('/api/auth', authRoutes);
// app.use('/api/expenses', expenseRoutes);
// app.use('/api/analysis', analysisRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📚 Project: Smart Budget & Expense Analyzer`);
    console.log(`🎓 TU BCA 6th Semester Project II`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
});