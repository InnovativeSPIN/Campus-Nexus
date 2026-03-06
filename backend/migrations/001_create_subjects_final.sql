-- =====================================================================
-- SUBJECTS TABLE - Core Implementation
-- =====================================================================

CREATE TABLE IF NOT EXISTS `subjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `subject_code` varchar(20) NOT NULL UNIQUE,
  `subject_name` varchar(255) NOT NULL,
  `description` text,
  `department_id` int(11) NOT NULL,
  `semester` tinyint(2) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `credits` decimal(4,2) NOT NULL DEFAULT 4.00,
  `type` enum('Theory','Practical','Theory+Practical','Project','Seminar','Internship') NOT NULL DEFAULT 'Theory',
  `is_elective` tinyint(1) NOT NULL DEFAULT 0,
  `is_laboratory` tinyint(1) NOT NULL DEFAULT 0,
  `min_hours_per_week` int(11) DEFAULT 3,
  `max_students` int(11) DEFAULT NULL,
  `status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
  `created_by` int(11) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  KEY `idx_subject_code` (`subject_code`),
  KEY `idx_subject_dept` (`department_id`),
  KEY `idx_subject_semester` (`semester`),
  KEY `idx_subject_class` (`class_id`),
  KEY `idx_subject_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================================
-- FACULTY SUBJECT ASSIGNMENTS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS `faculty_subject_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `faculty_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `academic_year` varchar(9) NOT NULL,
  `semester` tinyint(2) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `allocation_date` date NOT NULL,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  UNIQUE KEY `unique_faculty_subject_class` (`faculty_id`, `subject_id`, `class_id`, `academic_year`),
  KEY `idx_fsa_subject` (`subject_id`),
  KEY `idx_fsa_faculty` (`faculty_id`),
  KEY `idx_fsa_class` (`class_id`),
  KEY `idx_fsa_academic_year` (`academic_year`),
  KEY `idx_fsa_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================================
-- SUBJECT CLASS MAPPINGS TABLE
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
  UNIQUE KEY `unique_subject_class_semester` (`subject_id`, `class_id`, `semester`, `academic_year`),
  KEY `idx_scm_class` (`class_id`),
  KEY `idx_scm_semester` (`semester`),
  KEY `idx_scm_dept` (`department_id`),
  KEY `idx_scm_subject` (`subject_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================================
-- INSERT SAMPLE SUBJECTS FOR TESTING
-- =====================================================================

INSERT IGNORE INTO `subjects` 
  (`subject_code`, `subject_name`, `description`, `department_id`, `semester`, `credits`, `type`, `is_elective`, `created_by`) 
VALUES 
  ('CS101', 'Programming in C', 'Fundamentals of C programming', 1, 1, 3.00, 'Theory', 0, 1),
  ('CS102', 'Programming Lab - C', 'C Programming practical lab sessions', 1, 1, 1.50, 'Practical', 0, 1),
  ('CS103', 'Data Structures', 'Arrays, Linked Lists, Stacks, Queues', 1, 2, 4.00, 'Theory', 0, 1),
  ('CS104', 'Database Management', 'Relational databases and SQL', 1, 3, 4.00, 'Theory', 0, 1),
  ('EC101', 'Basic Electronics', 'Diodes, Transistors, and Applications', 2, 1, 3.00, 'Theory', 0, 1),
  ('EC102', 'Electronics Lab', 'Practical electronics experiments', 2, 1, 1.50, 'Practical', 0, 1),
  ('ME101', 'Engineering Mechanics', 'Statics and Dynamics', 3, 1, 4.00, 'Theory', 0, 1),
  ('ME102', 'Thermodynamics', 'Laws of thermodynamics and applications', 3, 2, 3.00, 'Theory', 0, 1);

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 'Tables created successfully!' as status;
SELECT 'Subjects available:' as info;
SELECT subject_code, subject_name, department_id, semester, credits FROM subjects ORDER BY department_id, semester;
