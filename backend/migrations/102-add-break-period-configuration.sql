-- Add break_period_ids JSON field to timetable_master table
-- This stores the break period configuration per timetable
-- Default: [3, 5, 8] (traditional break periods)

ALTER TABLE timetable_master 
ADD COLUMN break_period_ids JSON DEFAULT JSON_ARRAY(3, 5, 8) 
COMMENT 'Array of period_slot_ids that are configured as breaks for this timetable (e.g., [3, 5, 8])';

-- Add index for faster queries
CREATE INDEX idx_break_period_ids ON timetable_master(id);
