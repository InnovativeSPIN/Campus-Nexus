import express from 'express';
import {
  getExecutiveStats,
  getPendingApprovals,
  getExecutiveCharts,
  getExecutiveActivities,
  processApproval,
  getExecutiveFacultyAttendance
} from '../../controllers/admin/executive.controller.js';

const router = express.Router();

router.get('/stats', getExecutiveStats);
router.get('/pending-approvals', getPendingApprovals);
router.get('/charts', getExecutiveCharts);
router.get('/activities', getExecutiveActivities);
router.get('/faculty-attendance', getExecutiveFacultyAttendance);
router.put('/approve/:type/:id', processApproval);

export default router;
