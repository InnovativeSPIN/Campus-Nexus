-- Migration: Add missing columns to faculty_events table
-- Purpose: Support dynamic event management with proper timestamps and organizer type tracking

-- Add missing columns to faculty_events table
ALTER TABLE `faculty_events` 
ADD COLUMN `organizer_type` ENUM('organized', 'participated') DEFAULT 'participated' AFTER `category`,
ADD COLUMN `url` TEXT DEFAULT NULL AFTER `document_url`,
ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `document_url`,
ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- Rename document_url to match naming convention (if needed for consistency)
-- Keeping document_url as is for backward compatibility

-- Create index for faster queries
ALTER TABLE `faculty_events` 
ADD INDEX `idx_faculty_id` (`faculty_id`),
ADD INDEX `idx_category` (`category`),
ADD INDEX `idx_event_date` (`event_date`);
