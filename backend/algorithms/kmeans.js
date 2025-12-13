// backend/algorithms/kmeans.js
class KMeans {
    constructor(k = 3, maxIterations = 300, tolerance = 0.0001) {
        this.k = k;
        this.maxIterations = maxIterations;
        this.tolerance = tolerance;
        this.centroids = [];
        this.clusters = [];
        this.inertia = 0;
        this.iterations = 0;
    }

    // Calculate Euclidean distance between two points (arrays)
    static distance(point1, point2) {
        if (!point1 || !point2) return Infinity;
        
        const arr1 = Array.isArray(point1) ? point1 : Object.values(point1);
        const arr2 = Array.isArray(point2) ? point2 : Object.values(point2);
        
        let sum = 0;
        const length = Math.min(arr1.length, arr2.length);
        
        for (let i = 0; i < length; i++) {
            const diff = (arr1[i] || 0) - (arr2[i] || 0);
            sum += diff * diff;
        }
        
        return Math.sqrt(sum);
    }

    // Initialize centroids using K-Means++ (better than random)
    initializeCentroids(points) {
        this.centroids = [];
        
        if (points.length === 0) return this.centroids;
        
        // 1. Choose first centroid randomly
        const firstIdx = Math.floor(Math.random() * points.length);
        this.centroids.push([...points[firstIdx]]);
        
        // 2. Choose remaining centroids using probability distribution
        for (let i = 1; i < this.k; i++) {
            const distances = points.map(point => {
                // Find minimum distance to existing centroids
                let minDist = Infinity;
                for (let j = 0; j < this.centroids.length; j++) {
                    const dist = KMeans.distance(point, this.centroids[j]);
                    if (dist < minDist) minDist = dist;
                }
                return minDist * minDist; // Square for probability
            });
            
            // Calculate probabilities
            const totalDistance = distances.reduce((a, b) => a + b, 0);
            const probabilities = distances.map(d => d / totalDistance);
            
            // Choose next centroid based on probabilities
            let rand = Math.random();
            let sum = 0;
            let chosenIdx = 0;
            
            for (let j = 0; j < probabilities.length; j++) {
                sum += probabilities[j];
                if (rand <= sum) {
                    chosenIdx = j;
                    break;
                }
            }
            
            this.centroids.push([...points[chosenIdx]]);
        }
        
        return this.centroids;
    }

    // Assign points to nearest centroid
    assignPointsToClusters(points) {
        const clusters = Array(this.k).fill().map(() => []);
        const labels = new Array(points.length);
        
        points.forEach((point, pointIdx) => {
            let minDistance = Infinity;
            let clusterIdx = 0;
            
            // Find nearest centroid
            for (let i = 0; i < this.centroids.length; i++) {
                const distance = KMeans.distance(point, this.centroids[i]);
                if (distance < minDistance) {
                    minDistance = distance;
                    clusterIdx = i;
                }
            }
            
            clusters[clusterIdx].push(point);
            labels[pointIdx] = clusterIdx;
        });
        
        return { clusters, labels };
    }

    // Update centroids to be mean of assigned points
    updateCentroids(clusters) {
        const newCentroids = [];
        
        clusters.forEach((cluster, idx) => {
            if (cluster.length === 0) {
                // If cluster is empty, keep old centroid
                newCentroids.push(this.centroids[idx]);
                return;
            }
            
            // Calculate mean for each dimension
            const dimensions = cluster[0].length;
            const newCentroid = new Array(dimensions).fill(0);
            
            // Sum all points
            cluster.forEach(point => {
                for (let d = 0; d < dimensions; d++) {
                    newCentroid[d] += point[d] || 0;
                }
            });
            
            // Divide by number of points
            for (let d = 0; d < dimensions; d++) {
                newCentroid[d] /= cluster.length;
            }
            
            newCentroids.push(newCentroid);
        });
        
        return newCentroids;
    }

    // Check if centroids have converged
    hasConverged(oldCentroids, newCentroids) {
        if (!oldCentroids || oldCentroids.length === 0) return false;
        
        for (let i = 0; i < oldCentroids.length; i++) {
            const distance = KMeans.distance(oldCentroids[i], newCentroids[i]);
            if (distance > this.tolerance) {
                return false;
            }
        }
        
        return true;
    }

    // Calculate within-cluster sum of squares (inertia)
    calculateInertia(clusters, centroids) {
        let inertia = 0;
        
        clusters.forEach((cluster, idx) => {
            const centroid = centroids[idx];
            cluster.forEach(point => {
                const distance = KMeans.distance(point, centroid);
                inertia += distance * distance;
            });
        });
        
        return inertia;
    }

    // Main K-Means algorithm
    fit(points) {
        if (points.length === 0) {
            throw new Error("No points provided for clustering");
        }
        
        if (this.k > points.length) {
            this.k = Math.max(2, Math.floor(points.length / 2));
            console.log(`Adjusted K to ${this.k} (too few points)`);
        }
        
        console.log(`Running K-Means with k=${this.k} on ${points.length} points`);
        
        // 1. Initialize centroids
        this.centroids = this.initializeCentroids(points);
        
        // 2. Run iterations
        for (this.iterations = 0; this.iterations < this.maxIterations; this.iterations++) {
            // 3. Assign points to clusters
            const { clusters, labels } = this.assignPointsToClusters(points);
            this.clusters = clusters;
            
            // 4. Calculate new centroids
            const newCentroids = this.updateCentroids(clusters);
            
            // 5. Check convergence
            if (this.hasConverged(this.centroids, newCentroids)) {
                console.log(`Converged after ${this.iterations + 1} iterations`);
                break;
            }
            
            this.centroids = newCentroids;
        }
        
        // Calculate final inertia
        this.inertia = this.calculateInertia(this.clusters, this.centroids);
        
        console.log(`K-Means completed: ${this.iterations} iterations, inertia=${this.inertia.toFixed(4)}`);
        
        return {
            clusters: this.clusters,
            centroids: this.centroids,
            inertia: this.inertia,
            iterations: this.iterations,
            k: this.k
        };
    }

    // Predict cluster for new points
    predict(points) {
        if (this.centroids.length === 0) {
            throw new Error("Model not fitted yet");
        }
        
        return points.map(point => {
            let minDistance = Infinity;
            let clusterIdx = 0;
            
            this.centroids.forEach((centroid, idx) => {
                const distance = KMeans.distance(point, centroid);
                if (distance < minDistance) {
                    minDistance = distance;
                    clusterIdx = idx;
                }
            });
            
            return {
                cluster: clusterIdx,
                distance: minDistance,
                centroid: this.centroids[clusterIdx]
            };
        });
    }

    // Static method to find optimal K using elbow method
    static findOptimalK(points, maxK = 8) {
        if (points.length < 3) {
            return { optimalK: 2, inertias: [] };
        }
        
        const actualMaxK = Math.min(maxK, Math.floor(points.length / 3));
        const inertias = [];
        
        console.log(`Finding optimal K from 2 to ${actualMaxK}`);
        
        for (let k = 2; k <= actualMaxK; k++) {
            try {
                const kmeans = new KMeans(k, 100);
                const result = kmeans.fit(points);
                
                inertias.push({
                    k,
                    inertia: result.inertia,
                    centroids: result.centroids,
                    iterations: result.iterations
                });
                
                console.log(`  K=${k}, inertia=${result.inertia.toFixed(2)}`);
                
            } catch (error) {
                console.log(`  K=${k} failed:`, error.message);
                inertias.push({ k, inertia: Infinity });
            }
        }
        
        // Find elbow point (where inertia reduction slows significantly)
        let optimalK = 3; // Default
        
        if (inertias.length >= 3) {
            const reductions = [];
            
            for (let i = 1; i < inertias.length; i++) {
                const reduction = inertias[i-1].inertia - inertias[i].inertia;
                const percentage = inertias[i-1].inertia > 0 ? 
                    (reduction / inertias[i-1].inertia) * 100 : 0;
                reductions.push({
                    k: inertias[i].k,
                    reduction,
                    percentage
                });
            }
            
            // Find point where percentage reduction drops significantly
            let maxDrop = 0;
            for (let i = 0; i < reductions.length - 1; i++) {
                const drop = reductions[i].percentage - reductions[i + 1].percentage;
                if (drop > maxDrop && drop > 10) { // Minimum 10% drop
                    maxDrop = drop;
                    optimalK = reductions[i].k;
                }
            }
            
            console.log(`Optimal K found: ${optimalK} (max drop: ${maxDrop.toFixed(1)}%)`);
        }
        
        return {
            optimalK,
            inertias,
            explanation: `Elbow method selected K=${optimalK}`
        };
    }

    // Calculate silhouette score for cluster quality
    static silhouetteScore(points, labels, centroids) {
        if (points.length < 2) return 0;
        
        const clusters = {};
        points.forEach((point, idx) => {
            const label = labels[idx];
            if (!clusters[label]) clusters[label] = [];
            clusters[label].push(point);
        });
        
        let totalScore = 0;
        
        points.forEach((point, idx) => {
            const clusterLabel = labels[idx];
            const sameCluster = clusters[clusterLabel];
            
            if (sameCluster.length <= 1) {
                totalScore += 0;
                return;
            }
            
            // Calculate a(i): average distance to points in same cluster
            let a = 0;
            sameCluster.forEach(otherPoint => {
                if (otherPoint !== point) {
                    a += KMeans.distance(point, otherPoint);
                }
            });
            a /= (sameCluster.length - 1);
            
            // Calculate b(i): minimum average distance to other clusters
            let b = Infinity;
            Object.keys(clusters).forEach(label => {
                if (parseInt(label) !== clusterLabel) {
                    const otherCluster = clusters[label];
                    if (otherCluster.length > 0) {
                        let avgDist = 0;
                        otherCluster.forEach(otherPoint => {
                            avgDist += KMeans.distance(point, otherPoint);
                        });
                        avgDist /= otherCluster.length;
                        b = Math.min(b, avgDist);
                    }
                }
            });
            
            if (b === Infinity) b = a;
            
            const s = (b - a) / Math.max(a, b);
            totalScore += s;
        });
        
        return totalScore / points.length;
    }

    // Generate cluster labels based on characteristics
    static generateClusterLabels(clustersData, originalExpenses) {
        const labels = [];
        
        clustersData.forEach((cluster, clusterId) => {
            if (cluster.length === 0) {
                labels[clusterId] = `Cluster ${clusterId + 1}`;
                return;
            }
            
            // Calculate average amount
            let totalAmount = 0;
            const categories = {};
            const dates = [];
            
            cluster.forEach((point, pointIdx) => {
                const expense = originalExpenses[pointIdx];
                if (expense) {
                    totalAmount += parseFloat(expense.amount) || 0;
                    categories[expense.category] = (categories[expense.category] || 0) + 1;
                    dates.push(new Date(expense.expense_date).getTime());
                }
            });
            
            const avgAmount = totalAmount / cluster.length;
            const mostCommonCategory = Object.entries(categories)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Various';
            
            // Assign label based on characteristics
            let label;
            if (avgAmount > 5000) {
                label = 'Premium Expenses';
            } else if (avgAmount > 2000) {
                label = 'High-Value Purchases';
            } else if (avgAmount > 1000) {
                label = 'Regular Expenses';
            } else if (avgAmount > 500) {
                label = 'Daily Essentials';
            } else {
                label = 'Small Expenses';
            }
            
            // Add category if it dominates
            const categoryCount = categories[mostCommonCategory] || 0;
            if (categoryCount > cluster.length * 0.6) {
                label += ` (${mostCommonCategory})`;
            }
            
            labels[clusterId] = label;
        });
        
        return labels;
    }
}

module.exports = KMeans;