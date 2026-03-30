-- Drop UNIQUE constraint on subject_code to allow multiple subjects with same code
-- Subject IDs will now be reusable across subjects

-- Check if the constraint exists and drop it
ALTER TABLE subjects 
DROP INDEX IF EXISTS `subject_code`;

-- Verify the change (optional)
-- SELECT COLUMN_NAME, COLUMN_KEY FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'eduvertex' AND TABLE_NAME = 'subjects' AND COLUMN_NAME = 'subject_code';
