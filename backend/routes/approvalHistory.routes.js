import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getApprovalHistory,
    getDepartmentAuditLog
} from '../controllers/approvalHistory.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get approval history for a specific leave
router.get('/:leaveId', getApprovalHistory);

// Get audit log for department admin
router.get('/department/audit', getDepartmentAuditLog);

export default router;
