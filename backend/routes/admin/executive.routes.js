import express from 'express';
import {
  getExecutiveStats,
  getPendingApprovals,
  getExecutiveCharts,
  getExecutiveActivities,
  processApproval
} from '../../controllers/admin/executive.controller.js';

const router = express.Router();

router.get('/stats', getExecutiveStats);
router.get('/pending-approvals', getPendingApprovals);
router.get('/charts', getExecutiveCharts);
router.get('/activities', getExecutiveActivities);
router.put('/approve/:type/:id', processApproval);

export default router;
