import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  submitLeaveRequest,
  getMyLeaveApplications,
  getLeaveRequestDetails,
  withdrawLeaveRequest,
  getPendingAlterationRequests,
  getPendingAlterationsForIncharge,
  getSlotDetails,
} from '../../controllers/faculty/leaveRequest.controller.js';
import {
  acceptAlteration,
  rejectAlteration,
  checkFacultyAvailability,
  getDepartmentColleagues,
  getSubstitutesByClasses,
} from '../../controllers/faculty/alterationApproval.controller.js';
import {
  applyTimetableAlterations,
  getTimetableApplyQueue,
  revertAlteration,
} from '../../controllers/faculty/alterationApply.controller.js';
import {
  getPendingExecutiveApprovals,
  approveLeaveExecutiveAdmin,
  rejectLeaveExecutiveAdmin,
  getLeaveRejectionReasons,
} from '../../controllers/faculty/executiveApproval.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(authorize('faculty', 'department-admin', 'superadmin', 'executiveadmin'));

// ==================== FACULTY LEAVE REQUEST ROUTES ====================

// Faculty submits leave with alteration request
router.post('/leave-request/submit', authorize('faculty', 'department-admin'), submitLeaveRequest);

// Get my leave applications
router.get('/leave-request/my-applications', authorize('faculty', 'department-admin'), getMyLeaveApplications);

// Get leave request details
router.get('/leave-request/:id', getLeaveRequestDetails);

// Withdraw pending leave request
router.delete('/leave-request/:id/withdraw', authorize('faculty', 'department-admin'), withdrawLeaveRequest);

// Get rejection reasons for a leave request
router.get('/leave-request/:leaveId/rejection-reasons', authorize('faculty', 'department-admin'), getLeaveRejectionReasons);

// Get slot details for a specific date and period
router.get('/leave-request/slot-details', authorize('faculty', 'department-admin'), getSlotDetails);

// ==================== SUBSTITUTE FACULTY APPROVAL ROUTES ====================

// Get pending alteration requests for substitute faculty
router.get('/alteration/pending/:facultyId', authorize('faculty'), getPendingAlterationRequests);

// Accept alteration request
router.patch('/alteration/:leaveId/accept', authorize('faculty', 'department-admin'), acceptAlteration);

// Reject alteration request
router.patch('/alteration/:leaveId/reject', authorize('faculty', 'department-admin'), rejectAlteration);

// Check faculty availability
router.get('/alteration/check-faculty/:facultyId', authorize('faculty', 'department-admin'), checkFacultyAvailability);

// Get department colleagues for substitute selection
// Multiple route aliases for backward compatibility and clarity
router.get('/colleagues', authorize('faculty', 'department-admin'), getDepartmentColleagues);
router.get('/leave-management/colleagues', authorize('faculty', 'department-admin'), getSubstitutesByClasses);
router.get('/leave-management/class-teachers', authorize('faculty', 'department-admin'), getSubstitutesByClasses);
router.get('/alteration/department-colleagues', authorize('faculty', 'department-admin'), getDepartmentColleagues);

// ==================== TIMETABLE INCHARGE ALTERATION APPLICATION ROUTES ====================

// Get timetable incharge queue (alterations to apply)
router.get('/alteration/apply-queue', authorize('faculty', 'department-admin'), getTimetableApplyQueue);

// Get pending alterations for timetable incharge
router.get('/alteration/incharge/:facultyId', authorize('faculty', 'department-admin'), getPendingAlterationsForIncharge);

// Apply timetable alterations (create overlays)
router.post('/alteration/:leaveId/apply', authorize('faculty', 'department-admin'), applyTimetableAlterations);

// Revert an alteration (delete overlay)
router.delete('/alteration/:overlayId', authorize('faculty', 'department-admin'), revertAlteration);

// ==================== EXECUTIVE ADMIN APPROVAL ROUTES ====================

// Get pending executive approvals (>2 day leaves)
router.get('/leave-approval/pending', authorize('executiveadmin', 'superadmin'), getPendingExecutiveApprovals);

// Executive admin approves leave
router.patch('/leave-approval/:leaveId/approve', authorize('executiveadmin', 'superadmin'), approveLeaveExecutiveAdmin);

// Executive admin rejects leave
router.patch('/leave-approval/:leaveId/reject', authorize('executiveadmin', 'superadmin'), rejectLeaveExecutiveAdmin);

export default router;
