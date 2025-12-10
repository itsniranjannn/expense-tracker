const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
        
        // Add user from payload to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        res.status(401).json({
            success: false,
            message: 'Invalid token. Please login again.'
        });
    }
};

module.exports = authMiddleware;