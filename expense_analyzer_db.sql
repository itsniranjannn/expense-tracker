-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 10, 2025 at 02:41 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `expense_analyzer_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `generate_sample_analysis` (IN `user_id` INT)   BEGIN
    DECLARE analysis_id INT;
    
    -- Create analysis record
    INSERT INTO analysis_results (user_id, cluster_count, algorithm_version, insights_json, status)
    VALUES (
        user_id, 
        4, 
        'kmeans-v2',
        JSON_OBJECT(
            'summary', JSON_OBJECT(
                'totalClusters', 4,
                'totalExpenses', 15,
                'analysisDate', NOW()
            ),
            'clusters', JSON_OBJECT(
                '1', JSON_OBJECT('label', 'Daily Essentials', 'size', 5, 'totalAmount', 4500),
                '2', JSON_OBJECT('label', 'High-Value Purchases', 'size', 3, 'totalAmount', 7500),
                '3', JSON_OBJECT('label', 'Entertainment', 'size', 4, 'totalAmount', 3100),
                '4', JSON_OBJECT('label', 'Utilities', 'size', 3, 'totalAmount', 2500)
            ),
            'patterns', JSON_ARRAY(
                JSON_OBJECT('pattern', 'Weekend spending spike', 'confidence', '85%', 'impact', 'High'),
                JSON_OBJECT('pattern', 'Food & Dining frequency', 'confidence', '78%', 'impact', 'Medium')
            ),
            'recommendations', JSON_ARRAY(
                JSON_OBJECT('title', 'Reduce Food Delivery', 'description', 'Spending Rs 3,250 monthly on food delivery', 'impact', 'High'),
                JSON_OBJECT('title', 'Bundle Subscriptions', 'description', 'Multiple entertainment subscriptions found', 'impact', 'Medium')
            )
        ),
        'completed'
    );
    
    SET analysis_id = LAST_INSERT_ID();
    
    -- Assign clusters to expenses
    INSERT INTO expense_clusters (analysis_id, expense_id, cluster_id, cluster_label, distance_to_center)
    SELECT analysis_id, id, 
           CASE 
               WHEN category IN ('Food & Dining', 'Groceries') THEN 1
               WHEN amount > 2000 THEN 2
               WHEN category IN ('Entertainment', 'Personal Care') THEN 3
               ELSE 4
           END,
           CASE 
               WHEN category IN ('Food & Dining', 'Groceries') THEN 'Daily Essentials'
               WHEN amount > 2000 THEN 'High-Value Purchases'
               WHEN category IN ('Entertainment', 'Personal Care') THEN 'Entertainment'
               ELSE 'Utilities'
           END,
           ROUND(RAND() * 10, 4)
    FROM expenses 
    WHERE user_id = user_id;
    
    SELECT analysis_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `analysis_results`
--

CREATE TABLE `analysis_results` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `analysis_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `cluster_count` int(11) NOT NULL,
  `algorithm_version` varchar(50) DEFAULT 'kmeans-v1',
  `insights_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`insights_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `budgets`
--

CREATE TABLE `budgets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `month_year` date NOT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `icon` varchar(50) DEFAULT '?',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `budgets`
--

INSERT INTO `budgets` (`id`, `user_id`, `category`, `amount`, `month_year`, `color`, `icon`, `created_at`) VALUES
(1, 1, 'Food & Dining', 5000.00, '2024-12-01', '#3B82F6', '💰', '2025-12-07 12:16:41'),
(2, 1, 'Transportation', 3000.00, '2024-12-01', '#3B82F6', '💰', '2025-12-07 12:16:41'),
(3, 1, 'Groceries', 4000.00, '2024-12-01', '#3B82F6', '💰', '2025-12-07 12:16:41'),
(4, 1, 'Entertainment', 2000.00, '2024-12-01', '#3B82F6', '💰', '2025-12-07 12:16:41'),
(5, 1, 'Bills & Utilities', 3000.00, '2024-12-01', '#3B82F6', '💰', '2025-12-07 12:16:41');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `category` enum('Food & Dining','Transportation','Shopping','Bills & Utilities','Entertainment','Healthcare','Education','Groceries','Travel','Personal Care','Savings','Investment','Gifts & Donations','Other') NOT NULL DEFAULT 'Other',
  `amount` decimal(12,2) NOT NULL,
  `expense_date` date NOT NULL,
  `description` text DEFAULT NULL,
  `payment_method` enum('Cash','Card','Esewa','Khalti','Other') DEFAULT 'Cash',
  `receipt_image` varchar(255) DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT 0,
  `recurring_frequency` enum('Daily','Weekly','Monthly','Yearly') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `user_id`, `title`, `category`, `amount`, `expense_date`, `description`, `payment_method`, `receipt_image`, `is_recurring`, `recurring_frequency`, `created_at`, `updated_at`) VALUES
(61, 1, 'Lunch at Restaurant', 'Food & Dining', 1200.00, '2024-12-01', 'Office lunch', 'Cash', NULL, 0, NULL, '2025-12-10 13:35:41', '2025-12-10 13:35:41'),
(62, 1, 'Uber Ride', 'Transportation', 350.00, '2024-12-02', 'To office', 'Card', NULL, 0, NULL, '2025-12-10 13:35:41', '2025-12-10 13:35:41'),
(63, 1, 'Grocery Shopping', 'Groceries', 2800.00, '2024-12-03', 'Weekly groceries', 'Cash', NULL, 0, NULL, '2025-12-10 13:35:41', '2025-12-10 13:35:41'),
(64, 1, 'Movie Tickets', 'Entertainment', 800.00, '2024-12-04', 'Weekend movie', 'Esewa', NULL, 0, NULL, '2025-12-10 13:35:41', '2025-12-10 13:35:41'),
(65, 1, 'Electricity Bill', 'Bills & Utilities', 1500.00, '2024-12-05', 'Monthly bill', 'Khalti', NULL, 0, NULL, '2025-12-10 13:35:41', '2025-12-10 13:35:41'),
(66, 1, 'Coffee', 'Food & Dining', 250.00, '2024-12-06', 'Morning coffee', 'Card', NULL, 0, NULL, '2025-12-10 13:35:41', '2025-12-10 13:35:41'),
(67, 1, 'Petrol', 'Transportation', 1200.00, '2024-12-07', 'Bike fuel', 'Cash', NULL, 0, NULL, '2025-12-10 13:35:41', '2025-12-10 13:35:41'),
(68, 1, 'Clothes Shopping', 'Shopping', 4500.00, '2024-12-08', 'Winter clothes', 'Card', NULL, 0, NULL, '2025-12-10 13:35:41', '2025-12-10 13:35:41'),
(69, 1, 'Medicine', 'Healthcare', 850.00, '2024-12-09', 'Cold medicine', 'Cash', NULL, 0, NULL, '2025-12-10 13:35:41', '2025-12-10 13:35:41'),
(70, 1, 'Dinner', 'Food & Dining', 1800.00, '2024-12-10', 'Family dinner', 'Esewa', NULL, 0, NULL, '2025-12-10 13:35:41', '2025-12-10 13:35:41'),
(71, 1, 'Netflix Subscription', 'Entertainment', 650.00, '2024-12-11', 'Monthly subscription', 'Card', NULL, 0, NULL, '2025-12-10 13:35:41', '2025-12-10 13:35:41'),
(72, 1, 'Book Purchase', 'Education', 1200.00, '2024-12-12', 'Programming book', 'Card', NULL, 0, NULL, '2025-12-10 13:35:41', '2025-12-10 13:35:41'),
(73, 1, 'Gym Membership', 'Personal Care', 2000.00, '2024-12-13', 'Monthly fee', 'Khalti', NULL, 0, NULL, '2025-12-10 13:35:41', '2025-12-10 13:35:41'),
(74, 1, 'Taxi', 'Transportation', 450.00, '2024-12-14', 'Airport drop', 'Cash', NULL, 0, NULL, '2025-12-10 13:35:41', '2025-12-10 13:35:41'),
(75, 1, 'Mobile Recharge', 'Bills & Utilities', 500.00, '2024-12-15', 'NTC recharge', 'Esewa', NULL, 0, NULL, '2025-12-10 13:35:41', '2025-12-10 13:35:41');

-- --------------------------------------------------------

--
-- Table structure for table `expense_clusters`
--

CREATE TABLE `expense_clusters` (
  `id` int(11) NOT NULL,
  `analysis_id` int(11) NOT NULL,
  `expense_id` int(11) NOT NULL,
  `cluster_id` int(11) NOT NULL,
  `cluster_label` varchar(100) DEFAULT NULL,
  `distance_to_center` decimal(10,4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'Rs',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `profile_picture`, `currency`, `created_at`, `updated_at`) VALUES
(1, 'niranjan', 'katwalniranjan40@gmail.com', '$2a$10$N/eFAPjjZszUa667YU0bWuAqfBqSemEUn4e8rS2xQwp7SE9UIwWbK', NULL, 'Rs', '2025-12-07 13:01:48', '2025-12-07 13:01:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `analysis_results`
--
ALTER TABLE `analysis_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `budgets`
--
ALTER TABLE `budgets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_category_month` (`user_id`,`category`,`month_year`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_date` (`user_id`,`expense_date`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `expense_clusters`
--
ALTER TABLE `expense_clusters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `analysis_id` (`analysis_id`),
  ADD KEY `expense_id` (`expense_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `analysis_results`
--
ALTER TABLE `analysis_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `budgets`
--
ALTER TABLE `budgets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `expense_clusters`
--
ALTER TABLE `expense_clusters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `analysis_results`
--
ALTER TABLE `analysis_results`
  ADD CONSTRAINT `analysis_results_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `budgets`
--
ALTER TABLE `budgets`
  ADD CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `expense_clusters`
--
ALTER TABLE `expense_clusters`
  ADD CONSTRAINT `expense_clusters_ibfk_1` FOREIGN KEY (`analysis_id`) REFERENCES `analysis_results` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expense_clusters_ibfk_2` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
