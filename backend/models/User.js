const { pool } = require('../config/database');

class User {
    // Create new user
    static async create({ name, email, password }) {
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, password]
        );
        return result.insertId;
    }

    // Find user by email
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    // Find user by ID
    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, name, email, currency, profile_picture, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Update user profile
    static async updateProfile(id, { name, currency, profile_picture }) {
        const [result] = await pool.execute(
            'UPDATE users SET name = ?, currency = ?, profile_picture = ? WHERE id = ?',
            [name, currency, profile_picture, id]
        );
        return result.affectedRows > 0;
    }

    // Update password
    static async updatePassword(id, password) {
        const [result] = await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [password, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = User;