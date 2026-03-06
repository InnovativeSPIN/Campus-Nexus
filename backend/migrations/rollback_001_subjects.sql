-- Rollback Script for Subject Management System
-- Use this if you need to revert the migration
-- WARNING: This will DELETE all subject-related data

-- ============================================
-- STEP 1: Disable Foreign Key Constraints
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- STEP 2: Drop Foreign Key Constraints from Other Tables
-- ============================================

-- Remove FK from timetable_slots
ALTER TABLE timetable_slots 
DROP FOREIGN KEY fk_timetable_slots_subject;

-- Remove FK from student_attendance_entry
ALTER TABLE student_attendance_entry 
DROP FOREIGN KEY fk_attendance_subject;

-- Remove FK from timetable_slot_assignments
ALTER TABLE timetable_slot_assignments 
DROP FOREIGN KEY fk_slot_assignment_subject;

-- Remove subject_id column from timetable_slot_assignments (if added)
ALTER TABLE timetable_slot_assignments 
DROP COLUMN IF EXISTS subject_id;

-- ============================================
-- STEP 3: Drop Subject-Related Tables
-- ============================================

-- Drop in order of dependencies
DROP TABLE IF EXISTS subject_class_mappings;
DROP TABLE IF EXISTS faculty_subject_assignments;
DROP TABLE IF EXISTS subjects;

-- ============================================
-- STEP 4: Re-enable Foreign Key Constraints
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- STEP 5: Verify Rollback
-- ============================================

-- Check that tables are gone
SHOW TABLES LIKE 'subject%';  -- Should return no results
SHOW TABLES LIKE 'faculty_subject_%';  -- Should return no results

-- Check that timetable_slots no longer references subjects
DESC timetable_slots;  -- Should not have subject_id column or FK constraint

-- ============================================
-- STEP 6: Reset Auto-Increment Counters
-- ============================================

-- This will reset the auto-increment counter if needed later
-- ALTER TABLE some_table AUTO_INCREMENT = 1;

-- ============================================
-- Done! All subject-related tables have been dropped.
-- You can now re-run the migration if needed.
-- ============================================
