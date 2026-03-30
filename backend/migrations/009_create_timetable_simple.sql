-- Create simplified timetable table for bulk CSV upload
-- Table structure: id, facultyId, facultyName, department, year, section, day, hour, subject, academicYear, createdAt
-- UNIQUE constraint on (facultyId, day, hour)

CREATE TABLE IF NOT EXISTS `timetable` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `facultyId` VARCHAR(50) NOT NULL,
  `facultyName` VARCHAR(100) NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `year` VARCHAR(20) NOT NULL,
  `section` VARCHAR(10) NOT NULL,
  `day` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  `hour` INT NOT NULL,
  `subject` VARCHAR(100) NOT NULL,
  `academicYear` VARCHAR(20) NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_faculty_day_hour` (`facultyId`, `day`, `hour`),
  INDEX `idx_facultyId` (`facultyId`),
  INDEX `idx_department` (`department`),
  INDEX `idx_academicYear` (`academicYear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
