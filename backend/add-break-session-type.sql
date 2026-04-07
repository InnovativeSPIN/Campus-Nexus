-- Migration: Add 'break' to session_type ENUM in timetable_master_slots
-- This allows break periods to have session_type = 'break'
-- 
-- Run this SQL when your database is running:
-- mysql -u root eduvertex < backend/add-break-session-type.sql

ALTER TABLE timetable_master_slots 
MODIFY COLUMN session_type ENUM('theory', 'lab', 'tutorial', 'activity', 'project', 'free', 'break') 
DEFAULT 'theory';

-- Verify the change
SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'timetable_master_slots' 
AND COLUMN_NAME = 'session_type';

-- Expected output: enum('theory','lab','tutorial','activity','project','free','break')
