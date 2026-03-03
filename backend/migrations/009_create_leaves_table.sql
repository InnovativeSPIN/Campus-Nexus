-- Create leaves table for leave request and approval workflow
-- This table stores all leave requests from faculty and students

CREATE TABLE IF NOT EXISTS `leaves` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `applicantId` int(11) NOT NULL COMMENT 'Faculty ID or Student ID',
  `departmentId` int(11) COMMENT 'Department ID of the applicant',
  `leaveType` enum('Medical','Casual','Earned','On-Duty','Personal','Maternity','Comp-Off') NOT NULL DEFAULT 'Casual',
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `totalDays` decimal(4,1) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `applicantType` enum('faculty','student') NOT NULL DEFAULT 'faculty',
  `approvedById` int(11) COMMENT 'ID of the admin/HOD who approved',
  `approvalDate` datetime COMMENT 'When the leave was approved/rejected',
  `approvalRemarks` text COMMENT 'Remarks from the approver',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_applicantId` (`applicantId`),
  KEY `idx_departmentId` (`departmentId`),
  KEY `idx_status` (`status`),
  KEY `idx_leaveType` (`leaveType`),
  KEY `idx_startDate` (`startDate`),
  KEY `idx_endDate` (`endDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing (optional)
-- Faculty leave request (pending for department admin approval)
INSERT INTO `leaves` (applicantId, departmentId, leaveType, startDate, endDate, totalDays, reason, status, applicantType, createdAt) VALUES
(1, 1, 'Medical', '2026-03-01', '2026-03-02', 2, 'Medical emergency - dental appointment', 'pending', 'faculty', NOW()),
(1, 1, 'Casual', '2026-02-15', '2026-02-17', 3, 'Family visit', 'pending', 'faculty', NOW()),
(2, 2, 'On-Duty', '2026-03-10', '2026-03-12', 3, 'Conference attendance at IIIT Delhi', 'pending', 'faculty', NOW());
