const express = require('express');
const router = express.Router();
const { 
    runClustering,
    getAnalyses,
    getSpendingInsights,
    getVisualizationData,
    deleteAnalysis,
    getAnalysisDetails
} = require('../controllers/analysisController');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ FIXED: Add debug middleware before auth
router.use((req, res, next) => {
    console.log(`📊 Analysis route called: ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    next();
});

// ✅ FIXED: Use auth middleware for all routes
router.use(authMiddleware);

// ✅ FIXED: Add route-specific debug middleware
router.use((req, res, next) => {
    console.log(`✅ User authenticated:`, req.user);
    next();
});

// Analysis endpoints
router.post('/cluster', runClustering);
router.get('/results', getAnalyses);
router.get('/insights', getSpendingInsights);
router.get('/visualize', getVisualizationData);
router.get('/:id', getAnalysisDetails);
router.delete('/:id', deleteAnalysis);

module.exports = router;