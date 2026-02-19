-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 19, 2026 at 05:41 AM
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
(1, 'cse', 'B.E. Computer Science & Engineering'),
(2, 'civil', 'B.E. Civil Engineering'),
(3, 'ece', 'B.E. Electronics & Communication Engineering'),
(4, 'eee', 'B.E. Electrical and Electronics Engineering'),
(5, 'mech', 'B.E. Mechanical Engineering'),
(6, 'ai-and-ds', 'B.Tech. Artificial Intelligence & Data Science'),
(7, 'it', 'B.Tech. Information Technology'),
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
  `is_current` tinyint(1) DEFAULT 0,
  `job_title` varchar(150) NOT NULL,
  `company` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(2, 'executive-admin'),
(3, 'academic-admin'),
(4, 'department-admin'),
(5, 'faculty'),
(6, 'student');

--
-- Indexes for dumped tables
--

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
  ADD PRIMARY KEY (`faculty_id`),
  ADD UNIQUE KEY `exp_id` (`exp_id`);

--
-- Indexes for table `faculty_leaves`
--
ALTER TABLE `faculty_leaves`
  ADD PRIMARY KEY (`leave_id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `reassign_faculty_id` (`reassign_faculty_id`);

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
  ADD PRIMARY KEY (`faculty_id`),
  ADD UNIQUE KEY `research_id` (`ORCID_ID`);

--
-- Indexes for table `faculty_subjects_handled`
--
ALTER TABLE `faculty_subjects_handled`
  ADD PRIMARY KEY (`faculty_id`);

--
-- Indexes for table `faculy_edu_qualification`
--
ALTER TABLE `faculy_edu_qualification`
  ADD PRIMARY KEY (`faculty_id`),
  ADD UNIQUE KEY `membership_id` (`membership_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `faculty_events`
--
ALTER TABLE `faculty_events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_experience`
--
ALTER TABLE `faculty_experience`
  MODIFY `exp_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_leaves`
--
ALTER TABLE `faculty_leaves`
  MODIFY `leave_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_profiles`
--
ALTER TABLE `faculty_profiles`
  MODIFY `faculty_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculy_edu_qualification`
--
ALTER TABLE `faculy_edu_qualification`
  MODIFY `membership_id` int(11) NOT NULL AUTO_INCREMENT;

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
  ADD CONSTRAINT `faculty_experience_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `faculty_experience_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_leaves`
--
ALTER TABLE `faculty_leaves`
  ADD CONSTRAINT `faculty_leaves_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `faculty_leaves_ibfk_2` FOREIGN KEY (`reassign_faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE SET NULL;

--
-- Constraints for table `faculy_edu_qualification`
--
ALTER TABLE `faculy_edu_qualification`
  ADD CONSTRAINT `faculy_edu_qualification_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `faculy_edu_qualification_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty_profiles` (`faculty_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
