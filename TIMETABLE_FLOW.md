# Timetable Management System - Complete Flow

## 🔄 System Workflow Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    TIMETABLE MANAGEMENT FLOW                  │
└──────────────────────────────────────────────────────────────┘

[Department Admin] → Setup → Manage → Monitor
       ↓              ↓        ↓         ↓
   Configure     Create    Modify    Approve
   Resources   Timetable  Periods   Changes
```

---

## 1️⃣ Initial Setup Flow (One-Time Configuration)

### Step 1: Room & Lab Creation
```
Department Admin Login
    ↓
Navigate to "Manage Rooms"
    ↓
Add Classrooms:
  - Room Number: "201"
  - Room Name: "Classroom 201"
  - Type: Classroom/Lab
  - Capacity: 60
  - Facilities: Projector, AC, etc.
    ↓
Add Labs:
  - Lab Code: "CNL"
  - Lab Name: "Computer Networks Lab"
  - Assign Room: Link to physical room
  - Assign Subjects: [Subject IDs]
    ↓
✅ Rooms & Labs Ready
```

**API Flow:**
```
POST /api/v1/department-admin/rooms
  → Validates department ownership
  → Creates room in database
  → Returns room ID

POST /api/v1/department-admin/labs
  → Validates room belongs to department
  → Validates subject assignments
  → Creates lab entry
  → Returns lab ID
```

---

### Step 2: Break Timing Configuration
```
Department Admin Login
    ↓
Navigate to "Break Timings Setup"
    ↓
Configure Year 1 Breaks:
  - Break 1: After Period 2 (10:00-10:15) - Short
  - Break 2: After Period 4 (12:30-13:15) - Lunch
    ↓
Configure Year 2 Breaks:
  - Break 1: After Period 2 (10:15-10:30) - Short
  - Break 2: After Period 4 (12:45-13:30) - Lunch
    ↓
Configure Year 3 & 4 Breaks (Shared):
  - Break 1: After Period 2 (10:30-10:45) - Short
  - Break 2: After Period 4 (13:00-13:45) - Lunch
    ↓
✅ Break Timings Configured for All Years
```

**API Flow:**
```
POST /api/v1/department-admin/break-timings/create
Body: {
  "year_group": "year_1",        // or year_2, year_3_4
  "break_name": "Lunch Break",
  "break_type": "lunch",         // or short
  "break_number": 1,
  "period_after": 4,
  "start_time": "12:30:00",
  "end_time": "13:15:00"
}
  → Validates year_group
  → Creates break timing
  → Links to department

GET /api/v1/department-admin/break-timings/year-group/year_1
  → Fetches all breaks for Year 1
  → Returns ordered by break_number
```

---

## 2️⃣ Timetable Creation Flow

### Option A: Bulk Upload (CSV Method)

```
Department Admin Login
    ↓
Download CSV Template
  GET /api/v1/timetable/format
    ↓
Fill CSV with Data:
  - Faculty ID (College Code)
  - Subject Code
  - Day, Period
  - Room Number
  - Lab Name (if lab session)
  - Session Type (Theory/Lab)
    ↓
Upload CSV File
  POST /api/v1/timetable/bulk-upload
    ↓
System Validation:
  ✓ Faculty exists in department?
  ✓ Room exists and available?
  ✓ Lab assigned for lab sessions?
  ✓ No faculty double-booking?
  ✓ No room double-booking?
    ↓
[If Errors] → Show validation errors → Fix CSV → Re-upload
    ↓
[If Success] → Store in database → Show preview
    ↓
✅ Timetable Created for All Faculty
```

**Detailed CSV Upload Flow:**
```
1. CSV Parse Phase:
   ─────────────────
   Read CSV file
     ↓
   Parse each row
     ↓
   Extract: facultyId, day, period, subject, roomNumber, labName, isLabSession
     ↓
   Store in memory array

2. Validation Phase:
   ─────────────────
   For each row:
     ✓ Check faculty exists (by faculty_college_code)
     ✓ Check faculty belongs to admin's department
     ✓ Check room exists (if specified)
     ✓ Check lab exists (if isLabSession = TRUE)
     ✓ Check no duplicate periods (same faculty, day, period)
     ✓ Check no room conflicts (same room, day, period)
     ↓
   Collect all errors
     ↓
   [If errors found] → Return 400 with error list → STOP
     ↓
   [If no errors] → Proceed to save

3. Database Save Phase:
   ──────────────────────
   Start transaction
     ↓
   Delete existing records (same faculty, same academic year)
     ↓
   Bulk insert all new records
     ↓
   Commit transaction
     ↓
   Return success with preview (first 50 rows)
```

**CSV Format Example:**
```csv
facultyId,facultyName,department,year,section,day,period,subject,subjectName,academicYear,roomNumber,labName,isLabSession,sessionType
CS12,Dr. John Smith,CSE,3,A,Monday,1,CS301,Data Structures,2024-2028,201,,FALSE,Theory
CS15,Prof. Sarah Jones,CSE,3,A,Monday,4,CS302L,DBMS Lab,2024-2028,CS-LAB-1,DBMS Lab,TRUE,Lab
```

---

### Option B: Manual Entry (Visual Grid Method)

```
Department Admin Login
    ↓
Navigate to "Create Timetable"
    ↓
Select: Academic Year, Semester, Year, Section
    ↓
Visual Grid Appears:
  ┌─────────┬────────┬────────┬────────┬─────────┐
  │  Day    │ Per 1  │ Per 2  │ Break  │ Per 3   │
  ├─────────┼────────┼────────┼────────┼─────────┤
  │ Monday  │ [+Add] │ [+Add] │ 🍽️     │ [+Add]  │
  │ Tuesday │ [+Add] │ [+Add] │ 🍽️     │ [+Add]  │
  └─────────┴────────┴────────┴────────┴─────────┘
    ↓
Click [+Add] on a period
    ↓
Modal Opens:
  - Select Faculty (dropdown)
  - Select Subject (dropdown filtered by faculty)
  - Select Room (dropdown shows only available rooms)
  - Is Lab Session? (checkbox)
  - [If Lab] Select Lab (dropdown)
    ↓
Click "Save Period"
    ↓
System Validates:
  ✓ Faculty not already assigned this period?
  ✓ Room not already occupied?
  ✓ Lab session has valid lab?
    ↓
[Success] → Period added to grid → Shows faculty name in cell
    ↓
Repeat for all periods
    ↓
Click "Publish Timetable"
    ↓
✅ Timetable Active
```

---

## 3️⃣ Timetable View Flow

### For Faculty:
```
Faculty Login
    ↓
Navigate to "My Timetable"
  GET /api/v1/timetable/faculty/me
    ↓
System Fetches:
  - All periods assigned to this faculty
  - Groups by day and period
  - Includes room and subject info
    ↓
Display in Grid Format:
  ┌─────────┬────────────┬────────────┬──────┬────────────┐
  │ Monday  │ CS301      │ CS301      │ 🍽️  │ CS302L     │
  │         │ Room: 201  │ Room: 201  │      │ Lab: CNL   │
  ├─────────┼────────────┼────────────┼──────┼────────────┤
  │ Tuesday │ CS303      │ Free       │ 🍽️  │ CS305L     │
  │         │ Room: 202  │            │      │ Lab: NWL   │
  └─────────┴────────────┴────────────┴──────┴────────────┘
    ↓
✅ Faculty sees their schedule
```

### For Students:
```
Student Login
    ↓
Navigate to "My Timetable"
  GET /api/v1/timetable/student/me
    ↓
System Fetches:
  - Student's year and section
  - All periods for that year/section
  - Groups by day
    ↓
Display Timetable with Faculty Names
    ↓
✅ Student sees class schedule
```

---

## 4️⃣ Leave Substitution Flow (Complete Workflow)

```
┌─────────────────────────────────────────────────────────┐
│         FACULTY LEAVE WITH CLASS COVERAGE               │
└─────────────────────────────────────────────────────────┘

Step 1: Faculty Applies for Leave
──────────────────────────────────
Faculty (Dr. Smith) Login
    ↓
Navigate to "Apply Leave"
    ↓
Fill Form:
  - Leave Type: Medical/Casual
  - Start Date: 2026-03-10
  - End Date: 2026-03-10
  - Reason: "Medical appointment"
    ↓
Click "Next"
    ↓
System Auto-Fetches Affected Periods:
  GET /api/v1/faculty/leave/affected-periods?date=2026-03-10
    ↓
System Shows:
  "You have 4 classes on this day:"
  ┌─────────┬────────┬─────────┬──────────┐
  │ Period  │ Subject│ Section │ Room     │
  ├─────────┼────────┼─────────┼──────────┤
  │ Period 1│ CS301  │ 3-A     │ 201      │
  │ Period 2│ CS301  │ 3-A     │ 201      │
  │ Period 4│ CS302  │ 3-B     │ 203      │
  │ Period 5│ CS303  │ 4-A     │ 205      │
  └─────────┴────────┴─────────┴──────────┘
    ↓
For Each Period, Select Substitute:
  Period 1: [Dropdown: Available Faculty]
            → Selects "Dr. Jones (CS15)"
  Period 2: [Dropdown: Available Faculty]
            → Selects "Dr. Jones (CS15)"
  Period 4: [Dropdown: Available Faculty]
            → Selects "Prof. Brown (CS20)"
  Period 5: [Dropdown: Available Faculty]
            → Selects "Prof. Williams (CS25)"
    ↓
Click "Submit Leave Request"
    ↓
System Creates:
  POST /api/v1/faculty/leave/apply-with-substitute
  Body: {
    "leaveType": "Medical",
    "startDate": "2026-03-10",
    "endDate": "2026-03-10",
    "reason": "Medical appointment",
    "affected_periods": [101, 102, 104, 105],
    "substitutes": [
      {"period_id": 101, "substitute_faculty_code": "CS15"},
      {"period_id": 102, "substitute_faculty_code": "CS15"},
      {"period_id": 104, "substitute_faculty_code": "CS20"},
      {"period_id": 105, "substitute_faculty_code": "CS25"}
    ]
  }
    ↓
Database Stores:
  - Leave record with status: "pending"
  - Affected periods (JSON array)
  - Substitute faculty codes
  - Substitute status: "pending"
    ↓
System Sends Notifications:
  ✉️ To Dr. Jones: "Dr. Smith requested you to substitute"
  ✉️ To Prof. Brown: "Dr. Smith requested you to substitute"
  ✉️ To Prof. Williams: "Dr. Smith requested you to substitute"
    ↓
✅ Leave Request Submitted


Step 2: Substitute Faculty Response
────────────────────────────────────
Dr. Jones Logs In
    ↓
Sees Notification: "You have substitution requests"
    ↓
Navigate to "Substitution Requests"
  GET /api/v1/faculty/leave/pending-substitution-requests
    ↓
Shows Requests:
  "Dr. Smith requested you for 2 periods on March 10:"
  - Period 1: CS301, Section 3-A, Room 201
  - Period 2: CS301, Section 3-A, Room 201
    ↓
Options: [Accept] [Reject]
    ↓
Dr. Jones Clicks "Accept"
    ↓
System Updates:
  PUT /api/v1/faculty/leave/{id}/respond-substitution
  Body: {
    "response": "accepted",
    "remarks": "Happy to help"
  }
    ↓
Database Updates:
  - substitute_status for Dr. Jones periods → "accepted"
  - substitute_response_at → current timestamp
  - substitute_remarks → "Happy to help"
    ↓
Dr. Jones receives 2 periods, waits for approval
    ↓

[Meanwhile]
Prof. Brown and Prof. Williams also accept
    ↓
All Substitutes Accepted
    ↓
System Auto-Forwards to Department Admin
  ✉️ Notification: "Leave request ready for approval"
    ↓
Leave status remains "pending"
Admin approval status: "pending"


Step 3: Department Admin Approval
──────────────────────────────────
Department Admin Login
    ↓
Sees Notification: "1 leave request pending approval"
    ↓
Navigate to "Leave Approvals"
  GET /api/v1/department-admin/leave/pending-timetable-alterations
    ↓
Shows Leave Details:
  ┌────────────────────────────────────────────┐
  │ Leave Request #1234                        │
  ├────────────────────────────────────────────┤
  │ Applicant: Dr. Smith (CS12)                │
  │ Date: March 10, 2026                       │
  │ Reason: Medical appointment                │
  │                                            │
  │ Affected Classes (4):                      │
  │ Per 1,2: CS301 → Dr. Jones ✅ Accepted    │
  │ Per 4: CS302 → Prof. Brown ✅ Accepted    │
  │ Per 5: CS303 → Prof. Williams ✅ Accepted │
  │                                            │
  │ [Approve] [Reject]                         │
  └────────────────────────────────────────────┘
    ↓
Admin Clicks "Approve"
    ↓
System Updates:
  PUT /api/v1/department-admin/leave/{id}/approve-alteration
    ↓
Database Changes:
  1. Leave table:
     - status → "approved"
     - admin_approval_status → "approved"
     - admin_approval_date → now
     - approvedById → admin ID
     - timetable_altered → TRUE

  2. Create Timetable Alterations:
     INSERT into timetable_alterations:
     {
       "timetable_period_id": 101,
       "date": "2026-03-10",
       "original_faculty_code": "CS12",
       "substitute_faculty_code": "CS15",
       "reason": "Medical leave",
       "status": "approved"
     }
     (Repeat for all 4 periods)
    ↓
Notifications Sent:
  ✉️ Dr. Smith: "Your leave is approved"
  ✉️ Dr. Jones: "Substitution confirmed for March 10"
  ✉️ Prof. Brown: "Substitution confirmed for March 10"
  ✉️ Prof. Williams: "Substitution confirmed for March 10"
    ↓
✅ Leave Approved, Timetable Altered


Step 4: Timetable Display on Leave Day
───────────────────────────────────────
March 10, 2026 - Students view timetable
    ↓
GET /api/v1/timetable/student/me?date=2026-03-10
    ↓
System Checks:
  - Fetch normal timetable for 3-A
  - Check timetable_alterations for this date
  - Override faculty if alteration exists
    ↓
Display to Students:
  ┌────────┬──────────────┬──────────────────┐
  │ Period │ Subject      │ Faculty          │
  ├────────┼──────────────┼──────────────────┤
  │ 1      │ CS301        │ Dr. Jones ⚠️     │
  │        │              │ (for Dr. Smith)  │
  │ 2      │ CS301        │ Dr. Jones ⚠️     │
  │ 4      │ CS302        │ Prof. Brown ⚠️   │
  │ 5      │ CS303        │ Prof. Williams⚠️ │
  └────────┴──────────────┴──────────────────┘
    ↓
✅ Students see substitutes, not original faculty
```

---

## 5️⃣ Room/Lab Allocation Flow

### Real-Time Availability Check:
```
When Adding Period to Timetable:
    ↓
User selects Day + Period
    ↓
System Calls:
  GET /api/v1/department-admin/rooms/available?day=Monday&period=1
    ↓
Backend Logic:
  1. Fetch all active rooms in department
  2. Fetch all timetable_periods for Monday, Period 1
  3. Extract occupied room IDs
  4. Filter: return rooms NOT in occupied list
    ↓
Frontend Shows Only Available Rooms:
  Dropdown: 
    - Room 201 ✅
    - Room 202 ✅
    - Room 203 ❌ (occupied by another class)
    - CS-LAB-1 ✅
    ↓
User Selects Room 201
    ↓
System Assigns Room to Period
    ↓
✅ No Room Conflicts
```

### Lab Session Flow:
```
If User Checks "Is Lab Session"
    ↓
System Asks: "Select Lab"
    ↓
Dropdown Shows Labs:
  - Filters labs by selected subject
  GET /api/v1/department-admin/labs/by-subject/{subjectId}
    ↓
User Selects Lab (e.g., "Computer Networks Lab - CNL")
    ↓
System Auto-Fills:
  - lab_id: 5
  - room_id: (auto-linked from lab's room)
  - session_type: "lab"
    ↓
System Validates:
  ✓ Lab is assigned to this subject? → YES
  ✓ Lab room is available? → Check room availability
    ↓
✅ Lab Session Created
```

---

## 6️⃣ Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SYSTEM DATA FLOW                         │
└─────────────────────────────────────────────────────────────┘

Frontend (React)
     │
     │ HTTP Requests (JWT Auth)
     ↓
Backend API (Express)
     │
     ├─→ Auth Middleware → Validates Token → Extracts User Info
     │
     ├─→ Controller Layer
     │    ├─→ room.controller → CRUD for rooms
     │    ├─→ lab.controller → CRUD for labs
     │    ├─→ break-timing.controller → Year-wise breaks
     │    ├─→ timetable-bulk.controller → CSV upload
     │    └─→ leave.controller → Substitution workflow
     │
     ├─→ Model Layer (Sequelize ORM)
     │    ├─→ Room.model
     │    ├─→ Lab.model
     │    ├─→ TimetablePeriod.model
     │    ├─→ YearBreakTiming.model
     │    └─→ Leave.model
     │
     ↓
MySQL Database (eduvertex)
     │
     ├─→ rooms (classroom data)
     ├─→ labs (lab configurations)
     ├─→ timetable_periods (schedule)
     ├─→ year_break_timings (breaks)
     ├─→ leaves (leave requests)
     └─→ timetable_alterations (substitutions)
```

---

## 7️⃣ User Roles & Permissions Flow

```
┌────────────────────────────────────────────────────────────┐
│                    ROLE-BASED ACCESS                        │
└────────────────────────────────────────────────────────────┘

Super Admin:
  ✓ Manage all departments
  ✓ Create/edit rooms globally
  ✓ Create/edit labs globally
  ✓ View all timetables
  ✓ Approve all leaves

Department Admin:
  ✓ Manage rooms IN THEIR DEPARTMENT only
  ✓ Manage labs IN THEIR DEPARTMENT only
  ✓ Configure break timings FOR THEIR DEPARTMENT
  ✓ Upload timetables FOR THEIR DEPARTMENT faculty
  ✓ Approve leaves FOR THEIR DEPARTMENT
  ✓ Assign timetable incharge
  ✗ Cannot access other departments

Timetable Incharge (Faculty):
  ✓ View all department timetables
  ✓ Quick edit periods
  ✓ Approve minor alterations
  ✗ Cannot approve leaves
  ✗ Cannot manage rooms/labs

Faculty:
  ✓ View own timetable
  ✓ Apply for leave with substitutes
  ✓ Respond to substitution requests
  ✗ Cannot edit timetable
  ✗ Cannot manage resources

Students:
  ✓ View own timetable (year/section based)
  ✗ No edit permissions
  ✗ No management access
```

---

## 8️⃣ Error Handling Flow

```
Common Validation Errors & Responses:

1. Faculty Validation Failed:
   Input: facultyId: "CS99" (doesn't exist)
   ↓
   System checks: Faculty.findOne({ faculty_college_code: "CS99" })
   ↓
   Result: null
   ↓
   Response: 400 Bad Request
   {
     "success": false,
     "error": "Row 5: facultyId CS99 not found"
   }

2. Room Double-Booking:
   Input: Assign Room 201 for Monday Period 1
   ↓
   System checks existing periods:
     SELECT * FROM timetable_periods 
     WHERE day='Monday' AND period_number=1 AND room_id=5
   ↓
   Result: 1 row found (already occupied)
   ↓
   Response: 400 Bad Request
   {
     "success": false,
     "error": "Room 201 is already occupied at Monday Period 1"
   }

3. Department Mismatch:
   Dept Admin (CSE) tries to upload faculty from ECE
   ↓
   System checks: faculty.department_id === admin.department_id
   ↓
   Result: false (5 !== 3)
   ↓
   Response: 400 Bad Request
   {
     "success": false,
     "error": "Row 10: facultyId ECE12 does not belong to your department"
   }

4. Lab Session Without Lab:
   Input: isLabSession=TRUE but labName is empty
   ↓
   System validates: if (isLabSession && !labName)
   ↓
   Response: 400 Bad Request
   {
     "success": false,
     "error": "Row 15: Lab sessions must specify a lab name"
   }
```

---

## 9️⃣ Complete End-to-End Example

### Scenario: Create Timetable for CSE 3rd Year Section A

```
Day 1: Setup (One-time)
─────────────────────────
Dept Admin Login
  ↓
1. Create Rooms:
   - Room 201 (Classroom, 60 capacity)
   - CS-LAB-1 (Lab, 30 capacity)
   ↓
2. Create Labs:
   - "DBMS Lab" (Code: DBMSL, Room: CS-LAB-1)
   - Assign subjects: [CS302, CS305]
   ↓
3. Configure Breaks:
   - Year 3 (year_3_4): Lunch at 12:30-13:15
   ↓
✅ Setup Complete

Day 2: Create Timetable
────────────────────────
Dept Admin Download CSV Template
  ↓
Fill CSV:
  CS12,Dr.Smith,CSE,3,A,Monday,1,CS301,DS,2024-28,201,,FALSE,Theory
  CS12,Dr.Smith,CSE,3,A,Monday,2,CS301,DS,2024-28,201,,FALSE,Theory
  CS15,Dr.Jones,CSE,3,A,Monday,4,CS302,DBMS Lab,2024-28,CS-LAB-1,DBMSL,TRUE,Lab
  ↓
Upload CSV
  ↓
System Validates:
  ✓ CS12 exists, department matches
  ✓ Room 201 available for P1, P2
  ✓ CS-LAB-1 available for P4
  ✓ Lab DBMSL assigned to CS302
  ↓
✅ Timetable Created

Day 3: Faculty Views Timetable
───────────────────────────────
Dr. Smith Login → My Timetable
  ↓
Sees:
  Monday P1: CS301 (Room 201)
  Monday P2: CS301 (Room 201)
  ↓
✅ Faculty knows schedule

Day 4: Student Views Timetable
───────────────────────────────
Student (3-A) Login → My Timetable
  ↓
Sees full weekly schedule with:
  - Subjects
  - Faculty names
  - Room numbers
  - Lab indicators
  - Break timings
  ↓
✅ Students know their classes

Day 5: Leave Request
─────────────────────
Dr. Smith applies leave for March 10
  ↓
System shows 4 affected classes
  ↓
Dr. Smith selects substitutes:
  - P1, P2: Dr. Jones
  - P4: Prof. Brown
  ↓
Submit request
  ↓
Dr. Jones, Prof. Brown receive notifications
  ↓
Both accept
  ↓
Forward to Dept Admin
  ↓
Admin approves
  ↓
Timetable altered for March 10
  ↓
Students see Dr. Jones instead of Dr. Smith on March 10
  ↓
✅ Smooth substitution completed
```

---

## 🎯 Summary of Flow Integration

All flows are interconnected:

1. **Setup Flow** enables → **Creation Flow**
2. **Creation Flow** populates → **View Flow**
3. **View Flow** triggers → **Leave Flow** (when faculty needs leave)
4. **Leave Flow** creates → **Alteration Flow** (substitute management)
5. **Alteration Flow** updates → **View Flow** (students see substitutes)

**Every component validates:**
- ✅ Department ownership
- ✅ Resource availability
- ✅ No conflicts
- ✅ Proper authorization

**Result:** A fully integrated, validated, secure timetable management system! 🎉
