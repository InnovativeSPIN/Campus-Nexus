-- Add family_photo column to student_bio table
ALTER TABLE student_bio
ADD COLUMN family_photo VARCHAR(255) NULL COMMENT 'Path to family photo';

-- Create index for better query performance
CREATE INDEX idx_family_photo ON student_bio(family_photo);
