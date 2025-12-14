const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authMiddleware = async (req, res, next) => {
    try {
        console.log('🔐 Auth middleware called for:', req.method, req.path);
        
        // Get token from header
        const authHeader = req.header('Authorization');
        console.log('🔐 Auth Header:', authHeader ? 'Present' : 'Missing');
        
        if (!authHeader) {
            console.log('❌ No authorization header');
            return res.status(401).json({
                success: false,
                message: 'Access denied. No authorization header.'
            });
        }
        
        if (!authHeader.startsWith('Bearer ')) {
            console.log('❌ Invalid token format');
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token format.'
            });
        }
        
        const token = authHeader.replace('Bearer ', '').trim();
        
        if (!token || token === 'null' || token === 'undefined' || token === '') {
            console.log('❌ Empty or invalid token');
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const JWT_SECRET = process.env.JWT_SECRET || 'smart_budget_analyzer_secret_key_2024';
        console.log('🔐 JWT Secret exists:', !!process.env.JWT_SECRET);
        
        let decoded;
        try {
            console.log('🔐 Verifying token...');
            decoded = jwt.verify(token, JWT_SECRET);
            console.log('🔐 Token decoded successfully:', decoded);
        } catch (jwtError) {
            console.error('❌ JWT verification error:', jwtError.message);
            
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please login again.'
                });
            }
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token.'
                });
            }
            throw jwtError;
        }
        
        // Extract user ID from token - check both possibilities
        const userId = decoded.userId || decoded.id || decoded.user?.id;
        console.log('🔐 Extracted userId from token:', userId);
        
        if (!userId) {
            console.error('❌ No user ID found in token:', decoded);
            return res.status(401).json({
                success: false,
                message: 'Invalid token: No user ID found',
                decodedToken: decoded
            });
        }

        // Validate userId is a number
        const numericUserId = parseInt(userId);
        if (isNaN(numericUserId) || numericUserId <= 0) {
            console.error('❌ Invalid user ID format:', userId);
            return res.status(401).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        // Get user from database
        console.log('🔐 Querying database for user ID:', numericUserId);
        try {
            const [users] = await pool.execute(
                'SELECT id, email, name, currency, profile_picture FROM users WHERE id = ?',
                [numericUserId]
            );
            
            console.log('🔐 Database query result count:', users.length);
            
            if (users.length === 0) {
                console.error('❌ User not found in database:', numericUserId);
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Set user object on request
            const user = users[0];
            console.log('✅ User found:', { id: user.id, email: user.email });
            
            req.user = {
                id: user.id,
                userId: user.id, // Add both for compatibility
                email: user.email,
                name: user.name,
                currency: user.currency,
                profile_picture: user.profile_picture
            };
            
            console.log('✅ Auth middleware passed for user:', req.user.email);
            next();
            
        } catch (dbError) {
            console.error('❌ Database error in auth middleware:', dbError.message);
            console.error('❌ Database error stack:', dbError.stack);
            return res.status(500).json({
                success: false,
                message: 'Database error during authentication'
            });
        }
        
    } catch (error) {
        console.error('❌ Auth middleware general error:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = authMiddleware;