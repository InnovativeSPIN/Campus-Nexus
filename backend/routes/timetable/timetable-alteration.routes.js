import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  submitAlterationRequest,
  acceptAlteration,
  rejectAlteration,
  applyAlteration,
  getPendingAlteration,
  getAlterationsToApply,
  revertAlteration,
} from '../../controllers/timetable/timetable-alteration.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * Alteration Workflow Routes
 * STEP 1: Faculty submits leave with alteration request
 */
router.post('/request', submitAlterationRequest);

/**
 * STEP 2a: Substitute faculty accepts alteration request
 */
router.patch('/:substituteId/accept', acceptAlteration);

/**
 * STEP 2b: Substitute faculty rejects alteration request
 */
router.patch('/:substituteId/reject', rejectAlteration);

/**
 * STEP 3: Timetable incharge applies the alteration
 */
router.post('/apply', authorize('department-admin'), applyAlteration);

/**
 * Get pending alteration requests for a substitute faculty
 */
router.get('/pending/:facultyId', getPendingAlteration);

/**
 * Get alterations pending approval for timetable incharge
 */
router.get('/incharge/:facultyId', authorize('department-admin'), getAlterationsToApply);

/**
 * Revert an alteration (cancel overlay)
 */
router.delete('/overlay/:overlayId', authorize('department-admin'), revertAlteration);

export default router;
