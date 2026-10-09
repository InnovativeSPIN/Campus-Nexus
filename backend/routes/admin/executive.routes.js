import express from 'express';
import {
  getExecutiveStats,
  getPendingApprovals,
  getExecutiveCharts,
  getExecutiveActivities,
  processApproval,
  getExecutiveFacultyAttendance
} from '../../controllers/admin/executive.controller.js';
import { protect, authorize } from '../../middleware/auth.js';
const router = express.Router();
router.use(protect);
router.use(authorize('superadmin', 'super-admin', 'executiveadmin', 'executive', 'principal', 'secretary'));

router.get('/stats', getExecutiveStats);
router.get('/pending-approvals', getPendingApprovals);
router.get('/charts', getExecutiveCharts);
router.get('/activities', getExecutiveActivities);
router.get('/faculty-attendance', getExecutiveFacultyAttendance);
router.put('/approve/:type/:id', processApproval);

export default router;
