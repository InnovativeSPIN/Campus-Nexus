# Multi-Level Leave Approval System - Implementation Guide

## Overview
This document outlines the complete multi-level approval workflow for both Student and Faculty Leaves.

## Student Leave Approval Workflow

### Process Flow
```
Student Submits Leave
    ↓
Class Incharge Reviews & Approves/Rejects
    ↓
Department Admin Reviews & Approves/Rejects (if class incharge approved)
    ↓
Leave Approved or Rejected
```

### Backend Implementation - COMPLETED ✅

#### **New Files Created:**
1. **`backend/controllers/student/studentLeaveApproval.controller.js`**
   - `submitLeaveApplication()` - Student submits leave
   - `classInchargeApproveLeave()` - CI approves/rejects
   - `deptAdminApproveLeave()` - Dept Admin approves/rejects
   - `getPendingLeavesForClassIncharge()` - CI's pending queue
   - `getPendingLeavesForDeptAdmin()` - DA's pending queue
   - `getMyLeaveApplications()` - Student views their applications
   - `getLeaveDetails()` - Get application with all approvals
   - `withdrawLeave()` - Student withdraws pending application

2. **`backend/routes/student/studentLeaveApproval.routes.js`**
   - All routes with proper authorization checks
   - Routes registered in `server.js`

#### **Updated Files:**
- **`backend/models/StudentLeave.model.js`**
  - Added multi-level approval fields:
    - `class_incharge_approval_status`
    - `class_incharge_id`, `class_incharge_remarks`, `class_incharge_approval_date`
    - `department_admin_approval_status`
    - `department_admin_id`, `department_admin_remarks`, `department_admin_approval_date`
    - `overall_status` (pending → approved/rejected)

- **`backend/server.js`**
  - Imported new routes
  - Mounted at `/api/v1/student-leaves/approvals`

### API Endpoints - READY TO USE ✅

**Student Submission:**
```
POST   /api/v1/student-leaves/approvals/submit
       Body: { leaveType, leaveSubType, startDate, endDate, totalDays, reason, attachment }
       Auth: student

GET    /api/v1/student-leaves/approvals/my-applications
       Auth: student (returns student's leaves with approval status)

GET    /api/v1/student-leaves/approvals/:id
       Auth: any authenticated user

DELETE /api/v1/student-leaves/approvals/:id/withdraw
       Auth: student (can only withdraw if overall_status = pending)
```

**Class Incharge Approval:**
```
GET    /api/v1/student-leaves/approvals/pending/class-incharge
       Auth: faculty/department-admin
       Returns: leaves for classes where faculty is class_coordinator

PATCH  /api/v1/student-leaves/approvals/:id/class-incharge-approval
       Body: { approval_status: 'approved' | 'rejected', remarks: '...' }
       Auth: faculty/department-admin
```

**Department Admin Approval:**
```
GET    /api/v1/student-leaves/approvals/pending/dept-admin
       Auth: department-admin (role_id = 7)
       Returns: leaves where class_incharge_approved but dept_admin still pending

PATCH  /api/v1/student-leaves/approvals/:id/dept-admin-approval
       Body: { approval_status: 'approved' | 'rejected', remarks: '...' }
       Auth: department-admin
```

---

## Faculty Leave Approval Workflow

### PLANNED Process Flow
```
Faculty Submits Leave + Requests Substitute
    ↓
Substitute Faculty Approves/Rejects Alteration
    ↓
Timetable Incharge Applies Alteration to Schedule
    ↓
Department Admin Reviews & Approves/Rejects
    ↓
Executive Admin Final Approval
    ↓
Leave Approved - Faculty Takes Leave
```

### Status: PARTIAL ⚠️
- Controllers exist in `backend/controllers/faculty/` (2-level: HOD → Exec Admin)
- Missing: Substitute approval step, Timetable Incharge approval step
- Needs enhancement for complete workflow

---

## Frontend Pages - NEEDS CREATION 🔨

### Student Leave Pages

#### 1. **Student Leave Submission Page**
   - Show form: Leave type, dates, reason, attachment
   - Calculate total days automatically
   - Submit button
   - Show approval flow status

#### 2. **Student Leave Tracker**
   - List all student's leave applications
   - Show approval status: Pending CI → Pending DA → Approved/Rejected
   - Show remarks at each stage
   - Cancel button (for pending applications only)

#### 3. **Class Incharge Approval Dashboard**
   - View all pending leaves for assigned classes
   - Show student details and leave dates
   - Approve/Reject buttons with remarks field
   - Batch approval option

#### 4. **Department Admin Approval Dashboard**
   - View all leaves pending department admin approval
   - Filter by class
   - Show CI approval status
   - Approve/Reject buttons with remarks

### Faculty Leave Pages (To Be Enhanced)
- Substitute faculty approval interface
- Timetable Incharge approval dashboard
- Department Admin leave approval
- Executive Admin final approval

---

## Database State

### StudentLeave Table Fields
```sql
-- Existing
id (PK), studentId (FK), classId (FK), leaveType, leaveSubType, attachment,
startDate, endDate, totalDays, reason, created_at, updated_at

-- NEW (Multi-Level Approval)
overall_status (pending | approved | rejected | cancelled)
class_incharge_approval_status (pending | approved | rejected)
class_incharge_id (FK faculty)
class_incharge_remarks (TEXT)
class_incharge_approval_date
department_admin_approval_status (pending | approved | rejected)
department_admin_id (FK faculty)
department_admin_remarks (TEXT)
department_admin_approval_date
```

---

##How to Test

### **Using Postman/curl**

**Test Case 1: Student Submits Leave**
```bash
curl -X POST http://localhost:3005/api/v1/student-leaves/approvals/submit \
  -H "Authorization: Bearer <student_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType": "Casual Leave",
    "leaveSubType": "Family Event",
    "startDate": "2026-03-18",
    "endDate": "2026-03-20",
    "totalDays": "3",
    "reason": "Family wedding"
  }'
```

**Test Case 2: Class Incharge Approves**
```bash
curl -X PATCH http://localhost:3005/api/v1/student-leaves/approvals/1/class-incharge-approval \
  -H "Authorization: Bearer <class_incharge_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "approval_status": "approved",
    "remarks": "Approved - valid reason"
  }'
```

**Test Case 3: Dept Admin Approves**
```bash
curl -X PATCH http://localhost:3005/api/v1/student-leaves/approvals/1/dept-admin-approval \
  -H "Authorization: Bearer <dept_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "approval_status": "approved",
    "remarks": "Final approval granted"
  }'
```

---

## Next Steps (Priority Order)

### **Phase 1 - Frontend (This Week)**
- [ ] Create Student Leave Submission page
- [ ] Create Student Leave Tracker page
- [ ] Create Class Incharge Approval Dashboard
- [ ] Create Department Admin Approval Dashboard
- [ ] Add notifications/alerts for approvals

### **Phase 2 - Faculty Leave Enhancement**
- [ ] Create Substitute Faculty Approval interface
- [ ] Create Timetable Incharge approval step
- [ ] Enhance Department Admin approval for faculty
- [ ] Integrate with timetable overlay system

### **Phase 3 - Advanced Features**
- [ ] Approval history/audit log
- [ ] Email notifications at each stage
- [ ] Batch approval operations
- [ ] Leave balance integration
- [ ] Attendance sync on approval

---

## Database Schema (SQL Already Updated)

```sql
-- StudentLeave model reflects these columns:
ALTER TABLE student_leaves ADD COLUMN IF NOT EXISTS overall_status 
  ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending';

ALTER TABLE student_leaves ADD COLUMN IF NOT EXISTS class_incharge_approval_status 
  ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';
ALTER TABLE student_leaves ADD COLUMN IF NOT EXISTS class_incharge_id INT;
ALTER TABLE student_leaves ADD COLUMN IF NOT EXISTS class_incharge_remarks TEXT;
ALTER TABLE student_leaves ADD COLUMN IF NOT EXISTS class_incharge_approval_date DATETIME;

ALTER TABLE student_leaves ADD COLUMN IF NOT EXISTS department_admin_approval_status 
  ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';
ALTER TABLE student_leaves ADD COLUMN IF NOT EXISTS department_admin_id INT;
ALTER TABLE student_leaves ADD COLUMN IF NOT EXISTS department_admin_remarks TEXT;
ALTER TABLE student_leaves ADD COLUMN IF NOT EXISTS department_admin_approval_date DATETIME;
```

---

## Authorization Rules

| Endpoint | Role | Condition |
|----------|------|-----------|
| Submit Leave | student | Must have classId |
| CI Approval | faculty, dept-admin | Must be class_coordinator in timetable_master |
| DA Approval | department-admin | Must have role_id = 7 for the department |
| Withdraw | student | Only if overall_status = 'pending' |

---

## Key Features Implemented

✅ Multi-level approval chain  
✅ Role-based access control  
✅ Approval remarks/feedback  
✅ Automatic status progression  
✅ Approval history tracking  
✅ Notification-ready structure  

---

## Troubleshooting

**"Faculty is not authorized" error**
- Verify faculty is class_coordinator in timetable_master for that class
- Check role_id in database

**"Leave must be approved by class incharge first" error**
- Correct! Dept Admin can only approve after CI approves
- Ask CI to approve first

**Approval buttons not appearing**
- Verify authToken is set correctly
- Check user's role and department_id

---

## Support Files

- Controller: `backend/controllers/student/studentLeaveApproval.controller.js`
- Routes: `backend/routes/student/studentLeaveApproval.routes.js`
- Model: `backend/models/StudentLeave.model.js` (updated)
- Server: `backend/server.js` (routes added)

