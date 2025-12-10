-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 10, 2025 at 11:27 AM
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

--
-- Dumping data for table `analysis_results`
--

INSERT INTO `analysis_results` (`id`, `user_id`, `analysis_date`, `cluster_count`, `algorithm_version`, `insights_json`) VALUES
(1, 1, '2025-12-07 13:01:59', 3, 'kmeans-v1', '{\"totalClusters\":3,\"clusterDetails\":[{\"clusterId\":1,\"size\":7,\"averageAmount\":null,\"totalAmount\":\"01200.001800.00299.00800.00600.001500.001200.00\",\"minAmount\":299,\"maxAmount\":1800,\"mostCommonCategory\":\"Food & Dining\",\"categoryDistribution\":{\"Education\":1,\"Food & Dining\":2,\"Bills & Utilities\":1,\"Healthcare\":1,\"Entertainment\":1,\"Transportation\":1},\"examples\":[{\"title\":\"Books\",\"amount\":\"1200.00\",\"category\":\"Education\"},{\"title\":\"Dinner\",\"amount\":\"1800.00\",\"category\":\"Food & Dining\"},{\"title\":\"Mobile Recharge\",\"amount\":\"299.00\",\"category\":\"Bills & Utilities\"}]},{\"clusterId\":2,\"size\":1,\"averageAmount\":4500,\"totalAmount\":\"04500.00\",\"minAmount\":4500,\"maxAmount\":4500,\"mostCommonCategory\":\"Shopping\",\"categoryDistribution\":{\"Shopping\":1},\"examples\":[{\"title\":\"Clothes\",\"amount\":\"4500.00\",\"category\":\"Shopping\"}]},{\"clusterId\":3,\"size\":2,\"averageAmount\":null,\"totalAmount\":\"02500.003500.00\",\"minAmount\":2500,\"maxAmount\":3500,\"mostCommonCategory\":\"Groceries\",\"categoryDistribution\":{\"Bills & Utilities\":1,\"Groceries\":1},\"examples\":[{\"title\":\"Electricity Bill\",\"amount\":\"2500.00\",\"category\":\"Bills & Utilities\"},{\"title\":\"Groceries\",\"amount\":\"3500.00\",\"category\":\"Groceries\"}]}],\"spendingPatterns\":[],\"recommendations\":[\"Consider reducing high-value expenses by looking for alternatives or discounts\"],\"summary\":{\"totalExpenses\":10,\"totalSpent\":\"001200.001800.00299.00800.00600.001500.001200.0004500.0002500.003500.00\",\"averagePerExpense\":null}}'),
(2, 1, '2025-12-08 08:13:16', 3, 'kmeans-v1', '{\"totalClusters\":3,\"clusterDetails\":[{\"clusterId\":1,\"size\":3,\"averageAmount\":566.3333333333334,\"totalAmount\":1699,\"minAmount\":299,\"maxAmount\":800,\"mostCommonCategory\":\"Entertainment\",\"categoryDistribution\":{\"Bills & Utilities\":1,\"Healthcare\":1,\"Entertainment\":1},\"examples\":[{\"title\":\"Mobile Recharge\",\"amount\":299,\"category\":\"Bills & Utilities\"},{\"title\":\"Medicine\",\"amount\":800,\"category\":\"Healthcare\"},{\"title\":\"Movie Ticket\",\"amount\":600,\"category\":\"Entertainment\"}]},{\"clusterId\":2,\"size\":3,\"averageAmount\":3500,\"totalAmount\":10500,\"minAmount\":2500,\"maxAmount\":4500,\"mostCommonCategory\":\"Groceries\",\"categoryDistribution\":{\"Shopping\":1,\"Bills & Utilities\":1,\"Groceries\":1},\"examples\":[{\"title\":\"Clothes\",\"amount\":4500,\"category\":\"Shopping\"},{\"title\":\"Electricity Bill\",\"amount\":2500,\"category\":\"Bills & Utilities\"},{\"title\":\"Groceries\",\"amount\":3500,\"category\":\"Groceries\"}]},{\"clusterId\":3,\"size\":4,\"averageAmount\":1425,\"totalAmount\":5700,\"minAmount\":1200,\"maxAmount\":1800,\"mostCommonCategory\":\"Food & Dining\",\"categoryDistribution\":{\"Education\":1,\"Food & Dining\":2,\"Transportation\":1},\"examples\":[{\"title\":\"Books\",\"amount\":1200,\"category\":\"Education\"},{\"title\":\"Dinner\",\"amount\":1800,\"category\":\"Food & Dining\"},{\"title\":\"Petrol\",\"amount\":1500,\"category\":\"Transportation\"}]}],\"spendingPatterns\":[\"Cluster 3: High-value expenses (avg ₹1425.00) in Food & Dining\"],\"recommendations\":[\"Consider reducing high-value expenses by looking for alternatives or discounts\"],\"summary\":{\"totalExpenses\":10,\"totalSpent\":17899,\"averagePerExpense\":1789.9}}'),
(3, 1, '2025-12-08 08:13:33', 3, 'kmeans-v1', '{\"totalClusters\":3,\"clusterDetails\":[{\"clusterId\":1,\"size\":3,\"averageAmount\":1933.3333333333333,\"totalAmount\":5800,\"minAmount\":1500,\"maxAmount\":2500,\"mostCommonCategory\":\"Transportation\",\"categoryDistribution\":{\"Food & Dining\":1,\"Bills & Utilities\":1,\"Transportation\":1},\"examples\":[{\"title\":\"Dinner\",\"amount\":1800,\"category\":\"Food & Dining\"},{\"title\":\"Electricity Bill\",\"amount\":2500,\"category\":\"Bills & Utilities\"},{\"title\":\"Petrol\",\"amount\":1500,\"category\":\"Transportation\"}]},{\"clusterId\":2,\"size\":5,\"averageAmount\":819.8,\"totalAmount\":4099,\"minAmount\":299,\"maxAmount\":1200,\"mostCommonCategory\":\"Food & Dining\",\"categoryDistribution\":{\"Education\":1,\"Bills & Utilities\":1,\"Healthcare\":1,\"Entertainment\":1,\"Food & Dining\":1},\"examples\":[{\"title\":\"Books\",\"amount\":1200,\"category\":\"Education\"},{\"title\":\"Mobile Recharge\",\"amount\":299,\"category\":\"Bills & Utilities\"},{\"title\":\"Medicine\",\"amount\":800,\"category\":\"Healthcare\"}]},{\"clusterId\":3,\"size\":2,\"averageAmount\":4000,\"totalAmount\":8000,\"minAmount\":3500,\"maxAmount\":4500,\"mostCommonCategory\":\"Groceries\",\"categoryDistribution\":{\"Shopping\":1,\"Groceries\":1},\"examples\":[{\"title\":\"Clothes\",\"amount\":4500,\"category\":\"Shopping\"},{\"title\":\"Groceries\",\"amount\":3500,\"category\":\"Groceries\"}]}],\"spendingPatterns\":[],\"recommendations\":[\"Consider reducing high-value expenses by looking for alternatives or discounts\"],\"summary\":{\"totalExpenses\":10,\"totalSpent\":17899,\"averagePerExpense\":1789.9}}');

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
(21, 1, 'Lunch at Restaurant', 'Food & Dining', 1200.00, '2024-12-01', NULL, 'Cash', NULL, 0, NULL, '2025-12-08 15:29:14', '2025-12-08 15:29:14'),
(22, 1, 'Petrol for Bike', 'Transportation', 1500.00, '2024-12-02', NULL, 'Card', NULL, 0, NULL, '2025-12-08 15:29:14', '2025-12-08 15:29:14'),
(23, 1, 'Monthly Groceries', 'Groceries', 3500.00, '2024-12-03', NULL, 'Esewa', NULL, 0, NULL, '2025-12-08 15:29:14', '2025-12-08 15:29:14'),
(24, 1, 'Movie Tickets', 'Entertainment', 600.00, '2024-12-04', NULL, 'Khalti', NULL, 0, NULL, '2025-12-08 15:29:14', '2025-12-08 15:29:14'),
(25, 1, 'Electricity Bill', 'Bills & Utilities', 2500.00, '2024-12-05', NULL, 'Other', NULL, 0, NULL, '2025-12-08 15:29:14', '2025-12-08 15:29:14'),
(26, 1, 'Medicine', 'Healthcare', 800.00, '2024-12-06', NULL, 'Cash', NULL, 0, NULL, '2025-12-08 15:29:14', '2025-12-08 15:29:14'),
(27, 1, 'New Clothes', 'Shopping', 4500.00, '2024-12-07', NULL, 'Card', NULL, 0, NULL, '2025-12-08 15:29:14', '2025-12-08 15:29:14'),
(28, 1, 'College Books', 'Education', 12000.00, '2024-12-08', NULL, 'Card', NULL, 0, NULL, '2025-12-08 15:29:14', '2025-12-10 10:07:20');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

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
