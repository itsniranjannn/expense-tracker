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

// ✅ FIXED: Apply auth middleware to ALL analysis routes
router.use(authMiddleware);

// Analysis endpoints
router.post('/cluster', runClustering);
router.get('/results', getAnalyses);
router.get('/insights', getSpendingInsights);
router.get('/visualize', getVisualizationData);
router.get('/:id', getAnalysisDetails);
router.delete('/:id', deleteAnalysis);

module.exports = router;