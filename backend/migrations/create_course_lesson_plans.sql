-- Migration: Create Course Lesson Plan Tables
-- Date: 2026-03-20
-- Purpose: Enable Section X (Lesson Plan) automation and period-to-topic mapping

-- ==============================================
-- Table 1: course_lesson_plans
-- ==============================================
-- Stores lesson plan topics for each subject per faculty
-- Maps directly to PDF Course File Section X

CREATE TABLE IF NOT EXISTS course_lesson_plans (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT(11) NOT NULL,
  subject_id INT(11) NOT NULL,
  class_id INT(11) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester INT(2) NOT NULL,
  sno TINYINT(3) NOT NULL COMMENT 'Sequential number within subject (1-based)',
  unit_number TINYINT(2) COMMENT 'Unit number (1, 2, 3, etc.)',
  unit_label VARCHAR(50) COMMENT 'Unit label from PDF (e.g., UNIT I, UNIT II)',
  topic TEXT NOT NULL COMMENT 'Full topic name from Course File PDF',
  co_number VARCHAR(20) COMMENT 'Course Outcome: CO1, CO2, C502.1 etc.',
  btl VARCHAR(100) COMMENT 'Bloom TAX Level: BT1, BT2, BT3, BT4 (comma-separated)',
  delivery_mode VARCHAR(255) COMMENT 'Content Delivery Mode: PPT, E-Resources, BB, Case Study, etc.',
  reference_book VARCHAR(255) COMMENT 'Reference Book citation: T1-416, T2-03, etc.',
  periods_required TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Number of class periods needed for this topic',
  periods_taken TINYINT(3) NOT NULL DEFAULT 0 COMMENT 'Number of periods already taught (cumulative)',
  cumulative_periods INT(11) COMMENT 'Running total: SUM(periods_required) from start to this row',
  is_completed BOOLEAN NOT NULL DEFAULT FALSE COMMENT '1 if periods_taken >= periods_required',
  tentative_date DATE COMMENT 'Planned/target date to cover this topic',
  created_by INT(11) COMMENT 'User ID who created this plan',
  updated_by INT(11) COMMENT 'User ID who last modified',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Uniqueness: One row per topic per faculty per subject per class per semester
  UNIQUE KEY uq_course_plan (faculty_id, subject_id, class_id, academic_year, semester, sno),
  
  -- Performance indexes
  KEY idx_faculty_subject (faculty_id, subject_id),
  KEY idx_class_academic (class_id, academic_year, semester),
  KEY idx_completed (is_completed),
  KEY idx_date_range (attendance_date),
  
  -- Foreign Keys
  CONSTRAINT fk_clp_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(faculty_id) ON DELETE CASCADE,
  CONSTRAINT fk_clp_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_clp_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Section X: Lesson Plans from Course File';

-- ==============================================
-- Table 2: period_topic_log
-- ==============================================
-- Logs which lesson plan topic was taught in each attendance period
-- Auto-populated when faculty marks attendance and selects topic
-- Bridge between attendance and lesson plan progress tracking

CREATE TABLE IF NOT EXISTS period_topic_log (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  attendance_date DATE NOT NULL COMMENT 'Date of the class held',
  period_slot_id INT(11) NOT NULL COMMENT 'FK -> period_slots.id (period number)',
  faculty_id INT(11) NOT NULL COMMENT 'Teaching faculty',
  class_id INT(11) NOT NULL COMMENT 'Class where taught',
  subject_id INT(11) NOT NULL COMMENT 'Subject taught',
  lesson_plan_id INT(11) NOT NULL COMMENT 'FK -> course_lesson_plans.id (the topic taught)',
  co_number VARCHAR(20) COMMENT 'CO covered (duplicated for denormalization)',
  btl VARCHAR(100) COMMENT 'BTL covered (duplicated for denormalization)',
  is_deviation BOOLEAN NOT NULL DEFAULT FALSE COMMENT '1 if taught different topic than planned',
  deviation_note TEXT COMMENT 'Reason for teaching different topic',
  master_slot_id INT(11) COMMENT 'FK -> timetable_master_slots.id (for direct timetable reference)',
  created_by INT(11) COMMENT 'User who created this log entry',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Prevent duplicate logging for same period
  UNIQUE KEY uq_period_log (attendance_date, period_slot_id, faculty_id, class_id, subject_id),
  
  -- Performance indexes
  KEY idx_lesson_plan (lesson_plan_id),
  KEY idx_faculty_date (faculty_id, attendance_date),
  KEY idx_subject_date (subject_id, attendance_date),
  KEY idx_class_date (class_id, attendance_date),
  
  -- Foreign Keys
  CONSTRAINT fk_ptl_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(faculty_id) ON DELETE CASCADE,
  CONSTRAINT fk_ptl_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_ptl_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_ptl_lesson_plan FOREIGN KEY (lesson_plan_id) REFERENCES course_lesson_plans(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ptl_slot FOREIGN KEY (master_slot_id) REFERENCES timetable_master_slots(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Period-to-Topic log: tracking which lesson was taught when';

-- ==============================================
-- Views (optional, for easy querying)
-- ==============================================

-- View: Course Lesson Plan Progress (Summary per subject per faculty)
CREATE OR REPLACE VIEW course_lesson_plan_progress AS
SELECT 
  clp.faculty_id,
  clp.subject_id,
  clp.class_id,
  clp.academic_year,
  clp.semester,
  s.subject_name,
  c.name as class_name,
  COUNT(clp.id) as total_topics,
  SUM(clp.periods_required) as total_periods_planned,
  SUM(clp.periods_taken) as total_periods_taught,
  SUM(CASE WHEN clp.is_completed = 1 THEN 1 ELSE 0 END) as topics_completed,
  ROUND(100 * SUM(CASE WHEN clp.is_completed = 1 THEN 1 ELSE 0 END) / COUNT(clp.id), 2) as completion_percentage
FROM course_lesson_plans clp
JOIN subjects s ON s.id = clp.subject_id
JOIN classes c ON c.id = clp.class_id
GROUP BY clp.faculty_id, clp.subject_id, clp.class_id, clp.academic_year, clp.semester;

-- View: Section X Auto-Report (Ready for Course File)
CREATE OR REPLACE VIEW course_file_section_x AS
SELECT 
  clp.sno,
  clp.unit_number,
  clp.unit_label,
  clp.topic,
  clp.co_number,
  clp.btl,
  clp.delivery_mode,
  clp.reference_book,
  clp.periods_required,
  clp.cumulative_periods,
  clp.periods_taken,
  CASE WHEN clp.periods_taken >= clp.periods_required THEN 'Y' ELSE 'N' END as covered,
  fp.Name as faculty_name,
  s.subject_name,
  c.name as class_name,
  clp.academic_year,
  clp.semester
FROM course_lesson_plans clp
JOIN faculty_profiles fp ON fp.faculty_id = clp.faculty_id
JOIN subjects s ON s.id = clp.subject_id
JOIN classes c ON c.id = clp.class_id
ORDER BY clp.sno ASC;

-- ==============================================
-- Indexes for common queries
-- ==============================================

-- Query: Find all pending topics for a faculty
ALTER TABLE course_lesson_plans ADD INDEX idx_pending (faculty_id, is_completed);

-- Query: Get progress report by date range
ALTER TABLE period_topic_log ADD INDEX idx_date_faculty_subject (attendance_date, faculty_id, subject_id);
