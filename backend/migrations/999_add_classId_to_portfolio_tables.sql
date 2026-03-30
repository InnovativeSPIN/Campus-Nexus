-- Add classId to portfolio tables for direct class-based filtering
-- This ensures portfolio items can be quickly filtered by class incharge

ALTER TABLE student_sports ADD COLUMN classId INT NULL;
ALTER TABLE student_events ADD COLUMN classId INT NULL;
ALTER TABLE student_certifications ADD COLUMN classId INT NULL;
ALTER TABLE student_projects ADD COLUMN classId INT NULL;

-- Add foreign key constraints
ALTER TABLE student_sports ADD CONSTRAINT fk_student_sports_classId FOREIGN KEY (classId) REFERENCES class(id);
ALTER TABLE student_events ADD CONSTRAINT fk_student_events_classId FOREIGN KEY (classId) REFERENCES class(id);
ALTER TABLE student_certifications ADD CONSTRAINT fk_student_certifications_classId FOREIGN KEY (classId) REFERENCES class(id);
ALTER TABLE student_projects ADD CONSTRAINT fk_student_projects_classId FOREIGN KEY (classId) REFERENCES class(id);

-- Populate existing records with classId from student
UPDATE student_sports ss SET classId = (SELECT classId FROM student s WHERE s.id = ss.studentId) WHERE ss.classId IS NULL;
UPDATE student_events se SET classId = (SELECT classId FROM student s WHERE s.id = se.studentId) WHERE se.classId IS NULL;
UPDATE student_certifications sc SET classId = (SELECT classId FROM student s WHERE s.id = sc.studentId) WHERE sc.classId IS NULL;
UPDATE student_projects sp SET classId = (SELECT classId FROM student s WHERE s.id = sp.studentId) WHERE sp.classId IS NULL;

-- Add indexes for performance
CREATE INDEX idx_student_sports_classId ON student_sports(classId);
CREATE INDEX idx_student_events_classId ON student_events(classId);
CREATE INDEX idx_student_certifications_classId ON student_certifications(classId);
CREATE INDEX idx_student_projects_classId ON student_projects(classId);
