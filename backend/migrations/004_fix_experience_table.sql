-- Migration: Fix faculty_experience table to support multiple records per faculty
-- Issue: Table had PRIMARY KEY on faculty_id, allowing only 1 record per faculty
-- Solution: Change PRIMARY KEY to exp_id and remove faculty_id from primary key

SET FOREIGN_KEY_CHECKS = 0;

-- Step 1: Drop the existing PRIMARY KEY constraint
ALTER TABLE `faculty_experience`
DROP PRIMARY KEY;

-- Step 2: Add PRIMARY KEY on exp_id only
ALTER TABLE `faculty_experience`
ADD PRIMARY KEY (`exp_id`);

-- Step 3: Ensure exp_id has auto_increment if it's a new setup
ALTER TABLE `faculty_experience`
MODIFY COLUMN `exp_id` INT(11) NOT NULL AUTO_INCREMENT;

-- Step 4: Add a regular index on faculty_id for faster lookups (not unique)
ALTER TABLE `faculty_experience`
ADD INDEX `idx_faculty_id` (`faculty_id`);

SET FOREIGN_KEY_CHECKS = 1;

-- Verification: This table now supports multiple experience records per faculty
-- faculty_id is a foreign key, not a primary key
-- exp_id is the auto-incrementing primary key
