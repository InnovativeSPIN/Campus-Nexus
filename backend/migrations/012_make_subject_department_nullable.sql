-- =====================================================================
-- MIGRATION: Make subject.department_id nullable
-- Allows subjects to be created without department assignment
-- for cross-departmental subjects (placement, library, sports, etc)
-- =====================================================================

-- Modify department_id column to allow NULL
ALTER TABLE `subjects` MODIFY COLUMN `department_id` int(11) NULL COMMENT 'Department ID (null if available_to_all_departments is true)';

-- Also make semester nullable as per the model
ALTER TABLE `subjects` MODIFY COLUMN `semester` tinyint(2) NULL COMMENT '1-8 semesters or NULL for cross-departmental subjects';
