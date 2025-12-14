const { pool } = require('../config/database');

class User {
    // Find user by ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT id, name, email, currency, profile_picture, created_at, updated_at FROM users WHERE id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    // Create new user
    static async create({ name, email, password }) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, password]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Update user profile
    static async updateProfile(id, { name, profile_picture }) {
        try {
            const updates = [];
            const params = [];
            
            if (name !== undefined && name.trim() !== '') {
                updates.push('name = ?');
                params.push(name.trim());
            }
            
            if (profile_picture !== undefined) {
                updates.push('profile_picture = ?');
                params.push(profile_picture);
            }
            
            // Always update updated_at timestamp
            updates.push('updated_at = CURRENT_TIMESTAMP');
            
            if (updates.length === 0) {
                return false;
            }
            
            params.push(id);
            
            const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
            console.log('Update query:', query);
            console.log('Update params:', params);
            
            const [result] = await pool.execute(query, params);
            
            console.log('Update result:', result.affectedRows, 'rows affected');
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }
}

module.exports = User;