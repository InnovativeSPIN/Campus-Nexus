-- Portfolio Notifications Table (simplified - no foreign keys due to dialect differences)
CREATE TABLE IF NOT EXISTS `portfolio_notifications` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT(11) NOT NULL,
  `portfolio_type` ENUM('sports', 'events', 'certifications', 'projects') NOT NULL,
  `portfolio_item_id` INT(11) NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'commented') NOT NULL DEFAULT 'pending',
  `approval_status` VARCHAR(50) NULL,
  `class_incharge_id` INT(11) NULL,
  `remarks` TEXT NULL,
  `reviewed_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_student_status` (`student_id`, `status`),
  INDEX `idx_portfolio_type` (`portfolio_type`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_class_incharge` (`class_incharge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Notifications for portfolio item approvals';

-- Alter Student table to track verification status aggregation
ALTER TABLE `students` ADD COLUMN IF NOT EXISTS `portfolio_pending_count` INT(11) DEFAULT 0;
ALTER TABLE `students` ADD COLUMN IF NOT EXISTS `last_portfolio_notification` DATETIME NULL;

-- Update existing portfolio items to create notifications
INSERT INTO `portfolio_notifications` (student_id, portfolio_type, portfolio_item_id, status, approval_status)
SELECT DISTINCT `studentId`, 'sports', `id`, CASE WHEN `approvalStatus` = 'pending' THEN 'pending' ELSE CAST(`approvalStatus` AS CHAR) END, `approvalStatus`
FROM `student_sports` WHERE `approvalStatus` IN ('pending', 'approved', 'rejected')
ON DUPLICATE KEY UPDATE `updated_at` = NOW();

INSERT INTO `portfolio_notifications` (student_id, portfolio_type, portfolio_item_id, status, approval_status)
SELECT DISTINCT `studentId`, 'events', `id`, CASE WHEN `approvalStatus` = 'pending' THEN 'pending' ELSE CAST(`approvalStatus` AS CHAR) END, `approvalStatus`
FROM `student_events` WHERE `approvalStatus` IN ('pending', 'approved', 'rejected')
ON DUPLICATE KEY UPDATE `updated_at` = NOW();

INSERT INTO `portfolio_notifications` (student_id, portfolio_type, portfolio_item_id, status, approval_status)
SELECT DISTINCT `studentId`, 'certifications', `id`, CASE WHEN `approvalStatus` = 'pending' THEN 'pending' ELSE CAST(`approvalStatus` AS CHAR) END, `approvalStatus`
FROM `student_certifications` WHERE `approvalStatus` IN ('pending', 'approved', 'rejected')
ON DUPLICATE KEY UPDATE `updated_at` = NOW();

INSERT INTO `portfolio_notifications` (student_id, portfolio_type, portfolio_item_id, status, approval_status)
SELECT DISTINCT `studentId`, 'projects', `id`, CASE WHEN `approvalStatus` = 'pending' THEN 'pending' ELSE CAST(`approvalStatus` AS CHAR) END, `approvalStatus`
FROM `student_projects` WHERE `approvalStatus` IN ('pending', 'approved', 'rejected')
ON DUPLICATE KEY UPDATE `updated_at` = NOW();
