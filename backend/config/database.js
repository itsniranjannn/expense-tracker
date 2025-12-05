const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'expense_analyzer_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convert pool to use promises
const promisePool = pool.promise();

// Test database connection
const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('Please check:');
        console.log('1. Is MySQL running? (sudo service mysql start)');
        console.log('2. Database credentials in .env file');
        console.log('3. Database name: expense_analyzer_db');
        return false;
    }
};

// Create tables if not exist (simplified version)
const initializeDatabase = async () => {
    try {
        // Users table
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Expenses table
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                category ENUM(
                    'Food & Dining',
                    'Transportation',
                    'Shopping',
                    'Bills & Utilities',
                    'Entertainment',
                    'Healthcare',
                    'Education',
                    'Groceries',
                    'Travel',
                    'Personal Care',
                    'Other'
                ) NOT NULL DEFAULT 'Other',
                amount DECIMAL(12, 2) NOT NULL,
                expense_date DATE NOT NULL,
                description TEXT,
                payment_method ENUM('Cash', 'Credit Card', 'Debit Card', 'Digital Wallet', 'Bank Transfer', 'Other') DEFAULT 'Cash',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Analysis results table
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS analysis_results (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                cluster_count INT NOT NULL,
                algorithm_version VARCHAR(50) DEFAULT 'kmeans-v1',
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Expense clusters table
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS expense_clusters (
                id INT PRIMARY KEY AUTO_INCREMENT,
                analysis_id INT NOT NULL,
                expense_id INT NOT NULL,
                cluster_id INT NOT NULL,
                distance_to_center DECIMAL(10, 4),
                FOREIGN KEY (analysis_id) REFERENCES analysis_results(id) ON DELETE CASCADE,
                FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ Database tables created/verified successfully');
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        return false;
    }
};

module.exports = {
    pool: promisePool,
    testConnection,
    initializeDatabase
};