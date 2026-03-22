-- Migration: Add approval status fields to course_lesson_plans table
-- This adds the approval workflow fields to track department admin approvals

ALTER TABLE course_lesson_plans
ADD COLUMN IF NOT EXISTS approval_status ENUM('pending', 'approved', 'rejected', 'revision_requested') DEFAULT 'approved';

ALTER TABLE course_lesson_plans
ADD COLUMN IF NOT EXISTS approval_remarks TEXT NULL;

ALTER TABLE course_lesson_plans
ADD COLUMN IF NOT EXISTS approved_by INT NULL;

ALTER TABLE course_lesson_plans
ADD COLUMN IF NOT EXISTS approved_date DATETIME NULL;

-- Add index for faster queries on approval status if not already exists
ALTER TABLE course_lesson_plans ADD INDEX IF NOT EXISTS idx_approval_status (approval_status);
