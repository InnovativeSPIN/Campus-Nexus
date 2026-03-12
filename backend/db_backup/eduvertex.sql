-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 11, 2026 at 06:20 AM
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
(5, 'Welcome to eduvertex', 'The Eduvertex is a real time ERP Enterpersise Resource Planning ', 'general', 'low', '[\"all\"]', NULL, '[]', 1, 109, 'super-admin', NULL, '2026-02-25 16:30:00', '2026-02-25 16:30:00'),
(6, 'welocme ', 'welcome', 'general', 'low', '[\"faculty\",\"student\",\"department-admin\"]', NULL, '[]', 1, 109, 'super-admin', NULL, '2026-02-28 07:15:59', '2026-02-28 07:15:59');

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
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `room`, `department_id`, `capacity`, `status`) VALUES
(1, 'CSE A', '101', 1, 60, 'active'),
(2, 'CSE B', '102', 1, 60, 'active'),
(3, 'ECE A', '201', 2, 60, 'active'),
(4, 'ECE B', '202', 2, 60, 'active'),
(5, 'MECH A', '301', 3, 60, 'active'),
(6, 'MECH B', '302', 3, 60, 'active'),
(7, 'CIVIL A', '401', 4, 60, 'active'),
(8, 'CIVIL B', '402', 4, 60, 'active'),
(9, 'EEE A', '501', 5, 60, 'active'),
(10, 'EEE B', '502', 5, 60, 'active'),
(11, 'CSE A', '101', 1, 60, 'active'),
(12, 'CSE B', '102', 1, 60, 'active'),
(13, 'ECE A', '201', 2, 60, 'active'),
(14, 'ECE B', '202', 2, 60, 'active'),
(15, 'MECH A', '301', 3, 60, 'active'),
(16, 'MECH B', '302', 3, 60, 'active'),
(17, 'CIVIL A', '401', 4, 60, 'active'),
(18, 'CIVIL B', '402', 4, 60, 'active'),
(19, 'EEE A', '501', 5, 60, 'active'),
(20, 'EEE B', '502', 5, 60, 'active'),
(21, 'III Year AIDS', '7', 6, 60, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `class_incharges`
--

CREATE TABLE `class_incharges` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `assigned_by` int(11) DEFAULT NULL COMMENT 'Department admin who assigned',
  `assigned_at` datetime DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class_incharges`
--

INSERT INTO `class_incharges` (`id`, `class_id`, `faculty_id`, `academic_year`, `assigned_by`, `assigned_at`, `status`, `created_at`, `updated_at`) VALUES
(10, 21, 406, '2023-2027', NULL, '2026-03-05 18:30:05', 'active', '2026-03-05 18:30:05', '2026-03-05 18:30:05');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `short_name` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `short_name`, `full_name`) VALUES
(1, 'CSE', 'B.E. Computer Science & Engineering'),
(2, 'CIVIL', 'B.E. Civil Engineering'),
(3, 'ECE', 'B.E. Electronics & Communication Engineering'),
(4, 'eee', 'B.E. Electrical and Electronics Engineering'),
(5, 'mech', 'B.E. Mechanical Engineering'),
(6, 'AI&DS', 'B.Tech. Artificial Intelligence & Data Science'),
(7, 'IT', 'B.Tech. Information Technology'),
(8, 'se', 'Structural Engineering'),
(9, 'mfe', 'Manufacturing Engineering'),
(10, 's-and-h', 'Science and Humanities'),
(11, 'TPO', 'Placement');

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

--
-- Dumping data for table `faculty_events`
--

INSERT INTO `faculty_events` (`event_id`, `faculty_id`, `category`, `organizer_type`, `event_name`, `organizer`, `event_date`, `document_url`, `created_at`, `updated_at`, `url`) VALUES
(15, 101, 'Resource Person', 'participated', 'lkjfd', 'Dr.MATHALAI RAJ. J', '2026-03-03', '/uploads/department-admins/dr_mathalai_raj__j/events/event_dr_mathalai_raj__j_1772555884453_952848937.pdf', '2026-03-03 16:38:04', '2026-03-03 16:38:04', 'asdfghjkl;');

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

--
-- Dumping data for table `faculty_experience`
--

INSERT INTO `faculty_experience` (`exp_id`, `faculty_id`, `designation`, `institution_name`, `university`, `department`, `from_date`, `to_date`, `period`, `is_current`) VALUES
(2, 406, 'Assistant Professor', 'Nadar Saraswathi College of Engineering and Technology', 'akka university', 'Electronics & Communication Engineering', '2026-02-24', '2026-02-24', '4M', 0),
(5, 101, 'Assistant Professor', 'Nadar Saraswathi College of Engineering and Technology', 'Anna University', 'Computer Science Engineering', '2020-01-01', '2023-12-31', '3 years', 0),
(7, 101, 'Assistant Professor', 'Nadar Saraswathi College of Engineering and Technology', 'Anna University', 'Computer Science Engineering', '2020-01-01', '2023-12-31', '3 years', 0);

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

--
-- Dumping data for table `faculty_industry_experience`
--

INSERT INTO `faculty_industry_experience` (`exp_id`, `faculty_id`, `job_title`, `company`, `location`, `from_date`, `to_date`, `period`, `is_current`, `status`) VALUES
(3, 406, 'Data Analyst', 'Ematix private Limited', 'Theni', '2026-02-24', '2026-03-14', '2m', 0, 'active'),
(5, 101, 'Project Manager', 'dsfgfhg', 'dfgf', '0000-00-00', '0000-00-00', '', 0, 'active');

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
  `is_timetable_incharge` tinyint(1) NOT NULL DEFAULT 0,
  `is_placement_coordinator` tinyint(1) NOT NULL DEFAULT 0,
  `is_class_incharge` tinyint(1) NOT NULL DEFAULT 0,
  `class_incharge_class_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty_profiles`
--

INSERT INTO `faculty_profiles` (`faculty_id`, `faculty_college_code`, `AICTE_ID`, `Anna_University_ID`, `Name`, `email`, `phone_number`, `password`, `role_id`, `department_id`, `designation`, `educational_qualification`, `phd_status`, `gender`, `date_of_birth`, `date_of_joining`, `profile_image_url`, `status`, `blood_group`, `aadhar_number`, `pan_number`, `perm_address`, `curr_address`, `created_at`, `updated_at`, `linkedin_url`, `is_timetable_incharge`, `is_placement_coordinator`, `is_class_incharge`, `class_incharge_class_id`) VALUES
(101, 'CS12', NULL, NULL, 'Dr.MATHALAI RAJ. J', 'drmathalai.raj@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 7, 1, 'HEAD OF THE DEPARTMENT', NULL, '', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-28 11:07:03', NULL, 0, 0, 0, NULL),
(111, 'SH1', NULL, NULL, 'DR.B.MALLAIYASAMY', 'drbmallaiyasamy.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(121, 'SH10', NULL, NULL, 'DR.DAVID MATHAN.N', 'drdavid.mathann@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(124, 'ME11', NULL, NULL, 'VEMBATHURAJESH.A', 'vembathurajesha.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(131, 'AA2', NULL, NULL, 'Dr.C.MATHALAI SUNDARAM', 'drcmathalai.sundaram@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(132, 'ME12', NULL, NULL, 'SANTHASEELAN.R', 'santhaseelanr.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(133, 'ME14', NULL, NULL, 'SIVAGANESAN.V', 'sivaganesanv.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(134, 'ME16', NULL, NULL, 'NAGARAJA.R', 'nagarajar.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(135, 'ME18', NULL, NULL, 'NAGARAJAN.B', 'nagarajanb.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(137, 'CS4', NULL, NULL, 'UDHAYA KUMAR.R', 'udhaya.kumarr@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, 'Assistant Professor', NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-21 14:52:40', NULL, 0, 0, 0, NULL),
(149, 'CS10', NULL, NULL, 'VIGNESH.L.S', 'vigneshls.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 7, 6, 'HEAD OF THE DEPARTMENT', NULL, 'No', NULL, NULL, NULL, '/uploads/faculty/vignesh_l_s.png', 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-03-05 09:26:05', NULL, 0, 0, 0, NULL),
(166, 'EC4', NULL, NULL, 'IDHAYACHANDRAN M', 'idhayachandran.m@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(167, 'EC10', NULL, NULL, 'DR. N MATHAVAN', 'dr2.n@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(168, 'EC11', NULL, NULL, 'TAMIL SELVI T', 'tamil.selvi@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(169, 'EC13', NULL, NULL, 'PRATHAP S', 'prathap.s@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(170, 'EC14', NULL, NULL, 'BHARATHI KANNAN K', 'bharathi.kannan@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(345, 'NS1105T18', NULL, NULL, 'NAGARATHINAM.N', 'ns1105t18@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(346, 'NS10T18', NULL, NULL, 'GAYATHRI S', 'ns10t18@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(347, 'NS303NT06', NULL, NULL, 'SHANMUGAPRIYAN.R', 'ns303nt06@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(348, 'NS10T21', NULL, NULL, 'SINDHU M', 'ns10t21@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(349, 'NS10T27', NULL, NULL, 'DR.E.ANANTHA KRISHNAN', 'ns10t27@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(350, 'NS10T29', NULL, NULL, 'SOWMIYA B', 'ns10t29@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(351, 'NS10T30', NULL, NULL, 'KANIMOZHI M', 'ns10t30@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-21 18:35:32', NULL, 0, 0, 0, NULL),
(352, 'NS10T31', NULL, NULL, 'BENITA MERLIN ISABELLA K', 'ns10t31@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(353, 'NS10T32', NULL, NULL, 'ARUL JEBARAJ P', 'ns10t32@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(354, 'NS10T33', NULL, NULL, 'NATHIRUN SABINASH', 'ns10t33@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(355, 'NS10T34', NULL, NULL, 'MANOJ PRABAKAR R', 'ns10t34@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(356, 'NS10T35', NULL, NULL, 'HARI PRASATH T', 'ns10t35@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(357, 'NS20T35', NULL, NULL, 'ABIRAMI KAYATHIRI S', 'ns20t35@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-03-05 08:29:26', NULL, 1, 0, 0, NULL),
(358, 'NS20T41', NULL, NULL, 'ANUSUYA V', 'ns20t41@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(360, 'NS20T25', NULL, NULL, 'VELKUMAR K', 'ns20t25@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(361, 'NS20T33', NULL, NULL, 'DEEPIGA K', 'ns20t33@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(362, 'NS20T40', NULL, NULL, 'VENKATALAKSHMI M', 'ns20t40@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(363, 'NS20T29', NULL, NULL, 'ARCHANA R', 'ns20t29@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(364, 'NS70T01', NULL, NULL, 'DR.M SATHYA', 'ns70t01@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(365, 'NS61T20', NULL, NULL, 'ARULVIZHI M', 'ns61t20@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(366, 'NS22T21', NULL, NULL, 'PREETHA J', 'ns22t21@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(367, 'NS61T16', NULL, NULL, 'Dr.C.CHITHRA', 'ns61t16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(368, 'NS61T09', NULL, NULL, 'KARUNYAH R', 'ns61t09@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(369, 'SH1', NULL, NULL, 'DR.B.MALLAIYASAMY', 'sh1@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(370, 'NS61T23', NULL, NULL, 'MUFEENA S', 'ns61t23@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(371, 'NS6606T17', NULL, NULL, 'SUBATHAMANI T', 'ns6606t17@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(372, 'NS6606T18', NULL, NULL, 'DR. MALARVIZHI P', 'ns6606t18@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(373, 'NS6606T19', NULL, NULL, 'DR. VALARMATHI R', 'ns6606t19@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(374, 'NS60T07', NULL, NULL, 'RICHARD BRITTO.R.C', 'ns60t07@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(375, 'NS7706T06', NULL, NULL, 'DR. M VEERA KUMAR', 'ns7706t06@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(376, 'NS62T11', NULL, NULL, 'DHANDAYUTHAPANI', 'ns62t11@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(377, 'NS62T10', NULL, NULL, 'RAJAGURU K', 'ns62t10@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(378, 'NS7706T04', NULL, NULL, 'Dr.S.R.KRISHNAMOORTHI', 'ns7706t04@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(379, 'SH10', NULL, NULL, 'DR.DAVID MATHAN.N', 'sh10@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(380, 'NS63T13', NULL, NULL, 'ABINAYA B', 'ns63t13@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(381, 'NS63T16', NULL, NULL, 'DR R SARAVANANKUMAR', 'ns63t16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(382, 'ME11', NULL, NULL, 'VEMBATHURAJESH.A', 'me11@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(383, 'NS67T03', NULL, NULL, 'THISHA N', 'ns67t03@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(384, 'NS50T16', NULL, NULL, 'HARIKISHORE.S', 'ns50t16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(385, 'NS50T21', NULL, NULL, 'VENNIMALAI RAJAN A', 'ns50t21@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(386, 'NS50T22', NULL, NULL, 'ARUN KUMAR.G', 'ns50t22@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(387, 'NS50T24', NULL, NULL, 'DR.B.RADHAKRISHNAN', 'ns50t24@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(388, 'NS4407T020', NULL, NULL, 'SURULIMANI. P', 'ns4407t020@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(389, 'AA2', NULL, NULL, 'Dr.C.MATHALAI SUNDARAM', 'aa2@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(390, 'ME12', NULL, NULL, 'SANTHASEELAN.R', 'me12@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(391, 'ME14', NULL, NULL, 'SIVAGANESAN.V', 'me14@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(392, 'ME16', NULL, NULL, 'NAGARAJA.R', 'me16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(393, 'ME18', NULL, NULL, 'NAGARAJAN.B', 'me18@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(394, 'NS50T19', NULL, NULL, 'CHAKRAVARTHY SAMY DURAI J', 'ns50t19@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(395, 'CS4', NULL, NULL, 'UDHAYA KUMAR.R', 'cs4@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(396, 'NS70T07', NULL, NULL, 'JASMINE JOSE P', 'ns70t07@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(397, 'NS20T34', NULL, NULL, 'KESAVAMOORTHY N', 'ns20t34@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(398, 'NS20T14', NULL, NULL, 'ARUL JOTHI.S', 'ns20t14@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(399, 'NS70T05', NULL, NULL, 'MAHALAKSHMI S', 'ns70t05@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(400, 'NS20T39', NULL, NULL, 'BHAVANI M', 'ns20t39@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(401, 'NS70T04', NULL, NULL, 'SAI SUGANYA B', 'ns70t04@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(403, 'NS20T37', NULL, NULL, 'GEERTHIGA G', 'ns20t37@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-23 20:37:47', NULL, 0, 0, 0, NULL),
(404, 'NS20T32', NULL, NULL, 'VINOTH KUMAR J', 'ns20t32@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(405, 'NS70T02', NULL, NULL, 'KANIMOLI J', 'ns70t02@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-23 20:26:34', NULL, 0, 0, 0, NULL),
(406, 'NS80T01', NULL, NULL, 'NAGAJOTHI P', 'ns80t01@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, NULL, NULL, 'Pursuing', NULL, NULL, NULL, '/uploads/faculty/nagajothi_p.jpg', 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-03-05 18:30:05', 'https://www.linkedin.com/in/prathap/', 1, 0, 1, 21),
(408, 'NS2207T15', NULL, NULL, 'PRATHAP. C', 'ns2207t15@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-03-05 11:07:19', NULL, 0, 0, 0, NULL),
(409, 'NS30T03', NULL, NULL, 'GANESH.K', 'ns30t03@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(410, 'NS40T16', NULL, NULL, 'Dr.R.ATHILINGAM', 'ns40t16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(411, 'NS30T19', NULL, NULL, 'RAJA KARTHICK R', 'ns30t19@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(412, 'NS30T20', NULL, NULL, 'NISHETHA JEFLIN NIXON A', 'ns30t20@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(413, 'NS30T25', NULL, NULL, 'VIJAYALAKSHMI M', 'ns30t25@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(414, 'NS30T26', NULL, NULL, 'SHIVA C', 'ns30t26@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(415, 'NS30T27', NULL, NULL, 'ABIRAMI N', 'ns30t27@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(416, 'NS30T30', NULL, NULL, 'DR N PANDISELVI', 'ns30t30@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(417, 'NS30T29', NULL, NULL, 'JURIYA BANU H', 'ns30t29@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(418, 'NS40T24', NULL, NULL, 'KALAIVANI S', 'ns40t24@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(419, 'NS40T23', NULL, NULL, 'GOWTHAMI P', 'ns40t23@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(420, 'NS3306T14', NULL, NULL, 'PRADEEP KUMAR R', 'ns3306t14@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(421, 'NS40NT16', NULL, NULL, 'CHITRA R', 'ns40nt16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(422, 'NS40T19', NULL, NULL, 'SHANTHA DEVI P', 'ns40t19@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(423, 'NS40T20', NULL, NULL, 'DR. T. VENISH KUMAR', 'ns40t20@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(424, 'EC4', NULL, NULL, 'IDHAYACHANDRAN M', 'ec4@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(425, 'EC10', NULL, NULL, 'DR. N MATHAVAN', 'ec10@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(426, 'EC11', NULL, NULL, 'TAMIL SELVI T', 'ec11@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(427, 'EC13', NULL, NULL, 'PRATHAP S', 'ec13@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(428, 'EC14', NULL, NULL, 'BHARATHI KANNAN K', 'ec14@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(429, 'NS40T27', NULL, NULL, 'RAJESHSHREE S', 'ns40t27@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(430, 'NS20NT23', NULL, NULL, 'MUTHURAJ', 'ns20nt23@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0, 0, NULL),
(432, 'NS60T15', NULL, NULL, 'Dr. B. Mallaiyasamy', 'mallaiyasamy@nscet.org', NULL, '$2a$10$3E7vMD/EpOPn9bEp8IKm/ugd4ssunRZLbzi6fxKyunIYWw.V0zAAe', 5, NULL, 'Assistant Professor', NULL, 'No', 'Male', NULL, NULL, NULL, 'active', 'B+', NULL, NULL, NULL, NULL, '2026-03-05 11:00:07', '2026-03-05 11:00:07', NULL, 0, 0, 0, NULL);

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
  `author_names` text DEFAULT NULL COMMENT 'Comma-separated author names',
  `abstract` longtext DEFAULT NULL,
  `keywords` varchar(500) DEFAULT NULL,
  `issn_isbn` varchar(50) DEFAULT NULL,
  `volume_issue` varchar(100) DEFAULT NULL,
  `pages` varchar(50) DEFAULT NULL,
  `status` enum('Published','Under Review','Accepted','Rejected') DEFAULT 'Published',
  `research_type` varchar(100) DEFAULT NULL COMMENT 'e.g., Original Research, Review, etc',
  `impact_factor` decimal(5,2) DEFAULT NULL,
  `citations` int(11) DEFAULT 0,
  `indexed_in` varchar(200) DEFAULT NULL COMMENT 'e.g., SCI, SCOPUS, WoS',
  `publication_date` varchar(50) DEFAULT NULL,
  `publisher_organizer` varchar(255) DEFAULT NULL,
  `url` text DEFAULT NULL,
  `document_url` text DEFAULT NULL,
  `type` enum('International','National') DEFAULT 'International',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty_research`
--

INSERT INTO `faculty_research` (`research_id`, `ORCID_ID`, `faculty_id`, `category`, `title`, `author_names`, `abstract`, `keywords`, `issn_isbn`, `volume_issue`, `pages`, `status`, `research_type`, `impact_factor`, `citations`, `indexed_in`, `publication_date`, `publisher_organizer`, `url`, `document_url`, `type`, `created_at`, `updated_at`) VALUES
(1, NULL, 101, 'Conference', 'asdfgh', 'sdfgh', 'fghjkl', 'gfhjkhjljl', 'sdfg', 'sdfg', 'sdf', 'Accepted', 'dfghj', 21.00, 0, 'asdfgh', '2026-03-03', 'sdfg', 'fghj', '/uploads/department-admins/dr_mathalai_raj__j/research/research_dr_mathalai_raj__j_1772557331730_474970496.pdf', 'National', '2026-03-03 17:02:11', '2026-03-03 17:02:46');

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
  `allocation_date` date NOT NULL DEFAULT curdate(),
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `total_hours` int(11) DEFAULT 0 COMMENT 'Total hours for the subject',
  `no_of_periods` int(11) DEFAULT 0 COMMENT 'Number of periods per week'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `faculty_id` int(11) NOT NULL,
  `degree` varchar(100) NOT NULL,
  `branch` varchar(150) NOT NULL,
  `college` varchar(255) DEFAULT NULL,
  `university` varchar(255) NOT NULL,
  `year` varchar(50) DEFAULT NULL,
  `percentage` varchar(20) DEFAULT NULL,
  `membership_id` int(11) NOT NULL,
  `society_name` varchar(255) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculy_edu_qualification`
--

INSERT INTO `faculy_edu_qualification` (`faculty_id`, `degree`, `branch`, `college`, `university`, `year`, `percentage`, `membership_id`, `society_name`, `status`) VALUES
(406, 'B.E.', 'Computer Science Engineering', 'Nadar Saraswathi College of Engineering and Technology', 'Akka University', '2022', '60', 2, 'IEEE', 'Inactive'),
(101, 'B.E.', 'Cyber Security', 'Nadar Saraswathi College of Engineering and Technology', 'anna university', '2021', '67', 5, '', 'Active'),
(101, 'M.Tech', 'Electrical & Electronics Engineering', 'Nadar Saraswathi College of Engineering and Technology', 'anna university', '2025', '96', 20, '', 'Active'),
(101, 'Membership', 'Professional Membership', '', 'Professional Organization', NULL, NULL, 21, 'IEEE', 'Inactive'),
(406, 'M.E.', 'Information Technology', 'Nadar Saraswathi College of Engineering and Technology', 'anna university', '2026', '85', 23, '', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `labs`
--

CREATE TABLE `labs` (
  `id` int(11) NOT NULL,
  `lab_name` varchar(255) NOT NULL,
  `lab_code` varchar(50) NOT NULL,
  `department_id` int(11) NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `subject_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of subject IDs that use this lab' CHECK (json_valid(`subject_ids`)),
  `max_batch_size` int(11) DEFAULT 30,
  `equipment_details` text DEFAULT NULL,
  `software_installed` text DEFAULT NULL,
  `lab_incharge_id` int(11) DEFAULT NULL COMMENT 'Faculty ID who is in charge of this lab',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leaves`
--

CREATE TABLE `leaves` (
  `id` int(11) NOT NULL,
  `applicantId` int(11) NOT NULL COMMENT 'Faculty ID or Student ID',
  `departmentId` int(11) DEFAULT NULL COMMENT 'Department ID of the applicant',
  `leaveType` enum('Medical','Casual','Earned','On-Duty','Personal','Maternity','Comp-Off') NOT NULL DEFAULT 'Casual',
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `totalDays` decimal(4,1) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `applicantType` enum('faculty','student') NOT NULL DEFAULT 'faculty',
  `affected_periods` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`affected_periods`)),
  `substitute_faculty_code` varchar(50) DEFAULT NULL,
  `substitute_status` enum('pending','accepted','rejected') DEFAULT NULL,
  `substitute_notified_at` datetime DEFAULT NULL,
  `substitute_response_at` datetime DEFAULT NULL,
  `substitute_remarks` text DEFAULT NULL,
  `admin_approval_status` enum('pending','approved','rejected') DEFAULT NULL,
  `admin_approval_date` datetime DEFAULT NULL,
  `timetable_altered` tinyint(1) DEFAULT 0,
  `approvedById` int(11) DEFAULT NULL COMMENT 'ID of the admin/HOD who approved',
  `approvalDate` datetime DEFAULT NULL COMMENT 'When the leave was approved/rejected',
  `approvalRemarks` text DEFAULT NULL COMMENT 'Remarks from the approver',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reassign_faculty_id` int(11) DEFAULT NULL COMMENT 'Faculty who covers during leave'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leaves`
--

INSERT INTO `leaves` (`id`, `applicantId`, `departmentId`, `leaveType`, `startDate`, `endDate`, `totalDays`, `reason`, `status`, `applicantType`, `affected_periods`, `substitute_faculty_code`, `substitute_status`, `substitute_notified_at`, `substitute_response_at`, `substitute_remarks`, `admin_approval_status`, `admin_approval_date`, `timetable_altered`, `approvedById`, `approvalDate`, `approvalRemarks`, `createdAt`, `updatedAt`, `reassign_faculty_id`) VALUES
(1, 1, 1, 'Medical', '2026-03-01 09:00:00', '2026-03-02 17:00:00', 2.0, 'Medical emergency - dental appointment', 'pending', 'faculty', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-02-28 11:12:15', '2026-02-28 11:12:15', NULL),
(2, 1, 1, 'Casual', '2026-02-15 09:00:00', '2026-02-17 17:00:00', 3.0, 'Family visit', 'pending', 'faculty', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-02-28 11:12:15', '2026-02-28 11:12:15', NULL),
(3, 2, 2, 'On-Duty', '2026-03-10 09:00:00', '2026-03-12 17:00:00', 3.0, 'Conference attendance at IIIT Delhi', 'pending', 'faculty', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, '2026-02-28 11:12:15', '2026-02-28 11:12:15', NULL),
(4, 406, 6, 'Medical', '2026-03-05 00:00:00', '2026-03-18 00:00:00', 14.0, 'adfghjk', 'approved', 'faculty', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 149, '2026-03-05 14:43:52', '', '2026-03-05 14:43:02', '2026-03-05 14:43:52', 408),
(6, 406, 6, 'Medical', '2026-03-05 00:00:00', '2026-03-13 00:00:00', 9.0, 'sdfghjk', 'rejected', 'faculty', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 149, '2026-03-05 17:50:05', 'sf', '2026-03-05 15:18:19', '2026-03-05 17:50:05', 405);

-- --------------------------------------------------------

--
-- Table structure for table `leave_balance`
--

CREATE TABLE `leave_balance` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL COMMENT 'Faculty ID or Student ID',
  `userType` enum('faculty','student') NOT NULL DEFAULT 'faculty',
  `academicYear` varchar(9) NOT NULL COMMENT 'Academic year in format YYYY',
  `Medical` longtext DEFAULT NULL COMMENT 'JSON: {balance: 10, used: 0}',
  `Casual` longtext DEFAULT NULL COMMENT 'JSON: {balance: 12, used: 0}',
  `Earned` longtext DEFAULT NULL COMMENT 'JSON: {balance: 15, used: 0}',
  `On-Duty` longtext DEFAULT NULL COMMENT 'JSON: {balance: 10, used: 0}',
  `Personal` longtext DEFAULT NULL COMMENT 'JSON: {balance: 5, used: 0}',
  `Maternity` longtext DEFAULT NULL COMMENT 'JSON: {balance: 90, used: 0}',
  `Comp-Off` longtext DEFAULT NULL COMMENT 'JSON: {balance: 0, used: 0}',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_balance`
--

INSERT INTO `leave_balance` (`id`, `userId`, `userType`, `academicYear`, `Medical`, `Casual`, `Earned`, `On-Duty`, `Personal`, `Maternity`, `Comp-Off`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'faculty', '2026', '{\"balance\":10,\"used\":0}', '{\"balance\":12,\"used\":0}', '{\"balance\":15,\"used\":0}', '{\"balance\":10,\"used\":0}', '{\"balance\":5,\"used\":0}', '{\"balance\":90,\"used\":0}', '{\"balance\":0,\"used\":0}', '2026-02-28 11:12:15', '2026-02-28 11:12:15'),
(2, 2, 'faculty', '2026', '{\"balance\":10,\"used\":0}', '{\"balance\":12,\"used\":0}', '{\"balance\":15,\"used\":0}', '{\"balance\":10,\"used\":0}', '{\"balance\":5,\"used\":0}', '{\"balance\":90,\"used\":0}', '{\"balance\":0,\"used\":0}', '2026-02-28 11:12:15', '2026-02-28 11:12:15');

-- --------------------------------------------------------

--
-- Table structure for table `leave_notifications`
--

CREATE TABLE `leave_notifications` (
  `id` int(11) NOT NULL,
  `recipientId` int(11) DEFAULT NULL,
  `recipientType` enum('faculty','department-admin','executiveadmin') NOT NULL,
  `departmentId` int(11) DEFAULT NULL,
  `senderId` int(11) DEFAULT NULL,
  `senderName` varchar(150) DEFAULT NULL,
  `leaveId` int(11) NOT NULL,
  `facultyName` varchar(150) DEFAULT NULL,
  `leaveType` varchar(50) DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `type` enum('leave_submitted','leave_approved','leave_rejected') NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_notifications`
--

INSERT INTO `leave_notifications` (`id`, `recipientId`, `recipientType`, `departmentId`, `senderId`, `senderName`, `leaveId`, `facultyName`, `leaveType`, `startDate`, `endDate`, `type`, `title`, `message`, `isRead`, `createdAt`, `updatedAt`) VALUES
(1, 149, 'department-admin', 6, 406, 'NAGAJOTHI P', 4, 'NAGAJOTHI P', 'Medical', '2026-03-05', '2026-03-18', 'leave_submitted', 'Leave Request from NAGAJOTHI P', 'NAGAJOTHI P has applied for Medical leave from 05 Mar 2026 to 18 Mar 2026', 0, '2026-03-05 14:43:02', '2026-03-05 14:43:02'),
(2, 149, 'department-admin', 6, 406, 'NAGAJOTHI P', 5, 'NAGAJOTHI P', 'Medical', '2026-03-05', '2026-03-05', 'leave_submitted', 'Leave Request from NAGAJOTHI P', 'NAGAJOTHI P has applied for Medical leave from 05 Mar 2026 to 05 Mar 2026', 0, '2026-03-05 15:10:28', '2026-03-05 15:10:28'),
(3, 149, 'department-admin', 6, 406, 'NAGAJOTHI P', 6, 'NAGAJOTHI P', 'Medical', '2026-03-05', '2026-03-13', 'leave_submitted', 'Leave Request from NAGAJOTHI P', 'NAGAJOTHI P has applied for Medical leave from 05 Mar 2026 to 13 Mar 2026', 0, '2026-03-05 15:18:19', '2026-03-05 15:18:19'),
(4, 406, 'faculty', 6, 149, 'VIGNESH.L.S', 6, 'NAGAJOTHI P', 'Medical', '2026-03-05', '2026-03-13', 'leave_rejected', 'Leave Rejected', 'Your Medical leave request has been rejected by the Department Admin. Remarks: sf', 0, '2026-03-05 17:50:05', '2026-03-05 17:50:05');

-- --------------------------------------------------------

--
-- Table structure for table `period_config`
--

CREATE TABLE `period_config` (
  `id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `period_number` int(11) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `is_break` tinyint(1) DEFAULT 0,
  `break_name` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `period_config`
--

INSERT INTO `period_config` (`id`, `department_id`, `period_number`, `start_time`, `end_time`, `duration_minutes`, `is_break`, `break_name`, `status`, `createdAt`, `updatedAt`) VALUES
(1, NULL, 1, '09:00:00', '09:50:00', 50, 0, NULL, 'active', '2026-02-25 18:00:28', '2026-02-25 18:00:28'),
(2, NULL, 2, '09:50:00', '10:40:00', 50, 0, NULL, 'active', '2026-02-25 18:00:28', '2026-02-25 18:00:28'),
(3, NULL, 3, '10:40:00', '11:10:00', 30, 1, 'Tea Break', 'active', '2026-02-25 18:00:28', '2026-02-25 18:00:28'),
(4, NULL, 4, '11:10:00', '12:00:00', 50, 0, NULL, 'active', '2026-02-25 18:00:28', '2026-02-25 18:00:28'),
(5, NULL, 5, '12:00:00', '12:50:00', 50, 0, NULL, 'active', '2026-02-25 18:00:28', '2026-02-25 18:00:28'),
(6, NULL, 6, '12:50:00', '13:30:00', 40, 1, 'Lunch Break', 'active', '2026-02-25 18:00:28', '2026-02-25 18:00:28'),
(7, NULL, 7, '13:30:00', '14:20:00', 50, 0, NULL, 'active', '2026-02-25 18:00:28', '2026-02-25 18:00:28'),
(8, NULL, 1, '09:00:00', '09:50:00', 50, 0, NULL, 'active', '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(9, NULL, 2, '09:50:00', '10:40:00', 50, 0, NULL, 'active', '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(10, NULL, 3, '10:40:00', '11:10:00', 30, 1, 'Tea Break', 'active', '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(11, NULL, 4, '11:10:00', '12:00:00', 50, 0, NULL, 'active', '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(12, NULL, 5, '12:00:00', '12:50:00', 50, 0, NULL, 'active', '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(13, NULL, 6, '12:50:00', '13:30:00', 40, 1, 'Lunch Break', 'active', '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(14, NULL, 7, '13:30:00', '14:20:00', 50, 0, NULL, 'active', '2026-02-25 18:01:10', '2026-02-25 18:01:10');

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
(4, 'academic-admin'),
(5, 'faculty'),
(6, 'student'),
(7, 'department-admin');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `room_number` varchar(50) NOT NULL,
  `room_name` varchar(255) NOT NULL,
  `department_id` int(11) NOT NULL,
  `room_type` enum('classroom','lab','seminar_hall','auditorium') NOT NULL DEFAULT 'classroom',
  `capacity` int(11) DEFAULT NULL,
  `floor_number` int(11) DEFAULT NULL,
  `building` varchar(100) DEFAULT NULL,
  `has_projector` tinyint(1) DEFAULT 0,
  `has_ac` tinyint(1) DEFAULT 0,
  `has_smart_board` tinyint(1) DEFAULT 0,
  `equipment_details` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores daily/period-wise attendance entry for each staff member';

-- --------------------------------------------------------

--
-- Table structure for table `staff_leave_approval`
--

CREATE TABLE `staff_leave_approval` (
  `staff_approval_id` int(11) NOT NULL,
  `staff_leave_id` int(11) NOT NULL,
  `approver_id` int(11) NOT NULL,
  `approval_level` enum('HOD','Principal','Admin') NOT NULL,
  `approval_action` enum('Approved','Rejected') NOT NULL,
  `approval_remarks` text DEFAULT NULL,
  `approval_timestamp` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores multi-level approval decisions for staff leave requests';

-- --------------------------------------------------------

--
-- Table structure for table `staff_leave_balance`
--

CREATE TABLE `staff_leave_balance` (
  `balance_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `leave_type` enum('Medical','Casual','Earned','On-Duty','Personal','Maternity','Comp-Off') NOT NULL,
  `total_allowed` decimal(5,1) NOT NULL DEFAULT 0.0,
  `used_leaves` decimal(5,1) NOT NULL DEFAULT 0.0,
  `remaining_leaves` decimal(5,1) GENERATED ALWAYS AS (`total_allowed` - `used_leaves`) STORED,
  `last_updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_leave_request`
--

CREATE TABLE `staff_leave_request` (
  `staff_leave_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `leave_type` enum('Medical','Casual','Earned','On-Duty','Personal','Maternity','Comp-Off') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_leave_days` decimal(4,1) NOT NULL,
  `leave_reason` text NOT NULL,
  `applied_timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `leave_status` enum('Pending','Approved','Rejected','Cancelled') NOT NULL DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_attendance_entry`
--

CREATE TABLE `student_attendance_entry` (
  `attendance_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `class_section_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `class_date` date NOT NULL,
  `period_session_number` tinyint(4) NOT NULL,
  `attendance_status` enum('Present','Absent','Late','On-Duty') NOT NULL,
  `marked_timestamp` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores period-wise attendance entry for each student';

-- --------------------------------------------------------

--
-- Table structure for table `student_bio`
--

CREATE TABLE `student_bio` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL COMMENT 'FK → students.id (1:1)',
  `alternatePhone` varchar(20) DEFAULT NULL,
  `linkedinUrl` varchar(255) DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `bloodGroup` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') DEFAULT NULL,
  `nationality` varchar(60) DEFAULT NULL,
  `religion` varchar(60) DEFAULT NULL,
  `category` varchar(30) DEFAULT NULL COMMENT 'General / OBC / SC / ST / etc.',
  `aadharNo` varchar(20) DEFAULT NULL,
  `motherTongue` varchar(60) DEFAULT NULL,
  `residenceType` enum('hosteller','day_scholar','other') DEFAULT NULL,
  `address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Current address (structured JSON)' CHECK (json_valid(`address`)),
  `permanentAddress` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permanentAddress`)),
  `parentInfo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'father, mother, guardian, siblings' CHECK (json_valid(`parentInfo`)),
  `references` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of reference/relative contacts' CHECK (json_valid(`references`)),
  `previousEducation` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`previousEducation`)),
  `scholarshipDetails` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`scholarshipDetails`)),
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Uploaded document URLs' CHECK (json_valid(`documents`)),
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_certifications`
--

CREATE TABLE `student_certifications` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL COMMENT 'FK → students.id',
  `name` varchar(200) NOT NULL COMMENT 'Certification name',
  `issuer` varchar(150) NOT NULL COMMENT 'Issuing organization',
  `issueDate` date NOT NULL,
  `expiryDate` date DEFAULT NULL COMMENT 'Null = no expiry',
  `credentialId` varchar(100) DEFAULT NULL,
  `credentialUrl` varchar(500) DEFAULT NULL,
  `skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of skill strings' CHECK (json_valid(`skills`)),
  `documentUrl` varchar(500) DEFAULT NULL COMMENT 'Uploaded certificate file URL',
  `approvalStatus` enum('pending','approved','rejected') DEFAULT 'pending',
  `approvedById` int(11) DEFAULT NULL COMMENT 'FK → users.id (faculty who approved)',
  `approvalRemarks` varchar(500) DEFAULT NULL,
  `approvalDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_events`
--

CREATE TABLE `student_events` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL COMMENT 'FK → students.id',
  `eventName` varchar(200) NOT NULL,
  `eventType` enum('cultural','technical','sports','social','workshop','seminar','other') NOT NULL DEFAULT 'other',
  `organizer` varchar(150) DEFAULT NULL COMMENT 'Organizing institution or club',
  `eventDate` date NOT NULL,
  `role` enum('participant','organizer','volunteer','speaker','judge','other') NOT NULL DEFAULT 'participant',
  `achievement` varchar(300) DEFAULT NULL COMMENT 'e.g. 1st place, Best Paper Award',
  `level` enum('college','district','state','national','international') NOT NULL DEFAULT 'college',
  `certificateUrl` varchar(500) DEFAULT NULL COMMENT 'Participation/achievement certificate URL',
  `approvalStatus` enum('pending','approved','rejected') DEFAULT 'pending',
  `approvedById` int(11) DEFAULT NULL COMMENT 'FK → users.id',
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
  `studentId` int(11) NOT NULL COMMENT 'FK → students.id',
  `subjectId` int(11) NOT NULL COMMENT 'FK → subjects.id',
  `semester` int(11) NOT NULL,
  `academicYear` varchar(9) NOT NULL COMMENT 'e.g. 2023-2024',
  `internalNumber` int(11) NOT NULL COMMENT '1 = Internal 1, 2 = Internal 2',
  `internalScore` decimal(5,2) DEFAULT 0.00 COMMENT 'Internal test score out of 60',
  `assessmentScore` decimal(5,2) DEFAULT 0.00 COMMENT 'Assessment/assignment score out of 40',
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
  `studentId` int(11) NOT NULL COMMENT 'FK → students.id',
  `leaveType` enum('Medical','Casual','On-Duty','Special','Other') NOT NULL DEFAULT 'Casual',
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `totalDays` decimal(4,1) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `approvedById` int(11) DEFAULT NULL COMMENT 'FK → users.id',
  `approvalRemarks` varchar(500) DEFAULT NULL,
  `approvalDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_marks`
--

CREATE TABLE `student_marks` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL COMMENT 'FK → students.id',
  `subjectId` int(11) NOT NULL COMMENT 'FK → subjects.id',
  `semester` int(11) NOT NULL,
  `academicYear` varchar(9) NOT NULL COMMENT 'e.g. 2023-2024',
  `internalMarks` decimal(5,2) DEFAULT 0.00 COMMENT 'Internal marks out of 60',
  `externalMarks` decimal(5,2) DEFAULT 0.00 COMMENT 'External exam marks out of 40',
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
  `studentId` int(11) NOT NULL COMMENT 'FK → students.id',
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('academic','leave','fee','general','disciplinary','attendance','result','approval','announcement') NOT NULL DEFAULT 'general',
  `priority` enum('low','medium','high','urgent') DEFAULT 'low',
  `referenceId` int(11) DEFAULT NULL COMMENT 'ID of the related DB record',
  `referenceType` varchar(50) DEFAULT NULL COMMENT 'Model name of the related record',
  `actionUrl` varchar(300) DEFAULT NULL COMMENT 'Frontend route to navigate on click',
  `isRead` tinyint(1) DEFAULT 0,
  `readAt` datetime DEFAULT NULL,
  `expiresAt` datetime DEFAULT NULL COMMENT 'Optional expiry; null = never expire',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_profile`
--

CREATE TABLE `student_profile` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL COMMENT 'FK → users.id',
  `role_id` int(11) NOT NULL,
  `studentId` varchar(30) NOT NULL,
  `rollNumber` varchar(30) NOT NULL,
  `admissionNo` varchar(30) DEFAULT NULL COMMENT 'Admission number',
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `photo` varchar(255) DEFAULT 'default-student.png',
  `gender` enum('male','female','other') NOT NULL,
  `departmentId` int(11) NOT NULL,
  `classId` int(11) DEFAULT NULL,
  `batch` varchar(20) NOT NULL,
  `semester` tinyint(2) NOT NULL,
  `year` varchar(10) DEFAULT NULL,
  `admissionDate` date DEFAULT curdate(),
  `admissionType` enum('regular','lateral','management') DEFAULT 'regular',
  `feeStatus` enum('paid','pending','partial') DEFAULT 'pending',
  `status` enum('active','inactive','graduated','dropped','suspended') DEFAULT 'active',
  `password` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_profile`
--

INSERT INTO `student_profile` (`id`, `userId`, `role_id`, `studentId`, `rollNumber`, `admissionNo`, `firstName`, `lastName`, `email`, `phone`, `photo`, `gender`, `departmentId`, `classId`, `batch`, `semester`, `year`, `admissionDate`, `admissionType`, `feeStatus`, `status`, `password`, `createdAt`, `updatedAt`) VALUES
(3331, NULL, 3, '921025243001', '921025243001', NULL, 'AATHESREE', 'R', '921025243001@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3332, NULL, 3, '921025243002', '921025243002', NULL, 'AATHIGA', 'FATHIMA A', '921025243002@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3333, NULL, 3, '921025243003', '921025243003', NULL, 'ADHILA', 'FATHIMA A', '921025243003@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3334, NULL, 3, '921025243004', '921025243004', NULL, 'AHAMED', 'ADHIEF KHAN M', '921025243004@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3335, NULL, 3, '921025243005', '921025243005', NULL, 'AKALYA', 'J', '921025243005@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3336, NULL, 3, '921025243006', '921025243006', NULL, 'ALAGUMEENA', 'S', '921025243006@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3337, NULL, 3, '921025243007', '921025243007', NULL, 'ASWATHA', 'J S', '921025243007@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3338, NULL, 3, '921025243008', '921025243008', NULL, 'BAGHYALAKSHMI', 'S', '921025243008@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3339, NULL, 3, '921025243009', '921025243009', NULL, 'DEEPAN', 'M', '921025243009@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3340, NULL, 3, '921025243010', '921025243010', NULL, 'DEVADHARSHAN', 'V', '921025243010@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3341, NULL, 3, '921025243011', '921025243011', NULL, 'DEVADHARSHINI', 'M', '921025243011@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3342, NULL, 3, '921025243012', '921025243012', NULL, 'DEVI', 'PRIYA T', '921025243012@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3343, NULL, 3, '921025243013', '921025243013', NULL, 'DHANUSRI', 'B', '921025243013@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3344, NULL, 3, '921025243014', '921025243014', NULL, 'DHARSHAN', 'BALA P', '921025243014@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3345, NULL, 3, '921025243015', '921025243015', NULL, 'DHARSHINI', 'SARO SHREE S U', '921025243015@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3346, NULL, 3, '921025243016', '921025243016', NULL, 'DHIVYA', 'SRI A', '921025243016@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3347, NULL, 3, '921025243017', '921025243017', NULL, 'DIVAGAR', 'M K', '921025243017@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3348, NULL, 3, '921025243018', '921025243018', NULL, 'DIVYASHREE', 'P', '921025243018@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3349, NULL, 3, '921025243019', '921025243019', NULL, 'GOKULAVANI', 'K', '921025243019@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3350, NULL, 3, '921025243020', '921025243020', NULL, 'GOPAL', 'KARTHICK S', '921025243020@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3351, NULL, 3, '921025243021', '921025243021', NULL, 'HARINI', 'M', '921025243021@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3352, NULL, 3, '921025243022', '921025243022', NULL, 'HARINI', 'SRI M', '921025243022@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3353, NULL, 3, '921025243023', '921025243023', NULL, 'HARIPRIYA', 'S', '921025243023@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3354, NULL, 3, '921025243024', '921025243024', NULL, 'HEMAN', 'M', '921025243024@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3355, NULL, 3, '921025243025', '921025243025', NULL, 'JEEVITHA', 'C', '921025243025@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3356, NULL, 3, '921025243026', '921025243026', NULL, 'JEYAVARSHAN', 'B', '921025243026@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3357, NULL, 3, '921025243027', '921025243027', NULL, 'KANISHKA', 'R', '921025243027@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3358, NULL, 3, '921025243028', '921025243028', NULL, 'KANISH', 'KUMAR K', '921025243028@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3359, NULL, 3, '921025243029', '921025243029', NULL, 'KAVITHA', 'S', '921025243029@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3360, NULL, 3, '921025243030', '921025243030', NULL, 'LAKSHANA', 'S', '921025243030@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3361, NULL, 3, '921025243031', '921025243031', NULL, 'LAKSHMI', 'DEVI S', '921025243031@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3362, NULL, 3, '921025243032', '921025243032', NULL, 'MATHUMITHA', 'G', '921025243032@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3363, NULL, 3, '921025243033', '921025243033', NULL, 'MEERA', 'S', '921025243033@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3364, NULL, 3, '921025243034', '921025243034', NULL, 'NANDHINI', 'S', '921025243034@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3365, NULL, 3, '921025243035', '921025243035', NULL, 'NARMATHA', 'R B', '921025243035@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3366, NULL, 3, '921025243036', '921025243036', NULL, 'NIVETHA', 'S', '921025243036@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3367, NULL, 3, '921025243037', '921025243037', NULL, 'PANDEESWARI', 'M', '921025243037@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3368, NULL, 3, '921025243038', '921025243038', NULL, 'POORVAJA', 'S', '921025243038@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3369, NULL, 3, '921025243039', '921025243039', NULL, 'PRAVEENA', 'M', '921025243039@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3370, NULL, 3, '921025243040', '921025243040', NULL, 'RAJA', 'RAJESHWARI S', '921025243040@nscet.org', '9876543210', 'default-student.png', 'male', 6, 0, '2025-2029', 5, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 13:24:50'),
(3371, NULL, 3, '921025243041', '921025243041', NULL, 'RAJASRI', 'M', '921025243041@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3372, NULL, 3, '921025243042', '921025243042', NULL, 'REENASRI', 'S', '921025243042@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3373, NULL, 3, '921025243043', '921025243043', NULL, 'RITHIKA', 'SRI A', '921025243043@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3374, NULL, 3, '921025243044', '921025243044', NULL, 'SAHANA', 'C', '921025243044@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3375, NULL, 3, '921025243045', '921025243045', NULL, 'SANKARA', 'NARAYAN R', '921025243045@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3376, NULL, 3, '921025243047', '921025243047', NULL, 'SHARANYA', 'M', '921025243047@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3377, NULL, 3, '921025243048', '921025243048', NULL, 'SIVA', 'DHARANI R', '921025243048@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3378, NULL, 3, '921025243049', '921025243049', NULL, 'SRINIVASH', 'T', '921025243049@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3379, NULL, 3, '921025243050', '921025243050', NULL, 'SRI', 'RAM V', '921025243050@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3380, NULL, 3, '921025243051', '921025243051', NULL, 'SUGAPRIYA', 'T', '921025243051@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3381, NULL, 3, '921025243052', '921025243052', NULL, 'SUPRIYA', 'J S', '921025243052@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3382, NULL, 3, '921025243053', '921025243053', NULL, 'VETRISELVAM', 'R', '921025243053@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3383, NULL, 3, '921025243054', '921025243054', NULL, 'VIJAYSHREE', 'S', '921025243054@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3384, NULL, 3, '921025243055', '921025243055', NULL, 'YASHIKA', 'K', '921025243055@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3385, NULL, 3, '921025243056', '921025243056', NULL, 'YAZHINI', 'P', '921025243056@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3386, NULL, 3, '921025243057', '921025243057', NULL, 'YAZHINI', 'PM', '921025243057@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3387, NULL, 3, '921025243058', '921025243058', NULL, 'YUGASRI', 'I', '921025243058@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3388, NULL, 3, '921025205001', '921025205001', NULL, 'ABARNA', 'M', '921025205001@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3389, NULL, 3, '921025205002', '921025205002', NULL, 'ABIRAMI', 'R', '921025205002@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3390, NULL, 3, '921025205003', '921025205003', NULL, 'AISHWARYA', 'LAKSHMI S', '921025205003@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3391, NULL, 3, '921025205004', '921025205004', NULL, 'AKSHAYA', 'S', '921025205004@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3392, NULL, 3, '921025205005', '921025205005', NULL, 'ARAVINDHAN', 'K', '921025205005@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3393, NULL, 3, '921025205006', '921025205006', NULL, 'ARCHANA', 'P', '921025205006@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3394, NULL, 3, '921025205007', '921025205007', NULL, 'BHUVANA', 'SRI G', '921025205007@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3395, NULL, 3, '921025205008', '921025205008', NULL, 'DEENA', 'P', '921025205008@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3396, NULL, 3, '921025205009', '921025205009', NULL, 'DHANALAKSHMI', 'R', '921025205009@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3397, NULL, 3, '921025205010', '921025205010', NULL, 'DHARSHINI', 'M', '921025205010@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3398, NULL, 3, '921025205011', '921025205011', NULL, 'DIVYASRI', 'S', '921025205011@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3399, NULL, 3, '921025205012', '921025205012', NULL, 'ELAKKIYA', 'M', '921025205012@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3400, NULL, 3, '921025205013', '921025205013', NULL, 'GOBIKA', 'SRI S', '921025205013@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3401, NULL, 3, '921025205014', '921025205014', NULL, 'GOWTHAM', 'KUMAR M', '921025205014@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3402, NULL, 3, '921025205015', '921025205015', NULL, 'GURU', 'K', '921025205015@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3403, NULL, 3, '921025205016', '921025205016', NULL, 'HARIPRIYA', 'R', '921025205016@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3404, NULL, 3, '921025205017', '921025205017', NULL, 'JANARTHANAN', 'M', '921025205017@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3405, NULL, 3, '921025205018', '921025205018', NULL, 'JEYAKRISHNAN', 'P', '921025205018@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3406, NULL, 3, '921025205019', '921025205019', NULL, 'JEYSREE', 'S', '921025205019@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3407, NULL, 3, '921025205020', '921025205020', NULL, 'KARTHIGA', 'M', '921025205020@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3408, NULL, 3, '921025205021', '921025205021', NULL, 'KIRUTHIKA', 'S', '921025205021@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3409, NULL, 3, '921025205022', '921025205022', NULL, 'LAKXMAN', 'HARI K M', '921025205022@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3410, NULL, 3, '921025205023', '921025205023', NULL, 'LOGASRI', 'K', '921025205023@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3411, NULL, 3, '921025205024', '921025205024', NULL, 'MAHALAKSHMI', 'R', '921025205024@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3412, NULL, 3, '921025205025', '921025205025', NULL, 'MAHARAJAN', 'K', '921025205025@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3413, NULL, 3, '921025205026', '921025205026', NULL, 'MAHIMA', 'GRACE G', '921025205026@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3414, NULL, 3, '921025205027', '921025205027', NULL, 'MOHAMED', 'IRFAN P', '921025205027@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3415, NULL, 3, '921025205028', '921025205028', NULL, 'MOHAMED', 'SYATH ARAFATH A', '921025205028@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3416, NULL, 3, '921025205029', '921025205029', NULL, 'MUTHU', 'VETHA VARSHINI M', '921025205029@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3417, NULL, 3, '921025205030', '921025205030', NULL, 'NAFILA', 'FATHIMA R', '921025205030@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3418, NULL, 3, '921025205031', '921025205031', NULL, 'NIROSHKUMAR', 'R', '921025205031@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3419, NULL, 3, '921025205032', '921025205032', NULL, 'NISHANTHINI', 'R', '921025205032@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3420, NULL, 3, '921025205033', '921025205033', NULL, 'PAVITHRA', 'R', '921025205033@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3421, NULL, 3, '921025205034', '921025205034', NULL, 'PRATHIBHA', 'SHIVARANJANI P', '921025205034@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3422, NULL, 3, '921025205035', '921025205035', NULL, 'PRATHISHA', 'ARASI S', '921025205035@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3423, NULL, 3, '921025205036', '921025205036', NULL, 'PRAVEENA', 'M', '921025205036@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3424, NULL, 3, '921025205037', '921025205037', NULL, 'PREETHA', 'M', '921025205037@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3425, NULL, 3, '921025205038', '921025205038', NULL, 'PRIYADHARSHINI', 'M', '921025205038@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3426, NULL, 3, '921025205039', '921025205039', NULL, 'RAJANESWARAN', 'N', '921025205039@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3427, NULL, 3, '921025205040', '921025205040', NULL, 'RAJIYA', 'PRIYA K', '921025205040@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3428, NULL, 3, '921025205041', '921025205041', NULL, 'RENUGA', 'K', '921025205041@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3429, NULL, 3, '921025205042', '921025205042', NULL, 'RINISHA', 'M', '921025205042@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3430, NULL, 3, '921025205043', '921025205043', NULL, 'ROHITH', 'BALAJ IM', '921025205043@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3431, NULL, 3, '921025205044', '921025205044', NULL, 'ROSHINI', 'M', '921025205044@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3432, NULL, 3, '921025205045', '921025205045', NULL, 'SABANA', 'BANU K', '921025205045@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3433, NULL, 3, '921025205046', '921025205046', NULL, 'SANJAY', 'KUMAR B', '921025205046@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3434, NULL, 3, '921025205047', '921025205047', NULL, 'SANTHOSH', 'P', '921025205047@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3435, NULL, 3, '921025205048', '921025205048', NULL, 'SARAVANA', 'KUMAR A', '921025205048@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3436, NULL, 3, '921025205049', '921025205049', NULL, 'SARUSHEELA', 'G', '921025205049@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3437, NULL, 3, '921025205050', '921025205050', NULL, 'SHANMUGAVALLI', 'K', '921025205050@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3438, NULL, 3, '921025205051', '921025205051', NULL, 'SHARUNETHRA', 'V', '921025205051@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3439, NULL, 3, '921025205052', '921025205052', NULL, 'SHIVANI', 'B', '921025205052@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3440, NULL, 3, '921025205053', '921025205053', NULL, 'SHOBA', 'M', '921025205053@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3441, NULL, 3, '921025205054', '921025205054', NULL, 'SUJITHRAM', 'S', '921025205054@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3442, NULL, 3, '921025205055', '921025205055', NULL, 'SWETHA', 'T', '921025205055@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3443, NULL, 3, '921025205056', '921025205056', NULL, 'THANISHA', 'S', '921025205056@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3444, NULL, 3, '921025205057', '921025205057', NULL, 'THEJINI', 'P', '921025205057@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3445, NULL, 3, '921025205058', '921025205058', NULL, 'VEERUJOTHI', 'P', '921025205058@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3446, NULL, 3, '921025205059', '921025205059', NULL, 'VELMURUGAN', 'J', '921025205059@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3447, NULL, 3, '921025205060', '921025205060', NULL, 'YUGASHRI', 'S', '921025205060@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3448, NULL, 3, '921025114001', '921025114001', NULL, 'ABINESH', 'P', '921025114001@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3449, NULL, 3, '921025114002', '921025114002', NULL, 'AKASH', 'K', '921025114002@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3450, NULL, 3, '921025114003', '921025114003', NULL, 'AZHAGAR', 'RAJA P', '921025114003@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3451, NULL, 3, '921025114004', '921025114004', NULL, 'BHUVANESHPANDI', 'S', '921025114004@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3452, NULL, 3, '921025114005', '921025114005', NULL, 'BUVANESWARAN', 'S', '921025114005@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3453, NULL, 3, '921025114006', '921025114006', NULL, 'DEEPAK', 'A', '921025114006@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3454, NULL, 3, '921025114007', '921025114007', NULL, 'DEEPAKISHAN', 'R', '921025114007@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3455, NULL, 3, '921025114008', '921025114008', NULL, 'DESIKASRI', 'S', '921025114008@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3456, NULL, 3, '921025114009', '921025114009', NULL, 'DHIVYAJOTHI', 'SREE K', '921025114009@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3457, NULL, 3, '921025114010', '921025114010', NULL, 'DIVAHAR', 'S', '921025114010@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3458, NULL, 3, '921025114011', '921025114011', NULL, 'DURAI', 'SELVAN K', '921025114011@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3459, NULL, 3, '921025114012', '921025114012', NULL, 'GOWMARIGAYATHRI', 'R', '921025114012@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3460, NULL, 3, '921025114013', '921025114013', NULL, 'HARISHMA', 'SRI R', '921025114013@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3461, NULL, 3, '921025114014', '921025114014', NULL, 'HARRYS', 'R', '921025114014@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3462, NULL, 3, '921025114015', '921025114015', NULL, 'JABAR', 'MYDEEN U', '921025114015@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3463, NULL, 3, '921025114016', '921025114016', NULL, 'KABISH', 'R', '921025114016@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3464, NULL, 3, '921025114018', '921025114018', NULL, 'KAVIARASAN', 'N', '921025114018@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3465, NULL, 3, '921025114019', '921025114019', NULL, 'KAVIN', 'G', '921025114019@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3466, NULL, 3, '921025114020', '921025114020', NULL, 'KIRTHICK', 'M', '921025114020@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3467, NULL, 3, '921025114022', '921025114022', NULL, 'KISHORE', 'KUMAR V', '921025114022@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3468, NULL, 3, '921025114023', '921025114023', NULL, 'KOWSHIK', 'HEMA CHANDRAN M', '921025114023@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3469, NULL, 3, '921025114024', '921025114024', NULL, 'MARIMUTHU', 'S', '921025114024@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3470, NULL, 3, '921025114025', '921025114025', NULL, 'MATHESH', 'M', '921025114025@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3471, NULL, 3, '921025114026', '921025114026', NULL, 'MOHAMED', 'ASKAR M', '921025114026@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3472, NULL, 3, '921025114027', '921025114027', NULL, 'MOHAMED', 'THARIK A', '921025114027@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3473, NULL, 3, '921025114028', '921025114028', NULL, 'MOHANARAJAN', 'M', '921025114028@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3474, NULL, 3, '921025114029', '921025114029', NULL, 'MONISH', 'S', '921025114029@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3475, NULL, 3, '921025114030', '921025114030', NULL, 'MUTHUPANDI', 'G', '921025114030@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3476, NULL, 3, '921025114031', '921025114031', NULL, 'NIKASH', 'S', '921025114031@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3477, NULL, 3, '921025114032', '921025114032', NULL, 'PERARASAN', 'S', '921025114032@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3478, NULL, 3, '921025114033', '921025114033', NULL, 'POOVESH', 'M', '921025114033@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3479, NULL, 3, '921025114034', '921025114034', NULL, 'RANJITH', 'P', '921025114034@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3480, NULL, 3, '921025114035', '921025114035', NULL, 'SANJAYPANDIAN', 'G', '921025114035@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3481, NULL, 3, '921025114036', '921025114036', NULL, 'SANTHOSH', 'KUMAR B', '921025114036@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3482, NULL, 3, '921025114037', '921025114037', NULL, 'SANTHOSH', 'SRI RAM R', '921025114037@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36');
INSERT INTO `student_profile` (`id`, `userId`, `role_id`, `studentId`, `rollNumber`, `admissionNo`, `firstName`, `lastName`, `email`, `phone`, `photo`, `gender`, `departmentId`, `classId`, `batch`, `semester`, `year`, `admissionDate`, `admissionType`, `feeStatus`, `status`, `password`, `createdAt`, `updatedAt`) VALUES
(3483, NULL, 3, '921025114038', '921025114038', NULL, 'SURIYA', 'PRAKASH J', '921025114038@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3484, NULL, 3, '921025114039', '921025114039', NULL, 'THIRUNAVUKKARASU', 'B', '921025114039@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3485, NULL, 3, '921025114040', '921025114040', NULL, 'VIGNESHWARAN', 'M', '921025114040@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3486, NULL, 3, '921025114041', '921025114041', NULL, 'VIGNESHWARAN', 'V', '921025114041@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3487, NULL, 3, '921025114042', '921025114042', NULL, 'VISHNUVARATHAN', 'V', '921025114042@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3488, NULL, 3, '921025114043', '921025114043', NULL, 'VISHWA', 'V', '921025114043@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3489, NULL, 3, '921025114044', '921025114044', NULL, 'YUVARAJ', 'M', '921025114044@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3490, NULL, 3, '921025106001', '921025106001', NULL, 'ABISHEK', 'S', '921025106001@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3491, NULL, 3, '921025106002', '921025106002', NULL, 'AJAY', 'SELVAM T', '921025106002@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3492, NULL, 3, '921025106003', '921025106003', NULL, 'ARAVINDH', 'KUMAR D', '921025106003@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3493, NULL, 3, '921025106004', '921025106004', NULL, 'ARIVAZHAGAN', 'G', '921025106004@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3494, NULL, 3, '921025106005', '921025106005', NULL, 'BARANI', 'DHARAN R', '921025106005@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3495, NULL, 3, '921025106006', '921025106006', NULL, 'BALAJI', 'B', '921025106006@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3496, NULL, 3, '921025106007', '921025106007', NULL, 'BHARANIDHARAN', 'C', '921025106007@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3497, NULL, 3, '921025106008', '921025106008', NULL, 'DEEKSITHKASTHURIRAJAN', 'K', '921025106008@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3498, NULL, 3, '921025106009', '921025106009', NULL, 'DEEPAK', 'SRI RENGA D', '921025106009@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3499, NULL, 3, '921025106010', '921025106010', NULL, 'DHANUSREE', 'M P', '921025106010@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3500, NULL, 3, '921025106011', '921025106011', NULL, 'DHARANI', 'P', '921025106011@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3501, NULL, 3, '921025106012', '921025106012', NULL, 'DHARANI', 'SHREE S', '921025106012@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3502, NULL, 3, '921025106013', '921025106013', NULL, 'DHIVASHINI', 'M', '921025106013@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3503, NULL, 3, '921025106014', '921025106014', NULL, 'DHIYA', 'M', '921025106014@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3504, NULL, 3, '921025106015', '921025106015', NULL, 'GIRIVASAN', 'A', '921025106015@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3505, NULL, 3, '921025106016', '921025106016', NULL, 'GOWTHAM', 'V', '921025106016@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3506, NULL, 3, '921025106017', '921025106017', NULL, 'HARINI', 'K', '921025106017@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3507, NULL, 3, '921025106018', '921025106018', NULL, 'HEMA', 'T', '921025106018@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3508, NULL, 3, '921025106019', '921025106019', NULL, 'HEMA', 'VARSHINI A', '921025106019@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3509, NULL, 3, '921025106020', '921025106020', NULL, 'HIRUTHIKA', 'S', '921025106020@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3510, NULL, 3, '921025106021', '921025106021', NULL, 'INULZAARIYA', 'A', '921025106021@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3511, NULL, 3, '921025106022', '921025106022', NULL, 'JAMEER', 'MOHAMED S', '921025106022@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3512, NULL, 3, '921025106023', '921025106023', NULL, 'JEEVADHARSHINI', 'K', '921025106023@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3513, NULL, 3, '921025106024', '921025106024', NULL, 'JEEVADHARSINI', 'B', '921025106024@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3514, NULL, 3, '921025106025', '921025106025', NULL, 'JEGATHEESWARI', 'K', '921025106025@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3515, NULL, 3, '921025106026', '921025106026', NULL, 'KANAL', 'AVINASH R', '921025106026@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3516, NULL, 3, '921025106027', '921025106027', NULL, 'KARTHICK', 'S', '921025106027@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3517, NULL, 3, '921025106028', '921025106028', NULL, 'KARUNIYA', 'K', '921025106028@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3518, NULL, 3, '921025106029', '921025106029', NULL, 'KAVIYA', 'B', '921025106029@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3519, NULL, 3, '921025106030', '921025106030', NULL, 'KEERTHI', 'SUKANYA S', '921025106030@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3520, NULL, 3, '921025106031', '921025106031', NULL, 'KIRUBASHREE', 'S', '921025106031@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3521, NULL, 3, '921025106032', '921025106032', NULL, 'KIRUPAKARAN', 'J', '921025106032@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3522, NULL, 3, '921025106033', '921025106033', NULL, 'KISHORE', 'V', '921025106033@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3523, NULL, 3, '921025106034', '921025106034', NULL, 'LAUREL', 'HAGI D', '921025106034@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3524, NULL, 3, '921025106035', '921025106035', NULL, 'LAVANYA', 'M', '921025106035@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3525, NULL, 3, '921025106036', '921025106036', NULL, 'LEENA', 'SHRI B', '921025106036@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3526, NULL, 3, '921025106037', '921025106037', NULL, 'LOGADHARSHINI', 'R', '921025106037@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3527, NULL, 3, '921025106038', '921025106038', NULL, 'LOGAMMAL', 'M', '921025106038@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3528, NULL, 3, '921025106039', '921025106039', NULL, 'MAHALAKSHMI', 'P', '921025106039@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3529, NULL, 3, '921025106040', '921025106040', NULL, 'MANASA', 'DEVI K', '921025106040@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3530, NULL, 3, '921025106041', '921025106041', NULL, 'MANISHA', 'R', '921025106041@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3531, NULL, 3, '921025106042', '921025106042', NULL, 'MARLIYA', 'FATHIMA S', '921025106042@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3532, NULL, 3, '921025106043', '921025106043', NULL, 'MEERA', 'N', '921025106043@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3533, NULL, 3, '921025106044', '921025106044', NULL, 'MOHANAPRIYA', 'S', '921025106044@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3534, NULL, 3, '921025106045', '921025106045', NULL, 'MONIGA', 'R', '921025106045@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3535, NULL, 3, '921025106046', '921025106046', NULL, 'NAVTHEEB', 'A', '921025106046@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3536, NULL, 3, '921025106047', '921025106047', NULL, 'NELAKSHI', 'B', '921025106047@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3537, NULL, 3, '921025106048', '921025106048', NULL, 'NISHANTHINI', 'K', '921025106048@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3538, NULL, 3, '921025106049', '921025106049', NULL, 'NITHISH', 'K T', '921025106049@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3539, NULL, 3, '921025106050', '921025106050', NULL, 'PANDEESWARI', 'M', '921025106050@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3540, NULL, 3, '921025106052', '921025106052', NULL, 'PRAVEEN', 'C', '921025106052@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3541, NULL, 3, '921025106053', '921025106053', NULL, 'SIVA', 'E', '921025106053@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3542, NULL, 3, '921025106054', '921025106054', NULL, 'SIVAKAMI', 'P', '921025106054@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3543, NULL, 3, '921025106055', '921025106055', NULL, 'SRILEKHA', 'R', '921025106055@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3544, NULL, 3, '921025106056', '921025106056', NULL, 'SURIYA', 'PRAKASH', '921025106056@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3545, NULL, 3, '921025106057', '921025106057', NULL, 'THEEPTHIGA', 'K', '921025106057@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3546, NULL, 3, '921025106058', '921025106058', NULL, 'VAISHNAVI', 'S', '921025106058@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3547, NULL, 3, '921025106059', '921025106059', NULL, 'VIKRAM', 'N', '921025106059@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3548, NULL, 3, '921025105001', '921025105001', NULL, 'AJAY', 'PANDI P', '921025105001@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3549, NULL, 3, '921025105002', '921025105002', NULL, 'ANISH', 'FATHIMA A', '921025105002@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3550, NULL, 3, '921025105003', '921025105003', NULL, 'ANUSRI', 'A', '921025105003@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3551, NULL, 3, '921025105004', '921025105004', NULL, 'ASHMA', 'BARVIN P', '921025105004@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3552, NULL, 3, '921025105005', '921025105005', NULL, 'ASIFA', 'M', '921025105005@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3553, NULL, 3, '921025105006', '921025105006', NULL, 'ATCHAYA', 'KEERTHIKA D', '921025105006@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3554, NULL, 3, '921025105007', '921025105007', NULL, 'BEAULAH', 'JOILE S', '921025105007@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3555, NULL, 3, '921025105008', '921025105008', NULL, 'CHENNA', 'KRISHNAN K', '921025105008@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3556, NULL, 3, '921025105009', '921025105009', NULL, 'DEEPIKA', 'V', '921025105009@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3557, NULL, 3, '921025105010', '921025105010', NULL, 'DHANISHA', 'M', '921025105010@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3558, NULL, 3, '921025105011', '921025105011', NULL, 'DHARSHAN', 'N', '921025105011@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3559, NULL, 3, '921025105012', '921025105012', NULL, 'GOWSIKA', 'S', '921025105012@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3560, NULL, 3, '921025105013', '921025105013', NULL, 'HARCHINI', 'M', '921025105013@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3561, NULL, 3, '921025105014', '921025105014', NULL, 'HARINI', 'M', '921025105014@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3562, NULL, 3, '921025105015', '921025105015', NULL, 'HARISH', 'K', '921025105015@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3563, NULL, 3, '921025105016', '921025105016', NULL, 'HARISH', 'L', '921025105016@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3564, NULL, 3, '921025105017', '921025105017', NULL, 'HARISH', 'M', '921025105017@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3565, NULL, 3, '921025105018', '921025105018', NULL, 'HARITHABANU', 'K', '921025105018@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3566, NULL, 3, '921025105019', '921025105019', NULL, 'HEMAPRIYA', 'N', '921025105019@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3567, NULL, 3, '921025105020', '921025105020', NULL, 'JANANI', 'A V', '921025105020@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3568, NULL, 3, '921025105021', '921025105021', NULL, 'KAMALESH', 'V', '921025105021@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3569, NULL, 3, '921025105022', '921025105022', NULL, 'KANAGALAKSHMI', 'R', '921025105022@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3570, NULL, 3, '921025105023', '921025105023', NULL, 'KEERTHIKA', 'C', '921025105023@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3571, NULL, 3, '921025105024', '921025105024', NULL, 'KIRUBA', 'A', '921025105024@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3572, NULL, 3, '921025105025', '921025105025', NULL, 'LINGESH', 'S', '921025105025@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3573, NULL, 3, '921025105026', '921025105026', NULL, 'LINGESH', 'S S', '921025105026@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3574, NULL, 3, '921025105027', '921025105027', NULL, 'MADHUMIDHA', 'M', '921025105027@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3575, NULL, 3, '921025105028', '921025105028', NULL, 'MANOJ', 'PRAVEEN M', '921025105028@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3576, NULL, 3, '921025105029', '921025105029', NULL, 'MATHESH', 'M', '921025105029@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3577, NULL, 3, '921025105030', '921025105030', NULL, 'MUGESHKUMAR', 'M', '921025105030@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3578, NULL, 3, '921025105031', '921025105031', NULL, 'NANDHAKUMAR', 'S', '921025105031@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3579, NULL, 3, '921025105032', '921025105032', NULL, 'NAVEENA', 'N', '921025105032@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3580, NULL, 3, '921025105033', '921025105033', NULL, 'NIGITHA', 'R', '921025105033@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3581, NULL, 3, '921025105034', '921025105034', NULL, 'NITHISH', 'G', '921025105034@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3582, NULL, 3, '921025105035', '921025105035', NULL, 'NITHYA', 'DHARSHINI S', '921025105035@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3583, NULL, 3, '921025105036', '921025105036', NULL, 'NIVESH', 'E', '921025105036@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3584, NULL, 3, '921025105037', '921025105037', NULL, 'PADMASHRI', 'P', '921025105037@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3585, NULL, 3, '921025105038', '921025105038', NULL, 'PAVITHRA', 'S', '921025105038@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3586, NULL, 3, '921025105039', '921025105039', NULL, 'POOJA', 'M', '921025105039@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3587, NULL, 3, '921025105040', '921025105040', NULL, 'PRITHIKA', 'J', '921025105040@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3588, NULL, 3, '921025105041', '921025105041', NULL, 'RAGAVAN', 'S', '921025105041@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3589, NULL, 3, '921025105042', '921025105042', NULL, 'RUBINASRI', 'L', '921025105042@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3590, NULL, 3, '921025105043', '921025105043', NULL, 'SABARI', 'BALAJI A', '921025105043@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3591, NULL, 3, '921025105044', '921025105044', NULL, 'SANTHOSH', 'C', '921025105044@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3592, NULL, 3, '921025105045', '921025105045', NULL, 'SANTHOSH', 'M', '921025105045@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3593, NULL, 3, '921025105046', '921025105046', NULL, 'SARAVANA', 'MUTHU G', '921025105046@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3594, NULL, 3, '921025105047', '921025105047', NULL, 'SATHANA', 'R', '921025105047@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3595, NULL, 3, '921025105048', '921025105048', NULL, 'SATHYA', 'PRIYA S', '921025105048@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3596, NULL, 3, '921025105049', '921025105049', NULL, 'SELVARANI', 'M E', '921025105049@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3597, NULL, 3, '921025105050', '921025105050', NULL, 'SHAPNADEVI', 'P', '921025105050@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3598, NULL, 3, '921025105051', '921025105051', NULL, 'SIVABALAN', 'B', '921025105051@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3599, NULL, 3, '921025105052', '921025105052', NULL, 'SIVASAKTHI', 'J', '921025105052@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3600, NULL, 3, '921025105053', '921025105053', NULL, 'SOUNDHAR', 'RAJAN V', '921025105053@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3601, NULL, 3, '921025105054', '921025105054', NULL, 'SRIDHARSHINI', 'K', '921025105054@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3602, NULL, 3, '921025105055', '921025105055', NULL, 'SUNDARA', 'ADHITHAN S', '921025105055@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3603, NULL, 3, '921025105056', '921025105056', NULL, 'THARUN', 'M', '921025105056@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3604, NULL, 3, '921025105057', '921025105057', NULL, 'THIRUKUMARAN', 'M', '921025105057@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3605, NULL, 3, '921025105058', '921025105058', NULL, 'VIDHYA', 'R', '921025105058@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3606, NULL, 3, '921025105059', '921025105059', NULL, 'YOGITH', 'S', '921025105059@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3607, NULL, 3, '921025105060', '921025105060', NULL, 'YUVATHI', 'SRI A', '921025105060@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3608, NULL, 3, '921025104001', '921025104001', NULL, 'AATHISUNDARARAJAN', 'N', '921025104001@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3609, NULL, 3, '921025104002', '921025104002', NULL, 'AZLINA', 'M', '921025104002@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3610, NULL, 3, '921025104003', '921025104003', NULL, 'BHARATHI', 'M', '921025104003@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3611, NULL, 3, '921025104004', '921025104004', NULL, 'BHAVADHARANI', 'M', '921025104004@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3612, NULL, 3, '921025104005', '921025104005', NULL, 'DEVA', 'GURU G', '921025104005@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3613, NULL, 3, '921025104006', '921025104006', NULL, 'DHANUSHA', 'SRI J', '921025104006@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3614, NULL, 3, '921025104007', '921025104007', NULL, 'DHARSHINI', 'S', '921025104007@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3615, NULL, 3, '921025104008', '921025104008', NULL, 'DHARSHITH', 'R', '921025104008@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3616, NULL, 3, '921025104009', '921025104009', NULL, 'DIVYA', 'K', '921025104009@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3617, NULL, 3, '921025104010', '921025104010', NULL, 'DURGALAKSHMI', 'M', '921025104010@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3618, NULL, 3, '921025104011', '921025104011', NULL, 'GAYATHIRI', 'M', '921025104011@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3619, NULL, 3, '921025104012', '921025104012', NULL, 'GOKULA', 'KANNAN P G', '921025104012@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3620, NULL, 3, '921025104013', '921025104013', NULL, 'HAASINI', 'K', '921025104013@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3621, NULL, 3, '921025104014', '921025104014', NULL, 'HARIGARAN', 'K', '921025104014@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3622, NULL, 3, '921025104015', '921025104015', NULL, 'HARINI', 'K', '921025104015@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3623, NULL, 3, '921025104016', '921025104016', NULL, 'HARSHINI', 'S', '921025104016@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3624, NULL, 3, '921025104017', '921025104017', NULL, 'HARSHITHA', 'S', '921025104017@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3625, NULL, 3, '921025104018', '921025104018', NULL, 'IRFANA', 'S', '921025104018@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3626, NULL, 3, '921025104019', '921025104019', NULL, 'JAYANTHRA', 'K J', '921025104019@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3627, NULL, 3, '921025104020', '921025104020', NULL, 'JEYA', 'SREE P', '921025104020@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3628, NULL, 3, '921025104021', '921025104021', NULL, 'JUHI', 'NUSHRATH H', '921025104021@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3629, NULL, 3, '921025104022', '921025104022', NULL, 'KARTHIK', 'OMSHAKTHI K', '921025104022@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3630, NULL, 3, '921025104023', '921025104023', NULL, 'KAVIYA', 'K', '921025104023@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3631, NULL, 3, '921025104024', '921025104024', NULL, 'LATHIKA', 'K', '921025104024@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3632, NULL, 3, '921025104025', '921025104025', NULL, 'LISHANTHI', 'S', '921025104025@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3633, NULL, 3, '921025104026', '921025104026', NULL, 'MAHIMA', 'M', '921025104026@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3634, NULL, 3, '921025104027', '921025104027', NULL, 'MAHISHA', 'S', '921025104027@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36');
INSERT INTO `student_profile` (`id`, `userId`, `role_id`, `studentId`, `rollNumber`, `admissionNo`, `firstName`, `lastName`, `email`, `phone`, `photo`, `gender`, `departmentId`, `classId`, `batch`, `semester`, `year`, `admissionDate`, `admissionType`, `feeStatus`, `status`, `password`, `createdAt`, `updatedAt`) VALUES
(3635, NULL, 3, '921025104028', '921025104028', NULL, 'MANIKANDAN', 'P', '921025104028@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3636, NULL, 3, '921025104029', '921025104029', NULL, 'MEGADHARSHINI', 'S', '921025104029@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3637, NULL, 3, '921025104030', '921025104030', NULL, 'MOHAMED', 'AFSAL K', '921025104030@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3638, NULL, 3, '921025104031', '921025104031', NULL, 'MOHANASANTHOSH', 'V', '921025104031@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3639, NULL, 3, '921025104032', '921025104032', NULL, 'MONISHA', 'S', '921025104032@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3640, NULL, 3, '921025104033', '921025104033', NULL, 'NETHRA', 'V', '921025104033@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3641, NULL, 3, '921025104034', '921025104034', NULL, 'NISHA', 'K', '921025104034@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3642, NULL, 3, '921025104035', '921025104035', NULL, 'NITHARSHANA', 'S', '921025104035@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3643, NULL, 3, '921025104036', '921025104036', NULL, 'POOJA', 'SRI P', '921025104036@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3644, NULL, 3, '921025104037', '921025104037', NULL, 'PRATHIKSHA', 'SRI S', '921025104037@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3645, NULL, 3, '921025104038', '921025104038', NULL, 'PRINCYMISPHA', 'C', '921025104038@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3646, NULL, 3, '921025104039', '921025104039', NULL, 'PRIYADHARSHINI', 'P', '921025104039@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3647, NULL, 3, '921025104040', '921025104040', NULL, 'PUGAZHENTHI', 'G', 'gpugal06@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3648, NULL, 3, '921025104041', '921025104041', NULL, 'RAGA', 'SRI V', '921025104041@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3649, NULL, 3, '921025104042', '921025104042', NULL, 'RIYA', 'R', '921025104042@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3650, NULL, 3, '921025104043', '921025104043', NULL, 'SAMRUTHA', 'P', '921025104043@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3651, NULL, 3, '921025104044', '921025104044', NULL, 'SANTHANAGOWSHIKA', 'K', '921025104044@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3652, NULL, 3, '921025104045', '921025104045', NULL, 'SANTHIYA', 'C', '921025104045@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3653, NULL, 3, '921025104046', '921025104046', NULL, 'SANTHOSI', 'S', '921025104046@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3654, NULL, 3, '921025104047', '921025104047', NULL, 'SELVALAKSHMI', 'M', '921025104047@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3655, NULL, 3, '921025104048', '921025104048', NULL, 'SHAHANA', 'P', '921025104048@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3656, NULL, 3, '921025104049', '921025104049', NULL, 'SHAKTHI', 'R', '921025104049@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3657, NULL, 3, '921025104050', '921025104050', NULL, 'SIVAKUMAR', 'K', '921025104050@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3658, NULL, 3, '921025104051', '921025104051', NULL, 'SOWMIYA', 'A', '921025104051@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3659, NULL, 3, '921025104052', '921025104052', NULL, 'SREEJA', 'R', '921025104052@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3660, NULL, 3, '921025104053', '921025104053', NULL, 'SRIVAISHNAVI', 'M', '921025104053@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3661, NULL, 3, '921025104054', '921025104054', NULL, 'SUBATHRA', 'M', '921025104054@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3662, NULL, 3, '921025104055', '921025104055', NULL, 'SURIYA', 'T', '921025104055@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3663, NULL, 3, '921025104056', '921025104056', NULL, 'VARSHINI', 'K', '921025104056@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3664, NULL, 3, '921025104057', '921025104057', NULL, 'VISHAL', 'R', '921025104057@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3665, NULL, 3, '921025104058', '921025104058', NULL, 'YASHIKAJAISHREE', 'M', '921025104058@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3666, NULL, 3, '921025104059', '921025104059', NULL, 'YOKHITHA', 'V', '921025104059@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3667, NULL, 3, '921025104060', '921025104060', NULL, 'YOSHITHA', 'K', '921025104060@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2025-2029', 2, '1', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:36'),
(3668, NULL, 3, '921023103001', '921023103001', NULL, 'AJAY', 'S', '921023103001@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3669, NULL, 3, '921023103002', '921023103002', NULL, 'BALA', 'S', '921023103002@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3670, NULL, 3, '921023103004', '921023103004', NULL, 'GURULAKSHMI', 'R', '921023103004@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3671, NULL, 3, '921023103005', '921023103005', NULL, 'HARIKRISHNAN', 'R', '921023103005@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3672, NULL, 3, '921023103006', '921023103006', NULL, 'HEMAPRIYA', 'K', '921023103006@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3673, NULL, 3, '921023103007', '921023103007', NULL, 'IYYANATHAN', 'M', '921023103007@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3674, NULL, 3, '921023103008', '921023103008', NULL, 'JEGANATH', 'M', '921023103008@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3675, NULL, 3, '921023103009', '921023103009', NULL, 'KABILAN', 'E T', '921023103009@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3676, NULL, 3, '921023103010', '921023103010', NULL, 'MADHUGAYATHRI', 'J', '921023103010@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3677, NULL, 3, '921023103011', '921023103011', NULL, 'MALATHI', 'S', '921023103011@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3678, NULL, 3, '921023103012', '921023103012', NULL, 'NITHIYA', 'SHREE S', '921023103012@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3679, NULL, 3, '921023103013', '921023103013', NULL, 'PRABHA', 'S', '921023103013@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3680, NULL, 3, '921023103014', '921023103014', NULL, 'PRATHIVARUN', 'P R', '921023103014@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3681, NULL, 3, '921023103016', '921023103016', NULL, 'SHAJITHA', 'PARVEEN R', '921023103016@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3682, NULL, 3, '921023103017', '921023103017', NULL, 'SUBITCHANASRI', 'S', '921023103017@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3683, NULL, 3, '921023103018', '921023103018', NULL, 'THANUJA', 'S', '921023103018@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3684, NULL, 3, '921023103301', '921023103301', NULL, 'GEERI', 'R', '921023103301@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3685, NULL, 3, '921023103302', '921023103302', NULL, 'PICHAIMUTHU', 'S', '921023103302@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2023-2027', 2, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3686, NULL, 3, '921024243001', '921024243001', NULL, 'ABARNA', 'K', '921024243001@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3687, NULL, 3, '921024243002', '921024243002', NULL, 'ABDUL', 'RAHMAN U', '921024243002@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3688, NULL, 3, '921024243003', '921024243003', NULL, 'ANBU', 'DHARSINI V', '921024243003@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3689, NULL, 3, '921024243004', '921024243004', NULL, 'ANEESHA', 'S', '921024243004@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3690, NULL, 3, '921024243005', '921024243005', NULL, 'ANUPRIYA', 'R', '921024243005@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3691, NULL, 3, '921024243006', '921024243006', NULL, 'AYISHA', 'ASMEE R', '921024243006@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3692, NULL, 3, '921024243007', '921024243007', NULL, 'BACKIYALAKSHMI', 'G', '921024243007@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3693, NULL, 3, '921024243008', '921024243008', NULL, 'BACKYALAKSHMI', 'M', '921024243008@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3694, NULL, 3, '921024243009', '921024243009', NULL, 'DEEPA', 'J', '921024243009@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3695, NULL, 3, '921024243010', '921024243010', NULL, 'DEVIDHARSHINI', 'P', '921024243010@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3696, NULL, 3, '921024243011', '921024243011', NULL, 'DEVIKALA', 'M', '921024243011@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3697, NULL, 3, '921024243012', '921024243012', NULL, 'DHARANI', 'D', '921024243012@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3698, NULL, 3, '921024243013', '921024243013', NULL, 'DHIVYA', 'M', '921024243013@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3699, NULL, 3, '921024243014', '921024243014', NULL, 'DINESH', 'BABU O', '921024243014@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3700, NULL, 3, '921024243015', '921024243015', NULL, 'DIVYA', 'VARSHINI N', '921024243015@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3701, NULL, 3, '921024243016', '921024243016', NULL, 'GOBI', 'P', '921024243016@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3702, NULL, 3, '921024243017', '921024243017', NULL, 'GOWTHAMAN', 'N', '921024243017@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3703, NULL, 3, '921024243018', '921024243018', NULL, 'HARIPRIYA', 'M', '921024243018@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3704, NULL, 3, '921024243019', '921024243019', NULL, 'HARIPRIYA', 'S', '921024243019@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3705, NULL, 3, '921024243020', '921024243020', NULL, 'HARSANTHINI', 'K', '921024243020@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3706, NULL, 3, '921024243021', '921024243021', NULL, 'HARSHINI', 'A', '921024243021@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3707, NULL, 3, '921024243022', '921024243022', NULL, 'JANANI', 'S', '921024243022@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3708, NULL, 3, '921024243023', '921024243023', NULL, 'JEEVITHA', 'S', '921024243023@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3709, NULL, 3, '921024243024', '921024243024', NULL, 'JOYS', 'KIRUBA J', '921024243024@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3710, NULL, 3, '921024243025', '921024243025', NULL, 'KABILAN', 'I', '921024243025@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3711, NULL, 3, '921024243026', '921024243026', NULL, 'KEERTHAN', 'A', '921024243026@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3712, NULL, 3, '921024243027', '921024243027', NULL, 'LAVANYA', 'A', '921024243027@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3713, NULL, 3, '921024243028', '921024243028', NULL, 'LOGAPRIYA', 'M', '921024243028@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3714, NULL, 3, '921024243029', '921024243029', NULL, 'MADHU', 'VARSHINI J', '921024243029@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3715, NULL, 3, '921024243030', '921024243030', NULL, 'NAGESWARI', 'S', '921024243030@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3716, NULL, 3, '921024243031', '921024243031', NULL, 'NITIN', 'KARTHICK J', '921024243031@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3717, NULL, 3, '921024243032', '921024243032', NULL, 'POOBATHI', 'RAJAN M', '921024243032@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3718, NULL, 3, '921024243033', '921024243033', NULL, 'PRAVEENKUMAR', 'A', '921024243033@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3719, NULL, 3, '921024243034', '921024243034', NULL, 'PRIYADHARSHINI', 'V', '921024243034@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3720, NULL, 3, '921024243035', '921024243035', NULL, 'RAJARAJESHWARI', 'N', '921024243035@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3721, NULL, 3, '921024243036', '921024243036', NULL, 'RAMACHANDRAN', 'M', '921024243036@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3722, NULL, 3, '921024243037', '921024243037', NULL, 'SAMIKSHA', 'D', '921024243037@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3723, NULL, 3, '921024243038', '921024243038', NULL, 'SASI', 'REGHA P', '921024243038@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3724, NULL, 3, '921024243039', '921024243039', NULL, 'SHAHANA', 'FIRDAUS  K', '921024243039@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3725, NULL, 3, '921024243040', '921024243040', NULL, 'SRI', 'KAVI P M', '921024243040@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3726, NULL, 3, '921024243041', '921024243041', NULL, 'SUBASHINI', 'M', '921024243041@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3727, NULL, 3, '921024243042', '921024243042', NULL, 'THANGA', 'PRABHU A', '921024243042@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3728, NULL, 3, '921024243043', '921024243043', NULL, 'THARUN', 'V', '921024243043@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3729, NULL, 3, '921024243044', '921024243044', NULL, 'THIRUNIKA', 'V S', '921024243044@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3730, NULL, 3, '921024243045', '921024243045', NULL, 'VARSHINI', 'S', '921024243045@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3731, NULL, 3, '921024243046', '921024243046', NULL, 'VIJAYALAKSHMI', 'K', '921024243046@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3732, NULL, 3, '921024243047', '921024243047', NULL, 'YAVANASHREE', 'R', '921024243047@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3733, NULL, 3, '921024243301', '921024243301', NULL, 'PANDEESWARAN', 'P', '921024243301@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3734, NULL, 3, '921024243302', '921024243302', NULL, 'VAISHNAVI', 'V', '921024243302@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3735, NULL, 3, '921024205001', '921024205001', NULL, 'ABBAS', 'MANTHIRI A', '921024205001@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3736, NULL, 3, '921024205002', '921024205002', NULL, 'ABIKCHANA', 'M', '921024205002@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3737, NULL, 3, '921024205003', '921024205003', NULL, 'ABINAYA', 'V', '921024205003@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3738, NULL, 3, '921024205004', '921024205004', NULL, 'AISHWARYA', 'S', '921024205004@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3739, NULL, 3, '921024205005', '921024205005', NULL, 'AKSHARA', 'M', '921024205005@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3740, NULL, 3, '921024205006', '921024205006', NULL, 'ANITHA', 'S', '921024205006@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3741, NULL, 3, '921024205007', '921024205007', NULL, 'DEVADHARSHINI', 'S', '921024205007@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3742, NULL, 3, '921024205008', '921024205008', NULL, 'DHARSHINI', 'K', '921024205008@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3743, NULL, 3, '921024205009', '921024205009', NULL, 'DHINESHKUMAR', 'V', '921024205009@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3744, NULL, 3, '921024205010', '921024205010', NULL, 'GANESH', 'BABU P', '921024205010@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3745, NULL, 3, '921024205011', '921024205011', NULL, 'GAYATHRI', 'P', '921024205011@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3746, NULL, 3, '921024205012', '921024205012', NULL, 'GOBINATH', 'G', '921024205012@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3747, NULL, 3, '921024205013', '921024205013', NULL, 'HARISH', 'K', '921024205013@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3748, NULL, 3, '921024205014', '921024205014', NULL, 'HEMA', 'M', '921024205014@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3749, NULL, 3, '921024205015', '921024205015', NULL, 'JEYASIVA', 'S', '921024205015@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3750, NULL, 3, '921024205016', '921024205016', NULL, 'KARUNYA', 'SHRI M', '921024205016@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3751, NULL, 3, '921024205017', '921024205017', NULL, 'KEERTHANA', 'S', '921024205017@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3752, NULL, 3, '921024205018', '921024205018', NULL, 'KRISHNAVENI', 'V', '921024205018@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3753, NULL, 3, '921024205019', '921024205019', NULL, 'LAKSHMI', 'PRIYA G', '921024205019@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3754, NULL, 3, '921024205020', '921024205020', NULL, 'MAHESWARI', 'M', '921024205020@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3755, NULL, 3, '921024205021', '921024205021', NULL, 'MANISHVARMA', 'S', '921024205021@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3756, NULL, 3, '921024205022', '921024205022', NULL, 'MANJULA', 'S', '921024205022@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3757, NULL, 3, '921024205023', '921024205023', NULL, 'NIVETHA', 'J', '921024205023@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3758, NULL, 3, '921024205024', '921024205024', NULL, 'PAVITHRA', 'M', '921024205024@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3759, NULL, 3, '921024205026', '921024205026', NULL, 'PRAVEENA', 'N', '921024205026@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3760, NULL, 3, '921024205027', '921024205027', NULL, 'PRIYADHARSHINI', 'M', '921024205027@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3761, NULL, 3, '921024205028', '921024205028', NULL, 'PRIYANGA', 'G', '921024205028@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3762, NULL, 3, '921024205029', '921024205029', NULL, 'RAJESHWARI', 'V', '921024205029@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3763, NULL, 3, '921024205030', '921024205030', NULL, 'RESHMA', 'S', '921024205030@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3764, NULL, 3, '921024205032', '921024205032', NULL, 'SAHANA', 'S', '921024205032@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3765, NULL, 3, '921024205033', '921024205033', NULL, 'SARAN', 'SANJAI M', '921024205033@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3766, NULL, 3, '921024205034', '921024205034', NULL, 'SATHYABAMA', 'G', '921024205034@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3767, NULL, 3, '921024205035', '921024205035', NULL, 'SHANMUGAPRIYA', 'N', '921024205035@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3768, NULL, 3, '921024205036', '921024205036', NULL, 'SHARVESWARAN', 'S P', '921024205036@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3769, NULL, 3, '921024205037', '921024205037', NULL, 'SIVA', 'PRADEEP M', '921024205037@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3770, NULL, 3, '921024205038', '921024205038', NULL, 'SIVASANDHYA', 'K', '921024205038@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3771, NULL, 3, '921024205039', '921024205039', NULL, 'SRINITHI', 'A', '921024205039@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3772, NULL, 3, '921024205040', '921024205040', NULL, 'SRI', 'SAI NIVASHINI S', '921024205040@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3773, NULL, 3, '921024205041', '921024205041', NULL, 'SWEETY', 'R', '921024205041@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3774, NULL, 3, '921024205042', '921024205042', NULL, 'SWEETY', 'V', '921024205042@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3775, NULL, 3, '921024205043', '921024205043', NULL, 'THANGA', 'RAJA VARSHINI S', '921024205043@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3776, NULL, 3, '921024205044', '921024205044', NULL, 'THARICK', 'AHAMED A', '921024205044@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3777, NULL, 3, '921024205045', '921024205045', NULL, 'VISHALINI', 'V', '921024205045@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3778, NULL, 3, '921024114001', '921024114001', NULL, 'ABARNA', 'B', '921024114001@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3779, NULL, 3, '921024114002', '921024114002', NULL, 'ABINESH', 'T', '921024114002@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3780, NULL, 3, '921024114003', '921024114003', NULL, 'ABISHEK', 'N', '921024114003@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3781, NULL, 3, '921024114005', '921024114005', NULL, 'BHARATHWAJ', 'G', '921024114005@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3782, NULL, 3, '921024114006', '921024114006', NULL, 'BHUPESH', 'G T', '921024114006@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3783, NULL, 3, '921024114007', '921024114007', NULL, 'CHANDRESHWARAN', 'G', '921024114007@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3784, NULL, 3, '921024114008', '921024114008', NULL, 'DHECHITH', 'J', '921024114008@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3785, NULL, 3, '921024114009', '921024114009', NULL, 'JEEVA', 'R', '921024114009@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3786, NULL, 3, '921024114010', '921024114010', NULL, 'KAVIRANJANI', 'M', '921024114010@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42');
INSERT INTO `student_profile` (`id`, `userId`, `role_id`, `studentId`, `rollNumber`, `admissionNo`, `firstName`, `lastName`, `email`, `phone`, `photo`, `gender`, `departmentId`, `classId`, `batch`, `semester`, `year`, `admissionDate`, `admissionType`, `feeStatus`, `status`, `password`, `createdAt`, `updatedAt`) VALUES
(3787, NULL, 3, '921024114011', '921024114011', NULL, 'LATHIKA', 'R', '921024114011@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3788, NULL, 3, '921024114012', '921024114012', NULL, 'MANOJRAJ', 'R', '921024114012@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3789, NULL, 3, '921024114013', '921024114013', NULL, 'MOHAN', 'RAJ P', '921024114013@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3790, NULL, 3, '921024114014', '921024114014', NULL, 'NAVINRAJ', 'M', '921024114014@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3791, NULL, 3, '921024114015', '921024114015', NULL, 'RAHUL', 'KRISHNA G', '921024114015@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3792, NULL, 3, '921024114016', '921024114016', NULL, 'RANJITH', 'KUMAR K', '921024114016@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3793, NULL, 3, '921024114017', '921024114017', NULL, 'RIYAZ', 'AHAMED S', '921024114017@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3794, NULL, 3, '921024114018', '921024114018', NULL, 'SAKTHIVEL', 'PANDI K', '921024114018@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3795, NULL, 3, '921024114019', '921024114019', NULL, 'SANJAY', 'RAMKUMAR M', '921024114019@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3796, NULL, 3, '921024114020', '921024114020', NULL, 'SANJAY', 'THALAIKUMAR M', '921024114020@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3797, NULL, 3, '921024114021', '921024114021', NULL, 'SANTHOSH', 'M', '921024114021@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3798, NULL, 3, '921024114022', '921024114022', NULL, 'SARATHI', 'S', '921024114022@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3799, NULL, 3, '921024114023', '921024114023', NULL, 'SENTHIL', 'MURUGAN K', '921024114023@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3800, NULL, 3, '921024114024', '921024114024', NULL, 'SIDDHARTHAN', 'E', '921024114024@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3801, NULL, 3, '921024114025', '921024114025', NULL, 'SRINIVASAN', 'R', '921024114025@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3802, NULL, 3, '921024114026', '921024114026', NULL, 'SUDHARSAN', 'S', '921024114026@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3803, NULL, 3, '921024114027', '921024114027', NULL, 'SUMAN', 'KUMAR B', '921024114027@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3804, NULL, 3, '921024114028', '921024114028', NULL, 'VETRIVEL', 'K', '921024114028@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3805, NULL, 3, '921024114029', '921024114029', NULL, 'VIGNESHKUMAR', 'M', '921024114029@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3806, NULL, 3, '921024114030', '921024114030', NULL, 'VISHAL', 'S', '921024114030@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3807, NULL, 3, '921024114031', '921024114031', NULL, 'YOGA', 'ARJUN R S', '921024114031@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3808, NULL, 3, '921024114032', '921024114032', NULL, 'YUVASARAVANAKUMAR', 'P', '921024114032@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3809, NULL, 3, '921024106001', '921024106001', NULL, 'ABARNA', 'A', '921024106001@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3810, NULL, 3, '921024106002', '921024106002', NULL, 'ANU', 'SHREE R', '921024106002@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3811, NULL, 3, '921024106003', '921024106003', NULL, 'ASHWATHIKA', 'G', '921024106003@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3812, NULL, 3, '921024106004', '921024106004', NULL, 'ASWANTHIKA', 'R', '921024106004@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3813, NULL, 3, '921024106005', '921024106005', NULL, 'BHARATHI', 'M', '921024106005@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3814, NULL, 3, '921024106006', '921024106006', NULL, 'BHAVYASRI', 'M', '921024106006@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3815, NULL, 3, '921024106007', '921024106007', NULL, 'BUVANESHWARI', 'K', '921024106007@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3816, NULL, 3, '921024106008', '921024106008', NULL, 'DAKSHITHA', 'R', '921024106008@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3817, NULL, 3, '921024106009', '921024106009', NULL, 'DEEPA', 'S S', '921024106009@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3818, NULL, 3, '921024106010', '921024106010', NULL, 'DEEPAKRAJ', 'S', '921024106010@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3819, NULL, 3, '921024106011', '921024106011', NULL, 'DEEPIKA', 'S', '921024106011@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3820, NULL, 3, '921024106012', '921024106012', NULL, 'DHARSHINI', 'K', '921024106012@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3821, NULL, 3, '921024106013', '921024106013', NULL, 'DHARSHINI', 'PRIYA V', '921024106013@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3822, NULL, 3, '921024106014', '921024106014', NULL, 'DHEJESH', 'KANNAN M', '921024106014@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3823, NULL, 3, '921024106015', '921024106015', NULL, 'DIVYA', 'SHREE S R', '921024106015@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3824, NULL, 3, '921024106016', '921024106016', NULL, 'GIRIVISHNU', 'M', '921024106016@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3825, NULL, 3, '921024106017', '921024106017', NULL, 'GOKILAVANI', 'P', '921024106017@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3826, NULL, 3, '921024106018', '921024106018', NULL, 'GOKUL', 'R', '921024106018@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3827, NULL, 3, '921024106019', '921024106019', NULL, 'GURUPRASATH', 'M', '921024106019@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3828, NULL, 3, '921024106020', '921024106020', NULL, 'HARINANTHASRI', 'S', '921024106020@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3829, NULL, 3, '921024106021', '921024106021', NULL, 'HARSHAVARDHINI', 'P', '921024106021@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3830, NULL, 3, '921024106022', '921024106022', NULL, 'JANANI', 'SRI T', '921024106022@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3831, NULL, 3, '921024106023', '921024106023', NULL, 'JENELIA', 'S', '921024106023@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3832, NULL, 3, '921024106024', '921024106024', NULL, 'KALEP', 'G', '921024106024@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3833, NULL, 3, '921024106025', '921024106025', NULL, 'KAVIYA', 'V', '921024106025@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3834, NULL, 3, '921024106026', '921024106026', NULL, 'KISHORE', 'KANNAN S', '921024106026@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3835, NULL, 3, '921024106027', '921024106027', NULL, 'KUMUTHAVALLI', 'S', '921024106027@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3836, NULL, 3, '921024106028', '921024106028', NULL, 'MUKILAN', 'R', '921024106028@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3837, NULL, 3, '921024106029', '921024106029', NULL, 'NATHISHA', 'R', '921024106029@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3838, NULL, 3, '921024106030', '921024106030', NULL, 'NIMAL', 'K', '921024106030@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3839, NULL, 3, '921024106031', '921024106031', NULL, 'PAVITHRA', 'S', '921024106031@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3840, NULL, 3, '921024106032', '921024106032', NULL, 'POOVITHA', 'M', '921024106032@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3841, NULL, 3, '921024106033', '921024106033', NULL, 'PRADEEPA', 'M', '921024106033@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3842, NULL, 3, '921024106034', '921024106034', NULL, 'PRAVEENA', 'K', '921024106034@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3843, NULL, 3, '921024106035', '921024106035', NULL, 'PRIYANGA', 'S', '921024106035@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3844, NULL, 3, '921024106036', '921024106036', NULL, 'RIDDHI', 'SHREE P', '921024106036@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3845, NULL, 3, '921024106037', '921024106037', NULL, 'RISHI', 'PRIYAN S', '921024106037@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3846, NULL, 3, '921024106038', '921024106038', NULL, 'SAKTHI', 'DHARANI K', '921024106038@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3847, NULL, 3, '921024106039', '921024106039', NULL, 'SARANRAJ', 'M', '921024106039@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3848, NULL, 3, '921024106040', '921024106040', NULL, 'SARMILI', 'SHAKSHI S', '921024106040@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3849, NULL, 3, '921024106041', '921024106041', NULL, 'SRIDHARSHINI', 'S', '921024106041@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3850, NULL, 3, '921024106042', '921024106042', NULL, 'SWATHY', 'G', '921024106042@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3851, NULL, 3, '921024106043', '921024106043', NULL, 'THRISHA', 'B', '921024106043@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3852, NULL, 3, '921024106044', '921024106044', NULL, 'UMA', 'V', '921024106044@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3853, NULL, 3, '921024106045', '921024106045', NULL, 'VISHVA', 'S', '921024106045@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3854, NULL, 3, '921024106701', '921024106701', NULL, 'SRI', 'SHARAN R', '921024106701@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3855, NULL, 3, '921024105001', '921024105001', NULL, 'ANUSRI', 'S', '921024105001@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3856, NULL, 3, '921024105002', '921024105002', NULL, 'DEVA', 'DHARSHINI S', '921024105002@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3857, NULL, 3, '921024105003', '921024105003', NULL, 'DHANUSHKA', 'P', '921024105003@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3858, NULL, 3, '921024105004', '921024105004', NULL, 'DHARANI', 'R', '921024105004@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3859, NULL, 3, '921024105005', '921024105005', NULL, 'DHARNIKA', 'R', '921024105005@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3860, NULL, 3, '921024105006', '921024105006', NULL, 'DHARANISRI', 'K', '921024105006@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3861, NULL, 3, '921024105007', '921024105007', NULL, 'DINESHKUMAR', 'S', '921024105007@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3862, NULL, 3, '921024105008', '921024105008', NULL, 'GAYATHIRI', 'DEVI B', '921024105008@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3863, NULL, 3, '921024105009', '921024105009', NULL, 'ISHANI', 'K', '921024105009@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3864, NULL, 3, '921024105010', '921024105010', NULL, 'ISWARYA', 'S', '921024105010@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3865, NULL, 3, '921024105011', '921024105011', NULL, 'KANISHKA', 'J', '921024105011@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3866, NULL, 3, '921024105013', '921024105013', NULL, 'MOHAMED', 'ANAS K', '921024105013@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3867, NULL, 3, '921024105014', '921024105014', NULL, 'NAGAJOTHI', 'P', '921024105014@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3868, NULL, 3, '921024105015', '921024105015', NULL, 'PANDI', 'SELVI S', '921024105015@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3869, NULL, 3, '921024105016', '921024105016', NULL, 'PRIYA', 'S', '921024105016@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3870, NULL, 3, '921024105017', '921024105017', NULL, 'RAHINI', 'S', '921024105017@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3871, NULL, 3, '921024105018', '921024105018', NULL, 'RAJIYA', 'SULTHANA A', '921024105018@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3872, NULL, 3, '921024105019', '921024105019', NULL, 'RAKESHRAJA', 'R', '921024105019@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3873, NULL, 3, '921024105020', '921024105020', NULL, 'RAMYA', 'S', '921024105020@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3874, NULL, 3, '921024105021', '921024105021', NULL, 'SHAHANA', 'V S', '921024105021@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3875, NULL, 3, '921024105023', '921024105023', NULL, 'SURYAH', 'S', '921024105023@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3876, NULL, 3, '921024105024', '921024105024', NULL, 'TAMILSELVAN', 'P', '921024105024@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3877, NULL, 3, '921024105025', '921024105025', NULL, 'THILAKKUMAR', 'S', '921024105025@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3878, NULL, 3, '921024105026', '921024105026', NULL, 'THIRUMAL', 'SELVAN M', '921024105026@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3879, NULL, 3, '921024105027', '921024105027', NULL, 'VAISHALI', 'S', '921024105027@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3880, NULL, 3, '921024105028', '921024105028', NULL, 'VISHWA', 'R', '921024105028@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3881, NULL, 3, '921024105301', '921024105301', NULL, 'KESAVA', 'PERUMAL T', '921024105301@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3882, NULL, 3, '921024104001', '921024104001', NULL, 'ADHITHIYA', 'S', '921024104001@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3883, NULL, 3, '921024104002', '921024104002', NULL, 'ANGALA', 'DHAN VARSHINI P R', '921024104002@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3884, NULL, 3, '921024104003', '921024104003', NULL, 'ANU', 'VIASHINI M', '921024104003@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3885, NULL, 3, '921024104004', '921024104004', NULL, 'ARCHANA', 'B', '921024104004@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3886, NULL, 3, '921024104005', '921024104005', NULL, 'ASIFA', 'SHEREEN S', '921024104005@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3887, NULL, 3, '921024104006', '921024104006', NULL, 'ASMATH', 'NABILA A', '921024104006@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3888, NULL, 3, '921024104007', '921024104007', NULL, 'CHELLAMUTHUKUMAR', 'P', '921024104007@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3889, NULL, 3, '921024104008', '921024104008', NULL, 'DIYASRI', 'P', '921024104008@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3890, NULL, 3, '921024104009', '921024104009', NULL, 'DURGADEVI', 'V', '921024104009@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3891, NULL, 3, '921024104010', '921024104010', NULL, 'GAYATHRI', 'K', '921024104010@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3892, NULL, 3, '921024104011', '921024104011', NULL, 'GOKULAPRIYAN', 'I', '921024104011@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3893, NULL, 3, '921024104012', '921024104012', NULL, 'HARIDHARSHINI', 'R', '921024104012@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3894, NULL, 3, '921024104013', '921024104013', NULL, 'HARINI', 'M', '921024104013@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3895, NULL, 3, '921024104014', '921024104014', NULL, 'HEMASREE', 'V', '921024104014@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3896, NULL, 3, '921024104015', '921024104015', NULL, 'IRFANA', 'BEGAM A', '921024104015@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3897, NULL, 3, '921024104016', '921024104016', NULL, 'JASON', 'ANTONY J', '921024104016@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3898, NULL, 3, '921024104017', '921024104017', NULL, 'JEEVA', 'DHARSHINI P', '921024104017@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3899, NULL, 3, '921024104018', '921024104018', NULL, 'JEEVITHA', 'SRI K', 'jeevithasrik2006@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3900, NULL, 3, '921024104019', '921024104019', NULL, 'JESLIN', 'SHARON J', '921024104019@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3901, NULL, 3, '921024104020', '921024104020', NULL, 'JOSHUA', 'A', '921024104020@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3902, NULL, 3, '921024104021', '921024104021', NULL, 'KANIPRIYA', 'S', '921024104021@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3903, NULL, 3, '921024104022', '921024104022', NULL, 'KISHO', 'VARMA K', '921024104022@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3904, NULL, 3, '921024104023', '921024104023', NULL, 'LATHIKA', 'KAMATCHI K', '921024104023@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3905, NULL, 3, '921024104024', '921024104024', NULL, 'LIYONAA', 'R', '921024104024@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3906, NULL, 3, '921024104025', '921024104025', NULL, 'MARIMUTHU', 'J', '921024104025@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3907, NULL, 3, '921024104026', '921024104026', NULL, 'MONIKA', 'SRI P', '921024104026@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3908, NULL, 3, '921024104027', '921024104027', NULL, 'MUTHAIYA', 'MURALITHARAN M', '921024104027@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3909, NULL, 3, '921024104028', '921024104028', NULL, 'NIKIL', 'R', '921024104028@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3910, NULL, 3, '921024104029', '921024104029', NULL, 'NITHARSANA', 'M', '921024104029@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3911, NULL, 3, '921024104030', '921024104030', NULL, 'NIVETHA', 'S', '921024104030@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3912, NULL, 3, '921024104031', '921024104031', NULL, 'POOVARASAN', 'L', '921024104031@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3913, NULL, 3, '921024104032', '921024104032', NULL, 'PRASHITHAA', 'J', 'prashilatha1511@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3914, NULL, 3, '921024104034', '921024104034', NULL, 'PRAVEEN', 'KUMAR P', '921024104034@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3915, NULL, 3, '921024104035', '921024104035', NULL, 'RASEETHA', 'PARVEEN M', '921024104035@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3916, NULL, 3, '921024104036', '921024104036', NULL, 'RITHIKA', 'SRI S', '921024104036@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3917, NULL, 3, '921024104037', '921024104037', NULL, 'ROOBA', 'SREE N', '921024104037@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3918, NULL, 3, '921024104038', '921024104038', NULL, 'SABITHA', 'G', '921024104038@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3919, NULL, 3, '921024104039', '921024104039', NULL, 'SAKTHI', 'SRI S', '921024104039@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3920, NULL, 3, '921024104040', '921024104040', NULL, 'SANCHANAA', 'S', '921024104040@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3921, NULL, 3, '921024104041', '921024104041', NULL, 'SANTHOSH', 'KUMAR G', '921024104041@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3922, NULL, 3, '921024104042', '921024104042', NULL, 'SASIPRAVEEN', 'S', 'sasipraveen963@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3923, NULL, 3, '921024104043', '921024104043', NULL, 'SELVAKUMAR', 'V', '921024104043@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3924, NULL, 3, '921024104044', '921024104044', NULL, 'SHAKTHI', 'BHARATHI D T', '921024104044@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3925, NULL, 3, '921024104045', '921024104045', NULL, 'SHALNI', 'V', '921024104045@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3926, NULL, 3, '921024104046', '921024104046', NULL, 'SHASMITHA', 'M', '921024104046@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3927, NULL, 3, '921024104047', '921024104047', NULL, 'SHRIJA', 'M', '921024104047@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3928, NULL, 3, '921024104048', '921024104048', NULL, 'SHYAM', 'RAJ Y', '921024104048@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3929, NULL, 3, '921024104049', '921024104049', NULL, 'SONIADEVI', 'K', '921024104049@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3930, NULL, 3, '921024104050', '921024104050', NULL, 'SUGAPPRIYAN', 'S', '921024104050@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3931, NULL, 3, '921024104051', '921024104051', NULL, 'SUNDARRAJAPERUMAL', 'G', '921024104051@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3932, NULL, 3, '921024104052', '921024104052', NULL, 'UDHAYAPRAKASH', 'S', '921024104052@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3933, NULL, 3, '921024104053', '921024104053', NULL, 'VANITHA', 'R', '921024104053@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3934, NULL, 3, '921024104054', '921024104054', NULL, 'VEDHASREE', 'S', '921024104054@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3935, NULL, 3, '921024104055', '921024104055', NULL, 'YAZHINI', 'M', '921024104055@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3936, NULL, 3, '921024104056', '921024104056', NULL, 'YOHESH', 'K', '921024104056@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3937, NULL, 3, '921024104301', '921024104301', NULL, 'JOTHI', 'RAM K', '921024104301@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3938, NULL, 3, '921024104701', '921024104701', NULL, 'DEETSANYA', 'R', '921024104701@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42');
INSERT INTO `student_profile` (`id`, `userId`, `role_id`, `studentId`, `rollNumber`, `admissionNo`, `firstName`, `lastName`, `email`, `phone`, `photo`, `gender`, `departmentId`, `classId`, `batch`, `semester`, `year`, `admissionDate`, `admissionType`, `feeStatus`, `status`, `password`, `createdAt`, `updatedAt`) VALUES
(3939, NULL, 3, '921024104702', '921024104702', NULL, 'RITHIKA', 'M', '921024104702@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3940, NULL, 3, '921024103001', '921024103001', NULL, 'AKSHAYADEVI', 'R', '921024103001@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3941, NULL, 3, '921024103002', '921024103002', NULL, 'ANBUSUBASHINI', 'A', '921024103002@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3942, NULL, 3, '921024103003', '921024103003', NULL, 'ANBU', 'VASANTHAN S', '921024103003@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3943, NULL, 3, '921024103004', '921024103004', NULL, 'ANGAMA', 'PREMA M', '921024103004@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3944, NULL, 3, '921024103005', '921024103005', NULL, 'ARUNKUMAR', 'N', '921024103005@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3945, NULL, 3, '921024103006', '921024103006', NULL, 'AZHAGARASI', 'P', '921024103006@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3946, NULL, 3, '921024103007', '921024103007', NULL, 'DAVID', 'JOSHWA A', '921024103007@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3947, NULL, 3, '921024103008', '921024103008', NULL, 'DHANYASHRI', 'R', '921024103008@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3948, NULL, 3, '921024103009', '921024103009', NULL, 'GUNASRI', 'P', '921024103009@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3949, NULL, 3, '921024103010', '921024103010', NULL, 'MANIMEGALA', 'P', '921024103010@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3950, NULL, 3, '921024103011', '921024103011', NULL, 'MANOBARATH', 'E', '921024103011@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3951, NULL, 3, '921024103012', '921024103012', NULL, 'MATHUMITHA', 'J', '921024103012@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3952, NULL, 3, '921024103013', '921024103013', NULL, 'MOHANAPRIYA', 'R', '921024103013@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3953, NULL, 3, '921024103014', '921024103014', NULL, 'MUFIN', 'RIYANA T', '921024103014@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3954, NULL, 3, '921024103015', '921024103015', NULL, 'NISANTH', 'M', '921024103015@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3955, NULL, 3, '921024103016', '921024103016', NULL, 'PRADEEP', 'P', '921024103016@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3956, NULL, 3, '921024103017', '921024103017', NULL, 'RUBINI', 'C', '921024103017@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3957, NULL, 3, '921024103018', '921024103018', NULL, 'SANDHIYA', 'N', '921024103018@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3958, NULL, 3, '921024103019', '921024103019', NULL, 'SARANYA', 'M', '921024103019@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3959, NULL, 3, '921024103020', '921024103020', NULL, 'SARAVANAN', 'A', '921024103020@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3960, NULL, 3, '921024103021', '921024103021', NULL, 'SIDDHARTHAN', 'P', '921024103021@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3961, NULL, 3, '921024103022', '921024103022', NULL, 'SIVAKEERTHANA', 'M', '921024103022@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3962, NULL, 3, '921024103023', '921024103023', NULL, 'SRI', 'VAISHNAVI V', '921024103023@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3963, NULL, 3, '921024103024', '921024103024', NULL, 'SUBATHRA', 'S', '921024103024@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3964, NULL, 3, '921024103025', '921024103025', NULL, 'SWETHA', 'S', '921024103025@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3965, NULL, 3, '921024103026', '921024103026', NULL, 'THASLEEMA', 'NISREEN A', '921024103026@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3966, NULL, 3, '921024103301', '921024103301', NULL, 'MAHESHWARI', 'M', '921024103301@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2024-2028', 4, '2', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:46:42'),
(3967, NULL, 3, '921023243001', '921023243001', NULL, 'AJAY', 'PRASATH K', '921023243001@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3968, NULL, 3, '921023243002', '921023243002', NULL, 'ANFIYAA', 'M', '921023243002@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3969, NULL, 3, '921023243004', '921023243004', NULL, 'ASIM', 'FATHIMA P', '921023243004@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3970, NULL, 3, '921023243005', '921023243005', NULL, 'BALAJI', 'B', '921023243005@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3971, NULL, 3, '921023243006', '921023243006', NULL, 'DEVENDRA', 'KUMAR P', '921023243006@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3972, NULL, 3, '921023243007', '921023243007', NULL, 'GOKUL', 'M', '921023243007@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3973, NULL, 3, '921023243008', '921023243008', NULL, 'HARI', 'PRABHA S', '921023243008@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3974, NULL, 3, '921023243009', '921023243009', NULL, 'KAVIYAMAHESHWARI', 'J', '921023243009@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3975, NULL, 3, '921023243010', '921023243010', NULL, 'LOGESH', 'KUMAR R', '921023243010@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3976, NULL, 3, '921023243011', '921023243011', NULL, 'MALARVIZHI', 'S', '921023243011@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3977, NULL, 3, '921023243012', '921023243012', NULL, 'MUTHULAKSHMI', 'P', '921023243012@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3978, NULL, 3, '921023243013', '921023243013', NULL, 'MUTHUMARI', 'M', '921023243013@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3979, NULL, 3, '921023243014', '921023243014', NULL, 'PRITHIKA', 'S', '921023243014@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3980, NULL, 3, '921023243015', '921023243015', NULL, 'RAJAPRABA', 'R', '921023243015@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3981, NULL, 3, '921023243016', '921023243016', NULL, 'RUUBANRAJ', 'R', '921023243016@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3982, NULL, 3, '921023243017', '921023243017', NULL, 'SAFIKUL', 'FARINAZ S', '921023243017@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3983, NULL, 3, '921023243018', '921023243018', NULL, 'SHRIMATHI', 'R', '921023243018@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3984, NULL, 3, '921023243019', '921023243019', NULL, 'SRI', 'HARINI PRIYA S', '921023243019@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3985, NULL, 3, '921023243020', '921023243020', NULL, 'SUSMITHA', 'S', '921023243020@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3986, NULL, 3, '921023243021', '921023243021', NULL, 'VARUNI', 'T', '921023243021@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3987, NULL, 3, '921023243022', '921023243022', NULL, 'VASUKI', 'P', '921023243022@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3988, NULL, 3, '921023243023', '921023243023', NULL, 'VISHALINI', 'K', '921023243023@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3989, NULL, 3, '921023243024', '921023243024', NULL, 'VISHNU', 'PARAMESH B', '921023243024@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3990, NULL, 3, '921023243025', '921023243025', NULL, 'YOGESHKUMAR', 'R', '921023243025@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3991, NULL, 3, '921023243026', '921023243026', NULL, 'YOKESH', 'J', '921023243026@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3992, NULL, 3, '921023243027', '921023243027', NULL, 'YUKTHA', 'S', '921023243027@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 23:17:27'),
(3993, NULL, 3, '921023205001', '921023205001', NULL, 'ABI', 'S', '921023205001@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3994, NULL, 3, '921023205002', '921023205002', NULL, 'ANUDARSHNI', 'A', '921023205002@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3995, NULL, 3, '921023205003', '921023205003', NULL, 'ARCHANA', 'DEVI C', '921023205003@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3996, NULL, 3, '921023205004', '921023205004', NULL, 'DHIVYA', 'DHARSHINI S', '921023205004@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3997, NULL, 3, '921023205005', '921023205005', NULL, 'DIVYASRI', 'P', '921023205005@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3998, NULL, 3, '921023205006', '921023205006', NULL, 'HARINI', 'P', '921023205006@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(3999, NULL, 3, '921023205007', '921023205007', NULL, 'ISMATH', 'FATHIMA J', '921023205007@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4000, NULL, 3, '921023205008', '921023205008', NULL, 'JEBANIKITHA', 'N', '921023205008@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4001, NULL, 3, '921023205009', '921023205009', NULL, 'LOGESHWARI', 'S', '921023205009@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4002, NULL, 3, '921023205010', '921023205010', NULL, 'MONIKA', 'B', '921023205010@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4003, NULL, 3, '921023205011', '921023205011', NULL, 'NAVEENA', 'G', '921023205011@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4004, NULL, 3, '921023205012', '921023205012', NULL, 'NITHYA', 'SRI M', '921023205012@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4005, NULL, 3, '921023205013', '921023205013', NULL, 'NOORUL', 'NAFEELA A', '921023205013@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4006, NULL, 3, '921023205014', '921023205014', NULL, 'PANDIYARAJAN', 'K', '921023205014@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4007, NULL, 3, '921023205015', '921023205015', NULL, 'RISHIKESH', 'K', '921023205015@nscet.org', '9876543210', '/uploads/students/rishikesh_k.jpeg', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4008, NULL, 3, '921023205016', '921023205016', NULL, 'SAFRIN', 'T', '921023205016@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4009, NULL, 3, '921023205017', '921023205017', NULL, 'SAHANA', 'G', '921023205017@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4010, NULL, 3, '921023205018', '921023205018', NULL, 'SHAHANA', 'V', '921023205018@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4011, NULL, 3, '921023205019', '921023205019', NULL, 'SINDHU', 'S', '921023205019@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4012, NULL, 3, '921023205020', '921023205020', NULL, 'SIVAYOGGA', 'K', '921023205020@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4013, NULL, 3, '921023205021', '921023205021', NULL, 'SONI', 'P', '921023205021@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4014, NULL, 3, '921023205022', '921023205022', NULL, 'SOWMIYA', 'K', '921023205022@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4015, NULL, 3, '921023205023', '921023205023', NULL, 'SUJITHA', 'B', '921023205023@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4016, NULL, 3, '921023205024', '921023205024', NULL, 'THANUSHKUMAR', 'P', '921023205024@nscet.org', '9876543210', '/uploads/students/thanushkumar_p.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4017, NULL, 3, '921023205025', '921023205025', NULL, 'VAITHEESHWARI', 'R', '921023205025@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4018, NULL, 3, '921023205026', '921023205026', NULL, 'VANI', 'SRI M', '921023205026@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4019, NULL, 3, '921023205027', '921023205027', NULL, 'YOKESHKUMAR', 'R', '921023205027@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4020, NULL, 3, '921023114001', '921023114001', NULL, 'AJAY', 'D', '921023114001@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4021, NULL, 3, '921023114002', '921023114002', NULL, 'DHIYANESH', 'K', '921023114002@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4022, NULL, 3, '921023114003', '921023114003', NULL, 'HARIRAM', 'R', '921023114003@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4023, NULL, 3, '921023114004', '921023114004', NULL, 'KARUTHAPANDI', 'E', '921023114004@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4024, NULL, 3, '921023114005', '921023114005', NULL, 'PANDEESWARAN', 'B', '921023114005@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4025, NULL, 3, '921023114006', '921023114006', NULL, 'RAJESH', 'KUMAR M', '921023114006@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4026, NULL, 3, '921023114007', '921023114007', NULL, 'SANJAY', 'K', '921023114007@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4027, NULL, 3, '921023114008', '921023114008', NULL, 'SATHISH', 'P', '921023114008@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4028, NULL, 3, '921023114009', '921023114009', NULL, 'YOGESH', 'G', '921023114009@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4029, NULL, 3, '921023114301', '921023114301', NULL, 'DEEPAN', 'RAJ E', '921023114301@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4030, NULL, 3, '921023106001', '921023106001', NULL, 'AATHEESWARAN', 'M', '921023106001@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4031, NULL, 3, '921023106002', '921023106002', NULL, 'ADITHYAN', 'V', '921023106002@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4032, NULL, 3, '921023106003', '921023106003', NULL, 'ANANTHA', 'RAM A', '921023106003@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4033, NULL, 3, '921023106004', '921023106004', NULL, 'ANTON', 'MATTEW A', '921023106004@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4034, NULL, 3, '921023106005', '921023106005', NULL, 'ANUSHASRI', 'D', '921023106005@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4035, NULL, 3, '921023106006', '921023106006', NULL, 'ASHVANI', 'S', '921023106006@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4036, NULL, 3, '921023106007', '921023106007', NULL, 'ATCHAYAKAMALI', 'V', '921023106007@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4037, NULL, 3, '921023106008', '921023106008', NULL, 'DEEPIKA', 'SRI K', '921023106008@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4038, NULL, 3, '921023106009', '921023106009', NULL, 'DEVADHARSHINI', 'K', '921023106009@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4039, NULL, 3, '921023106010', '921023106010', NULL, 'DHANALAKSHMI', 'S', '921023106010@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4040, NULL, 3, '921023106011', '921023106011', NULL, 'DHASHINA', 'S', '921023106011@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4041, NULL, 3, '921023106012', '921023106012', NULL, 'DURGASRI', 'A', '921023106012@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4042, NULL, 3, '921023106014', '921023106014', NULL, 'GOBINATH', 'M', '921023106014@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4043, NULL, 3, '921023106015', '921023106015', NULL, 'GOPIKA', 'M', '921023106015@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4044, NULL, 3, '921023106016', '921023106016', NULL, 'HARIMURUGAN', 'S', '921023106016@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4045, NULL, 3, '921023106018', '921023106018', NULL, 'JEEVANA', 'M', '921023106018@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4046, NULL, 3, '921023106019', '921023106019', NULL, 'JEEVANANDHAM', 'A', '921023106019@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4047, NULL, 3, '921023106020', '921023106020', NULL, 'JEEVETHA', 'P', '921023106020@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4048, NULL, 3, '921023106021', '921023106021', NULL, 'JEYAHARINISHREE', 'R', '921023106021@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4049, NULL, 3, '921023106022', '921023106022', NULL, 'JEYAPRIYA', 'L M', '921023106022@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4050, NULL, 3, '921023106023', '921023106023', NULL, 'JEYASRI', 'K', '921023106023@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4051, NULL, 3, '921023106024', '921023106024', NULL, 'KARTHIK', 'V', '921023106024@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4052, NULL, 3, '921023106025', '921023106025', NULL, 'KARTHIKRAJA', 'V', '921023106025@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4053, NULL, 3, '921023106026', '921023106026', NULL, 'KAVIYA', 'R', '921023106026@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4054, NULL, 3, '921023106027', '921023106027', NULL, 'KIRUTHIKA', 'M', '921023106027@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4055, NULL, 3, '921023106028', '921023106028', NULL, 'MANIKANDAN', 'M', '921023106028@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4056, NULL, 3, '921023106029', '921023106029', NULL, 'MAREESWARI', 'B', '921023106029@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4057, NULL, 3, '921023106030', '921023106030', NULL, 'MOGANA', 'PRIYA M', '921023106030@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4058, NULL, 3, '921023106031', '921023106031', NULL, 'MOHANAMITHRAA', 'M', '921023106031@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4059, NULL, 3, '921023106032', '921023106032', NULL, 'NAGAJOTHI', 'S', '921023106032@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4060, NULL, 3, '921023106033', '921023106033', NULL, 'NAGESHWARAN', 'K', '921023106033@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4061, NULL, 3, '921023106034', '921023106034', NULL, 'NANDHINI', 'R', '921023106034@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4062, NULL, 3, '921023106035', '921023106035', NULL, 'PIRIYA', 'LAXMI E', '921023106035@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4063, NULL, 3, '921023106036', '921023106036', NULL, 'POOJA', 'P', '921023106036@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4064, NULL, 3, '921023106037', '921023106037', NULL, 'RATHEESWARI', 'P', '921023106037@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4065, NULL, 3, '921023106038', '921023106038', NULL, 'RESHMA', 'K', '921023106038@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4066, NULL, 3, '921023106039', '921023106039', NULL, 'SABRIN', 'FATHIMA Z', '921023106039@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4067, NULL, 3, '921023106040', '921023106040', NULL, 'SADHA', 'SRI V', '921023106040@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4068, NULL, 3, '921023106041', '921023106041', NULL, 'SAMEENA', 'BANU P', '921023106041@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4069, NULL, 3, '921023106042', '921023106042', NULL, 'SANKARA', 'NARAYANAN S', '921023106042@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4070, NULL, 3, '921023106043', '921023106043', NULL, 'SANTHIYA', 'G', '921023106043@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4071, NULL, 3, '921023106044', '921023106044', NULL, 'SHARVARI', 'S', '921023106044@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4072, NULL, 3, '921023106045', '921023106045', NULL, 'SRINITHI', 'C', '921023106045@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4073, NULL, 3, '921023106046', '921023106046', NULL, 'SUBASRI', 'M', '921023106046@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4074, NULL, 3, '921023106047', '921023106047', NULL, 'SUGESHRAM', 'R', '921023106047@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4075, NULL, 3, '921023106048', '921023106048', NULL, 'SWATHI', 'K', '921023106048@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4076, NULL, 3, '921023106049', '921023106049', NULL, 'SWETHASREE', 'P', '921023106049@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4077, NULL, 3, '921023106050', '921023106050', NULL, 'VIJAYARAGAVAN', 'C', '921023106050@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4078, NULL, 3, '921023106701', '921023106701', NULL, 'KAVIYA', 'SHREE B', '921023106701@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4079, NULL, 3, '921023105001', '921023105001', NULL, 'AKASH', 'S', '921023105001@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4080, NULL, 3, '921023105003', '921023105003', NULL, 'BOOMIGA', 'M', '921023105003@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4081, NULL, 3, '921023105004', '921023105004', NULL, 'BRINDHA', 'K', '921023105004@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4082, NULL, 3, '921023105006', '921023105006', NULL, 'DARUN', 'KUMAR K', '921023105006@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4083, NULL, 3, '921023105007', '921023105007', NULL, 'DEEPIKALAKSHAYA', 'M', '921023105007@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4084, NULL, 3, '921023105008', '921023105008', NULL, 'DHARUNRAJ', 'K', '921023105008@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4085, NULL, 3, '921023105009', '921023105009', NULL, 'DHARUNYASHREE', 'S', '921023105009@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4086, NULL, 3, '921023105010', '921023105010', NULL, 'GANESHKUMAR', 'K', '921023105010@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4087, NULL, 3, '921023105011', '921023105011', NULL, 'GAYATHRI', 'S', '921023105011@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4088, NULL, 3, '921023105012', '921023105012', NULL, 'GURUPRASATH', 'M', '921023105012@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4089, NULL, 3, '921023105013', '921023105013', NULL, 'HARINA', 'S', '921023105013@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4090, NULL, 3, '921023105014', '921023105014', NULL, 'ISWARYA', 'S', '921023105014@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10');
INSERT INTO `student_profile` (`id`, `userId`, `role_id`, `studentId`, `rollNumber`, `admissionNo`, `firstName`, `lastName`, `email`, `phone`, `photo`, `gender`, `departmentId`, `classId`, `batch`, `semester`, `year`, `admissionDate`, `admissionType`, `feeStatus`, `status`, `password`, `createdAt`, `updatedAt`) VALUES
(4091, NULL, 3, '921023105015', '921023105015', NULL, 'JAYASRI', 'P N', '921023105015@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4092, NULL, 3, '921023105016', '921023105016', NULL, 'KARTHICKRAJAN', 'T', '921023105016@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4093, NULL, 3, '921023105017', '921023105017', NULL, 'KATHIRVELSAMY', 'S', '921023105017@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4094, NULL, 3, '921023105018', '921023105018', NULL, 'KAVIN', 'ASWATH S', '921023105018@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4095, NULL, 3, '921023105019', '921023105019', NULL, 'KRISHNAVENI', 'P', '921023105019@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4096, NULL, 3, '921023105020', '921023105020', NULL, 'MARIMUTHU', 'R', '921023105020@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4097, NULL, 3, '921023105021', '921023105021', NULL, 'MOHAMED', 'NOWFIL A', '921023105021@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4098, NULL, 3, '921023105023', '921023105023', NULL, 'PRIYADHARSHINI', 'S', '921023105023@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4099, NULL, 3, '921023105025', '921023105025', NULL, 'RAJESHWARAN', 'G', '921023105025@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4100, NULL, 3, '921023105027', '921023105027', NULL, 'RIHANA', 'AFRIN A', '921023105027@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4101, NULL, 3, '921023105028', '921023105028', NULL, 'SANTHOSH', 'J', '921023105028@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4102, NULL, 3, '921023105029', '921023105029', NULL, 'SIVASURIYAPRAKASH', 'M', '921023105029@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4103, NULL, 3, '921023105030', '921023105030', NULL, 'SUBARAJASREE', 'M', '921023105030@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4104, NULL, 3, '921023105031', '921023105031', NULL, 'SUBHASINI', 'K', '921023105031@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4105, NULL, 3, '921023105033', '921023105033', NULL, 'VAISHNAVI', 'K', '921023105033@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4106, NULL, 3, '921023105034', '921023105034', NULL, 'VIDHYA', 'SAGAR P', '921023105034@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4107, NULL, 3, '921023105035', '921023105035', NULL, 'VINOTH', 'G', '921023105035@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4108, NULL, 3, '921023105036', '921023105036', NULL, 'YUVARAJ', 'M', '921023105036@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4109, NULL, 3, '921023105037', '921023105037', NULL, 'YUVARAJ', 'P', '921023105037@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4110, NULL, 3, '921023104001', '921023104001', NULL, 'ABI', 'R', '921023104001@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4111, NULL, 3, '921023104002', '921023104002', NULL, 'AHAMED', 'ATHIL KHAN M V', '921023104002@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4112, NULL, 3, '921023104003', '921023104003', NULL, 'AKSHAYA', 'G', '921023104003@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4113, NULL, 3, '921023104004', '921023104004', NULL, 'AKSHAYA', 'R', '921023104004@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4114, NULL, 3, '921023104005', '921023104005', NULL, 'AKSHAYA', 'SHRI K', '921023104005@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4115, NULL, 3, '921023104006', '921023104006', NULL, 'BALA', 'DINESH K', '921023104006@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4116, NULL, 3, '921023104007', '921023104007', NULL, 'BRINDHA', 'A', '921023104007@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4117, NULL, 3, '921023104008', '921023104008', NULL, 'DEEBA', 'DHARSHINIE G K', '921023104008@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4118, NULL, 3, '921023104009', '921023104009', NULL, 'DHANUJA', 'P', '921023104009@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4119, NULL, 3, '921023104010', '921023104010', NULL, 'HARINI', 'M', '921023104010@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4120, NULL, 3, '921023104011', '921023104011', NULL, 'HARINI', 'V', '921023104011@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4121, NULL, 3, '921023104012', '921023104012', NULL, 'HARISHPRAJEETH', 'A S', '921023104012@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4122, NULL, 3, '921023104013', '921023104013', NULL, 'HEMALATHA', 'M', '921023104013@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4123, NULL, 3, '921023104014', '921023104014', NULL, 'INDHUMATHI', 'S', '921023104014@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4124, NULL, 3, '921023104015', '921023104015', NULL, 'JAI', 'RAGUL D', '921023104015@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4125, NULL, 3, '921023104017', '921023104017', NULL, 'KANAGA', 'DURGA M', '921023104017@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4126, NULL, 3, '921023104018', '921023104018', NULL, 'KAVIN', 'PRASHAD A', '921023104018@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4127, NULL, 3, '921023104019', '921023104019', NULL, 'MADHUMITHA', 'D', '921023104019@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4128, NULL, 3, '921023104020', '921023104020', NULL, 'MENIL', 'SRI M', '921023104020@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4129, NULL, 3, '921023104021', '921023104021', NULL, 'MONAA', 'SHREE S', '921023104021@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4130, NULL, 3, '921023104022', '921023104022', NULL, 'MUHESH', 'KANNA M', '921023104022@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4131, NULL, 3, '921023104023', '921023104023', NULL, 'MUZZAMEEL', 'AHAMED S', '921023104023@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4132, NULL, 3, '921023104024', '921023104024', NULL, 'PANDEESWARAN', 'C', '921023104024@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4133, NULL, 3, '921023104025', '921023104025', NULL, 'PHIRAMOTH', 'G K', '921023104025@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4134, NULL, 3, '921023104026', '921023104026', NULL, 'PRAVEEN', 'K C', '921023104026@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4135, NULL, 3, '921023104027', '921023104027', NULL, 'PREETHI', 'S', '921023104027@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4136, NULL, 3, '921023104028', '921023104028', NULL, 'PRIJEETHA', 'C', '921023104028@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4137, NULL, 3, '921023104029', '921023104029', NULL, 'PRIYADHARSHINI', 'M', '921023104029@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4138, NULL, 3, '921023104030', '921023104030', NULL, 'RABIKA', 'BANU A', '921023104030@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4139, NULL, 3, '921023104031', '921023104031', NULL, 'RAGUL', 'S', '921023104031@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4140, NULL, 3, '921023104032', '921023104032', NULL, 'REEMA', 'FATHIMA R', '921023104032@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4141, NULL, 3, '921023104033', '921023104033', NULL, 'RUPIKA', 'M', '921023104033@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4142, NULL, 3, '921023104034', '921023104034', NULL, 'RUTHRADEVI', 'R', '921023104034@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4143, NULL, 3, '921023104035', '921023104035', NULL, 'SAKTHI', 'SUNDAR P', '921023104035@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4144, NULL, 3, '921023104036', '921023104036', NULL, 'SANTHOSHINI', 'K', '921023104036@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4145, NULL, 3, '921023104037', '921023104037', NULL, 'SARAN', 'R', '921023104037@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4146, NULL, 3, '921023104038', '921023104038', NULL, 'SHALINI', 'V', '921023104038@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4147, NULL, 3, '921023104039', '921023104039', NULL, 'SHOBIYA', 'M', '921023104039@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4148, NULL, 3, '921023104040', '921023104040', NULL, 'SRIKARAN', 'G', '921023104040@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4149, NULL, 3, '921023104041', '921023104041', NULL, 'SRI', 'KESAVAN S', '921023104041@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4150, NULL, 3, '921023104042', '921023104042', NULL, 'SUSITHRA', 'J B', '921023104042@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4151, NULL, 3, '921023104043', '921023104043', NULL, 'SUTHEESHNA', 'R', '921023104043@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4152, NULL, 3, '921023104044', '921023104044', NULL, 'THARANEESH', 'G R', '921023104044@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4153, NULL, 3, '921023104045', '921023104045', NULL, 'VARSHINI', 'N S', '921023104045@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4154, NULL, 3, '921023104046', '921023104046', NULL, 'VASUTHA', 'T', '921023104046@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4155, NULL, 3, '921023104047', '921023104047', NULL, 'YUVA', 'PRIYA V', '921023104047@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4156, NULL, 3, '921023104048', '921023104048', NULL, 'YUVA', 'SHREE M', '921023104048@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4157, NULL, 3, '921023104301', '921023104301', NULL, 'RISHI', 'B', '921023104301@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10'),
(4158, NULL, 3, '921023104701', '921023104701', NULL, 'KAVIYA', 'P', '921023104701@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2023-2027', 6, '3', '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-03-05 11:47:10');

-- --------------------------------------------------------

--
-- Table structure for table `student_projects`
--

CREATE TABLE `student_projects` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL COMMENT 'FK → students.id',
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL COMMENT 'e.g. Frontend Developer, Team Lead',
  `techStack` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of technology strings' CHECK (json_valid(`techStack`)),
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL COMMENT 'Null = ongoing',
  `demoUrl` varchar(500) DEFAULT NULL,
  `repoUrl` varchar(500) DEFAULT NULL,
  `status` enum('in-progress','completed','planned','paused') DEFAULT 'in-progress' COMMENT 'Matches frontend values',
  `approvalStatus` enum('pending','approved','rejected') DEFAULT 'pending',
  `approvedById` int(11) DEFAULT NULL COMMENT 'FK → users.id',
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
  `studentId` int(11) NOT NULL COMMENT 'FK → students.id',
  `name` varchar(100) NOT NULL COMMENT 'Sport name e.g. Football, Basketball',
  `category` enum('Team Sports','Individual Sports','Aquatics','Combat Sports','Other') NOT NULL DEFAULT 'Other',
  `joinedDate` date NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `achievements` varchar(500) DEFAULT NULL COMMENT 'e.g. Winner, Runner-up, Participation',
  `level` enum('college','district','state','national','international') NOT NULL DEFAULT 'college',
  `documentUrl` varchar(500) DEFAULT NULL COMMENT 'Certificate/proof URL',
  `approvalStatus` enum('pending','approved','rejected') DEFAULT 'pending',
  `approvedById` int(11) DEFAULT NULL COMMENT 'FK → users.id',
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
  `semester` tinyint(2) NOT NULL COMMENT '1-8 semesters',
  `sem_type` enum('odd','even') NOT NULL DEFAULT 'odd',
  `class_id` int(11) DEFAULT NULL,
  `credits` decimal(4,2) NOT NULL DEFAULT 4.00,
  `type` enum('Theory','Practical','Theory+Practical','Project','Seminar','Internship') NOT NULL DEFAULT 'Theory',
  `is_elective` tinyint(1) NOT NULL DEFAULT 0,
  `is_laboratory` tinyint(1) NOT NULL DEFAULT 0,
  `min_hours_per_week` int(11) DEFAULT 3,
  `max_students` int(11) DEFAULT NULL,
  `status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
  `created_by` int(11) DEFAULT 1 COMMENT 'Department admin who created',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `subject_code`, `subject_name`, `description`, `department_id`, `semester`, `sem_type`, `class_id`, `credits`, `type`, `is_elective`, `is_laboratory`, `min_hours_per_week`, `max_students`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(7, 'ME101', 'Engineering Mechanics', 'Statics and Dynamics', 3, 1, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-24 02:39:16', '2026-02-24 02:39:16'),
(8, 'ME102', 'Thermodynamics', 'Laws of thermodynamics and applications', 3, 2, 'odd', NULL, 3.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-24 02:39:16', '2026-02-24 02:39:16'),
(9, 'cs9210', 'c proramming', '', 6, 1, 'odd', NULL, 4.00, 'Theory+Practical', 1, 0, 3, NULL, 'active', 109, '2026-02-25 09:22:53', '2026-02-25 09:22:53'),
(10, 'CS9584', 'C PROGRAMMING', '', 1, 1, 'even', NULL, 4.00, 'Theory', 0, 1, 3, NULL, 'active', 109, '2026-02-25 09:24:39', '2026-02-25 16:28:12'),
(11, 'CSE101', 'Introduction to Programming', NULL, 1, 1, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(12, 'CSE102', 'Data Structures', NULL, 1, 1, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(13, 'CSE103', 'Digital Logic Design', NULL, 1, 1, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(14, 'CSE104', 'Web Development Basics', NULL, 1, 2, 'even', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(15, 'CSE105', 'Database Management Systems', NULL, 1, 2, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(16, 'CSE106', 'Operating Systems', NULL, 1, 3, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(17, 'CSE107', 'Computer Networks', NULL, 1, 3, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(18, 'CSE108', 'Software Engineering', NULL, 1, 4, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(19, 'CSE109', 'Algorithms and Complexity', NULL, 1, 4, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(20, 'CSE110', 'Artificial Intelligence', NULL, 1, 5, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(21, 'ECE101', 'Circuit Theory', NULL, 2, 1, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(22, 'ECE102', 'Electronic Devices and Circuits', NULL, 2, 1, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(23, 'ECE103', 'Digital Electronics', NULL, 2, 2, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(24, 'ECE104', 'Signals and Systems', NULL, 2, 2, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(25, 'ECE105', 'Electromagnetic Theory', NULL, 2, 3, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(26, 'ECE106', 'Microprocessors and Microcontrollers', NULL, 2, 3, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(27, 'ECE107', 'Communication Systems', NULL, 2, 4, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(28, 'ECE108', 'Control Systems', NULL, 2, 4, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(29, 'ECE109', 'Power Systems', NULL, 2, 5, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(30, 'ECE110', 'VLSI Design', NULL, 2, 5, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(31, 'ME103', 'Thermodynamics', NULL, 3, 2, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(32, 'ME104', 'Fluid Mechanics', NULL, 3, 2, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(33, 'ME105', 'Manufacturing Processes', NULL, 3, 3, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(34, 'ME106', 'Heat Transfer', NULL, 3, 3, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(35, 'ME107', 'Machine Design', NULL, 3, 4, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(36, 'ME108', 'Dynamics of Machinery', NULL, 3, 4, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(37, 'ME109', 'Power Plant Engineering', NULL, 3, 5, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(38, 'ME110', 'Automobile Engineering', NULL, 3, 5, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(39, 'CE101', 'Surveying', NULL, 4, 1, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(40, 'CE102', 'Engineering Geology', NULL, 4, 1, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(41, 'CE103', 'Structural Analysis', NULL, 4, 2, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(42, 'CE104', 'Hydraulics and Fluid Mechanics', NULL, 4, 2, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(43, 'CE105', 'Geotechnical Engineering', NULL, 4, 3, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(44, 'CE106', 'Water Resources Engineering', NULL, 4, 3, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(45, 'CE107', 'RCC Design', NULL, 4, 4, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(46, 'CE108', 'Steel Design', NULL, 4, 4, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(47, 'CE109', 'Transportation Engineering', NULL, 4, 5, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(48, 'CE110', 'Environmental Engineering', NULL, 4, 5, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(49, 'EEE101', 'Basic Electrical Engineering', NULL, 5, 1, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(50, 'EEE102', 'AC and DC Circuits', NULL, 5, 1, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(51, 'EEE103', 'Electromagnetic Induction', NULL, 5, 2, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(52, 'EEE104', 'Electrical Machines', NULL, 5, 2, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(53, 'EEE105', 'Power Systems', NULL, 5, 3, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(54, 'EEE106', 'Power Generation', NULL, 5, 3, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(55, 'EEE107', 'High Voltage Engineering', NULL, 5, 4, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(56, 'EEE108', 'Power Distribution', NULL, 5, 4, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(57, 'EEE109', 'Industrial Drives', NULL, 5, 5, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(58, 'EEE110', 'Smart Grid Technology', NULL, 5, 5, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(59, 'IT101', 'Introduction to IT', NULL, 6, 1, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(60, 'IT102', 'Programming Languages', NULL, 6, 1, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(61, 'IT103', 'Web Technologies', NULL, 6, 2, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(62, 'IT104', 'Database Systems', NULL, 6, 2, 'even', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(63, 'IT105', 'Cloud Computing', NULL, 6, 3, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(64, 'IT106', 'Network Security', NULL, 6, 3, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(65, 'IT107', 'Data Analytics', NULL, 6, 4, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(66, 'IT108', 'Machine Learning', NULL, 6, 4, 'even', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(67, 'IT109', 'Mobile Application Development', NULL, 6, 5, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(68, 'IT110', 'IT Project Management', NULL, 6, 5, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(69, 'CHE101', 'Physical Chemistry', NULL, 7, 1, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(70, 'CHE102', 'Organic Chemistry', NULL, 7, 1, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(71, 'CHE103', 'Inorganic Chemistry', NULL, 7, 2, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(72, 'CHE104', 'Analytical Chemistry', NULL, 7, 2, 'even', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(73, 'CHE105', 'Chemical Engineering Fundamentals', NULL, 7, 3, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(74, 'CHE106', 'Process Engineering', NULL, 7, 3, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(75, 'CHE107', 'Industrial Chemistry', NULL, 7, 4, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(76, 'CHE108', 'Polymer Science', NULL, 7, 4, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(77, 'CHE109', 'Environmental Chemistry', NULL, 7, 5, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(78, 'CHE110', 'Biochemistry', NULL, 7, 5, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(79, 'PHY101', 'Classical Mechanics', NULL, 10, 1, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(80, 'PHY102', 'Thermodynamics', NULL, 10, 1, 'odd', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(81, 'PHY103', 'Waves and Oscillations', NULL, 10, 2, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(82, 'PHY104', 'Optics', NULL, 10, 2, 'even', NULL, 4.00, 'Theory+Practical', 0, 1, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(83, 'PHY105', 'Electricity and Magnetism', NULL, 10, 3, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(84, 'PHY106', 'Modern Physics', NULL, 10, 3, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(85, 'PHY107', 'Quantum Mechanics', NULL, 10, 4, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(86, 'PHY108', 'Solid State Physics', NULL, 10, 4, 'even', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(87, 'PHY109', 'Astrophysics', NULL, 10, 5, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50'),
(88, 'PHY110', 'Nuclear Physics', NULL, 10, 5, 'odd', NULL, 4.00, 'Theory', 0, 0, 3, NULL, 'active', 1, '2026-02-25 16:42:50', '2026-02-25 16:42:50');

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

-- --------------------------------------------------------

--
-- Table structure for table `timetable`
--

CREATE TABLE `timetable` (
  `id` int(11) NOT NULL,
  `facultyId` varchar(50) NOT NULL,
  `facultyName` varchar(100) NOT NULL,
  `department` varchar(100) NOT NULL,
  `year` varchar(20) NOT NULL,
  `section` varchar(10) NOT NULL,
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `hour` int(11) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `academicYear` varchar(20) NOT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `timetable`
--

INSERT INTO `timetable` (`id`, `facultyId`, `facultyName`, `department`, `year`, `section`, `day`, `hour`, `subject`, `academicYear`, `createdAt`, `updatedAt`) VALUES
(101, 'NS20T35', 'ABIRAMI KAYATHIRI S', 'CSE', '2', 'A', 'Monday', 2, 'Database Systems', '2026-2027', '2026-03-04 05:13:34', '2026-03-04 05:13:34'),
(136, 'CS12', 'Dr.MATHALAI RAJ. J', 'CSE', '3', 'A', 'Monday', 1, 'Data Structures', '2026-2027', '2026-03-04 09:39:21', '2026-03-04 09:39:21'),
(137, 'CS12', 'Dr.MATHALAI RAJ. J', 'CSE', '3', 'A', 'Monday', 6, 'Data Structures', '2026-2027', '2026-03-04 09:39:21', '2026-03-04 09:39:21'),
(138, 'NS20T41', 'ANUSUYA V', 'CSE', '1', 'B', 'Tuesday', 3, 'Programming in C', '2026-2027', '2026-03-04 09:39:21', '2026-03-04 09:39:21'),
(139, 'CS12', 'Dr.MATHALAI RAJ. J', 'CSE', '3', 'A', 'Wednesday', 4, 'Machine Learning', '2026-2027', '2026-03-04 09:39:21', '2026-03-04 09:39:21'),
(140, 'NS20T25', 'VELKUMAR K', 'CSE', '3', 'B', 'Thursday', 5, 'Operating Systems', '2026-2027', '2026-03-04 09:39:21', '2026-03-04 09:39:21'),
(141, 'NS20T33', 'DEEPIGA K', 'CSE', '2', 'B', 'Friday', 1, 'Computer Networks', '2026-2027', '2026-03-04 09:39:21', '2026-03-04 09:39:21'),
(142, 'NS20T40', 'VENKATALAKSHMI M', 'CSE', '1', 'A', 'Monday', 3, 'Mathematics I', '2026-2027', '2026-03-04 09:39:21', '2026-03-04 09:39:21'),
(143, 'NS20T29', 'ARCHANA R', 'CSE', '3', 'A', 'Tuesday', 4, 'Software Engineering', '2026-2027', '2026-03-04 09:39:21', '2026-03-04 09:39:21'),
(144, 'NS70T01', 'DR.M SATHYA', 'CSE', '4', 'B', 'Thursday', 2, 'Artificial Intelligence', '2026-2027', '2026-03-04 09:39:21', '2026-03-04 09:39:21'),
(145, 'NS40T23', 'GOWTHAMI P', 'ECE', '3', 'A', 'Monday', 2, 'Embedded Systems and IoT', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(146, 'NS80T01', 'NAGAJOTHI P', 'AI&DS', '3', 'A', 'Monday', 3, 'Digital Marketing', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(147, 'NS60T15', 'MALLIKARJUN B', 'AI&DS', '3', 'A', 'Monday', 4, 'Graph Theory', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(148, 'NS20T32', 'VINOTH KUMAR J J', 'AI&DS', '3', 'A', 'Monday', 5, 'App Development', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(149, 'NS80T01', 'NAGAJOTHI P', 'AI&DS', '3', 'A', 'Monday', 6, 'Digital Marketing', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(150, 'NS20T32', 'VINOTH KUMAR J J', 'AI&DS', '3', 'A', 'Monday', 7, 'App Development', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(151, 'NS20T32', 'VINOTH KUMAR J J', 'AI&DS', '3', 'A', 'Tuesday', 1, 'App Development Laboratory', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(152, 'NS20T32', 'VINOTH KUMAR J J', 'AI&DS', '3', 'A', 'Tuesday', 2, 'App Development Laboratory', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(153, 'NS60T15', 'MALLIKARJUN B', 'AI&DS', '3', 'A', 'Tuesday', 3, 'Graph Theory', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(154, 'NS40T23', 'GOWTHAMI P', 'ECE', '3', 'A', 'Tuesday', 4, 'Embedded Systems and IoT Laboratory', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(155, 'NS40T23', 'GOWTHAMI P', 'ECE', '3', 'A', 'Tuesday', 5, 'Embedded Systems and IoT Laboratory', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(156, 'CS10', 'VIGNESH.L.S', 'AI&DS', '3', 'A', 'Tuesday', 6, 'Principles of Programming Languages', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(157, 'NS40T23', 'GOWTHAMI P', 'ECE', '3', 'A', 'Wednesday', 1, 'Embedded Systems and IoT', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(158, 'NS20T32', 'VINOTH KUMAR J J', 'AI&DS', '3', 'A', 'Wednesday', 2, 'App Development', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(159, 'NS60T15', 'MALLIYA SAMMY', 'AI&DS', '3', 'A', 'Wednesday', 3, 'Graph Theory', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 23:28:10'),
(160, 'CS10', 'VIGNESH.L.S', 'AI&DS', '3', 'A', 'Wednesday', 4, 'Principles of Programming Languages', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(161, 'NS80T01', 'NAGAJOTHI P', 'AI&DS', '3', 'A', 'Thursday', 1, 'Digital Marketing', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(162, 'CS10', 'VIGNESH.L.S', 'AI&DS', '3', 'A', 'Thursday', 2, 'Principles of Programming Languages', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(163, 'NS40T23', 'GOWTHAMI P', 'ECE', '3', 'A', 'Thursday', 3, 'Embedded Systems and IoT', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(164, 'NS20T32', 'VINOTH KUMAR J J', 'AI&DS', '3', 'A', 'Thursday', 4, 'App Development', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(165, 'NS60T15', 'MALLIKARJUN B', 'AI&DS', '3', 'A', 'Thursday', 5, 'Graph Theory', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(166, 'NS80T01', 'NAGAJOTHI P', 'AI&DS', '3', 'A', 'Thursday', 6, 'Digital Marketing Laboratory', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(167, 'NS80T01', 'NAGAJOTHI P', 'AI&DS', '3', 'A', 'Thursday', 7, 'Digital Marketing Laboratory', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(168, 'NS60T15', 'MALLIKARJUN B', 'AI&DS', '3', 'A', 'Saturday', 1, 'Graph Theory', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(169, 'CS10', 'VIGNESH.L.S', 'AI&DS', '3', 'A', 'Saturday', 2, 'Principles of Programming Languages', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(170, 'NS40T23', 'GOWTHAMI P', 'ECE', '3', 'A', 'Saturday', 3, 'Embedded Systems and IoT', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(171, 'NS20T32', 'VINOTH KUMAR J J', 'AI&DS', '3', 'A', 'Saturday', 4, 'App Development', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39'),
(172, 'NS80T01', 'NAGAJOTHI P', 'AI&DS', '3', 'A', 'Saturday', 5, 'Digital Marketing', '2025-2026', '2026-03-05 11:04:39', '2026-03-05 11:04:39');

-- --------------------------------------------------------

--
-- Table structure for table `timetable_master`
--

CREATE TABLE `timetable_master` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `semester` enum('odd','even') NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `year` enum('1st','2nd','3rd','4th') DEFAULT NULL,
  `timetable_incharge_id` int(11) DEFAULT NULL,
  `status` enum('draft','pending_approval','active','inactive') DEFAULT 'draft',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Table structure for table `timetable_periods`
--

CREATE TABLE `timetable_periods` (
  `id` int(11) NOT NULL,
  `timetable_master_id` int(11) NOT NULL,
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `period_number` int(11) NOT NULL COMMENT 'Period number (1-7)',
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `is_break` tinyint(1) DEFAULT 0,
  `break_type` enum('short','lunch') DEFAULT NULL,
  `faculty_college_code` varchar(50) DEFAULT NULL,
  `subject_code` varchar(50) DEFAULT NULL,
  `year` enum('1st','2nd','3rd','4th') DEFAULT NULL,
  `section` varchar(10) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `lab_id` int(11) DEFAULT NULL,
  `is_lab_session` tinyint(1) DEFAULT 0,
  `session_type` enum('theory','lab','tutorial') DEFAULT 'theory',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

--
-- Dumping data for table `timetable_slots`
--

INSERT INTO `timetable_slots` (`id`, `timetable_id`, `day`, `period_number`, `start_time`, `end_time`, `subject_id`, `faculty_id`, `class_id`, `room`, `type`, `status`, `created_at`, `updated_at`) VALUES
(31, 4, 'Monday', 1, '09:00:00', '10:00:00', 7, 360, NULL, 'Room 304', 'lecture', 'active', '2026-03-02 09:51:26', '2026-03-02 09:51:26'),
(32, 4, 'Tuesday', 2, '10:00:00', '11:00:00', 8, 360, NULL, 'Room 305', 'lecture', 'active', '2026-03-02 09:51:26', '2026-03-02 09:51:26'),
(33, 4, 'Wednesday', 3, '09:00:00', '10:00:00', 9, 360, NULL, 'Room 306', 'lecture', 'active', '2026-03-02 09:51:26', '2026-03-02 09:51:26'),
(34, 4, 'Thursday', 4, '11:00:00', '12:00:00', 10, 360, NULL, 'Room 307', 'lecture', 'active', '2026-03-02 09:51:26', '2026-03-02 09:51:26'),
(35, 4, 'Friday', 5, '10:00:00', '11:00:00', 11, 360, NULL, 'Room 308', 'lecture', 'active', '2026-03-02 09:51:26', '2026-03-02 09:51:26'),
(36, 4, 'Saturday', 6, '09:00:00', '10:00:00', 12, 360, NULL, 'Room 309', 'lecture', 'active', '2026-03-02 09:51:26', '2026-03-02 09:51:26');

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
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role_id`, `phone`, `isActive`, `createdAt`, `updatedAt`, `avatar`, `department_id`) VALUES
(2, 'mathalai sundaram', 'executive@nscet.org', '$2a$10$ELjprebdIeb3GTTMKk1oZujDrXZ2g8P41gNfiqVwVCKiflkwpO1eu', 3, '9876543211', 1, '0000-00-00 00:00:00', '2026-02-20 05:08:42', NULL, NULL),
(3, 'Academic Admin', 'academic@nscet.org', '$2a$10$rtVcTSxhiJKb4Cm3GdJWTety1jN8MAbcweTMHTRw2TQOE79tziyEq', 4, '9876543212', 1, '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL, NULL),
(109, 'Super admin', 'nscetadmin@gmail.com', '$2a$10$ELjprebdIeb3GTTMKk1oZujDrXZ2g8P41gNfiqVwVCKiflkwpO1eu', 2, '9876543210', 1, '2026-02-20 05:39:02', '2026-02-20 05:39:02', NULL, NULL),
(112, 'Test Admin', 'testadmin@nscet.org', '$2a$10$ELjprebdIeb3GTTMKk1oZujDrXZ2g8P41gNfiqVwVCKiflkwpO1eu', 1, '9876543210', 1, '2026-02-20 06:24:50', '2026-02-20 06:24:50', NULL, NULL),
(116, 'Thanush Kumar', 'ThanushKumarematix@gmail.com', '$2a$10$AWl/01cpXoK7MToiH3DS6.vwqn/v3kK8aEIqmkQngkg1j8.pJdTb.', 5, NULL, 1, '2026-02-28 09:14:14', '2026-02-28 09:14:14', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `year_break_timings`
--

CREATE TABLE `year_break_timings` (
  `id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `year_group` enum('year_1','year_2','year_3_4') DEFAULT NULL,
  `year` enum('1st','2nd','3rd','4th') NOT NULL,
  `break_number` int(11) DEFAULT NULL,
  `period_after` int(11) DEFAULT NULL,
  `break_name` varchar(100) NOT NULL,
  `break_type` enum('short','lunch') DEFAULT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `year_break_timings`
--

INSERT INTO `year_break_timings` (`id`, `department_id`, `year_group`, `year`, `break_number`, `period_after`, `break_name`, `break_type`, `start_time`, `end_time`, `duration_minutes`, `createdAt`, `updatedAt`) VALUES
(1, 0, NULL, '1st', NULL, NULL, 'Tea Break', NULL, '10:40:00', '11:10:00', 30, '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(2, 0, NULL, '1st', NULL, NULL, 'Lunch Break', NULL, '12:50:00', '13:30:00', 40, '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(3, 0, NULL, '2nd', NULL, NULL, 'Tea Break', NULL, '10:40:00', '11:10:00', 30, '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(4, 0, NULL, '2nd', NULL, NULL, 'Lunch Break', NULL, '12:50:00', '13:30:00', 40, '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(5, 0, NULL, '3rd', NULL, NULL, 'Tea Break', NULL, '10:40:00', '11:00:00', 20, '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(6, 0, NULL, '3rd', NULL, NULL, 'Lunch Break', NULL, '12:50:00', '13:20:00', 30, '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(7, 0, NULL, '4th', NULL, NULL, 'Tea Break', NULL, '10:40:00', '11:00:00', 20, '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(8, 0, NULL, '4th', NULL, NULL, 'Lunch Break', NULL, '12:50:00', '13:20:00', 30, '2026-02-25 18:01:10', '2026-02-25 18:01:10');

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
  ADD KEY `idx_announcements_priority` (`priority`),
  ADD KEY `idx_announcements_department` (`department`),
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
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_faculty_id` (`faculty_id`),
  ADD KEY `idx_class_id` (`class_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `faculty_events`
--
ALTER TABLE `faculty_events`
  ADD UNIQUE KEY `event_id` (`event_id`),
  ADD KEY `idx_faculty_id` (`faculty_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_event_date` (`event_date`),
  ADD KEY `idx_faculty_id_fk` (`faculty_id`);

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
  ADD KEY `idx_date_range` (`from_date`,`to_date`);

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
  ADD KEY `fk_department` (`department_id`),
  ADD KEY `idx_timetable_incharge` (`is_timetable_incharge`),
  ADD KEY `idx_placement_coordinator` (`is_placement_coordinator`);

--
-- Indexes for table `faculty_research`
--
ALTER TABLE `faculty_research`
  ADD PRIMARY KEY (`research_id`),
  ADD UNIQUE KEY `research_id_2` (`research_id`),
  ADD UNIQUE KEY `research_id` (`ORCID_ID`),
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
  ADD KEY `status` (`status`);

--
-- Indexes for table `faculy_edu_qualification`
--
ALTER TABLE `faculy_edu_qualification`
  ADD UNIQUE KEY `membership_id` (`membership_id`),
  ADD KEY `idx_faculty_id` (`faculty_id`);

--
-- Indexes for table `labs`
--
ALTER TABLE `labs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lab_code` (`lab_code`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `lab_incharge_id` (`lab_incharge_id`);

--
-- Indexes for table `leaves`
--
ALTER TABLE `leaves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_applicantId` (`applicantId`),
  ADD KEY `idx_departmentId` (`departmentId`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_leaveType` (`leaveType`),
  ADD KEY `idx_startDate` (`startDate`),
  ADD KEY `idx_endDate` (`endDate`);

--
-- Indexes for table `leave_balance`
--
ALTER TABLE `leave_balance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_year` (`userId`,`academicYear`),
  ADD KEY `idx_userId` (`userId`);

--
-- Indexes for table `leave_notifications`
--
ALTER TABLE `leave_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recipient` (`recipientId`,`recipientType`),
  ADD KEY `idx_department` (`departmentId`,`recipientType`),
  ADD KEY `idx_leave` (`leaveId`);

--
-- Indexes for table `period_config`
--
ALTER TABLE `period_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_period_dept` (`department_id`,`period_number`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_number` (`room_number`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `staff_attendance_entry`
--
ALTER TABLE `staff_attendance_entry`
  ADD PRIMARY KEY (`staff_attendance_id`),
  ADD UNIQUE KEY `uq_staff_date_period` (`staff_id`,`work_date`,`period_session_number`),
  ADD KEY `idx_stf_att_staff_id` (`staff_id`),
  ADD KEY `idx_stf_att_department_id` (`department_id`),
  ADD KEY `idx_stf_att_work_date` (`work_date`),
  ADD KEY `idx_stf_att_status` (`attendance_status`);

--
-- Indexes for table `staff_leave_approval`
--
ALTER TABLE `staff_leave_approval`
  ADD PRIMARY KEY (`staff_approval_id`),
  ADD UNIQUE KEY `uq_staff_leave_approval_level` (`staff_leave_id`,`approval_level`),
  ADD KEY `idx_stf_lappr_leave_id` (`staff_leave_id`),
  ADD KEY `idx_stf_lappr_approver_id` (`approver_id`),
  ADD KEY `idx_stf_lappr_level` (`approval_level`);

--
-- Indexes for table `staff_leave_balance`
--
ALTER TABLE `staff_leave_balance`
  ADD PRIMARY KEY (`balance_id`),
  ADD UNIQUE KEY `uq_staff_leave_type` (`staff_id`,`leave_type`),
  ADD KEY `idx_stf_bal_staff_id` (`staff_id`),
  ADD KEY `idx_stf_bal_leave_type` (`leave_type`);

--
-- Indexes for table `staff_leave_request`
--
ALTER TABLE `staff_leave_request`
  ADD PRIMARY KEY (`staff_leave_id`),
  ADD KEY `idx_stf_lreq_staff_id` (`staff_id`),
  ADD KEY `idx_stf_lreq_leave_type` (`leave_type`),
  ADD KEY `idx_stf_lreq_leave_status` (`leave_status`),
  ADD KEY `idx_stf_lreq_start_date` (`start_date`);

--
-- Indexes for table `student_attendance_entry`
--
ALTER TABLE `student_attendance_entry`
  ADD PRIMARY KEY (`attendance_id`),
  ADD UNIQUE KEY `uq_student_date_period` (`student_id`,`subject_id`,`class_date`,`period_session_number`),
  ADD KEY `idx_stu_att_student_id` (`student_id`),
  ADD KEY `idx_stu_att_subject_id` (`subject_id`),
  ADD KEY `idx_stu_att_class_section_id` (`class_section_id`),
  ADD KEY `idx_stu_att_faculty_id` (`faculty_id`),
  ADD KEY `idx_stu_att_class_date` (`class_date`),
  ADD KEY `idx_stu_att_status` (`attendance_status`);

--
-- Indexes for table `student_bio`
--
ALTER TABLE `student_bio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_students1_studentId` (`studentId`);

--
-- Indexes for table `student_certifications`
--
ALTER TABLE `student_certifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`studentId`),
  ADD KEY `idx_student_approval` (`studentId`,`approvalStatus`),
  ADD KEY `fk_cert_approver` (`approvedById`);

--
-- Indexes for table `student_events`
--
ALTER TABLE `student_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`studentId`),
  ADD KEY `idx_student_type` (`studentId`,`eventType`),
  ADD KEY `idx_student_approval` (`studentId`,`approvalStatus`),
  ADD KEY `fk_event_approver` (`approvedById`);

--
-- Indexes for table `student_internal_marks`
--
ALTER TABLE `student_internal_marks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_subject_sem_year_int` (`studentId`,`subjectId`,`semester`,`academicYear`,`internalNumber`),
  ADD KEY `idx_student_sem_int` (`studentId`,`semester`,`internalNumber`),
  ADD KEY `idx_subject_semester` (`subjectId`,`semester`);

--
-- Indexes for table `student_leaves`
--
ALTER TABLE `student_leaves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`studentId`),
  ADD KEY `idx_student_status` (`studentId`,`status`),
  ADD KEY `fk_leave_approver` (`approvedById`);

--
-- Indexes for table `student_marks`
--
ALTER TABLE `student_marks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_subject_sem_year` (`studentId`,`subjectId`,`semester`,`academicYear`),
  ADD KEY `idx_student_semester` (`studentId`,`semester`),
  ADD KEY `idx_subject_semester` (`subjectId`,`semester`);

--
-- Indexes for table `student_notifications`
--
ALTER TABLE `student_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`studentId`),
  ADD KEY `idx_student_read` (`studentId`,`isRead`),
  ADD KEY `idx_student_type` (`studentId`,`type`),
  ADD KEY `idx_student_priority` (`studentId`,`priority`);

--
-- Indexes for table `student_profile`
--
ALTER TABLE `student_profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_studentId` (`studentId`),
  ADD UNIQUE KEY `uq_email` (`email`),
  ADD KEY `fk_student_user` (`userId`),
  ADD KEY `idx_student_role` (`role_id`),
  ADD KEY `fk_student_department` (`departmentId`),
  ADD KEY `idx_student_class` (`classId`),
  ADD KEY `idx_student_batch_sem` (`batch`,`semester`);

--
-- Indexes for table `student_projects`
--
ALTER TABLE `student_projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`studentId`),
  ADD KEY `idx_student_status` (`studentId`,`status`),
  ADD KEY `idx_student_approval` (`studentId`,`approvalStatus`),
  ADD KEY `fk_proj_approver` (`approvedById`);

--
-- Indexes for table `student_sports`
--
ALTER TABLE `student_sports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`studentId`),
  ADD KEY `idx_student_status` (`studentId`,`status`),
  ADD KEY `idx_student_approval` (`studentId`,`approvalStatus`),
  ADD KEY `fk_sport_approver` (`approvedById`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subject_code` (`subject_code`),
  ADD KEY `idx_subject_code` (`subject_code`),
  ADD KEY `idx_subject_dept` (`department_id`),
  ADD KEY `idx_subject_semester` (`semester`),
  ADD KEY `idx_subject_class` (`class_id`),
  ADD KEY `idx_subject_status` (`status`),
  ADD KEY `idx_sem_type` (`sem_type`),
  ADD KEY `idx_dept_sem` (`department_id`,`semester`,`sem_type`);

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
-- Indexes for table `timetable`
--
ALTER TABLE `timetable`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_faculty_day_hour` (`facultyId`,`day`,`hour`),
  ADD KEY `idx_facultyId` (`facultyId`),
  ADD KEY `idx_department` (`department`),
  ADD KEY `idx_academicYear` (`academicYear`);

--
-- Indexes for table `timetable_master`
--
ALTER TABLE `timetable_master`
  ADD PRIMARY KEY (`id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `timetable_notifications`
--
ALTER TABLE `timetable_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `slot_assignment_id` (`slot_assignment_id`);

--
-- Indexes for table `timetable_periods`
--
ALTER TABLE `timetable_periods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timetable_master_id` (`timetable_master_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `lab_id` (`lab_id`);

--
-- Indexes for table `timetable_slots`
--
ALTER TABLE `timetable_slots`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_timetable_slots_timetable_day_time` (`timetable_id`,`day`,`start_time`),
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
  ADD KEY `fk_users_role_id` (`role_id`);

--
-- Indexes for table `year_break_timings`
--
ALTER TABLE `year_break_timings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_department_year` (`department_id`,`year`),
  ADD KEY `idx_year` (`year`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `class_incharges`
--
ALTER TABLE `class_incharges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
  MODIFY `faculty_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=433;

--
-- AUTO_INCREMENT for table `faculty_research`
--
ALTER TABLE `faculty_research`
  MODIFY `research_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `faculty_subject_assignments`
--
ALTER TABLE `faculty_subject_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
-- AUTO_INCREMENT for table `labs`
--
ALTER TABLE `labs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leaves`
--
ALTER TABLE `leaves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `leave_balance`
--
ALTER TABLE `leave_balance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `leave_notifications`
--
ALTER TABLE `leave_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `period_config`
--
ALTER TABLE `period_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_attendance_entry`
--
ALTER TABLE `staff_attendance_entry`
  MODIFY `staff_attendance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_leave_approval`
--
ALTER TABLE `staff_leave_approval`
  MODIFY `staff_approval_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_leave_balance`
--
ALTER TABLE `staff_leave_balance`
  MODIFY `balance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_leave_request`
--
ALTER TABLE `staff_leave_request`
  MODIFY `staff_leave_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_attendance_entry`
--
ALTER TABLE `student_attendance_entry`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_bio`
--
ALTER TABLE `student_bio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_certifications`
--
ALTER TABLE `student_certifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_marks`
--
ALTER TABLE `student_marks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_notifications`
--
ALTER TABLE `student_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_profile`
--
ALTER TABLE `student_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4159;

--
-- AUTO_INCREMENT for table `student_projects`
--
ALTER TABLE `student_projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_sports`
--
ALTER TABLE `student_sports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `subject_class_mappings`
--
ALTER TABLE `subject_class_mappings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable`
--
ALTER TABLE `timetable`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=173;

--
-- AUTO_INCREMENT for table `timetable_master`
--
ALTER TABLE `timetable_master`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable_notifications`
--
ALTER TABLE `timetable_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable_periods`
--
ALTER TABLE `timetable_periods`
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
-- AUTO_INCREMENT for table `year_break_timings`
--
ALTER TABLE `year_break_timings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `class_incharges`
--
ALTER TABLE `class_incharges`
  ADD CONSTRAINT `class_incharges_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `class_incharges_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `class_incharges_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
-- Constraints for table `faculty_phd`
--
ALTER TABLE `faculty_phd`
  ADD CONSTRAINT `faculty_phd_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `fk_fsa_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fsa_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_substitutes`
--
ALTER TABLE `faculty_substitutes`
  ADD CONSTRAINT `fk_substitute_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_substitute_faculty_sub` FOREIGN KEY (`substitute_faculty_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_substitute_requested_by` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `faculy_edu_qualification`
--
ALTER TABLE `faculy_edu_qualification`
  ADD CONSTRAINT `faculy_edu_qualification_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `faculy_edu_qualification_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE;

--
-- Constraints for table `labs`
--
ALTER TABLE `labs`
  ADD CONSTRAINT `labs_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `labs_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `labs_ibfk_3` FOREIGN KEY (`lab_incharge_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `student_attendance_entry`
--
ALTER TABLE `student_attendance_entry`
  ADD CONSTRAINT `fk_attendance_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `student_bio`
--
ALTER TABLE `student_bio`
  ADD CONSTRAINT `fk_students1_student` FOREIGN KEY (`studentId`) REFERENCES `student_profile` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_certifications`
--
ALTER TABLE `student_certifications`
  ADD CONSTRAINT `fk_cert_approver` FOREIGN KEY (`approvedById`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cert_student` FOREIGN KEY (`studentId`) REFERENCES `student_profile` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_events`
--
ALTER TABLE `student_events`
  ADD CONSTRAINT `fk_event_approver` FOREIGN KEY (`approvedById`) REFERENCES `users` (`id`) ON DELETE SET NULL,
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
  ADD CONSTRAINT `fk_leave_approver` FOREIGN KEY (`approvedById`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_leave_student` FOREIGN KEY (`studentId`) REFERENCES `student_profile` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `fk_student_department` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_student_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `fk_sport_approver` FOREIGN KEY (`approvedById`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sport_student` FOREIGN KEY (`studentId`) REFERENCES `student_profile` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `timetable_master`
--
ALTER TABLE `timetable_master`
  ADD CONSTRAINT `timetable_master_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `timetable_notifications`
--
ALTER TABLE `timetable_notifications`
  ADD CONSTRAINT `fk_notifications_assignment` FOREIGN KEY (`slot_assignment_id`) REFERENCES `timetable_slot_assignments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `timetable_periods`
--
ALTER TABLE `timetable_periods`
  ADD CONSTRAINT `timetable_periods_ibfk_1` FOREIGN KEY (`timetable_master_id`) REFERENCES `timetable_master` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `timetable_periods_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `timetable_periods_ibfk_3` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
