const db = require('../config/database');

class Analysis {
    static async create({ user_id, cluster_count, insights_json, algorithm_version = 'kmeans-v1' }) {
        try {
            const [result] = await db.pool.execute(
                'INSERT INTO analysis_results (user_id, cluster_count, insights_json, algorithm_version) VALUES (?, ?, ?, ?)',
                [user_id, cluster_count, insights_json || '{}', algorithm_version]
            );
            
            // Get the created analysis
            const [rows] = await db.pool.execute(
                'SELECT * FROM analysis_results WHERE id = ?',
                [result.insertId]
            );
            
            return rows[0];
        } catch (error) {
            console.error('Error creating analysis:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.pool.execute(
                'SELECT * FROM analysis_results WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error('Error finding analysis by ID:', error);
            throw error;
        }
    }

    static async findByUser(userId) {
        try {
            const [rows] = await db.pool.execute(
                'SELECT * FROM analysis_results WHERE user_id = ? ORDER BY analysis_date DESC',
                [userId]
            );
            return rows;
        } catch (error) {
            console.error('Error finding analyses by user:', error);
            throw error;
        }
    }

    static async findLatestByUser(userId) {
        try {
            const [rows] = await db.pool.execute(
                'SELECT * FROM analysis_results WHERE user_id = ? ORDER BY analysis_date DESC LIMIT 1',
                [userId]
            );
            return rows[0];
        } catch (error) {
            console.error('Error finding latest analysis by user:', error);
            throw error;
        }
    }

    static async assignToCluster({ analysis_id, expense_id, cluster_id, cluster_label, distance_to_center }) {
        try {
            const [result] = await db.pool.execute(
                'INSERT INTO expense_clusters (analysis_id, expense_id, cluster_id, cluster_label, distance_to_center) VALUES (?, ?, ?, ?, ?)',
                [analysis_id, expense_id, cluster_id, cluster_label || `Cluster ${cluster_id}`, distance_to_center || 0]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error assigning expense to cluster:', error);
            throw error;
        }
    }

    static async getClustersForAnalysis(analysisId) {
        try {
            const [rows] = await db.pool.execute(
                `SELECT ec.*, e.title, e.amount, e.category, e.expense_date, 
                        e.description, e.payment_method
                 FROM expense_clusters ec
                 JOIN expenses e ON ec.expense_id = e.id
                 WHERE ec.analysis_id = ?
                 ORDER BY ec.cluster_id, ec.distance_to_center`,
                [analysisId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting clusters for analysis:', error);
            throw error;
        }
    }

    static async deleteAnalysis(id) {
        try {
            // First delete clusters (foreign key constraint)
            await db.pool.execute(
                'DELETE FROM expense_clusters WHERE analysis_id = ?',
                [id]
            );
            
            // Then delete analysis
            const [result] = await db.pool.execute(
                'DELETE FROM analysis_results WHERE id = ?',
                [id]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting analysis:', error);
            throw error;
        }
    }

    static async getAnalysisStats(analysisId) {
        try {
            const [stats] = await db.pool.execute(
                `SELECT 
                    COUNT(DISTINCT ec.cluster_id) as cluster_count,
                    COUNT(ec.expense_id) as expense_count,
                    AVG(e.amount) as avg_amount,
                    SUM(e.amount) as total_amount
                FROM expense_clusters ec
                JOIN expenses e ON ec.expense_id = e.id
                WHERE ec.analysis_id = ?`,
                [analysisId]
            );
            return stats[0] || {};
        } catch (error) {
            console.error('Error getting analysis stats:', error);
            throw error;
        }
    }

    static async createWithClusters(userId, data) {
        const connection = await db.pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Create analysis - REMOVED STATUS COLUMN
            const [analysisResult] = await connection.execute(
                'INSERT INTO analysis_results (user_id, cluster_count, insights_json, algorithm_version) VALUES (?, ?, ?, ?)',
                [userId, data.clusterCount || 3, JSON.stringify(data.insights || {}), data.algorithmVersion || 'kmeans-v2']
            );
            
            const analysisId = analysisResult.insertId;
            
            // Add clusters
            if (data.clusters && data.clusters.length > 0) {
                for (const cluster of data.clusters) {
                    await connection.execute(
                        'INSERT INTO expense_clusters (analysis_id, expense_id, cluster_id, cluster_label, distance_to_center) VALUES (?, ?, ?, ?, ?)',
                        [analysisId, cluster.expense_id, cluster.cluster_id, cluster.cluster_label, cluster.distance_to_center]
                    );
                }
            }
            
            await connection.commit();
            
            // Return created analysis
            const [analysis] = await connection.execute(
                'SELECT * FROM analysis_results WHERE id = ?',
                [analysisId]
            );
            
            connection.release();
            return analysis[0];
        } catch (error) {
            await connection.rollback();
            connection.release();
            console.error('Error creating analysis with clusters:', error);
            throw error;
        }
    }
}

module.exports = Analysis;