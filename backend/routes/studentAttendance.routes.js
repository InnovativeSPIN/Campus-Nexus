import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';
import * as attendanceController from '../controllers/student/studentAttendance.controller.js';

const router = express.Router();

/**
 * Period Configuration Routes
 */
router.get('/periods', protect, attendanceController.getPeriodSlots);
router.get('/teaching-periods', protect, attendanceController.getTeachingPeriods);

/**
 * Attendance Marking Routes (Faculty/Department Admin)
 */
router.post('/mark-period',
  protect,
  authorize('faculty', 'department-admin'),
  attendanceController.markPeriodAttendance
);

/**
 * Attendance Report Routes
 */
router.get('/class-summary', protect, attendanceController.getClassAttendanceSummary);
router.get('/class-report', protect, authorize('faculty', 'department-admin'), attendanceController.getClassAttendanceReport);
router.get('/student/:studentId', protect, attendanceController.getStudentAttendance);

export default router;
