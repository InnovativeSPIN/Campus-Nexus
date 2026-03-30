-- Timetable Management System - Database Migration SQL
-- This file creates all necessary tables for the timetable management system

-- Create Period Configuration Table
CREATE TABLE IF NOT EXISTS `period_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `department_id` INT NULL,
  `period_number` INT NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `duration_minutes` INT NOT NULL,
  `is_break` BOOLEAN DEFAULT FALSE,
  `break_name` VARCHAR(100) NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_period_dept` (`department_id`, `period_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Timetable Master Table
CREATE TABLE IF NOT EXISTS `timetable_master` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `academic_year` VARCHAR(20) NOT NULL,
  `semester` ENUM('odd', 'even') NOT NULL,
  `department_id` INT NULL,
  `year` ENUM('1st', '2nd', '3rd', '4th') NULL,
  `timetable_incharge_id` INT NULL,
  `status` ENUM('draft', 'pending_approval', 'active', 'inactive') DEFAULT 'draft',
  `approved_by` INT NULL,
  `approved_at` TIMESTAMP NULL,
  `created_by` INT NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_department` (`department_id`),
  INDEX `idx_academic_year` (`academic_year`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Timetable Details Table (7 periods per day)
CREATE TABLE IF NOT EXISTS `timetable_details` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `timetable_id` INT NOT NULL,
  `class_id` INT NOT NULL,
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
  `period_number` INT NOT NULL,
  `subject_id` INT NULL,
  `faculty_id` INT NULL,
  `room_number` VARCHAR(50) NULL,
  `period_type` ENUM('lecture', 'practical', 'tutorial', 'break', 'lunch') DEFAULT 'lecture',
  `is_break` BOOLEAN DEFAULT FALSE,
  `status` ENUM('active', 'cancelled', 'pending') DEFAULT 'active',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_timetable` (`timetable_id`),
  INDEX `idx_class` (`class_id`),
  INDEX `idx_faculty` (`faculty_id`),
  INDEX `idx_day_period` (`day_of_week`, `period_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Faculty Leave Schedules Table
CREATE TABLE IF NOT EXISTS `faculty_leave_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `faculty_id` INT NOT NULL,
  `leave_id` INT NULL,
  `from_date` DATE NOT NULL,
  `to_date` DATE NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `reason` TEXT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_faculty` (`faculty_id`),
  INDEX `idx_date_range` (`from_date`, `to_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Timetable Staff Alterations Table
CREATE TABLE IF NOT EXISTS `timetable_staff_alterations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `timetable_id` INT NOT NULL,
  `timetable_detail_id` INT NOT NULL,
  `original_faculty_id` INT NOT NULL,
  `alternative_faculty_id` INT NOT NULL,
  `reason` TEXT NOT NULL,
  `requested_by` INT NOT NULL,
  `status` ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  `alternative_response` TEXT NULL,
  `accepted_at` TIMESTAMP NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_timetable` (`timetable_id`),
  INDEX `idx_original_faculty` (`original_faculty_id`),
  INDEX `idx_alternative_faculty` (`alternative_faculty_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Year Break Timings Table
CREATE TABLE IF NOT EXISTS `year_break_timings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `department_id` INT NULL,
  `year` ENUM('1st', '2nd', '3rd', '4th') NOT NULL,
  `break_number` INT NOT NULL,
  `break_name` VARCHAR(100) NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `duration_minutes` INT NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_break` (`department_id`, `year`, `break_number`),
  INDEX `idx_year` (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default period configuration (7 periods per day)
-- Period 1: 09:00 - 09:50
-- Period 2: 09:50 - 10:40
-- Tea Break: 10:40 - 11:10 (30 min)
-- Period 3: 11:10 - 12:00
-- Period 4: 12:00 - 12:50
-- Lunch Break: 12:50 - 01:30 (40 min)
-- Period 5: 01:30 - 02:20

INSERT INTO `period_config` (`period_number`, `start_time`, `end_time`, `duration_minutes`, `is_break`, `break_name`, `status`)
VALUES
  (1, '09:00:00', '09:50:00', 50, FALSE, NULL, 'active'),
  (2, '09:50:00', '10:40:00', 50, FALSE, NULL, 'active'),
  (3, '10:40:00', '11:10:00', 30, TRUE, 'Tea Break', 'active'),
  (4, '11:10:00', '12:00:00', 50, FALSE, NULL, 'active'),
  (5, '12:00:00', '12:50:00', 50, FALSE, NULL, 'active'),
  (6, '12:50:00', '13:30:00', 40, TRUE, 'Lunch Break', 'active'),
  (7, '13:30:00', '14:20:00', 50, FALSE, NULL, 'active');

-- Insert year-specific break timings
-- 1st & 2nd year: 30 min tea, 40 min lunch (longer lunch)
-- 3rd & 4th year: 20 min tea, 30 min lunch (shorter breaks)

-- 1st Year
INSERT INTO `year_break_timings` (`year`, `break_name`, `start_time`, `end_time`, `duration_minutes`)
VALUES
  ('1st', 'Tea Break', '10:40:00', '11:10:00', 30),
  ('1st', 'Lunch Break', '12:50:00', '13:30:00', 40);

-- 2nd Year
INSERT INTO `year_break_timings` (`year`, `break_name`, `start_time`, `end_time`, `duration_minutes`)
VALUES
  ('2nd', 'Tea Break', '10:40:00', '11:10:00', 30),
  ('2nd', 'Lunch Break', '12:50:00', '13:30:00', 40);

-- 3rd Year
INSERT INTO `year_break_timings` (`year`, `break_name`, `start_time`, `end_time`, `duration_minutes`)
VALUES
  ('3rd', 'Tea Break', '10:40:00', '11:00:00', 20),
  ('3rd', 'Lunch Break', '12:50:00', '13:20:00', 30);

-- 4th Year
INSERT INTO `year_break_timings` (`year`, `break_name`, `start_time`, `end_time`, `duration_minutes`)
VALUES
  ('4th', 'Tea Break', '10:40:00', '11:00:00', 20),
  ('4th', 'Lunch Break', '12:50:00', '13:20:00', 30);

-- Verify tables created
SELECT 'Tables created successfully!' AS status;
SHOW TABLES LIKE '%timetable%';
SHOW TABLES LIKE '%period%';
SHOW TABLES LIKE '%leave%';
