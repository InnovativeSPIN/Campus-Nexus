-- Add siblings field to student_bio table if it doesn't exist
ALTER TABLE student_bio
ADD COLUMN IF NOT EXISTS siblings JSON NULL COMMENT 'JSON array of sibling information including name, age, education, and occupation';

-- Example structure for siblings JSON:
-- [
--   {
--     "name": "John Doe",
--     "age": "22",
--     "education": "B.Tech",
--     "occupation": "Software Engineer"
--   },
--   {
--     "name": "Jane Doe",
--     "age": "20",
--     "education": "UG",
--     "occupation": "Student"
--   }
-- ]
