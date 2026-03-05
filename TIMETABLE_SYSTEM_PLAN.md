# Comprehensive Timetable Management System - Implementation Plan

## Overview
Complete timetable management system for department admins with period-based scheduling, break management, and leave substitution workflow.

## 1. Database Schema Enhancements

### 1.1 New Tables Needed

#### `timetable_master`
- id (PK)
- name (e.g., "CSE Odd Semester 2026")
- academic_year
- semester (odd/even)
- department_id
- status (draft/active/archived)
- created_by
- timetable_incharge_faculty_id
- created_at, updated_at

#### `timetable_periods`
- id (PK)
- timetable_master_id (FK)
- day (Monday-Saturday)
- period_number (1-7)
- start_time
- end_time
- is_break (boolean)
- break_type (short/lunch/null)
- faculty_college_code
- subject_code
- year
- section
- room_id (FK to rooms table)
- lab_id (FK to labs table, nullable)
- is_lab_session (boolean)
- created_at, updated_at

#### `year_break_timings` (enhance existing)
- id (PK)
- department_id (FK)
- year_group (enum: 'year_1', 'year_2', 'year_3_4') -- Customizable grouping
- break_number (1-3)
- break_type (short/lunch)
- start_time
- end_time
- period_after (which period this break follows)
- created_at, updated_at

#### `rooms` (classrooms)
- id (PK)
- room_number (e.g., "101", "CS-LAB-1")
- room_name (e.g., "Computer Lab 1", "Seminar Hall")
- department_id (FK)
- room_type (classroom/lab/seminar_hall)
- capacity
- has_projector (boolean)
- is_active (boolean)
- created_at, updated_at

#### `labs`
- id (PK)
- lab_name (e.g., "Computer Networks Lab", "DBMS Lab")
- lab_code (e.g., "CNL", "DBMSL")
- department_id (FK)
- room_id (FK to rooms table)
- subject_ids (JSON array of associated subjects)
- max_batch_size
- equipment_details (text)
- is_active (boolean)
- created_at, updated_at

#### `timetable_alterations` (already exists, enhance)
- id (PK)
- timetable_period_id (FK)
- original_faculty_code
- substitute_faculty_code
- date
- reason
- status (pending_substitute/approved_substitute/pending_admin/approved/rejected)
- requested_by_faculty_id
- approved_by_faculty_id
- approved_by_admin_id
- notification_sent
- created_at, updated_at

### 1.2 Enhance Existing Tables

#### `leaves` table - Add columns:
- affected_periods (JSON array of period IDs)
- substitute_faculty_code
- substitute_status (pending/accepted/rejected)
- substitute_notified_at
- substitute_response_at
- admin_approval_status
- timetable_altered (boolean)

#### `faculty_profiles` - Ensure exists:
- is_timetable_incharge (boolean)

## 2. Backend API Endpoints

### 2.1 Timetable Management

```
POST   /api/v1/department-admin/timetable-master/create
GET    /api/v1/department-admin/timetable-master/:id
PUT    /api/v1/department-admin/timetable-master/:id
DELETE /api/v1/department-admin/timetable-master/:id
GET    /api/v1/department-admin/timetable-master/list

POST   /api/v1/department-admin/timetable-master/:id/periods/bulk
PUT    /api/v1/department-admin/timetable-master/:id/periods/:periodId
DELETE /api/v1/department-admin/timetable-master/:id/periods/:periodId

GET    /api/v1/department-admin/timetable-master/:id/view-grid
POST   /api/v1/department-admin/timetable-master/:id/publish
POST   /api/v1/department-admin/timetable-master/:id/duplicate
```

### 2.2 Break Timing Management (year-wise customizable)

```
GET    /api/v1/department-admin/break-timings               # Get all break timings for department
GET    /api/v1/department-admin/break-timings/:yearGroup    # Get by year group (year_1, year_2, year_3_4)
POST   /api/v1/department-admin/break-timings               # Create break timing for specific year group
PUT    /api/v1/department-admin/break-timings/:id           # Update break timing
DELETE /api/v1/department-admin/break-timings/:id           # Delete break timing
POST   /api/v1/department-admin/break-timings/bulk-update   # Update all year groups at once
```

### 2.3 Classroom Management (CRUD)

```
GET    /api/v1/department-admin/rooms                       # List all rooms/classrooms
GET    /api/v1/department-admin/rooms/:id                   # Get single room details
POST   /api/v1/department-admin/rooms                       # Create new room
PUT    /api/v1/department-admin/rooms/:id                   # Update room
DELETE /api/v1/department-admin/rooms/:id                   # Delete room
GET    /api/v1/department-admin/rooms/available             # Get available rooms for time slot
```

### 2.4 Lab Management (CRUD)

```
GET    /api/v1/department-admin/labs                        # List all labs
GET    /api/v1/department-admin/labs/:id                    # Get single lab details
POST   /api/v1/department-admin/labs                        # Create new lab
PUT    /api/v1/department-admin/labs/:id                    # Update lab
DELETE /api/v1/department-admin/labs/:id                    # Delete lab
GET    /api/v1/department-admin/labs/by-subject/:subjectId  # Get labs for specific subject
POST   /api/v1/department-admin/labs/:id/assign-subjects    # Assign multiple subjects to lab
```

### 2.5 Leave & Substitution Workflow

```
POST   /api/v1/faculty/leave/apply-with-substitute
GET    /api/v1/faculty/leave/pending-substitution-requests
PUT    /api/v1/faculty/leave/:id/respond-substitution
GET    /api/v1/faculty/leave/:id/affected-periods

GET    /api/v1/department-admin/leave/pending-timetable-alterations
PUT    /api/v1/department-admin/leave/:id/approve-alteration
GET    /api/v1/department-admin/timetable-alterations/pending
```

### 2.6 Subject Mapping Integration

```
GET    /api/v1/department-admin/subjects/mapped-faculty/:subjectId
GET    /api/v1/department-admin/subjects/by-year-section
```

### 2.7 Timetable Incharge

```
GET    /api/v1/timetable-incharge/view-all-timetables
PUT    /api/v1/timetable-incharge/timetable-master/:id/periods/:periodId
GET    /api/v1/timetable-incharge/alterations/pending
POST   /api/v1/timetable-incharge/alterations/:id/approve
```

## 3. Frontend Components Structure

### 3.1 Department Admin Pages

#### `/admin/department-admin/timetable-management`
- List all timetables
- Create new timetable button
- View/Edit/Delete actions
- Assign timetable incharge

#### `/admin/department-admin/timetable-master/:id/edit`
- Period grid view (like the image)
- Drag-drop faculty/subject assignment
- Break configuration
- Save/Publish

#### `/admin/department-admin/leave-alterations`
- Pending substitution approvals
- View leave details + affected periods
- Approve/Reject workflow

#### `/admin/department-admin/manage-rooms`
- List all classrooms/rooms
- Add/Edit/Delete rooms
- Mark rooms as labs
- Set capacity and facilities

#### `/admin/department-admin/manage-labs`
- List all labs
- Add/Edit/Delete labs
- Assign subjects to labs
- Link labs to physical rooms

#### `/admin/department-admin/break-timings-setup`
- Configure break timings per year group
- Year 1 separate configuration
- Year 2 separate configuration
- Year 3 & 4 shared configuration
- Set break types (short/lunch)
- Define period positions

### 3.2 Faculty Pages

#### `/faculty/leave/apply`
- Enhanced form with:
  - Date range
  - Auto-fetch affected periods from timetable
  - Select substitute faculty per period
  - Reason

#### `/faculty/substitution-requests`
- Incoming substitution requests
- Accept/Decline with remarks
- View period details

### 3.3 Timetable Incharge Pages

#### `/timetable-incharge/manage`
- View all department timetables
- Quick edit periods
- Handle urgent alterations

### 3.4 Updated Excel/CSV Bulk Upload Format

#### Downloadable Template Format
The system provides a downloadable CSV template with the following columns:

**Required Columns:**
- `facultyId` - Faculty college code (e.g., CS12, ME45)
- `facultyName` - Faculty name (for reference)
- `department` - Department code/name
- `year` - Academic year (1, 2, 3, 4)
- `section` - Section (A, B, C, etc.) - Optional
- `day` - Day of week (Monday, Tuesday, etc.)
- `period` - Period number (1-7)
- `subject` - Subject code
- `subjectName` - Subject name (for reference)
- `academicYear` - Batch year (e.g., 2025-2029)

**New Optional Columns:**
- `roomNumber` - Room/Classroom ID or number (e.g., 101, CS-LAB-1)
- `labName` - Lab name if it's a lab session (e.g., "Computer Networks Lab")
- `isLabSession` - TRUE/FALSE to indicate lab session
- `sessionType` - "Theory" or "Lab"

**Break Timing Columns (for reference only, managed separately):**
- `breakAfterPeriod` - Indicates if break follows this period
- `breakType` - "short" or "lunch"

#### Sample CSV Format:
```csv
facultyId,facultyName,department,year,section,day,period,subject,subjectName,academicYear,roomNumber,labName,isLabSession,sessionType
CS12,Dr. Smith,CSE,3,A,Monday,1,CS301,Data Structures,2024-2028,201,,FALSE,Theory
CS12,Dr. Smith,CSE,3,A,Monday,2,CS301,Data Structures,2024-2028,201,,FALSE,Theory
CS15,Prof. Jones,CSE,3,A,Monday,4,CS302L,DBMS Lab,2024-2028,CS-LAB-1,DBMS Lab,TRUE,Lab
CS15,Prof. Jones,CSE,3,A,Monday,5,CS302L,DBMS Lab,2024-2028,CS-LAB-1,DBMS Lab,TRUE,Lab
```

**Validation Rules:**
1. Faculty code must exist in faculty_profiles table
2. Faculty must belong to the uploading department (for dept-admin)
3. Room must exist in rooms table (if specified)
4. Lab must exist in labs table and be assigned to subject (if isLabSession=TRUE)
5. No overlapping periods for same faculty
6. Lab sessions typically span 2-3 consecutive periods

**Break Management:**
- Breaks are configured separately in the Break Timings Setup page
- Year-wise break configuration:
  - 1st Year: Custom break timings
  - 2nd Year: Custom break timings  
  - 3rd & 4th Year: Shared break timings
- CSV upload doesn't include break periods (auto-inserted by system)

## 4. Implementation Workflow

### Phase 1: Database & Models (Day 1)
1. Create migration scripts for new tables (rooms, labs, enhanced year_break_timings)
2. Update Leave model with substitution fields
3. Create TimetableMaster, TimetablePeriod models
4. Create Room and Lab models
5. Enhance TimetableAlteration model

### Phase 2: Backend APIs (Days 2-3)
1. Timetable CRUD controllers
2. Period management controllers
3. Room and Lab CRUD controllers
4. Year-wise break timing management
5. Enhanced leave controller with substitution
6. Alteration approval workflow
7. Notification system integration

### Phase 3: Frontend - Timetable Management (Days 4-5)
1. Timetable list page
2. Create/Edit timetable with grid view
3. Period assignment UI with room/lab selection
4. Room management CRUD interface
5. Lab management CRUD interface
6. Year-wise break configuration UI
7. Updated CSV upload with new fields validation

### Phase 4: Leave Substitution UI (Day 6)
1. Enhanced leave application form
2. Substitution request inbox
3. Admin approval dashboard

### Phase 5: Testing & Refinement (Day 7)
1. End-to-end workflow testing
2. Notifications testing
3. Permission checks
4. UI/UX refinement

## 5. Key Features

### 5.1 Timetable Creation
- Visual grid editor matching traditional format
- Period-wise assignment (not just daily slots)
- Break slots with year-wise customizable timings
- Subject-faculty mapping validation
- Room and lab allocation
- Lab session support (multi-period booking)
- Conflict detection (faculty/room double-booking)

### 5.2 Year-Wise Break Timing Management
- **1st Year Students**: Dedicated break schedule
  - Configurable break periods (after specific periods)
  - Customizable break duration (short 10-15 min / lunch 30-45 min)
- **2nd Year Students**: Separate break schedule
  - Independent timing configuration
- **3rd & 4th Year Students**: Shared break schedule
  - Common break timings for both years
  - Reduces administrative overhead
- **Visual Timeline**: UI shows period structure with breaks
- **Auto-insertion**: Timetable grid auto-inserts breaks based on year

### 5.3 Room & Lab Management
- **Classroom Management**:
  - Add/edit/delete rooms
  - Set capacity, facilities (projector, AC, etc.)
  - Mark room type (classroom/lab/seminar hall)
  - Track availability during period scheduling
- **Lab Management**:
  - Create labs with lab codes
  - Link labs to physical rooms
  - Assign multiple subjects to each lab
  - Set batch size limits
  - Equipment/resource tracking
- **Allocation Features**:
  - Real-time availability check
  - Prevent double-booking of rooms/labs
  - Lab sessions span multiple consecutive periods

### 5.4 Leave Substitution Flow

```
Faculty Apply Leave
    ↓
System fetches affected periods
    ↓
Faculty selects substitute per period
    ↓
Substitute receives notification
    ↓
Substitute accepts/rejects
    ↓
If accepted → Forward to Dept Admin
    ↓
Admin approves → Timetable altered
```

### 5.5 Timetable Incharge Privileges
- View all department timetables
- Quick edit any period
- Approve minor alterations
- Generate reports

## 6. Data Migration Strategy

### Existing timetable table → New structure
```sql
-- Map existing timetable rows to periods
-- Group by academic year + semester
-- Create timetable_master records
-- Populate timetable_periods from existing data
```

## 7. Validation Rules

1. **Faculty Assignment**
   - Check faculty belongs to department
   - Verify faculty not double-booked
   - Ensure subject mapping exists
   - Faculty cannot be assigned to multiple periods simultaneously

2. **Room & Lab Assignment**
   - Room must exist and be active
   - Room cannot be double-booked (same period, same day)
   - Lab sessions require lab-enabled rooms
   - Lab must be assigned to the subject being taught
   - Respect room capacity limits

3. **Lab Sessions**
   - Lab subject must be mapped to an active lab
   - Lab sessions typically span 2-3 consecutive periods
   - Same room must be allocated for all periods of a lab session
   - Batch size cannot exceed lab max capacity

4. **Break Timing Configuration**
   - Breaks cannot overlap with each other
   - Each year group must have at least one lunch break
   - Break timings must fall between valid periods
   - Year 3 and Year 4 must share same break configuration

5. **Leave Application**
   - Substitute must be from same department
   - Substitute must be free during those periods
   - Cannot request leave for past dates
   - Substitute must be qualified for the subject

6. **Timetable Publishing**
   - All periods must have faculty assigned
   - Break timings must be configured for all years
   - No conflicting assignments (faculty/room)
   - All rooms and labs must be valid
   - Lab sessions must be complete (all periods assigned)

## 8. Recent Updates & Customizations

### 8.1 Year-Wise Break Timing Customization ✅
**Requirement**: Different years need different break timings
- **1st Year**: Independent break configuration
- **2nd Year**: Independent break configuration  
- **3rd & 4th Year**: Shared break configuration (reduces admin workload)

**Implementation**:
- `year_break_timings` table enhanced with `year_group` enum
- Values: 'year_1', 'year_2', 'year_3_4'
- Each group can have multiple breaks (short breaks, lunch break)
- UI provides separate configuration panels for each year group

**Benefits**:
- Flexibility for different academic schedules
- First/second years can have different break patterns
- Senior years share timings (typically have similar schedules)

### 8.2 Lab & Classroom Management ✅
**Requirement**: Full CRUD operations for labs and classrooms

**New Tables**:
1. **`rooms`** - Physical classroom/lab rooms management
   - Room number, name, type (classroom/lab/seminar)
   - Capacity tracking
   - Facilities (projector, AC, etc.)
   - Department association

2. **`labs`** - Academic lab configuration
   - Lab name and code (e.g., "DBMS Lab", "CNL")
   - Subject assignments (one lab can serve multiple subjects)
   - Equipment/resource tracking
   - Max batch size limits
   - Links to physical room

**Features**:
- Add/Edit/Delete rooms and labs
- Assign subjects to labs
- Real-time room availability checking
- Prevent double-booking of resources
- Lab capacity management

### 8.3 Enhanced CSV Upload Format ✅
**New Columns Added**:
- `roomNumber` - Room allocation for each period
- `labName` - Lab identification for lab sessions
- `isLabSession` - Boolean flag (TRUE/FALSE)
- `sessionType` - "Theory" or "Lab"

**Updated Template**: `backend/public/Format/Timetable_Format_Updated.csv`

**Validation Enhancements**:
- Verify room exists and is available
- Check lab assignment for lab sessions
- Validate lab is mapped to subject
- Ensure no room double-booking
- Lab sessions must span consecutive periods

**Sample Row**:
```
CS15,Prof. Jones,CSE,3,A,Monday,4,CS302L,DBMS Lab,2024-2028,CS-LAB-1,DBMS Lab,TRUE,Lab
```

## Next Steps

Would you like me to:
1. ✅ **Proceed with Phase 1** (Database setup)?
2. ✅ **Create detailed wireframes** for the UI?
3. ✅ **Start with a specific module** (e.g., just timetable creation)?
4. ❌ **Review and modify this plan** first?

Please confirm and I'll begin implementation immediately.
