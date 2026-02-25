-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 25, 2026 at 07:08 PM
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
(5, 'Welcome to eduvertex', 'The Eduvertex is a real time ERP Enterpersise Resource Planning ', 'general', 'low', '[\"all\"]', NULL, '[]', 1, 109, 'super-admin', NULL, '2026-02-25 16:30:00', '2026-02-25 16:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `section` varchar(10) DEFAULT NULL,
  `room` varchar(50) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `semester` int(11) DEFAULT NULL,
  `batch` varchar(20) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `section`, `room`, `department_id`, `semester`, `batch`, `capacity`, `status`) VALUES
(1, 'CSE A', 'A', '101', 1, 6, '2021-2025', 60, 'active'),
(2, 'CSE B', 'B', '102', 1, 6, '2021-2025', 60, 'active'),
(3, 'ECE A', 'A', '201', 2, 6, '2021-2025', 60, 'active'),
(4, 'ECE B', 'B', '202', 2, 6, '2021-2025', 60, 'active'),
(5, 'MECH A', 'A', '301', 3, 6, '2021-2025', 60, 'active'),
(6, 'MECH B', 'B', '302', 3, 6, '2021-2025', 60, 'active'),
(7, 'CIVIL A', 'A', '401', 4, 6, '2021-2025', 60, 'active'),
(8, 'CIVIL B', 'B', '402', 4, 6, '2021-2025', 60, 'active'),
(9, 'EEE A', 'A', '501', 5, 6, '2021-2025', 60, 'active'),
(10, 'EEE B', 'B', '502', 5, 6, '2021-2025', 60, 'active'),
(11, 'CSE A', 'A', '101', 1, 4, '2022-2026', 60, 'active'),
(12, 'CSE B', 'B', '102', 1, 4, '2022-2026', 60, 'active'),
(13, 'ECE A', 'A', '201', 2, 4, '2022-2026', 60, 'active'),
(14, 'ECE B', 'B', '202', 2, 4, '2022-2026', 60, 'active'),
(15, 'MECH A', 'A', '301', 3, 4, '2022-2026', 60, 'active'),
(16, 'MECH B', 'B', '302', 3, 4, '2022-2026', 60, 'active'),
(17, 'CIVIL A', 'A', '401', 4, 4, '2022-2026', 60, 'active'),
(18, 'CIVIL B', 'B', '402', 4, 4, '2022-2026', 60, 'active'),
(19, 'EEE A', 'A', '501', 5, 4, '2022-2026', 60, 'active'),
(20, 'EEE B', 'B', '502', 5, 4, '2022-2026', 60, 'active');

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
  `event_name` varchar(255) NOT NULL,
  `organizer` varchar(255) DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `document_url` text DEFAULT NULL
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

--
-- Dumping data for table `faculty_experience`
--

INSERT INTO `faculty_experience` (`exp_id`, `faculty_id`, `designation`, `institution_name`, `university`, `department`, `from_date`, `to_date`, `period`, `is_current`) VALUES
(2, 406, 'Assistant Professor', 'Nadar Saraswathi College of Engineering and Technology', 'akka university', 'Electronics & Communication Engineering', '2026-02-24', '2026-02-24', '4M', 0),
(4, 101, 'Assistant Professor', 'Nadar Saraswathi College of Engineering and Technology', 'asdfasf', 'Internet of Things', '2026-02-25', '2026-02-17', '232', 0),
(5, 101, 'Assistant Professor', 'Nadar Saraswathi College of Engineering and Technology', 'Anna University', 'Computer Science Engineering', '2020-01-01', '2023-12-31', '3 years', 0),
(6, 101, 'Assistant Professor', 'Nadar Saraswathi College of Engineering and Technology', 'Anna University', 'Computer Science Engineering', '2020-01-01', '2023-12-31', '3 years', 0),
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
-- Table structure for table `faculty_leaves`
--

CREATE TABLE `faculty_leaves` (
  `leave_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `leave_type` enum('Casual Leave','Medical leave','On Duty','Vacation Leave','special Leave','level Loss of Pay','Other') DEFAULT 'Other',
  `reassign_faculty_id` int(11) DEFAULT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `reason` text NOT NULL,
  `load_assign` text DEFAULT NULL,
  `status` enum('Draft','Pending','Approved','Rejected') DEFAULT 'Pending',
  `applied_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
  `coe_id` int(30) DEFAULT NULL,
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
  `is_placement_coordinator` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty_profiles`
--

INSERT INTO `faculty_profiles` (`faculty_id`, `faculty_college_code`, `coe_id`, `AICTE_ID`, `Anna_University_ID`, `Name`, `email`, `phone_number`, `password`, `role_id`, `department_id`, `designation`, `educational_qualification`, `phd_status`, `gender`, `date_of_birth`, `date_of_joining`, `profile_image_url`, `status`, `blood_group`, `aadhar_number`, `pan_number`, `perm_address`, `curr_address`, `created_at`, `updated_at`, `linkedin_url`, `is_timetable_incharge`, `is_placement_coordinator`) VALUES
(101, 'CS12', NULL, NULL, NULL, 'Dr.MATHALAI RAJ. J', 'drmathalai.raj@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 7, 1, 'HEAD OF THE DEPARTMENT', NULL, '', NULL, NULL, NULL, '/uploads/faculty/dr_mathalai_raj__j.jpg', 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-24 15:44:58', NULL, 0, 0),
(111, 'SH1', NULL, NULL, NULL, 'DR.B.MALLAIYASAMY', 'drbmallaiyasamy.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0),
(121, 'SH10', NULL, NULL, NULL, 'DR.DAVID MATHAN.N', 'drdavid.mathann@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0),
(124, 'ME11', NULL, NULL, NULL, 'VEMBATHURAJESH.A', 'vembathurajesha.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0),
(131, 'AA2', NULL, NULL, NULL, 'Dr.C.MATHALAI SUNDARAM', 'drcmathalai.sundaram@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0),
(132, 'ME12', NULL, NULL, NULL, 'SANTHASEELAN.R', 'santhaseelanr.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0),
(133, 'ME14', NULL, NULL, NULL, 'SIVAGANESAN.V', 'sivaganesanv.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0),
(134, 'ME16', NULL, NULL, NULL, 'NAGARAJA.R', 'nagarajar.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0),
(135, 'ME18', NULL, NULL, NULL, 'NAGARAJAN.B', 'nagarajanb.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0),
(137, 'CS4', NULL, NULL, NULL, 'UDHAYA KUMAR.R', 'udhaya.kumarr@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, 'Assistant Professor', NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-21 14:52:40', NULL, 0, 0),
(149, 'CS10', NULL, NULL, NULL, 'VIGNESH.L.S', 'vigneshls.faculty@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, 'HEAD OF THE DEPARTMENT', NULL, 'No', NULL, NULL, NULL, '/uploads/faculty/vignesh_l_s.png', 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-21 14:52:29', NULL, 0, 0),
(166, 'EC4', NULL, NULL, NULL, 'IDHAYACHANDRAN M', 'idhayachandran.m@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0),
(167, 'EC10', NULL, NULL, NULL, 'DR. N MATHAVAN', 'dr2.n@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0),
(168, 'EC11', NULL, NULL, NULL, 'TAMIL SELVI T', 'tamil.selvi@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0),
(169, 'EC13', NULL, NULL, NULL, 'PRATHAP S', 'prathap.s@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0),
(170, 'EC14', NULL, NULL, NULL, 'BHARATHI KANNAN K', 'bharathi.kannan@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:38:21', '2026-02-20 06:43:32', NULL, 0, 0),
(345, 'NS1105T18', NULL, NULL, NULL, 'NAGARATHINAM.N', 'ns1105t18@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(346, 'NS10T18', NULL, NULL, NULL, 'GAYATHRI S', 'ns10t18@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(347, 'NS303NT06', NULL, NULL, NULL, 'SHANMUGAPRIYAN.R', 'ns303nt06@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(348, 'NS10T21', NULL, NULL, NULL, 'SINDHU M', 'ns10t21@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(349, 'NS10T27', NULL, NULL, NULL, 'DR.E.ANANTHA KRISHNAN', 'ns10t27@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(350, 'NS10T29', NULL, NULL, NULL, 'SOWMIYA B', 'ns10t29@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(351, 'NS10T30', NULL, NULL, NULL, 'KANIMOZHI M', 'ns10t30@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-21 18:35:32', NULL, 0, 0),
(352, 'NS10T31', NULL, NULL, NULL, 'BENITA MERLIN ISABELLA K', 'ns10t31@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(353, 'NS10T32', NULL, NULL, NULL, 'ARUL JEBARAJ P', 'ns10t32@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(354, 'NS10T33', NULL, NULL, NULL, 'NATHIRUN SABINASH', 'ns10t33@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(355, 'NS10T34', NULL, NULL, NULL, 'MANOJ PRABAKAR R', 'ns10t34@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(356, 'NS10T35', NULL, NULL, NULL, 'HARI PRASATH T', 'ns10t35@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(357, 'NS20T35', NULL, NULL, NULL, 'ABIRAMI KAYATHIRI S', 'ns20t35@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-25 18:05:03', NULL, 1, 0),
(358, 'NS20T41', NULL, NULL, NULL, 'ANUSUYA V', 'ns20t41@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(360, 'NS20T25', NULL, NULL, NULL, 'VELKUMAR K', 'ns20t25@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(361, 'NS20T33', NULL, NULL, NULL, 'DEEPIGA K', 'ns20t33@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(362, 'NS20T40', NULL, NULL, NULL, 'VENKATALAKSHMI M', 'ns20t40@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(363, 'NS20T29', NULL, NULL, NULL, 'ARCHANA R', 'ns20t29@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(364, 'NS70T01', NULL, NULL, NULL, 'DR.M SATHYA', 'ns70t01@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 1, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(365, 'NS61T20', NULL, NULL, NULL, 'ARULVIZHI M', 'ns61t20@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(366, 'NS22T21', NULL, NULL, NULL, 'PREETHA J', 'ns22t21@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(367, 'NS61T16', NULL, NULL, NULL, 'Dr.C.CHITHRA', 'ns61t16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(368, 'NS61T09', NULL, NULL, NULL, 'KARUNYAH R', 'ns61t09@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(369, 'SH1', NULL, NULL, NULL, 'DR.B.MALLAIYASAMY', 'sh1@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(370, 'NS61T23', NULL, NULL, NULL, 'MUFEENA S', 'ns61t23@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(371, 'NS6606T17', NULL, NULL, NULL, 'SUBATHAMANI T', 'ns6606t17@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(372, 'NS6606T18', NULL, NULL, NULL, 'DR. MALARVIZHI P', 'ns6606t18@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(373, 'NS6606T19', NULL, NULL, NULL, 'DR. VALARMATHI R', 'ns6606t19@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(374, 'NS60T07', NULL, NULL, NULL, 'RICHARD BRITTO.R.C', 'ns60t07@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(375, 'NS7706T06', NULL, NULL, NULL, 'DR. M VEERA KUMAR', 'ns7706t06@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(376, 'NS62T11', NULL, NULL, NULL, 'DHANDAYUTHAPANI', 'ns62t11@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(377, 'NS62T10', NULL, NULL, NULL, 'RAJAGURU K', 'ns62t10@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(378, 'NS7706T04', NULL, NULL, NULL, 'Dr.S.R.KRISHNAMOORTHI', 'ns7706t04@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(379, 'SH10', NULL, NULL, NULL, 'DR.DAVID MATHAN.N', 'sh10@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(380, 'NS63T13', NULL, NULL, NULL, 'ABINAYA B', 'ns63t13@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(381, 'NS63T16', NULL, NULL, NULL, 'DR R SARAVANANKUMAR', 'ns63t16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(382, 'ME11', NULL, NULL, NULL, 'VEMBATHURAJESH.A', 'me11@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(383, 'NS67T03', NULL, NULL, NULL, 'THISHA N', 'ns67t03@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 10, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(384, 'NS50T16', NULL, NULL, NULL, 'HARIKISHORE.S', 'ns50t16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(385, 'NS50T21', NULL, NULL, NULL, 'VENNIMALAI RAJAN A', 'ns50t21@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(386, 'NS50T22', NULL, NULL, NULL, 'ARUN KUMAR.G', 'ns50t22@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(387, 'NS50T24', NULL, NULL, NULL, 'DR.B.RADHAKRISHNAN', 'ns50t24@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(388, 'NS4407T020', NULL, NULL, NULL, 'SURULIMANI. P', 'ns4407t020@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(389, 'AA2', NULL, NULL, NULL, 'Dr.C.MATHALAI SUNDARAM', 'aa2@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(390, 'ME12', NULL, NULL, NULL, 'SANTHASEELAN.R', 'me12@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(391, 'ME14', NULL, NULL, NULL, 'SIVAGANESAN.V', 'me14@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(392, 'ME16', NULL, NULL, NULL, 'NAGARAJA.R', 'me16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(393, 'ME18', NULL, NULL, NULL, 'NAGARAJAN.B', 'me18@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(394, 'NS50T19', NULL, NULL, NULL, 'CHAKRAVARTHY SAMY DURAI J', 'ns50t19@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 5, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(395, 'CS4', NULL, NULL, NULL, 'UDHAYA KUMAR.R', 'cs4@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(396, 'NS70T07', NULL, NULL, NULL, 'JASMINE JOSE P', 'ns70t07@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(397, 'NS20T34', NULL, NULL, NULL, 'KESAVAMOORTHY N', 'ns20t34@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(398, 'NS20T14', NULL, NULL, NULL, 'ARUL JOTHI.S', 'ns20t14@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(399, 'NS70T05', NULL, NULL, NULL, 'MAHALAKSHMI S', 'ns70t05@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(400, 'NS20T39', NULL, NULL, NULL, 'BHAVANI M', 'ns20t39@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(401, 'NS70T04', NULL, NULL, NULL, 'SAI SUGANYA B', 'ns70t04@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(403, 'NS20T37', NULL, NULL, NULL, 'GEERTHIGA G', 'ns20t37@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-23 20:37:47', NULL, 0, 0),
(404, 'NS20T32', NULL, NULL, NULL, 'VINOTH KUMAR J', 'ns20t32@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(405, 'NS70T02', NULL, NULL, NULL, 'KANIMOLI J', 'ns70t02@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-23 20:26:34', NULL, 0, 0),
(406, 'NS80T01', NULL, NULL, NULL, 'NAGAJOTHI P', 'ns80t01@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, NULL, NULL, 'Pursuing', NULL, NULL, NULL, '/uploads/faculty/nagajothi_p.jpg', 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-24 14:46:06', 'https://www.linkedin.com/in/prathap/', 1, 0),
(408, 'NS2207T15', NULL, NULL, NULL, 'PRATHAP. C', 'ns2207t15@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 6, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-23 20:38:00', NULL, 0, 1),
(409, 'NS30T03', NULL, NULL, NULL, 'GANESH.K', 'ns30t03@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(410, 'NS40T16', NULL, NULL, NULL, 'Dr.R.ATHILINGAM', 'ns40t16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(411, 'NS30T19', NULL, NULL, NULL, 'RAJA KARTHICK R', 'ns30t19@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(412, 'NS30T20', NULL, NULL, NULL, 'NISHETHA JEFLIN NIXON A', 'ns30t20@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(413, 'NS30T25', NULL, NULL, NULL, 'VIJAYALAKSHMI M', 'ns30t25@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(414, 'NS30T26', NULL, NULL, NULL, 'SHIVA C', 'ns30t26@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(415, 'NS30T27', NULL, NULL, NULL, 'ABIRAMI N', 'ns30t27@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(416, 'NS30T30', NULL, NULL, NULL, 'DR N PANDISELVI', 'ns30t30@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(417, 'NS30T29', NULL, NULL, NULL, 'JURIYA BANU H', 'ns30t29@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 4, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(418, 'NS40T24', NULL, NULL, NULL, 'KALAIVANI S', 'ns40t24@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(419, 'NS40T23', NULL, NULL, NULL, 'GOWTHAMI P', 'ns40t23@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(420, 'NS3306T14', NULL, NULL, NULL, 'PRADEEP KUMAR R', 'ns3306t14@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(421, 'NS40NT16', NULL, NULL, NULL, 'CHITRA R', 'ns40nt16@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(422, 'NS40T19', NULL, NULL, NULL, 'SHANTHA DEVI P', 'ns40t19@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(423, 'NS40T20', NULL, NULL, NULL, 'DR. T. VENISH KUMAR', 'ns40t20@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(424, 'EC4', NULL, NULL, NULL, 'IDHAYACHANDRAN M', 'ec4@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(425, 'EC10', NULL, NULL, NULL, 'DR. N MATHAVAN', 'ec10@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(426, 'EC11', NULL, NULL, NULL, 'TAMIL SELVI T', 'ec11@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(427, 'EC13', NULL, NULL, NULL, 'PRATHAP S', 'ec13@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(428, 'EC14', NULL, NULL, NULL, 'BHARATHI KANNAN K', 'ec14@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(429, 'NS40T27', NULL, NULL, NULL, 'RAJESHSHREE S', 'ns40t27@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 3, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0),
(430, 'NS20NT23', NULL, NULL, NULL, 'MUTHURAJ', 'ns20nt23@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 2, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 16:39:11', '2026-02-20 06:43:32', NULL, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `faculty_research`
--

CREATE TABLE `faculty_research` (
  `ORCID_ID` int(20) DEFAULT NULL,
  `faculty_id` int(11) NOT NULL,
  `category` enum('Conference','Journal','Patent','Book Chapter') NOT NULL,
  `title` text NOT NULL,
  `publication_date` varchar(50) DEFAULT NULL,
  `publisher_organizer` varchar(255) DEFAULT NULL,
  `url` text DEFAULT NULL,
  `document_url` text DEFAULT NULL,
  `type` enum('International','National') DEFAULT 'International'
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
(101, 'B.E.', 'Cyber Security', 'Nadar Saraswathi College of Engineering and Technology', 'akka', '2023', '58', 5, '', 'Active'),
(101, 'M.Tech', 'Electrical & Electronics Engineering', 'Nadar Saraswathi College of Engineering and Technology', 'akkaa', '2025', '10', 20, '', 'Active'),
(101, 'Membership', 'Professional Membership', '', 'Professional Organization', NULL, NULL, 21, 'IEEE', 'Inactive'),
(101, 'Membership', 'Professional Membership', '', 'Professional Organization', NULL, NULL, 22, 'dsd', 'Active');

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
-- Table structure for table `student_disciplinary_records`
--

CREATE TABLE `student_disciplinary_records` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL COMMENT 'FK → students.id',
  `recordDate` date NOT NULL DEFAULT current_timestamp(),
  `type` enum('warning','suspension','fine','counseling','expulsion','other') NOT NULL,
  `description` text NOT NULL COMMENT 'Issue description',
  `actionTaken` text NOT NULL COMMENT 'Disciplinary action that was taken',
  `staffRemarks` text DEFAULT NULL COMMENT 'Staff / faculty remarks',
  `issuedByFacultyId` int(11) DEFAULT NULL COMMENT 'FK → faculty_profiles.faculty_id',
  `resolved` tinyint(1) DEFAULT 0,
  `resolvedDate` date DEFAULT NULL,
  `fineAmount` decimal(10,2) DEFAULT NULL COMMENT 'Fine amount if type is fine',
  `finePaid` tinyint(1) DEFAULT 0,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of document/evidence URLs' CHECK (json_valid(`attachments`)),
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
-- Table structure for table `student_marks`
--

CREATE TABLE `student_marks` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL COMMENT 'FK → students.id',
  `subjectId` int(11) NOT NULL COMMENT 'FK → subjects.id',
  `semester` int(11) NOT NULL,
  `academicYear` varchar(9) NOT NULL COMMENT 'e.g. 2023-2024',
  `internalMarks` decimal(5,2) DEFAULT 0.00 COMMENT 'Internal marks out of 50',
  `externalMarks` decimal(5,2) DEFAULT 0.00 COMMENT 'External exam marks out of 50',
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
  `role_id` int(11) NOT NULL,
  `studentId` varchar(30) NOT NULL,
  `rollNumber` varchar(30) NOT NULL,
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
  `section` varchar(10) DEFAULT NULL,
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

INSERT INTO `student_profile` (`id`, `role_id`, `studentId`, `rollNumber`, `firstName`, `lastName`, `email`, `phone`, `photo`, `gender`, `departmentId`, `classId`, `batch`, `semester`, `year`, `section`, `admissionDate`, `admissionType`, `feeStatus`, `status`, `password`, `createdAt`, `updatedAt`) VALUES
(3331, 3, '921025243001', '921025243001', 'AATHESREE', 'R', '921025243001@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-02-19 22:09:11', '2026-02-20 06:14:43'),
(3332, 3, '921025243002', '921025243002', 'AATHIGA', 'FATHIMA A', '921025243002@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-02-19 22:09:11', '2026-02-20 06:14:43'),
(3333, 3, '921025243003', '921025243003', 'ADHILA', 'FATHIMA A', '921025243003@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-02-19 22:09:11', '2026-02-20 06:14:43'),
(3334, 3, '921025243004', '921025243004', 'AHAMED', 'ADHIEF KHAN M', '921025243004@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-02-19 22:09:11', '2026-02-20 06:14:43'),
(3335, 3, '921025243005', '921025243005', 'AKALYA', 'J', '921025243005@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-02-19 22:09:11', '2026-02-20 06:14:43'),
(3336, 3, '921025243006', '921025243006', 'ALAGUMEENA', 'S', '921025243006@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3337, 3, '921025243007', '921025243007', 'ASWATHA', 'J S', '921025243007@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3338, 3, '921025243008', '921025243008', 'BAGHYALAKSHMI', 'S', '921025243008@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3339, 3, '921025243009', '921025243009', 'DEEPAN', 'M', '921025243009@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3340, 3, '921025243010', '921025243010', 'DEVADHARSHAN', 'V', '921025243010@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3341, 3, '921025243011', '921025243011', 'DEVADHARSHINI', 'M', '921025243011@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3342, 3, '921025243012', '921025243012', 'DEVI', 'PRIYA T', '921025243012@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3343, 3, '921025243013', '921025243013', 'DHANUSRI', 'B', '921025243013@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3344, 3, '921025243014', '921025243014', 'DHARSHAN', 'BALA P', '921025243014@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3345, 3, '921025243015', '921025243015', 'DHARSHINI', 'SARO SHREE S U', '921025243015@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3346, 3, '921025243016', '921025243016', 'DHIVYA', 'SRI A', '921025243016@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3347, 3, '921025243017', '921025243017', 'DIVAGAR', 'M K', '921025243017@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3348, 3, '921025243018', '921025243018', 'DIVYASHREE', 'P', '921025243018@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3349, 3, '921025243019', '921025243019', 'GOKULAVANI', 'K', '921025243019@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3350, 3, '921025243020', '921025243020', 'GOPAL', 'KARTHICK S', '921025243020@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3351, 3, '921025243021', '921025243021', 'HARINI', 'M', '921025243021@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3352, 3, '921025243022', '921025243022', 'HARINI', 'SRI M', '921025243022@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3353, 3, '921025243023', '921025243023', 'HARIPRIYA', 'S', '921025243023@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3354, 3, '921025243024', '921025243024', 'HEMAN', 'M', '921025243024@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3355, 3, '921025243025', '921025243025', 'JEEVITHA', 'C', '921025243025@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3356, 3, '921025243026', '921025243026', 'JEYAVARSHAN', 'B', '921025243026@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3357, 3, '921025243027', '921025243027', 'KANISHKA', 'R', '921025243027@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3358, 3, '921025243028', '921025243028', 'KANISH', 'KUMAR K', '921025243028@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3359, 3, '921025243029', '921025243029', 'KAVITHA', 'S', '921025243029@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3360, 3, '921025243030', '921025243030', 'LAKSHANA', 'S', '921025243030@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3361, 3, '921025243031', '921025243031', 'LAKSHMI', 'DEVI S', '921025243031@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3362, 3, '921025243032', '921025243032', 'MATHUMITHA', 'G', '921025243032@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3363, 3, '921025243033', '921025243033', 'MEERA', 'S', '921025243033@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3364, 3, '921025243034', '921025243034', 'NANDHINI', 'S', '921025243034@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3365, 3, '921025243035', '921025243035', 'NARMATHA', 'R B', '921025243035@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3366, 3, '921025243036', '921025243036', 'NIVETHA', 'S', '921025243036@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3367, 3, '921025243037', '921025243037', 'PANDEESWARI', 'M', '921025243037@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3368, 3, '921025243038', '921025243038', 'POORVAJA', 'S', '921025243038@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3369, 3, '921025243039', '921025243039', 'PRAVEENA', 'M', '921025243039@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3370, 3, '921025243040', '921025243040', 'RAJA', 'RAJESHWARI S', '921025243040@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3371, 3, '921025243041', '921025243041', 'RAJASRI', 'M', '921025243041@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3372, 3, '921025243042', '921025243042', 'REENASRI', 'S', '921025243042@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3373, 3, '921025243043', '921025243043', 'RITHIKA', 'SRI A', '921025243043@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3374, 3, '921025243044', '921025243044', 'SAHANA', 'C', '921025243044@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3375, 3, '921025243045', '921025243045', 'SANKARA', 'NARAYAN R', '921025243045@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3376, 3, '921025243047', '921025243047', 'SHARANYA', 'M', '921025243047@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3377, 3, '921025243048', '921025243048', 'SIVA', 'DHARANI R', '921025243048@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3378, 3, '921025243049', '921025243049', 'SRINIVASH', 'T', '921025243049@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3379, 3, '921025243050', '921025243050', 'SRI', 'RAM V', '921025243050@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3380, 3, '921025243051', '921025243051', 'SUGAPRIYA', 'T', '921025243051@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3381, 3, '921025243052', '921025243052', 'SUPRIYA', 'J S', '921025243052@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3382, 3, '921025243053', '921025243053', 'VETRISELVAM', 'R', '921025243053@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3383, 3, '921025243054', '921025243054', 'VIJAYSHREE', 'S', '921025243054@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3384, 3, '921025243055', '921025243055', 'YASHIKA', 'K', '921025243055@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3385, 3, '921025243056', '921025243056', 'YAZHINI', 'P', '921025243056@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3386, 3, '921025243057', '921025243057', 'YAZHINI', 'PM', '921025243057@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3387, 3, '921025243058', '921025243058', 'YUGASRI', 'I', '921025243058@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3388, 3, '921025205001', '921025205001', 'ABARNA', 'M', '921025205001@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3389, 3, '921025205002', '921025205002', 'ABIRAMI', 'R', '921025205002@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3390, 3, '921025205003', '921025205003', 'AISHWARYA', 'LAKSHMI S', '921025205003@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3391, 3, '921025205004', '921025205004', 'AKSHAYA', 'S', '921025205004@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3392, 3, '921025205005', '921025205005', 'ARAVINDHAN', 'K', '921025205005@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3393, 3, '921025205006', '921025205006', 'ARCHANA', 'P', '921025205006@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3394, 3, '921025205007', '921025205007', 'BHUVANA', 'SRI G', '921025205007@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3395, 3, '921025205008', '921025205008', 'DEENA', 'P', '921025205008@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3396, 3, '921025205009', '921025205009', 'DHANALAKSHMI', 'R', '921025205009@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3397, 3, '921025205010', '921025205010', 'DHARSHINI', 'M', '921025205010@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3398, 3, '921025205011', '921025205011', 'DIVYASRI', 'S', '921025205011@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3399, 3, '921025205012', '921025205012', 'ELAKKIYA', 'M', '921025205012@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3400, 3, '921025205013', '921025205013', 'GOBIKA', 'SRI S', '921025205013@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3401, 3, '921025205014', '921025205014', 'GOWTHAM', 'KUMAR M', '921025205014@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3402, 3, '921025205015', '921025205015', 'GURU', 'K', '921025205015@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3403, 3, '921025205016', '921025205016', 'HARIPRIYA', 'R', '921025205016@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3404, 3, '921025205017', '921025205017', 'JANARTHANAN', 'M', '921025205017@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3405, 3, '921025205018', '921025205018', 'JEYAKRISHNAN', 'P', '921025205018@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3406, 3, '921025205019', '921025205019', 'JEYSREE', 'S', '921025205019@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3407, 3, '921025205020', '921025205020', 'KARTHIGA', 'M', '921025205020@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3408, 3, '921025205021', '921025205021', 'KIRUTHIKA', 'S', '921025205021@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3409, 3, '921025205022', '921025205022', 'LAKXMAN', 'HARI K M', '921025205022@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3410, 3, '921025205023', '921025205023', 'LOGASRI', 'K', '921025205023@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3411, 3, '921025205024', '921025205024', 'MAHALAKSHMI', 'R', '921025205024@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3412, 3, '921025205025', '921025205025', 'MAHARAJAN', 'K', '921025205025@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3413, 3, '921025205026', '921025205026', 'MAHIMA', 'GRACE G', '921025205026@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3414, 3, '921025205027', '921025205027', 'MOHAMED', 'IRFAN P', '921025205027@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3415, 3, '921025205028', '921025205028', 'MOHAMED', 'SYATH ARAFATH A', '921025205028@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3416, 3, '921025205029', '921025205029', 'MUTHU', 'VETHA VARSHINI M', '921025205029@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3417, 3, '921025205030', '921025205030', 'NAFILA', 'FATHIMA R', '921025205030@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3418, 3, '921025205031', '921025205031', 'NIROSHKUMAR', 'R', '921025205031@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3419, 3, '921025205032', '921025205032', 'NISHANTHINI', 'R', '921025205032@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3420, 3, '921025205033', '921025205033', 'PAVITHRA', 'R', '921025205033@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3421, 3, '921025205034', '921025205034', 'PRATHIBHA', 'SHIVARANJANI P', '921025205034@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3422, 3, '921025205035', '921025205035', 'PRATHISHA', 'ARASI S', '921025205035@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3423, 3, '921025205036', '921025205036', 'PRAVEENA', 'M', '921025205036@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3424, 3, '921025205037', '921025205037', 'PREETHA', 'M', '921025205037@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3425, 3, '921025205038', '921025205038', 'PRIYADHARSHINI', 'M', '921025205038@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3426, 3, '921025205039', '921025205039', 'RAJANESWARAN', 'N', '921025205039@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3427, 3, '921025205040', '921025205040', 'RAJIYA', 'PRIYA K', '921025205040@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3428, 3, '921025205041', '921025205041', 'RENUGA', 'K', '921025205041@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3429, 3, '921025205042', '921025205042', 'RINISHA', 'M', '921025205042@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3430, 3, '921025205043', '921025205043', 'ROHITH', 'BALAJ IM', '921025205043@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3431, 3, '921025205044', '921025205044', 'ROSHINI', 'M', '921025205044@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3432, 3, '921025205045', '921025205045', 'SABANA', 'BANU K', '921025205045@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3433, 3, '921025205046', '921025205046', 'SANJAY', 'KUMAR B', '921025205046@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3434, 3, '921025205047', '921025205047', 'SANTHOSH', 'P', '921025205047@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3435, 3, '921025205048', '921025205048', 'SARAVANA', 'KUMAR A', '921025205048@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3436, 3, '921025205049', '921025205049', 'SARUSHEELA', 'G', '921025205049@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3437, 3, '921025205050', '921025205050', 'SHANMUGAVALLI', 'K', '921025205050@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3438, 3, '921025205051', '921025205051', 'SHARUNETHRA', 'V', '921025205051@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3439, 3, '921025205052', '921025205052', 'SHIVANI', 'B', '921025205052@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3440, 3, '921025205053', '921025205053', 'SHOBA', 'M', '921025205053@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3441, 3, '921025205054', '921025205054', 'SUJITHRAM', 'S', '921025205054@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3442, 3, '921025205055', '921025205055', 'SWETHA', 'T', '921025205055@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3443, 3, '921025205056', '921025205056', 'THANISHA', 'S', '921025205056@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3444, 3, '921025205057', '921025205057', 'THEJINI', 'P', '921025205057@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3445, 3, '921025205058', '921025205058', 'VEERUJOTHI', 'P', '921025205058@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3446, 3, '921025205059', '921025205059', 'VELMURUGAN', 'J', '921025205059@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3447, 3, '921025205060', '921025205060', 'YUGASHRI', 'S', '921025205060@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3448, 3, '921025114001', '921025114001', 'ABINESH', 'P', '921025114001@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3449, 3, '921025114002', '921025114002', 'AKASH', 'K', '921025114002@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3450, 3, '921025114003', '921025114003', 'AZHAGAR', 'RAJA P', '921025114003@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3451, 3, '921025114004', '921025114004', 'BHUVANESHPANDI', 'S', '921025114004@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3452, 3, '921025114005', '921025114005', 'BUVANESWARAN', 'S', '921025114005@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3453, 3, '921025114006', '921025114006', 'DEEPAK', 'A', '921025114006@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3454, 3, '921025114007', '921025114007', 'DEEPAKISHAN', 'R', '921025114007@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3455, 3, '921025114008', '921025114008', 'DESIKASRI', 'S', '921025114008@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3456, 3, '921025114009', '921025114009', 'DHIVYAJOTHI', 'SREE K', '921025114009@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3457, 3, '921025114010', '921025114010', 'DIVAHAR', 'S', '921025114010@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3458, 3, '921025114011', '921025114011', 'DURAI', 'SELVAN K', '921025114011@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3459, 3, '921025114012', '921025114012', 'GOWMARIGAYATHRI', 'R', '921025114012@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3460, 3, '921025114013', '921025114013', 'HARISHMA', 'SRI R', '921025114013@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3461, 3, '921025114014', '921025114014', 'HARRYS', 'R', '921025114014@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3462, 3, '921025114015', '921025114015', 'JABAR', 'MYDEEN U', '921025114015@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3463, 3, '921025114016', '921025114016', 'KABISH', 'R', '921025114016@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3464, 3, '921025114018', '921025114018', 'KAVIARASAN', 'N', '921025114018@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3465, 3, '921025114019', '921025114019', 'KAVIN', 'G', '921025114019@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3466, 3, '921025114020', '921025114020', 'KIRTHICK', 'M', '921025114020@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3467, 3, '921025114022', '921025114022', 'KISHORE', 'KUMAR V', '921025114022@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3468, 3, '921025114023', '921025114023', 'KOWSHIK', 'HEMA CHANDRAN M', '921025114023@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3469, 3, '921025114024', '921025114024', 'MARIMUTHU', 'S', '921025114024@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3470, 3, '921025114025', '921025114025', 'MATHESH', 'M', '921025114025@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3471, 3, '921025114026', '921025114026', 'MOHAMED', 'ASKAR M', '921025114026@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3472, 3, '921025114027', '921025114027', 'MOHAMED', 'THARIK A', '921025114027@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3473, 3, '921025114028', '921025114028', 'MOHANARAJAN', 'M', '921025114028@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3474, 3, '921025114029', '921025114029', 'MONISH', 'S', '921025114029@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3475, 3, '921025114030', '921025114030', 'MUTHUPANDI', 'G', '921025114030@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3476, 3, '921025114031', '921025114031', 'NIKASH', 'S', '921025114031@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3477, 3, '921025114032', '921025114032', 'PERARASAN', 'S', '921025114032@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3478, 3, '921025114033', '921025114033', 'POOVESH', 'M', '921025114033@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3479, 3, '921025114034', '921025114034', 'RANJITH', 'P', '921025114034@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3480, 3, '921025114035', '921025114035', 'SANJAYPANDIAN', 'G', '921025114035@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3481, 3, '921025114036', '921025114036', 'SANTHOSH', 'KUMAR B', '921025114036@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3482, 3, '921025114037', '921025114037', 'SANTHOSH', 'SRI RAM R', '921025114037@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3483, 3, '921025114038', '921025114038', 'SURIYA', 'PRAKASH J', '921025114038@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3484, 3, '921025114039', '921025114039', 'THIRUNAVUKKARASU', 'B', '921025114039@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3485, 3, '921025114040', '921025114040', 'VIGNESHWARAN', 'M', '921025114040@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17');
INSERT INTO `student_profile` (`id`, `role_id`, `studentId`, `rollNumber`, `firstName`, `lastName`, `email`, `phone`, `photo`, `gender`, `departmentId`, `classId`, `batch`, `semester`, `year`, `section`, `admissionDate`, `admissionType`, `feeStatus`, `status`, `password`, `createdAt`, `updatedAt`) VALUES
(3486, 3, '921025114041', '921025114041', 'VIGNESHWARAN', 'V', '921025114041@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3487, 3, '921025114042', '921025114042', 'VISHNUVARATHAN', 'V', '921025114042@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3488, 3, '921025114043', '921025114043', 'VISHWA', 'V', '921025114043@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3489, 3, '921025114044', '921025114044', 'YUVARAJ', 'M', '921025114044@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3490, 3, '921025106001', '921025106001', 'ABISHEK', 'S', '921025106001@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3491, 3, '921025106002', '921025106002', 'AJAY', 'SELVAM T', '921025106002@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3492, 3, '921025106003', '921025106003', 'ARAVINDH', 'KUMAR D', '921025106003@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3493, 3, '921025106004', '921025106004', 'ARIVAZHAGAN', 'G', '921025106004@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3494, 3, '921025106005', '921025106005', 'BARANI', 'DHARAN R', '921025106005@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3495, 3, '921025106006', '921025106006', 'BALAJI', 'B', '921025106006@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3496, 3, '921025106007', '921025106007', 'BHARANIDHARAN', 'C', '921025106007@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3497, 3, '921025106008', '921025106008', 'DEEKSITHKASTHURIRAJAN', 'K', '921025106008@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3498, 3, '921025106009', '921025106009', 'DEEPAK', 'SRI RENGA D', '921025106009@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3499, 3, '921025106010', '921025106010', 'DHANUSREE', 'M P', '921025106010@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3500, 3, '921025106011', '921025106011', 'DHARANI', 'P', '921025106011@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3501, 3, '921025106012', '921025106012', 'DHARANI', 'SHREE S', '921025106012@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3502, 3, '921025106013', '921025106013', 'DHIVASHINI', 'M', '921025106013@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3503, 3, '921025106014', '921025106014', 'DHIYA', 'M', '921025106014@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3504, 3, '921025106015', '921025106015', 'GIRIVASAN', 'A', '921025106015@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3505, 3, '921025106016', '921025106016', 'GOWTHAM', 'V', '921025106016@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3506, 3, '921025106017', '921025106017', 'HARINI', 'K', '921025106017@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3507, 3, '921025106018', '921025106018', 'HEMA', 'T', '921025106018@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3508, 3, '921025106019', '921025106019', 'HEMA', 'VARSHINI A', '921025106019@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3509, 3, '921025106020', '921025106020', 'HIRUTHIKA', 'S', '921025106020@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3510, 3, '921025106021', '921025106021', 'INULZAARIYA', 'A', '921025106021@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3511, 3, '921025106022', '921025106022', 'JAMEER', 'MOHAMED S', '921025106022@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3512, 3, '921025106023', '921025106023', 'JEEVADHARSHINI', 'K', '921025106023@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3513, 3, '921025106024', '921025106024', 'JEEVADHARSINI', 'B', '921025106024@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3514, 3, '921025106025', '921025106025', 'JEGATHEESWARI', 'K', '921025106025@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3515, 3, '921025106026', '921025106026', 'KANAL', 'AVINASH R', '921025106026@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3516, 3, '921025106027', '921025106027', 'KARTHICK', 'S', '921025106027@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3517, 3, '921025106028', '921025106028', 'KARUNIYA', 'K', '921025106028@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3518, 3, '921025106029', '921025106029', 'KAVIYA', 'B', '921025106029@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3519, 3, '921025106030', '921025106030', 'KEERTHI', 'SUKANYA S', '921025106030@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3520, 3, '921025106031', '921025106031', 'KIRUBASHREE', 'S', '921025106031@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3521, 3, '921025106032', '921025106032', 'KIRUPAKARAN', 'J', '921025106032@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3522, 3, '921025106033', '921025106033', 'KISHORE', 'V', '921025106033@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3523, 3, '921025106034', '921025106034', 'LAUREL', 'HAGI D', '921025106034@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3524, 3, '921025106035', '921025106035', 'LAVANYA', 'M', '921025106035@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3525, 3, '921025106036', '921025106036', 'LEENA', 'SHRI B', '921025106036@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3526, 3, '921025106037', '921025106037', 'LOGADHARSHINI', 'R', '921025106037@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3527, 3, '921025106038', '921025106038', 'LOGAMMAL', 'M', '921025106038@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3528, 3, '921025106039', '921025106039', 'MAHALAKSHMI', 'P', '921025106039@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3529, 3, '921025106040', '921025106040', 'MANASA', 'DEVI K', '921025106040@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3530, 3, '921025106041', '921025106041', 'MANISHA', 'R', '921025106041@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3531, 3, '921025106042', '921025106042', 'MARLIYA', 'FATHIMA S', '921025106042@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3532, 3, '921025106043', '921025106043', 'MEERA', 'N', '921025106043@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3533, 3, '921025106044', '921025106044', 'MOHANAPRIYA', 'S', '921025106044@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3534, 3, '921025106045', '921025106045', 'MONIGA', 'R', '921025106045@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3535, 3, '921025106046', '921025106046', 'NAVTHEEB', 'A', '921025106046@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3536, 3, '921025106047', '921025106047', 'NELAKSHI', 'B', '921025106047@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3537, 3, '921025106048', '921025106048', 'NISHANTHINI', 'K', '921025106048@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3538, 3, '921025106049', '921025106049', 'NITHISH', 'K T', '921025106049@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3539, 3, '921025106050', '921025106050', 'PANDEESWARI', 'M', '921025106050@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3540, 3, '921025106052', '921025106052', 'PRAVEEN', 'C', '921025106052@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3541, 3, '921025106053', '921025106053', 'SIVA', 'E', '921025106053@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3542, 3, '921025106054', '921025106054', 'SIVAKAMI', 'P', '921025106054@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3543, 3, '921025106055', '921025106055', 'SRILEKHA', 'R', '921025106055@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3544, 3, '921025106056', '921025106056', 'SURIYA', 'PRAKASH', '921025106056@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3545, 3, '921025106057', '921025106057', 'THEEPTHIGA', 'K', '921025106057@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3546, 3, '921025106058', '921025106058', 'VAISHNAVI', 'S', '921025106058@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3547, 3, '921025106059', '921025106059', 'VIKRAM', 'N', '921025106059@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3548, 3, '921025105001', '921025105001', 'AJAY', 'PANDI P', '921025105001@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3549, 3, '921025105002', '921025105002', 'ANISH', 'FATHIMA A', '921025105002@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3550, 3, '921025105003', '921025105003', 'ANUSRI', 'A', '921025105003@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3551, 3, '921025105004', '921025105004', 'ASHMA', 'BARVIN P', '921025105004@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3552, 3, '921025105005', '921025105005', 'ASIFA', 'M', '921025105005@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3553, 3, '921025105006', '921025105006', 'ATCHAYA', 'KEERTHIKA D', '921025105006@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3554, 3, '921025105007', '921025105007', 'BEAULAH', 'JOILE S', '921025105007@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3555, 3, '921025105008', '921025105008', 'CHENNA', 'KRISHNAN K', '921025105008@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3556, 3, '921025105009', '921025105009', 'DEEPIKA', 'V', '921025105009@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3557, 3, '921025105010', '921025105010', 'DHANISHA', 'M', '921025105010@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3558, 3, '921025105011', '921025105011', 'DHARSHAN', 'N', '921025105011@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3559, 3, '921025105012', '921025105012', 'GOWSIKA', 'S', '921025105012@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3560, 3, '921025105013', '921025105013', 'HARCHINI', 'M', '921025105013@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3561, 3, '921025105014', '921025105014', 'HARINI', 'M', '921025105014@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3562, 3, '921025105015', '921025105015', 'HARISH', 'K', '921025105015@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3563, 3, '921025105016', '921025105016', 'HARISH', 'L', '921025105016@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3564, 3, '921025105017', '921025105017', 'HARISH', 'M', '921025105017@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3565, 3, '921025105018', '921025105018', 'HARITHABANU', 'K', '921025105018@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3566, 3, '921025105019', '921025105019', 'HEMAPRIYA', 'N', '921025105019@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3567, 3, '921025105020', '921025105020', 'JANANI', 'A V', '921025105020@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3568, 3, '921025105021', '921025105021', 'KAMALESH', 'V', '921025105021@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3569, 3, '921025105022', '921025105022', 'KANAGALAKSHMI', 'R', '921025105022@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3570, 3, '921025105023', '921025105023', 'KEERTHIKA', 'C', '921025105023@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3571, 3, '921025105024', '921025105024', 'KIRUBA', 'A', '921025105024@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3572, 3, '921025105025', '921025105025', 'LINGESH', 'S', '921025105025@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3573, 3, '921025105026', '921025105026', 'LINGESH', 'S S', '921025105026@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3574, 3, '921025105027', '921025105027', 'MADHUMIDHA', 'M', '921025105027@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3575, 3, '921025105028', '921025105028', 'MANOJ', 'PRAVEEN M', '921025105028@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3576, 3, '921025105029', '921025105029', 'MATHESH', 'M', '921025105029@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3577, 3, '921025105030', '921025105030', 'MUGESHKUMAR', 'M', '921025105030@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3578, 3, '921025105031', '921025105031', 'NANDHAKUMAR', 'S', '921025105031@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3579, 3, '921025105032', '921025105032', 'NAVEENA', 'N', '921025105032@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3580, 3, '921025105033', '921025105033', 'NIGITHA', 'R', '921025105033@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3581, 3, '921025105034', '921025105034', 'NITHISH', 'G', '921025105034@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3582, 3, '921025105035', '921025105035', 'NITHYA', 'DHARSHINI S', '921025105035@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3583, 3, '921025105036', '921025105036', 'NIVESH', 'E', '921025105036@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3584, 3, '921025105037', '921025105037', 'PADMASHRI', 'P', '921025105037@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3585, 3, '921025105038', '921025105038', 'PAVITHRA', 'S', '921025105038@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3586, 3, '921025105039', '921025105039', 'POOJA', 'M', '921025105039@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3587, 3, '921025105040', '921025105040', 'PRITHIKA', 'J', '921025105040@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3588, 3, '921025105041', '921025105041', 'RAGAVAN', 'S', '921025105041@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3589, 3, '921025105042', '921025105042', 'RUBINASRI', 'L', '921025105042@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3590, 3, '921025105043', '921025105043', 'SABARI', 'BALAJI A', '921025105043@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3591, 3, '921025105044', '921025105044', 'SANTHOSH', 'C', '921025105044@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3592, 3, '921025105045', '921025105045', 'SANTHOSH', 'M', '921025105045@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3593, 3, '921025105046', '921025105046', 'SARAVANA', 'MUTHU G', '921025105046@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3594, 3, '921025105047', '921025105047', 'SATHANA', 'R', '921025105047@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3595, 3, '921025105048', '921025105048', 'SATHYA', 'PRIYA S', '921025105048@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3596, 3, '921025105049', '921025105049', 'SELVARANI', 'M E', '921025105049@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3597, 3, '921025105050', '921025105050', 'SHAPNADEVI', 'P', '921025105050@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3598, 3, '921025105051', '921025105051', 'SIVABALAN', 'B', '921025105051@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3599, 3, '921025105052', '921025105052', 'SIVASAKTHI', 'J', '921025105052@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3600, 3, '921025105053', '921025105053', 'SOUNDHAR', 'RAJAN V', '921025105053@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3601, 3, '921025105054', '921025105054', 'SRIDHARSHINI', 'K', '921025105054@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3602, 3, '921025105055', '921025105055', 'SUNDARA', 'ADHITHAN S', '921025105055@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3603, 3, '921025105056', '921025105056', 'THARUN', 'M', '921025105056@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3604, 3, '921025105057', '921025105057', 'THIRUKUMARAN', 'M', '921025105057@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3605, 3, '921025105058', '921025105058', 'VIDHYA', 'R', '921025105058@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3606, 3, '921025105059', '921025105059', 'YOGITH', 'S', '921025105059@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3607, 3, '921025105060', '921025105060', 'YUVATHI', 'SRI A', '921025105060@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3608, 3, '921025104001', '921025104001', 'AATHISUNDARARAJAN', 'N', '921025104001@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3609, 3, '921025104002', '921025104002', 'AZLINA', 'M', '921025104002@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3610, 3, '921025104003', '921025104003', 'BHARATHI', 'M', '921025104003@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3611, 3, '921025104004', '921025104004', 'BHAVADHARANI', 'M', '921025104004@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3612, 3, '921025104005', '921025104005', 'DEVA', 'GURU G', '921025104005@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3613, 3, '921025104006', '921025104006', 'DHANUSHA', 'SRI J', '921025104006@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3614, 3, '921025104007', '921025104007', 'DHARSHINI', 'S', '921025104007@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3615, 3, '921025104008', '921025104008', 'DHARSHITH', 'R', '921025104008@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3616, 3, '921025104009', '921025104009', 'DIVYA', 'K', '921025104009@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3617, 3, '921025104010', '921025104010', 'DURGALAKSHMI', 'M', '921025104010@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3618, 3, '921025104011', '921025104011', 'GAYATHIRI', 'M', '921025104011@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3619, 3, '921025104012', '921025104012', 'GOKULA', 'KANNAN P G', '921025104012@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3620, 3, '921025104013', '921025104013', 'HAASINI', 'K', '921025104013@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3621, 3, '921025104014', '921025104014', 'HARIGARAN', 'K', '921025104014@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3622, 3, '921025104015', '921025104015', 'HARINI', 'K', '921025104015@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3623, 3, '921025104016', '921025104016', 'HARSHINI', 'S', '921025104016@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3624, 3, '921025104017', '921025104017', 'HARSHITHA', 'S', '921025104017@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3625, 3, '921025104018', '921025104018', 'IRFANA', 'S', '921025104018@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3626, 3, '921025104019', '921025104019', 'JAYANTHRA', 'K J', '921025104019@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3627, 3, '921025104020', '921025104020', 'JEYA', 'SREE P', '921025104020@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3628, 3, '921025104021', '921025104021', 'JUHI', 'NUSHRATH H', '921025104021@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3629, 3, '921025104022', '921025104022', 'KARTHIK', 'OMSHAKTHI K', '921025104022@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3630, 3, '921025104023', '921025104023', 'KAVIYA', 'K', '921025104023@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3631, 3, '921025104024', '921025104024', 'LATHIKA', 'K', '921025104024@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3632, 3, '921025104025', '921025104025', 'LISHANTHI', 'S', '921025104025@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3633, 3, '921025104026', '921025104026', 'MAHIMA', 'M', '921025104026@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3634, 3, '921025104027', '921025104027', 'MAHISHA', 'S', '921025104027@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3635, 3, '921025104028', '921025104028', 'MANIKANDAN', 'P', '921025104028@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3636, 3, '921025104029', '921025104029', 'MEGADHARSHINI', 'S', '921025104029@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3637, 3, '921025104030', '921025104030', 'MOHAMED', 'AFSAL K', '921025104030@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3638, 3, '921025104031', '921025104031', 'MOHANASANTHOSH', 'V', '921025104031@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3639, 3, '921025104032', '921025104032', 'MONISHA', 'S', '921025104032@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3640, 3, '921025104033', '921025104033', 'NETHRA', 'V', '921025104033@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17');
INSERT INTO `student_profile` (`id`, `role_id`, `studentId`, `rollNumber`, `firstName`, `lastName`, `email`, `phone`, `photo`, `gender`, `departmentId`, `classId`, `batch`, `semester`, `year`, `section`, `admissionDate`, `admissionType`, `feeStatus`, `status`, `password`, `createdAt`, `updatedAt`) VALUES
(3641, 3, '921025104034', '921025104034', 'NISHA', 'K', '921025104034@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3642, 3, '921025104035', '921025104035', 'NITHARSHANA', 'S', '921025104035@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3643, 3, '921025104036', '921025104036', 'POOJA', 'SRI P', '921025104036@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3644, 3, '921025104037', '921025104037', 'PRATHIKSHA', 'SRI S', '921025104037@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3645, 3, '921025104038', '921025104038', 'PRINCYMISPHA', 'C', '921025104038@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3646, 3, '921025104039', '921025104039', 'PRIYADHARSHINI', 'P', '921025104039@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3647, 3, '921025104040', '921025104040', 'PUGAZHENTHI', 'G', 'gpugal06@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3648, 3, '921025104041', '921025104041', 'RAGA', 'SRI V', '921025104041@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3649, 3, '921025104042', '921025104042', 'RIYA', 'R', '921025104042@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3650, 3, '921025104043', '921025104043', 'SAMRUTHA', 'P', '921025104043@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3651, 3, '921025104044', '921025104044', 'SANTHANAGOWSHIKA', 'K', '921025104044@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3652, 3, '921025104045', '921025104045', 'SANTHIYA', 'C', '921025104045@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3653, 3, '921025104046', '921025104046', 'SANTHOSI', 'S', '921025104046@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3654, 3, '921025104047', '921025104047', 'SELVALAKSHMI', 'M', '921025104047@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3655, 3, '921025104048', '921025104048', 'SHAHANA', 'P', '921025104048@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3656, 3, '921025104049', '921025104049', 'SHAKTHI', 'R', '921025104049@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3657, 3, '921025104050', '921025104050', 'SIVAKUMAR', 'K', '921025104050@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3658, 3, '921025104051', '921025104051', 'SOWMIYA', 'A', '921025104051@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3659, 3, '921025104052', '921025104052', 'SREEJA', 'R', '921025104052@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3660, 3, '921025104053', '921025104053', 'SRIVAISHNAVI', 'M', '921025104053@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3661, 3, '921025104054', '921025104054', 'SUBATHRA', 'M', '921025104054@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3662, 3, '921025104055', '921025104055', 'SURIYA', 'T', '921025104055@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3663, 3, '921025104056', '921025104056', 'VARSHINI', 'K', '921025104056@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3664, 3, '921025104057', '921025104057', 'VISHAL', 'R', '921025104057@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3665, 3, '921025104058', '921025104058', 'YASHIKAJAISHREE', 'M', '921025104058@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3666, 3, '921025104059', '921025104059', 'YOKHITHA', 'V', '921025104059@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3667, 3, '921025104060', '921025104060', 'YOSHITHA', 'K', '921025104060@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 2, '1', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3668, 3, '921023103001', '921023103001', 'AJAY', 'S', '921023103001@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3669, 3, '921023103002', '921023103002', 'BALA', 'S', '921023103002@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3670, 3, '921023103004', '921023103004', 'GURULAKSHMI', 'R', '921023103004@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3671, 3, '921023103005', '921023103005', 'HARIKRISHNAN', 'R', '921023103005@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3672, 3, '921023103006', '921023103006', 'HEMAPRIYA', 'K', '921023103006@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3673, 3, '921023103007', '921023103007', 'IYYANATHAN', 'M', '921023103007@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3674, 3, '921023103008', '921023103008', 'JEGANATH', 'M', '921023103008@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3675, 3, '921023103009', '921023103009', 'KABILAN', 'E T', '921023103009@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3676, 3, '921023103010', '921023103010', 'MADHUGAYATHRI', 'J', '921023103010@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3677, 3, '921023103011', '921023103011', 'MALATHI', 'S', '921023103011@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3678, 3, '921023103012', '921023103012', 'NITHIYA', 'SHREE S', '921023103012@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3679, 3, '921023103013', '921023103013', 'PRABHA', 'S', '921023103013@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3680, 3, '921023103014', '921023103014', 'PRATHIVARUN', 'P R', '921023103014@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3681, 3, '921023103016', '921023103016', 'SHAJITHA', 'PARVEEN R', '921023103016@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3682, 3, '921023103017', '921023103017', 'SUBITCHANASRI', 'S', '921023103017@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3683, 3, '921023103018', '921023103018', 'THANUJA', 'S', '921023103018@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3684, 3, '921023103301', '921023103301', 'GEERI', 'R', '921023103301@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3685, 3, '921023103302', '921023103302', 'PICHAIMUTHU', 'S', '921023103302@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 2, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3686, 3, '921024243001', '921024243001', 'ABARNA', 'K', '921024243001@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3687, 3, '921024243002', '921024243002', 'ABDUL', 'RAHMAN U', '921024243002@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3688, 3, '921024243003', '921024243003', 'ANBU', 'DHARSINI V', '921024243003@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3689, 3, '921024243004', '921024243004', 'ANEESHA', 'S', '921024243004@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3690, 3, '921024243005', '921024243005', 'ANUPRIYA', 'R', '921024243005@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3691, 3, '921024243006', '921024243006', 'AYISHA', 'ASMEE R', '921024243006@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3692, 3, '921024243007', '921024243007', 'BACKIYALAKSHMI', 'G', '921024243007@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3693, 3, '921024243008', '921024243008', 'BACKYALAKSHMI', 'M', '921024243008@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3694, 3, '921024243009', '921024243009', 'DEEPA', 'J', '921024243009@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3695, 3, '921024243010', '921024243010', 'DEVIDHARSHINI', 'P', '921024243010@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3696, 3, '921024243011', '921024243011', 'DEVIKALA', 'M', '921024243011@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3697, 3, '921024243012', '921024243012', 'DHARANI', 'D', '921024243012@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3698, 3, '921024243013', '921024243013', 'DHIVYA', 'M', '921024243013@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3699, 3, '921024243014', '921024243014', 'DINESH', 'BABU O', '921024243014@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3700, 3, '921024243015', '921024243015', 'DIVYA', 'VARSHINI N', '921024243015@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3701, 3, '921024243016', '921024243016', 'GOBI', 'P', '921024243016@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3702, 3, '921024243017', '921024243017', 'GOWTHAMAN', 'N', '921024243017@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3703, 3, '921024243018', '921024243018', 'HARIPRIYA', 'M', '921024243018@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3704, 3, '921024243019', '921024243019', 'HARIPRIYA', 'S', '921024243019@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3705, 3, '921024243020', '921024243020', 'HARSANTHINI', 'K', '921024243020@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3706, 3, '921024243021', '921024243021', 'HARSHINI', 'A', '921024243021@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3707, 3, '921024243022', '921024243022', 'JANANI', 'S', '921024243022@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3708, 3, '921024243023', '921024243023', 'JEEVITHA', 'S', '921024243023@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3709, 3, '921024243024', '921024243024', 'JOYS', 'KIRUBA J', '921024243024@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3710, 3, '921024243025', '921024243025', 'KABILAN', 'I', '921024243025@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3711, 3, '921024243026', '921024243026', 'KEERTHAN', 'A', '921024243026@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3712, 3, '921024243027', '921024243027', 'LAVANYA', 'A', '921024243027@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3713, 3, '921024243028', '921024243028', 'LOGAPRIYA', 'M', '921024243028@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3714, 3, '921024243029', '921024243029', 'MADHU', 'VARSHINI J', '921024243029@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3715, 3, '921024243030', '921024243030', 'NAGESWARI', 'S', '921024243030@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3716, 3, '921024243031', '921024243031', 'NITIN', 'KARTHICK J', '921024243031@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3717, 3, '921024243032', '921024243032', 'POOBATHI', 'RAJAN M', '921024243032@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3718, 3, '921024243033', '921024243033', 'PRAVEENKUMAR', 'A', '921024243033@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3719, 3, '921024243034', '921024243034', 'PRIYADHARSHINI', 'V', '921024243034@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3720, 3, '921024243035', '921024243035', 'RAJARAJESHWARI', 'N', '921024243035@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3721, 3, '921024243036', '921024243036', 'RAMACHANDRAN', 'M', '921024243036@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3722, 3, '921024243037', '921024243037', 'SAMIKSHA', 'D', '921024243037@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3723, 3, '921024243038', '921024243038', 'SASI', 'REGHA P', '921024243038@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3724, 3, '921024243039', '921024243039', 'SHAHANA', 'FIRDAUS  K', '921024243039@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3725, 3, '921024243040', '921024243040', 'SRI', 'KAVI P M', '921024243040@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3726, 3, '921024243041', '921024243041', 'SUBASHINI', 'M', '921024243041@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3727, 3, '921024243042', '921024243042', 'THANGA', 'PRABHU A', '921024243042@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3728, 3, '921024243043', '921024243043', 'THARUN', 'V', '921024243043@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3729, 3, '921024243044', '921024243044', 'THIRUNIKA', 'V S', '921024243044@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3730, 3, '921024243045', '921024243045', 'VARSHINI', 'S', '921024243045@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3731, 3, '921024243046', '921024243046', 'VIJAYALAKSHMI', 'K', '921024243046@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3732, 3, '921024243047', '921024243047', 'YAVANASHREE', 'R', '921024243047@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3733, 3, '921024243301', '921024243301', 'PANDEESWARAN', 'P', '921024243301@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3734, 3, '921024243302', '921024243302', 'VAISHNAVI', 'V', '921024243302@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3735, 3, '921024205001', '921024205001', 'ABBAS', 'MANTHIRI A', '921024205001@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3736, 3, '921024205002', '921024205002', 'ABIKCHANA', 'M', '921024205002@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3737, 3, '921024205003', '921024205003', 'ABINAYA', 'V', '921024205003@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3738, 3, '921024205004', '921024205004', 'AISHWARYA', 'S', '921024205004@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3739, 3, '921024205005', '921024205005', 'AKSHARA', 'M', '921024205005@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3740, 3, '921024205006', '921024205006', 'ANITHA', 'S', '921024205006@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3741, 3, '921024205007', '921024205007', 'DEVADHARSHINI', 'S', '921024205007@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3742, 3, '921024205008', '921024205008', 'DHARSHINI', 'K', '921024205008@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3743, 3, '921024205009', '921024205009', 'DHINESHKUMAR', 'V', '921024205009@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3744, 3, '921024205010', '921024205010', 'GANESH', 'BABU P', '921024205010@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3745, 3, '921024205011', '921024205011', 'GAYATHRI', 'P', '921024205011@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3746, 3, '921024205012', '921024205012', 'GOBINATH', 'G', '921024205012@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3747, 3, '921024205013', '921024205013', 'HARISH', 'K', '921024205013@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3748, 3, '921024205014', '921024205014', 'HEMA', 'M', '921024205014@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3749, 3, '921024205015', '921024205015', 'JEYASIVA', 'S', '921024205015@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3750, 3, '921024205016', '921024205016', 'KARUNYA', 'SHRI M', '921024205016@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3751, 3, '921024205017', '921024205017', 'KEERTHANA', 'S', '921024205017@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3752, 3, '921024205018', '921024205018', 'KRISHNAVENI', 'V', '921024205018@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3753, 3, '921024205019', '921024205019', 'LAKSHMI', 'PRIYA G', '921024205019@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3754, 3, '921024205020', '921024205020', 'MAHESWARI', 'M', '921024205020@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3755, 3, '921024205021', '921024205021', 'MANISHVARMA', 'S', '921024205021@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3756, 3, '921024205022', '921024205022', 'MANJULA', 'S', '921024205022@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3757, 3, '921024205023', '921024205023', 'NIVETHA', 'J', '921024205023@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3758, 3, '921024205024', '921024205024', 'PAVITHRA', 'M', '921024205024@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3759, 3, '921024205026', '921024205026', 'PRAVEENA', 'N', '921024205026@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3760, 3, '921024205027', '921024205027', 'PRIYADHARSHINI', 'M', '921024205027@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3761, 3, '921024205028', '921024205028', 'PRIYANGA', 'G', '921024205028@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3762, 3, '921024205029', '921024205029', 'RAJESHWARI', 'V', '921024205029@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3763, 3, '921024205030', '921024205030', 'RESHMA', 'S', '921024205030@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3764, 3, '921024205032', '921024205032', 'SAHANA', 'S', '921024205032@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3765, 3, '921024205033', '921024205033', 'SARAN', 'SANJAI M', '921024205033@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3766, 3, '921024205034', '921024205034', 'SATHYABAMA', 'G', '921024205034@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3767, 3, '921024205035', '921024205035', 'SHANMUGAPRIYA', 'N', '921024205035@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3768, 3, '921024205036', '921024205036', 'SHARVESWARAN', 'S P', '921024205036@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3769, 3, '921024205037', '921024205037', 'SIVA', 'PRADEEP M', '921024205037@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3770, 3, '921024205038', '921024205038', 'SIVASANDHYA', 'K', '921024205038@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3771, 3, '921024205039', '921024205039', 'SRINITHI', 'A', '921024205039@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3772, 3, '921024205040', '921024205040', 'SRI', 'SAI NIVASHINI S', '921024205040@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3773, 3, '921024205041', '921024205041', 'SWEETY', 'R', '921024205041@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3774, 3, '921024205042', '921024205042', 'SWEETY', 'V', '921024205042@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3775, 3, '921024205043', '921024205043', 'THANGA', 'RAJA VARSHINI S', '921024205043@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3776, 3, '921024205044', '921024205044', 'THARICK', 'AHAMED A', '921024205044@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3777, 3, '921024205045', '921024205045', 'VISHALINI', 'V', '921024205045@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3778, 3, '921024114001', '921024114001', 'ABARNA', 'B', '921024114001@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3779, 3, '921024114002', '921024114002', 'ABINESH', 'T', '921024114002@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3780, 3, '921024114003', '921024114003', 'ABISHEK', 'N', '921024114003@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3781, 3, '921024114005', '921024114005', 'BHARATHWAJ', 'G', '921024114005@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3782, 3, '921024114006', '921024114006', 'BHUPESH', 'G T', '921024114006@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3783, 3, '921024114007', '921024114007', 'CHANDRESHWARAN', 'G', '921024114007@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3784, 3, '921024114008', '921024114008', 'DHECHITH', 'J', '921024114008@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3785, 3, '921024114009', '921024114009', 'JEEVA', 'R', '921024114009@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3786, 3, '921024114010', '921024114010', 'KAVIRANJANI', 'M', '921024114010@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3787, 3, '921024114011', '921024114011', 'LATHIKA', 'R', '921024114011@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3788, 3, '921024114012', '921024114012', 'MANOJRAJ', 'R', '921024114012@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3789, 3, '921024114013', '921024114013', 'MOHAN', 'RAJ P', '921024114013@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3790, 3, '921024114014', '921024114014', 'NAVINRAJ', 'M', '921024114014@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3791, 3, '921024114015', '921024114015', 'RAHUL', 'KRISHNA G', '921024114015@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3792, 3, '921024114016', '921024114016', 'RANJITH', 'KUMAR K', '921024114016@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3793, 3, '921024114017', '921024114017', 'RIYAZ', 'AHAMED S', '921024114017@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3794, 3, '921024114018', '921024114018', 'SAKTHIVEL', 'PANDI K', '921024114018@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3795, 3, '921024114019', '921024114019', 'SANJAY', 'RAMKUMAR M', '921024114019@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17');
INSERT INTO `student_profile` (`id`, `role_id`, `studentId`, `rollNumber`, `firstName`, `lastName`, `email`, `phone`, `photo`, `gender`, `departmentId`, `classId`, `batch`, `semester`, `year`, `section`, `admissionDate`, `admissionType`, `feeStatus`, `status`, `password`, `createdAt`, `updatedAt`) VALUES
(3796, 3, '921024114020', '921024114020', 'SANJAY', 'THALAIKUMAR M', '921024114020@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3797, 3, '921024114021', '921024114021', 'SANTHOSH', 'M', '921024114021@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3798, 3, '921024114022', '921024114022', 'SARATHI', 'S', '921024114022@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3799, 3, '921024114023', '921024114023', 'SENTHIL', 'MURUGAN K', '921024114023@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3800, 3, '921024114024', '921024114024', 'SIDDHARTHAN', 'E', '921024114024@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3801, 3, '921024114025', '921024114025', 'SRINIVASAN', 'R', '921024114025@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3802, 3, '921024114026', '921024114026', 'SUDHARSAN', 'S', '921024114026@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3803, 3, '921024114027', '921024114027', 'SUMAN', 'KUMAR B', '921024114027@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3804, 3, '921024114028', '921024114028', 'VETRIVEL', 'K', '921024114028@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3805, 3, '921024114029', '921024114029', 'VIGNESHKUMAR', 'M', '921024114029@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3806, 3, '921024114030', '921024114030', 'VISHAL', 'S', '921024114030@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3807, 3, '921024114031', '921024114031', 'YOGA', 'ARJUN R S', '921024114031@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3808, 3, '921024114032', '921024114032', 'YUVASARAVANAKUMAR', 'P', '921024114032@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3809, 3, '921024106001', '921024106001', 'ABARNA', 'A', '921024106001@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3810, 3, '921024106002', '921024106002', 'ANU', 'SHREE R', '921024106002@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3811, 3, '921024106003', '921024106003', 'ASHWATHIKA', 'G', '921024106003@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3812, 3, '921024106004', '921024106004', 'ASWANTHIKA', 'R', '921024106004@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3813, 3, '921024106005', '921024106005', 'BHARATHI', 'M', '921024106005@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3814, 3, '921024106006', '921024106006', 'BHAVYASRI', 'M', '921024106006@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3815, 3, '921024106007', '921024106007', 'BUVANESHWARI', 'K', '921024106007@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3816, 3, '921024106008', '921024106008', 'DAKSHITHA', 'R', '921024106008@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3817, 3, '921024106009', '921024106009', 'DEEPA', 'S S', '921024106009@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3818, 3, '921024106010', '921024106010', 'DEEPAKRAJ', 'S', '921024106010@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3819, 3, '921024106011', '921024106011', 'DEEPIKA', 'S', '921024106011@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3820, 3, '921024106012', '921024106012', 'DHARSHINI', 'K', '921024106012@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3821, 3, '921024106013', '921024106013', 'DHARSHINI', 'PRIYA V', '921024106013@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3822, 3, '921024106014', '921024106014', 'DHEJESH', 'KANNAN M', '921024106014@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3823, 3, '921024106015', '921024106015', 'DIVYA', 'SHREE S R', '921024106015@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3824, 3, '921024106016', '921024106016', 'GIRIVISHNU', 'M', '921024106016@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3825, 3, '921024106017', '921024106017', 'GOKILAVANI', 'P', '921024106017@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3826, 3, '921024106018', '921024106018', 'GOKUL', 'R', '921024106018@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3827, 3, '921024106019', '921024106019', 'GURUPRASATH', 'M', '921024106019@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3828, 3, '921024106020', '921024106020', 'HARINANTHASRI', 'S', '921024106020@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3829, 3, '921024106021', '921024106021', 'HARSHAVARDHINI', 'P', '921024106021@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3830, 3, '921024106022', '921024106022', 'JANANI', 'SRI T', '921024106022@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3831, 3, '921024106023', '921024106023', 'JENELIA', 'S', '921024106023@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3832, 3, '921024106024', '921024106024', 'KALEP', 'G', '921024106024@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3833, 3, '921024106025', '921024106025', 'KAVIYA', 'V', '921024106025@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3834, 3, '921024106026', '921024106026', 'KISHORE', 'KANNAN S', '921024106026@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3835, 3, '921024106027', '921024106027', 'KUMUTHAVALLI', 'S', '921024106027@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3836, 3, '921024106028', '921024106028', 'MUKILAN', 'R', '921024106028@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3837, 3, '921024106029', '921024106029', 'NATHISHA', 'R', '921024106029@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3838, 3, '921024106030', '921024106030', 'NIMAL', 'K', '921024106030@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3839, 3, '921024106031', '921024106031', 'PAVITHRA', 'S', '921024106031@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3840, 3, '921024106032', '921024106032', 'POOVITHA', 'M', '921024106032@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3841, 3, '921024106033', '921024106033', 'PRADEEPA', 'M', '921024106033@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3842, 3, '921024106034', '921024106034', 'PRAVEENA', 'K', '921024106034@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3843, 3, '921024106035', '921024106035', 'PRIYANGA', 'S', '921024106035@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3844, 3, '921024106036', '921024106036', 'RIDDHI', 'SHREE P', '921024106036@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3845, 3, '921024106037', '921024106037', 'RISHI', 'PRIYAN S', '921024106037@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3846, 3, '921024106038', '921024106038', 'SAKTHI', 'DHARANI K', '921024106038@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3847, 3, '921024106039', '921024106039', 'SARANRAJ', 'M', '921024106039@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3848, 3, '921024106040', '921024106040', 'SARMILI', 'SHAKSHI S', '921024106040@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3849, 3, '921024106041', '921024106041', 'SRIDHARSHINI', 'S', '921024106041@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3850, 3, '921024106042', '921024106042', 'SWATHY', 'G', '921024106042@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3851, 3, '921024106043', '921024106043', 'THRISHA', 'B', '921024106043@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3852, 3, '921024106044', '921024106044', 'UMA', 'V', '921024106044@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3853, 3, '921024106045', '921024106045', 'VISHVA', 'S', '921024106045@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3854, 3, '921024106701', '921024106701', 'SRI', 'SHARAN R', '921024106701@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3855, 3, '921024105001', '921024105001', 'ANUSRI', 'S', '921024105001@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3856, 3, '921024105002', '921024105002', 'DEVA', 'DHARSHINI S', '921024105002@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3857, 3, '921024105003', '921024105003', 'DHANUSHKA', 'P', '921024105003@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3858, 3, '921024105004', '921024105004', 'DHARANI', 'R', '921024105004@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3859, 3, '921024105005', '921024105005', 'DHARNIKA', 'R', '921024105005@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3860, 3, '921024105006', '921024105006', 'DHARANISRI', 'K', '921024105006@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3861, 3, '921024105007', '921024105007', 'DINESHKUMAR', 'S', '921024105007@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3862, 3, '921024105008', '921024105008', 'GAYATHIRI', 'DEVI B', '921024105008@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3863, 3, '921024105009', '921024105009', 'ISHANI', 'K', '921024105009@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3864, 3, '921024105010', '921024105010', 'ISWARYA', 'S', '921024105010@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3865, 3, '921024105011', '921024105011', 'KANISHKA', 'J', '921024105011@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3866, 3, '921024105013', '921024105013', 'MOHAMED', 'ANAS K', '921024105013@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3867, 3, '921024105014', '921024105014', 'NAGAJOTHI', 'P', '921024105014@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3868, 3, '921024105015', '921024105015', 'PANDI', 'SELVI S', '921024105015@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3869, 3, '921024105016', '921024105016', 'PRIYA', 'S', '921024105016@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3870, 3, '921024105017', '921024105017', 'RAHINI', 'S', '921024105017@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3871, 3, '921024105018', '921024105018', 'RAJIYA', 'SULTHANA A', '921024105018@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3872, 3, '921024105019', '921024105019', 'RAKESHRAJA', 'R', '921024105019@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3873, 3, '921024105020', '921024105020', 'RAMYA', 'S', '921024105020@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3874, 3, '921024105021', '921024105021', 'SHAHANA', 'V S', '921024105021@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3875, 3, '921024105023', '921024105023', 'SURYAH', 'S', '921024105023@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3876, 3, '921024105024', '921024105024', 'TAMILSELVAN', 'P', '921024105024@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3877, 3, '921024105025', '921024105025', 'THILAKKUMAR', 'S', '921024105025@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3878, 3, '921024105026', '921024105026', 'THIRUMAL', 'SELVAN M', '921024105026@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3879, 3, '921024105027', '921024105027', 'VAISHALI', 'S', '921024105027@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3880, 3, '921024105028', '921024105028', 'VISHWA', 'R', '921024105028@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3881, 3, '921024105301', '921024105301', 'KESAVA', 'PERUMAL T', '921024105301@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3882, 3, '921024104001', '921024104001', 'ADHITHIYA', 'S', '921024104001@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3883, 3, '921024104002', '921024104002', 'ANGALA', 'DHAN VARSHINI P R', '921024104002@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3884, 3, '921024104003', '921024104003', 'ANU', 'VIASHINI M', '921024104003@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3885, 3, '921024104004', '921024104004', 'ARCHANA', 'B', '921024104004@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3886, 3, '921024104005', '921024104005', 'ASIFA', 'SHEREEN S', '921024104005@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3887, 3, '921024104006', '921024104006', 'ASMATH', 'NABILA A', '921024104006@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3888, 3, '921024104007', '921024104007', 'CHELLAMUTHUKUMAR', 'P', '921024104007@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3889, 3, '921024104008', '921024104008', 'DIYASRI', 'P', '921024104008@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3890, 3, '921024104009', '921024104009', 'DURGADEVI', 'V', '921024104009@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3891, 3, '921024104010', '921024104010', 'GAYATHRI', 'K', '921024104010@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3892, 3, '921024104011', '921024104011', 'GOKULAPRIYAN', 'I', '921024104011@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3893, 3, '921024104012', '921024104012', 'HARIDHARSHINI', 'R', '921024104012@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3894, 3, '921024104013', '921024104013', 'HARINI', 'M', '921024104013@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3895, 3, '921024104014', '921024104014', 'HEMASREE', 'V', '921024104014@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3896, 3, '921024104015', '921024104015', 'IRFANA', 'BEGAM A', '921024104015@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3897, 3, '921024104016', '921024104016', 'JASON', 'ANTONY J', '921024104016@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3898, 3, '921024104017', '921024104017', 'JEEVA', 'DHARSHINI P', '921024104017@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3899, 3, '921024104018', '921024104018', 'JEEVITHA', 'SRI K', 'jeevithasrik2006@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3900, 3, '921024104019', '921024104019', 'JESLIN', 'SHARON J', '921024104019@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3901, 3, '921024104020', '921024104020', 'JOSHUA', 'A', '921024104020@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3902, 3, '921024104021', '921024104021', 'KANIPRIYA', 'S', '921024104021@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3903, 3, '921024104022', '921024104022', 'KISHO', 'VARMA K', '921024104022@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3904, 3, '921024104023', '921024104023', 'LATHIKA', 'KAMATCHI K', '921024104023@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3905, 3, '921024104024', '921024104024', 'LIYONAA', 'R', '921024104024@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3906, 3, '921024104025', '921024104025', 'MARIMUTHU', 'J', '921024104025@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3907, 3, '921024104026', '921024104026', 'MONIKA', 'SRI P', '921024104026@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3908, 3, '921024104027', '921024104027', 'MUTHAIYA', 'MURALITHARAN M', '921024104027@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3909, 3, '921024104028', '921024104028', 'NIKIL', 'R', '921024104028@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3910, 3, '921024104029', '921024104029', 'NITHARSANA', 'M', '921024104029@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3911, 3, '921024104030', '921024104030', 'NIVETHA', 'S', '921024104030@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3912, 3, '921024104031', '921024104031', 'POOVARASAN', 'L', '921024104031@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3913, 3, '921024104032', '921024104032', 'PRASHITHAA', 'J', 'prashilatha1511@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3914, 3, '921024104034', '921024104034', 'PRAVEEN', 'KUMAR P', '921024104034@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3915, 3, '921024104035', '921024104035', 'RASEETHA', 'PARVEEN M', '921024104035@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3916, 3, '921024104036', '921024104036', 'RITHIKA', 'SRI S', '921024104036@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3917, 3, '921024104037', '921024104037', 'ROOBA', 'SREE N', '921024104037@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3918, 3, '921024104038', '921024104038', 'SABITHA', 'G', '921024104038@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3919, 3, '921024104039', '921024104039', 'SAKTHI', 'SRI S', '921024104039@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3920, 3, '921024104040', '921024104040', 'SANCHANAA', 'S', '921024104040@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3921, 3, '921024104041', '921024104041', 'SANTHOSH', 'KUMAR G', '921024104041@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3922, 3, '921024104042', '921024104042', 'SASIPRAVEEN', 'S', 'sasipraveen963@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3923, 3, '921024104043', '921024104043', 'SELVAKUMAR', 'V', '921024104043@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3924, 3, '921024104044', '921024104044', 'SHAKTHI', 'BHARATHI D T', '921024104044@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3925, 3, '921024104045', '921024104045', 'SHALNI', 'V', '921024104045@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3926, 3, '921024104046', '921024104046', 'SHASMITHA', 'M', '921024104046@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3927, 3, '921024104047', '921024104047', 'SHRIJA', 'M', '921024104047@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3928, 3, '921024104048', '921024104048', 'SHYAM', 'RAJ Y', '921024104048@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3929, 3, '921024104049', '921024104049', 'SONIADEVI', 'K', '921024104049@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3930, 3, '921024104050', '921024104050', 'SUGAPPRIYAN', 'S', '921024104050@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3931, 3, '921024104051', '921024104051', 'SUNDARRAJAPERUMAL', 'G', '921024104051@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3932, 3, '921024104052', '921024104052', 'UDHAYAPRAKASH', 'S', '921024104052@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3933, 3, '921024104053', '921024104053', 'VANITHA', 'R', '921024104053@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3934, 3, '921024104054', '921024104054', 'VEDHASREE', 'S', '921024104054@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3935, 3, '921024104055', '921024104055', 'YAZHINI', 'M', '921024104055@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3936, 3, '921024104056', '921024104056', 'YOHESH', 'K', '921024104056@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3937, 3, '921024104301', '921024104301', 'JOTHI', 'RAM K', '921024104301@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3938, 3, '921024104701', '921024104701', 'DEETSANYA', 'R', '921024104701@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3939, 3, '921024104702', '921024104702', 'RITHIKA', 'M', '921024104702@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3940, 3, '921024103001', '921024103001', 'AKSHAYADEVI', 'R', '921024103001@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3941, 3, '921024103002', '921024103002', 'ANBUSUBASHINI', 'A', '921024103002@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3942, 3, '921024103003', '921024103003', 'ANBU', 'VASANTHAN S', '921024103003@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3943, 3, '921024103004', '921024103004', 'ANGAMA', 'PREMA M', '921024103004@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3944, 3, '921024103005', '921024103005', 'ARUNKUMAR', 'N', '921024103005@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3945, 3, '921024103006', '921024103006', 'AZHAGARASI', 'P', '921024103006@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3946, 3, '921024103007', '921024103007', 'DAVID', 'JOSHWA A', '921024103007@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3947, 3, '921024103008', '921024103008', 'DHANYASHRI', 'R', '921024103008@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3948, 3, '921024103009', '921024103009', 'GUNASRI', 'P', '921024103009@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3949, 3, '921024103010', '921024103010', 'MANIMEGALA', 'P', '921024103010@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3950, 3, '921024103011', '921024103011', 'MANOBARATH', 'E', '921024103011@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17');
INSERT INTO `student_profile` (`id`, `role_id`, `studentId`, `rollNumber`, `firstName`, `lastName`, `email`, `phone`, `photo`, `gender`, `departmentId`, `classId`, `batch`, `semester`, `year`, `section`, `admissionDate`, `admissionType`, `feeStatus`, `status`, `password`, `createdAt`, `updatedAt`) VALUES
(3951, 3, '921024103012', '921024103012', 'MATHUMITHA', 'J', '921024103012@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3952, 3, '921024103013', '921024103013', 'MOHANAPRIYA', 'R', '921024103013@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3953, 3, '921024103014', '921024103014', 'MUFIN', 'RIYANA T', '921024103014@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3954, 3, '921024103015', '921024103015', 'NISANTH', 'M', '921024103015@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3955, 3, '921024103016', '921024103016', 'PRADEEP', 'P', '921024103016@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3956, 3, '921024103017', '921024103017', 'RUBINI', 'C', '921024103017@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3957, 3, '921024103018', '921024103018', 'SANDHIYA', 'N', '921024103018@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3958, 3, '921024103019', '921024103019', 'SARANYA', 'M', '921024103019@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3959, 3, '921024103020', '921024103020', 'SARAVANAN', 'A', '921024103020@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3960, 3, '921024103021', '921024103021', 'SIDDHARTHAN', 'P', '921024103021@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3961, 3, '921024103022', '921024103022', 'SIVAKEERTHANA', 'M', '921024103022@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3962, 3, '921024103023', '921024103023', 'SRI', 'VAISHNAVI V', '921024103023@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3963, 3, '921024103024', '921024103024', 'SUBATHRA', 'S', '921024103024@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3964, 3, '921024103025', '921024103025', 'SWETHA', 'S', '921024103025@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3965, 3, '921024103026', '921024103026', 'THASLEEMA', 'NISREEN A', '921024103026@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3966, 3, '921024103301', '921024103301', 'MAHESHWARI', 'M', '921024103301@nscet.org', '9876543210', 'default-student.png', 'male', 2, NULL, '2021-2025', 4, '2', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3967, 3, '921023243001', '921023243001', 'AJAY', 'PRASATH K', '921023243001@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3968, 3, '921023243002', '921023243002', 'ANFIYAA', 'M', '921023243002@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3969, 3, '921023243004', '921023243004', 'ASIM', 'FATHIMA P', '921023243004@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3970, 3, '921023243005', '921023243005', 'BALAJI', 'B', '921023243005@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3971, 3, '921023243006', '921023243006', 'DEVENDRA', 'KUMAR P', '921023243006@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3972, 3, '921023243007', '921023243007', 'GOKUL', 'M', '921023243007@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3973, 3, '921023243008', '921023243008', 'HARI', 'PRABHA S', '921023243008@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3974, 3, '921023243009', '921023243009', 'KAVIYAMAHESHWARI', 'J', '921023243009@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3975, 3, '921023243010', '921023243010', 'LOGESH', 'KUMAR R', '921023243010@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3976, 3, '921023243011', '921023243011', 'MALARVIZHI', 'S', '921023243011@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3977, 3, '921023243012', '921023243012', 'MUTHULAKSHMI', 'P', '921023243012@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3978, 3, '921023243013', '921023243013', 'MUTHUMARI', 'M', '921023243013@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3979, 3, '921023243014', '921023243014', 'PRITHIKA', 'S', '921023243014@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3980, 3, '921023243015', '921023243015', 'RAJAPRABA', 'R', '921023243015@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3981, 3, '921023243016', '921023243016', 'RUUBANRAJ', 'R', '921023243016@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3982, 3, '921023243017', '921023243017', 'SAFIKUL', 'FARINAZ S', '921023243017@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3983, 3, '921023243018', '921023243018', 'SHRIMATHI', 'R', '921023243018@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3984, 3, '921023243019', '921023243019', 'SRI', 'HARINI PRIYA S', '921023243019@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3985, 3, '921023243020', '921023243020', 'SUSMITHA', 'S', '921023243020@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3986, 3, '921023243021', '921023243021', 'VARUNI', 'T', '921023243021@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3987, 3, '921023243022', '921023243022', 'VASUKI', 'P', '921023243022@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3988, 3, '921023243023', '921023243023', 'VISHALINI', 'K', '921023243023@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3989, 3, '921023243024', '921023243024', 'VISHNU', 'PARAMESH B', '921023243024@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3990, 3, '921023243025', '921023243025', 'YOGESHKUMAR', 'R', '921023243025@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3991, 3, '921023243026', '921023243026', 'YOKESH', 'J', '921023243026@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3992, 3, '921023243027', '921023243027', 'YUKTHA', 'S', '921023243027@nscet.org', '9876543210', 'default-student.png', 'male', 6, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3993, 3, '921023205001', '921023205001', 'ABI', 'S', '921023205001@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3994, 3, '921023205002', '921023205002', 'ANUDARSHNI', 'A', '921023205002@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3995, 3, '921023205003', '921023205003', 'ARCHANA', 'DEVI C', '921023205003@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3996, 3, '921023205004', '921023205004', 'DHIVYA', 'DHARSHINI S', '921023205004@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3997, 3, '921023205005', '921023205005', 'DIVYASRI', 'P', '921023205005@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3998, 3, '921023205006', '921023205006', 'HARINI', 'P', '921023205006@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(3999, 3, '921023205007', '921023205007', 'ISMATH', 'FATHIMA J', '921023205007@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4000, 3, '921023205008', '921023205008', 'JEBANIKITHA', 'N', '921023205008@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4001, 3, '921023205009', '921023205009', 'LOGESHWARI', 'S', '921023205009@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4002, 3, '921023205010', '921023205010', 'MONIKA', 'B', '921023205010@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4003, 3, '921023205011', '921023205011', 'NAVEENA', 'G', '921023205011@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4004, 3, '921023205012', '921023205012', 'NITHYA', 'SRI M', '921023205012@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4005, 3, '921023205013', '921023205013', 'NOORUL', 'NAFEELA A', '921023205013@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4006, 3, '921023205014', '921023205014', 'PANDIYARAJAN', 'K', '921023205014@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4007, 3, '921023205015', '921023205015', 'RISHIKESH', 'K', '921023205015@nscet.org', '9876543210', '/uploads/students/rishikesh_k.jpeg', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-23 18:16:30'),
(4008, 3, '921023205016', '921023205016', 'SAFRIN', 'T', '921023205016@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4009, 3, '921023205017', '921023205017', 'SAHANA', 'G', '921023205017@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4010, 3, '921023205018', '921023205018', 'SHAHANA', 'V', '921023205018@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4011, 3, '921023205019', '921023205019', 'SINDHU', 'S', '921023205019@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4012, 3, '921023205020', '921023205020', 'SIVAYOGGA', 'K', '921023205020@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4013, 3, '921023205021', '921023205021', 'SONI', 'P', '921023205021@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4014, 3, '921023205022', '921023205022', 'SOWMIYA', 'K', '921023205022@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4015, 3, '921023205023', '921023205023', 'SUJITHA', 'B', '921023205023@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4016, 3, '921023205024', '921023205024', 'THANUSHKUMAR', 'P', '921023205024@nscet.org', '9876543210', '/uploads/students/thanushkumar_p.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 06:28:12'),
(4017, 3, '921023205025', '921023205025', 'VAITHEESHWARI', 'R', '921023205025@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4018, 3, '921023205026', '921023205026', 'VANI', 'SRI M', '921023205026@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4019, 3, '921023205027', '921023205027', 'YOKESHKUMAR', 'R', '921023205027@nscet.org', '9876543210', 'default-student.png', 'male', 7, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4020, 3, '921023114001', '921023114001', 'AJAY', 'D', '921023114001@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4021, 3, '921023114002', '921023114002', 'DHIYANESH', 'K', '921023114002@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4022, 3, '921023114003', '921023114003', 'HARIRAM', 'R', '921023114003@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4023, 3, '921023114004', '921023114004', 'KARUTHAPANDI', 'E', '921023114004@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4024, 3, '921023114005', '921023114005', 'PANDEESWARAN', 'B', '921023114005@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4025, 3, '921023114006', '921023114006', 'RAJESH', 'KUMAR M', '921023114006@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4026, 3, '921023114007', '921023114007', 'SANJAY', 'K', '921023114007@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4027, 3, '921023114008', '921023114008', 'SATHISH', 'P', '921023114008@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4028, 3, '921023114009', '921023114009', 'YOGESH', 'G', '921023114009@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4029, 3, '921023114301', '921023114301', 'DEEPAN', 'RAJ E', '921023114301@nscet.org', '9876543210', 'default-student.png', 'male', 5, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4030, 3, '921023106001', '921023106001', 'AATHEESWARAN', 'M', '921023106001@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4031, 3, '921023106002', '921023106002', 'ADITHYAN', 'V', '921023106002@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4032, 3, '921023106003', '921023106003', 'ANANTHA', 'RAM A', '921023106003@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4033, 3, '921023106004', '921023106004', 'ANTON', 'MATTEW A', '921023106004@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4034, 3, '921023106005', '921023106005', 'ANUSHASRI', 'D', '921023106005@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4035, 3, '921023106006', '921023106006', 'ASHVANI', 'S', '921023106006@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4036, 3, '921023106007', '921023106007', 'ATCHAYAKAMALI', 'V', '921023106007@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4037, 3, '921023106008', '921023106008', 'DEEPIKA', 'SRI K', '921023106008@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4038, 3, '921023106009', '921023106009', 'DEVADHARSHINI', 'K', '921023106009@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4039, 3, '921023106010', '921023106010', 'DHANALAKSHMI', 'S', '921023106010@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4040, 3, '921023106011', '921023106011', 'DHASHINA', 'S', '921023106011@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4041, 3, '921023106012', '921023106012', 'DURGASRI', 'A', '921023106012@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4042, 3, '921023106014', '921023106014', 'GOBINATH', 'M', '921023106014@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4043, 3, '921023106015', '921023106015', 'GOPIKA', 'M', '921023106015@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4044, 3, '921023106016', '921023106016', 'HARIMURUGAN', 'S', '921023106016@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4045, 3, '921023106018', '921023106018', 'JEEVANA', 'M', '921023106018@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4046, 3, '921023106019', '921023106019', 'JEEVANANDHAM', 'A', '921023106019@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4047, 3, '921023106020', '921023106020', 'JEEVETHA', 'P', '921023106020@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4048, 3, '921023106021', '921023106021', 'JEYAHARINISHREE', 'R', '921023106021@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4049, 3, '921023106022', '921023106022', 'JEYAPRIYA', 'L M', '921023106022@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4050, 3, '921023106023', '921023106023', 'JEYASRI', 'K', '921023106023@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4051, 3, '921023106024', '921023106024', 'KARTHIK', 'V', '921023106024@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4052, 3, '921023106025', '921023106025', 'KARTHIKRAJA', 'V', '921023106025@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4053, 3, '921023106026', '921023106026', 'KAVIYA', 'R', '921023106026@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4054, 3, '921023106027', '921023106027', 'KIRUTHIKA', 'M', '921023106027@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4055, 3, '921023106028', '921023106028', 'MANIKANDAN', 'M', '921023106028@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4056, 3, '921023106029', '921023106029', 'MAREESWARI', 'B', '921023106029@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4057, 3, '921023106030', '921023106030', 'MOGANA', 'PRIYA M', '921023106030@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4058, 3, '921023106031', '921023106031', 'MOHANAMITHRAA', 'M', '921023106031@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4059, 3, '921023106032', '921023106032', 'NAGAJOTHI', 'S', '921023106032@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4060, 3, '921023106033', '921023106033', 'NAGESHWARAN', 'K', '921023106033@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4061, 3, '921023106034', '921023106034', 'NANDHINI', 'R', '921023106034@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4062, 3, '921023106035', '921023106035', 'PIRIYA', 'LAXMI E', '921023106035@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4063, 3, '921023106036', '921023106036', 'POOJA', 'P', '921023106036@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4064, 3, '921023106037', '921023106037', 'RATHEESWARI', 'P', '921023106037@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4065, 3, '921023106038', '921023106038', 'RESHMA', 'K', '921023106038@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4066, 3, '921023106039', '921023106039', 'SABRIN', 'FATHIMA Z', '921023106039@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4067, 3, '921023106040', '921023106040', 'SADHA', 'SRI V', '921023106040@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4068, 3, '921023106041', '921023106041', 'SAMEENA', 'BANU P', '921023106041@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4069, 3, '921023106042', '921023106042', 'SANKARA', 'NARAYANAN S', '921023106042@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4070, 3, '921023106043', '921023106043', 'SANTHIYA', 'G', '921023106043@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4071, 3, '921023106044', '921023106044', 'SHARVARI', 'S', '921023106044@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4072, 3, '921023106045', '921023106045', 'SRINITHI', 'C', '921023106045@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4073, 3, '921023106046', '921023106046', 'SUBASRI', 'M', '921023106046@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4074, 3, '921023106047', '921023106047', 'SUGESHRAM', 'R', '921023106047@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4075, 3, '921023106048', '921023106048', 'SWATHI', 'K', '921023106048@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4076, 3, '921023106049', '921023106049', 'SWETHASREE', 'P', '921023106049@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4077, 3, '921023106050', '921023106050', 'VIJAYARAGAVAN', 'C', '921023106050@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4078, 3, '921023106701', '921023106701', 'KAVIYA', 'SHREE B', '921023106701@nscet.org', '9876543210', 'default-student.png', 'male', 3, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4079, 3, '921023105001', '921023105001', 'AKASH', 'S', '921023105001@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4080, 3, '921023105003', '921023105003', 'BOOMIGA', 'M', '921023105003@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4081, 3, '921023105004', '921023105004', 'BRINDHA', 'K', '921023105004@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4082, 3, '921023105006', '921023105006', 'DARUN', 'KUMAR K', '921023105006@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4083, 3, '921023105007', '921023105007', 'DEEPIKALAKSHAYA', 'M', '921023105007@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4084, 3, '921023105008', '921023105008', 'DHARUNRAJ', 'K', '921023105008@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4085, 3, '921023105009', '921023105009', 'DHARUNYASHREE', 'S', '921023105009@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4086, 3, '921023105010', '921023105010', 'GANESHKUMAR', 'K', '921023105010@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4087, 3, '921023105011', '921023105011', 'GAYATHRI', 'S', '921023105011@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4088, 3, '921023105012', '921023105012', 'GURUPRASATH', 'M', '921023105012@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4089, 3, '921023105013', '921023105013', 'HARINA', 'S', '921023105013@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4090, 3, '921023105014', '921023105014', 'ISWARYA', 'S', '921023105014@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4091, 3, '921023105015', '921023105015', 'JAYASRI', 'P N', '921023105015@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4092, 3, '921023105016', '921023105016', 'KARTHICKRAJAN', 'T', '921023105016@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4093, 3, '921023105017', '921023105017', 'KATHIRVELSAMY', 'S', '921023105017@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4094, 3, '921023105018', '921023105018', 'KAVIN', 'ASWATH S', '921023105018@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4095, 3, '921023105019', '921023105019', 'KRISHNAVENI', 'P', '921023105019@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4096, 3, '921023105020', '921023105020', 'MARIMUTHU', 'R', '921023105020@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4097, 3, '921023105021', '921023105021', 'MOHAMED', 'NOWFIL A', '921023105021@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4098, 3, '921023105023', '921023105023', 'PRIYADHARSHINI', 'S', '921023105023@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4099, 3, '921023105025', '921023105025', 'RAJESHWARAN', 'G', '921023105025@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4100, 3, '921023105027', '921023105027', 'RIHANA', 'AFRIN A', '921023105027@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4101, 3, '921023105028', '921023105028', 'SANTHOSH', 'J', '921023105028@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4102, 3, '921023105029', '921023105029', 'SIVASURIYAPRAKASH', 'M', '921023105029@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4103, 3, '921023105030', '921023105030', 'SUBARAJASREE', 'M', '921023105030@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4104, 3, '921023105031', '921023105031', 'SUBHASINI', 'K', '921023105031@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4105, 3, '921023105033', '921023105033', 'VAISHNAVI', 'K', '921023105033@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17');
INSERT INTO `student_profile` (`id`, `role_id`, `studentId`, `rollNumber`, `firstName`, `lastName`, `email`, `phone`, `photo`, `gender`, `departmentId`, `classId`, `batch`, `semester`, `year`, `section`, `admissionDate`, `admissionType`, `feeStatus`, `status`, `password`, `createdAt`, `updatedAt`) VALUES
(4106, 3, '921023105034', '921023105034', 'VIDHYA', 'SAGAR P', '921023105034@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4107, 3, '921023105035', '921023105035', 'VINOTH', 'G', '921023105035@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4108, 3, '921023105036', '921023105036', 'YUVARAJ', 'M', '921023105036@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4109, 3, '921023105037', '921023105037', 'YUVARAJ', 'P', '921023105037@nscet.org', '9876543210', 'default-student.png', 'male', 4, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4110, 3, '921023104001', '921023104001', 'ABI', 'R', '921023104001@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4111, 3, '921023104002', '921023104002', 'AHAMED', 'ATHIL KHAN M V', '921023104002@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4112, 3, '921023104003', '921023104003', 'AKSHAYA', 'G', '921023104003@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4113, 3, '921023104004', '921023104004', 'AKSHAYA', 'R', '921023104004@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4114, 3, '921023104005', '921023104005', 'AKSHAYA', 'SHRI K', '921023104005@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4115, 3, '921023104006', '921023104006', 'BALA', 'DINESH K', '921023104006@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4116, 3, '921023104007', '921023104007', 'BRINDHA', 'A', '921023104007@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4117, 3, '921023104008', '921023104008', 'DEEBA', 'DHARSHINIE G K', '921023104008@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4118, 3, '921023104009', '921023104009', 'DHANUJA', 'P', '921023104009@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4119, 3, '921023104010', '921023104010', 'HARINI', 'M', '921023104010@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4120, 3, '921023104011', '921023104011', 'HARINI', 'V', '921023104011@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4121, 3, '921023104012', '921023104012', 'HARISHPRAJEETH', 'A S', '921023104012@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4122, 3, '921023104013', '921023104013', 'HEMALATHA', 'M', '921023104013@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4123, 3, '921023104014', '921023104014', 'INDHUMATHI', 'S', '921023104014@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4124, 3, '921023104015', '921023104015', 'JAI', 'RAGUL D', '921023104015@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4125, 3, '921023104017', '921023104017', 'KANAGA', 'DURGA M', '921023104017@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4126, 3, '921023104018', '921023104018', 'KAVIN', 'PRASHAD A', '921023104018@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4127, 3, '921023104019', '921023104019', 'MADHUMITHA', 'D', '921023104019@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4128, 3, '921023104020', '921023104020', 'MENIL', 'SRI M', '921023104020@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4129, 3, '921023104021', '921023104021', 'MONAA', 'SHREE S', '921023104021@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4130, 3, '921023104022', '921023104022', 'MUHESH', 'KANNA M', '921023104022@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4131, 3, '921023104023', '921023104023', 'MUZZAMEEL', 'AHAMED S', '921023104023@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4132, 3, '921023104024', '921023104024', 'PANDEESWARAN', 'C', '921023104024@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4133, 3, '921023104025', '921023104025', 'PHIRAMOTH', 'G K', '921023104025@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4134, 3, '921023104026', '921023104026', 'PRAVEEN', 'K C', '921023104026@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4135, 3, '921023104027', '921023104027', 'PREETHI', 'S', '921023104027@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4136, 3, '921023104028', '921023104028', 'PRIJEETHA', 'C', '921023104028@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4137, 3, '921023104029', '921023104029', 'PRIYADHARSHINI', 'M', '921023104029@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4138, 3, '921023104030', '921023104030', 'RABIKA', 'BANU A', '921023104030@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4139, 3, '921023104031', '921023104031', 'RAGUL', 'S', '921023104031@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4140, 3, '921023104032', '921023104032', 'REEMA', 'FATHIMA R', '921023104032@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4141, 3, '921023104033', '921023104033', 'RUPIKA', 'M', '921023104033@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4142, 3, '921023104034', '921023104034', 'RUTHRADEVI', 'R', '921023104034@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4143, 3, '921023104035', '921023104035', 'SAKTHI', 'SUNDAR P', '921023104035@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4144, 3, '921023104036', '921023104036', 'SANTHOSHINI', 'K', '921023104036@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4145, 3, '921023104037', '921023104037', 'SARAN', 'R', '921023104037@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4146, 3, '921023104038', '921023104038', 'SHALINI', 'V', '921023104038@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4147, 3, '921023104039', '921023104039', 'SHOBIYA', 'M', '921023104039@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4148, 3, '921023104040', '921023104040', 'SRIKARAN', 'G', '921023104040@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4149, 3, '921023104041', '921023104041', 'SRI', 'KESAVAN S', '921023104041@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4150, 3, '921023104042', '921023104042', 'SUSITHRA', 'J B', '921023104042@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4151, 3, '921023104043', '921023104043', 'SUTHEESHNA', 'R', '921023104043@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4152, 3, '921023104044', '921023104044', 'THARANEESH', 'G R', '921023104044@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4153, 3, '921023104045', '921023104045', 'VARSHINI', 'N S', '921023104045@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4154, 3, '921023104046', '921023104046', 'VASUTHA', 'T', '921023104046@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4155, 3, '921023104047', '921023104047', 'YUVA', 'PRIYA V', '921023104047@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4156, 3, '921023104048', '921023104048', 'YUVA', 'SHREE M', '921023104048@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4157, 3, '921023104301', '921023104301', 'RISHI', 'B', '921023104301@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17'),
(4158, 3, '921023104701', '921023104701', 'KAVIYA', 'P', '921023104701@nscet.org', '9876543210', 'default-student.png', 'male', 1, NULL, '2021-2025', 6, '3', NULL, '2026-02-19', 'regular', 'paid', 'active', '$2a$10$E6/X2KrSHWRQlXWvZR0ByOsGWhh.SgPcby.Jj.RLJlG22IAb5SPBO', '2026-02-19 22:09:11', '2026-02-20 11:08:17');

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
  `projectUrl` varchar(500) DEFAULT NULL,
  `repoUrl` varchar(500) DEFAULT NULL,
  `thumbnailUrl` varchar(500) DEFAULT NULL,
  `status` enum('in-progress','completed','planned','paused') DEFAULT 'in-progress' COMMENT 'Matches frontend values',
  `imageUrl` varchar(500) DEFAULT NULL COMMENT 'Project thumbnail/screenshot URL',
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
-- Table structure for table `timetables`
--

CREATE TABLE `timetables` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `semester` enum('odd','even') NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `status` enum('draft','active','inactive') DEFAULT 'draft',
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `timetables`
--

INSERT INTO `timetables` (`id`, `name`, `academic_year`, `semester`, `department_id`, `class_id`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'CSE A Semester 6 - Odd 2024', '2024-2025', 'odd', 1, 1, 'active', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(2, 'CSE B Semester 6 - Odd 2024', '2024-2025', 'odd', 1, 2, 'active', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `timetable_details`
--

CREATE TABLE `timetable_details` (
  `id` int(11) NOT NULL,
  `timetable_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `period_number` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `faculty_id` int(11) DEFAULT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `period_type` enum('lecture','practical','tutorial','break','lunch') DEFAULT 'lecture',
  `is_break` tinyint(1) DEFAULT 0,
  `status` enum('active','cancelled','pending') DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timetable_incharge`
--

CREATE TABLE `timetable_incharge` (
  `id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `appointment_date` date NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `timetable_master`
--

INSERT INTO `timetable_master` (`id`, `name`, `academic_year`, `semester`, `department_id`, `year`, `timetable_incharge_id`, `status`, `approved_by`, `approved_at`, `created_by`, `createdAt`, `updatedAt`) VALUES
(1, 'CSE - 3 RD YEAR SEM-1', '2023-2027', 'odd', 1, '3rd', NULL, 'draft', NULL, NULL, 109, '2026-02-25 18:04:27', '2026-02-25 18:04:27');

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
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `rejection_reason` text DEFAULT NULL,
  `response_date` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
  `is_substitute` tinyint(1) DEFAULT 0,
  `original_faculty_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `timetable_slots`
--

INSERT INTO `timetable_slots` (`id`, `timetable_id`, `day`, `period_number`, `start_time`, `end_time`, `subject_id`, `faculty_id`, `class_id`, `room`, `type`, `status`, `is_substitute`, `original_faculty_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'Monday', 1, '09:00:00', '09:50:00', NULL, 1, 1, '101', 'lecture', 'active', 0, NULL, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(2, 1, 'Monday', 2, '09:50:00', '10:40:00', NULL, 8, 1, '101', 'lecture', 'active', 0, NULL, '2024-01-01 00:00:00', '2024-01-01 00:00:00');

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
  `is_substitute` tinyint(1) DEFAULT 0,
  `original_faculty_id` int(11) DEFAULT NULL,
  `substitute_assignment_id` int(11) DEFAULT NULL,
  `assigned_by` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `year` enum('1st','2nd','3rd','4th') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `type` enum('lecture','lab','tutorial','practical') DEFAULT 'lecture',
  `status` enum('active','inactive','pending_approval') NOT NULL DEFAULT 'pending_approval',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timetable_staff_alterations`
--

CREATE TABLE `timetable_staff_alterations` (
  `id` int(11) NOT NULL,
  `timetable_id` int(11) NOT NULL,
  `timetable_detail_id` int(11) NOT NULL,
  `original_faculty_id` int(11) NOT NULL,
  `alternative_faculty_id` int(11) NOT NULL,
  `reason` text NOT NULL,
  `requested_by` int(11) NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `alternative_response` text DEFAULT NULL,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timetable_uploads`
--

CREATE TABLE `timetable_uploads` (
  `id` int(11) NOT NULL,
  `timetable_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `total_records` int(11) DEFAULT 0,
  `successful_records` int(11) DEFAULT 0,
  `failed_records` int(11) DEFAULT 0,
  `uploaded_by` int(11) NOT NULL,
  `upload_date` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('processing','completed','failed') NOT NULL DEFAULT 'processing',
  `error_log` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(109, 'GOAT', 'nscetadmin@gmail.com', '$2a$10$ELjprebdIeb3GTTMKk1oZujDrXZ2g8P41gNfiqVwVCKiflkwpO1eu', 2, '9876543210', 1, '2026-02-20 05:39:02', '2026-02-20 05:39:02', NULL, NULL),
(112, 'Test Admin', 'testadmin@nscet.org', '$2a$10$ELjprebdIeb3GTTMKk1oZujDrXZ2g8P41gNfiqVwVCKiflkwpO1eu', 1, '9876543210', 1, '2026-02-20 06:24:50', '2026-02-20 06:24:50', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `year_break_timings`
--

CREATE TABLE `year_break_timings` (
  `id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `year` enum('1st','2nd','3rd','4th') NOT NULL,
  `break_name` varchar(100) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `year_break_timings`
--

INSERT INTO `year_break_timings` (`id`, `department_id`, `year`, `break_name`, `start_time`, `end_time`, `duration_minutes`, `createdAt`, `updatedAt`) VALUES
(1, 0, '1st', 'Tea Break', '10:40:00', '11:10:00', 30, '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(2, 0, '1st', 'Lunch Break', '12:50:00', '13:30:00', 40, '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(3, 0, '2nd', 'Tea Break', '10:40:00', '11:10:00', 30, '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(4, 0, '2nd', 'Lunch Break', '12:50:00', '13:30:00', 40, '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(5, 0, '3rd', 'Tea Break', '10:40:00', '11:00:00', 20, '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(6, 0, '3rd', 'Lunch Break', '12:50:00', '13:20:00', 30, '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(7, 0, '4th', 'Tea Break', '10:40:00', '11:00:00', 20, '2026-02-25 18:01:10', '2026-02-25 18:01:10'),
(8, 0, '4th', 'Lunch Break', '12:50:00', '13:20:00', 30, '2026-02-25 18:01:10', '2026-02-25 18:01:10');

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
-- Indexes for table `faculty_events`
--
ALTER TABLE `faculty_events`
  ADD PRIMARY KEY (`faculty_id`),
  ADD UNIQUE KEY `event_id` (`event_id`);

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
-- Indexes for table `faculty_leaves`
--
ALTER TABLE `faculty_leaves`
  ADD PRIMARY KEY (`leave_id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `reassign_faculty_id` (`reassign_faculty_id`);

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
  ADD PRIMARY KEY (`faculty_id`),
  ADD UNIQUE KEY `research_id` (`ORCID_ID`);

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
  ADD KEY `idx_student_approval` (`studentId`,`approvalStatus`);

--
-- Indexes for table `student_disciplinary_records`
--
ALTER TABLE `student_disciplinary_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`studentId`),
  ADD KEY `idx_student_resolved` (`studentId`,`resolved`),
  ADD KEY `idx_student_date` (`studentId`,`recordDate`),
  ADD KEY `idx_issued_by` (`issuedByFacultyId`);

--
-- Indexes for table `student_events`
--
ALTER TABLE `student_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`studentId`),
  ADD KEY `idx_student_type` (`studentId`,`eventType`),
  ADD KEY `idx_student_approval` (`studentId`,`approvalStatus`);

--
-- Indexes for table `student_internal_marks`
--
ALTER TABLE `student_internal_marks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_subject_sem_year_int` (`studentId`,`subjectId`,`semester`,`academicYear`,`internalNumber`),
  ADD KEY `idx_student_sem_int` (`studentId`,`semester`,`internalNumber`),
  ADD KEY `idx_subject_semester` (`subjectId`,`semester`);

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
  ADD KEY `fk_student_user` (`role_id`),
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
  ADD KEY `idx_student_approval` (`studentId`,`approvalStatus`);

--
-- Indexes for table `student_sports`
--
ALTER TABLE `student_sports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`studentId`),
  ADD KEY `idx_student_status` (`studentId`,`status`),
  ADD KEY `idx_student_approval` (`studentId`,`approvalStatus`);

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
-- Indexes for table `timetables`
--
ALTER TABLE `timetables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `timetable_details`
--
ALTER TABLE `timetable_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_timetable` (`timetable_id`),
  ADD KEY `idx_class` (`class_id`),
  ADD KEY `idx_faculty` (`faculty_id`),
  ADD KEY `idx_day_period` (`day_of_week`,`period_number`);

--
-- Indexes for table `timetable_incharge`
--
ALTER TABLE `timetable_incharge`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_dept_timetable_incharge` (`department_id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `timetable_master`
--
ALTER TABLE `timetable_master`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_department` (`department_id`),
  ADD KEY `idx_academic_year` (`academic_year`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `timetable_notifications`
--
ALTER TABLE `timetable_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `slot_assignment_id` (`slot_assignment_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `idx_faculty_status` (`faculty_id`,`status`),
  ADD KEY `idx_requested_by` (`requested_by`),
  ADD KEY `idx_created_date` (`createdAt`);

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
  ADD UNIQUE KEY `unique_faculty_subject_class` (`faculty_id`,`subject_code`,`class_id`,`timetable_id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_timetable_class` (`timetable_id`,`class_id`),
  ADD KEY `idx_faculty_year` (`faculty_id`,`year`),
  ADD KEY `idx_class_year_day` (`class_id`,`year`,`day_of_week`);

--
-- Indexes for table `timetable_staff_alterations`
--
ALTER TABLE `timetable_staff_alterations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_timetable` (`timetable_id`),
  ADD KEY `idx_original_faculty` (`original_faculty_id`),
  ADD KEY `idx_alternative_faculty` (`alternative_faculty_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `timetable_uploads`
--
ALTER TABLE `timetable_uploads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timetable_id` (`timetable_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `faculty_events`
--
ALTER TABLE `faculty_events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT for table `faculty_leaves`
--
ALTER TABLE `faculty_leaves`
  MODIFY `leave_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_leave_schedules`
--
ALTER TABLE `faculty_leave_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_phd`
--
ALTER TABLE `faculty_phd`
  MODIFY `phd_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `faculty_profiles`
--
ALTER TABLE `faculty_profiles`
  MODIFY `faculty_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=432;

--
-- AUTO_INCREMENT for table `faculty_subject_assignments`
--
ALTER TABLE `faculty_subject_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_substitutes`
--
ALTER TABLE `faculty_substitutes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculy_edu_qualification`
--
ALTER TABLE `faculy_edu_qualification`
  MODIFY `membership_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `period_config`
--
ALTER TABLE `period_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

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
-- AUTO_INCREMENT for table `student_disciplinary_records`
--
ALTER TABLE `student_disciplinary_records`
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
-- AUTO_INCREMENT for table `timetable_details`
--
ALTER TABLE `timetable_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable_incharge`
--
ALTER TABLE `timetable_incharge`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable_master`
--
ALTER TABLE `timetable_master`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `timetable_notifications`
--
ALTER TABLE `timetable_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable_slot_assignments`
--
ALTER TABLE `timetable_slot_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable_staff_alterations`
--
ALTER TABLE `timetable_staff_alterations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable_uploads`
--
ALTER TABLE `timetable_uploads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT for table `year_break_timings`
--
ALTER TABLE `year_break_timings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

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
-- Constraints for table `faculty_leaves`
--
ALTER TABLE `faculty_leaves`
  ADD CONSTRAINT `faculty_leaves_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `faculty_leaves_ibfk_2` FOREIGN KEY (`reassign_faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL;

--
-- Constraints for table `faculty_phd`
--
ALTER TABLE `faculty_phd`
  ADD CONSTRAINT `faculty_phd_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE;

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
-- Constraints for table `student_attendance_entry`
--
ALTER TABLE `student_attendance_entry`
  ADD CONSTRAINT `fk_attendance_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `timetable_notifications`
--
ALTER TABLE `timetable_notifications`
  ADD CONSTRAINT `timetable_notifications_ibfk_1` FOREIGN KEY (`slot_assignment_id`) REFERENCES `timetable_slot_assignments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `timetable_notifications_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `timetable_notifications_ibfk_3` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `timetable_notifications_ibfk_4` FOREIGN KEY (`requested_by`) REFERENCES `faculty_profiles` (`faculty_id`) ON UPDATE CASCADE;

--
-- Constraints for table `timetable_slots`
--
ALTER TABLE `timetable_slots`
  ADD CONSTRAINT `fk_timetable_slots_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `timetable_slot_assignments`
--
ALTER TABLE `timetable_slot_assignments`
  ADD CONSTRAINT `timetable_slot_assignments_ibfk_1` FOREIGN KEY (`timetable_id`) REFERENCES `timetables` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `timetable_slot_assignments_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `timetable_slot_assignments_ibfk_3` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `timetable_slot_assignments_ibfk_4` FOREIGN KEY (`assigned_by`) REFERENCES `faculty_profiles` (`faculty_id`) ON UPDATE CASCADE;

--
-- Constraints for table `timetable_uploads`
--
ALTER TABLE `timetable_uploads`
  ADD CONSTRAINT `fk_timetable_upload_timetable` FOREIGN KEY (`timetable_id`) REFERENCES `timetables` (`id`),
  ADD CONSTRAINT `fk_timetable_upload_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
