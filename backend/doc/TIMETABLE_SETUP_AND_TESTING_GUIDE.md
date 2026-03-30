# Complete Timetable & Leave Management Setup and Testing Guide

## CRITICAL ISSUE CHECKLIST

### ❌ Issue 1: Database Tables Not Created
**Problem**: Database migrations might not have been run, so timetable tables don't exist.

**Solution**:
```bash
# Navigate to backend
cd backend

# Force sync database (deletes and recreates tables)
npm run db:sync

# Or use Sequelize CLI for migrations
npx sequelize-cli db:migrate

# Seed initial data if needed
npx sequelize-cli db:seed:all
```

### ❌ Issue 2: Timetable Incharge Assignment Not Reflecting
**Problem**: When you assign someone as timetable incharge via CoordinatorManagement page, the database updates but pages don't reflect this change.

**Root Cause**: Missing the link between TimetableMaster coordinator assignment and Faculty `is_timetable_incharge` flag.

**Fix Required**: 
See Section "ENABLE TIMETABLE INCHARGE PAGES"

### ❌ Issue 3: Pages Not Showing in Faculty Sidebar
**Problem**: Faculty with timetable incharge flag assigned cannot see timetable pages in their sidebar.

**Root Cause**: Faculty routes don't check `is_timetable_incharge` flag to conditionally show pages.

**Fix Required**:
See Section "ADD ROLE-BASED PAGE VISIBILITY"

---

## STEP 1: VERIFY DATABASE SETUP

### 1.1 Check Database Connection
```bash
# SSH to database or use MySQL client
mysql -u root -p

# Use the database
USE eduvertex;

# Check if timetable tables exist
SHOW TABLES LIKE 'timetable_%';
```

**Expected Output:**
```
timetable_master
timetable_master_slots
timetable_overlay
timetable_period
timetable_notification
```

### 1.2 If Tables Don't Exist - Force Create Them

In backend, run:
```bash
# Kill existing processes
# Then run sync script
npm run db:force-sync
```

Or manually create the migration:
```bash
npx sequelize-cli migration:generate --name create-timetable-tables
```

Then edit the migration file and run:
```bash
npx sequelize-cli db:migrate
```

---

## STEP 2: VERIFY FACULTY TABLE HAS REQUIRED COLUMNS

### Check Faculty Table Structure
```sql
DESCRIBE faculty_profiles;
```

**Required columns:**
- `is_timetable_incharge` (BOOLEAN, default 0)
- `is_placement_coordinator` (BOOLEAN, default 0)
- `is_class_incharge` (BOOLEAN, default 0)
- `role_id` (must be 5 for faculty, 7 for department-admin)

**If columns missing, add them:**
```sql
ALTER TABLE faculty_profiles ADD COLUMN is_timetable_incharge BOOLEAN DEFAULT 0;
ALTER TABLE faculty_profiles ADD COLUMN is_placement_coordinator BOOLEAN DEFAULT 0;
ALTER TABLE faculty_profiles ADD COLUMN is_class_incharge BOOLEAN DEFAULT 0;
```

---

## STEP 3: ENABLE TIMETABLE INCHARGE PAGES FOR FACULTY

### Problem
When you assign faculty as "timetable incharge" from CoordinatorManagement, they should see timetable pages in their sidebar, but they don't.

### Solution: Update Faculty Sidebar (IMPLEMENT THIS)

**File to Update**: `frontend/src/pages/faculty/components/layout/AppSidebar.tsx`

Find the navigation items array and update it to conditionally show pages:

```typescript
// BEFORE (current code shows same pages for all faculty)
const navItems = [
  { title: "Dashboard", url: "/faculty/dashboard", icon: LayoutDashboard },
  { title: "Timetable", url: "/faculty/timetable", icon: Calendar },
  { title: "Attendance", url: "/faculty/attendance", icon: ClipboardCheck },
  // ... rest of pages
];

// AFTER (conditional based on role)
const navItems = [
  { title: "Dashboard", url: "/faculty/dashboard", icon: LayoutDashboard },
  { title: "Timetable", url: "/faculty/timetable", icon: Calendar },
  { title: "Attendance", url: "/faculty/attendance", icon: ClipboardCheck },
  // Timetable incharge only pages
  ...(user?.is_timetable_incharge ? [
    { title: "Timetable Management", url: "/faculty/timetable-management", icon: Calendar },
    { title: "Timetable Alteration", url: "/faculty/timetable-alteration", icon: Clock },
  ] : []),
  // ... rest of pages
];
```

---

## STEP 4: CREATE FACULTY TIMETABLE MANAGEMENT PAGES

### Problem
Faculty with timetable incharge role need pages to manage timetables, but they might not exist for faculty.

### Solution

Create these pages in `frontend/src/pages/faculty/pages/`:

1. **TimetableManagement.tsx** (view only)
2. **TimetableAlterationManagement.tsx** (manage alteration requests)
3. **TimetableAlterationHistory.tsx** (history of alterations applied)

### Temp: Add Faculty Routes

**File**: `frontend/src/pages/faculty/FacultyRoutes.tsx`

```typescript
import TimetableManagement from './pages/TimetableManagement';
import TimetableAlterationManagement from './pages/TimetableAlterationManagement';

const FacultyRoutes = () => (
  <Routes>
    // ... existing routes
    <Route path="timetable-management" element={<TimetableManagement />} />
    <Route path="timetable-alteration" element={<TimetableAlterationManagement />} />
  </Routes>
);
```

---

## STEP 5: TEST API ENDPOINTS

### 5.1 Test Coordinator Assignment API

**Endpoint**: `PUT /api/v1/department-admin/coordinators/:facultyId/assign-timetable`

**Using cURL**:
```bash
curl -X PUT http://localhost:5000/api/v1/department-admin/coordinators/406/assign-timetable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "NAGAJOTHI P has been assigned as timetable incharge",
  "data": {
    "faculty_id": 406,
    "Name": "NAGAJOTHI P",
    "is_timetable_incharge": true
  }
}
```

**What it should do**:
1. Sets `is_timetable_incharge = 1` in Faculty table
2. Allows this faculty to see timetable management pages
3. Faculty can then create timetable masters and manage slots

### 5.2 Test Timetable Master Creation

**Endpoint**: `POST /api/v1/timetable-master`

**Payload**:
```json
{
  "class_id": 21,
  "department_id": 6,
  "academic_year": "2025-2026",
  "semester": 6,
  "semester_type": "even",
  "batch": "2023-2027",
  "room_no": "CR-15",
  "effective_from": "2026-03-18",
  "revision_no": "01.03.2026/01",
  "class_coordinator_id": 406,
  "asst_coordinator_id": 406,
  "timetable_incharge_id": 406,
  "hod_id": 406
}
```

**Using cURL**:
```bash
curl -X POST http://localhost:5000/api/v1/timetable-master \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{...payload...}'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Timetable master created in draft status",
  "data": {
    "id": 1,
    "class_id": 21,
    "status": "draft",
    "created_by": 406
  }
}
```

### 5.3 Test Get All Timetable Masters

**Endpoint**: `GET /api/v1/timetable-master`

```bash
curl -X GET http://localhost:5000/api/v1/timetable-master \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

**Expected**: Returns array of timetable masters with all coordinator details

### 5.4 Test Activate Timetable

**Endpoint**: `PATCH /api/v1/timetable-master/:id/activate`

```bash
curl -X PATCH http://localhost:5000/api/v1/timetable-master/1/activate \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### 5.5 Test Add Slot

**Endpoint**: `POST /api/v1/timetable-master/:masterId/slots`

**Payload**:
```json
{
  "day": "Monday",
  "period_slot_id": 1,
  "subject_id": 10,
  "faculty_id": 406,
  "session_type": "theory",
  "room": "Room 101",
  "notes": "DS Lecture"
}
```

### 5.6 Test Bulk Upload Slots

**Endpoint**: `POST /api/v1/timetable-master/:masterId/slots/bulk`

**CSV Format**:
```
Day,Period ID,Subject ID,Faculty ID,Session Type,Room,Notes
Monday,1,10,406,theory,Room 101,DS Lecture
Monday,2,11,406,theory,Room 101,
Tuesday,1,10,406,theory,Room 101,
```

---

## STEP 6: COMPREHENSIVE TEST WORKFLOW

### 6.1 Complete End-to-End Test

1. **Login as Department Admin**
   ```
   Email: lsisreviving@gmail.com (role_id=7)
   ```

2. **Go to Coordinators Management**
   ```
   Path: /admin/department-admin/coordinators
   ```

3. **Assign Faculty as Timetable Incharge**
   ```
   Click "Assign Timetable Incharge" for NAGAJOTHI P (faculty_id: 406)
   Expected: is_timetable_incharge becomes true
   ```

4. **Go to Timetable Master**
   ```
   Path: /admin/department-admin/timetable-master
   ```

5. **Create New Timetable**
   ```
   - Class: III Year AI&DS
   - Academic Year: 2025-2026
   - Semester: 6
   - Batch: 2023-2027
   - Effective From: 2026-03-18
   - Coordinators:
     - Class Coordinator: NAGAJOTHI P
     - Timetable Incharge: NAGAJOTHI P
   ```

6. **Status Check**
   ```
   Expected: Status = "draft"
   Button: "Activate" should appear
   ```

7. **Activate Timetable**
   ```
   Click "Activate" button
   Expected: Status changes to "active"
   ```

8. **Manage Slots**
   ```
   Click "Manage Slots" button
   Should navigate to: /admin/department-admin/timetable-master/1/slots
   ```

9. **Add A Slot**
   ```
   Click "Add Slot"
   Fill:
   - Day: Monday
   - Period: I (09:30-10:20)
   - Subject: (select any)
   - Faculty: (select any)
   - Session Type: theory
   - Room: Room 101
   ```

10. **Download Template**
    ```
    Click "Download Template" button
    Should download CSV file with headers
    ```

11. **Test Deactivate**
    ```
    Go back to Timetable Master
    Click "Deactivate" button
    Expected: Status changes to "inactive"
    ```

12. **Test Re-activate**
    ```
    Click "Activate" button again
    Expected: Status changes back to "active"
    IMPORTANT: This button should appear for both draft AND inactive status
    ```

---

## STEP 7: FIX COMMON ERRORS

### Error: "Cannot find coordinator update endpoints"
**Fix**: Restart backend server
```bash
npm start
```

### Error: "Timetable not found"
**Fix**: Verify class_id, department_id exist in database:
```sql
SELECT * FROM classes WHERE id = 21;
SELECT * FROM departments WHERE id = 6;
```

### Error: "Only one active timetable allowed per class/semester"
**Fix**: Deactivate existing timetables first

### Error: "Pages not showing for faculty"
**Fix**: 
1. Clear browser localStorage and logout
2. Login again
3. Check browser console for errors
4. Verify `is_timetable_incharge` is set in database

### Error: "Subject dropdown shows {}"
**Fix**: Already implemented - check TimetableSlotsManagement.tsx

---

## STEP 8: LEAVE MANAGEMENT TESTING

### 8.1 Test Leave & Alteration Page

**Endpoint**: `GET /api/v1/leave`

```bash
curl -X GET "http://localhost:5000/api/v1/leave?status=pending" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### 8.2 Create Leave Request with Alteration

**Endpoint**: `POST /api/v1/leave`

**Payload**:
```json
{
  "applicant_type": "faculty",
  "start_date": "2026-03-18",
  "end_date": "2026-03-20",
  "leave_type": "CL",
  "reason": "Medical checkup",
  "affected_periods": [
    {
      "date": "2026-03-18",
      "period_slot_id": 1,
      "class_id": 21,
      "subject_id": 10,
      "master_id": 1,
      "requested_substitute_faculty_id": 406
    }
  ],
  "substitute_faculty_id": 406
}
```

---

##CRITICAL ENVIRONMENT CHECKLIST

Before testing, ensure:

- [ ] Backend running: `npm start`
- [ ] Frontend running: `npm run dev`
- [ ] Database connected: Check mysql service
- [ ] Auth token valid: Login fresh session
- [ ] Port 5000 (backend) and 5173 (frontend) accessible
- [ ] CORS enabled in server.js
- [ ] Environment variables loaded (.env file)

---

## DATABASE VERIFICATION QUERIES

Run these SQL queries to verify everything is set up:

```sql
-- Check timetable tables exist
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'eduvertex' AND TABLE_NAME LIKE 'timetable%';

-- Check faculty has required columns
DESCRIBE faculty_profiles;

-- Check coordinator assignments
SELECT faculty_id, Name, is_timetable_incharge, is_class_incharge 
FROM faculty_profiles 
WHERE role_id = 5;

-- Check timetable masters created
SELECT id, class_id, status, timetable_incharge_id 
FROM timetable_master;

-- Check timetable slots created
SELECT master_id, day, period_slot_id, subject_id, faculty_id 
FROM timetable_master_slots 
LIMIT 10;

-- Check leave requests
SELECT id, applicant_id, start_date, end_date, overall_status 
FROM leave_requests 
ORDER BY created_at DESC LIMIT 10;
```

---

## API RESPONSE EXAMPLES

Paste these into your browser console or Postman to quickly test:

### Test Coordinator List
```javascript
fetch('/api/v1/department-admin/coordinators', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
}).then(r => r.json()).then(d => console.log(d))
```

### Test Timetable Masters
```javascript
fetch('/api/v1/timetable-master', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
}).then(r => r.json()).then(d => console.log(d))
```

### Test Get Slots for Master ID 1
```javascript
fetch('/api/v1/timetable-master/1/slots', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
}).then(r => r.json()).then(d => console.log(d))
```

---

## NEXT STEPS

1. **Run database sync** (Step 1)
2. **Verify all tables exist** (Step 2)
3. **Add role-based sidebar logic** (Step 3)
4. **Test all APIs** (Step 5)
5. **Follow complete workflow** (Step 6)
6. **Check for errors** (Step 7)

If still failing at any step, check browser console and server logs for specific error messages.
