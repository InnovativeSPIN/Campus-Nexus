-- =====================================================================
-- Add Foreign Key Constraints to Existing Tables
-- Link timetable_slots and student_attendance_entry to subjects
-- =====================================================================

-- Check if constraint exists before adding
ALTER TABLE `timetable_slots` 
ADD CONSTRAINT `fk_timetable_slots_subject` 
FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `student_attendance_entry` 
ADD CONSTRAINT `fk_attendance_subject` 
FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

SELECT 'Foreign key constraints added successfully!' as status;
