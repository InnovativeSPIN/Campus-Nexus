-- Add departmentId column to timetable table
ALTER TABLE timetable ADD COLUMN departmentId INT AFTER facultyId;

-- Add foreign key constraint (optional, depends on your setup)
-- ALTER TABLE timetable 
-- ADD CONSTRAINT fk_timetable_department 
-- FOREIGN KEY (departmentId) REFERENCES departments(id);

-- Create index for faster queries
CREATE INDEX idx_timetable_department ON timetable(departmentId);
CREATE INDEX idx_timetable_dept_year_section ON timetable(departmentId, year, section);
