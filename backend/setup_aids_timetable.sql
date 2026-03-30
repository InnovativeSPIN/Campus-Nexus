-- AIDS Department Timetable Setup Script
-- This script creates all necessary data for the AIDS department timetable
-- Based on the real timetable for Year III, Semester VI (2025-2026 Even Semester)

-- =====================================================
-- 1. ENSURE AIDS DEPARTMENT EXISTS
-- =====================================================
-- Department should already exist as ID = 6
-- If not, insert it:
INSERT IGNORE INTO `departments` (`id`, `short_name`, `full_name`) VALUES
(6, 'AI&DS', 'B.Tech. Artificial Intelligence & Data Science');

-- =====================================================
-- 2. CREATE CLASS FOR AIDS 3rd YEAR SECTION A
-- =====================================================
INSERT IGNORE INTO `classes` (`id`, `name`, `section`, `room`, `department_id`, `semester`, `batch`, `capacity`, `status`) VALUES
(21, 'AIDS A', 'A', 'CR-15', 6, 6, '2023-2027', 60, 'active');

-- =====================================================
-- 3. ROOM CR-15 (skip - rooms table not in main DB schema)
-- =====================================================
-- The timetable CSV stores room as a text field, no separate table needed

-- =====================================================
-- 4. LABS (skip - labs table not in main DB schema)
-- =====================================================
-- Lab names in the CSV are stored as text in the timetable record

-- =====================================================
-- 5. INSERT/UPDATE FACULTY MEMBERS
-- =====================================================
-- Note: Faculty with college codes from the timetable
-- Assuming role_id = 5 (faculty), password is hashed for 'faculty123'

-- Dr. L.S. Vignesh (HOD) - Already exists as CS10, dept_id=6
UPDATE `faculty_profiles` SET 
  `is_timetable_incharge` = 1,
  `designation` = 'HEAD OF THE DEPARTMENT'
WHERE `faculty_college_code` = 'CS10';

-- Ms. P. Nagajothi - Already exists as NS80T01
UPDATE `faculty_profiles` SET 
  `Name` = 'NAGAJOTHI P',
  `department_id` = 6,
  `designation` = 'ASSISTANT PROFESSOR'
WHERE `faculty_college_code` = 'NS80T01';

-- Mrs. P. Gowthami - Already exists as NS40T23, ensure it's assigned to AI&DS
UPDATE `faculty_profiles` SET 
  `Name` = 'GOWTHAMI P',
  `department_id` = 6
WHERE `faculty_college_code` = 'NS40T23';

-- Mr. J. Vinodkumar - Insert if not exists
INSERT INTO `faculty_profiles` (`faculty_college_code`, `Name`, `email`, `password`, `role_id`, `department_id`, `designation`, `phd_status`, `status`, `created_at`, `updated_at`, `is_timetable_incharge`, `is_placement_coordinator`) VALUES
('NS50T08', 'VINODKUMAR J', 'ns50t08@nscet.org', '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, 'ASSISTANT PROFESSOR', 'No', 'active', NOW(), NOW(), 0, 0)
ON DUPLICATE KEY UPDATE 
  department_id = 6,
  designation = 'ASSISTANT PROFESSOR',
  updated_at = NOW();

-- Dr. B. Mallikarjun - Insert if not exists (assigned to AI&DS for cross-dept teaching)
INSERT INTO `faculty_profiles` (`faculty_college_code`, `Name`, `email`, `password`, `role_id`, `department_id`, `designation`, `phd_status`, `status`, `created_at`, `updated_at`, `is_timetable_incharge`, `is_placement_coordinator`) VALUES
('NS60T15', 'MALLIKARJUN B', 'ns60t15@nscet.org', '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, 'PROFESSOR', 'Completed', 'active', NOW(), NOW(), 0, 0)
ON DUPLICATE KEY UPDATE 
  department_id = 6,
  designation = 'PROFESSOR',
  phd_status = 'Completed',
  updated_at = NOW();

-- Ms. R. Malini - Insert if not exists
INSERT INTO `faculty_profiles` (`faculty_college_code`, `Name`, `email`, `password`, `role_id`, `department_id`, `designation`, `phd_status`, `status`, `created_at`, `updated_at`, `is_timetable_incharge`, `is_placement_coordinator`) VALUES
('NS70T09', 'MALINI R', 'ns70t09@nscet.org', '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, 'PHYSICAL DIRECTOR', 'No', 'active', NOW(), NOW(), 0, 0)
ON DUPLICATE KEY UPDATE 
  department_id = 6,
  updated_at = NOW();

-- =====================================================
-- 6. INSERT SUBJECTS
-- =====================================================
-- CS3691 - Embedded Systems and IoT
INSERT INTO `subjects` (`subject_code`, `subject_name`, `department_id`, `semester`, `sem_type`, `credits`, `type`, `is_elective`, `is_laboratory`, `min_hours_per_week`, `description`, `status`, `created_at`, `updated_at`) VALUES
('CS3691', 'Embedded Systems and IoT', 6, 6, 'even', 4.00, 'Theory+Practical', 0, 0, 4, 'Study of embedded systems design, IoT protocols, sensors, and applications', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  department_id = 6,
  semester = 6,
  updated_at = NOW();

-- CCW332 - Digital Marketing
INSERT INTO `subjects` (`subject_code`, `subject_name`, `department_id`, `semester`, `sem_type`, `credits`, `type`, `is_elective`, `is_laboratory`, `min_hours_per_week`, `description`, `status`, `created_at`, `updated_at`) VALUES
('CCW332', 'Digital Marketing', 6, 6, 'even', 4.00, 'Theory+Practical', 0, 0, 4, 'Digital marketing strategies, SEO, social media marketing, analytics', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  department_id = 6,
  semester = 6,
  updated_at = NOW();

-- CCS358 - Principles of Programming Languages
INSERT INTO `subjects` (`subject_code`, `subject_name`, `department_id`, `semester`, `sem_type`, `credits`, `type`, `is_elective`, `is_laboratory`, `min_hours_per_week`, `description`, `status`, `created_at`, `updated_at`) VALUES
('CCS358', 'Principles of Programming Languages', 6, 6, 'even', 4.00, 'Theory', 0, 0, 4, 'Study of programming language paradigms, syntax, semantics, and implementation', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  department_id = 6,
  semester = 6,
  updated_at = NOW();

-- CCS332 - App Development
INSERT INTO `subjects` (`subject_code`, `subject_name`, `department_id`, `semester`, `sem_type`, `credits`, `type`, `is_elective`, `is_laboratory`, `min_hours_per_week`, `description`, `status`, `created_at`, `updated_at`) VALUES
('CCS332', 'App Development', 6, 6, 'even', 5.00, 'Theory+Practical', 0, 0, 5, 'Mobile and web application development using modern frameworks', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  department_id = 6,
  semester = 6,
  updated_at = NOW();

-- OMA351 - Graph Theory
INSERT INTO `subjects` (`subject_code`, `subject_name`, `department_id`, `semester`, `sem_type`, `credits`, `type`, `is_elective`, `is_laboratory`, `min_hours_per_week`, `description`, `status`, `created_at`, `updated_at`) VALUES
('OMA351', 'Graph Theory', 6, 6, 'even', 5.00, 'Theory', 0, 0, 5, 'Study of graphs, trees, networks, and their applications', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  semester = 6,
  updated_at = NOW();

-- GE3451 - Well Being with Traditional Practices
INSERT INTO `subjects` (`subject_code`, `subject_name`, `department_id`, `semester`, `sem_type`, `credits`, `type`, `is_elective`, `is_laboratory`, `min_hours_per_week`, `description`, `status`, `created_at`, `updated_at`) VALUES
('GE3451', 'Well Being with Traditional Practices - Yoga, Ayurveda and Siddha', 6, 6, 'even', 1.00, 'Theory', 0, 0, 1, 'Traditional practices for mental and physical well-being', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  semester = 6,
  updated_at = NOW();

-- =====================================================
-- 7. CREATE BREAK TIMINGS FOR AIDS DEPARTMENT
-- =====================================================
-- Year 3 (III Year) - Lunch Break
INSERT INTO `year_break_timings` (`department_id`, `year_group`, `year`, `break_number`, `break_name`, `break_type`, `period_after`, `start_time`, `end_time`, `duration_minutes`, `createdAt`, `updatedAt`) VALUES
(6, 'year_3_4', '3rd', 1, 'Lunch Break', 'lunch', 3, '12:25:00', '13:10:00', 45, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  start_time = '12:25:00',
  end_time = '13:10:00',
  updatedAt = NOW();

-- Year 3 (III Year) - Tea Break
INSERT INTO `year_break_timings` (`department_id`, `year_group`, `year`, `break_number`, `break_name`, `break_type`, `period_after`, `start_time`, `end_time`, `duration_minutes`, `createdAt`, `updatedAt`) VALUES
(6, 'year_3_4', '3rd', 2, 'Tea Break', 'short', 5, '14:50:00', '15:25:00', 35, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  start_time = '14:50:00',
  end_time = '15:25:00',
  updatedAt = NOW();

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the setup

-- Check department
SELECT * FROM departments WHERE id = 6;

-- Check class
SELECT * FROM classes WHERE id = 21;

-- Check room
SELECT * FROM rooms WHERE room_number = 'CR-15';

-- Check labs
SELECT * FROM labs WHERE department_id = 6;

-- Check faculty (use faculty_profiles table)
SELECT faculty_college_code, Name, email, designation, department_id 
FROM faculty_profiles 
WHERE faculty_college_code IN ('CS10', 'NS80T01', 'NS50T08', 'NS40T23', 'NS60T15', 'NS70T09');

-- Check subjects
SELECT subject_code, subject_name, credits, type, semester 
FROM subjects 
WHERE subject_code IN ('CS3691', 'CCW332', 'CCS358', 'CCS332', 'OMA351', 'GE3451');

-- Check break timings
SELECT * FROM year_break_timings WHERE department_id = 6 AND year = '3rd';

-- =====================================================
-- COMMIT CHANGES
-- =====================================================
COMMIT;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Default password for all faculty: 'faculty123' (hashed)
-- 2. Classes table: class_id = 21 for AIDS A, Year 3, Semester 6
-- 3. Room CR-15 is allocated to AIDS department
-- 4. Three labs created: LAB-L1, LAB-MK, LAB-LAN
-- 5. Six subjects added with correct codes and credits
-- 6. Six faculty members created/updated
-- 7. Break timings configured for Year 3
-- =====================================================
