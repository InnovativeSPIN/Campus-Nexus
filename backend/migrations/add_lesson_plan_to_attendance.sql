-- Add lesson_plan_id field to student_attendance table
ALTER TABLE `student_attendance` 
ADD COLUMN `lesson_plan_id` INT NULL AFTER `remarks`,
ADD CONSTRAINT `fk_student_attendance_lesson_plan` 
  FOREIGN KEY (`lesson_plan_id`) 
  REFERENCES `course_lesson_plans`(`id`) 
  ON DELETE SET NULL;

-- Create index for efficient queries
CREATE INDEX `idx_student_attendance_lesson_plan` 
ON `student_attendance`(`lesson_plan_id`);
