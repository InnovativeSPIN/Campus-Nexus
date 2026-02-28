-- Create leave_balance table for tracking leave balances
-- This table maintains the leave balance for each faculty/student per academic year

CREATE TABLE IF NOT EXISTS `leave_balance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL COMMENT 'Faculty ID or Student ID',
  `userType` enum('faculty','student') NOT NULL DEFAULT 'faculty',
  `academicYear` varchar(9) NOT NULL COMMENT 'Academic year in format YYYY',
  
  -- Different types of leaves with their balance structure
  `Medical` longtext COMMENT 'JSON: {balance: 10, used: 0}',
  `Casual` longtext COMMENT 'JSON: {balance: 12, used: 0}',
  `Earned` longtext COMMENT 'JSON: {balance: 15, used: 0}',
  `On-Duty` longtext COMMENT 'JSON: {balance: 10, used: 0}',
  `Personal` longtext COMMENT 'JSON: {balance: 5, used: 0}',
  `Maternity` longtext COMMENT 'JSON: {balance: 90, used: 0}',
  `Comp-Off` longtext COMMENT 'JSON: {balance: 0, used: 0}',
  
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_year` (`userId`, `academicYear`),
  KEY `idx_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing (optional)
-- Faculty 1 leave balance
INSERT INTO `leave_balance` (userId, userType, academicYear, Medical, Casual, Earned, `On-Duty`, Personal, Maternity, `Comp-Off`) VALUES
(1, 'faculty', '2026', '{"balance":10,"used":0}', '{"balance":12,"used":0}', '{"balance":15,"used":0}', '{"balance":10,"used":0}', '{"balance":5,"used":0}', '{"balance":90,"used":0}', '{"balance":0,"used":0}'),
(2, 'faculty', '2026', '{"balance":10,"used":0}', '{"balance":12,"used":0}', '{"balance":15,"used":0}', '{"balance":10,"used":0}', '{"balance":5,"used":0}', '{"balance":90,"used":0}', '{"balance":0,"used":0}');
