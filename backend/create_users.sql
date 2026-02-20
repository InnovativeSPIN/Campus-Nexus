-- Create users table (matches User.model.js schema)
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `avatar` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert admin users (passwords are hashed, you should update with real passwords)
-- Password hashes below are for demo purposes only
INSERT INTO `users` (`name`, `email`, `password`, `role_id`, `phone`, `isActive`, `avatar`) VALUES
('Super Admin', 'superadmin@eduvertex.com', '$2a$10$S2Vdl9MLFWTGhnE9Jdk9HO14bwbW5dzydgmF44elMnpsxwBfz7LVS', 1, '9876543210', 1, NULL),
('Executive Admin', 'executive@eduvertex.com', '$2a$10$50ovtypVEoGG4eDiv/w7.eYql6MUpc7Q1vpw9f1DxMWTYhInKcWHe', 2, '9876543211', 1, NULL),
('Academic Admin', 'academic@eduvertex.com', '$2a$10$rtVcTSxhiJKb4Cm3GdJWTety1jN8MAbcweTMHTRw2TQOE79tziyEq', 3, '9876543212', 1, NULL);