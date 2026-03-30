-- Migration: Fix faculy_edu_qualification table to support multiple records per faculty
-- Issue: Table had PRIMARY KEY on faculty_id, allowing only 1 record per faculty
-- Solution: Change PRIMARY KEY to membership_id and remove faculty_id from primary key

SET FOREIGN_KEY_CHECKS = 0;

-- Step 1: Drop the existing PRIMARY KEY constraint
ALTER TABLE `faculy_edu_qualification`
DROP PRIMARY KEY;

-- Step 2: Add PRIMARY KEY on membership_id only
ALTER TABLE `faculy_edu_qualification`
ADD PRIMARY KEY (`membership_id`);

-- Step 3: Add a regular index on faculty_id for faster lookups (not unique)
ALTER TABLE `faculy_edu_qualification`
ADD INDEX `idx_faculty_id` (`faculty_id`);

SET FOREIGN_KEY_CHECKS = 1;

-- Verification: This table now supports multiple education records per faculty
-- faculty_id is a foreign key, not a primary key
-- membership_id is the auto-incrementing primary key
