import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  submitLeaveRequest,
  getMyLeaveApplications,
  getLeaveRequestDetails,
  withdrawLeaveRequest,
  deleteLeaveApplication,
  getPendingAlterationRequests,
  getPendingAlterationsForIncharge,
  getSlotDetails,
  getPeriodsForDateRange,
  getAlternativeFacultyForPeriods,
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
  departmentAdminLeaveApproval
} from '../../controllers/faculty/executiveApproval.controller.js';
import {
  requestPeriodAlteration,
  getMyAlterationPlan,
  reassignPeriodAlteration,
  getMyPeriodRequests,
  acceptPeriodAlteration,
  rejectPeriodAlteration,
  cancelPeriodAlteration,
  submitLeaveWithPlan,
  abortDraft,
} from '../../controllers/faculty/alterationPlan.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(authorize('faculty', 'department-admin', 'superadmin', 'executiveadmin'));

// ==================== FACULTY LEAVE REQUEST ROUTES ====================

// Faculty submits leave with alteration request
router.post('/leave-request/submit', authorize('faculty', 'department-admin'), submitLeaveRequest);

// Submit leave using a confirmed alteration plan (new 2-step flow)
router.post('/leave-request/submit-with-plan', authorize('faculty', 'department-admin'), submitLeaveWithPlan);

// Get my leave applications
router.get('/leave-request/my-applications', authorize('faculty', 'department-admin'), getMyLeaveApplications);

// Get slot details for a specific date and period
router.get('/leave-request/slot-details', authorize('faculty', 'department-admin'), getSlotDetails);

// Get all periods for faculty in a date range (new leave flow)
router.get('/leave-request/periods-for-dates', authorize('faculty', 'department-admin'), getPeriodsForDateRange);

// Get alternative faculty for a set of periods (new leave flow)
router.post('/leave-request/alternative-faculty', authorize('faculty', 'department-admin'), getAlternativeFacultyForPeriods);

// Get leave request details
router.get('/leave-request/:id', getLeaveRequestDetails);

// Withdraw pending leave request
router.delete('/leave-request/:id/withdraw', authorize('faculty', 'department-admin'), withdrawLeaveRequest);

// Permanently delete a leave record (Cleanup old data)
router.delete('/leave-request/:id', authorize('faculty', 'department-admin'), deleteLeaveApplication);

// Get rejection reasons for a leave request
router.get('/leave-request/:leaveId/rejection-reasons', authorize('faculty', 'department-admin'), getLeaveRejectionReasons);

// ==================== ALTERATION PLAN ROUTES (PRE-LEAVE, PER-PERIOD) ====================

// Request substitute for a single period (starts the planning phase)
router.post('/alteration-plan/request-period', authorize('faculty', 'department-admin'), requestPeriodAlteration);

// Abort all unsubmitted drafts
router.delete('/alteration-plan/abort-draft', authorize('faculty', 'department-admin'), abortDraft);

// Get my alteration plan
router.get('/alteration-plan/my-plan', authorize('faculty', 'department-admin'), getMyAlterationPlan);

// Get pending period requests for the logged-in faculty (as substitute)
router.get('/alteration-plan/my-requests', authorize('faculty', 'department-admin'), getMyPeriodRequests);

// Reassign a rejected period to a new substitute
router.patch('/alteration-plan/:id/reassign', authorize('faculty', 'department-admin'), reassignPeriodAlteration);

// Accept a period alteration request (by substitute)
router.patch('/alteration-plan/:id/accept', authorize('faculty', 'department-admin'), acceptPeriodAlteration);

// Reject a period alteration request (by substitute)
router.patch('/alteration-plan/:id/reject', authorize('faculty', 'department-admin'), rejectPeriodAlteration);

// Cancel a period alteration request (by original faculty)
router.delete('/alteration-plan/:id/cancel', authorize('faculty', 'department-admin'), cancelPeriodAlteration);

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

// Department admin approves/rejects leave directly
router.patch('/leave-approval/department/:leaveId/:action', authorize('faculty', 'department-admin'), departmentAdminLeaveApproval);

export default router;
