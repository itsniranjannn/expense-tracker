const express = require('express');
const router = express.Router();
const { 
    runClustering,
    getAnalyses,
    getSpendingInsights,
    getVisualizationData
} = require('../controllers/analysisController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes are protected
router.use(authMiddleware);

// Analysis endpoints
router.post('/cluster', runClustering);
router.get('/results', getAnalyses);
router.get('/insights', getSpendingInsights);
router.get('/visualize', getVisualizationData);

module.exports = router;