import express from 'express';
import {
    getMyLeaves,
    getLeave,
    applyLeave,
    updateLeave,
    cancelLeave,
    processLeaveApproval,
    getClassInchargeLeaves
} from '../../controllers/student/studentLeave.controller.js';

import { protect, authorize } from '../../middleware/auth.js';
import studentUpload from '../../middleware/studentUpload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Class in-charge route must come before /:id to avoid conflict
router
    .route('/class-incharge')
    .get(authorize('faculty', 'department-admin'), getClassInchargeLeaves);

router
    .route('/')
    .get(authorize('student'), getMyLeaves)
    .post(authorize('student'), studentUpload.single('attachment'), applyLeave);

router
    .route('/:id')
    .get(authorize('student'), getLeave)
    .put(authorize('student'), updateLeave)
    .delete(authorize('student'), cancelLeave);

// Approval route for faculty/admin
router
    .route('/:id/approval')
    .put(authorize('faculty', 'department-admin', 'superadmin', 'executive-admin'), processLeaveApproval);

export default router;
