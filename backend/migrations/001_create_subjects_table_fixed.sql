-- =====================================================================
-- SUBJECTS TABLE CREATION AND SCHEMA UPDATES
-- For college subject management system
-- Department Admin manages subjects per department/semester/class
-- =====================================================================

SET FOREIGN_KEY_CHECKS=0;

-- Create subjects table
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `subject_code` varchar(20) NOT NULL UNIQUE,
  `subject_name` varchar(255) NOT NULL,
  `description` text,
  `department_id` int(11) NOT NULL,
  `semester` tinyint(2) NOT NULL COMMENT '1-8 semesters',
  `class_id` int(11) DEFAULT NULL COMMENT 'Specific class or NULL for all classes in dept',
  `credits` decimal(4,2) NOT NULL DEFAULT 4.00,
  `type` enum('Theory','Practical','Theory+Practical','Project','Seminar','Internship') NOT NULL DEFAULT 'Theory',
  `is_elective` tinyint(1) NOT NULL DEFAULT 0,
  `is_laboratory` tinyint(1) NOT NULL DEFAULT 0,
  `min_hours_per_week` int(11) DEFAULT 3,
  `max_students` int(11) DEFAULT NULL,
  `status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
  `created_by` int(11) NOT NULL COMMENT 'FK → users.id (department-admin)',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  CONSTRAINT `fk_subjects_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_subjects_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_subjects_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  INDEX `idx_subject_code` (`subject_code`),
  INDEX `idx_subject_dept` (`department_id`),
  INDEX `idx_subject_semester` (`semester`),
  INDEX `idx_subject_class` (`class_id`),
  INDEX `idx_subject_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci 
  COMMENT='Stores subject details for college management';

-- =====================================================================
-- FACULTY SUBJECT ASSIGNMENT TABLE (Many-to-Many Relationship)
-- Maps faculty members to subjects they handle
-- =====================================================================
CREATE TABLE IF NOT EXISTS `faculty_subject_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `faculty_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `academic_year` varchar(9) NOT NULL COMMENT 'e.g. 2024-2025',
  `semester` tinyint(2) NOT NULL,
  `class_id` int(11) DEFAULT NULL COMMENT 'Specific class assignment',
  `allocation_date` date NOT NULL,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  CONSTRAINT `fk_fsa_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fsa_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fsa_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  UNIQUE KEY `unique_faculty_subject_class` (`faculty_id`, `subject_id`, `class_id`, `academic_year`),
  INDEX `idx_fsa_subject` (`subject_id`),
  INDEX `idx_fsa_class` (`class_id`),
  INDEX `idx_fsa_academic_year` (`academic_year`),
  INDEX `idx_fsa_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Maps faculty to subjects they teach (many-to-many)';

-- =====================================================================
-- SUBJECT CLASS MAPPING TABLE
-- Associates subjects with specific classes for semester/department
-- =====================================================================
CREATE TABLE IF NOT EXISTS `subject_class_mappings` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `subject_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `semester` tinyint(2) NOT NULL,
  `academic_year` varchar(9) NOT NULL,
  `is_core` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  CONSTRAINT `fk_scm_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_scm_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_scm_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_subject_class_semester` (`subject_id`, `class_id`, `semester`, `academic_year`),
  INDEX `idx_scm_class` (`class_id`),
  INDEX `idx_scm_semester` (`semester`),
  INDEX `idx_scm_dept` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Maps subjects to classes and semesters';

-- =====================================================================
-- INSERT SAMPLE SUBJECTS
-- =====================================================================

-- CSE Department Subjects (Semester 1)
INSERT IGNORE INTO `subjects` 
  (`subject_code`, `subject_name`, `description`, `department_id`, `semester`, `credits`, `type`, `is_elective`, `created_by`) 
VALUES 
  ('CS101', 'Programming in C', 'Fundamentals of C programming', 1, 1, 3.00, 'Theory', 0, 1),
  ('CS102', 'Programming Lab - C', 'C Programming practical lab sessions', 1, 1, 1.50, 'Practical', 0, 1),
  ('CS103', 'Data Structures', 'Arrays, Linked Lists, Stacks, Queues', 1, 2, 4.00, 'Theory', 0, 1),
  ('CS104', 'Database Management', 'Relational databases and SQL', 1, 3, 4.00, 'Theory', 0, 1);

-- ECE Department Subjects
INSERT IGNORE INTO `subjects` 
  (`subject_code`, `subject_name`, `description`, `department_id`, `semester`, `credits`, `type`, `is_elective`, `created_by`) 
VALUES 
  ('EC101', 'Basic Electronics', 'Diodes, Transistors, and Applications', 2, 1, 3.00, 'Theory', 0, 1),
  ('EC102', 'Electronics Lab', 'Practical electronics experiments', 2, 1, 1.50, 'Practical', 0, 1);

-- MECH Department Subjects
INSERT IGNORE INTO `subjects` 
  (`subject_code`, `subject_name`, `description`, `department_id`, `semester`, `credits`, `type`, `is_elective`, `created_by`) 
VALUES 
  ('ME101', 'Engineering Mechanics', 'Statics and Dynamics', 3, 1, 4.00, 'Theory', 0, 1),
  ('ME102', 'Thermodynamics', 'Laws of thermodynamics and applications', 3, 2, 3.00, 'Theory', 0, 1);

-- =====================================================================
-- ADD FOREIGN KEY CONSTRAINTS TO EXISTING TABLES (if not already present)
-- =====================================================================

-- Check and add FK to timetable_slots if needed
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
  WHERE CONSTRAINT_NAME = 'fk_timetable_slots_subject'
  AND TABLE_NAME = 'timetable_slots'
);

-- Only add if it doesn't exist
IF @constraint_exists = 0 THEN
  ALTER TABLE `timetable_slots` 
    ADD CONSTRAINT `fk_timetable_slots_subject` 
    FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE;
END IF;

-- Check and add FK to student_attendance_entry if needed
SET @constraint_exists2 = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
  WHERE CONSTRAINT_NAME = 'fk_attendance_subject'
  AND TABLE_NAME = 'student_attendance_entry'
);

-- Only add if it doesn't exist
IF @constraint_exists2 = 0 THEN
  ALTER TABLE `student_attendance_entry` 
    ADD CONSTRAINT `fk_attendance_subject` 
    FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE;
END IF;

-- =====================================================================
-- ADD SUBJECT_ID COLUMN TO TIMETABLE_SLOT_ASSIGNMENTS (if not exists)
-- =====================================================================
ALTER TABLE `timetable_slot_assignments` 
  ADD COLUMN `subject_id` int(11) DEFAULT NULL AFTER `subject_name`;

-- Add FK constraint to timetable_slot_assignments if not exists
SET @constraint_exists3 = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
  WHERE CONSTRAINT_NAME = 'fk_tsa_subject'
  AND TABLE_NAME = 'timetable_slot_assignments'
);

IF @constraint_exists3 = 0 THEN
  ALTER TABLE `timetable_slot_assignments` 
    ADD CONSTRAINT `fk_tsa_subject` 
    FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE;
END IF;

SET FOREIGN_KEY_CHECKS=1;

-- =====================================================================
-- VERIFY CREATION
-- =====================================================================
SELECT 'Subjects table created successfully' as status;
SELECT TABLE_NAME, TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN ('subjects', 'faculty_subject_assignments', 'subject_class_mappings');

-- =====================================================================
-- SUMMARY OF CHANGES
-- =====================================================================
-- 1. Created `subjects` table with complete subject information
-- 2. Created `faculty_subject_assignments` table for many-to-many faculty-subject mapping
-- 3. Created `subject_class_mappings` table for subject-class-semester associations
-- 4. Added indexes for optimal query performance
-- 5. Inserted 8 sample subjects for testing
-- =====================================================================
