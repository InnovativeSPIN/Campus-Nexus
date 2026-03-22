-- Create course_lesson_plans table (Section X Course Plan)
CREATE TABLE IF NOT EXISTS `course_lesson_plans` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `faculty_id` INT(11) NOT NULL,
  `subject_id` INT(11) NOT NULL,
  `class_id` INT(11) NOT NULL,
  `academic_year` VARCHAR(9) NOT NULL,
  `semester` TINYINT(2) NOT NULL,
  `sno` TINYINT(3) UNSIGNED NOT NULL,
  `unit_number` TINYINT(1) NOT NULL,
  `unit_label` VARCHAR(20) NOT NULL,
  `topic` TEXT NOT NULL,
  `tentative_date` DATE DEFAULT NULL,
  `co_number` VARCHAR(20) NOT NULL,
  `btl` VARCHAR(20) NOT NULL,
  `delivery_mode` VARCHAR(100) DEFAULT NULL,
  `reference_book` VARCHAR(255) DEFAULT NULL,
  `periods_required` TINYINT(2) NOT NULL DEFAULT 1,
  `cumulative_periods` TINYINT(3) UNSIGNED DEFAULT NULL,
  `is_completed` TINYINT(1) NOT NULL DEFAULT 0,
  `actual_date_from` DATE DEFAULT NULL,
  `actual_date_to` DATE DEFAULT NULL,
  `periods_taken` TINYINT(2) DEFAULT 0,
  `deviation_reason` TEXT DEFAULT NULL,
  `created_by` INT(11) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_plan_topic` (`faculty_id`, `subject_id`, `class_id`, `academic_year`, `semester`, `sno`),
  KEY `idx_clp_faculty` (`faculty_id`),
  KEY `idx_clp_subject` (`subject_id`),
  KEY `idx_clp_class` (`class_id`),
  KEY `idx_clp_unit` (`unit_number`),
  KEY `idx_clp_completed` (`is_completed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create period_topic_log table (Period to Topic mapping)
CREATE TABLE IF NOT EXISTS `period_topic_log` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `attendance_date` DATE NOT NULL,
  `period_slot_id` TINYINT(3) UNSIGNED NOT NULL,
  `faculty_id` INT(11) NOT NULL,
  `class_id` INT(11) NOT NULL,
  `subject_id` INT(11) NOT NULL,
  `lesson_plan_id` INT(11) NOT NULL,
  `unit_number` TINYINT(1) NOT NULL,
  `topic_summary` VARCHAR(500) DEFAULT NULL,
  `periods_covered` TINYINT(2) NOT NULL DEFAULT 1,
  `co_number` VARCHAR(20) DEFAULT NULL,
  `btl` VARCHAR(20) DEFAULT NULL,
  `is_deviation` TINYINT(1) NOT NULL DEFAULT 0,
  `deviation_note` VARCHAR(500) DEFAULT NULL,
  `master_slot_id` INT(11) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ptl_date_period_class_subj` (`attendance_date`, `period_slot_id`, `class_id`, `subject_id`),
  KEY `idx_ptl_faculty` (`faculty_id`),
  KEY `idx_ptl_date` (`attendance_date`),
  KEY `idx_ptl_lesson_plan` (`lesson_plan_id`),
  KEY `idx_ptl_subject` (`subject_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign keys to course_lesson_plans
ALTER TABLE `course_lesson_plans`
ADD CONSTRAINT `fk_clp_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles`(`faculty_id`) ON DELETE CASCADE,
ADD CONSTRAINT `fk_clp_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
ADD CONSTRAINT `fk_clp_class` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE;

-- Add foreign keys to period_topic_log
ALTER TABLE `period_topic_log`
ADD CONSTRAINT `fk_ptl_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles`(`faculty_id`) ON DELETE CASCADE,
ADD CONSTRAINT `fk_ptl_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`),
ADD CONSTRAINT `fk_ptl_class` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`),
ADD CONSTRAINT `fk_ptl_lesson_plan` FOREIGN KEY (`lesson_plan_id`) REFERENCES `course_lesson_plans`(`id`),
ADD CONSTRAINT `fk_ptl_period` FOREIGN KEY (`period_slot_id`) REFERENCES `period_slots`(`id`),
ADD CONSTRAINT `fk_ptl_slot` FOREIGN KEY (`master_slot_id`) REFERENCES `timetable_master_slots`(`id`) ON DELETE SET NULL;

-- Add lesson_plan_id to student_attendance table if not exists
ALTER TABLE `student_attendance` 
ADD COLUMN `lesson_plan_id` INT NULL AFTER `remarks`;

-- Create foreign key if table already exists
ALTER TABLE `student_attendance`
ADD CONSTRAINT `fk_student_attendance_lesson_plan` 
  FOREIGN KEY (`lesson_plan_id`) 
  REFERENCES `course_lesson_plans`(`id`) 
  ON DELETE SET NULL;

-- Create index for student_attendance
CREATE INDEX `idx_student_attendance_lesson_plan` 
ON `student_attendance`(`lesson_plan_id`);
