-- ======================================================================
-- Migration 012: Add academic_year, year, lab_name to subjects
--                Enable timestamps on classes table
-- ======================================================================

-- 1. Add new columns to subjects table
ALTER TABLE `subjects`
  ADD COLUMN IF NOT EXISTS `academic_year` VARCHAR(9) NULL COMMENT 'e.g. 2025-2026' AFTER `sem_type`,
  ADD COLUMN IF NOT EXISTS `year` TINYINT(1) NULL COMMENT '1-4 academic year' AFTER `academic_year`,
  ADD COLUMN IF NOT EXISTS `lab_name` VARCHAR(100) NULL COMMENT 'Lab name (only for laboratory subjects)' AFTER `year`;

-- Add index on academic_year for faster filtering
ALTER TABLE `subjects`
  ADD INDEX IF NOT EXISTS `idx_subject_academic_year` (`academic_year`),
  ADD INDEX IF NOT EXISTS `idx_subject_year` (`year`);

-- 2. Add timestamps to classes table
ALTER TABLE `classes`
  ADD COLUMN IF NOT EXISTS `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`,
  ADD COLUMN IF NOT EXISTS `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- Populate year from semester for existing subjects
UPDATE `subjects` SET `year` = CEIL(semester / 2) WHERE `year` IS NULL AND semester IS NOT NULL;

-- Populate sem_type from semester for existing subjects (odd sems = 1,3,5,7; even = 2,4,6,8)
UPDATE `subjects` SET `sem_type` = IF(semester % 2 = 1, 'odd', 'even') WHERE `sem_type` IS NULL AND semester IS NOT NULL;
