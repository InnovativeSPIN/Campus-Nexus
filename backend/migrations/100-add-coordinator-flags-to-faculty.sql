-- Migration: Add coordinator flags to faculty_profiles
-- Date: 2026-03-26
-- Purpose: Add timetable_incharge and class_incharge flags to track coordinator roles

ALTER TABLE `faculty_profiles`
ADD COLUMN `is_timetable_incharge` TINYINT(1) DEFAULT 0 COMMENT 'Faculty is assigned as timetable incharge' AFTER `is_placement_coordinator`,
ADD COLUMN `is_class_incharge` TINYINT(1) DEFAULT 0 COMMENT 'Faculty is assigned as class incharge' AFTER `is_timetable_incharge`;

-- Create indexes for faster filtering
CREATE INDEX `idx_is_timetable_incharge` ON `faculty_profiles` (`is_timetable_incharge`);
CREATE INDEX `idx_is_class_incharge` ON `faculty_profiles` (`is_class_incharge`);

-- Update flags based on existing timetable_master assignments
UPDATE `faculty_profiles` fp
SET `is_timetable_incharge` = 1
WHERE `faculty_id` IN (
    SELECT DISTINCT `timetable_incharge_id`
    FROM `timetable_master`
    WHERE `timetable_incharge_id` IS NOT NULL
    AND `status` = 'active'
);

UPDATE `faculty_profiles` fp
SET `is_class_incharge` = 1
WHERE `faculty_id` IN (
    SELECT DISTINCT `class_coordinator_id`
    FROM `timetable_master`
    WHERE `class_coordinator_id` IS NOT NULL
    AND `status` = 'active'
);
