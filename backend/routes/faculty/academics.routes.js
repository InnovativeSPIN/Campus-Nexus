import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import courseFileUpload from '../../middleware/course-file-upload.js'; // PDF uploads for course files
import coursePlanUpload from '../../middleware/course-plan-upload.js'; // PDF uploads for course plans
import {
  getMyAssignedSubjects,
  getMyAssignedClasses,
  getCourseLessonPlans,
  createCourseLessonPlan,
  createCourseLessonPlanBulk,
  getPendingCourseLessonPlans,
  getCourseLessonPlanProgress,
  uploadCourseFile,
  uploadCoursePlan,
  downloadCoursePlanTemplate,
  downloadCoursePlanCsvTemplate,
  getFacultyCourseFiles,
  downloadCourseFile,
  recordCoverageTracking,
  getTodaySchedule
} from '../../controllers/faculty/academics.controller.js';

const router = express.Router();

// All routes require authentication and faculty role
router.use(protect);
router.use(authorize('faculty', 'department-admin'));

// Get faculty's assigned subjects
router.get('/my-subjects', getMyAssignedSubjects);

// Get faculty's assigned classes
router.get('/my-classes', getMyAssignedClasses);

// Get faculty's today's schedule
router.get('/today-schedule', getTodaySchedule);

// ==================== COURSE LESSON PLAN ROUTES ====================

// Get all lesson plans for a subject
router.get('/course-plans', getCourseLessonPlans);

// Create/update lesson plans for a subject
router.post('/course-plans', createCourseLessonPlan);

// Create/update lesson plans in bulk (from form submission)
router.post('/course-plans/bulk', createCourseLessonPlanBulk);

// Get pending topics for attendance marking
router.get('/course-plans/pending', getPendingCourseLessonPlans);

// Get lesson plan progress
router.get('/course-plans/progress', getCourseLessonPlanProgress);

// ==================== COURSE FILE ROUTES ====================

// Upload course file (PDF)
// Frontend sends the file under the `courseFile` field
router.post('/course-files/upload', courseFileUpload.single('courseFile'), uploadCourseFile);

// Upload course plan (PDF)
// Frontend sends the file under the `coursePlan` field
router.post('/course-plans/upload', coursePlanUpload.single('coursePlan'), uploadCoursePlan);

// Download course plan template
router.get('/course-plans/template/download', downloadCoursePlanTemplate);
// Download CSV template
router.get('/course-plans/template/download-csv', downloadCoursePlanCsvTemplate);

// Get all course files for faculty
router.get('/course-files', getFacultyCourseFiles);

// Download course file
router.get('/course-files/:id/download', downloadCourseFile);

// ==================== COVERAGE TRACKING ROUTES ====================

// Record syllabus coverage tracking
router.post('/coverage-tracking', recordCoverageTracking);

export default router;
