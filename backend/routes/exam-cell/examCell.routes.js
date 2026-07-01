import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  getDashboardStats,
  getSubmissions,
  getSubmissionDetails,
  verifySubmission,
  updateStudentMark,
  publishSubmission,
  rejectSubmission,
  getPublishedClassResults,
  createCustomNotification,
  getNotificationsList
} from '../../controllers/exam-cell/examCell.controller.js';

const router = express.Router();

// All exam cell routes require authentication and exam-cell-admin or super-admin role
router.use(protect);
router.use(authorize('exam-cell-admin', 'super-admin', 'superadmin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/submissions', getSubmissions);
router.get('/submissions/:id', getSubmissionDetails);
router.put('/submissions/:id/verify', verifySubmission);
router.put('/marks/:markId', updateStudentMark);
router.post('/submissions/:id/publish', publishSubmission);
router.post('/submissions/:id/reject', rejectSubmission);
router.get('/students/:classId/results', getPublishedClassResults);
router.post('/notifications', createCustomNotification);
router.get('/notifications', getNotificationsList);

export default router;
