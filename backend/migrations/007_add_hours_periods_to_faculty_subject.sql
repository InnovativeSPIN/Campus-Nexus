-- Add total_hours and no_of_periods columns to faculty_subject_assignments table
ALTER TABLE faculty_subject_assignments
ADD COLUMN total_hours INT DEFAULT 0 COMMENT 'Total hours for the subject',
ADD COLUMN no_of_periods INT DEFAULT 0 COMMENT 'Number of periods per week';
