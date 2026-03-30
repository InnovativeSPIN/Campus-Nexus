# Multi-Level Leave Approval Workflow - Current State Analysis

## Executive Summary
The codebase has foundational structures for multi-level approvals in place, but implementation is **incomplete** and **inconsistent** between student and faculty workflows. Both use separate models and controllers.

---

## 1. STUDENT LEAVE WORKFLOW

### Current Implementation Status: **PARTIALLY IMPLEMENTED**

#### Database Model: `StudentLeave.model.js`
**Schema fields ready:**
- `class_incharge_approval_status` (pending/approved/rejected) ✅
- `class_incharge_id` (FK to Faculty) ✅
- `class_incharge_remarks` ✅
- `class_incharge_approval_date` ✅
- `department_admin_approval_status` (pending/approved/rejected) ✅
- `department_admin_id` (FK to Faculty) ✅
- `department_admin_remarks` ✅
- `department_admin_approval_date` ✅
- `overall_status` (pending/approved/rejected/cancelled) ✅

**Design:** Multi-level approval fields are **already defined** in schema.

#### Controller: `studentLeave.controller.js`
**Implemented Methods:**
- `getMyLeaves()` - Lists student's own leaves
- `getLeave()` - Gets single leave (basic)
- `applyLeave()` - Creates leave request with auto-populated classId
- `updateLeave()` - Updates pending leaves (?)
- `cancelLeave()` - Cancels pending leaves (?)
- `getClassInchargeLeaves()` - Gets pending leaves for class in-charge
- `processLeaveApproval()` - **NEEDS VERIFICATION** - Likely handles approval logic

**Missing/Incomplete:**
- No method to fetch for Department Admin approval
- No logic to progress status through approval chain
- Missing approval notification creation
- Missing overall_status management logic

#### Routes: `student/studentLeave.routes.js`
```
POST   /api/v1/student-leaves                  - Apply
GET    /api/v1/student-leaves                  - Get my leaves
GET    /api/v1/student-leaves/:id              - Get single
PUT    /api/v1/student-leaves/:id              - Update (student)
DELETE /api/v1/student-leaves/:id              - Cancel
GET    /api/v1/student-leaves/class-incharge   - For class in-charge
PUT    /api/v1/student-leaves/:id/approval     - Approval (class-incharge OR dept-admin)
```

**Gap:** Single `/approval` endpoint handles both levels - needs separation or smart routing

#### Frontend Pages
1. **Student Page:** `student/pages/academics/Leave.tsx`
   - Shows apply form
   - Displays leave status
   - Shows approval remarks
   - **Gap:** No real-time status tracking through approval chain

2. **Department Admin:** `admin/department-admin/pages/Leave.tsx`
   - Exists but needs to verify if student leaves included
   - Has `LeaveApprovals` component
   - **Gap:** Unclear if it handles student leave approvals

---

## 2. FACULTY LEAVE WORKFLOW

### Current Implementation Status: **PARTIALLY IMPLEMENTED**

#### Database Models
**Primary Model:** `Leave.model.js` (for ALL leaves - faculty and student)
**Status Field Values:**
- `pending` - Initial state
- `hod_approved` - Department Admin (HOD) approved
- `approved` - Final approval by Executive Admin
- `rejected` - Rejected at any level
- `cancelled` - Cancelled by applicant

**Substitute Workflow Fields:**
- `reassign_faculty_id` - Who will cover
- `substitute_status` (pending/accepted/rejected) - For reassign faculty response
- `substitute_notified_at` - When notified
- `substitute_response_at` - When responded
- `substitute_remarks` - Their notes

**Timetable Alteration Fields:**
- `affected_periods` (JSON) - Timetable periods affected
- `substitute_faculty_code` - Code of substitute
- `timetable_altered` (boolean)
- `admin_approval_status` (pending/approved/rejected)
- `admin_approval_date`
- `loadAssign` - Workload distribution

#### Secondary Model: `FacultySubstitutes.model.js`
**Purpose:** Tracks substitute faculty acceptances
**Fields:**
- `faculty_id` - Absent faculty (on leave)
- `substitute_faculty_id` - Who's covering
- `status` (pending/approved/rejected)
- `approved_by` - Substitute's approval
- `approval_date`
- `leave_id` (FK to Leave)
- `reason`, `start_date`, `end_date`

**Current Use:** Created when leave is requested with reassignment

#### Controller: `leave.controller.js`
**Implemented Methods:**
- `getAllLeaves()` - Query with filters (status, type, dept, applicant)
- `getLeave()` - Get single leave
- `createLeave()` - Creates leave, auto-assigns reassign faculty, creates LeaveNotification
- `updateLeave()` - Updates pending leaves only
- `updateLeaveStatus()` - **TWO-LEVEL APPROVAL LOGIC:**
  - If Dept Admin approves: status becomes `hod_approved` → notifies Executive Admin
  - If Executive Admin approves: status becomes `approved` → updates leave balance
  - Handles rejection at both levels
- `cancelLeave()` - Restores leave balance if approved
- `deleteLeave()` - Deletes pending leaves
- `getMyLeaves()` - Gets user's own leaves
- `getLeaveBalance()` - Gets balance for leave types (faculty only)
- `getPendingCount()` - Count pending leaves for admins
- `getPendingLeaves()` - Fetches pending leaves for approval (with filters)
- `getLeaveNotifications()` - Gets all notifications
- `getLeaveNotificationCount()` - Unread count
- `markLeaveNotificationRead()` - Single notification
- `markAllLeaveNotificationsRead()` - All as read
- `getReassignmentRequests()` - Fetches pending reassignments for faculty
- `processReassignmentResponse()` - Faculty accepts/rejects reassignment

**Missing/Incomplete:**
1. **No Substitute Faculty Approval Step** - The workflow skips from Faculty Submit → HOD Approval
   - Should be: Faculty Submit → Substitute Approve → HOD Approve → Exec Admin Approve
   
2. **No Timetable Incharge Approval Step** - Missing from workflow
   - Should notify Timetable Incharge after substitute approves
   
3. **Weak Timetable Alteration Integration** - Fields exist but logic unclear
   - Who applies the timetable alteration?
   - When does it happen?

#### Notification Model: `LeaveNotification.model.js`
**Fields:**
- `leave_request_id` - FK
- `recipient_type` (faculty/department-admin/executiveadmin)
- `recipient_id` - Can be null for broadcasts
- `notification_type` (but code uses `type`)
- `title`, `message`
- `is_read` (boolean)
- `sent_at`

**Gap:** Schema uses `leave_request_id` but code creates with `leaveId` - **FIELD MISMATCH**

#### Routes: `leave-attendance/leave.routes.js`
```
GET    /api/v1/leave                          - All leaves (with filters)
POST   /api/v1/leave                          - Create leave
GET    /api/v1/leave/my-leaves                - My leaves (ordered by created)
GET    /api/v1/leave/balance                  - Leave balance
GET    /api/v1/leave/reassignment-requests    - For requestor (pending reassignments)
GET    /api/v1/leave/pending-approvals        - For admins (pending to approve)
GET    /api/v1/leave/pending-count            - Count pending
GET    /api/v1/leave/notifications            - All notifications
GET    /api/v1/leave/notifications/unread-count - Unread count
PUT    /api/v1/leave/:id                      - Update leave
PUT    /api/v1/leave/:id/status               - Approve/reject/cancel
PUT    /api/v1/leave/:id/cancel               - Cancel (applicant only)
PUT    /api/v1/leave/:id/reassignment-response - Substitute response
DELETE /api/v1/leave/:id                      - Delete
PUT    /api/v1/leave/notifications/:id/read   - Mark notification read
PUT    /api/v1/leave/notifications/mark-all-read
```

#### Frontend Pages
1. **Faculty Leave Page:** `faculty/pages/Leave.tsx`
   - Apply form with reassign faculty dropdown
   - Shows pending, hod_approved, approved, rejected, cancelled statuses
   - Can cancel pending leaves
   - Can respond to reassignments

2. **Department Admin Leave Page:** `admin/department-admin/pages/Leave.tsx`
   - Shows `LeaveApprovals` component
   - Likely for approving pending and hod_approved leaves

3. **Department Admin LeaveWithAlteration:** `admin/department-admin/pages/LeaveWithAlteration.tsx`
   - For timetable alteration handling
   - Status: Exists but unclear if functional

4. **Executive Admin LeaveRequests:** `admin/executive/LeaveRequests.tsx`
   - Handles final approvals (hod_approved → approved)
   - Lists department/leave type/applicant details

---

## 3. KEY GAPS & ISSUES

### Database Schema Issues
| Issue | Impact | Fix |
|-------|--------|-----|
| LeaveNotification uses `leave_request_id` but code sends `leaveId` | Data not saving correctly | Standardize to `leaveId` or fix code to use `leave_request_id` |
| StudentLeave approval levels incomplete in controller | Approvals can't progress | Implement full workflow in controller |
| No "Timetable Incharge" role/table | Can't track timetable approvers | Define role and create assignment model |

### Logic Flow Issues
| Workflow | Current State | Required State |
|----------|---------------|-----------------|
| **Student Leave** | 2-level (Class Incharge → Dept Admin) | 2-level (complete) |
| **Faculty Leave** | 2-level (HOD → Exec Admin) | 5-level (Substitute → Timetable → HOD → Exec → Leave balance) |
| **Faculty Substitute** | Has model, basic approval | Needs full integration with leave workflow |
| **Timetable Alteration** | Fields exist, integration unclear | Needs timetable incharge approval step |

### Frontend Issues
1. **No Substitute Faculty Approval UI** - Faculty can't approve reassignments
2. **No Timetable Incharge UI** - No page for timetable incharge approval
3. **Inconsistent Status Display** - Different pages show different status formats
4. **No Multi-Step Progress Indicator** - Users can't see approval status chain

---

## 4. REQUIRED API IMPLEMENTATIONS

### For Student Leave Workflow Completion
```javascript
// New endpoints needed:
GET    /api/v1/student-leaves/department-admin/pending  // For dept admin
PUT    /api/v1/student-leaves/:id/class-incharge-approval
PUT    /api/v1/student-leaves/:id/department-admin-approval
GET    /api/v1/student-leaves/:id/approval-history       // Track chain
```

### For Faculty Leave Workflow Completion
```javascript
// New endpoints needed:
GET    /api/v1/leave/substitute-pending                  // For substitute faculty
PUT    /api/v1/leave/:id/substitute-approval             // Substitute response
GET    /api/v1/leave/timetable-incharge/pending          // For timetable incharge
PUT    /api/v1/leave/:id/timetable-approval              // Timetable incharge approval
GET    /api/v1/leave/:id/approval-chain                  // Full approval history
```

---

## 5. DATABASE CHANGES LIKELY NEEDED

### Add to Leave Model
```javascript
// Track multi-level approvals
substitute_approved_by: INTEGER (FK to Faculty)
substitute_approval_date: DATE
substitute_approval_remarks: TEXT

timetable_incharge_id: INTEGER (FK to Faculty)
timetable_incharge_approval_date: DATE
timetable_incharge_approval_remarks: TEXT

// Overall workflow tracking
current_approval_level: ENUM('pending', 'substitute', 'timetable', 'hod', 'exec')
approval_chain: JSON (track all approval history)
```

### Create New Table (Optional but Better)
```javascript
leave_approval_chain: {
  id, leave_id, approval_level, approver_id, 
  approval_date, remarks, status, created_at
}
// This denormalizes the flow for easier tracking
```

---

## 6. WHAT'S READY FOR USE

✅ **Two-level Faculty Approval** (HOD → Exec Admin) - Mostly complete
✅ **Leave Balance Management** - Implemented for faculty
✅ **Reassignment Request Model** - Exists, partially integrated
✅ **Leave Notifications** - Infrastructure exists (check field mapping)
✅ **Basic Student Leave Apply** - Front and backend

---

## 7. IMPLEMENTATION PRIORITY

**Phase 1 (Must-have):**
1. Fix LeaveNotification field mismatch (`leaveId` vs `leave_request_id`)
2. Complete StudentLeave approval controller methods
3. Create Timetable Incharge role/assignment logic

**Phase 2 (Should-have):**
1. Integrate Substitute Faculty approval step
2. Add Timetable Incharge approval step
3. Create approval chain history tracking

**Phase 3 (Nice-to-have):**
1. Enhanced notification system with email/SMS
2. Approval status visualization UI
3. Batch approval capabilities

---

## 8. FILE LOCATIONS SUMMARY

### Backend Controllers
- Faculty/All Leaves: `backend/controllers/leave-attendance/leave.controller.js` (1000+ lines)
- Student Leaves: `backend/controllers/student/studentLeave.controller.js`

### Backend Routes
- Faculty/All Leaves: `backend/routes/leave-attendance/leave.routes.js`
- Student Leaves: `backend/routes/student/studentLeave.routes.js`

### Backend Models
- Leaves (Faculty): `backend/models/Leave.model.js`
- Student Leave: `backend/models/StudentLeave.model.js`
- Faculty Substitutes: `backend/models/FacultySubstitutes.model.js`
- Notifications: `backend/models/LeaveNotification.model.js`
- Class Incharge: `backend/models/ClassIncharge.model.js` (for student approval)

### Frontend Pages (Student)
- Apply/View Leaves: `frontend/src/pages/student/pages/academics/Leave.tsx`

### Frontend Pages (Faculty)
- Apply/View Leaves: `frontend/src/pages/faculty/pages/Leave.tsx`

### Frontend Pages (Admin)
- Dept Admin Students: `frontend/src/pages/admin/department-admin/pages/Leave.tsx`
- Dept Admin Faculty: `frontend/src/pages/admin/department-admin/pages/LeaveWithAlteration.tsx` (incomplete?)
- Exec Admin: `frontend/src/pages/admin/executive/LeaveRequests.tsx`

### Frontend Components
- Approvals: `frontend/src/pages/admin/department-admin/components/LeaveApprovals.tsx`
- Notifications: `frontend/src/components/common/LeaveNotificationBell.tsx`
- Snapshots: Various `LeaveSnapshot.tsx` files

