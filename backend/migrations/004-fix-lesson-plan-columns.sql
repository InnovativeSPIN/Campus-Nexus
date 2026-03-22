-- Add missing updated_by column to course_lesson_plans if it doesn't exist
ALTER TABLE `course_lesson_plans` 
ADD COLUMN IF NOT EXISTS `updated_by` INT(11) NULL AFTER `created_by`;
