-- Fix student_projects approvedById foreign key constraint
-- Currently points to users(id) which are user account IDs
-- Should point to faculty_profiles(faculty_id) which matches JWT tokens

-- Drop the old incorrect foreign key if it exists
ALTER TABLE `student_projects` 
  DROP FOREIGN KEY IF EXISTS `fk_proj_approver`;

-- Add correct foreign key constraint
-- Faculty JWT uses faculty_id, so approvedById should reference faculty_profiles(faculty_id)
ALTER TABLE `student_projects`
  ADD CONSTRAINT `fk_proj_approver` 
  FOREIGN KEY (`approvedById`) REFERENCES `faculty_profiles`(`faculty_id`) ON DELETE SET NULL;

-- Verify the constraint is correct
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'student_projects' AND COLUMN_NAME = 'approvedById';
