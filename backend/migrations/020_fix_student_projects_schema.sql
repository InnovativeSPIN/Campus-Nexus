-- Fix student_projects table schema issues
-- Issue 1: title should allow NULL
-- Issue 2: approvedById should allow NULL (projects start as pending without approver)

ALTER TABLE student_projects 
  MODIFY COLUMN title VARCHAR(200) NULL,
  MODIFY COLUMN approvedById INT NULL;

-- Add foreign key constraint for approvedById if it doesn't exist
ALTER TABLE student_projects 
  ADD CONSTRAINT fk_student_projects_approvedBy 
  FOREIGN KEY (approvedById) REFERENCES Faculty(id) ON DELETE SET NULL;
