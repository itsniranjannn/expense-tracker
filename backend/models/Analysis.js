const db = require('../config/database');

class Analysis {
    static async create({ user_id, cluster_count, insights_json, algorithm_version = 'kmeans-v1' }) {
        const [result] = await db.pool.execute(
            'INSERT INTO analysis_results (user_id, cluster_count, insights_json, algorithm_version) VALUES (?, ?, ?, ?)',
            [user_id, cluster_count, insights_json, algorithm_version]
        );
        return this.findById(result.insertId);
    }

    static async findById(id) {
        const [rows] = await db.pool.execute(
            'SELECT * FROM analysis_results WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByUser(userId) {
        const [rows] = await db.pool.execute(
            'SELECT * FROM analysis_results WHERE user_id = ? ORDER BY analysis_date DESC',
            [userId]
        );
        return rows;
    }

    static async findLatestByUser(userId) {
        const [rows] = await db.pool.execute(
            'SELECT * FROM analysis_results WHERE user_id = ? ORDER BY analysis_date DESC LIMIT 1',
            [userId]
        );
        return rows[0];
    }

    static async assignToCluster({ analysis_id, expense_id, cluster_id, cluster_label, distance_to_center }) {
        await db.pool.execute(
            'INSERT INTO expense_clusters (analysis_id, expense_id, cluster_id, cluster_label, distance_to_center) VALUES (?, ?, ?, ?, ?)',
            [analysis_id, expense_id, cluster_id, cluster_label, distance_to_center]
        );
    }

    static async getClustersForAnalysis(analysisId) {
        const [rows] = await db.pool.execute(
            `SELECT ec.*, e.title, e.amount, e.category, e.expense_date 
             FROM expense_clusters ec
             JOIN expenses e ON ec.expense_id = e.id
             WHERE ec.analysis_id = ?
             ORDER BY ec.cluster_id, ec.distance_to_center`,
            [analysisId]
        );
        return rows;
    }
}

module.exports = Analysis;