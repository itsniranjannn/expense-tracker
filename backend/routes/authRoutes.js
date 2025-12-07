const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getProfile, 
    updateProfile 
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for profile pictures
const upload = multer({ 
    dest: 'uploads/profiles/',
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, upload.single('profile_picture'), updateProfile);

module.exports = router;