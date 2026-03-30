-- Migration: Add sem_type (odd/even) field to subjects table
-- Purpose: Allow subjects to be categorized by odd/even semesters

SET FOREIGN_KEY_CHECKS = 0;

-- Add sem_type column if it doesn't exist
ALTER TABLE `subjects` 
ADD COLUMN `sem_type` ENUM('odd', 'even') NOT NULL DEFAULT 'odd' AFTER `semester`;

-- Add index on sem_type for faster filtering
ALTER TABLE `subjects` 
ADD INDEX `idx_sem_type` (`sem_type`);

-- Add index on department_id and semester for combined filtering
ALTER TABLE `subjects` 
ADD INDEX `idx_dept_sem` (`department_id`, `semester`, `sem_type`);

SET FOREIGN_KEY_CHECKS = 1;

-- Verify the changes
-- SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME='subjects' AND TABLE_SCHEMA=('eduvertex');
