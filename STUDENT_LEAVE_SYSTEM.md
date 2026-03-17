# Student Leave Management System - Complete Implementation Guide

## Overview

This document provides a comprehensive guide to the newly implemented **Multi-Level Student Leave Approval System** with notification and audit logging capabilities.

## System Architecture

### Approval Workflow

```
Student Submission
       ↓
Class Incharge Review (Approve/Reject)
       ↓ (if approved)
Department Admin Final Approval
       ↓
Overall Status: Approved/Rejected
```

### Roles & Responsibilities

| Role | Responsibility | Status Query |
|------|-----------------|--------------|
| **Student** | Submit leave application | View own leaves & history |
| **Class Incharge** | First-level review & approval | GET `/pending/class-incharge` |
| **Department Admin** | Final authorization | GET `/pending/dept-admin` |

## Frontend Components

### 1. Student Leave Submission (`SubmitLeave.tsx`)

**Purpose:** Allow students to submit new leave applications

**Features:**
- Form with leave type selection (cascading to subtypes)
- Date range input with automatic day calculation
- Reason textarea with character limit
- File attachment upload for supporting documents
- 4-step approval workflow visualization
- Form validation and error handling
- API integration with `/api/v1/student-leaves/approvals/submit`

**Key Props/State:**
```typescript
interface LeaveFormData {
  leaveType: string;
  leaveSubType: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  attachment?: File;
}
```

**Usage:**
Navigate to student dashboard → Leave Management → Submit New Leave

---

### 2. Leave Tracker (`MyLeaveTracker.tsx`)

**Purpose:** Students track their submitted leaves and approval status

**Features:**
- List of all student's leave applications
- Status badges (Pending, Approved, Rejected, Cancelled)
- Timeline view showing approval chain
- View remarks from each approver
- Withdraw pending applications
- Responsive card layout with Framer Motion animations

**API Calls:**
- `GET /api/v1/student-leaves/approvals/my-applications` - Fetch leaves
- `DELETE /api/v1/student-leaves/approvals/:id/withdraw` - Withdraw leave

**Usage:**
Dashboard → Leave Management → My Leaves

---

### 3. Class Incharge Dashboard (`ClassInchargeApprovalDashboard.tsx`)

**Purpose:** Class incharges review and approve student leaves

**Features:**
- Queue of pending leaves requiring approval
- Student details (name, roll no, email)
- Leave details (type, dates, duration, reason)
- Inline approval/rejection with remarks dialog
- Batch processing indicators
- Badge showing number of pending applications

**Authorization:**
Only faculty who are class coordinators (via TimetableMaster) can access

**API Calls:**
- `GET /api/v1/student-leaves/approvals/pending/class-incharge` - Fetch queue
- `PATCH /api/v1/student-leaves/approvals/:id/class-incharge/approved` - Approve
- `PATCH /api/v1/student-leaves/approvals/:id/class-incharge/rejected` - Reject

**Usage:**
Faculty Dashboard → Leave Approvals → Student Leaves to Review

---

### 4. Department Admin Dashboard (`DeptAdminApprovalDashboard.tsx`)

**Purpose:** Department admins make final leave approval decisions

**Features:**
- Filtered queue showing only CI-approved leaves
- Display of class incharge's approval status and remarks
- Final decision interface with optional remarks
- Status progression visualization
- Record of all decision points

**Authorization:**
Only faculty with role_id = 7 (Department Admin) in the department can access

**API Calls:**
- `GET /api/v1/student-leaves/approvals/pending/dept-admin` - Fetch queue
- `PATCH /api/v1/student-leaves/approvals/:id/dept-admin/approved` - Approve
- `PATCH /api/v1/student-leaves/approvals/:id/dept-admin/rejected` - Reject

**Usage:**
Admin Dashboard → Leave Approvals → Final Authorization

---

### 5. Notification Center (`NotificationCenter.tsx`)

**Purpose:** Centralized notification management system

**Features:**
- Bell icon with unread count badge
- Dialog displaying all notifications
- Color-coded by notification type
- Mark as read functionality
- Delete individual notifications
- Timestamps for each notification
- Scrollable list with auto-scroll to latest

**Types of Notifications:**
- Leave submitted by student
- Pending approvals (for approvers)
- Approval decisions (for students)
- Rejection with remarks

**API Calls:**
- `GET /api/v1/notifications` - Fetch all notifications
- `GET /api/v1/notifications/unread/count` - Get count
- `PATCH /api/v1/notifications/:id/read` - Mark as read
- `DELETE /api/v1/notifications/:id` - Delete

**Integration:**
Include in header/navbar:
```typescript
<div className="flex items-center gap-4">
  {/* Other header items */}
  <NotificationCenter role="student" />
</div>
```

---

### 6. Approval History (`ApprovalHistory.tsx`)

**Purpose:** Display complete timeline of approval for a specific leave

**Features:**
- Full leave application details
- Step-by-step approval timeline
- Visual indicators for each step (completed/pending/rejected)
- Actor names and timestamps
- Remarks from each approver
- Overall status badge (Approved/Rejected/Pending)

**Timeline Display:**
- Step 1: Application Submitted (by Student)
- Step 2: Class Incharge Review (Approved/Rejected)
- Step 3: Department Admin Approval (if CI approved)

**API:**
- `GET /api/v1/approval-history/:leaveId` - Fetch timeline

**Access:**
Students can view their own leaves' history
Faculty can view leaves they are approving/have approved
Department Admins can see all departmental leaves

**Usage:**
From Leave Tracker → Click "View Approval Timeline" button

---

## Backend Controllers

### 1. Student Leave Approval Controller

**Location:** `backend/controllers/student/studentLeaveApproval.controller.js`

#### Endpoints

**Submit Leave Application**
```
POST /api/v1/student-leaves/approvals/submit
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "leaveType": "Medical Leave",
  "leaveSubType": "Sick Leave",
  "startDate": "2024-01-15",
  "endDate": "2024-01-17",
  "totalDays": 3,
  "reason": "Doctor's appointment",
  "attachment": "file_id"
}

Response:
{
  "success": true,
  "message": "Leave application submitted successfully",
  "data": {
    "id": 1,
    "studentId": 5,
    "classId": 1,
    "overall_status": "pending",
    "class_incharge_approval_status": "pending",
    "department_admin_approval_status": "pending"
  }
}
```

**Class Incharge Approves/Rejects**
```
PATCH /api/v1/student-leaves/approvals/:id/class-incharge/approved
PATCH /api/v1/student-leaves/approvals/:id/class-incharge/rejected
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "remarks": "Approved - all documents provided"
}

Response:
{
  "success": true,
  "message": "Leave approved by class incharge",
  "data": { /* updated leave object */ }
}
```

**Get Pending Leaves for Class Incharge**
```
GET /api/v1/student-leaves/approvals/pending/class-incharge
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 5,
  "data": [ /* array of pending leaves */ ]
}
```

**Department Admin Approves/Rejects**
```
PATCH /api/v1/student-leaves/approvals/:id/dept-admin/approved
PATCH /api/v1/student-leaves/approvals/:id/dept-admin/rejected
Authorization: Bearer <token>

Request Body:
{
  "remarks": "Final approval granted"
}

Response:
{
  "success": true,
  "message": "Leave approved by department admin",
  "data": { /* updated leave object */ }
}
```

**Get Student's Leave Applications**
```
GET /api/v1/student-leaves/approvals/my-applications
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 3,
  "data": [ /* array of student's leaves */ ]
}
```

**Withdraw Leave** (Student only - if pending)
```
DELETE /api/v1/student-leaves/approvals/:id/withdraw
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Leave application withdrawn",
  "data": { /* updated leave object */ }
}
```

### 2. Notification Controller

**Location:** `backend/controllers/notification.controller.js`

#### Public Endpoints

**Get All Notifications**
```
GET /api/v1/notifications
Authorization: Bearer <token>
Query Params: ?limit=20&offset=0

Response:
{
  "success": true,
  "total": 25,
  "count": 20,
  "data": [ /* array of notifications */ ]
}
```

**Get Unread Count**
```
GET /api/v1/notifications/unread/count
Authorization: Bearer <token>

Response:
{
  "success": true,
  "unreadCount": 3
}
```

**Mark as Read**
```
PATCH /api/v1/notifications/:id/read
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Notification marked as read",
  "data": { /* notification object */ }
}
```

**Delete Notification**
```
DELETE /api/v1/notifications/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Notification deleted"
}
```

**Mark All as Read**
```
PATCH /api/v1/notifications/mark-all/read
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "All notifications marked as read"
}
```

#### Internal Helper Functions (Not exposed as routes)

```typescript
// Called when student submits leave
notifyStudentLeaveEvent('leave_submitted', {
  userId: studentId,
  entityId: leaveId,
  relatedData: { leaveType, leaveSubType, totalDays }
});

// Called when class incharge needs to approve
notifyFacultyApprovalPending({
  facultyId: classInchargeId,
  studentName: 'John Doe',
  leaveType: 'Medical Leave',
  totalDays: 3,
  entityId: leaveId
});

// Called when dept admin needs to approve
notifyDeptAdminApprovalPending({
  facultyId: deptAdminId,
  studentName: 'John Doe',
  leaveType: 'Medical Leave',
  classInchargeName: 'Prof. Smith',
  entityId: leaveId
});
```

### 3. Approval History Controller

**Location:** `backend/controllers/approvalHistory.controller.js`

#### Endpoints

**Get Approval Timeline for Leave**
```
GET /api/v1/approval-history/:leaveId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "leave": {
      "id": 1,
      "studentName": "John Doe",
      "studentRollNo": "20A01006",
      "leaveType": "Medical Leave",
      "startDate": "2024-01-15",
      "endDate": "2024-01-17",
      "totalDays": 3,
      "reason": "Doctor's appointment",
      "overallStatus": "approved"
    },
    "timeline": [
      {
        "step": 1,
        "stage": "Application Submitted",
        "actor": "John Doe",
        "role": "Student",
        "timestamp": "2024-01-14T10:00:00Z",
        "status": "completed"
      },
      {
        "step": 2,
        "stage": "Class Incharge Review",
        "actor": "Prof. Smith",
        "role": "Class Incharge",
        "timestamp": "2024-01-14T14:30:00Z",
        "status": "approved",
        "remarks": "Approved - all documents provided"
      },
      {
        "step": 3,
        "stage": "Department Admin Approval",
        "actor": "Dr. Johnson",
        "role": "Department Admin",
        "timestamp": "2024-01-15T09:00:00Z",
        "status": "approved",
        "remarks": "Final approval granted"
      }
    ]
  }
}
```

**Get Department Audit Log**
```
GET /api/v1/approval-history/department/audit
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": 1,
      "studentName": "John Doe",
      "studentRollNo": "20A01006",
      "leaveType": "Medical Leave",
      "totalDays": 3,
      "submittedAt": "2024-01-14T10:00:00Z",
      "overallStatus": "approved",
      "classInchargeStatus": "approved",
      "classInchargeName": "Prof. Smith",
      "deptAdminStatus": "approved",
      "approvedAt": "2024-01-15T09:00:00Z"
    }
    // ... more entries
  ]
}
```

## Database Schema

### StudentLeave Table

```sql
CREATE TABLE student_leaves (
  id INT PRIMARY KEY AUTO_INCREMENT,
  studentId INT NOT NULL,
  classId INT NOT NULL,
  leaveType VARCHAR(50),
  leaveSubType VARCHAR(50),
  startDate DATE,
  endDate DATE,
  totalDays INT,
  reason TEXT,
  attachment VARCHAR(255),
  
  -- Multi-level approval fields
  overall_status ENUM('pending', 'approved', 'rejected', 'cancelled'),
  
  -- Class Incharge level
  class_incharge_approval_status ENUM('pending', 'approved', 'rejected'),
  class_incharge_id INT,
  class_incharge_remarks TEXT,
  class_incharge_approval_date DATETIME,
  
  -- Department Admin level
  department_admin_approval_status ENUM('pending', 'approved', 'rejected'),
  department_admin_id INT,
  department_admin_remarks TEXT,
  department_admin_approval_date DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (studentId) REFERENCES students(id),
  FOREIGN KEY (classId) REFERENCES classes(id),
  FOREIGN KEY (class_incharge_id) REFERENCES faculty_profiles(faculty_id),
  FOREIGN KEY (department_admin_id) REFERENCES faculty_profiles(faculty_id)
);
```

### StudentNotification Table

```sql
CREATE TABLE student_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  title VARCHAR(255),
  message TEXT,
  action_type VARCHAR(50),
  status ENUM('unread', 'read') DEFAULT 'unread',
  related_data JSON,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_status (user_id, status),
  INDEX idx_created_at (created_at)
);
```

## Authorization & Security

### Role-Based Access Control

| Endpoint | Required Role | Query Method |
|----------|---------------|--------------|
| Submit Leave | Student | Direct (studentId from JWT) |
| Get My Leaves | Student | Filter by studentId from JWT |
| CI Approval Queue | Faculty | Check TimetableMaster.class_coordinator_id |
| DA Approval Queue | Faculty | Check Faculty.role_id = 7 & department_id |
| Final Approval | Faculty | Verify DA role in department |
| View History | Student/Faculty | Check studentId match or approver role |

### JWT Payload Structure

```typescript
{
  id: number;           // User/Student ID
  faculty_id?: number;  // Faculty ID (if faculty user)
  role_id: number;      // 1=Admin, 2=Faculty, 3=Student, 7=Dept.Admin
  department_id?: number;
  iat: number;
  exp: number;
}
```

## Testing Guide

### Manual Testing Workflow

#### 1. Student Submission
```bash
# 1. Get student token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password"}'

# 2. Submit leave
curl -X POST http://localhost:5000/api/v1/student-leaves/approvals/submit \
  -H "Authorization: Bearer <student_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType":"Medical Leave",
    "leaveSubType":"Sick Leave",
    "startDate":"2024-01-15",
    "endDate":"2024-01-17",
    "totalDays":3,
    "reason":"Doctor appointment"
  }'

# 3. Verify student received notification
curl http://localhost:5000/api/v1/notifications \
  -H "Authorization: Bearer <student_token>"
```

#### 2. Class Incharge Review
```bash
# 1. Get CI token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ci@example.com","password":"password"}'

# 2. Get pending leaves
curl http://localhost:5000/api/v1/student-leaves/approvals/pending/class-incharge \
  -H "Authorization: Bearer <ci_token>"

# 3. Approve leave (assuming leaveId=1)
curl -X PATCH http://localhost:5000/api/v1/student-leaves/approvals/1/class-incharge/approved \
  -H "Authorization: Bearer <ci_token>" \
  -H "Content-Type: application/json" \
  -d '{"remarks":"Approved with all documents"}'

# 4. Verify student got notification
curl http://localhost:5000/api/v1/notifications \
  -H "Authorization: Bearer <student_token>"
```

#### 3. Department Admin Final Approval
```bash
# 1. Get DA token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"deptadmin@example.com","password":"password"}'

# 2. Get pending leaves
curl http://localhost:5000/api/v1/student-leaves/approvals/pending/dept-admin \
  -H "Authorization: Bearer <da_token>"

# 3. Final approve
curl -X PATCH http://localhost:5000/api/v1/student-leaves/approvals/1/dept-admin/approved \
  -H "Authorization: Bearer <da_token>" \
  -H "Content-Type: application/json" \
  -d '{"remarks":"Final approval granted"}'

# 4. Verify student got final approval notification
curl http://localhost:5000/api/v1/notifications \
  -H "Authorization: Bearer <student_token>"
```

#### 4. View Approval History
```bash
# View complete timeline
curl http://localhost:5000/api/v1/approval-history/1 \
  -H "Authorization: Bearer <student_token>"

# Department admin views audit log
curl http://localhost:5000/api/v1/approval-history/department/audit \
  -H "Authorization: Bearer <da_token>"
```

## Error Handling

### Common Error Responses

**400 - Bad Request**
```json
{
  "success": false,
  "error": "Invalid approval status"
}
```

**403 - Unauthorized**
```json
{
  "success": false,
  "error": "You are not authorized to approve this leave"
}
```

**404 - Not Found**
```json
{
  "success": false,
  "error": "Leave application not found"
}
```

**500 - Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Performance Considerations

### Database Indexes

```sql
-- For fast filtering by user and status
CREATE INDEX idx_student_leave_user_status 
  ON student_leaves(studentId, overall_status);

-- For approver queue queries
CREATE INDEX idx_student_leave_ci_status 
  ON student_leaves(classId, class_incharge_approval_status);

-- For notification queries
CREATE INDEX idx_notification_user_status 
  ON student_notifications(user_id, status);
```

### N+1 Query Prevention

All endpoints use Sequelize `.include()` for eager-loading related data:
- Student leaves include: Student, Faculty (both approvers)
- Approval queues include: Student data for display

## Future Enhancements

1. **Email Notifications**
   - Send email when leave submitted
   - Email when approval required (approver)
   - Email when approved/rejected (student)

2. **SMS Alerts**
   - SMS to approver for urgent approvals
   - SMS to student for rejections

3. **Advanced Features**
   - Leave balance management
   - Conflict detection with timetable
   - Bulk approval processing
   - Automatic escalation if pending >3 days

4. **Faculty Leave Integration**
   - Extend to 5-level approval for faculty
   - Substitute faculty involvement
   - Timetable impact analysis

## Support & Troubleshooting

### Issue: "Unauthorized to approve this leave"
**Cause:** Faculty is not the class coordinator for student's class
**Fix:** Verify TimetableMaster assignment for the class

### Issue: "Can only withdraw pending applications"
**Cause:** Leave already approved/rejected
**Fix:** Only pending leaves can be withdrawn by student

### Issue: "Must be approved by class incharge first"
**Cause:** Trying to DA approve before CI approval
**Fix:** Ensure CI approval happens first in the workflow

### Issue: Notifications not appearing
**Cause:** Notification routes not mounted or middleware missing
**Fix:** Check server.js imports and route registration

## Conclusion

The Multi-Level Student Leave Approval System provides a comprehensive workflow for managing student leaves with clear approval chains, notification tracking, and complete audit logging. All components are production-ready and tested for security and performance.
