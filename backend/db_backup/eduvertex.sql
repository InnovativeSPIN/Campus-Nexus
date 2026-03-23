-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 23, 2026 at 08:09 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eduvertex`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('academic','leave','fee','general','disciplinary','attendance','result','approval','announcement') NOT NULL DEFAULT 'general',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'low',
  `targetRole` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`targetRole`)),
  `department` varchar(50) DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdById` int(11) NOT NULL,
  `creatorRole` varchar(50) NOT NULL,
  `expiresAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `message`, `type`, `priority`, `targetRole`, `department`, `attachments`, `isActive`, `createdById`, `creatorRole`, `expiresAt`, `createdAt`, `updatedAt`) VALUES
(5, 'Welcome to eduvertex', 'The Eduvertex is a real time ERP Enterpersise Resource Planning', 'general', 'low', '[\"all\"]', NULL, '[]', 1, 109, 'super-admin', NULL, '2026-02-25 16:30:00', '2026-02-25 16:30:00'),
(6, 'Welcome', 'welcome', 'general', 'low', '[\"faculty\",\"student\",\"department-admin\"]', NULL, '[]', 1, 109, 'super-admin', NULL, '2026-02-28 07:15:59', '2026-02-28 07:15:59');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `room` varchar(50) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `batch` varchar(20) DEFAULT NULL,
  `semester` tinyint(2) DEFAULT NULL,
  `academic_year` varchar(9) DEFAULT NULL,
  `section` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `room`, `department_id`, `capacity`, `status`, `batch`, `semester`, `academic_year`, `section`) VALUES
(21, 'III Year AI&DS', 'CR-15', 6, 30, 'active', '2023-2027', 6, '2025-2026', 'A');

-- --------------------------------------------------------

--
-- Table structure for table `class_incharges`
--

CREATE TABLE `class_incharges` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `assigned_by` int(11) DEFAULT NULL,
  `assigned_at` datetime DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class_incharges`
--

INSERT INTO `class_incharges` (`id`, `class_id`, `faculty_id`, `academic_year`, `assigned_by`, `assigned_at`, `status`, `created_at`, `updated_at`) VALUES
(10, 21, 406, '2023-2027', NULL, '2026-03-05 18:30:05', 'active', '2026-03-14 13:13:50', '2026-03-14 13:13:50');

-- --------------------------------------------------------

--
-- Table structure for table `course_files`
--

CREATE TABLE `course_files` (
  `id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `semester` int(2) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `file_hash` varchar(64) DEFAULT NULL,
  `status` enum('draft','submitted','approved','rejected','revision_requested') DEFAULT 'draft',
  `submission_date` datetime DEFAULT NULL,
  `approval_remarks` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `version` int(11) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Course file uploads for Section X and other course materials';

-- --------------------------------------------------------

--
-- Table structure for table `course_file_notifications`
--

CREATE TABLE `course_file_notifications` (
  `id` int(11) NOT NULL,
  `course_file_id` int(11) NOT NULL,
  `recipient_type` enum('faculty','department-admin') NOT NULL,
  `recipient_id` int(11) DEFAULT NULL,
  `notification_type` enum('submission_received','approval_request','approved','rejected','revision_requested') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `action_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Notifications for course file approval workflow';

-- --------------------------------------------------------

--
-- Stand-in structure for view `course_file_section_x`
-- (See below for the actual view)
--
CREATE TABLE `course_file_section_x` (
`sno` tinyint(3) unsigned
,`unit_number` tinyint(1)
,`unit_label` varchar(20)
,`topic` text
,`co_number` varchar(20)
,`btl` varchar(20)
,`delivery_mode` varchar(100)
,`reference_book` varchar(255)
,`periods_required` tinyint(2)
,`cumulative_periods` tinyint(3) unsigned
,`periods_taken` tinyint(2)
,`covered` varchar(1)
,`faculty_name` varchar(100)
,`subject_name` varchar(255)
,`class_name` varchar(100)
,`academic_year` varchar(9)
,`semester` tinyint(2)
);

-- --------------------------------------------------------

--
-- Table structure for table `course_lesson_plans`
--

CREATE TABLE `course_lesson_plans` (
  `id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `upload_batch_id` varchar(50) DEFAULT NULL COMMENT 'Unique ID for batch upload (groups related topics)',
  `subject_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `academic_year` varchar(9) NOT NULL,
  `semester` tinyint(2) NOT NULL,
  `sno` tinyint(3) UNSIGNED NOT NULL,
  `unit_number` tinyint(1) NOT NULL,
  `unit_label` varchar(20) NOT NULL,
  `topic` text NOT NULL,
  `tentative_date` date DEFAULT NULL,
  `co_number` varchar(20) NOT NULL,
  `btl` varchar(20) NOT NULL,
  `delivery_mode` varchar(100) DEFAULT NULL,
  `reference_book` varchar(255) DEFAULT NULL,
  `periods_required` tinyint(2) NOT NULL DEFAULT 1,
  `cumulative_periods` tinyint(3) UNSIGNED DEFAULT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT 0,
  `actual_date_from` date DEFAULT NULL,
  `actual_date_to` date DEFAULT NULL,
  `periods_taken` tinyint(2) DEFAULT 0,
  `deviation_reason` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `approval_remarks` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `batch_submission_date` datetime DEFAULT NULL COMMENT 'When this batch was submitted for approval',
  `approval_status` enum('pending','approved','rejected','revision_requested') DEFAULT 'approved',
  `coverage_status` enum('completed','deviation') DEFAULT NULL COMMENT 'Status of topic coverage (completed or deviation)',
  `coverage_date` datetime DEFAULT NULL COMMENT 'Date when the topic coverage was recorded',
  `completed_date` datetime DEFAULT NULL COMMENT 'Date when the topic was marked as completed',
  `additional_notes` longtext DEFAULT NULL COMMENT 'Additional notes about the topic coverage'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_lesson_plans`
--

INSERT INTO `course_lesson_plans` (`id`, `faculty_id`, `upload_batch_id`, `subject_id`, `class_id`, `academic_year`, `semester`, `sno`, `unit_number`, `unit_label`, `topic`, `tentative_date`, `co_number`, `btl`, `delivery_mode`, `reference_book`, `periods_required`, `cumulative_periods`, `is_completed`, `actual_date_from`, `actual_date_to`, `periods_taken`, `deviation_reason`, `created_by`, `updated_by`, `created_at`, `updated_at`, `approval_remarks`, `approved_by`, `approved_date`, `batch_submission_date`, `approval_status`, `coverage_status`, `coverage_date`, `completed_date`, `additional_notes`) VALUES
(243, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 1, 1, 'UNIT I - INTRO TO ON', 'Online Market space', '2026-01-05', 'C602.1', 'L2', 'BB', 'T1 3', 1, 1, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(244, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 2, 1, 'UNIT I - INTRO TO ON', 'Digital Marketing Strategy', '2026-01-06', 'C602.1', 'L2', 'BB', 'T1 20', 1, 2, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(245, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 3, 1, 'UNIT I - INTRO TO ON', 'Components', '2026-01-08', 'C602.1', 'L2', 'BB', 'T1 42', 1, 3, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(246, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 4, 1, 'UNIT I - INTRO TO ON', 'Opportunities for building Brand Website', '2026-01-10', 'C602.1', 'L2', 'BB', 'T1 81', 1, 4, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(247, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 5, 1, 'UNIT I - INTRO TO ON', 'Planning and Creation', '2026-01-12', 'C602.1', 'L2', 'BB', 'T1 92', 1, 5, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(248, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 6, 1, 'UNIT I - INTRO TO ON', 'Content Marketing', '2026-01-13', 'C602.1', 'L2', 'BB', 'T1 100', 1, 6, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(249, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 7, 2, 'UNIT II - SEARCH ENG', 'Search Engine optimization - Keyword Strategy', '2026-01-19', 'C602.2', 'L2', 'BB', 'T1 115', 1, 7, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(250, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 8, 2, 'UNIT II - SEARCH ENG', 'SEO Strategy - SEO success factors', '2026-01-20', 'C602.2', 'L2', 'BB', 'T1 128', 1, 8, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(251, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 9, 2, 'UNIT II - SEARCH ENG', 'On-Page Techniques - Off-Page Techniques', '2026-01-22', 'C602.2', 'L2', 'BB', 'T1 135', 1, 9, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(252, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 10, 2, 'UNIT II - SEARCH ENG', 'Search Engine Marketing - How Search Engine work', '2026-01-24', 'C602.2', 'L2', 'BB', 'T1 142', 1, 10, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(253, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 11, 2, 'UNIT II - SEARCH ENG', 'SEM components - PPC advertising', '2026-01-27', 'C602.2', 'L2', 'BB', 'T1 150', 1, 11, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(254, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 12, 2, 'UNIT II - SEARCH ENG', 'Display Advertisement', '2026-01-29', 'C602.2', 'L2', 'BB', 'T1 153', 1, 12, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(255, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 13, 3, 'UNIT III - E-MAIL MA', 'E-Mail Marketing - Types of E-Mail Marketing - Email Automation', '2026-01-31', 'C602.3', 'L2', 'BB', 'T1 202', 1, 13, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(256, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 14, 3, 'UNIT III - E-MAIL MA', 'Lead Generation - Integrating Email with Social Media and Mobile', '2026-02-02', 'C602.3', 'L2', 'BB', 'T1 219', 1, 14, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(257, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 15, 3, 'UNIT III - E-MAIL MA', '\"Measuring and maximizing email campaign effectiveness', '2026-02-03', 'Mobile Marketing\"', 'C602.3', 'L2', 'BB', 1, 15, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(258, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 16, 3, 'UNIT III - E-MAIL MA', '\"Inventory/channels - Location based', '2026-02-05', 'Context based', 'Coupons and offers\"', 'C602.3', 'L2', 1, 16, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(259, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 17, 3, 'UNIT III - E-MAIL MA', '\"Mobile Apps', '2026-02-07', 'Mobile Commerce\"', 'C602.3', 'L2', 'BB', 1, 17, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(260, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 18, 3, 'UNIT III - E-MAIL MA', 'SMS Campaigns - Profiling and targeting', '2026-02-09', 'C602.3', 'L2', 'BB', 'T2 271', 1, 18, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(261, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 19, 4, 'UNIT IV - SOCIAL MED', 'Social Media Marketing', '2026-02-10', 'C602.4', 'L2', 'BB', 'T1 277', 1, 19, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(262, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 20, 4, 'UNIT IV - SOCIAL MED', 'Social Media Channels', '2026-02-10', 'C602.4', 'L2', 'BB', 'T1 286', 1, 20, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(263, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 21, 4, 'UNIT IV - SOCIAL MED', 'Leveraging Social media for brand conversations and buzz', '2026-02-12', 'C602.4', 'L2', 'BB', 'T1 301', 1, 21, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(264, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 22, 4, 'UNIT IV - SOCIAL MED', 'Successful/benchmark Social media campaigns', '2026-02-14', 'C602.4', 'L2', 'BB', 'T1 312', 1, 22, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(265, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 23, 4, 'UNIT IV - SOCIAL MED', 'Engagement Marketing - Building Customer relationships', '2026-02-24', 'C602.4', 'L2', 'BB', 'T2 345', 1, 23, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(266, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 24, 4, 'UNIT IV - SOCIAL MED', 'Creating Loyalty drivers - Influencer Marketing', '2026-02-28', 'C602.4', 'L2', 'BB', 'T1 364', 1, 24, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(267, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 25, 5, 'UNIT V - DIGITAL TRA', 'Digital Transformation & Channel Attribution', '2026-03-02', 'C602.5', 'L2', 'BB', 'T1 384', 1, 25, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(268, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 26, 5, 'UNIT V - DIGITAL TRA', 'Analytics', '2026-03-03', 'C602.5', 'L2', 'BB', 'T1 389', 1, 26, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(269, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 27, 5, 'UNIT V - DIGITAL TRA', '\"Ad-words', '2026-03-05', 'Email', 'Mobile\"', 'C602.5', 'L2', 1, 27, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(270, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 28, 5, 'UNIT V - DIGITAL TRA', '\"Social Media', '2026-03-09', 'Web Analytics\"', 'C602.5', 'L2', 'BB', 1, 28, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(271, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 29, 5, 'UNIT V - DIGITAL TRA', 'Changing your strategy based on analysis', '2026-03-12', 'C602.5', 'L2', 'BB', 'T2 403', 1, 29, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(272, 406, '406_98_21_1774158410975', 98, 21, '2026-2027', 6, 30, 5, 'UNIT V - DIGITAL TRA', 'Recent trends in Digital marketing', '2026-03-14', 'C602.5', 'L2', 'SEM', 'T1 407', 1, 30, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 05:46:50', '2026-03-22 05:47:26', NULL, 435, '2026-03-22 05:47:26', '2026-03-22 05:47:26', 'approved', NULL, NULL, NULL, NULL),
(273, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 1, 1, 'UNIT I - INTRO TO ON', 'Online Market space', '2026-01-05', 'C602.1', 'L2', 'BB', 'T1 3', 1, 1, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(274, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 2, 1, 'UNIT I - INTRO TO ON', 'Digital Marketing Strategy', '2026-01-06', 'C602.1', 'L2', 'BB', 'T1 20', 1, 2, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(275, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 3, 1, 'UNIT I - INTRO TO ON', 'Components', '2026-01-08', 'C602.1', 'L2', 'BB', 'T1 42', 1, 3, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(276, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 4, 1, 'UNIT I - INTRO TO ON', 'Opportunities for building Brand Website', '2026-01-10', 'C602.1', 'L2', 'BB', 'T1 81', 1, 4, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(277, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 5, 1, 'UNIT I - INTRO TO ON', 'Planning and Creation', '2026-01-12', 'C602.1', 'L2', 'BB', 'T1 92', 1, 5, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(278, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 6, 1, 'UNIT I - INTRO TO ON', 'Content Marketing', '2026-01-13', 'C602.1', 'L2', 'BB', 'T1 100', 1, 6, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(279, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 7, 2, 'UNIT II - SEARCH ENG', 'Search Engine optimization - Keyword Strategy', '2026-01-19', 'C602.2', 'L2', 'BB', 'T1 115', 1, 7, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(280, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 8, 2, 'UNIT II - SEARCH ENG', 'SEO Strategy - SEO success factors', '2026-01-20', 'C602.2', 'L2', 'BB', 'T1 128', 1, 8, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(281, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 9, 2, 'UNIT II - SEARCH ENG', 'On-Page Techniques - Off-Page Techniques', '2026-01-22', 'C602.2', 'L2', 'BB', 'T1 135', 1, 9, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(282, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 10, 2, 'UNIT II - SEARCH ENG', 'Search Engine Marketing - How Search Engine work', '2026-01-24', 'C602.2', 'L2', 'BB', 'T1 142', 1, 10, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(283, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 11, 2, 'UNIT II - SEARCH ENG', 'SEM components - PPC advertising', '2026-01-27', 'C602.2', 'L2', 'BB', 'T1 150', 1, 11, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(284, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 12, 2, 'UNIT II - SEARCH ENG', 'Display Advertisement', '2026-01-29', 'C602.2', 'L2', 'BB', 'T1 153', 1, 12, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(285, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 13, 3, 'UNIT III - E-MAIL MA', 'E-Mail Marketing - Types of E-Mail Marketing - Email Automation', '2026-01-31', 'C602.3', 'L2', 'BB', 'T1 202', 1, 13, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(286, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 14, 3, 'UNIT III - E-MAIL MA', 'Lead Generation - Integrating Email with Social Media and Mobile', '2026-02-02', 'C602.3', 'L2', 'BB', 'T1 219', 1, 14, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(287, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 15, 3, 'UNIT III - E-MAIL MA', '\"Measuring and maximizing email campaign effectiveness', '2026-02-03', 'Mobile Marketing\"', 'C602.3', 'L2', 'BB', 1, 15, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(288, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 16, 3, 'UNIT III - E-MAIL MA', '\"Inventory/channels - Location based', '2026-02-05', 'Context based', 'Coupons and offers\"', 'C602.3', 'L2', 1, 16, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(289, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 17, 3, 'UNIT III - E-MAIL MA', '\"Mobile Apps', '2026-02-07', 'Mobile Commerce\"', 'C602.3', 'L2', 'BB', 1, 17, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(290, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 18, 3, 'UNIT III - E-MAIL MA', 'SMS Campaigns - Profiling and targeting', '2026-02-09', 'C602.3', 'L2', 'BB', 'T2 271', 1, 18, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(291, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 19, 4, 'UNIT IV - SOCIAL MED', 'Social Media Marketing', '2026-02-10', 'C602.4', 'L2', 'BB', 'T1 277', 1, 19, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(292, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 20, 4, 'UNIT IV - SOCIAL MED', 'Social Media Channels', '2026-02-10', 'C602.4', 'L2', 'BB', 'T1 286', 1, 20, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(293, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 21, 4, 'UNIT IV - SOCIAL MED', 'Leveraging Social media for brand conversations and buzz', '2026-02-12', 'C602.4', 'L2', 'BB', 'T1 301', 1, 21, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(294, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 22, 4, 'UNIT IV - SOCIAL MED', 'Successful/benchmark Social media campaigns', '2026-02-14', 'C602.4', 'L2', 'BB', 'T1 312', 1, 22, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(295, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 23, 4, 'UNIT IV - SOCIAL MED', 'Engagement Marketing - Building Customer relationships', '2026-02-24', 'C602.4', 'L2', 'BB', 'T2 345', 1, 23, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(296, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 24, 4, 'UNIT IV - SOCIAL MED', 'Creating Loyalty drivers - Influencer Marketing', '2026-02-28', 'C602.4', 'L2', 'BB', 'T1 364', 1, 24, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(297, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 25, 5, 'UNIT V - DIGITAL TRA', 'Digital Transformation & Channel Attribution', '2026-03-02', 'C602.5', 'L2', 'BB', 'T1 384', 1, 25, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(298, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 26, 5, 'UNIT V - DIGITAL TRA', 'Analytics', '2026-03-03', 'C602.5', 'L2', 'BB', 'T1 389', 1, 26, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(299, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 27, 5, 'UNIT V - DIGITAL TRA', '\"Ad-words', '2026-03-05', 'Email', 'Mobile\"', 'C602.5', 'L2', 1, 27, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(300, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 28, 5, 'UNIT V - DIGITAL TRA', '\"Social Media', '2026-03-09', 'Web Analytics\"', 'C602.5', 'L2', 'BB', 1, 28, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(301, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 29, 5, 'UNIT V - DIGITAL TRA', 'Changing your strategy based on analysis', '2026-03-12', 'C602.5', 'L2', 'BB', 'T2 403', 1, 29, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL),
(302, 406, '406_98_21_1774160071732', 98, 21, '2025-2026', 6, 30, 5, 'UNIT V - DIGITAL TRA', 'Recent trends in Digital marketing', '2026-03-14', 'C602.5', 'L2', 'SEM', 'T1 407', 1, 30, 0, NULL, NULL, 0, NULL, 406, NULL, '2026-03-22 06:14:31', '2026-03-22 06:14:52', NULL, 435, '2026-03-22 06:14:52', '2026-03-22 06:14:52', 'approved', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Stand-in structure for view `course_lesson_plan_progress`
-- (See below for the actual view)
--
CREATE TABLE `course_lesson_plan_progress` (
`faculty_id` int(11)
,`subject_id` int(11)
,`class_id` int(11)
,`academic_year` varchar(9)
,`semester` tinyint(2)
,`subject_name` varchar(255)
,`class_name` varchar(100)
,`total_topics` bigint(21)
,`total_periods_planned` decimal(25,0)
,`total_periods_taught` decimal(25,0)
,`topics_completed` decimal(22,0)
,`completion_percentage` decimal(28,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `short_name` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `short_name`, `full_name`) VALUES
(1, 'CSE', 'B.E. Computer Science & Engineering'),
(2, 'CIVIL', 'B.E. Civil Engineering'),
(3, 'ECE', 'B.E. Electronics & Communication Engineering'),
(4, 'EEE', 'B.E. Electrical and Electronics Engineering'),
(5, 'MECH', 'B.E. Mechanical Engineering'),
(6, 'AI&DS', 'B.Tech. Artificial Intelligence & Data Science'),
(7, 'IT', 'B.Tech. Information Technology'),
(8, 'STRUCTURE ENGINEERING', 'Structural Engineering'),
(9, 'MFE', 'Manufacturing Engineering'),
(10, 'S&H', 'Science and Humanities'),
(11, 'PHYSICAL EDUCATION', 'PHYSICAL EDUCATION');

-- --------------------------------------------------------

--
-- Table structure for table `faculty_events`
--

CREATE TABLE `faculty_events` (
  `event_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `category` enum('Resource Person','FDP','Seminar','Workshop') NOT NULL,
  `organizer_type` enum('organized','participated') DEFAULT 'participated',
  `event_name` varchar(255) NOT NULL,
  `organizer` varchar(255) DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `document_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_experience`
--

CREATE TABLE `faculty_experience` (
  `exp_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `institution_name` varchar(255) NOT NULL,
  `university` varchar(255) NOT NULL,
  `department` varchar(150) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `period` varchar(50) DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_industry_experience`
--

CREATE TABLE `faculty_industry_experience` (
  `exp_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `job_title` varchar(150) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `period` varchar(50) DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_leave_schedules`
--

CREATE TABLE `faculty_leave_schedules` (
  `id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `leave_id` int(11) DEFAULT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `reason` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_phd`
--

CREATE TABLE `faculty_phd` (
  `phd_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `status` varchar(100) DEFAULT NULL,
  `orcid_id` varchar(100) DEFAULT NULL,
  `thesis_title` text DEFAULT NULL,
  `register_no` varchar(100) DEFAULT NULL,
  `guide_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_profiles`
--

CREATE TABLE `faculty_profiles` (
  `faculty_id` int(11) NOT NULL,
  `faculty_college_code` varchar(50) NOT NULL,
  `AICTE_ID` int(20) DEFAULT NULL,
  `Anna_University_ID` int(25) DEFAULT NULL,
  `Name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `educational_qualification` varchar(255) DEFAULT NULL,
  `phd_status` enum('Yes','No','Pursuing') DEFAULT 'No',
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `profile_image_url` text DEFAULT NULL,
  `status` enum('active','on_leave','retired') DEFAULT 'active',
  `blood_group` varchar(10) DEFAULT NULL,
  `aadhar_number` varchar(20) DEFAULT NULL,
  `pan_number` varchar(20) DEFAULT NULL,
  `perm_address` text DEFAULT NULL,
  `curr_address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `linkedin_url` varchar(255) DEFAULT NULL,
  `is_placement_coordinator` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty_profiles`
--

INSERT INTO `faculty_profiles` (`faculty_id`, `faculty_college_code`, `AICTE_ID`, `Anna_University_ID`, `Name`, `email`, `phone_number`, `password`, `role_id`, `department_id`, `designation`, `educational_qualification`, `phd_status`, `gender`, `date_of_birth`, `date_of_joining`, `profile_image_url`, `status`, `blood_group`, `aadhar_number`, `pan_number`, `perm_address`, `curr_address`, `created_at`, `updated_at`, `linkedin_url`, `is_placement_coordinator`) VALUES
(406, 'NS80T01', NULL, NULL, 'NAGAJOTHI P', 'ns80t01@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, 'Assistant Professor', NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL, NULL),
(434, 'NS20T11', NULL, NULL, 'PRATHAP C', 'cprathap1985@gmail.com', NULL, '$2a$10$ix7Vg2NBz9QKyRwHY1eS4OISqGo10McE05vht1cyk3JpafK6JDoci', 7, 7, 'HEAD OF THE DEPARTMENT', NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL, NULL),
(435, 'NS20T09', NULL, NULL, 'Vignesh L S', 'lsisreviving@gmail.com', NULL, '$2a$10$7S/p6nWcvVCUlmMC8cFeZewetHGp6MkxvvJLKBlahtsGt/KcyqC5a', 7, 6, 'HEAD OF THE DEPARTMENT', NULL, 'No', NULL, NULL, NULL, '/uploads/faculty/vignesh_l_s.jpg', 'active', NULL, NULL, NULL, NULL, NULL, '2026-03-14 13:13:50', '2026-03-21 06:44:20', NULL, NULL),
(436, 'SH1', NULL, NULL, 'DR.B.MALLAIYASAMY', 'drbmallaiyasamy.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, 'Assistant Professor', NULL, 'No', 'Male', NULL, NULL, NULL, 'active', 'B+', NULL, NULL, NULL, NULL, '2026-02-19 11:08:21', '2026-03-05 05:30:07', NULL, NULL),
(437, 'SH10', NULL, NULL, 'DR.DAVID MATHAN.N', 'drdavid.mathann@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:08:21', '2026-02-20 01:13:32', NULL, NULL),
(438, 'ME11', NULL, NULL, 'VEMBATHURAJESH.A', 'vembathurajesha.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:08:21', '2026-02-20 01:13:32', NULL, NULL),
(439, 'AA2', NULL, NULL, 'Dr.C.MATHALAI SUNDARAM', 'drcmathalai.sundaram@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:08:21', '2026-02-20 01:13:32', NULL, NULL),
(440, 'ME12', NULL, NULL, 'SANTHASEELAN.R', 'santhaseelanr.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:08:21', '2026-02-20 01:13:32', NULL, NULL),
(441, 'ME14', NULL, NULL, 'SIVAGANESAN.V', 'sivaganesanv.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:08:21', '2026-02-20 01:13:32', NULL, NULL),
(442, 'ME16', NULL, NULL, 'NAGARAJA.R', 'nagarajar.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:08:21', '2026-02-20 01:13:32', NULL, NULL),
(443, 'ME18', NULL, NULL, 'NAGARAJAN.B', 'nagarajanb.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:08:21', '2026-02-20 01:13:32', NULL, NULL),
(444, 'CS4', NULL, NULL, 'UDHAYA KUMAR.R', 'udhaya.kumarr@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, 'Assistant Professor', NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:08:21', '2026-02-21 09:22:40', NULL, NULL),
(445, 'EC4', NULL, NULL, 'IDHAYACHANDRAN M', 'idhayachandran.m@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:08:21', '2026-02-20 01:13:32', NULL, NULL),
(446, 'EC10', NULL, NULL, 'DR. N MATHAVAN', 'dr2.n@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:08:21', '2026-02-20 01:13:32', NULL, NULL),
(447, 'EC11', NULL, NULL, 'TAMIL SELVI T', 'tamil.selvi@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:08:21', '2026-02-20 01:13:32', NULL, NULL),
(448, 'EC13', NULL, NULL, 'PRATHAP S', 'prathap.s@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:08:21', '2026-02-20 01:13:32', NULL, NULL),
(449, 'EC14', NULL, NULL, 'BHARATHI KANNAN K', 'bharathi.kannan@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:08:21', '2026-02-20 01:13:32', NULL, NULL),
(450, 'NS10T18', NULL, NULL, 'GAYATHRI S', 'ns10t18@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(451, 'NS303NT06', NULL, NULL, 'SHANMUGAPRIYAN.R', 'ns303nt06@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(452, 'NS10T21', NULL, NULL, 'SINDHU M', 'ns10t21@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(453, 'NS10T27', NULL, NULL, 'DR.E.ANANTHA KRISHNAN', 'ns10t27@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(454, 'NS10T29', NULL, NULL, 'SOWMIYA B', 'ns10t29@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(455, 'NS10T30', NULL, NULL, 'KANIMOZHI M', 'ns10t30@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-21 13:05:32', NULL, NULL),
(456, 'NS10T31', NULL, NULL, 'BENITA MERLIN ISABELLA K', 'ns10t31@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(457, 'NS10T32', NULL, NULL, 'ARUL JEBARAJ P', 'ns10t32@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(458, 'NS10T33', NULL, NULL, 'NATHIRUN SABINASH', 'ns10t33@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(459, 'NS10T34', NULL, NULL, 'MANOJ PRABAKAR R', 'ns10t34@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(460, 'NS10T35', NULL, NULL, 'HARI PRASATH T', 'ns10t35@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(461, 'NS20T35', NULL, NULL, 'ABIRAMI KAYATHIRI S', 'ns20t35@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-03-05 02:59:26', NULL, NULL),
(462, 'NS20T41', NULL, NULL, 'ANUSUYA V', 'ns20t41@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(463, 'NS20T25', NULL, NULL, 'VELKUMAR K', 'ns20t25@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(464, 'NS20T33', NULL, NULL, 'DEEPIGA K', 'ns20t33@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(465, 'NS20T40', NULL, NULL, 'VENKATALAKSHMI M', 'ns20t40@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(466, 'NS20T29', NULL, NULL, 'ARCHANA R', 'ns20t29@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(467, 'NS70T01', NULL, NULL, 'DR.M SATHYA', 'ns70t01@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(468, 'NS61T20', NULL, NULL, 'ARULVIZHI M', 'ns61t20@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(469, 'NS22T21', NULL, NULL, 'PREETHA J', 'ns22t21@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(470, 'NS61T16', NULL, NULL, 'Dr.C.CHITHRA', 'ns61t16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(471, 'NS61T09', NULL, NULL, 'KARUNYAH R', 'ns61t09@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(472, 'NS61T23', NULL, NULL, 'MUFEENA S', 'ns61t23@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(473, 'NS6606T17', NULL, NULL, 'SUBATHAMANI T', 'ns6606t17@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(474, 'NS6606T18', NULL, NULL, 'DR. MALARVIZHI P', 'ns6606t18@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(475, 'NS6606T19', NULL, NULL, 'DR. VALARMATHI R', 'ns6606t19@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(476, 'NS60T07', NULL, NULL, 'RICHARD BRITTO.R.C', 'ns60t07@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(477, 'NS7706T06', NULL, NULL, 'DR. M VEERA KUMAR', 'ns7706t06@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(478, 'NS62T11', NULL, NULL, 'DHANDAYUTHAPANI', 'ns62t11@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(479, 'NS62T10', NULL, NULL, 'RAJAGURU K', 'ns62t10@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(480, 'NS7706T04', NULL, NULL, 'Dr.S.R.KRISHNAMOORTHI', 'ns7706t04@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(481, 'NS63T13', NULL, NULL, 'ABINAYA B', 'ns63t13@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(482, 'NS63T16', NULL, NULL, 'DR R SARAVANANKUMAR', 'ns63t16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(483, 'NS67T03', NULL, NULL, 'THISHA N', 'ns67t03@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(484, 'NS50T16', NULL, NULL, 'HARIKISHORE.S', 'ns50t16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(485, 'NS50T21', NULL, NULL, 'VENNIMALAI RAJAN A', 'ns50t21@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(486, 'NS50T22', NULL, NULL, 'ARUN KUMAR.G', 'ns50t22@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(487, 'NS4407T020', NULL, NULL, 'SURULIMANI. P', 'ns4407t020@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(488, 'NS50T19', NULL, NULL, 'CHAKRAVARTHY SAMY DURAI J', 'ns50t19@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(489, 'NS70T07', NULL, NULL, 'JASMINE JOSE P', 'ns70t07@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(490, 'NS20T34', NULL, NULL, 'KESAVAMOORTHY N', 'ns20t34@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(491, 'NS20T14', NULL, NULL, 'ARUL JOTHI.S', 'ns20t14@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(492, 'NS70T05', NULL, NULL, 'MAHALAKSHMI S', 'mahalakshmi@nscet.org', '8248721606', '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, 'Assistant professor', NULL, 'No', 'Female', '1998-05-04', '2025-04-02', NULL, 'active', 'AB+', '321489215820', 'Bzkpm1362B', 'Balan nagar allinagaram', 'Balan nagar allinagaram', '2026-02-19 11:09:11', '2026-03-22 16:17:16', NULL, NULL),
(493, 'NS20T39', NULL, NULL, 'BHAVANI M', 'ns20t39@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(494, 'NS70T04', NULL, NULL, 'SAI SUGANYA B', 'ns70t04@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(495, 'NS20T37', NULL, NULL, 'GEERTHIGA G', 'ns20t37@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-23 15:07:47', NULL, NULL),
(496, 'NS20T32', NULL, NULL, 'VINOTH KUMAR J', 'ns20t32@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(497, 'NS70T02', NULL, NULL, 'KANIMOLI J', 'ns70t02@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-23 14:56:34', NULL, NULL),
(498, 'NS30T03', NULL, NULL, 'GANESH.K', 'ns30t03@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(499, 'NS30T19', NULL, NULL, 'RAJA KARTHICK R', 'ns30t19@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(500, 'NS30T20', NULL, NULL, 'NISHETHA JEFLIN NIXON A', 'ns30t20@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(501, 'NS30T25', NULL, NULL, 'VIJAYALAKSHMI M', 'ns30t25@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(502, 'NS30T26', NULL, NULL, 'SHIVA C', 'ns30t26@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(503, 'NS30T27', NULL, NULL, 'ABIRAMI N', 'ns30t27@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(504, 'NS30T30', NULL, NULL, 'DR N PANDISELVI', 'ns30t30@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(505, 'NS30T29', NULL, NULL, 'JURIYA BANU H', 'ns30t29@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(506, 'NS40T24', NULL, NULL, 'KALAIVANI S', 'ns40t24@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(507, 'NS40T23', NULL, NULL, 'GOWTHAMI P', 'ns40t23@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(508, 'NS3306T14', NULL, NULL, 'PRADEEP KUMAR R', 'ns3306t14@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(509, 'NS40NT16', NULL, NULL, 'CHITRA R', 'ns40nt16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(510, 'NS40T19', NULL, NULL, 'SHANTHA DEVI P', 'ns40t19@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(511, 'NS40T27', NULL, NULL, 'RAJESHSHREE S', 'ns40t27@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(512, 'NS20NT23', NULL, NULL, 'MUTHURAJ', 'ns20nt23@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
(513, 'SH1', NULL, NULL, 'MRS.Malini', 'malini@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 11, 'Assistant', NULL, 'No', 'Female', NULL, NULL, NULL, 'active', 'B+', NULL, NULL, NULL, NULL, '2026-02-19 11:08:21', '2026-03-14 16:24:24', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `faculty_research`
--

CREATE TABLE `faculty_research` (
  `research_id` int(11) NOT NULL,
  `ORCID_ID` varchar(50) DEFAULT NULL,
  `faculty_id` int(11) NOT NULL,
  `category` enum('Conference','Journal','Patent','Book Chapter') NOT NULL,
  `title` text NOT NULL,
  `author_names` text DEFAULT NULL,
  `abstract` longtext DEFAULT NULL,
  `keywords` varchar(500) DEFAULT NULL,
  `issn_isbn` varchar(50) DEFAULT NULL,
  `volume_issue` varchar(100) DEFAULT NULL,
  `pages` varchar(50) DEFAULT NULL,
  `status` enum('Published','Under Review','Accepted','Rejected') DEFAULT 'Published',
  `research_type` varchar(100) DEFAULT NULL,
  `impact_factor` decimal(5,2) DEFAULT NULL,
  `citations` int(11) DEFAULT 0,
  `indexed_in` varchar(200) DEFAULT NULL,
  `publication_date` varchar(50) DEFAULT NULL,
  `publisher_organizer` varchar(255) DEFAULT NULL,
  `url` text DEFAULT NULL,
  `document_url` text DEFAULT NULL,
  `type` enum('International','National') DEFAULT 'International',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_subjects_handled`
--

CREATE TABLE `faculty_subjects_handled` (
  `faculty_id` int(11) NOT NULL,
  `program` varchar(100) DEFAULT NULL,
  `semester` varchar(10) DEFAULT NULL,
  `subject_code` varchar(20) DEFAULT NULL,
  `subject_name` varchar(255) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `pass_percentage` decimal(5,2) DEFAULT NULL,
  `document_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_subject_assignments`
--

CREATE TABLE `faculty_subject_assignments` (
  `id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `assigned_by` int(11) DEFAULT NULL,
  `assigned_at` datetime DEFAULT NULL,
  `academic_year` varchar(9) NOT NULL,
  `semester` tinyint(2) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `batch` varchar(20) DEFAULT NULL,
  `allocation_date` date NOT NULL DEFAULT curdate(),
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `total_hours` int(11) DEFAULT 0,
  `no_of_periods` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty_subject_assignments`
--

INSERT INTO `faculty_subject_assignments` (`id`, `faculty_id`, `subject_id`, `assigned_by`, `assigned_at`, `academic_year`, `semester`, `class_id`, `batch`, `allocation_date`, `status`, `total_hours`, `no_of_periods`, `created_at`, `updated_at`) VALUES
(24, 435, 90, 435, '2026-03-14 16:04:05', '2025-2026', 6, 21, '2023-2027', '2026-03-14', 'active', 50, 5, '2026-03-14 15:41:31', '2026-03-14 16:04:05'),
(25, 406, 95, 435, '2026-03-14 16:06:06', '2026-2027', 6, 21, '2023-2027', '2026-03-14', 'active', 50, 3, '2026-03-14 16:04:40', '2026-03-14 16:06:06'),
(26, 406, 98, 435, '2026-03-14 16:18:39', '2025-2026', 6, 21, '2023-2027', '2026-03-14', 'active', 45, 3, '2026-03-14 16:18:39', '2026-03-14 16:18:39'),
(31, 507, 102, 435, '2026-03-14 17:16:59', '2026-2027', 6, 21, '2023-2027', '2026-03-14', 'active', 45, 3, '2026-03-14 17:16:59', '2026-03-14 17:16:59'),
(32, 513, 103, 435, '2026-03-14 17:17:07', '2026-2027', 6, 21, NULL, '2026-03-14', 'active', 45, 3, '2026-03-14 17:17:07', '2026-03-14 17:17:07'),
(34, 435, 90, 435, '2026-03-14 17:17:27', '2026-2027', 6, 21, NULL, '2026-03-14', 'active', 45, 3, '2026-03-14 17:17:27', '2026-03-14 17:17:27'),
(35, 406, 98, 435, '2026-03-14 17:17:31', '2026-2027', 6, 21, NULL, '2026-03-14', 'active', 45, 3, '2026-03-14 17:17:31', '2026-03-14 17:17:31'),
(36, 496, 94, 435, '2026-03-15 08:06:06', '2026-2027', 6, 21, '2023-2027', '2026-03-15', 'active', 45, 3, '2026-03-15 08:06:06', '2026-03-15 08:06:06'),
(37, 406, 107, 435, '2026-03-17 04:05:30', '2026-2027', 6, 21, '2023-2027', '2026-03-17', 'active', 45, 3, '2026-03-17 04:05:30', '2026-03-17 04:05:30');

-- --------------------------------------------------------

--
-- Table structure for table `faculty_substitutes`
--

CREATE TABLE `faculty_substitutes` (
  `id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `substitute_faculty_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text DEFAULT NULL,
  `leave_id` int(11) DEFAULT NULL,
  `status` enum('pending','approved','rejected','active','completed') NOT NULL DEFAULT 'pending',
  `requested_by` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approval_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculy_edu_qualification`
--

CREATE TABLE `faculy_edu_qualification` (
  `membership_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `degree` varchar(100) NOT NULL,
  `branch` varchar(150) NOT NULL,
  `college` varchar(255) DEFAULT NULL,
  `university` varchar(255) NOT NULL,
  `year` varchar(50) DEFAULT NULL,
  `percentage` varchar(20) DEFAULT NULL,
  `society_name` varchar(255) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leaves`
--

CREATE TABLE `leaves` (
  `id` int(11) NOT NULL,
  `applicantId` int(11) NOT NULL,
  `departmentId` int(11) DEFAULT NULL,
  `leaveType` enum('Medical','Casual','Earned','On-Duty','Personal','Maternity','Comp-Off') NOT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `totalDays` decimal(4,1) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','hod_approved','approved','rejected','cancelled') DEFAULT 'pending',
  `approvedById` int(11) DEFAULT NULL,
  `approvalDate` datetime DEFAULT NULL,
  `approvalRemarks` text DEFAULT NULL,
  `applicantType` enum('faculty','student') NOT NULL DEFAULT 'faculty',
  `affected_periods` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of timetable period IDs affected by this leave' CHECK (json_valid(`affected_periods`)),
  `substitute_faculty_code` varchar(50) DEFAULT NULL COMMENT 'Faculty college code of the substitute',
  `substitute_status` enum('pending','accepted','rejected') DEFAULT NULL,
  `substitute_notified_at` datetime DEFAULT NULL,
  `substitute_response_at` datetime DEFAULT NULL,
  `substitute_remarks` text DEFAULT NULL,
  `admin_approval_status` enum('pending','approved','rejected') DEFAULT NULL,
  `admin_approval_date` datetime DEFAULT NULL,
  `timetable_altered` tinyint(1) DEFAULT 0,
  `reassign_faculty_id` int(11) DEFAULT NULL COMMENT 'Faculty ID who will cover during this leave',
  `documentUrl` varchar(255) DEFAULT NULL COMMENT 'URL of the uploaded supporting document',
  `loadAssign` text DEFAULT NULL COMMENT 'Workload distribution details',
  `overall_status` enum('pending','substitute_pending','substitute_approved','substitute_rejected','timetable_pending','timetable_approved','executive_pending','executive_approved','approved','rejected','cancelled') DEFAULT 'pending' COMMENT 'Overall status of leave request through the complete workflow',
  `substitute_faculty_id` int(11) DEFAULT NULL COMMENT 'Requested substitute faculty ID',
  `substitute_approval_status` enum('pending','approved','rejected') DEFAULT 'pending' COMMENT 'Substitute faculty approval decision',
  `substitute_approval_date` datetime DEFAULT NULL COMMENT 'Date when substitute approved or rejected',
  `substitute_rejection_reason` text DEFAULT NULL COMMENT 'Reason provided by substitute if rejected',
  `timetable_incharge_approval_status` enum('pending','approved','rejected') DEFAULT 'pending' COMMENT 'Timetable incharge approval decision',
  `timetable_incharge_id` int(11) DEFAULT NULL COMMENT 'Timetable incharge faculty ID',
  `timetable_incharge_approval_date` datetime DEFAULT NULL COMMENT 'Date when timetable incharge approved or rejected',
  `timetable_incharge_rejection_reason` text DEFAULT NULL COMMENT 'Reason provided by timetable incharge if rejected',
  `executive_admin_approval_status` enum('pending','approved','rejected') DEFAULT NULL COMMENT 'Executive admin approval (only for leaves > 2 days)',
  `executive_admin_id` int(11) DEFAULT NULL COMMENT 'Executive admin faculty ID who approved/rejected',
  `executive_admin_approval_date` datetime DEFAULT NULL COMMENT 'Date when executive admin approved or rejected',
  `executive_admin_rejection_reason` text DEFAULT NULL COMMENT 'Reason provided by executive admin if rejected',
  `dept_admin_notified` tinyint(1) DEFAULT 0 COMMENT 'Whether department admin has been notified of alteration',
  `dept_admin_notified_at` datetime DEFAULT NULL COMMENT 'Timestamp when department admin was notified',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_approvals`
--

CREATE TABLE `leave_approvals` (
  `id` int(11) NOT NULL,
  `leave_request_id` int(11) NOT NULL,
  `level_number` tinyint(3) UNSIGNED NOT NULL,
  `approver_role` varchar(50) NOT NULL,
  `approver_id` int(11) NOT NULL,
  `approver_name` varchar(150) DEFAULT NULL,
  `status` enum('pending','approved','rejected','forwarded') NOT NULL DEFAULT 'pending',
  `action_date` datetime DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_approval_levels`
--

CREATE TABLE `leave_approval_levels` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `applicant_type` enum('student','faculty') NOT NULL,
  `level_number` tinyint(3) UNSIGNED NOT NULL,
  `approver_role` varchar(50) NOT NULL,
  `level_label` varchar(100) NOT NULL,
  `is_mandatory` tinyint(1) NOT NULL DEFAULT 1,
  `sequence` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_approval_levels`
--

INSERT INTO `leave_approval_levels` (`id`, `applicant_type`, `level_number`, `approver_role`, `level_label`, `is_mandatory`, `sequence`) VALUES
(1, 'student', 1, 'class_incharge', 'Class Incharge', 1, 1),
(2, 'student', 2, 'hod', 'Head of Department', 1, 2),
(3, 'faculty', 1, 'hod', 'Head of Department', 1, 1),
(4, 'faculty', 2, 'principal', 'Principal', 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `leave_balance_v2`
--

CREATE TABLE `leave_balance_v2` (
  `id` int(11) NOT NULL,
  `applicant_type` enum('student','faculty') NOT NULL,
  `applicant_id` int(11) NOT NULL,
  `leave_type_id` tinyint(3) UNSIGNED NOT NULL,
  `academic_year` varchar(9) NOT NULL,
  `total_allocated` decimal(5,1) NOT NULL DEFAULT 0.0,
  `total_used` decimal(5,1) NOT NULL DEFAULT 0.0,
  `total_pending` decimal(5,1) NOT NULL DEFAULT 0.0,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_notifications_v2`
--

CREATE TABLE `leave_notifications_v2` (
  `id` int(11) NOT NULL,
  `leave_request_id` int(11) NOT NULL,
  `recipient_type` enum('student','faculty','hod','principal','class_incharge') NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `notification_type` enum('submitted','approved','rejected','forwarded','reminder','cancelled') NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `sent_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL,
  `applicant_type` enum('student','faculty') NOT NULL,
  `applicant_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `leave_type_id` tinyint(3) UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` decimal(4,1) NOT NULL,
  `reason` text NOT NULL,
  `document_url` varchar(500) DEFAULT NULL,
  `affected_periods` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`affected_periods`)),
  `overall_status` enum('pending','approved','rejected','cancelled','withdrawn') NOT NULL DEFAULT 'pending',
  `substitute_faculty_id` int(11) DEFAULT NULL,
  `substitute_accepted` tinyint(1) DEFAULT NULL,
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_types`
--

CREATE TABLE `leave_types` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `applicable_to` set('student','faculty') NOT NULL,
  `max_days_once` tinyint(3) UNSIGNED DEFAULT NULL,
  `max_days_year` smallint(5) UNSIGNED DEFAULT NULL,
  `requires_document` tinyint(1) NOT NULL DEFAULT 0,
  `is_paid` tinyint(1) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_types`
--

INSERT INTO `leave_types` (`id`, `code`, `name`, `applicable_to`, `max_days_once`, `max_days_year`, `requires_document`, `is_paid`, `is_active`) VALUES
(1, 'CL', 'Casual Leave', 'student,faculty', 3, 12, 0, 1, 1),
(2, 'ML', 'Medical Leave', 'student,faculty', 15, 15, 1, 1, 1),
(3, 'OD', 'On Duty', 'student,faculty', 5, 30, 0, 1, 1),
(4, 'SL', 'Special Leave', 'student', 7, 7, 0, 1, 1),
(5, 'EL', 'Earned Leave', 'faculty', 15, 30, 0, 1, 1),
(6, 'MAT', 'Maternity Leave', 'faculty', 90, 90, 1, 1, 1),
(7, 'COMP', 'Compensatory Off', 'faculty', 3, 10, 0, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `period_slots`
--

CREATE TABLE `period_slots` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `slot_order` tinyint(3) UNSIGNED NOT NULL,
  `slot_type` enum('teaching','break') NOT NULL DEFAULT 'teaching',
  `period_number` tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'I=1..VII=7; NULL for breaks',
  `period_label` varchar(20) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration_minutes` tinyint(3) UNSIGNED NOT NULL,
  `break_name` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `period_slots`
--

INSERT INTO `period_slots` (`id`, `slot_order`, `slot_type`, `period_number`, `period_label`, `start_time`, `end_time`, `duration_minutes`, `break_name`, `is_active`) VALUES
(1, 1, 'teaching', 1, 'I', '09:30:00', '10:20:00', 50, NULL, 1),
(2, 2, 'teaching', 2, 'II', '10:20:00', '11:10:00', 50, NULL, 1),
(3, 3, 'break', NULL, 'Break', '11:10:00', '11:30:00', 20, 'Tea Break', 1),
(4, 4, 'teaching', 3, 'III', '11:30:00', '12:25:00', 55, NULL, 1),
(5, 5, 'break', NULL, 'Lunch', '12:25:00', '13:10:00', 45, 'Lunch Break', 1),
(6, 6, 'teaching', 4, 'IV', '13:10:00', '14:00:00', 50, NULL, 1),
(7, 7, 'teaching', 5, 'V', '14:00:00', '14:50:00', 50, NULL, 1),
(8, 8, 'break', NULL, 'Break', '14:50:00', '15:10:00', 20, 'Short Break', 1),
(9, 9, 'teaching', 6, 'VI', '15:10:00', '16:00:00', 50, NULL, 1),
(10, 10, 'teaching', 7, 'VII', '16:00:00', '16:45:00', 45, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `period_topic_log`
--

CREATE TABLE `period_topic_log` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `attendance_date` date NOT NULL,
  `period_slot_id` tinyint(3) UNSIGNED NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `lesson_plan_id` int(11) NOT NULL,
  `unit_number` tinyint(1) NOT NULL,
  `topic_summary` varchar(500) DEFAULT NULL,
  `periods_covered` tinyint(2) NOT NULL DEFAULT 1,
  `co_number` varchar(20) DEFAULT NULL,
  `btl` varchar(20) DEFAULT NULL,
  `is_deviation` tinyint(1) NOT NULL DEFAULT 0,
  `deviation_note` varchar(500) DEFAULT NULL,
  `master_slot_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'super-admin'),
(2, 'super-admin'),
(3, 'executive-admin'),
(4, 'IQAC-Admin'),
(5, 'faculty'),
(6, 'student'),
(7, 'department-admin');

-- --------------------------------------------------------

--
-- Table structure for table `staff_attendance`
--

CREATE TABLE `staff_attendance` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `attendance_date` date NOT NULL,
  `day_status` enum('present','absent','half_day','on_leave','on_duty','holiday') NOT NULL DEFAULT 'present',
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `marked_by` int(11) DEFAULT NULL,
  `marked_at` datetime NOT NULL DEFAULT current_timestamp(),
  `leave_request_id` int(11) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_attendance_entry`
--

CREATE TABLE `staff_attendance_entry` (
  `staff_attendance_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `class_section_id` int(11) DEFAULT NULL,
  `work_date` date NOT NULL,
  `period_session_number` tinyint(4) DEFAULT NULL,
  `attendance_status` enum('Present','Absent','Late','Half-Day','On-Leave','On-Duty') NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `marked_timestamp` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_period_attendance`
--

CREATE TABLE `staff_period_attendance` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `staff_att_id` bigint(20) UNSIGNED NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `attendance_date` date NOT NULL,
  `period_slot_id` tinyint(3) UNSIGNED NOT NULL,
  `period_number` tinyint(3) UNSIGNED NOT NULL,
  `session_type` enum('theory','lab','tutorial','activity','project') NOT NULL DEFAULT 'theory',
  `status` enum('conducted','cancelled','substitute_taken') NOT NULL DEFAULT 'conducted',
  `substitute_faculty_id` int(11) DEFAULT NULL,
  `students_present` smallint(5) UNSIGNED DEFAULT NULL,
  `students_total` smallint(5) UNSIGNED DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_attendance`
--

CREATE TABLE `student_attendance` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `master_slot_id` int(11) DEFAULT NULL,
  `attendance_date` date NOT NULL,
  `period_slot_id` tinyint(3) UNSIGNED NOT NULL,
  `period_number` tinyint(3) UNSIGNED NOT NULL,
  `academic_year` varchar(9) NOT NULL,
  `semester` tinyint(2) UNSIGNED NOT NULL,
  `status` enum('present','absent','late','od','medical_leave','duty_leave') NOT NULL DEFAULT 'absent',
  `is_lab_session` tinyint(1) NOT NULL DEFAULT 0,
  `lab_group` varchar(20) DEFAULT NULL,
  `session_type` enum('theory','lab','tutorial','activity','project') NOT NULL DEFAULT 'theory',
  `marked_by` int(11) NOT NULL,
  `marked_at` datetime NOT NULL DEFAULT current_timestamp(),
  `is_modified` tinyint(1) NOT NULL DEFAULT 0,
  `modified_by` int(11) DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `lesson_plan_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_attendance`
--

INSERT INTO `student_attendance` (`id`, `student_id`, `class_id`, `subject_id`, `faculty_id`, `master_slot_id`, `attendance_date`, `period_slot_id`, `period_number`, `academic_year`, `semester`, `status`, `is_lab_session`, `lab_group`, `session_type`, `marked_by`, `marked_at`, `is_modified`, `modified_by`, `modified_at`, `remarks`, `lesson_plan_id`) VALUES
(1, 4159, 21, 98, 406, NULL, '2026-03-19', 1, 1, '2025-2026', 6, 'present', 0, NULL, 'theory', 435, '2026-03-21 07:13:28', 1, 435, '2026-03-21 07:13:28', NULL, NULL),
(2, 3967, 21, 98, 406, NULL, '2026-03-19', 1, 1, '2025-2026', 6, 'present', 0, NULL, 'theory', 435, '2026-03-21 07:13:27', 1, 435, '2026-03-21 07:13:27', NULL, NULL),
(3, 3968, 21, 98, 406, NULL, '2026-03-19', 1, 1, '2025-2026', 6, 'present', 0, NULL, 'theory', 435, '2026-03-21 07:13:28', 1, 435, '2026-03-21 07:13:28', NULL, NULL),
(4, 3969, 21, 98, 406, NULL, '2026-03-19', 1, 1, '2025-2026', 6, 'present', 0, NULL, 'theory', 435, '2026-03-21 07:13:28', 1, 435, '2026-03-21 07:13:28', NULL, NULL),
(5, 3970, 21, 98, 406, NULL, '2026-03-19', 1, 1, '2025-2026', 6, 'present', 0, NULL, 'theory', 435, '2026-03-21 07:13:28', 1, 435, '2026-03-21 07:13:28', NULL, NULL),
(6, 3971, 21, 98, 406, NULL, '2026-03-19', 1, 1, '2025-2026', 6, 'present', 0, NULL, 'theory', 435, '2026-03-21 07:13:28', 1, 435, '2026-03-21 07:13:28', NULL, NULL),
(7, 3972, 21, 98, 406, NULL, '2026-03-19', 1, 1, '2025-2026', 6, 'present', 0, NULL, 'theory', 435, '2026-03-21 07:13:28', 1, 435, '2026-03-21 07:13:28', NULL, NULL),
(8, 3973, 21, 98, 406, NULL, '2026-03-19', 1, 1, '2025-2026', 6, 'present', 0, NULL, 'theory', 435, '2026-03-21 07:13:28', 1, 435, '2026-03-21 07:13:28', NULL, NULL),
(9, 3974, 21, 98, 406, NULL, '2026-03-19', 1, 1, '2025-2026', 6, 'absent', 0, NULL, 'theory', 435, '2026-03-21 07:13:28', 1, 435, '2026-03-21 07:13:28', NULL, NULL),
(10, 3975, 21, 98, 406, NULL, '2026-03-19', 1, 1, '2025-2026', 6, 'absent', 0, NULL, 'theory', 435, '2026-03-21 07:13:28', 1, 435, '2026-03-21 07:13:28', NULL, NULL),
(11, 3976, 21, 98, 406, NULL, '2026-03-19', 1, 1, '2025-2026', 6, 'present', 0, NULL, 'theory', 435, '2026-03-21 07:13:28', 1, 435, '2026-03-21 07:13:28', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_bio`
--

CREATE TABLE `student_bio` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `alternatePhone` varchar(20) DEFAULT NULL,
  `linkedinUrl` varchar(255) DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `bloodGroup` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') DEFAULT NULL,
  `nationality` varchar(60) DEFAULT NULL,
  `religion` varchar(60) DEFAULT NULL,
  `category` varchar(30) DEFAULT NULL,
  `aadharNo` varchar(20) DEFAULT NULL,
  `motherTongue` varchar(60) DEFAULT NULL,
  `residenceType` enum('hosteller','day_scholar','other') DEFAULT NULL,
  `address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`address`)),
  `permanentAddress` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permanentAddress`)),
  `parentInfo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parentInfo`)),
  `references` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`references`)),
  `previousEducation` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`previousEducation`)),
  `scholarshipDetails` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`scholarshipDetails`)),
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documents`)),
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_bio`
--

INSERT INTO `student_bio` (`id`, `studentId`, `alternatePhone`, `linkedinUrl`, `dateOfBirth`, `bloodGroup`, `nationality`, `religion`, `category`, `aadharNo`, `motherTongue`, `residenceType`, `address`, `permanentAddress`, `parentInfo`, `references`, `previousEducation`, `scholarshipDetails`, `documents`, `createdAt`, `updatedAt`) VALUES
(1, 3975, NULL, 'https://www.linkedin.com/in/r-logesh-kumar-74566a2a3/', NULL, 'B+', 'Indian', '', NULL, NULL, 'Tamil', 'day_scholar', NULL, NULL, '{\"father\":{\"name\":\"\",\"phone\":\"\",\"email\":\"\",\"occupation\":\"\",\"qualification\":\"\",\"annualIncome\":\"\"},\"mother\":{\"name\":\"\",\"phone\":\"\",\"email\":\"\",\"occupation\":\"\",\"qualification\":\"\",\"annualIncome\":\"\"},\"guardian\":{\"name\":\"\",\"relation\":\"\",\"phone\":\"\",\"address\":\"\"}}', NULL, NULL, NULL, NULL, '2026-03-18 05:26:59', '2026-03-20 10:25:21');

-- --------------------------------------------------------

--
-- Table structure for table `student_certifications`
--

CREATE TABLE `student_certifications` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `issuer` varchar(150) NOT NULL,
  `issueDate` date NOT NULL,
  `expiryDate` date DEFAULT NULL,
  `credentialId` varchar(100) DEFAULT NULL,
  `credentialUrl` varchar(500) DEFAULT NULL,
  `skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills`)),
  `documentUrl` varchar(500) DEFAULT NULL,
  `approvalStatus` enum('pending','approved','rejected') DEFAULT 'pending',
  `approvedById` int(11) DEFAULT NULL,
  `approvalRemarks` varchar(500) DEFAULT NULL,
  `approvalDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_certifications`
--

INSERT INTO `student_certifications` (`id`, `studentId`, `name`, `issuer`, `issueDate`, `expiryDate`, `credentialId`, `credentialUrl`, `skills`, `documentUrl`, `approvalStatus`, `approvedById`, `approvalRemarks`, `approvalDate`, `createdAt`, `updatedAt`) VALUES
(2, 3975, 'claude code in action', 'anthrophic', '2026-03-19', '2026-03-20', 'Anthrophic-784', 'https://verify.skilljar.com/c/ybbipj9wpv68', '\"[\\\"mcp\\\"]\"', 'documentUrl-1773860315571-608046220.pdf', 'approved', 406, 'keep going lokesh', '2026-03-19 05:18:18', '2026-03-18 18:58:35', '2026-03-19 05:18:18');

-- --------------------------------------------------------

--
-- Table structure for table `student_events`
--

CREATE TABLE `student_events` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `eventName` varchar(200) NOT NULL,
  `eventType` enum('cultural','technical','sports','social','workshop','seminar','other') NOT NULL DEFAULT 'other',
  `organizer` varchar(150) DEFAULT NULL,
  `eventDate` date NOT NULL,
  `role` enum('participant','organizer','volunteer','speaker','judge','other') NOT NULL DEFAULT 'participant',
  `achievement` varchar(300) DEFAULT NULL,
  `level` enum('college','district','state','national','international') NOT NULL DEFAULT 'college',
  `certificateUrl` varchar(500) DEFAULT NULL,
  `approvalStatus` enum('pending','approved','rejected') DEFAULT 'pending',
  `approvedById` int(11) DEFAULT NULL,
  `approvalRemarks` varchar(500) DEFAULT NULL,
  `approvalDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_internal_marks`
--

CREATE TABLE `student_internal_marks` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `subjectId` int(11) NOT NULL,
  `semester` int(11) NOT NULL,
  `academicYear` varchar(9) NOT NULL,
  `internalNumber` int(11) NOT NULL,
  `internalScore` decimal(5,2) DEFAULT 0.00,
  `assessmentScore` decimal(5,2) DEFAULT 0.00,
  `totalScore` decimal(5,2) DEFAULT 0.00,
  `remarks` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_leaves`
--

CREATE TABLE `student_leaves` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `leaveType` enum('Medical','Casual','On-Duty','Special','Other','Leave','Personal','Earned') NOT NULL DEFAULT 'Casual',
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `totalDays` decimal(4,1) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `approvedById` int(11) DEFAULT NULL,
  `approvalRemarks` varchar(500) DEFAULT NULL,
  `approvalDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `classId` int(11) DEFAULT NULL,
  `overall_status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `class_incharge_approval_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `class_incharge_id` int(11) DEFAULT NULL,
  `class_incharge_remarks` text DEFAULT NULL,
  `class_incharge_approval_date` datetime DEFAULT NULL,
  `department_admin_approval_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `department_admin_id` int(11) DEFAULT NULL,
  `department_admin_remarks` text DEFAULT NULL,
  `department_admin_approval_date` datetime DEFAULT NULL,
  `leaveSubType` varchar(100) DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `submitted_to` enum('Class Incharge','Faculty Advisor','HOD') NOT NULL DEFAULT 'Class Incharge'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_leaves`
--

INSERT INTO `student_leaves` (`id`, `studentId`, `leaveType`, `startDate`, `endDate`, `totalDays`, `reason`, `status`, `approvedById`, `approvalRemarks`, `approvalDate`, `createdAt`, `updatedAt`, `classId`, `overall_status`, `class_incharge_approval_status`, `class_incharge_id`, `class_incharge_remarks`, `class_incharge_approval_date`, `department_admin_approval_status`, `department_admin_id`, `department_admin_remarks`, `department_admin_approval_date`, `leaveSubType`, `attachment`, `submitted_to`) VALUES
(4, 3975, '', '2026-03-16', '2026-03-17', 2.0, 'asdfjkl;', 'pending', NULL, NULL, NULL, '2026-03-16 05:08:23', '2026-03-16 05:08:23', 21, 'pending', 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, 'Personal Leave', NULL, 'Class Incharge'),
(5, 3975, 'Medical', '2026-03-20', '2026-03-21', 2.0, 'Test after fix', 'pending', NULL, NULL, NULL, '2026-03-18 06:08:49', '2026-03-19 05:16:59', 21, 'cancelled', 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, 'Sick', 'test-doc.pdf', 'Class Incharge'),
(6, 3975, 'Personal', '2026-03-18', '2026-03-19', 2.0, 'personal', 'pending', NULL, NULL, NULL, '2026-03-18 06:09:33', '2026-03-18 18:04:20', 21, 'rejected', 'rejected', 406, NULL, '2026-03-18 18:04:20', 'pending', 435, NULL, NULL, 'Personal Leave', NULL, 'Class Incharge'),
(7, 3975, 'Personal', '2026-03-18', '2026-03-19', 2.0, 'personal', 'pending', NULL, NULL, NULL, '2026-03-18 07:18:57', '2026-03-18 08:39:18', 21, 'approved', 'approved', 406, NULL, '2026-03-18 08:38:47', 'approved', 435, NULL, '2026-03-18 08:39:18', 'Personal Leave', 'attachment-1773818337550-804097791.pdf', 'Class Incharge'),
(8, 3975, 'On-Duty', '2026-03-19', '2026-03-19', 1.0, 'leave for workshop', 'pending', NULL, NULL, NULL, '2026-03-19 05:17:34', '2026-03-19 05:19:10', 21, 'approved', 'approved', 406, 'ok', '2026-03-19 05:18:32', 'approved', 435, 'ok', '2026-03-19 05:19:10', 'Workshop', 'attachment-1773897454516-392030487.png', 'Class Incharge'),
(9, 3975, 'On-Duty', '2026-03-21', '2026-03-21', 1.0, 'xjfdsafjf', 'pending', NULL, NULL, NULL, '2026-03-20 10:19:04', '2026-03-20 10:20:01', 21, 'approved', 'approved', 406, 'dcfbnjk,', '2026-03-20 10:19:26', 'approved', 435, NULL, '2026-03-20 10:20:01', 'Workshop', NULL, 'Class Incharge');

-- --------------------------------------------------------

--
-- Table structure for table `student_marks`
--

CREATE TABLE `student_marks` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `subjectId` int(11) NOT NULL,
  `semester` int(11) NOT NULL,
  `academicYear` varchar(9) NOT NULL,
  `internalMarks` decimal(5,2) DEFAULT 0.00,
  `externalMarks` decimal(5,2) DEFAULT 0.00,
  `totalMarks` decimal(5,2) DEFAULT 0.00,
  `grade` enum('A+','A','A-','B+','B','B-','C+','C','C-','D','F') DEFAULT NULL,
  `gradePoints` decimal(4,2) DEFAULT NULL,
  `credits` int(11) NOT NULL DEFAULT 4,
  `status` enum('pass','fail','absent','withheld','pending') DEFAULT 'pending',
  `remarks` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_notifications`
--

CREATE TABLE `student_notifications` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('academic','leave','fee','general','disciplinary','attendance','result','approval','announcement') NOT NULL DEFAULT 'general',
  `priority` enum('low','medium','high','urgent') DEFAULT 'low',
  `referenceId` int(11) DEFAULT NULL,
  `referenceType` varchar(50) DEFAULT NULL,
  `actionUrl` varchar(300) DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT 0,
  `readAt` datetime DEFAULT NULL,
  `expiresAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_notifications`
--

INSERT INTO `student_notifications` (`id`, `studentId`, `title`, `message`, `type`, `priority`, `referenceId`, `referenceType`, `actionUrl`, `isRead`, `readAt`, `expiresAt`, `createdAt`, `updatedAt`) VALUES
(1, 3975, 'Leave Application Submitted', 'Your Personal leave application for 2 days has been submitted.', 'leave', 'low', 6, 'StudentLeave', NULL, 0, NULL, NULL, '2026-03-18 06:09:33', '2026-03-18 06:09:33'),
(2, 3975, 'Leave Application Submitted', 'Your Personal leave application for 2 days has been submitted.', 'leave', 'low', 7, 'StudentLeave', NULL, 0, NULL, NULL, '2026-03-18 07:18:57', '2026-03-18 07:18:57'),
(3, 3975, 'Class Incharge Approved', 'Your leave has been approved by NAGAJOTHI P. Awaiting department admin approval.', 'leave', 'low', 7, 'StudentLeave', NULL, 0, NULL, NULL, '2026-03-18 08:38:47', '2026-03-18 08:38:47'),
(4, 3975, 'Leave Approved', 'Your Personal leave has been approved by all required authorities.', 'leave', 'low', 7, 'StudentLeave', NULL, 0, NULL, NULL, '2026-03-18 08:39:18', '2026-03-18 08:39:18'),
(5, 3975, 'Leave Rejected', 'Your Personal leave has been rejected. Reason: Not specified', 'leave', 'low', 6, 'StudentLeave', NULL, 0, NULL, NULL, '2026-03-18 18:04:20', '2026-03-18 18:04:20'),
(6, 3975, 'Sport Approved', 'Your sport \"WWE\" has been approved. ', 'approval', 'medium', 1, 'sport', '/student/portfolio/sports', 0, NULL, NULL, '2026-03-18 18:30:43', '2026-03-18 18:30:43'),
(7, 3975, 'Certification Approved', 'Your certification \"claude code action\" has been approved. ', 'approval', 'medium', 1, 'certification', '/student/portfolio/certifications', 0, NULL, NULL, '2026-03-18 18:52:14', '2026-03-18 18:52:14'),
(8, 3975, 'Sport Approved', 'Your sport \"WWE\" has been approved. ', 'approval', 'medium', 1, 'sport', '/student/portfolio/sports', 0, NULL, NULL, '2026-03-18 18:52:21', '2026-03-18 18:52:21'),
(9, 3975, 'Leave Application Submitted', 'Your On-Duty leave application for 1 days has been submitted.', 'leave', 'low', 8, 'StudentLeave', NULL, 0, NULL, NULL, '2026-03-19 05:17:34', '2026-03-19 05:17:34'),
(10, 3975, 'Certification Approved', 'Your certification \"claude code in action\" has been approved. Remarks: keep going lokesh', 'approval', 'medium', 2, 'certification', '/student/portfolio/certifications', 0, NULL, NULL, '2026-03-19 05:18:18', '2026-03-19 05:18:18'),
(11, 3975, 'Class Incharge Approved', 'Your leave has been approved by NAGAJOTHI P. Awaiting department admin approval.', 'leave', 'low', 8, 'StudentLeave', NULL, 0, NULL, NULL, '2026-03-19 05:18:32', '2026-03-19 05:18:32'),
(12, 3975, 'Leave Approved', 'Your On-Duty leave has been approved by all required authorities.', 'leave', 'low', 8, 'StudentLeave', NULL, 0, NULL, NULL, '2026-03-19 05:19:10', '2026-03-19 05:19:10'),
(13, 3975, 'Leave Application Submitted', 'Your On-Duty leave application for 1 days has been submitted.', 'leave', 'low', 9, 'StudentLeave', NULL, 0, NULL, NULL, '2026-03-20 10:19:04', '2026-03-20 10:19:04'),
(14, 3975, 'Class Incharge Approved', 'Your leave has been approved by NAGAJOTHI P. Awaiting department admin approval.', 'leave', 'low', 9, 'StudentLeave', NULL, 0, NULL, NULL, '2026-03-20 10:19:26', '2026-03-20 10:19:26'),
(15, 3975, 'Leave Approved', 'Your On-Duty leave has been approved by all required authorities.', 'leave', 'low', 9, 'StudentLeave', NULL, 0, NULL, NULL, '2026-03-20 10:20:01', '2026-03-20 10:20:01');

-- --------------------------------------------------------

--
-- Table structure for table `student_profile`
--

CREATE TABLE `student_profile` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `role_id` int(11) NOT NULL DEFAULT 6,
  `studentId` varchar(30) NOT NULL,
  `rollNumber` varchar(30) NOT NULL,
  `admissionNo` varchar(30) DEFAULT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL DEFAULT '9876543210',
  `photo` varchar(255) DEFAULT 'default-student.png',
  `gender` enum('male','female','other') NOT NULL DEFAULT 'male',
  `departmentId` int(11) NOT NULL,
  `classId` int(11) DEFAULT NULL,
  `batch` varchar(20) NOT NULL,
  `semester` tinyint(2) NOT NULL,
  `year` varchar(10) DEFAULT NULL,
  `admissionDate` date DEFAULT NULL,
  `admissionType` enum('regular','lateral','management') DEFAULT 'regular',
  `feeStatus` enum('paid','pending','partial') DEFAULT 'pending',
  `status` enum('active','inactive','graduated','dropped','suspended') DEFAULT 'active',
  `password` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `emisNo` varchar(50) DEFAULT NULL COMMENT 'Education Management Information System Number'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_profile`
--

INSERT INTO `student_profile` (`id`, `userId`, `role_id`, `studentId`, `rollNumber`, `admissionNo`, `firstName`, `lastName`, `email`, `phone`, `photo`, `gender`, `departmentId`, `classId`, `batch`, `semester`, `year`, `admissionDate`, `admissionType`, `feeStatus`, `status`, `password`, `createdAt`, `updatedAt`, `emisNo`) VALUES
(3686, NULL, 6, '921024243001', '921024243001', NULL, 'ABARNA', 'K', '921024243001@nscet.org', '9876543210', 'default-student.png', 'female', 6, NULL, '2024-2028', 4, '2', '2024-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3687, NULL, 6, '921024243002', '921024243002', NULL, 'ABDUL RAHMAN', 'U', '921024243002@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2024-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3688, NULL, 6, '921024243003', '921024243003', NULL, 'ANBU DHARSINI', 'V', '921024243003@nscet.org', '9876543210', 'default-student.png', 'female', 6, NULL, '2024-2028', 4, '2', '2024-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3967, NULL, 6, '921023243001', '921023243001', NULL, 'AJAY PRASATH', 'K', '921023243001@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3968, NULL, 6, '921023243002', '921023243002', NULL, 'ANFIYAA', 'M', '921023243002@nscet.org', '9876543210', 'default-student.png', 'female', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3969, NULL, 6, '921023243004', '921023243004', NULL, 'ASIM FATHIMA', 'P', '921023243004@nscet.org', '9876543210', 'default-student.png', 'female', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3970, NULL, 6, '921023243005', '921023243005', NULL, 'BALAJI', 'B', '921023243005@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3971, NULL, 6, '921023243006', '921023243006', NULL, 'DEVENDRA KUMAR', 'P', '921023243006@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3972, NULL, 6, '921023243007', '921023243007', NULL, 'GOKUL', 'M', '921023243007@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3973, NULL, 6, '921023243008', '921023243008', NULL, 'HARI PRABHA', 'S', '921023243008@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3974, NULL, 6, '921023243009', '921023243009', NULL, 'KAVIYAMAHESHWARI', 'J', '921023243009@nscet.org', '9876543210', 'default-student.png', 'female', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3975, NULL, 6, '3975', '921023243010', NULL, 'LOGESH KUMAR', 'R', '921023243010@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'pending', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-20 10:25:49', NULL),
(3976, NULL, 6, '921023243011', '921023243011', NULL, 'MALARVIZHI', 'S', '921023243011@nscet.org', '9876543210', 'default-student.png', 'female', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(4159, NULL, 3, '921023243018', '23AI&100', NULL, 'SHRIMATHI', 'R', 'shrimathiravi44@gmail.com', '9384114714', 'default-student.png', 'female', 6, 21, '2023-2027', 1, '3', '2026-03-15', 'regular', 'pending', 'active', '$2a$10$jvuWQ71xy2Z1C2XBFBTdleqcajw0FoikNF5Tw.o4CZmzW1MrcJ2v6', '2026-03-15 09:29:14', '2026-03-18 10:24:18', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_projects`
--

CREATE TABLE `student_projects` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `techStack` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`techStack`)),
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `demoUrl` varchar(500) DEFAULT NULL,
  `repoUrl` varchar(500) DEFAULT NULL,
  `status` enum('in-progress','completed','planned','paused') DEFAULT 'in-progress',
  `approvalStatus` enum('pending','approved','rejected') DEFAULT 'pending',
  `approvedById` int(11) DEFAULT NULL,
  `approvalRemarks` varchar(500) DEFAULT NULL,
  `approvalDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_sports`
--

CREATE TABLE `student_sports` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` enum('Team Sports','Individual Sports','Aquatics','Combat Sports','Other') NOT NULL DEFAULT 'Other',
  `joinedDate` date NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `achievements` varchar(500) DEFAULT NULL,
  `level` enum('college','district','state','national','international') NOT NULL DEFAULT 'college',
  `documentUrl` varchar(500) DEFAULT NULL,
  `approvalStatus` enum('pending','approved','rejected') DEFAULT 'pending',
  `approvedById` int(11) DEFAULT NULL,
  `approvalRemarks` varchar(500) DEFAULT NULL,
  `approvalDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `department_id` int(11) NOT NULL,
  `semester` tinyint(2) NOT NULL,
  `academic_year` varchar(9) DEFAULT NULL,
  `year` tinyint(4) DEFAULT NULL,
  `sem_type` enum('odd','even') NOT NULL DEFAULT 'odd',
  `class_id` int(11) DEFAULT NULL,
  `credits` decimal(4,2) NOT NULL DEFAULT 4.00,
  `type` enum('Theory','Practical','Theory+Practical','Project','Seminar','Internship') NOT NULL DEFAULT 'Theory',
  `is_elective` tinyint(1) NOT NULL DEFAULT 0,
  `is_laboratory` tinyint(1) NOT NULL DEFAULT 0,
  `lab_name` varchar(100) DEFAULT NULL,
  `hours_per_week` tinyint(2) NOT NULL DEFAULT 3,
  `lab_hours_per_week` tinyint(2) NOT NULL DEFAULT 0,
  `status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
  `created_by` int(11) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `batch` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `subject_code`, `subject_name`, `description`, `department_id`, `semester`, `academic_year`, `year`, `sem_type`, `class_id`, `credits`, `type`, `is_elective`, `is_laboratory`, `lab_name`, `hours_per_week`, `lab_hours_per_week`, `status`, `created_by`, `created_at`, `updated_at`, `batch`) VALUES
(90, 'CCS358', 'Principles of Programming Language', '', 6, 6, '2025-2026', 3, 'even', NULL, 4.00, 'Theory', 1, 0, NULL, 3, 0, 'active', 109, '2026-03-14 13:13:50', '2026-03-14 16:04:05', '2023-2027'),
(91, 'CS3452', 'Theory of Computation', '', 6, 4, '2025-2026', 2, 'even', NULL, 4.00, 'Theory', 1, 0, NULL, 3, 0, 'active', 109, '2026-03-14 13:13:50', '2026-03-14 13:13:50', '2024-2028'),
(92, 'AD3491', 'Fundamentals of Data Science and Analytics', '', 6, 4, '2025-2026', 2, 'even', NULL, 4.00, 'Theory', 1, 0, NULL, 3, 0, 'active', 109, '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(93, 'AD3411', 'Data Science and Analytics Lab', '', 6, 4, '2025-2026', 2, 'even', NULL, 4.00, 'Practical', 0, 1, 'linux', 0, 2, 'active', 109, '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(94, 'CCS332', 'App Development', '', 6, 5, '2025-2026', 3, 'odd', NULL, 4.00, 'Theory+Practical', 1, 1, 'Dennis', 3, 2, 'active', 109, '2026-03-14 13:13:50', '2026-03-15 08:06:06', '2023-2027'),
(95, 'NAAN-III', 'NAAN MUDHALVAN III', '', 6, 6, '2025-2026', 3, 'even', NULL, 4.00, 'Project', 0, 1, 'MAD', 3, 0, 'active', 109, '2026-03-14 13:13:50', '2026-03-14 16:06:06', '2023-2027'),
(96, 'CS3591', 'Computer Networks', '', 6, 3, '2025-2026', 2, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 'CN Lab', 3, 2, 'active', 109, '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(97, 'NAAN-II', 'NAAN MUDHALVAN II', '', 6, 5, '2025-2026', 3, 'odd', NULL, 4.00, 'Project', 0, 1, 'CAD', 3, 0, 'active', 109, '2026-03-14 13:13:50', '2026-03-14 13:13:50', '2025'),
(98, 'CCW332', 'Digital Marketing', '', 6, 6, '2025-2026', 3, 'even', NULL, 4.00, 'Theory+Practical', 0, 1, 'MAD', 3, 2, 'active', 109, '2026-03-14 13:13:50', '2026-03-14 16:18:39', '2023-2027'),
(100, 'OMA351', 'Graph Theory', '', 6, 6, '2025-2026', 3, 'even', NULL, 4.00, 'Theory', 0, 0, NULL, 3, 0, 'active', 109, '2026-03-14 13:13:50', '2026-03-14 16:39:13', '2023-2027'),
(102, 'CS3691', '	Embedded Systems and IoT', '', 6, 6, '2025-2026', 3, 'even', NULL, 4.00, 'Theory+Practical', 0, 1, '	Embedded Systems and IoT', 3, 0, 'active', 109, '2026-03-14 17:11:46', '2026-03-14 17:16:59', '2023-2027'),
(103, 'GE3451', 'Well being with Traditional Ayervedic and Yoga', '', 6, 6, '2025-2026', 3, 'even', NULL, 4.00, 'Theory+Practical', 0, 0, NULL, 3, 0, 'active', 109, '2026-03-14 17:15:20', '2026-03-14 17:15:20', '2023-2027'),
(104, 'CCS332-', 'App Development', '', 6, 6, '2025-2026', 3, 'even', NULL, 4.00, 'Theory+Practical', 1, 0, NULL, 3, 0, 'active', 109, '2026-03-15 08:04:40', '2026-03-15 08:04:40', '2023-2027'),
(105, '-', 'LIBRARY', '', 6, 6, '2025-2026', 3, 'even', NULL, 4.00, 'Theory+Practical', 1, 0, NULL, 3, 0, 'active', 109, '2026-03-15 08:12:01', '2026-03-15 08:12:01', '2023-2027'),
(106, '.', 'Placement', '', 6, 6, '2025-2026', 3, 'even', NULL, 4.00, 'Theory+Practical', 0, 0, NULL, 3, 0, 'active', 109, '2026-03-15 08:12:33', '2026-03-15 08:12:33', '2023-2027'),
(107, 'MH', 'MINI-HACKATHON', '', 6, 6, '2025-2026', 3, 'even', NULL, 4.00, 'Practical', 1, 0, NULL, 3, 0, 'active', 109, '2026-03-15 08:36:47', '2026-03-17 04:05:30', '2023-2027');

-- --------------------------------------------------------

--
-- Table structure for table `subject_class_mappings`
--

CREATE TABLE `subject_class_mappings` (
  `id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `semester` tinyint(2) NOT NULL,
  `academic_year` varchar(9) NOT NULL,
  `is_core` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subject_class_mappings`
--

INSERT INTO `subject_class_mappings` (`id`, `subject_id`, `class_id`, `department_id`, `semester`, `academic_year`, `is_core`, `status`, `created_at`) VALUES
(8, 95, 21, 6, 6, '2026-2027', 1, 'active', '2026-03-14 15:09:21'),
(9, 102, 21, 6, 6, '2026-2027', 1, 'active', '2026-03-14 17:15:37'),
(10, 103, 21, 6, 6, '2026-2027', 1, 'active', '2026-03-14 17:15:48'),
(11, 100, 21, 6, 6, '2026-2027', 1, 'active', '2026-03-14 17:16:15'),
(12, 90, 21, 6, 6, '2026-2027', 1, 'active', '2026-03-14 17:16:38'),
(13, 98, 21, 6, 6, '2026-2027', 1, 'active', '2026-03-14 17:16:46'),
(14, 94, 21, 6, 6, '2026-2027', 1, 'active', '2026-03-15 08:05:34'),
(15, 105, 21, 6, 6, '2026-2027', 1, 'active', '2026-03-15 08:13:02'),
(16, 106, 21, 6, 6, '2026-2027', 1, 'active', '2026-03-15 08:13:11'),
(17, 107, 21, 6, 6, '2026-2027', 1, 'active', '2026-03-15 08:37:44');

-- --------------------------------------------------------

--
-- Table structure for table `timetable_master`
--

CREATE TABLE `timetable_master` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `academic_year` varchar(9) NOT NULL,
  `semester` tinyint(2) UNSIGNED NOT NULL,
  `semester_type` enum('odd','even') NOT NULL DEFAULT 'even',
  `batch` varchar(20) DEFAULT NULL,
  `room_no` varchar(20) DEFAULT NULL,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `revision_no` varchar(30) DEFAULT NULL,
  `status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
  `class_coordinator_id` int(11) DEFAULT NULL,
  `asst_coordinator_id` int(11) DEFAULT NULL,
  `timetable_incharge_id` int(11) DEFAULT NULL,
  `hod_id` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `timetable_master`
--

INSERT INTO `timetable_master` (`id`, `class_id`, `department_id`, `academic_year`, `semester`, `semester_type`, `batch`, `room_no`, `effective_from`, `effective_to`, `revision_no`, `status`, `class_coordinator_id`, `asst_coordinator_id`, `timetable_incharge_id`, `hod_id`, `approved_by`, `approved_at`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 21, 6, '2025-2026', 6, 'even', '2023-2027', 'CR-15', '2026-01-05', NULL, '05.01.2026/01', 'active', 406, 496, 406, 435, NULL, NULL, 435, '2026-03-14 13:13:50', '2026-03-20 16:36:56');

-- --------------------------------------------------------

--
-- Table structure for table `timetable_master_slots`
--

CREATE TABLE `timetable_master_slots` (
  `id` int(11) NOT NULL,
  `master_id` int(11) NOT NULL,
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `period_slot_id` tinyint(3) UNSIGNED NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `faculty_id` int(11) DEFAULT NULL,
  `session_type` enum('theory','lab','tutorial','activity','project','free') NOT NULL DEFAULT 'theory',
  `is_lab_session` tinyint(1) NOT NULL DEFAULT 0,
  `lab_pair_slot_id` int(11) DEFAULT NULL,
  `lab_group` varchar(20) DEFAULT NULL,
  `room` varchar(50) DEFAULT NULL,
  `notes` varchar(200) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `timetable_master_slots`
--

INSERT INTO `timetable_master_slots` (`id`, `master_id`, `day`, `period_slot_id`, `subject_id`, `faculty_id`, `session_type`, `is_lab_session`, `lab_pair_slot_id`, `lab_group`, `room`, `notes`, `created_at`, `updated_at`) VALUES
(329, 1, 'Monday', 1, 103, 513, 'tutorial', 0, NULL, NULL, NULL, 'YOGA', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(330, 1, 'Monday', 2, 102, 507, 'theory', 0, NULL, NULL, 'CR-15', 'ESIOT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(331, 1, 'Monday', 4, 98, 406, 'theory', 0, NULL, NULL, 'CR-15', 'DM', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(332, 1, 'Monday', 6, 100, NULL, 'theory', 0, NULL, NULL, 'CR-15', 'GT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(333, 1, 'Monday', 7, 94, 496, 'theory', 0, NULL, NULL, 'CR-15', 'APP', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(334, 1, 'Monday', 9, 98, 406, 'theory', 0, NULL, NULL, 'CR-15', 'DM', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(335, 1, 'Monday', 10, 94, 496, 'theory', 0, NULL, NULL, 'CR-15', 'APP', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(336, 1, 'Tuesday', 1, 94, 496, 'lab', 0, NULL, NULL, NULL, 'APP LAB', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(337, 1, 'Tuesday', 2, 94, 496, 'lab', 0, NULL, NULL, NULL, 'APP LAB', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(338, 1, 'Tuesday', 4, 100, NULL, 'theory', 0, NULL, NULL, 'CR-15', 'GT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(339, 1, 'Tuesday', 6, 102, 507, 'lab', 0, NULL, NULL, NULL, 'ESIOT LAB', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(340, 1, 'Tuesday', 7, 102, 507, 'lab', 0, NULL, NULL, NULL, 'ESIOT LAB', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(341, 1, 'Tuesday', 9, 90, 435, 'theory', 0, NULL, NULL, 'CR-15', 'PPL', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(342, 1, 'Tuesday', 10, 105, NULL, 'free', 0, NULL, NULL, 'LIBRARY', 'LIBRARY', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(343, 1, 'Wednesday', 1, 102, 507, 'theory', 0, NULL, NULL, 'CR-15', 'ESIOT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(344, 1, 'Wednesday', 2, 94, 496, 'theory', 0, NULL, NULL, 'CR-15', 'APP', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(345, 1, 'Wednesday', 4, 100, NULL, 'theory', 0, NULL, NULL, 'CR-15', 'GT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(346, 1, 'Wednesday', 6, 90, 435, 'theory', 0, NULL, NULL, 'CR-15', 'PPL', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(347, 1, 'Wednesday', 7, 106, NULL, 'activity', 0, NULL, NULL, 'CR-15', 'PLACEMENT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(348, 1, 'Wednesday', 9, 106, NULL, 'activity', 0, NULL, NULL, 'CR-15', 'PLACEMENT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(349, 1, 'Wednesday', 10, 106, NULL, 'activity', 0, NULL, NULL, 'CR-15', 'PLACEMENT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(350, 1, 'Thursday', 1, 98, 406, 'theory', 0, NULL, NULL, 'CR-15', 'DM', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(351, 1, 'Thursday', 2, 90, 435, 'theory', 0, NULL, NULL, 'CR-15', 'PPL', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(352, 1, 'Thursday', 4, 102, 507, 'theory', 0, NULL, NULL, 'CR-15', 'ESIOT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(353, 1, 'Thursday', 6, 94, 496, 'theory', 0, NULL, NULL, 'CR-15', 'APP', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(354, 1, 'Thursday', 7, 100, NULL, 'theory', 0, NULL, NULL, 'CR-15', 'GT', '2026-03-15 14:48:29', '2026-03-19 06:51:00'),
(355, 1, 'Thursday', 9, 98, 406, 'lab', 0, NULL, NULL, NULL, 'DM LAB', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(356, 1, 'Thursday', 10, 98, 406, 'lab', 0, NULL, NULL, NULL, 'DM LAB', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(357, 1, 'Friday', 1, 95, 406, 'project', 0, NULL, NULL, NULL, 'NM', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(358, 1, 'Friday', 2, 95, 406, 'project', 0, NULL, NULL, NULL, 'NM', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(359, 1, 'Friday', 4, 95, 406, 'project', 0, NULL, NULL, NULL, NULL, '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(360, 1, 'Friday', 6, 95, 406, 'project', 0, NULL, NULL, NULL, 'NAAN', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(361, 1, 'Friday', 7, 95, 406, 'project', 0, NULL, NULL, NULL, 'MUDHALVAN', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(362, 1, 'Friday', 9, 95, 406, 'project', 0, NULL, NULL, NULL, NULL, '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(363, 1, 'Friday', 10, 95, 406, 'project', 0, NULL, NULL, NULL, NULL, '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(364, 1, 'Saturday', 1, 100, NULL, 'theory', 0, NULL, NULL, 'CR-15', 'GT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(365, 1, 'Saturday', 2, 90, 435, 'theory', 0, NULL, NULL, 'CR-15', 'PPL', '2026-03-15 14:48:29', '2026-03-21 06:23:43'),
(366, 1, 'Saturday', 4, 102, 507, 'theory', 0, NULL, NULL, 'CR-15', 'ESIOT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(367, 1, 'Saturday', 6, 94, 496, 'theory', 0, NULL, NULL, 'CR-15', 'APP', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(368, 1, 'Saturday', 7, 98, 406, 'theory', 0, NULL, NULL, 'CR-15', 'DM', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(369, 1, 'Saturday', 9, 107, NULL, 'activity', 0, NULL, NULL, 'CR-15', 'MINI HACKATHON', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(370, 1, 'Saturday', 10, 107, NULL, 'activity', 0, NULL, NULL, 'CR-15', 'MINI HACKATHON', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(371, 1, 'Monday', 3, NULL, NULL, '', 0, NULL, NULL, NULL, 'BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(372, 1, 'Monday', 5, NULL, NULL, '', 0, NULL, NULL, NULL, 'LUNCH BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(373, 1, 'Monday', 8, NULL, NULL, '', 0, NULL, NULL, NULL, 'BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(374, 1, 'Tuesday', 3, NULL, NULL, '', 0, NULL, NULL, NULL, 'BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(375, 1, 'Tuesday', 5, NULL, NULL, '', 0, NULL, NULL, NULL, 'LUNCH BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(376, 1, 'Tuesday', 8, NULL, NULL, '', 0, NULL, NULL, NULL, 'BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(377, 1, 'Wednesday', 3, NULL, NULL, '', 0, NULL, NULL, NULL, 'BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(378, 1, 'Wednesday', 5, NULL, NULL, '', 0, NULL, NULL, 'LUNCH BREAK', 'LUNCH BREAK', '2026-03-15 14:48:29', '2026-03-15 14:53:06'),
(379, 1, 'Wednesday', 8, NULL, NULL, '', 0, NULL, NULL, NULL, 'BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(380, 1, 'Thursday', 3, NULL, NULL, '', 0, NULL, NULL, NULL, 'BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(381, 1, 'Thursday', 5, NULL, NULL, '', 0, NULL, NULL, NULL, 'LUNCH BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(382, 1, 'Thursday', 8, NULL, NULL, '', 0, NULL, NULL, NULL, 'BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(383, 1, 'Friday', 3, NULL, NULL, '', 0, NULL, NULL, NULL, 'BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(384, 1, 'Friday', 5, NULL, NULL, '', 0, NULL, NULL, NULL, 'LUNCH BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(385, 1, 'Friday', 8, NULL, NULL, '', 0, NULL, NULL, NULL, 'BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(386, 1, 'Saturday', 3, NULL, NULL, '', 0, NULL, NULL, NULL, 'BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(387, 1, 'Saturday', 5, NULL, NULL, '', 0, NULL, NULL, NULL, 'LUNCH BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(388, 1, 'Saturday', 8, NULL, NULL, '', 0, NULL, NULL, NULL, 'BREAK', '2026-03-15 14:48:29', '2026-03-15 14:48:29');

-- --------------------------------------------------------

--
-- Table structure for table `timetable_notifications`
--

CREATE TABLE `timetable_notifications` (
  `id` int(11) NOT NULL,
  `slot_assignment_id` int(11) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(255) NOT NULL,
  `class_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `requested_by` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timetable_overlay`
--

CREATE TABLE `timetable_overlay` (
  `id` int(11) NOT NULL,
  `master_id` int(11) NOT NULL,
  `overlay_date` date NOT NULL,
  `period_slot_id` tinyint(3) UNSIGNED NOT NULL,
  `original_faculty_id` int(11) DEFAULT NULL,
  `substitute_faculty_id` int(11) DEFAULT NULL,
  `original_subject_id` int(11) DEFAULT NULL,
  `substitute_subject_id` int(11) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `leave_request_id` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `status` enum('active','cancelled') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timetable_slots`
--

CREATE TABLE `timetable_slots` (
  `id` int(11) NOT NULL,
  `timetable_id` int(11) NOT NULL,
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `period_number` int(11) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `faculty_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `room` varchar(50) DEFAULT NULL,
  `type` enum('lecture','lab','tutorial') DEFAULT 'lecture',
  `status` enum('active','cancelled') DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timetable_slot_assignments`
--

CREATE TABLE `timetable_slot_assignments` (
  `id` int(11) NOT NULL,
  `timetable_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(255) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `assigned_by` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `year` varchar(20) DEFAULT NULL,
  `status` enum('active','pending_approval','rejected') DEFAULT 'pending_approval',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `avatar` varchar(255) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role_id`, `phone`, `isActive`, `createdAt`, `updatedAt`, `avatar`, `department_id`) VALUES
(2, 'mathalai sundaram', 'executive@nscet.org', '$2a$10$ELjprebdIeb3GTTMKk1oZujDrXZ2g8P41gNfiqVwVCKiflkwpO1eu', 3, '9876543211', 1, '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL, NULL),
(3, 'Academic Admin', 'academic@nscet.org', '$2a$10$rtVcTSxhiJKb4Cm3GdJWTety1jN8MAbcweTMHTRw2TQOE79tziyEq', 4, '9876543212', 1, '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL, NULL),
(109, 'Super admin', 'nscetadmin@gmail.com', '$2a$10$ELjprebdIeb3GTTMKk1oZujDrXZ2g8P41gNfiqVwVCKiflkwpO1eu', 2, '9876543210', 1, '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL, NULL);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_effective_timetable`
-- (See below for the actual view)
--
CREATE TABLE `v_effective_timetable` (
`master_id` int(11)
,`class_id` int(11)
,`class_name` varchar(100)
,`batch` varchar(20)
,`department_id` int(11)
,`department_name` varchar(50)
,`academic_year` varchar(9)
,`semester` tinyint(2) unsigned
,`room_no` varchar(20)
,`revision_no` varchar(30)
,`day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')
,`slot_order` tinyint(3) unsigned
,`period_number` tinyint(3) unsigned
,`period_label` varchar(20)
,`start_time` time
,`end_time` time
,`slot_type` enum('teaching','break')
,`break_name` varchar(50)
,`effective_subject_id` int(11)
,`effective_faculty_id` int(11)
,`session_type` enum('theory','lab','tutorial','activity','project','free')
,`is_lab_session` tinyint(1)
,`lab_group` varchar(20)
,`notes` varchar(200)
,`room` varchar(50)
,`source` varchar(7)
,`overlay_date` date
,`absent_faculty_id` int(11)
,`overlay_reason` varchar(255)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_faculty_timetable`
-- (See below for the actual view)
--
CREATE TABLE `v_faculty_timetable` (
`faculty_id` int(11)
,`faculty_name` varchar(100)
,`department_id` int(11)
,`faculty_dept` varchar(50)
,`designation` varchar(100)
,`class_id` int(11)
,`class_name` varchar(100)
,`batch` varchar(20)
,`academic_year` varchar(9)
,`semester` tinyint(2) unsigned
,`day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')
,`slot_order` tinyint(3) unsigned
,`period_number` tinyint(3) unsigned
,`period_label` varchar(20)
,`start_time` time
,`end_time` time
,`session_type` enum('theory','lab','tutorial','activity','project','free')
,`is_lab_session` tinyint(1)
,`lab_group` varchar(20)
,`room` varchar(50)
,`notes` varchar(200)
,`subject_code` varchar(20)
,`subject_name` varchar(255)
,`master_id` int(11)
,`slot_id` int(11)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_subject_attendance_report`
-- (See below for the actual view)
--
CREATE TABLE `v_subject_attendance_report` (
`student_id` int(11)
,`student_name` varchar(201)
,`rollNumber` varchar(30)
,`subject_id` int(11)
,`subject_code` varchar(20)
,`subject_name` varchar(255)
,`class_id` int(11)
,`class_name` varchar(100)
,`academic_year` varchar(9)
,`semester` tinyint(2) unsigned
,`faculty_id` int(11)
,`faculty_name` varchar(100)
,`total_classes` bigint(21)
,`attended` decimal(23,0)
,`absent_count` decimal(23,0)
,`attendance_pct` decimal(29,2)
,`eligibility_status` varchar(11)
);

-- --------------------------------------------------------

--
-- Structure for view `course_file_section_x`
--
DROP TABLE IF EXISTS `course_file_section_x`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `course_file_section_x`  AS SELECT `clp`.`sno` AS `sno`, `clp`.`unit_number` AS `unit_number`, `clp`.`unit_label` AS `unit_label`, `clp`.`topic` AS `topic`, `clp`.`co_number` AS `co_number`, `clp`.`btl` AS `btl`, `clp`.`delivery_mode` AS `delivery_mode`, `clp`.`reference_book` AS `reference_book`, `clp`.`periods_required` AS `periods_required`, `clp`.`cumulative_periods` AS `cumulative_periods`, `clp`.`periods_taken` AS `periods_taken`, CASE WHEN `clp`.`periods_taken` >= `clp`.`periods_required` THEN 'Y' ELSE 'N' END AS `covered`, `fp`.`Name` AS `faculty_name`, `s`.`subject_name` AS `subject_name`, `c`.`name` AS `class_name`, `clp`.`academic_year` AS `academic_year`, `clp`.`semester` AS `semester` FROM (((`course_lesson_plans` `clp` join `faculty_profiles` `fp` on(`fp`.`faculty_id` = `clp`.`faculty_id`)) join `subjects` `s` on(`s`.`id` = `clp`.`subject_id`)) join `classes` `c` on(`c`.`id` = `clp`.`class_id`)) ORDER BY `clp`.`sno` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `course_lesson_plan_progress`
--
DROP TABLE IF EXISTS `course_lesson_plan_progress`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `course_lesson_plan_progress`  AS SELECT `clp`.`faculty_id` AS `faculty_id`, `clp`.`subject_id` AS `subject_id`, `clp`.`class_id` AS `class_id`, `clp`.`academic_year` AS `academic_year`, `clp`.`semester` AS `semester`, `s`.`subject_name` AS `subject_name`, `c`.`name` AS `class_name`, count(`clp`.`id`) AS `total_topics`, sum(`clp`.`periods_required`) AS `total_periods_planned`, sum(`clp`.`periods_taken`) AS `total_periods_taught`, sum(case when `clp`.`is_completed` = 1 then 1 else 0 end) AS `topics_completed`, round(100 * sum(case when `clp`.`is_completed` = 1 then 1 else 0 end) / count(`clp`.`id`),2) AS `completion_percentage` FROM ((`course_lesson_plans` `clp` join `subjects` `s` on(`s`.`id` = `clp`.`subject_id`)) join `classes` `c` on(`c`.`id` = `clp`.`class_id`)) GROUP BY `clp`.`faculty_id`, `clp`.`subject_id`, `clp`.`class_id`, `clp`.`academic_year`, `clp`.`semester` ;

-- --------------------------------------------------------

--
-- Structure for view `v_effective_timetable`
--
DROP TABLE IF EXISTS `v_effective_timetable`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_effective_timetable`  AS SELECT `tm`.`id` AS `master_id`, `tm`.`class_id` AS `class_id`, `c`.`name` AS `class_name`, `c`.`batch` AS `batch`, `tm`.`department_id` AS `department_id`, `d`.`short_name` AS `department_name`, `tm`.`academic_year` AS `academic_year`, `tm`.`semester` AS `semester`, `tm`.`room_no` AS `room_no`, `tm`.`revision_no` AS `revision_no`, `tms`.`day` AS `day`, `ps`.`slot_order` AS `slot_order`, `ps`.`period_number` AS `period_number`, `ps`.`period_label` AS `period_label`, `ps`.`start_time` AS `start_time`, `ps`.`end_time` AS `end_time`, `ps`.`slot_type` AS `slot_type`, `ps`.`break_name` AS `break_name`, coalesce(`tov`.`substitute_subject_id`,`tms`.`subject_id`) AS `effective_subject_id`, coalesce(`tov`.`substitute_faculty_id`,`tms`.`faculty_id`) AS `effective_faculty_id`, `tms`.`session_type` AS `session_type`, `tms`.`is_lab_session` AS `is_lab_session`, `tms`.`lab_group` AS `lab_group`, `tms`.`notes` AS `notes`, `tms`.`room` AS `room`, CASE WHEN `tov`.`id` is not null THEN 'overlay' ELSE 'master' END AS `source`, `tov`.`overlay_date` AS `overlay_date`, `tov`.`original_faculty_id` AS `absent_faculty_id`, `tov`.`reason` AS `overlay_reason` FROM (((((`timetable_master` `tm` join `timetable_master_slots` `tms` on(`tms`.`master_id` = `tm`.`id`)) join `period_slots` `ps` on(`ps`.`id` = `tms`.`period_slot_id`)) join `classes` `c` on(`c`.`id` = `tm`.`class_id`)) join `departments` `d` on(`d`.`id` = `tm`.`department_id`)) left join `timetable_overlay` `tov` on(`tov`.`master_id` = `tm`.`id` and `tov`.`period_slot_id` = `tms`.`period_slot_id` and `tov`.`status` = 'active')) WHERE `tm`.`status` = 'active' ;

-- --------------------------------------------------------

--
-- Structure for view `v_faculty_timetable`
--
DROP TABLE IF EXISTS `v_faculty_timetable`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_faculty_timetable`  AS SELECT `tms`.`faculty_id` AS `faculty_id`, `fp`.`Name` AS `faculty_name`, `fp`.`department_id` AS `department_id`, `d`.`short_name` AS `faculty_dept`, `fp`.`designation` AS `designation`, `tm`.`class_id` AS `class_id`, `c`.`name` AS `class_name`, `c`.`batch` AS `batch`, `tm`.`academic_year` AS `academic_year`, `tm`.`semester` AS `semester`, `tms`.`day` AS `day`, `ps`.`slot_order` AS `slot_order`, `ps`.`period_number` AS `period_number`, `ps`.`period_label` AS `period_label`, `ps`.`start_time` AS `start_time`, `ps`.`end_time` AS `end_time`, `tms`.`session_type` AS `session_type`, `tms`.`is_lab_session` AS `is_lab_session`, `tms`.`lab_group` AS `lab_group`, `tms`.`room` AS `room`, `tms`.`notes` AS `notes`, `s`.`subject_code` AS `subject_code`, `s`.`subject_name` AS `subject_name`, `tm`.`id` AS `master_id`, `tms`.`id` AS `slot_id` FROM ((((((`timetable_master_slots` `tms` join `timetable_master` `tm` on(`tm`.`id` = `tms`.`master_id` and `tm`.`status` = 'active')) join `period_slots` `ps` on(`ps`.`id` = `tms`.`period_slot_id` and `ps`.`slot_type` = 'teaching')) join `faculty_profiles` `fp` on(`fp`.`faculty_id` = `tms`.`faculty_id`)) join `departments` `d` on(`d`.`id` = `fp`.`department_id`)) join `classes` `c` on(`c`.`id` = `tm`.`class_id`)) left join `subjects` `s` on(`s`.`id` = `tms`.`subject_id`)) ORDER BY `tms`.`faculty_id` ASC, field(`tms`.`day`,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') ASC, `ps`.`slot_order` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `v_subject_attendance_report`
--
DROP TABLE IF EXISTS `v_subject_attendance_report`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_subject_attendance_report`  AS SELECT `sa`.`student_id` AS `student_id`, concat(`sp`.`firstName`,' ',`sp`.`lastName`) AS `student_name`, `sp`.`rollNumber` AS `rollNumber`, `sa`.`subject_id` AS `subject_id`, `s`.`subject_code` AS `subject_code`, `s`.`subject_name` AS `subject_name`, `sa`.`class_id` AS `class_id`, `c`.`name` AS `class_name`, `sa`.`academic_year` AS `academic_year`, `sa`.`semester` AS `semester`, `sa`.`faculty_id` AS `faculty_id`, `fp`.`Name` AS `faculty_name`, count(0) AS `total_classes`, sum(`sa`.`status` in ('present','late','od')) AS `attended`, sum(`sa`.`status` = 'absent') AS `absent_count`, round(sum(`sa`.`status` in ('present','late','od')) * 100.0 / nullif(count(0),0),2) AS `attendance_pct`, CASE WHEN round(sum(`sa`.`status` in ('present','late','od')) * 100.0 / nullif(count(0),0),2) >= 75 THEN 'eligible' WHEN round(sum(`sa`.`status` in ('present','late','od')) * 100.0 / nullif(count(0),0),2) >= 65 THEN 'condonation' ELSE 'detained' END AS `eligibility_status` FROM ((((`student_attendance` `sa` join `student_profile` `sp` on(`sp`.`id` = `sa`.`student_id`)) join `subjects` `s` on(`s`.`id` = `sa`.`subject_id`)) join `classes` `c` on(`c`.`id` = `sa`.`class_id`)) join `faculty_profiles` `fp` on(`fp`.`faculty_id` = `sa`.`faculty_id`)) GROUP BY `sa`.`student_id`, `sa`.`subject_id`, `sa`.`class_id`, `sa`.`faculty_id`, `sa`.`academic_year`, `sa`.`semester` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `createdById` (`createdById`),
  ADD KEY `idx_announcements_type` (`type`),
  ADD KEY `idx_announcements_active` (`isActive`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `class_incharges`
--
ALTER TABLE `class_incharges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_class_academic_year` (`class_id`,`academic_year`),
  ADD KEY `idx_faculty_id` (`faculty_id`),
  ADD KEY `idx_class_id` (`class_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `course_files`
--
ALTER TABLE `course_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_course_file_assignment` (`faculty_id`,`subject_id`,`class_id`,`academic_year`,`semester`),
  ADD KEY `idx_dept_status` (`department_id`,`status`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_submission_date` (`submission_date`),
  ADD KEY `fk_cf_subject` (`subject_id`),
  ADD KEY `fk_cf_class` (`class_id`),
  ADD KEY `fk_cf_approved_by` (`approved_by`);

--
-- Indexes for table `course_file_notifications`
--
ALTER TABLE `course_file_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recipient_read` (`recipient_id`,`is_read`),
  ADD KEY `idx_course_file_id` (`course_file_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `course_lesson_plans`
--
ALTER TABLE `course_lesson_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_plan_topic` (`faculty_id`,`subject_id`,`class_id`,`academic_year`,`semester`,`sno`),
  ADD KEY `idx_clp_faculty` (`faculty_id`),
  ADD KEY `idx_clp_subject` (`subject_id`),
  ADD KEY `idx_clp_class` (`class_id`),
  ADD KEY `idx_clp_unit` (`unit_number`),
  ADD KEY `idx_clp_completed` (`is_completed`),
  ADD KEY `idx_pending` (`faculty_id`,`is_completed`),
  ADD KEY `idx_approval_status` (`approval_status`),
  ADD KEY `idx_batch_id` (`upload_batch_id`),
  ADD KEY `idx_batch_submission` (`batch_submission_date`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `faculty_events`
--
ALTER TABLE `faculty_events`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `idx_faculty_id` (`faculty_id`),
  ADD KEY `idx_event_date` (`event_date`);

--
-- Indexes for table `faculty_experience`
--
ALTER TABLE `faculty_experience`
  ADD PRIMARY KEY (`exp_id`),
  ADD KEY `idx_faculty_id` (`faculty_id`);

--
-- Indexes for table `faculty_industry_experience`
--
ALTER TABLE `faculty_industry_experience`
  ADD PRIMARY KEY (`exp_id`),
  ADD KEY `idx_faculty_id` (`faculty_id`);

--
-- Indexes for table `faculty_leave_schedules`
--
ALTER TABLE `faculty_leave_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_faculty` (`faculty_id`),
  ADD KEY `idx_date_range` (`from_date`,`to_date`),
  ADD KEY `leave_id` (`leave_id`);

--
-- Indexes for table `faculty_phd`
--
ALTER TABLE `faculty_phd`
  ADD PRIMARY KEY (`phd_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `faculty_profiles`
--
ALTER TABLE `faculty_profiles`
  ADD PRIMARY KEY (`faculty_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_department` (`department_id`);

--
-- Indexes for table `faculty_research`
--
ALTER TABLE `faculty_research`
  ADD PRIMARY KEY (`research_id`),
  ADD UNIQUE KEY `uq_orcid` (`ORCID_ID`),
  ADD KEY `idx_faculty_id` (`faculty_id`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `faculty_subjects_handled`
--
ALTER TABLE `faculty_subjects_handled`
  ADD PRIMARY KEY (`faculty_id`);

--
-- Indexes for table `faculty_subject_assignments`
--
ALTER TABLE `faculty_subject_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_faculty_subject_class` (`faculty_id`,`subject_id`,`class_id`,`academic_year`),
  ADD KEY `idx_fsa_subject` (`subject_id`),
  ADD KEY `idx_fsa_class` (`class_id`),
  ADD KEY `idx_fsa_academic_year` (`academic_year`),
  ADD KEY `idx_fsa_status` (`status`);

--
-- Indexes for table `faculty_substitutes`
--
ALTER TABLE `faculty_substitutes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `substitute_faculty_id` (`substitute_faculty_id`),
  ADD KEY `requested_by` (`requested_by`),
  ADD KEY `leave_id` (`leave_id`);

--
-- Indexes for table `faculy_edu_qualification`
--
ALTER TABLE `faculy_edu_qualification`
  ADD PRIMARY KEY (`membership_id`),
  ADD KEY `idx_faculty_id` (`faculty_id`);

--
-- Indexes for table `leaves`
--
ALTER TABLE `leaves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `applicantId` (`applicantId`),
  ADD KEY `departmentId` (`departmentId`),
  ADD KEY `reassign_faculty_id` (`reassign_faculty_id`),
  ADD KEY `substitute_faculty_id` (`substitute_faculty_id`),
  ADD KEY `timetable_incharge_id` (`timetable_incharge_id`),
  ADD KEY `executive_admin_id` (`executive_admin_id`);

--
-- Indexes for table `leave_approvals`
--
ALTER TABLE `leave_approvals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_request_level` (`leave_request_id`,`level_number`),
  ADD KEY `idx_la_request` (`leave_request_id`),
  ADD KEY `idx_la_approver` (`approver_id`),
  ADD KEY `idx_la_status` (`status`);

--
-- Indexes for table `leave_approval_levels`
--
ALTER TABLE `leave_approval_levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_type_level` (`applicant_type`,`level_number`);

--
-- Indexes for table `leave_balance_v2`
--
ALTER TABLE `leave_balance_v2`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_balance` (`applicant_type`,`applicant_id`,`leave_type_id`,`academic_year`),
  ADD KEY `idx_lb_applicant` (`applicant_type`,`applicant_id`),
  ADD KEY `idx_lb_type` (`leave_type_id`);

--
-- Indexes for table `leave_notifications_v2`
--
ALTER TABLE `leave_notifications_v2`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ln_recipient` (`recipient_id`,`recipient_type`),
  ADD KEY `idx_ln_request` (`leave_request_id`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lr_applicant` (`applicant_type`,`applicant_id`),
  ADD KEY `idx_lr_dept` (`department_id`),
  ADD KEY `idx_lr_class` (`class_id`),
  ADD KEY `idx_lr_status` (`overall_status`),
  ADD KEY `idx_lr_dates` (`start_date`,`end_date`),
  ADD KEY `idx_lr_type` (`leave_type_id`),
  ADD KEY `idx_lr_sub_fac` (`substitute_faculty_id`);

--
-- Indexes for table `leave_types`
--
ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_code` (`code`);

--
-- Indexes for table `period_slots`
--
ALTER TABLE `period_slots`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_slot_order` (`slot_order`);

--
-- Indexes for table `period_topic_log`
--
ALTER TABLE `period_topic_log`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_ptl_date_period_class_subj` (`attendance_date`,`period_slot_id`,`class_id`,`subject_id`),
  ADD KEY `idx_ptl_faculty` (`faculty_id`),
  ADD KEY `idx_ptl_date` (`attendance_date`),
  ADD KEY `idx_ptl_lesson_plan` (`lesson_plan_id`),
  ADD KEY `idx_ptl_subject` (`subject_id`),
  ADD KEY `fk_ptl_class` (`class_id`),
  ADD KEY `fk_ptl_period` (`period_slot_id`),
  ADD KEY `fk_ptl_slot` (`master_slot_id`),
  ADD KEY `idx_date_faculty_subject` (`attendance_date`,`faculty_id`,`subject_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `staff_attendance`
--
ALTER TABLE `staff_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_staff_date` (`faculty_id`,`attendance_date`),
  ADD KEY `idx_stf_faculty` (`faculty_id`),
  ADD KEY `idx_stf_date` (`attendance_date`),
  ADD KEY `idx_stf_dept` (`department_id`),
  ADD KEY `idx_stf_status` (`day_status`),
  ADD KEY `idx_stf_leave` (`leave_request_id`);

--
-- Indexes for table `staff_attendance_entry`
--
ALTER TABLE `staff_attendance_entry`
  ADD PRIMARY KEY (`staff_attendance_id`),
  ADD UNIQUE KEY `uq_staff_date_period` (`staff_id`,`work_date`,`period_session_number`),
  ADD KEY `idx_stf_att_work_date` (`work_date`);

--
-- Indexes for table `staff_period_attendance`
--
ALTER TABLE `staff_period_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_staff_period` (`faculty_id`,`attendance_date`,`period_slot_id`,`class_id`),
  ADD KEY `idx_spa_staff_att` (`staff_att_id`),
  ADD KEY `idx_spa_faculty` (`faculty_id`),
  ADD KEY `idx_spa_class` (`class_id`),
  ADD KEY `idx_spa_subject` (`subject_id`),
  ADD KEY `idx_spa_date` (`attendance_date`),
  ADD KEY `idx_spa_period` (`period_slot_id`),
  ADD KEY `fk_spa_sub_fac` (`substitute_faculty_id`);

--
-- Indexes for table `student_attendance`
--
ALTER TABLE `student_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_date_period_subject` (`student_id`,`attendance_date`,`period_slot_id`,`subject_id`),
  ADD KEY `idx_sa_student` (`student_id`),
  ADD KEY `idx_sa_subject` (`subject_id`),
  ADD KEY `idx_sa_class` (`class_id`),
  ADD KEY `idx_sa_faculty` (`faculty_id`),
  ADD KEY `idx_sa_date` (`attendance_date`),
  ADD KEY `idx_sa_sem` (`academic_year`,`semester`),
  ADD KEY `idx_sa_status` (`status`),
  ADD KEY `idx_sa_date_class` (`attendance_date`,`class_id`,`period_slot_id`),
  ADD KEY `idx_sa_period` (`period_slot_id`),
  ADD KEY `idx_sa_slot` (`master_slot_id`),
  ADD KEY `idx_student_attendance_lesson_plan` (`lesson_plan_id`);

--
-- Indexes for table `student_bio`
--
ALTER TABLE `student_bio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_studentId` (`studentId`);

--
-- Indexes for table `student_certifications`
--
ALTER TABLE `student_certifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`studentId`),
  ADD KEY `fk_cert_approver` (`approvedById`);

--
-- Indexes for table `student_events`
--
ALTER TABLE `student_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`studentId`),
  ADD KEY `fk_event_approver` (`approvedById`);

--
-- Indexes for table `student_internal_marks`
--
ALTER TABLE `student_internal_marks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_subject_sem_year_int` (`studentId`,`subjectId`,`semester`,`academicYear`,`internalNumber`),
  ADD KEY `idx_subject_semester` (`subjectId`,`semester`);

--
-- Indexes for table `student_leaves`
--
ALTER TABLE `student_leaves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`studentId`),
  ADD KEY `fk_leave_approver` (`approvedById`);

--
-- Indexes for table `student_marks`
--
ALTER TABLE `student_marks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_subject_sem_year` (`studentId`,`subjectId`,`semester`,`academicYear`),
  ADD KEY `idx_subject_semester` (`subjectId`,`semester`);

--
-- Indexes for table `student_notifications`
--
ALTER TABLE `student_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`studentId`),
  ADD KEY `idx_student_read` (`studentId`,`isRead`);

--
-- Indexes for table `student_profile`
--
ALTER TABLE `student_profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_studentId` (`studentId`),
  ADD UNIQUE KEY `uq_email` (`email`),
  ADD UNIQUE KEY `emisNo` (`emisNo`),
  ADD KEY `fk_student_user` (`userId`),
  ADD KEY `fk_student_department` (`departmentId`),
  ADD KEY `idx_student_class` (`classId`),
  ADD KEY `idx_student_batch_sem` (`batch`,`semester`);

--
-- Indexes for table `student_projects`
--
ALTER TABLE `student_projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`studentId`),
  ADD KEY `fk_proj_approver` (`approvedById`);

--
-- Indexes for table `student_sports`
--
ALTER TABLE `student_sports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`studentId`),
  ADD KEY `fk_sport_approver` (`approvedById`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subject_code` (`subject_code`),
  ADD KEY `idx_subject_dept` (`department_id`),
  ADD KEY `idx_subject_semester` (`semester`),
  ADD KEY `idx_subject_class` (`class_id`),
  ADD KEY `idx_subject_status` (`status`);

--
-- Indexes for table `subject_class_mappings`
--
ALTER TABLE `subject_class_mappings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_subject_class_semester` (`subject_id`,`class_id`,`semester`,`academic_year`),
  ADD KEY `idx_scm_class` (`class_id`),
  ADD KEY `idx_scm_semester` (`semester`),
  ADD KEY `idx_scm_dept` (`department_id`),
  ADD KEY `idx_scm_subject` (`subject_id`);

--
-- Indexes for table `timetable_master`
--
ALTER TABLE `timetable_master`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_active_class_sem` (`class_id`,`academic_year`,`semester`,`status`),
  ADD KEY `idx_ttm_class` (`class_id`),
  ADD KEY `idx_ttm_dept` (`department_id`),
  ADD KEY `idx_ttm_status` (`status`),
  ADD KEY `idx_ttm_ci` (`class_coordinator_id`),
  ADD KEY `idx_ttm_hod` (`hod_id`),
  ADD KEY `fk_ttm_asst` (`asst_coordinator_id`);

--
-- Indexes for table `timetable_master_slots`
--
ALTER TABLE `timetable_master_slots`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_slot_day_period` (`master_id`,`day`,`period_slot_id`,`lab_group`),
  ADD KEY `idx_tms_master` (`master_id`),
  ADD KEY `idx_tms_faculty` (`faculty_id`),
  ADD KEY `idx_tms_subject` (`subject_id`),
  ADD KEY `idx_tms_period` (`period_slot_id`);

--
-- Indexes for table `timetable_notifications`
--
ALTER TABLE `timetable_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `slot_assignment_id` (`slot_assignment_id`);

--
-- Indexes for table `timetable_overlay`
--
ALTER TABLE `timetable_overlay`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_overlay` (`master_id`,`overlay_date`,`period_slot_id`),
  ADD KEY `idx_ov_date` (`overlay_date`),
  ADD KEY `idx_ov_master` (`master_id`),
  ADD KEY `idx_ov_orig_fac` (`original_faculty_id`),
  ADD KEY `idx_ov_sub_fac` (`substitute_faculty_id`),
  ADD KEY `idx_ov_leave` (`leave_request_id`),
  ADD KEY `fk_ov_period` (`period_slot_id`);

--
-- Indexes for table `timetable_slots`
--
ALTER TABLE `timetable_slots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timetable_id` (`timetable_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `timetable_slot_assignments`
--
ALTER TABLE `timetable_slot_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timetable_id` (`timetable_id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`),
  ADD UNIQUE KEY `email_41` (`email`),
  ADD UNIQUE KEY `email_42` (`email`),
  ADD UNIQUE KEY `email_43` (`email`),
  ADD UNIQUE KEY `email_44` (`email`),
  ADD UNIQUE KEY `email_45` (`email`),
  ADD UNIQUE KEY `email_46` (`email`),
  ADD UNIQUE KEY `email_47` (`email`),
  ADD UNIQUE KEY `email_48` (`email`),
  ADD UNIQUE KEY `email_49` (`email`),
  ADD UNIQUE KEY `email_50` (`email`),
  ADD UNIQUE KEY `email_51` (`email`),
  ADD UNIQUE KEY `email_52` (`email`),
  ADD UNIQUE KEY `email_53` (`email`),
  ADD UNIQUE KEY `email_54` (`email`),
  ADD UNIQUE KEY `email_55` (`email`),
  ADD UNIQUE KEY `email_56` (`email`),
  ADD UNIQUE KEY `email_57` (`email`),
  ADD UNIQUE KEY `email_58` (`email`),
  ADD UNIQUE KEY `email_59` (`email`),
  ADD UNIQUE KEY `email_60` (`email`),
  ADD UNIQUE KEY `email_61` (`email`),
  ADD UNIQUE KEY `email_62` (`email`),
  ADD KEY `fk_users_role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `class_incharges`
--
ALTER TABLE `class_incharges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `course_files`
--
ALTER TABLE `course_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_file_notifications`
--
ALTER TABLE `course_file_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_lesson_plans`
--
ALTER TABLE `course_lesson_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=303;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `faculty_events`
--
ALTER TABLE `faculty_events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `faculty_experience`
--
ALTER TABLE `faculty_experience`
  MODIFY `exp_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `faculty_industry_experience`
--
ALTER TABLE `faculty_industry_experience`
  MODIFY `exp_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `faculty_leave_schedules`
--
ALTER TABLE `faculty_leave_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_phd`
--
ALTER TABLE `faculty_phd`
  MODIFY `phd_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `faculty_profiles`
--
ALTER TABLE `faculty_profiles`
  MODIFY `faculty_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=514;

--
-- AUTO_INCREMENT for table `faculty_research`
--
ALTER TABLE `faculty_research`
  MODIFY `research_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `faculty_subject_assignments`
--
ALTER TABLE `faculty_subject_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `faculty_substitutes`
--
ALTER TABLE `faculty_substitutes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculy_edu_qualification`
--
ALTER TABLE `faculy_edu_qualification`
  MODIFY `membership_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `leaves`
--
ALTER TABLE `leaves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_approvals`
--
ALTER TABLE `leave_approvals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_approval_levels`
--
ALTER TABLE `leave_approval_levels`
  MODIFY `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `leave_balance_v2`
--
ALTER TABLE `leave_balance_v2`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_notifications_v2`
--
ALTER TABLE `leave_notifications_v2`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `period_slots`
--
ALTER TABLE `period_slots`
  MODIFY `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `period_topic_log`
--
ALTER TABLE `period_topic_log`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `staff_attendance`
--
ALTER TABLE `staff_attendance`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_attendance_entry`
--
ALTER TABLE `staff_attendance_entry`
  MODIFY `staff_attendance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_period_attendance`
--
ALTER TABLE `staff_period_attendance`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_attendance`
--
ALTER TABLE `student_attendance`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `student_bio`
--
ALTER TABLE `student_bio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `student_certifications`
--
ALTER TABLE `student_certifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `student_events`
--
ALTER TABLE `student_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_internal_marks`
--
ALTER TABLE `student_internal_marks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_leaves`
--
ALTER TABLE `student_leaves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `student_marks`
--
ALTER TABLE `student_marks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_notifications`
--
ALTER TABLE `student_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `student_profile`
--
ALTER TABLE `student_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4160;

--
-- AUTO_INCREMENT for table `student_projects`
--
ALTER TABLE `student_projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_sports`
--
ALTER TABLE `student_sports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- AUTO_INCREMENT for table `subject_class_mappings`
--
ALTER TABLE `subject_class_mappings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `timetable_master`
--
ALTER TABLE `timetable_master`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `timetable_master_slots`
--
ALTER TABLE `timetable_master_slots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=389;

--
-- AUTO_INCREMENT for table `timetable_notifications`
--
ALTER TABLE `timetable_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable_overlay`
--
ALTER TABLE `timetable_overlay`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable_slots`
--
ALTER TABLE `timetable_slots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `timetable_slot_assignments`
--
ALTER TABLE `timetable_slot_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `fk_cls_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `class_incharges`
--
ALTER TABLE `class_incharges`
  ADD CONSTRAINT `class_incharges_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `class_incharges_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `course_files`
--
ALTER TABLE `course_files`
  ADD CONSTRAINT `fk_cf_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cf_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cf_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cf_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cf_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_file_notifications`
--
ALTER TABLE `course_file_notifications`
  ADD CONSTRAINT `fk_cfn_course_file` FOREIGN KEY (`course_file_id`) REFERENCES `course_files` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cfn_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE;

--
-- Constraints for table `course_lesson_plans`
--
ALTER TABLE `course_lesson_plans`
  ADD CONSTRAINT `fk_clp_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_clp_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_clp_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_events`
--
ALTER TABLE `faculty_events`
  ADD CONSTRAINT `faculty_events_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_experience`
--
ALTER TABLE `faculty_experience`
  ADD CONSTRAINT `faculty_experience_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `faculty_industry_experience`
--
ALTER TABLE `faculty_industry_experience`
  ADD CONSTRAINT `fk_industry_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_leave_schedules`
--
ALTER TABLE `faculty_leave_schedules`
  ADD CONSTRAINT `fk_fls_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fls_leave` FOREIGN KEY (`leave_id`) REFERENCES `leave_requests` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `faculty_phd`
--
ALTER TABLE `faculty_phd`
  ADD CONSTRAINT `faculty_phd_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_profiles`
--
ALTER TABLE `faculty_profiles`
  ADD CONSTRAINT `fk_fp_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `faculty_research`
--
ALTER TABLE `faculty_research`
  ADD CONSTRAINT `faculty_research_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_subject_assignments`
--
ALTER TABLE `faculty_subject_assignments`
  ADD CONSTRAINT `fk_fsa_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_fsa_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fsa_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_substitutes`
--
ALTER TABLE `faculty_substitutes`
  ADD CONSTRAINT `fk_fsub_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fsub_leave` FOREIGN KEY (`leave_id`) REFERENCES `leave_requests` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_fsub_requested_by` FOREIGN KEY (`requested_by`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fsub_substitute` FOREIGN KEY (`substitute_faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE;

--
-- Constraints for table `faculy_edu_qualification`
--
ALTER TABLE `faculy_edu_qualification`
  ADD CONSTRAINT `faculy_edu_qualification_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE;

--
-- Constraints for table `leaves`
--
ALTER TABLE `leaves`
  ADD CONSTRAINT `leaves_ibfk_1` FOREIGN KEY (`applicantId`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `leaves_ibfk_2` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `leaves_ibfk_3` FOREIGN KEY (`reassign_faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `leaves_ibfk_4` FOREIGN KEY (`substitute_faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `leaves_ibfk_5` FOREIGN KEY (`timetable_incharge_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `leaves_ibfk_6` FOREIGN KEY (`executive_admin_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `leave_approvals`
--
ALTER TABLE `leave_approvals`
  ADD CONSTRAINT `fk_la_request` FOREIGN KEY (`leave_request_id`) REFERENCES `leave_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `leave_balance_v2`
--
ALTER TABLE `leave_balance_v2`
  ADD CONSTRAINT `fk_lb_type` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`);

--
-- Constraints for table `leave_notifications_v2`
--
ALTER TABLE `leave_notifications_v2`
  ADD CONSTRAINT `fk_ln_request` FOREIGN KEY (`leave_request_id`) REFERENCES `leave_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `fk_lr_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_lr_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `fk_lr_sub_fac` FOREIGN KEY (`substitute_faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_lr_type` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`);

--
-- Constraints for table `period_topic_log`
--
ALTER TABLE `period_topic_log`
  ADD CONSTRAINT `fk_ptl_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  ADD CONSTRAINT `fk_ptl_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ptl_lesson_plan` FOREIGN KEY (`lesson_plan_id`) REFERENCES `course_lesson_plans` (`id`),
  ADD CONSTRAINT `fk_ptl_period` FOREIGN KEY (`period_slot_id`) REFERENCES `period_slots` (`id`),
  ADD CONSTRAINT `fk_ptl_slot` FOREIGN KEY (`master_slot_id`) REFERENCES `timetable_master_slots` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ptl_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`);

--
-- Constraints for table `staff_attendance`
--
ALTER TABLE `staff_attendance`
  ADD CONSTRAINT `fk_stf_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `fk_stf_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stf_leave` FOREIGN KEY (`leave_request_id`) REFERENCES `leave_requests` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `staff_period_attendance`
--
ALTER TABLE `staff_period_attendance`
  ADD CONSTRAINT `fk_spa_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  ADD CONSTRAINT `fk_spa_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_spa_period` FOREIGN KEY (`period_slot_id`) REFERENCES `period_slots` (`id`),
  ADD CONSTRAINT `fk_spa_staff_att` FOREIGN KEY (`staff_att_id`) REFERENCES `staff_attendance` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_spa_sub_fac` FOREIGN KEY (`substitute_faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_spa_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`);

--
-- Constraints for table `student_attendance`
--
ALTER TABLE `student_attendance`
  ADD CONSTRAINT `fk_sa_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  ADD CONSTRAINT `fk_sa_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`),
  ADD CONSTRAINT `fk_sa_period` FOREIGN KEY (`period_slot_id`) REFERENCES `period_slots` (`id`),
  ADD CONSTRAINT `fk_sa_slot` FOREIGN KEY (`master_slot_id`) REFERENCES `timetable_master_slots` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sa_student` FOREIGN KEY (`student_id`) REFERENCES `student_profile` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sa_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  ADD CONSTRAINT `fk_student_attendance_lesson_plan` FOREIGN KEY (`lesson_plan_id`) REFERENCES `course_lesson_plans` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_bio`
--
ALTER TABLE `student_bio`
  ADD CONSTRAINT `fk_bio_student` FOREIGN KEY (`studentId`) REFERENCES `student_profile` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_certifications`
--
ALTER TABLE `student_certifications`
  ADD CONSTRAINT `fk_cert_approver` FOREIGN KEY (`approvedById`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cert_student` FOREIGN KEY (`studentId`) REFERENCES `student_profile` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_events`
--
ALTER TABLE `student_events`
  ADD CONSTRAINT `fk_event_approver` FOREIGN KEY (`approvedById`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_event_student` FOREIGN KEY (`studentId`) REFERENCES `student_profile` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_internal_marks`
--
ALTER TABLE `student_internal_marks`
  ADD CONSTRAINT `fk_intmarks_student` FOREIGN KEY (`studentId`) REFERENCES `student_profile` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_intmarks_subject` FOREIGN KEY (`subjectId`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_leaves`
--
ALTER TABLE `student_leaves`
  ADD CONSTRAINT `fk_sleave_approver` FOREIGN KEY (`approvedById`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sleave_student` FOREIGN KEY (`studentId`) REFERENCES `student_profile` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_marks`
--
ALTER TABLE `student_marks`
  ADD CONSTRAINT `fk_marks_student` FOREIGN KEY (`studentId`) REFERENCES `student_profile` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_marks_subject` FOREIGN KEY (`subjectId`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_notifications`
--
ALTER TABLE `student_notifications`
  ADD CONSTRAINT `fk_notif_student` FOREIGN KEY (`studentId`) REFERENCES `student_profile` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_profile`
--
ALTER TABLE `student_profile`
  ADD CONSTRAINT `fk_student_class` FOREIGN KEY (`classId`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_student_dept` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_student_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_projects`
--
ALTER TABLE `student_projects`
  ADD CONSTRAINT `fk_proj_approver` FOREIGN KEY (`approvedById`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_proj_student` FOREIGN KEY (`studentId`) REFERENCES `student_profile` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_sports`
--
ALTER TABLE `student_sports`
  ADD CONSTRAINT `fk_sport_approver` FOREIGN KEY (`approvedById`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sport_student` FOREIGN KEY (`studentId`) REFERENCES `student_profile` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `fk_subj_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_subj_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

--
-- Constraints for table `subject_class_mappings`
--
ALTER TABLE `subject_class_mappings`
  ADD CONSTRAINT `fk_scm_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_scm_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `fk_scm_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `timetable_master`
--
ALTER TABLE `timetable_master`
  ADD CONSTRAINT `fk_ttm_asst` FOREIGN KEY (`asst_coordinator_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ttm_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ttm_coord` FOREIGN KEY (`class_coordinator_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ttm_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ttm_hod` FOREIGN KEY (`hod_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL;

--
-- Constraints for table `timetable_master_slots`
--
ALTER TABLE `timetable_master_slots`
  ADD CONSTRAINT `fk_tms_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tms_master` FOREIGN KEY (`master_id`) REFERENCES `timetable_master` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tms_period` FOREIGN KEY (`period_slot_id`) REFERENCES `period_slots` (`id`),
  ADD CONSTRAINT `fk_tms_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `timetable_notifications`
--
ALTER TABLE `timetable_notifications`
  ADD CONSTRAINT `fk_notifications_assignment` FOREIGN KEY (`slot_assignment_id`) REFERENCES `timetable_slot_assignments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `timetable_overlay`
--
ALTER TABLE `timetable_overlay`
  ADD CONSTRAINT `fk_ov_leave` FOREIGN KEY (`leave_request_id`) REFERENCES `leave_requests` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ov_master` FOREIGN KEY (`master_id`) REFERENCES `timetable_master` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ov_orig` FOREIGN KEY (`original_faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ov_period` FOREIGN KEY (`period_slot_id`) REFERENCES `period_slots` (`id`),
  ADD CONSTRAINT `fk_ov_sub` FOREIGN KEY (`substitute_faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
