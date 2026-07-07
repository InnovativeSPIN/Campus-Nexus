import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  getPendingCourseFileApprovals,
  getCourseFileApprovalDetails,
  approveCourseFile,
  rejectCourseFile,
  requestCourseFileRevision,
  getApprovalStatistics,
  getPendingCourseLessonPlanApprovals,
  approveCourseLessonPlan,
  rejectCourseLessonPlan,
  getNotifications
} from '../../controllers/department-admin/academics.controller.js';

const router = express.Router();

// All routes require authentication and department-admin role
router.use(protect);
router.use(authorize('department-admin'));

// ==================== NOTIFICATIONS ROUTES ====================

// Get all notifications for department admin
router.get('/notifications', getNotifications);

// ==================== COURSE FILE APPROVAL ROUTES ====================

// Get all pending course file approvals
router.get('/approvals', getPendingCourseFileApprovals);

// Get approval statistics
router.get('/approvals/stats', getApprovalStatistics);

// Get single approval details
router.get('/approvals/:id', getCourseFileApprovalDetails);

// Approve course file
router.post('/approvals/:id/approve', approveCourseFile);

// Reject course file
router.post('/approvals/:id/reject', rejectCourseFile);

// Request revision on course file
router.post('/approvals/:id/revision', requestCourseFileRevision);

// ==================== COURSE LESSON PLAN APPROVAL ROUTES ====================

// Get pending course lesson plan approvals
router.get('/course-plans/pending', getPendingCourseLessonPlanApprovals);

// Approve course lesson plan batch
router.post('/course-plans/batch/:batchId/approve', approveCourseLessonPlan);

// Reject course lesson plan batch
router.post('/course-plans/batch/:batchId/reject', rejectCourseLessonPlan);

export default router;
