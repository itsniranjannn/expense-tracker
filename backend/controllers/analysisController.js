const KMeans = require('../algorithms/kmeans');
const { pool } = require('../config/database');

// Run K-Means clustering
const runClustering = async (req, res) => {
    let userId;
    try {
        userId = req.user.id;
        const { k, features = ['amount', 'category', 'date'] } = req.body;

        console.log(`🔄 Running K-Means clustering for user ${userId}`);

        // Get user's expenses
        const [expenses] = await pool.execute(
            `SELECT id, title, category, amount, expense_date, 
                    description, payment_method, created_at
             FROM expenses 
             WHERE user_id = ? 
             ORDER BY expense_date DESC`,
            [userId]
        );
        
        console.log(`📊 Found ${expenses.length} expenses for user ${userId}`);
        
        if (expenses.length < 5) {
            return res.status(400).json({
                success: false,
                message: 'Need at least 5 expenses for meaningful clustering',
                minRequired: 5,
                currentExpenses: expenses.length,
                help: 'Add more expenses to enable K-Means analysis'
            });
        }

        // Prepare data for clustering
        const preparedData = prepareDataForClustering(expenses, features);
        
        if (!preparedData.featureVectors || preparedData.featureVectors.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Failed to prepare data for clustering',
                error: 'No feature vectors generated'
            });
        }
        
        console.log(`✅ Prepared ${preparedData.featureVectors.length} feature vectors for clustering`);
        
        // Find optimal K using elbow method
        let optimalK = k || await findOptimalK(preparedData.featureVectors);
        console.log(`🎯 Optimal K determined: ${optimalK}`);
        
        // Run K-Means
        const kmeans = new KMeans(optimalK, 300);
        console.log('⚙️ Running K-Means algorithm...');
        const result = kmeans.fit(preparedData.featureVectors);
        console.log(`✅ K-Means completed with ${result.clusters.length} clusters`);
        
        // Process results
        const clusteredExpenses = processClusteringResults(
            expenses, 
            result.clusters, 
            result.centroids,
            preparedData.normalization
        );
        
        // Generate insights
        const insights = generateClusteringInsights(clusteredExpenses, result.centroids);
        
        // Save to database
        const analysisId = await saveAnalysisToDB(userId, optimalK, insights, 'kmeans-v2');
        console.log(`💾 Analysis saved with ID: ${analysisId}`);
        
        await saveClustersToDB(analysisId, clusteredExpenses);
        
        // Prepare response
        const responseData = prepareResponseData(clusteredExpenses, result, insights, analysisId);
        
        res.json({
            success: true,
            message: 'Clustering analysis completed successfully',
            analysisId,
            ...responseData,
            algorithm: {
                name: 'K-Means Clustering',
                version: 'kmeans-v2',
                parameters: {
                    k: optimalK,
                    features: features,
                    distanceMetric: 'Euclidean',
                    maxIterations: 300,
                    tolerance: 0.0001
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Clustering error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error during clustering analysis',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            userId: userId || 'unknown',
            timestamp: new Date().toISOString()
        });
    }
};

// Get all analyses for user
const getAnalyses = async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log(`📋 Fetching analyses for user ${userId}`);
        
        // Get analyses
        const [analyses] = await pool.execute(
            `SELECT ar.* 
            FROM analysis_results ar
            WHERE ar.user_id = ?
            ORDER BY ar.analysis_date DESC`,
            [userId]
        );
        
        // Get counts for each analysis
        for (let analysis of analyses) {
            const [clusterCount] = await pool.execute(
                `SELECT COUNT(DISTINCT cluster_id) as cluster_count,
                       COUNT(*) as expense_count
                FROM expense_clusters 
                WHERE analysis_id = ?`,
                [analysis.id]
            );
            
            analysis.cluster_count = clusterCount[0]?.cluster_count || 0;
            analysis.expense_count = clusterCount[0]?.expense_count || 0;
            
            // Parse JSON insights
            if (analysis.insights_json) {
                try {
                    analysis.insights = JSON.parse(analysis.insights_json);
                } catch (e) {
                    console.error('Failed to parse insights JSON:', e);
                    analysis.insights = {};
                }
            }
        }
        
        res.json({
            success: true,
            count: analyses.length,
            analyses,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Get analyses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analyses',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get spending insights
const getSpendingInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`💡 Generating spending insights for user ${userId}`);

    // Get recent expenses
    const [expenses] = await pool.execute(
      `SELECT * FROM expenses 
       WHERE user_id = ? 
       ORDER BY expense_date DESC 
       LIMIT 100`,
      [userId]
    );
    
    if (expenses.length === 0) {
      return res.json({
        success: true,
        insights: {
          message: 'No expenses to analyze. Add some expenses first.',
          recommendations: ['Start by adding your daily expenses'],
          statistics: {
            totalExpenses: 0,
            totalSpent: 0,
            averageExpense: 0
          }
        }
      });
    }
    
    // Calculate basic insights
    const totalSpent = expenses.reduce((sum, exp) => {
      const amount = parseFloat(exp.amount) || 0;
      return sum + amount;
    }, 0);
    
    const avgExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;
    
    // Group by category
    const categoryTotals = {};
    const categoryCounts = {};
    
    expenses.forEach(exp => {
      const amount = parseFloat(exp.amount) || 0;
      const category = exp.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Find top categories
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => ({ 
        category, 
        amount: parseFloat(amount.toFixed(2)),
        count: categoryCounts[category],
        percentage: parseFloat((amount / totalSpent * 100).toFixed(1))
      }));
    
    // Monthly spending trend
const monthlySpending = {};
expenses.forEach(exp => {
  if (exp.expense_date) {
    // FIXED: Handle date properly
    let date;
    if (exp.expense_date instanceof Date) {
      date = exp.expense_date;
    } else if (typeof exp.expense_date === 'string') {
      date = new Date(exp.expense_date);
    } else if (exp.expense_date && exp.expense_date.getMonth) {
      date = exp.expense_date;
    }
    
    if (date && !isNaN(date.getTime())) {
      const month = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
      const amount = parseFloat(exp.amount) || 0;
      monthlySpending[month] = (monthlySpending[month] || 0) + amount;
    }
  }
});
    
// Weekly pattern
const weeklyPattern = {};
expenses.forEach(exp => {
  if (exp.expense_date) {
    let date;
    if (exp.expense_date instanceof Date) {
      date = exp.expense_date;
    } else if (typeof exp.expense_date === 'string') {
      date = new Date(exp.expense_date);
    } else if (exp.expense_date.getMonth) {
      date = exp.expense_date;
    }
    
    if (date && !isNaN(date.getTime())) {
      const day = date.getDay();
      const amount = parseFloat(exp.amount) || 0;
      weeklyPattern[day] = (weeklyPattern[day] || 0) + amount;
    }
  }
});
    
    // Payment method analysis
    const paymentMethodAnalysis = {};
    expenses.forEach(exp => {
      const method = exp.payment_method || 'Unknown';
      const amount = parseFloat(exp.amount) || 0;
      paymentMethodAnalysis[method] = (paymentMethodAnalysis[method] || 0) + amount;
    });
    
    // Generate recommendations
    const recommendations = [];
    
    if (topCategories[0] && topCategories[0].percentage > 40) {
      recommendations.push({
        title: `Reduce spending on ${topCategories[0].category}`,
        description: `This category accounts for ${topCategories[0].percentage}% of your total expenses.`,
        impact: 'High',
        priority: 1,
        estimatedSavings: Math.round(totalSpent * 0.15),
        category: 'budgeting'
      });
    }
    
    if (avgExpense > 1500) {
      recommendations.push({
        title: 'High average transaction value',
        description: `Your average expense is Rs ${avgExpense.toFixed(2)}. Consider breaking large purchases or finding alternatives.`,
        impact: 'Medium',
        priority: 2,
        estimatedSavings: Math.round(avgExpense * 0.2 * expenses.length),
        category: 'spending'
      });
    }
    
    // Check for spending spikes
    const last7Days = expenses.filter(exp => {
      if (!exp.expense_date) return false;
      
      let expenseDate;
      if (exp.expense_date instanceof Date) {
        expenseDate = exp.expense_date;
      } else if (typeof exp.expense_date === 'string') {
        expenseDate = new Date(exp.expense_date);
      } else if (exp.expense_date.getMonth) {
        expenseDate = exp.expense_date;
      }
      
      if (!expenseDate || isNaN(expenseDate.getTime())) return false;
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return expenseDate >= weekAgo;
    });
    
    const last7DaysTotal = last7Days.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const previous7DaysTotal = totalSpent - last7DaysTotal;
    const weeklyAvg = previous7DaysTotal / Math.max(expenses.length - last7Days.length, 1) * 7;
    
    if (last7DaysTotal > weeklyAvg * 1.5 && weeklyAvg > 0) {
      recommendations.push({
        title: 'Recent spending spike detected',
        description: `Your spending increased by ${((last7DaysTotal / weeklyAvg - 1) * 100).toFixed(0)}% in the last week.`,
        impact: 'High',
        priority: 1,
        estimatedSavings: Math.round(last7DaysTotal * 0.25),
        category: 'monitoring'
      });
    }
    
    // Calculate savings opportunity
    const potentialSavings = recommendations.reduce((sum, rec) => sum + (rec.estimatedSavings || 0), 0);
    
    const insights = {
      statistics: {
        totalExpenses: expenses.length,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        averageExpense: parseFloat(avgExpense.toFixed(2)),
        largestExpense: Math.max(...expenses.map(e => parseFloat(e.amount) || 0)),
        smallestExpense: Math.min(...expenses.map(e => parseFloat(e.amount) || 0)),
        expenseFrequency: (expenses.length / 30).toFixed(1) + ' per day'
      },
      categoryAnalysis: {
        topCategories,
        categoryDistribution: categoryTotals,
        categoryDiversity: Object.keys(categoryTotals).length
      },
      temporalAnalysis: {
        monthlySpending,
        weeklyPattern,
        last7Days: {
          count: last7Days.length,
          total: parseFloat(last7DaysTotal.toFixed(2)),
          average: parseFloat((last7DaysTotal / Math.max(last7Days.length, 1)).toFixed(2))
        }
      },
      paymentMethodAnalysis,
      recommendations,
      summary: {
        potentialSavings,
        confidence: '85%',
        lastUpdated: new Date().toISOString()
      }
    };
    
    res.json({
      success: true,
      insights,
      metadata: {
        analysisDate: new Date().toISOString(),
        expenseRange: {
          oldest: expenses[expenses.length - 1]?.expense_date,
          newest: expenses[0]?.expense_date
        }
      }
    });
  } catch (error) {
    console.error('❌ Get insights error:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to generate spending insights',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get visualization data - FIXED VERSION
const getVisualizationData = async (req, res) => {
    try {
        const userId = req.user.id;
        const { analysisId, includeRaw = 'false', timeRange = 'month' } = req.query;
        
        console.log(`📈 Generating visualization data for user ${userId}, analysis: ${analysisId || 'none'}`);
        
        let expenses;
        let clusters = [];
        
        if (analysisId) {
            // Get clustered expenses
            const [clusterData] = await pool.execute(
                `SELECT e.*, ec.cluster_id, ec.cluster_label, ec.distance_to_center
                FROM expenses e
                JOIN expense_clusters ec ON e.id = ec.expense_id
                JOIN analysis_results ar ON ec.analysis_id = ar.id
                WHERE ar.user_id = ? AND ar.id = ?
                ORDER BY ec.cluster_id, ec.distance_to_center`,
                [userId, analysisId]
            );
            
            expenses = clusterData;
            
            // Group by cluster
            const clusterMap = new Map();
            clusterData.forEach(exp => {
                if (!clusterMap.has(exp.cluster_id)) {
                    clusterMap.set(exp.cluster_id, {
                        id: exp.cluster_id,
                        label: exp.cluster_label || `Cluster ${exp.cluster_id}`,
                        expenses: [],
                        totalAmount: 0,
                        averageAmount: 0
                    });
                }
                
                const cluster = clusterMap.get(exp.cluster_id);
                cluster.expenses.push({
                    id: exp.id,
                    title: exp.title,
                    amount: parseFloat(exp.amount),
                    category: exp.category,
                    date: exp.expense_date,
                    distanceToCenter: exp.distance_to_center
                });
                
                cluster.totalAmount += parseFloat(exp.amount);
            });
            
            // Calculate averages
            clusterMap.forEach(cluster => {
                cluster.averageAmount = cluster.totalAmount / cluster.expenses.length;
                cluster.size = cluster.expenses.length;
                cluster.color = getClusterColor(cluster.id);
            });
            
            clusters = Array.from(clusterMap.values());
        } else {
            // Get all expenses with time filter
            let dateFilter = '';
            if (timeRange === 'week') {
                dateFilter = 'AND expense_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
            } else if (timeRange === 'month') {
                dateFilter = 'AND expense_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
            } else if (timeRange === 'quarter') {
                dateFilter = 'AND expense_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
            }
            
            const [expenseData] = await pool.execute(
                `SELECT * FROM expenses 
                 WHERE user_id = ? ${dateFilter}
                 ORDER BY expense_date DESC`,
                [userId]
            );
            
            expenses = expenseData;
        }
        
        if (expenses.length === 0) {
            return res.json({
                success: true,
                message: 'No expense data available for visualization',
                scatterData: [],
                lineData: [],
                categoryData: [],
                paymentData: [],
                clusters: [],
                statistics: {}
            });
        }
        
        // Prepare scatter plot data - FIXED DATE HANDLING
        const scatterData = expenses.map(exp => {
            // FIXED: Handle date properly
            let date;
            if (exp.expense_date instanceof Date) {
                date = exp.expense_date;
            } else if (typeof exp.expense_date === 'string') {
                date = new Date(exp.expense_date);
            } else if (exp.expense_date && exp.expense_date.getMonth) {
                date = exp.expense_date;
            } else {
                date = new Date(); // fallback
            }
            
            const amount = parseFloat(exp.amount) || 0;
            const category = exp.category || 'Other';
            
            // Create feature vectors for visualization
            const categoryMapping = {
                'Food & Dining': 1, 'Transportation': 2, 'Shopping': 3, 
                'Bills & Utilities': 4, 'Entertainment': 5, 'Healthcare': 6,
                'Education': 7, 'Groceries': 8, 'Travel': 9, 
                'Personal Care': 10, 'Savings': 11, 'Investment': 12,
                'Gifts & Donations': 13, 'Other': 14
            };
            
            return {
                id: exp.id,
                x: date.getTime(), // Use timestamp for x
                y: amount,
                z: Math.sqrt(amount) * 10,
                category,
                categoryId: categoryMapping[category] || 14,
                title: exp.title,
                amount: amount,
                date: date.toISOString().split('T')[0], // Store as string for frontend
                clusterId: exp.cluster_id || 0,
                clusterLabel: exp.cluster_label || 'Unclustered',
                distanceToCenter: exp.distance_to_center || 0,
                paymentMethod: exp.payment_method
            };
        });
        
        // Prepare line chart data (spending over time) - FIXED DATE HANDLING
        const lineData = [];
        const dailyTotals = {};
        
        expenses.forEach(exp => {
            // FIXED: Handle date properly
            let date;
            if (exp.expense_date instanceof Date) {
                date = exp.expense_date;
            } else if (typeof exp.expense_date === 'string') {
                date = new Date(exp.expense_date);
            } else if (exp.expense_date && exp.expense_date.getMonth) {
                date = exp.expense_date;
            } else {
                date = new Date(); // fallback
            }
            
            const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
            const amount = parseFloat(exp.amount) || 0;
            dailyTotals[dateString] = (dailyTotals[dateString] || 0) + amount;
        });
        
        // Sort by date and convert to array
        Object.entries(dailyTotals)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .forEach(([dateString, amount]) => {
                const dateObj = new Date(dateString);
                lineData.push({
                    date: dateString,
                    amount: parseFloat(amount.toFixed(2)),
                    formattedDate: dateObj.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                    }),
                    day: dateObj.getDay(),
                    isWeekend: [0, 6].includes(dateObj.getDay())
                });
            });
        
        // Category distribution
        const categoryData = [];
        const categorySums = {};
        
        expenses.forEach(exp => {
            const category = exp.category || 'Other';
            const amount = parseFloat(exp.amount) || 0;
            categorySums[category] = (categorySums[category] || 0) + amount;
        });
        
        const totalByCategory = Object.values(categorySums).reduce((a, b) => a + b, 0);
        
        Object.entries(categorySums).forEach(([category, amount]) => {
            const count = expenses.filter(e => e.category === category).length;
            categoryData.push({
                category,
                amount: parseFloat(amount.toFixed(2)),
                percentage: parseFloat((amount / totalByCategory * 100).toFixed(1)),
                count,
                average: parseFloat((amount / Math.max(count, 1)).toFixed(2))
            });
        });
        
        // Sort categories by amount
        categoryData.sort((a, b) => b.amount - a.amount);
        
        // Payment method distribution
        const paymentData = [];
        const paymentSums = {};
        
        expenses.forEach(exp => {
            const method = exp.payment_method || 'Unknown';
            const amount = parseFloat(exp.amount) || 0;
            paymentSums[method] = (paymentSums[method] || 0) + amount;
        });
        
        Object.entries(paymentSums).forEach(([method, amount]) => {
            paymentData.push({
                method,
                amount: parseFloat(amount.toFixed(2)),
                percentage: parseFloat((amount / totalByCategory * 100).toFixed(1)),
                count: expenses.filter(e => e.payment_method === method).length
            });
        });
        
        // Calculate statistics
        const amounts = expenses.map(exp => parseFloat(exp.amount) || 0);
        const totalAmount = amounts.reduce((a, b) => a + b, 0);
        const averageAmount = totalAmount / expenses.length;
        
        // FIXED: Get date range properly
        const dates = expenses.map(exp => {
            let date;
            if (exp.expense_date instanceof Date) {
                date = exp.expense_date;
            } else if (typeof exp.expense_date === 'string') {
                date = new Date(exp.expense_date);
            } else if (exp.expense_date && exp.expense_date.getMonth) {
                date = exp.expense_date;
            } else {
                date = new Date(); // fallback
            }
            return date.getTime();
        });
        
        const minDate = dates.length > 0 ? Math.min(...dates) : 0;
        const maxDate = dates.length > 0 ? Math.max(...dates) : 0;
        
        res.json({
            success: true,
            scatterData: includeRaw === 'true' ? scatterData : scatterData.slice(0, 100),
            lineData,
            categoryData,
            paymentData,
            clusters,
            statistics: {
                totalPoints: scatterData.length,
                totalAmount: parseFloat(totalAmount.toFixed(2)),
                averageAmount: parseFloat(averageAmount.toFixed(2)),
                dateRange: {
                    start: minDate > 0 ? new Date(minDate).toISOString().split('T')[0] : null,
                    end: maxDate > 0 ? new Date(maxDate).toISOString().split('T')[0] : null,
                    days: minDate > 0 && maxDate > 0 ? 
                        Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24)) : 0
                },
                amountRange: {
                    min: amounts.length > 0 ? Math.min(...amounts) : 0,
                    max: amounts.length > 0 ? Math.max(...amounts) : 0,
                    average: averageAmount
                },
                categoryCount: categoryData.length,
                clusterCount: clusters.length
            },
            metadata: {
                generatedAt: new Date().toISOString(),
                dataPoints: expenses.length,
                analysisId: analysisId || 'none',
                timeRange
            }
        });
    } catch (error) {
        console.error('❌ Get visualization data error:', error);
        console.error('Error stack:', error.stack); // Added for debugging
        res.status(500).json({
            success: false,
            message: 'Failed to generate visualization data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete analysis
const deleteAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        // Verify ownership
        const [analysis] = await pool.execute(
            'SELECT * FROM analysis_results WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (analysis.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found or not authorized'
            });
        }
        
        // Delete clusters first (foreign key constraint)
        await pool.execute(
            'DELETE FROM expense_clusters WHERE analysis_id = ?',
            [id]
        );
        
        // Delete analysis
        await pool.execute(
            'DELETE FROM analysis_results WHERE id = ?',
            [id]
        );
        
        res.json({
            success: true,
            message: 'Analysis deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete analysis'
        });
    }
};

// Get analysis details
const getAnalysisDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        console.log(`🔍 Fetching analysis details for ID: ${id}`);
        
        // Get analysis metadata
        const [analyses] = await pool.execute(
            `SELECT * FROM analysis_results 
             WHERE id = ? AND user_id = ?`,
            [id, userId]
        );
        
        if (analyses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }
        
        const analysis = analyses[0];
        
        // Parse insights
        let insights = {};
        if (analysis.insights_json) {
            try {
                insights = JSON.parse(analysis.insights_json);
            } catch (e) {
                console.error('Failed to parse insights JSON:', e);
            }
        }
        
        // Get cluster details
        const [clusters] = await pool.execute(
            `SELECT ec.*, e.title, e.amount, e.category, e.expense_date, 
                    e.description, e.payment_method
             FROM expense_clusters ec
             JOIN expenses e ON ec.expense_id = e.id
             WHERE ec.analysis_id = ?
             ORDER BY ec.cluster_id, ec.distance_to_center`,
            [id]
        );
        
        // Group by cluster
        const groupedClusters = {};
        clusters.forEach(expense => {
            if (!groupedClusters[expense.cluster_id]) {
                groupedClusters[expense.cluster_id] = {
                    id: expense.cluster_id,
                    label: expense.cluster_label || `Cluster ${expense.cluster_id}`,
                    expenses: [],
                    totalAmount: 0,
                    averageAmount: 0
                };
            }
            
            groupedClusters[expense.cluster_id].expenses.push({
                id: expense.expense_id,
                title: expense.title,
                amount: expense.amount,
                category: expense.category,
                date: expense.expense_date,
                description: expense.description,
                paymentMethod: expense.payment_method,
                distanceToCenter: expense.distance_to_center
            });
            
            groupedClusters[expense.cluster_id].totalAmount += parseFloat(expense.amount);
        });
        
        // Calculate averages
        Object.values(groupedClusters).forEach(cluster => {
            cluster.averageAmount = cluster.totalAmount / cluster.expenses.length;
            cluster.size = cluster.expenses.length;
            cluster.color = getClusterColor(cluster.id);
        });
        
        res.json({
            success: true,
            analysis: {
                id: analysis.id,
                analysisDate: analysis.analysis_date,
                clusterCount: analysis.cluster_count,
                algorithmVersion: analysis.algorithm_version,
                insights,
                clusters: Object.values(groupedClusters),
                statistics: {
                    totalExpenses: clusters.length,
                    totalAmount: clusters.reduce((sum, e) => sum + parseFloat(e.amount), 0),
                    averageDistance: clusters.reduce((sum, e) => sum + parseFloat(e.distance_to_center), 0) / clusters.length
                }
            }
        });
    } catch (error) {
        console.error('❌ Get analysis details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analysis details',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper functions
function prepareDataForClustering(expenses, features) {
    if (!expenses || expenses.length === 0) {
        return { featureVectors: [], normalization: {}, expenses: [] };
    }
    
    const normalization = {
        minAmount: Infinity,
        maxAmount: -Infinity,
        categories: {},
        minDate: Infinity,
        maxDate: -Infinity,
        categoryMapping: {
            'Food & Dining': 1,
            'Transportation': 2,
            'Shopping': 3,
            'Bills & Utilities': 4,
            'Entertainment': 5,
            'Healthcare': 6,
            'Education': 7,
            'Groceries': 8,
            'Travel': 9,
            'Personal Care': 10,
            'Savings': 11,
            'Investment': 12,
            'Gifts & Donations': 13,
            'Other': 14
        }
    };
    
    // First pass: collect normalization data
    expenses.forEach(expense => {
        const amount = parseFloat(expense.amount) || 0;
        const date = new Date(expense.expense_date).getTime();
        const category = expense.category || 'Other';
        
        // Update amount range
        normalization.minAmount = Math.min(normalization.minAmount, amount);
        normalization.maxAmount = Math.max(normalization.maxAmount, amount);
        
        // Update date range
        normalization.minDate = Math.min(normalization.minDate, date);
        normalization.maxDate = Math.max(normalization.maxDate, date);
        
        // Track categories
        if (!normalization.categories[category]) {
            normalization.categories[category] = Object.keys(normalization.categories).length + 1;
        }
    });
    
    // Ensure non-zero ranges
    if (normalization.maxAmount === normalization.minAmount) {
        normalization.maxAmount = normalization.minAmount + 1;
    }
    if (normalization.maxDate === normalization.minDate) {
        normalization.maxDate = normalization.minDate + 86400000; // Add 1 day
    }
    
    // Second pass: create feature vectors
    const featureVectors = [];
    
    expenses.forEach((expense, index) => {
        const vector = [];
        
        // Add features based on requested features
        features.forEach(feature => {
            switch(feature) {
                case 'amount':
                    // Normalize amount to 0-1 range
                    const amount = parseFloat(expense.amount) || 0;
                    const normalizedAmount = (amount - normalization.minAmount) / 
                                           (normalization.maxAmount - normalization.minAmount);
                    vector.push(normalizedAmount);
                    break;
                    
                case 'category':
                    // Encode category as numeric value
                    const category = expense.category || 'Other';
                    const categoryId = normalization.categoryMapping[category] || 14;
                    const normalizedCategory = categoryId / 14; // Normalize to 0-1
                    vector.push(normalizedCategory);
                    break;
                    
                case 'date':
                    // Normalize date to 0-1 range
                    const date = new Date(expense.expense_date).getTime();
                    const normalizedDate = (date - normalization.minDate) / 
                                         (normalization.maxDate - normalization.minDate);
                    vector.push(normalizedDate);
                    break;
                    
                case 'log_amount':
                    // Logarithm of amount for better distribution
                    const logAmount = Math.log1p(parseFloat(expense.amount) || 0);
                    vector.push(logAmount);
                    break;
                    
                default:
                    // Default to amount if feature not recognized
                    const defaultAmount = parseFloat(expense.amount) || 0;
                    const normalizedDefaultAmount = (defaultAmount - normalization.minAmount) / 
                                                  (normalization.maxAmount - normalization.minAmount);
                    vector.push(normalizedDefaultAmount);
            }
        });
        
        featureVectors.push(vector);
    });
    
    console.log(`✅ Prepared ${featureVectors.length} feature vectors with ${features.length} features each`);
    
    return {
        featureVectors,
        normalization,
        expenses
    };
}

async function findOptimalK(featureVectors) {
    try {
        if (featureVectors.length < 3) {
            return 2;
        }
        
        const maxK = Math.min(6, Math.floor(featureVectors.length / 3));
        const inertias = [];
        
        console.log(`Finding optimal K from 2 to ${maxK}`);
        
        // Test different K values
        for (let k = 2; k <= maxK; k++) {
            try {
                const kmeans = new KMeans(k, 100);
                const result = kmeans.fit([...featureVectors]);
                
                inertias.push({
                    k: k,
                    inertia: result.inertia || 0,
                    clusters: result.clusters?.length || 0
                });
                
                console.log(`  K=${k}, inertia=${(result.inertia || 0).toFixed(2)}`);
            } catch (error) {
                console.log(`  K=${k} failed: ${error.message}`);
                inertias.push({ k, inertia: Infinity });
            }
        }
        
        // Find elbow point
        if (inertias.length >= 2) {
            // Calculate reduction rates
            const reductions = [];
            for (let i = 1; i < inertias.length; i++) {
                const reduction = inertias[i-1].inertia - inertias[i].inertia;
                reductions.push({
                    k: inertias[i].k,
                    reduction: reduction,
                    reductionRate: inertias[i-1].inertia > 0 ? reduction / inertias[i-1].inertia : 0
                });
            }
            
            // Find significant drop in reduction rate
            let optimalK = 3; // Default
            let maxDrop = 0;
            
            for (let i = 0; i < reductions.length - 1; i++) {
                const drop = reductions[i].reductionRate - reductions[i+1].reductionRate;
                if (drop > maxDrop && drop > 0.1) { // 10% minimum drop
                    maxDrop = drop;
                    optimalK = reductions[i].k;
                }
            }
            
            console.log(`Elbow method selected K=${optimalK} (drop: ${(maxDrop*100).toFixed(1)}%)`);
            return optimalK;
        }
        
        return 3; // Default if can't determine
    } catch (error) {
        console.error('Error finding optimal K:', error);
        return 3; // Default fallback
    }
}

function processClusteringResults(expenses, clusters, centroids, normalization) {
    const clusteredExpenses = [];
    
    // Map each point to its cluster
    clusters.forEach((clusterPoints, clusterIndex) => {
        clusterPoints.forEach((point, pointIndex) => {
            // Find the corresponding expense
            if (pointIndex < expenses.length) {
                const expense = expenses[pointIndex];
                
                // Calculate distance to centroid
                let distanceToCenter = 0;
                if (centroids[clusterIndex]) {
                    distanceToCenter = KMeans.distance(point, centroids[clusterIndex]);
                }
                
                // Generate cluster label
                const clusterLabel = generateClusterLabel(expense, clusterIndex, clusters.length);
                
                clusteredExpenses.push({
                    id: expense.id,
                    title: expense.title,
                    amount: expense.amount,
                    category: expense.category,
                    date: expense.expense_date,
                    clusterId: clusterIndex + 1, // Start from 1
                    clusterLabel: clusterLabel,
                    distanceToCenter: distanceToCenter,
                    originalIndex: pointIndex
                });
            }
        });
    });
    
    console.log(`✅ Processed ${clusteredExpenses.length} expenses into ${clusters.length} clusters`);
    return clusteredExpenses;
}

function generateClusterLabel(expense, clusterIndex, totalClusters) {
    const amount = parseFloat(expense.amount) || 0;
    const category = expense.category || 'Other';
    
    // Determine cluster type based on amount
    let label;
    if (amount > 5000) {
        label = 'Premium Expenses';
    } else if (amount > 2000) {
        label = 'High-Value Purchases';
    } else if (amount > 1000) {
        label = 'Regular Expenses';
    } else if (amount > 500) {
        label = 'Daily Essentials';
    } else {
        label = 'Small Expenses';
    }
    
    // Add category if it's dominant
    if (category && category !== 'Other') {
        label += ` (${category})`;
    }
    
    return label;
}

function generateClusteringInsights(clusteredExpenses, centroids) {
    const insights = {
        totalClusters: new Set(clusteredExpenses.map(e => e.clusterId)).size,
        totalExpenses: clusteredExpenses.length,
        clusterStats: {},
        patterns: [],
        recommendations: []
    };
    
    // Group by cluster
    const clusters = {};
    clusteredExpenses.forEach(expense => {
        if (!clusters[expense.clusterId]) {
            clusters[expense.clusterId] = {
                label: expense.clusterLabel,
                expenses: [],
                totalAmount: 0,
                count: 0
            };
        }
        clusters[expense.clusterId].expenses.push(expense);
        clusters[expense.clusterId].totalAmount += parseFloat(expense.amount) || 0;
        clusters[expense.clusterId].count++;
    });
    
    // Calculate cluster statistics
    Object.keys(clusters).forEach(clusterId => {
        const cluster = clusters[clusterId];
        cluster.averageAmount = cluster.totalAmount / cluster.count;
        cluster.percentage = (cluster.totalAmount / 
            Object.values(clusters).reduce((sum, c) => sum + c.totalAmount, 0)) * 100;
        
        insights.clusterStats[clusterId] = cluster;
    });
    
    // Generate patterns
    // Pattern 1: High spending clusters
    Object.keys(clusters).forEach(clusterId => {
        const cluster = clusters[clusterId];
        if (cluster.averageAmount > 3000 && cluster.count > 2) {
            insights.patterns.push({
                type: 'HIGH_SPENDING_CLUSTER',
                clusterId: clusterId,
                description: `High spending cluster (${cluster.label}) with average Rs ${cluster.averageAmount.toFixed(2)}`,
                impact: 'HIGH',
                confidence: '85%'
            });
        }
    });
    
    // Pattern 2: Frequent small purchases
    Object.keys(clusters).forEach(clusterId => {
        const cluster = clusters[clusterId];
        if (cluster.averageAmount < 500 && cluster.count > 5) {
            insights.patterns.push({
                type: 'FREQUENT_SMALL_PURCHASES',
                clusterId: clusterId,
                description: `Frequent small purchases (${cluster.count} items, avg Rs ${cluster.averageAmount.toFixed(2)})`,
                impact: 'MEDIUM',
                confidence: '75%'
            });
        }
    });
    
    // Generate recommendations
    if (insights.patterns.length > 0) {
        insights.recommendations.push({
            title: 'Review High Spending Clusters',
            description: 'Consider reducing expenses in high-spending categories',
            priority: 'HIGH',
            action: 'Review expenses in high-value clusters'
        });
    }
    
    if (Object.keys(clusters).length > 4) {
        insights.recommendations.push({
            title: 'Simplify Expense Categories',
            description: 'Too many clusters detected. Consider consolidating similar expenses',
            priority: 'MEDIUM',
            action: 'Review and merge similar expense categories'
        });
    }
    
    return insights;
}

// FIXED: Remove 'status' column from the query
async function saveAnalysisToDB(userId, clusterCount, insights, algorithmVersion) {
    try {
        const [result] = await pool.execute(
            `INSERT INTO analysis_results 
            (user_id, cluster_count, insights_json, algorithm_version) 
            VALUES (?, ?, ?, ?)`,
            [userId, clusterCount, JSON.stringify(insights), algorithmVersion]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error saving analysis to DB:', error);
        throw error;
    }
}

async function saveClustersToDB(analysisId, clusteredExpenses) {
    try {
        const batchSize = 50;
        for (let i = 0; i < clusteredExpenses.length; i += batchSize) {
            const batch = clusteredExpenses.slice(i, i + batchSize);
            const promises = batch.map(expense => 
                pool.execute(
                    `INSERT INTO expense_clusters 
                    (analysis_id, expense_id, cluster_id, cluster_label, distance_to_center) 
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        analysisId, 
                        expense.id, 
                        expense.clusterId, 
                        expense.clusterLabel, 
                        expense.distanceToCenter || 0
                    ]
                )
            );
            await Promise.all(promises);
        }
        console.log(`✅ Saved ${clusteredExpenses.length} clustered expenses to database`);
    } catch (error) {
        console.error('Error saving clusters to DB:', error);
        throw error;
    }
}

function prepareResponseData(clusteredExpenses, result, insights, analysisId) {
    // Group expenses by cluster for response
    const clusters = {};
    clusteredExpenses.forEach(expense => {
        if (!clusters[expense.clusterId]) {
            clusters[expense.clusterId] = {
                id: expense.clusterId,
                label: expense.clusterLabel,
                expenses: [],
                totalAmount: 0,
                count: 0
            };
        }
        clusters[expense.clusterId].expenses.push({
            id: expense.id,
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            date: expense.date
        });
        clusters[expense.clusterId].totalAmount += parseFloat(expense.amount) || 0;
        clusters[expense.clusterId].count++;
    });
    
    // Calculate statistics
    Object.values(clusters).forEach(cluster => {
        cluster.averageAmount = cluster.totalAmount / cluster.count;
    });
    
    return {
        analysisId: analysisId,
        clusters: Object.values(clusters),
        centroids: result.centroids,
        algorithmMetrics: {
            inertia: result.inertia,
            iterations: result.iterations,
            k: result.k
        },
        insights: insights,
        statistics: {
            totalExpenses: clusteredExpenses.length,
            totalClusters: Object.keys(clusters).length,
            totalAmount: Object.values(clusters).reduce((sum, c) => sum + c.totalAmount, 0)
        }
    };
}

function getClusterColor(clusterId) {
    const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
        '#EF4444', '#EC4899', '#14B8A6', '#F97316'
    ];
    return colors[(clusterId - 1) % colors.length] || '#6B7280';
}

module.exports = {
    runClustering,
    getAnalyses,
    getSpendingInsights,
    getVisualizationData,
    deleteAnalysis,
    getAnalysisDetails
};