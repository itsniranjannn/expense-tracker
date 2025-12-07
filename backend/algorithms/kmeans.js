class KMeans {
    constructor(k = 3, maxIterations = 100) {
        this.k = k; // Number of clusters
        this.maxIterations = maxIterations;
        this.centroids = [];
        this.clusters = [];
        this.history = [];
    }

    // Calculate Euclidean distance
    static distance(point1, point2) {
        return Math.sqrt(
            Math.pow(point1.amount - point2.amount, 2) +
            Math.pow(point1.days_since_start - point2.days_since_start, 2)
        );
    }

    // Initialize centroids randomly
    initializeCentroids(data) {
        const centroids = [];
        const usedIndices = new Set();

        while (centroids.length < this.k && centroids.length < data.length) {
            const randomIndex = Math.floor(Math.random() * data.length);
            if (!usedIndices.has(randomIndex)) {
                centroids.push({...data[randomIndex]});
                usedIndices.add(randomIndex);
            }
        }
        
        return centroids;
    }

    // Assign points to nearest centroid
    assignClusters(data, centroids) {
        const clusters = Array(this.k).fill().map(() => []);
        
        data.forEach(point => {
            let minDistance = Infinity;
            let clusterIndex = 0;
            
            centroids.forEach((centroid, index) => {
                const distance = KMeans.distance(point, centroid);
                if (distance < minDistance) {
                    minDistance = distance;
                    clusterIndex = index;
                }
            });
            
            clusters[clusterIndex].push({
                ...point,
                distance: minDistance
            });
        });
        
        return clusters;
    }

    // Calculate new centroids
    updateCentroids(clusters) {
        return clusters.map(cluster => {
            if (cluster.length === 0) {
                return null;
            }
            
            const sum = cluster.reduce((acc, point) => {
                return {
                    amount: acc.amount + point.amount,
                    days_since_start: acc.days_since_start + point.days_since_start
                };
            }, { amount: 0, days_since_start: 0 });
            
            return {
                amount: sum.amount / cluster.length,
                days_since_start: sum.days_since_start / cluster.length
            };
        }).filter(centroid => centroid !== null);
    }

    // Check if centroids have converged
    hasConverged(oldCentroids, newCentroids, threshold = 0.001) {
        if (oldCentroids.length !== newCentroids.length) return false;
        
        for (let i = 0; i < oldCentroids.length; i++) {
            const distance = KMeans.distance(oldCentroids[i], newCentroids[i]);
            if (distance > threshold) return false;
        }
        
        return true;
    }

    // Main clustering algorithm
    fit(data) {
        // Prepare data: normalize and add features
        const preparedData = this.prepareData(data);
        
        // Initialize centroids
        this.centroids = this.initializeCentroids(preparedData);
        
        // Iterate until convergence or max iterations
        for (let iteration = 0; iteration < this.maxIterations; iteration++) {
            // Assign clusters
            this.clusters = this.assignClusters(preparedData, this.centroids);
            
            // Store history for visualization
            this.history.push({
                iteration,
                centroids: [...this.centroids],
                clusters: this.clusters.map(cluster => [...cluster])
            });
            
            // Calculate new centroids
            const newCentroids = this.updateCentroids(this.clusters);
            
            // Check convergence
            if (this.hasConverged(this.centroids, newCentroids)) {
                this.centroids = newCentroids;
                break;
            }
            
            this.centroids = newCentroids;
        }
        
        return {
            centroids: this.centroids,
            clusters: this.clusters,
            history: this.history,
            iterations: this.history.length
        };
    }

    // Prepare expense data for clustering
    prepareData(expenses) {
        if (expenses.length === 0) return [];
        
        // Find date range
        const dates = expenses.map(e => new Date(e.expense_date));
        const minDate = new Date(Math.min(...dates));
        
        // Normalize data
        const amounts = expenses.map(e => e.amount);
        const maxAmount = Math.max(...amounts);
        const minAmount = Math.min(...amounts);
        
        return expenses.map(expense => {
            const expenseDate = new Date(expense.expense_date);
            const daysSinceStart = Math.floor((expenseDate - minDate) / (1000 * 60 * 60 * 24));
            
            // Normalize amount (0-1 scale)
            const normalizedAmount = (expense.amount - minAmount) / (maxAmount - minAmount || 1);
            
            return {
                id: expense.id,
                amount: expense.amount,
                normalizedAmount,
                days_since_start: daysSinceStart,
                normalizedDays: daysSinceStart / 30, // Normalize to months
                category: expense.category,
                title: expense.title,
                date: expense.expense_date
            };
        });
    }

    // Generate insights from clusters
    generateInsights(expenses, clusters) {
        const insights = {
            totalClusters: clusters.length,
            clusterDetails: [],
            spendingPatterns: [],
            recommendations: []
        };
        
        clusters.forEach((cluster, index) => {
            if (cluster.length === 0) return;
            
            const clusterAmounts = cluster.map(p => p.amount);
            const totalAmount = clusterAmounts.reduce((a, b) => a + b, 0);
            const avgAmount = totalAmount / cluster.length;
            const maxAmount = Math.max(...clusterAmounts);
            const minAmount = Math.min(...clusterAmounts);
            
            const categories = cluster.map(p => p.category);
            const categoryCounts = {};
            categories.forEach(cat => {
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
            
            const mostCommonCategory = Object.keys(categoryCounts).reduce((a, b) => 
                categoryCounts[a] > categoryCounts[b] ? a : b
            );
            
            const clusterDetail = {
                clusterId: index + 1,
                size: cluster.length,
                averageAmount: avgAmount,
                totalAmount,
                minAmount,
                maxAmount,
                mostCommonCategory,
                categoryDistribution: categoryCounts,
                examples: cluster.slice(0, 3).map(p => ({
                    title: p.title,
                    amount: p.amount,
                    category: p.category
                }))
            };
            
            insights.clusterDetails.push(clusterDetail);
            
            // Identify patterns
            if (avgAmount > 1000 && cluster.length > 3) {
                insights.spendingPatterns.push(
                    `Cluster ${index + 1}: High-value expenses (avg ₹${avgAmount.toFixed(2)}) in ${mostCommonCategory}`
                );
            } else if (avgAmount < 500 && cluster.length > 5) {
                insights.spendingPatterns.push(
                    `Cluster ${index + 1}: Frequent small expenses in ${mostCommonCategory}`
                );
            }
        });
        
        // Generate recommendations
        if (insights.clusterDetails.some(c => c.averageAmount > 2000)) {
            insights.recommendations.push(
                "Consider reducing high-value expenses by looking for alternatives or discounts"
            );
        }
        
        if (insights.clusterDetails.some(c => c.size > 10 && c.averageAmount < 300)) {
            insights.recommendations.push(
                "Small frequent expenses add up. Consider setting a daily spending limit"
            );
        }
        
        const totalSpent = insights.clusterDetails.reduce((sum, c) => sum + c.totalAmount, 0);
        insights.summary = {
            totalExpenses: expenses.length,
            totalSpent,
            averagePerExpense: totalSpent / expenses.length
        };
        
        return insights;
    }

    // Find optimal K using elbow method
    static findOptimalK(data, maxK = 7) {
        const inertias = [];
        
        for (let k = 1; k <= maxK; k++) {
            const kmeans = new KMeans(k, 50);
            const result = kmeans.fit(data);
            
            // Calculate inertia (sum of squared distances)
            let inertia = 0;
            result.clusters.forEach((cluster, clusterIndex) => {
                cluster.forEach(point => {
                    const distance = KMeans.distance(point, result.centroids[clusterIndex]);
                    inertia += distance * distance;
                });
            });
            
            inertias.push({ k, inertia });
        }
        
        // Find elbow point (where the rate of decrease changes sharply)
        let optimalK = 3; // Default
        let maxDiff = 0;
        
        for (let i = 1; i < inertias.length - 1; i++) {
            const diff = inertias[i-1].inertia - inertias[i].inertia;
            const nextDiff = inertias[i].inertia - inertias[i+1].inertia;
            const diffRatio = nextDiff / diff;
            
            if (diffRatio < 0.5 && diff > maxDiff) {
                maxDiff = diff;
                optimalK = inertias[i].k;
            }
        }
        
        return {
            optimalK,
            inertias,
            recommendations: optimalK <= 2 ? 3 : optimalK
        };
    }
}

module.exports = KMeans;