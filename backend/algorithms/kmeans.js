class KMeans {
  constructor(k = 3, maxIterations = 100) {
    this.k = k;
    this.maxIterations = maxIterations;
    this.centroids = [];
    this.clusters = [];
    this.inertia = 0;
  }

  // Initialize centroids randomly
  initializeCentroids(data) {
    const centroids = [];
    const indices = new Set();
    
    while (indices.size < this.k) {
      const randomIndex = Math.floor(Math.random() * data.length);
      if (!indices.has(randomIndex)) {
        indices.add(randomIndex);
        centroids.push([...data[randomIndex]]);
      }
    }
    
    return centroids;
  }

  // Calculate Euclidean distance
  euclideanDistance(point1, point2) {
    let sum = 0;
    for (let i = 0; i < point1.length; i++) {
      sum += Math.pow(point1[i] - point2[i], 2);
    }
    return Math.sqrt(sum);
  }

  // Assign points to nearest centroid
  assignClusters(data, centroids) {
    const clusters = Array(this.k).fill().map(() => []);
    const assignments = [];
    
    data.forEach(point => {
      let minDistance = Infinity;
      let clusterIndex = 0;
      
      centroids.forEach((centroid, index) => {
        const distance = this.euclideanDistance(point, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          clusterIndex = index;
        }
      });
      
      clusters[clusterIndex].push(point);
      assignments.push(clusterIndex);
    });
    
    return { clusters, assignments };
  }

  // Update centroids based on cluster means
  updateCentroids(clusters) {
    const newCentroids = [];
    
    clusters.forEach(cluster => {
      if (cluster.length === 0) {
        // If cluster is empty, keep old centroid
        newCentroids.push(this.centroids[newCentroids.length]);
        return;
      }
      
      const dimension = cluster[0].length;
      const centroid = Array(dimension).fill(0);
      
      // Sum all points
      cluster.forEach(point => {
        point.forEach((value, index) => {
          centroid[index] += value;
        });
      });
      
      // Calculate mean
      centroid.forEach((sum, index) => {
        centroid[index] = sum / cluster.length;
      });
      
      newCentroids.push(centroid);
    });
    
    return newCentroids;
  }

  // Calculate inertia (within-cluster sum of squares)
  calculateInertia(data, assignments, centroids) {
    let inertia = 0;
    
    data.forEach((point, index) => {
      const clusterIndex = assignments[index];
      const centroid = centroids[clusterIndex];
      const distance = this.euclideanDistance(point, centroid);
      inertia += distance * distance;
    });
    
    return inertia;
  }

  // Check if centroids have converged
  hasConverged(oldCentroids, newCentroids, tolerance = 0.0001) {
    for (let i = 0; i < oldCentroids.length; i++) {
      const distance = this.euclideanDistance(oldCentroids[i], newCentroids[i]);
      if (distance > tolerance) {
        return false;
      }
    }
    return true;
  }

  // Main K-Means algorithm
  fit(data) {
    // Normalize data
    const normalizedData = this.normalizeData(data);
    
    // Initialize centroids
    this.centroids = this.initializeCentroids(normalizedData);
    
    let iterations = 0;
    let converged = false;
    
    while (!converged && iterations < this.maxIterations) {
      // Assign points to clusters
      const { clusters, assignments } = this.assignClusters(normalizedData, this.centroids);
      this.clusters = clusters;
      
      // Update centroids
      const newCentroids = this.updateCentroids(clusters);
      
      // Check convergence
      converged = this.hasConverged(this.centroids, newCentroids);
      
      // Update centroids
      this.centroids = newCentroids;
      iterations++;
    }
    
    // Calculate final inertia
    const { assignments } = this.assignClusters(normalizedData, this.centroids);
    this.inertia = this.calculateInertia(normalizedData, assignments, this.centroids);
    
    return {
      clusters: this.clusters,
      centroids: this.centroids,
      assignments,
      inertia: this.inertia,
      iterations
    };
  }

  // Normalize data (min-max scaling)
  normalizeData(data) {
    if (data.length === 0) return data;
    
    const normalized = [];
    const dimensions = data[0].length;
    const mins = Array(dimensions).fill(Infinity);
    const maxs = Array(dimensions).fill(-Infinity);
    
    // Find min and max for each dimension
    data.forEach(point => {
      point.forEach((value, dim) => {
        if (value < mins[dim]) mins[dim] = value;
        if (value > maxs[dim]) maxs[dim] = value;
      });
    });
    
    // Normalize each point
    data.forEach(point => {
      const normalizedPoint = [];
      point.forEach((value, dim) => {
        const range = maxs[dim] - mins[dim];
        const normalizedValue = range === 0 ? 0.5 : (value - mins[dim]) / range;
        normalizedPoint.push(normalizedValue);
      });
      normalized.push(normalizedPoint);
    });
    
    return normalized;
  }

  // Find optimal K using elbow method
  static findOptimalK(data, maxK = 10) {
    const inertias = [];
    
    for (let k = 1; k <= maxK; k++) {
      const kmeans = new KMeans(k);
      const result = kmeans.fit(data);
      inertias.push({
        k,
        inertia: result.inertia
      });
    }
    
    // Find elbow point (where inertia decrease slows down)
    let elbowPoint = 1;
    let maxDiff = 0;
    
    for (let i = 1; i < inertias.length - 1; i++) {
      const diff = inertias[i-1].inertia - inertias[i].inertia;
      if (diff > maxDiff) {
        maxDiff = diff;
        elbowPoint = inertias[i].k;
      }
    }
    
    return {
      optimalK: elbowPoint,
      inertias
    };
  }

  // Prepare expense data for clustering
  static prepareExpenseData(expenses) {
    return expenses.map(expense => {
      // Features: amount, category (encoded), day of month
      const categoryMap = {
        'Food & Dining': 0,
        'Transportation': 1,
        'Shopping': 2,
        'Bills & Utilities': 3,
        'Entertainment': 4,
        'Healthcare': 5,
        'Education': 6,
        'Groceries': 7,
        'Travel': 8,
        'Personal Care': 9,
        'Other': 10
      };
      
      const date = new Date(expense.expense_date);
      const dayOfMonth = date.getDate();
      const categoryCode = categoryMap[expense.category] || 10;
      
      return [
        expense.amount / 1000, // Normalize amount
        categoryCode / 10, // Normalize category
        dayOfMonth / 31 // Normalize day
      ];
    });
  }

  // Generate insights from clusters
  static generateInsights(expenses, clusters, assignments) {
    const insights = [];
    const clusterStats = {};
    
    // Calculate statistics for each cluster
    clusters.forEach((cluster, clusterIndex) => {
      const clusterExpenses = expenses.filter((_, index) => assignments[index] === clusterIndex);
      
      if (clusterExpenses.length > 0) {
        const totalAmount = clusterExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const avgAmount = totalAmount / clusterExpenses.length;
        const categories = clusterExpenses.reduce((acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + 1;
          return acc;
        }, {});
        
        const dominantCategory = Object.entries(categories)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
        
        clusterStats[clusterIndex] = {
          count: clusterExpenses.length,
          totalAmount,
          avgAmount,
          dominantCategory,
          expenses: clusterExpenses
        };
      }
    });
    
    // Generate insights
    Object.entries(clusterStats).forEach(([clusterIndex, stats]) => {
      if (stats.count > 5) { // Only generate insights for significant clusters
        if (stats.avgAmount > 3000) {
          insights.push({
            title: 'High-Value Spending Cluster',
            description: `You have ${stats.count} expenses averaging Rs ${stats.avgAmount.toFixed(2)} in ${stats.dominantCategory}. Consider if these are essential.`,
            cluster: parseInt(clusterIndex),
            severity: 'high'
          });
        }
        
        if (stats.dominantCategory === 'Shopping' && stats.count > 10) {
          insights.push({
            title: 'Frequent Shopping Pattern',
            description: `You have ${stats.count} shopping expenses. Consider setting a monthly shopping budget.`,
            cluster: parseInt(clusterIndex),
            severity: 'medium'
          });
        }
      }
    });
    
    return insights;
  }
}

module.exports = KMeans;