-- =========================================
-- CLEAN DATABASE SETUP: Expense Analyzer
-- =========================================

SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS expense_analyzer_db;
CREATE DATABASE expense_analyzer_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE expense_analyzer_db;

-- =========================================
-- USERS TABLE
-- =========================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  profile_picture VARCHAR(255),
  currency VARCHAR(10) DEFAULT 'Rs',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- EXPENSES TABLE
-- =========================================
DROP TABLE IF EXISTS expenses;
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  category ENUM(
    'Food & Dining','Transportation','Shopping','Bills & Utilities',
    'Entertainment','Healthcare','Education','Groceries','Travel',
    'Personal Care','Savings','Investment','Gifts & Donations','Other'
  ) DEFAULT 'Other',
  amount DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  description TEXT,
  payment_method ENUM('Cash','Card','Esewa','Khalti','Other') DEFAULT 'Cash',
  receipt_image VARCHAR(255),
  is_recurring TINYINT(1) DEFAULT 0,
  recurring_frequency ENUM('Daily','Weekly','Monthly','Yearly'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================
-- BUDGETS TABLE
-- =========================================
DROP TABLE IF EXISTS budgets;
CREATE TABLE budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(50),
  amount DECIMAL(12,2) NOT NULL,
  month_year DATE NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT '💰',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_category_month (user_id, category, month_year),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================
-- ANALYSIS RESULTS TABLE
-- =========================================
DROP TABLE IF EXISTS analysis_results;
CREATE TABLE analysis_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cluster_count INT NOT NULL,
  algorithm_version VARCHAR(50) DEFAULT 'kmeans-v1',
  insights_json LONGTEXT CHECK (JSON_VALID(insights_json)),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================
-- EXPENSE CLUSTERS TABLE
-- =========================================
DROP TABLE IF EXISTS expense_clusters;
CREATE TABLE expense_clusters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  analysis_id INT NOT NULL,
  expense_id INT NOT NULL,
  cluster_id INT NOT NULL,
  cluster_label VARCHAR(100),
  distance_to_center DECIMAL(10,4),
  FOREIGN KEY (analysis_id) REFERENCES analysis_results(id) ON DELETE CASCADE,
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
);

-- =========================================
-- SAMPLE USER
-- =========================================
INSERT INTO users (name, email, password)
VALUES (
  'niranjan',
  'katwalniranjan40@gmail.com',
  '$2a$10$N/eFAPjjZszUa667YU0bWuAqfBqSemEUn4e8rS2xQwp7SE9UIwWbK'
);

-- =========================================
-- SAMPLE EXPENSES
-- =========================================
INSERT INTO expenses (user_id, title, category, amount, expense_date, payment_method) VALUES
(1,'Lunch at Restaurant','Food & Dining',1200,'2024-12-01','Cash'),
(1,'Uber Ride','Transportation',350,'2024-12-02','Card'),
(1,'Grocery Shopping','Groceries',2800,'2024-12-03','Cash'),
(1,'Movie Tickets','Entertainment',800,'2024-12-04','Esewa'),
(1,'Electricity Bill','Bills & Utilities',1500,'2024-12-05','Khalti'),
(1,'Clothes Shopping','Shopping',4500,'2024-12-08','Card');

-- =========================================
-- DROP & CREATE PROCEDURE
-- =========================================
DROP PROCEDURE IF EXISTS generate_sample_analysis;
DELIMITER $$

CREATE PROCEDURE generate_sample_analysis(IN p_user_id INT)
BEGIN
  DECLARE analysis_id INT;

  INSERT INTO analysis_results (user_id, cluster_count, algorithm_version, insights_json)
  VALUES (
    p_user_id,
    4,
    'kmeans-v2',
    JSON_OBJECT(
      'summary', JSON_OBJECT('clusters',4,'date',NOW()),
      'note','Sample K-Means Analysis'
    )
  );

  SET analysis_id = LAST_INSERT_ID();

  INSERT INTO expense_clusters (analysis_id, expense_id, cluster_id, cluster_label, distance_to_center)
  SELECT
    analysis_id,
    id,
    FLOOR(1 + RAND()*4),
    'Auto Cluster',
    ROUND(RAND()*10,4)
  FROM expenses
  WHERE user_id = p_user_id;

END$$
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;
