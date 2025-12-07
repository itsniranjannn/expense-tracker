const KMeans = require('../algorithms/kmeans');
const Expense = require('../models/Expense');
const { pool } = require('../config/database');

// Run K-Means clustering
const runClustering = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { k } = req.body;

        // Get user's expenses
        const expenses = await Expense.findAll(userId);
        
        if (expenses.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Need at least 3 expenses for clustering'
            });
        }

        // Find optimal K if not provided
        let optimalK = parseInt(k) || 3;
        if (!k) {
            const optimalResult = KMeans.findOptimalK(expenses);
            optimalK = optimalResult.recommendations;
        }

        // Run K-Means
        const kmeans = new KMeans(optimalK);
        const result = kmeans.fit(expenses);
        
        // Generate insights
        const insights = kmeans.generateInsights(expenses, result.clusters);
        
        // Save analysis results to database
        const [analysisResult] = await pool.execute(
            `INSERT INTO analysis_results 
            (user_id, cluster_count, insights_json) 
            VALUES (?, ?, ?)`,
            [userId, optimalK, JSON.stringify(insights)]
        );
        
        const analysisId = analysisResult.insertId;
        
        // Save cluster assignments
        for (let clusterId = 0; clusterId < result.clusters.length; clusterId++) {
            const cluster = result.clusters[clusterId];
            
            for (const point of cluster) {
                await pool.execute(
                    `INSERT INTO expense_clusters 
                    (analysis_id, expense_id, cluster_id, distance_to_center) 
                    VALUES (?, ?, ?, ?)`,
                    [analysisId, point.id, clusterId + 1, point.distance || 0]
                );
            }
        }

        res.json({
            success: true,
            message: 'Clustering completed successfully',
            optimalK,
            clusters: result.clusters.length,
            insights,
            centroids: result.centroids,
            iterationHistory: result.history
        });
    } catch (error) {
        console.error('Clustering error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during clustering'
        });
    }
};

// Get previous analyses
const getAnalyses = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const [analyses] = await pool.execute(
            `SELECT ar.*, 
            COUNT(DISTINCT ec.expense_id) as expense_count
            FROM analysis_results ar
            LEFT JOIN expense_clusters ec ON ar.id = ec.analysis_id
            WHERE ar.user_id = ?
            GROUP BY ar.id
            ORDER BY ar.analysis_date DESC`,
            [userId]
        );
        
        // Parse JSON insights
        analyses.forEach(analysis => {
            if (analysis.insights_json) {
                analysis.insights = JSON.parse(analysis.insights_json);
            }
        });
        
        res.json({
            success: true,
            analyses
        });
    } catch (error) {
        console.error('Get analyses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get spending insights
const getSpendingInsights = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Get recent expenses
        const expenses = await Expense.findAll(userId);
        
        if (expenses.length === 0) {
            return res.json({
                success: true,
                insights: {
                    message: 'No expenses to analyze. Add some expenses first.',
                    recommendations: ['Start by adding your daily expenses']
                }
            });
        }
        
        // Calculate basic insights
        const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const avgExpense = totalSpent / expenses.length;
        
        // Group by category
        const categoryTotals = {};
        expenses.forEach(exp => {
            categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
        });
        
        // Find top categories
        const topCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category, amount]) => ({ category, amount }));
        
        // Monthly spending
        const monthlySpending = {};
        expenses.forEach(exp => {
            const month = exp.expense_date.slice(0, 7); // YYYY-MM
            monthlySpending[month] = (monthlySpending[month] || 0) + parseFloat(exp.amount);
        });
        
        // Generate recommendations
        const recommendations = [];
        
        if (topCategories[0] && topCategories[0].amount > totalSpent * 0.4) {
            recommendations.push(
                `Consider reducing spending on ${topCategories[0].category} as it's ${Math.round((topCategories[0].amount / totalSpent) * 100)}% of your total expenses`
            );
        }
        
        if (avgExpense > 1000) {
            recommendations.push(
                'Your average expense is high. Try to find ways to reduce large individual expenses'
            );
        }
        
        const insights = {
            totalExpenses: expenses.length,
            totalSpent,
            averageExpense: avgExpense,
            topCategories,
            monthlySpending,
            categoryBreakdown: categoryTotals,
            recommendations
        };
        
        res.json({
            success: true,
            insights
        });
    } catch (error) {
        console.error('Get insights error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get visualization data
const getVisualizationData = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { analysisId } = req.query;
        
        let expenses;
        let clusters = [];
        
        if (analysisId) {
            // Get clustered expenses
            const [clusterData] = await pool.execute(
                `SELECT e.*, ec.cluster_id, ec.distance_to_center
                FROM expenses e
                JOIN expense_clusters ec ON e.id = ec.expense_id
                JOIN analysis_results ar ON ec.analysis_id = ar.id
                WHERE ar.user_id = ? AND ar.id = ?
                ORDER BY ec.cluster_id`,
                [userId, analysisId]
            );
            
            expenses = clusterData;
            
            // Group by cluster
            const clusterMap = new Map();
            clusterData.forEach(exp => {
                if (!clusterMap.has(exp.cluster_id)) {
                    clusterMap.set(exp.cluster_id, []);
                }
                clusterMap.get(exp.cluster_id).push(exp);
            });
            
            clusters = Array.from(clusterMap.values());
        } else {
            // Get all expenses
            expenses = await Expense.findAll(userId);
        }
        
        // Prepare data for visualization
        const scatterData = expenses.map(exp => ({
            id: exp.id,
            x: new Date(exp.expense_date).getTime(), // Date as timestamp
            y: exp.amount,
            category: exp.category,
            title: exp.title,
            clusterId: exp.cluster_id || 0
        }));
        
        // Line chart data (spending over time)
        const lineData = [];
        const dailyTotals = {};
        
        expenses.forEach(exp => {
            const date = exp.expense_date;
            dailyTotals[date] = (dailyTotals[date] || 0) + parseFloat(exp.amount);
        });
        
        Object.entries(dailyTotals)
            .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
            .forEach(([date, amount]) => {
                lineData.push({
                    date,
                    amount
                });
            });
        
        // Category distribution
        const categoryData = [];
        const categorySums = {};
        
        expenses.forEach(exp => {
            categorySums[exp.category] = (categorySums[exp.category] || 0) + parseFloat(exp.amount);
        });
        
        Object.entries(categorySums).forEach(([category, amount]) => {
            categoryData.push({
                category,
                amount,
                percentage: (amount / Object.values(categorySums).reduce((a, b) => a + b, 0)) * 100
            });
        });
        
        res.json({
            success: true,
            scatterData,
            lineData,
            categoryData,
            clusters: clusters.map((cluster, index) => ({
                clusterId: index + 1,
                points: cluster.length,
                totalAmount: cluster.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
                averageAmount: cluster.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) / cluster.length
            }))
        });
    } catch (error) {
        console.error('Get visualization data error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
    // Get spending insights
const getSpendingInsights = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Get recent expenses
        const expenses = await Expense.findAll(userId);
        
        if (expenses.length === 0) {
            return res.json({
                success: true,
                insights: {
                    message: 'No expenses to analyze. Add some expenses first.',
                    recommendations: ['Start by adding your daily expenses']
                }
            });
        }
        
        // Calculate basic insights
        const totalSpent = expenses.reduce((sum, exp) => {
            // Ensure amount is a number
            const amount = parseFloat(exp.amount) || 0;
            return sum + amount;
        }, 0);
        
        const avgExpense = totalSpent / expenses.length;
        
        // Group by category
        const categoryTotals = {};
        expenses.forEach(exp => {
            const amount = parseFloat(exp.amount) || 0;
            categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amount;
        });
        
        // Find top categories
        const topCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category, amount]) => ({ 
                category, 
                amount: parseFloat(amount.toFixed(2))
            }));
        
        // Monthly spending
        const monthlySpending = {};
        expenses.forEach(exp => {
            if (exp.expense_date) {
                const month = exp.expense_date.slice(0, 7); // YYYY-MM
                const amount = parseFloat(exp.amount) || 0;
                monthlySpending[month] = (monthlySpending[month] || 0) + amount;
            }
        });
        
        // Generate recommendations
        const recommendations = [];
        
        if (topCategories[0] && topCategories[0].amount > totalSpent * 0.4) {
            recommendations.push(
                `Consider reducing spending on ${topCategories[0].category} as it's ${Math.round((topCategories[0].amount / totalSpent) * 100)}% of your total expenses`
            );
        }
        
        if (avgExpense > 1000) {
            recommendations.push(
                'Your average expense is high. Try to find ways to reduce large individual expenses'
            );
        }
        
        // If total spent is 0, add general recommendations
        if (totalSpent === 0) {
            recommendations.push(
                'Start tracking your daily expenses to get personalized insights'
            );
        }
        
        const insights = {
            totalExpenses: expenses.length,
            totalSpent: parseFloat(totalSpent.toFixed(2)),
            averageExpense: parseFloat(avgExpense.toFixed(2)),
            topCategories,
            monthlySpending,
            categoryBreakdown: categoryTotals,
            recommendations
        };
        
        res.json({
            success: true,
            insights
        });
    } catch (error) {
        console.error('Get insights error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
};

module.exports = {
    runClustering,
    getAnalyses,
    getSpendingInsights,
    getVisualizationData
};