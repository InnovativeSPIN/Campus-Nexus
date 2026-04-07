-- Migration 007: Ensure all required columns exist in course_lesson_plans
-- Safe to run multiple times (uses IF NOT EXISTS)
-- Covers: add-approval-fields, 005-add-batch-id, 006-add-coverage-tracking

-- Approval workflow fields (from add-approval-fields-to-course-lesson-plans.sql)
ALTER TABLE `course_lesson_plans`
  ADD COLUMN IF NOT EXISTS `approval_status` ENUM('pending', 'approved', 'rejected', 'revision_requested') DEFAULT 'pending'
    COMMENT 'Approval status by department admin';

ALTER TABLE `course_lesson_plans`
  ADD COLUMN IF NOT EXISTS `approval_remarks` TEXT NULL
    COMMENT 'Remarks from department admin on approval/rejection';

ALTER TABLE `course_lesson_plans`
  ADD COLUMN IF NOT EXISTS `approved_by` INT NULL
    COMMENT 'Department admin faculty_id who approved this plan';

ALTER TABLE `course_lesson_plans`
  ADD COLUMN IF NOT EXISTS `approved_date` DATETIME NULL
    COMMENT 'When the department admin approved this plan';

-- Batch upload fields (from 005-add-batch-id-to-course-plans.js)
ALTER TABLE `course_lesson_plans`
  ADD COLUMN IF NOT EXISTS `upload_batch_id` VARCHAR(50) NULL
    COMMENT 'Unique ID for batch upload (groups related topics)';

ALTER TABLE `course_lesson_plans`
  ADD COLUMN IF NOT EXISTS `batch_submission_date` DATETIME NULL
    COMMENT 'When this batch was submitted for approval';

-- Coverage tracking fields (from 006-add-coverage-tracking.js)
ALTER TABLE `course_lesson_plans`
  ADD COLUMN IF NOT EXISTS `coverage_status` ENUM('completed', 'deviation') DEFAULT NULL
    COMMENT 'Status of topic coverage (completed or deviation)';

ALTER TABLE `course_lesson_plans`
  ADD COLUMN IF NOT EXISTS `coverage_date` DATETIME DEFAULT NULL
    COMMENT 'Date when the topic coverage was recorded';

ALTER TABLE `course_lesson_plans`
  ADD COLUMN IF NOT EXISTS `completed_date` DATETIME DEFAULT NULL
    COMMENT 'Date when the topic was marked as completed';

ALTER TABLE `course_lesson_plans`
  ADD COLUMN IF NOT EXISTS `deviation_reason` LONGTEXT DEFAULT NULL
    COMMENT 'Reason for deviation if status is deviation';

ALTER TABLE `course_lesson_plans`
  ADD COLUMN IF NOT EXISTS `additional_notes` LONGTEXT DEFAULT NULL
    COMMENT 'Additional notes about the topic coverage';

-- Fix: updated_by column (from 004-fix-lesson-plan-columns.sql)
ALTER TABLE `course_lesson_plans`
  ADD COLUMN IF NOT EXISTS `updated_by` INT NULL
    COMMENT 'User ID who last modified this entry';

-- Indexes (safe - MySQL ignores duplicate index creation errors with IF NOT EXISTS in 8.0+)
ALTER TABLE `course_lesson_plans`
  ADD INDEX IF NOT EXISTS `idx_approval_status` (`approval_status`);

ALTER TABLE `course_lesson_plans`
  ADD INDEX IF NOT EXISTS `idx_batch_id` (`upload_batch_id`);

ALTER TABLE `course_lesson_plans`
  ADD INDEX IF NOT EXISTS `idx_batch_submission` (`batch_submission_date`);

-- Fix existing records: set approval_status to 'approved' for old records that have NULL
UPDATE `course_lesson_plans` SET `approval_status` = 'approved' WHERE `approval_status` IS NULL;

SELECT 'Migration 007 completed successfully' AS status;
