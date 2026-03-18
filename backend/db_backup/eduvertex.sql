-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 18, 2026 at 06:42 AM
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

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_create_overlay_for_leave` (IN `p_leave_id` INT, IN `p_faculty_id` INT, IN `p_from_date` DATE, IN `p_to_date` DATE, IN `p_reason` VARCHAR(255), IN `p_created_by` INT)   BEGIN
  DECLARE v_date DATE DEFAULT p_from_date;
  WHILE v_date <= p_to_date DO
    IF DAYNAME(v_date) != 'Sunday' THEN
      INSERT IGNORE INTO timetable_overlay
        (master_id,overlay_date,period_slot_id,original_faculty_id,
         substitute_faculty_id,original_subject_id,reason,leave_request_id,created_by,status)
      SELECT tms.master_id, v_date, tms.period_slot_id, p_faculty_id,
             NULL, tms.subject_id, p_reason, p_leave_id, p_created_by, 'active'
      FROM timetable_master_slots tms
      JOIN timetable_master tm ON tm.id = tms.master_id AND tm.status = 'active'
      WHERE tms.faculty_id = p_faculty_id AND tms.day = DAYNAME(v_date);
    END IF;
    SET v_date = DATE_ADD(v_date, INTERVAL 1 DAY);
  END WHILE;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_init_leave_approvals` (IN `p_leave_id` INT, IN `p_app_type` VARCHAR(10), IN `p_dept_id` INT, IN `p_class_id` INT)   BEGIN
  DECLARE v_ci_id  INT DEFAULT 0;
  DECLARE v_hod_id INT DEFAULT 0;

  IF p_app_type = 'student' AND p_class_id IS NOT NULL THEN
    SELECT faculty_id INTO v_ci_id
    FROM class_incharges
    WHERE class_id = p_class_id AND status = 'active'
    LIMIT 1;
  END IF;

  SELECT faculty_id INTO v_hod_id
  FROM faculty_profiles
  WHERE department_id = p_dept_id AND designation LIKE '%HEAD%' AND status = 'active'
  LIMIT 1;

  IF p_app_type = 'student' THEN
    INSERT IGNORE INTO leave_approvals (leave_request_id,level_number,approver_role,approver_id,status)
    VALUES (p_leave_id,1,'class_incharge',v_ci_id,'pending'),
           (p_leave_id,2,'hod',v_hod_id,'pending');
  ELSE
    INSERT IGNORE INTO leave_approvals (leave_request_id,level_number,approver_role,approver_id,status)
    VALUES (p_leave_id,1,'hod',v_hod_id,'pending'),
           (p_leave_id,2,'principal',0,'pending');
  END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_process_leave_approval` (IN `p_leave_id` INT, IN `p_approver_id` INT, IN `p_level` TINYINT, IN `p_action` VARCHAR(20), IN `p_remarks` TEXT)   BEGIN
  DECLARE v_total    INT DEFAULT 0;
  DECLARE v_approved INT DEFAULT 0;

  UPDATE leave_approvals
  SET status = p_action, action_date = NOW(), remarks = p_remarks
  WHERE leave_request_id = p_leave_id AND level_number = p_level;

  IF p_action = 'rejected' THEN
    UPDATE leave_requests SET overall_status = 'rejected' WHERE id = p_leave_id;
  ELSE
    SELECT COUNT(*) INTO v_total   FROM leave_approvals WHERE leave_request_id = p_leave_id;
    SELECT COUNT(*) INTO v_approved FROM leave_approvals
      WHERE leave_request_id = p_leave_id AND status = 'approved';
    IF v_approved = v_total THEN
      UPDATE leave_requests SET overall_status = 'approved' WHERE id = p_leave_id;
      UPDATE leave_balance_v2 lb
      JOIN leave_requests lr ON lr.id = p_leave_id
      SET lb.total_used    = lb.total_used    + lr.total_days,
          lb.total_pending = GREATEST(lb.total_pending - lr.total_days, 0)
      WHERE lb.applicant_id   = lr.applicant_id
        AND lb.applicant_type = lr.applicant_type
        AND lb.leave_type_id  = lr.leave_type_id;
    END IF;
  END IF;
END$$

DELIMITER ;

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
(20, 'II Year AI&DS', 'CR-12', 6, 60, 'active', '2024-2028', 4, '2025-2026', 'A'),
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
(435, 'NS20T09', NULL, NULL, 'Vignesh L S', 'lsisreviving@gmail.com', NULL, '$2a$10$7S/p6nWcvVCUlmMC8cFeZewetHGp6MkxvvJLKBlahtsGt/KcyqC5a', 7, 6, 'HEAD OF THE DEPARTMENT', NULL, 'No', NULL, NULL, NULL, '/uploads/faculty/vignesh_l_s.jpg', 'active', NULL, NULL, NULL, NULL, NULL, '2026-03-14 13:13:50', '2026-03-14 15:34:33', NULL, NULL),
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
(492, 'NS70T05', NULL, NULL, 'MAHALAKSHMI S', 'ns70t05@nscet.org', NULL, '$2a$10$IlcgP8INGp8gPWVOAEloreSUEPPWVYQ.q5II/KWESGDGIlmzrzv0e', 5, 7, NULL, NULL, 'No', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, '2026-02-19 11:09:11', '2026-02-20 01:13:32', NULL, NULL),
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
(33, 436, 100, 435, '2026-03-14 17:17:19', '2026-2027', 6, 21, NULL, '2026-03-14', 'active', 45, 3, '2026-03-14 17:17:19', '2026-03-14 17:17:19'),
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
  `remarks` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(1, 3975, NULL, 'https://www.linkedin.com/in/r-logesh-kumar-74566a2a3/', NULL, 'B+', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"father\":{\"name\":\"\",\"phone\":\"\",\"email\":\"\",\"occupation\":\"\",\"qualification\":\"\",\"annualIncome\":\"\"},\"mother\":{\"name\":\"\",\"phone\":\"\",\"email\":\"\",\"occupation\":\"\",\"qualification\":\"\",\"annualIncome\":\"\"},\"guardian\":{\"name\":\"\",\"relation\":\"\",\"phone\":\"\",\"address\":\"\"}}', NULL, NULL, NULL, NULL, '2026-03-18 05:26:59', '2026-03-18 05:31:17');

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
  `leaveType` enum('Medical','Casual','On-Duty','Special','Other') NOT NULL DEFAULT 'Casual',
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
  `attachment` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_leaves`
--

INSERT INTO `student_leaves` (`id`, `studentId`, `leaveType`, `startDate`, `endDate`, `totalDays`, `reason`, `status`, `approvedById`, `approvalRemarks`, `approvalDate`, `createdAt`, `updatedAt`, `classId`, `overall_status`, `class_incharge_approval_status`, `class_incharge_id`, `class_incharge_remarks`, `class_incharge_approval_date`, `department_admin_approval_status`, `department_admin_id`, `department_admin_remarks`, `department_admin_approval_date`, `leaveSubType`, `attachment`) VALUES
(4, 3975, '', '2026-03-16', '2026-03-17', 2.0, 'asdfjkl;', 'pending', NULL, NULL, NULL, '2026-03-16 05:08:23', '2026-03-16 05:08:23', 21, 'pending', 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, 'Personal Leave', NULL);

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
(3686, NULL, 6, '921024243001', '921024243001', NULL, 'ABARNA', 'K', '921024243001@nscet.org', '9876543210', 'default-student.png', 'female', 6, 20, '2024-2028', 4, '2', '2024-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3687, NULL, 6, '921024243002', '921024243002', NULL, 'ABDUL RAHMAN', 'U', '921024243002@nscet.org', '9876543210', 'default-student.png', 'male', 6, 20, '2024-2028', 4, '2', '2024-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3688, NULL, 6, '921024243003', '921024243003', NULL, 'ANBU DHARSINI', 'V', '921024243003@nscet.org', '9876543210', 'default-student.png', 'female', 6, 20, '2024-2028', 4, '2', '2024-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3967, NULL, 6, '921023243001', '921023243001', NULL, 'AJAY PRASATH', 'K', '921023243001@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3968, NULL, 6, '921023243002', '921023243002', NULL, 'ANFIYAA', 'M', '921023243002@nscet.org', '9876543210', 'default-student.png', 'female', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3969, NULL, 6, '921023243004', '921023243004', NULL, 'ASIM FATHIMA', 'P', '921023243004@nscet.org', '9876543210', 'default-student.png', 'female', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3970, NULL, 6, '921023243005', '921023243005', NULL, 'BALAJI', 'B', '921023243005@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3971, NULL, 6, '921023243006', '921023243006', NULL, 'DEVENDRA KUMAR', 'P', '921023243006@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3972, NULL, 6, '921023243007', '921023243007', NULL, 'GOKUL', 'M', '921023243007@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3973, NULL, 6, '921023243008', '921023243008', NULL, 'HARI PRABHA', 'S', '921023243008@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3974, NULL, 6, '921023243009', '921023243009', NULL, 'KAVIYAMAHESHWARI', 'J', '921023243009@nscet.org', '9876543210', 'default-student.png', 'female', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-14 13:13:50', NULL),
(3975, NULL, 6, '3975', '921023243010', NULL, 'LOGESH KUMAR', 'R', '921023243010@nscet.org', '9876543210', 'default-student.png', 'male', 6, 21, '2023-2027', 6, '3', '2023-11-15', 'regular', 'paid', 'active', '$2a$10$dFoVkpiU4xkoGUYT3OhfOucc255f/yft8BhHC.o3aZqqY/vjHyY.O', '2026-03-14 13:13:50', '2026-03-18 05:39:53', NULL),
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
(1, 21, 6, '2025-2026', 6, 'even', '2023-2027', 'CR-15', '2026-01-05', NULL, '05.01.2026/01', 'active', 406, 496, 406, 435, NULL, NULL, 435, '2026-03-14 13:13:50', '2026-03-15 15:58:50'),
(2, 20, 6, '2025-2026', 4, 'even', '2024-2028', 'CR-12', '2026-01-05', NULL, '05.01.2026/02', '', 435, NULL, 357, 435, NULL, NULL, 435, '2026-03-14 13:13:50', '2026-03-16 05:05:43');

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
(332, 1, 'Monday', 6, 100, 436, 'theory', 0, NULL, NULL, 'CR-15', 'GT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(333, 1, 'Monday', 7, 94, 496, 'theory', 0, NULL, NULL, 'CR-15', 'APP', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(334, 1, 'Monday', 9, 98, 406, 'theory', 0, NULL, NULL, 'CR-15', 'DM', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(335, 1, 'Monday', 10, 94, 496, 'theory', 0, NULL, NULL, 'CR-15', 'APP', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(336, 1, 'Tuesday', 1, 94, 496, 'lab', 0, NULL, NULL, NULL, 'APP LAB', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(337, 1, 'Tuesday', 2, 94, 496, 'lab', 0, NULL, NULL, NULL, 'APP LAB', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(338, 1, 'Tuesday', 4, 100, 436, 'theory', 0, NULL, NULL, 'CR-15', 'GT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(339, 1, 'Tuesday', 6, 102, 507, 'lab', 0, NULL, NULL, NULL, 'ESIOT LAB', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(340, 1, 'Tuesday', 7, 102, 507, 'lab', 0, NULL, NULL, NULL, 'ESIOT LAB', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(341, 1, 'Tuesday', 9, 90, 435, 'theory', 0, NULL, NULL, 'CR-15', 'PPL', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(342, 1, 'Tuesday', 10, 105, NULL, 'free', 0, NULL, NULL, 'LIBRARY', 'LIBRARY', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(343, 1, 'Wednesday', 1, 102, 507, 'theory', 0, NULL, NULL, 'CR-15', 'ESIOT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(344, 1, 'Wednesday', 2, 94, 496, 'theory', 0, NULL, NULL, 'CR-15', 'APP', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(345, 1, 'Wednesday', 4, 100, 436, 'theory', 0, NULL, NULL, 'CR-15', 'GT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(346, 1, 'Wednesday', 6, 90, 435, 'theory', 0, NULL, NULL, 'CR-15', 'PPL', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(347, 1, 'Wednesday', 7, 106, NULL, 'activity', 0, NULL, NULL, 'CR-15', 'PLACEMENT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(348, 1, 'Wednesday', 9, 106, NULL, 'activity', 0, NULL, NULL, 'CR-15', 'PLACEMENT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(349, 1, 'Wednesday', 10, 106, NULL, 'activity', 0, NULL, NULL, 'CR-15', 'PLACEMENT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(350, 1, 'Thursday', 1, 98, 406, 'theory', 0, NULL, NULL, 'CR-15', 'DM', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(351, 1, 'Thursday', 2, 90, 435, 'theory', 0, NULL, NULL, 'CR-15', 'PPL', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(352, 1, 'Thursday', 4, 102, 507, 'theory', 0, NULL, NULL, 'CR-15', 'ESIOT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(353, 1, 'Thursday', 6, 94, 496, 'theory', 0, NULL, NULL, 'CR-15', 'APP', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(354, 1, 'Thursday', 7, 100, 435, 'theory', 0, NULL, NULL, 'CR-15', 'GT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(355, 1, 'Thursday', 9, 98, 406, 'lab', 0, NULL, NULL, NULL, 'DM LAB', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(356, 1, 'Thursday', 10, 98, 406, 'lab', 0, NULL, NULL, NULL, 'DM LAB', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(357, 1, 'Friday', 1, 95, 406, 'project', 0, NULL, NULL, NULL, 'NM', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(358, 1, 'Friday', 2, 95, 406, 'project', 0, NULL, NULL, NULL, 'NM', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(359, 1, 'Friday', 4, 95, 406, 'project', 0, NULL, NULL, NULL, NULL, '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(360, 1, 'Friday', 6, 95, 406, 'project', 0, NULL, NULL, NULL, 'NAAN', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(361, 1, 'Friday', 7, 95, 406, 'project', 0, NULL, NULL, NULL, 'MUDHALVAN', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(362, 1, 'Friday', 9, 95, 406, 'project', 0, NULL, NULL, NULL, NULL, '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(363, 1, 'Friday', 10, 95, 406, 'project', 0, NULL, NULL, NULL, NULL, '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(364, 1, 'Saturday', 1, 100, 436, 'theory', 0, NULL, NULL, 'CR-15', 'GT', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
(365, 1, 'Saturday', 2, 90, 436, 'theory', 0, NULL, NULL, 'CR-15', 'PPL', '2026-03-15 14:48:29', '2026-03-15 14:48:29'),
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
  ADD KEY `idx_sa_slot` (`master_slot_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_bio`
--
ALTER TABLE `student_bio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
  ADD CONSTRAINT `fk_sa_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`);

--
-- Constraints for table `student_bio`
--
ALTER TABLE `student_bio`
  ADD CONSTRAINT `fk_bio_student` FOREIGN KEY (`studentId`) REFERENCES `student_profile` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `fk_sport_approver` FOREIGN KEY (`approvedById`) REFERENCES `users` (`id`) ON DELETE SET NULL,
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
