-- Migration: Add sem_type to subjects table if missing
-- This checks if the column exists before adding it

SET FOREIGN_KEY_CHECKS = 0;

-- Check if sem_type column exists
-- If not, add it
ALTER TABLE `subjects` 
ADD COLUMN `sem_type` ENUM('odd', 'even') NULL DEFAULT 'odd' AFTER `semester`;

-- Add index on sem_type for faster filtering if it doesn't exist
ALTER TABLE `subjects` 
ADD INDEX `idx_sem_type` (`sem_type`);

-- Add composite index on department_id, semester, and sem_type
ALTER TABLE `subjects` 
ADD INDEX `idx_dept_sem` (`department_id`, `semester`, `sem_type`);

SET FOREIGN_KEY_CHECKS = 1;

-- Verify the changes
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME='subjects' AND TABLE_SCHEMA='eduvertex'
ORDER BY ORDINAL_POSITION;
