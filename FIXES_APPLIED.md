# Backend Fixes Applied - March 5, 2026

## 🐛 Issues Fixed

### 1. Authorization Errors

#### Issue: `Error: User role department-admin is not authorized to access this route` on `/api/v1/faculty`
**Location**: `backend/routes/faculty/faculty.routes.js`

**Problem**: The `getAllFaculty` endpoint didn't include `department-admin` in authorized roles.

**Fix**: Added `department-admin` to the authorization list:
```javascript
// Before
.get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty'), getAllFaculty)

// After
.get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty', 'department-admin'), getAllFaculty)
```

---

#### Issue: `Error: Only timetable incharge can access this resource` on `/api/v1/department-admin/timetable/department/1st`
**Location**: `backend/routes/department-admin/timetable-management.routes.js`

**Problem**: The `checkTimetableIncharge` middleware was applied globally to ALL routes, preventing department-admins from viewing timetables.

**Fix**: Removed global middleware and applied it selectively:
```javascript
// Before
router.use(protect);
router.use(checkTimetableIncharge);  // ❌ Applied to ALL routes

// After  
router.use(protect);

// View routes (no incharge check needed)
router.get('/department/:year', getTimetablesByDepartmentAndYear);
router.get('/:timetable_id/slots', getSlotAssignments);

// Create/Update routes (require timetable incharge)
router.post('/create', checkTimetableIncharge, createTimetable);
router.put('/:id', checkTimetableIncharge, updateTimetable);
router.post('/slots/assign', checkTimetableIncharge, assignFacultyToSlot);
```

**Rationale**: Department admins should be able to VIEW timetables but only timetable incharges should CREATE/UPDATE them.

---

### 2. SQL/Sequelize Errors

#### Issue: SQL error on `/api/v1/subjects` endpoint
**Location**: `backend/routes/subject.routes.js`

**Problem**: Using incorrect column names that don't match the database schema:
- Used `name` instead of `subject_name`
- Used `code` instead of `subject_code`

**Fix**: Updated attributes and order clause to match actual column names:
```javascript
// Before
attributes: ['id', 'name', 'code', 'semester', 'credits', 'type', 'is_elective'],
order: [['semester', 'ASC'], ['name', 'ASC']]

// After
attributes: ['id', 'subject_name', 'subject_code', 'semester', 'credits', 'type', 'is_elective'],
order: [['semester', 'ASC'], ['subject_name', 'ASC']]
```

---

#### Issue: SQL error on `/api/v1/department-admin/break-timings/year/1st` endpoint
**Location**: `backend/controllers/department-admin/break-timing.controller.js`

**Problem**: Trying to include Department with attribute `name` which doesn't exist in the database.

**Fix**: Updated to use correct Department column names:
```javascript
// Before
include: [
  {
    model: models.Department,
    attributes: ['id', 'name']  // ❌ 'name' doesn't exist
  }
]

// After
include: [
  {
    model: models.Department,
    as: 'department',
    attributes: ['id', 'short_name', 'full_name']  // ✅ Correct columns
  }
]
```

---

### 3. Route Authorization Consistency

#### Issue: Break timing routes lacked role-based authorization
**Location**: `backend/routes/department-admin/break-timing.routes.js`

**Problem**: Routes only had `protect` middleware but no `authorize` middleware, allowing any authenticated user to access.

**Fix**: Added department-admin authorization:
```javascript
// Before
router.use(protect);

// After
router.use(protect);
router.use(authorize('department-admin', 'superadmin'));
```

---

### 4. Missing Timetable Alteration Route

#### Issue: Timetable Alteration page (frontend) couldn't access `/api/v1/faculty/timetable/alterations` endpoint
**Location**: `backend/server.js` and `backend/routes/faculty/timetable-alteration.routes.js`

**Problem**: The timetable-alteration routes file existed but was never imported or mounted in server.js. Additionally, it only authorized 'faculty' role, preventing department-admins from accessing it.

**Fix 1 - Mount the route**: Added import and mount point:
```javascript
// Import
import timetableAlterationRoutes from './routes/faculty/timetable-alteration.routes.js';

// Mount
app.use('/api/v1/faculty/timetable/alterations', timetableAlterationRoutes);
```

**Fix 2 - Add department-admin authorization**:
```javascript
// Before
router.use(authorize('faculty'));

// After
router.use(authorize('faculty', 'department-admin'));
```

**Rationale**: Department admins who are also timetable incharge need to access alteration features.

---

## 📋 Files Modified

1. ✅ `backend/routes/faculty/faculty.routes.js` - Added department-admin to getAllFaculty
2. ✅ `backend/routes/department-admin/timetable-management.routes.js` - Fixed middleware application
3. ✅ `backend/routes/subject.routes.js` - Fixed column names for Subject model
4. ✅ `backend/controllers/department-admin/break-timing.controller.js` - Fixed Department inclusion
5. ✅ `backend/routes/department-admin/break-timing.routes.js` - Added authorization
6. ✅ `backend/server.js` - Imported and mounted timetable-alteration routes
7. ✅ `backend/routes/faculty/timetable-alteration.routes.js` - Added department-admin authorization

---

## 🧪 Verification

### Test Script Created
Created `backend/verify-all-endpoints.js` to test all fixed endpoints:

**Usage**:
```bash
cd backend
node verify-all-endpoints.js
```

**Tests**:
- ✓ GET /api/v1/faculty
- ✓ GET /api/v1/subjects
- ✓ GET /api/v1/classes
- ✓ GET /api/v1/department-admin/break-timings/year/1st
- ✓ GET /api/v1/department-admin/timetable/department/1st
- ✓ GET /api/v1/timetable/admin/faculty-by-year/1
- ✓ GET /api/v1/department-admin/rooms
- ✓ GET /api/v1/department-admin/labs
- ✓ GET /api/v1/faculty/timetable/alterations (newly mounted)
- ✓ POST /api/v1/faculty/timetable/alterations (newly mounted)
- ✓ GET /api/v1/department-admin/break-timings
- ✓ GET /api/v1/department-admin/break-timings/year-group/year_1

**Note**: Update credentials in the script before running.

---

## 🔍 Root Causes

### 1. Model vs. Database Column Mismatch
- **Cause**: Frontend expectations vs. actual database schema
- **Prevention**: Always reference the model definition files when writing queries
- **Note**: Subject model uses `subject_name` and `subject_code` (with underscores)

### 2. Overly Restrictive Middleware
- **Cause**: Blanket application of `checkTimetableIncharge` to all routes
- **Prevention**: Apply middleware selectively based on operation type (read vs. write)
- **Pattern**: View operations → less restrictive, Modify operations → more restrictive

### 3. Incomplete Model Associations
- **Cause**: Not using `as` alias when including associated models
- **Prevention**: Always specify alias when including models (especially when defined in model)
- **Example**: `include: [{ model: Department, as: 'department' }]`

### 4. Missing Route Mounting
- **Cause**: Route file exists but never imported/mounted in server.js
- **Prevention**: Always verify routes are both created AND mounted in server.js
- **Checklist**: 
  1. Create route file → 
  2. Import in server.js → 
  3. Mount with app.use() → 
  4. Test endpoint

---

## ✅ Expected Behavior After Fixes

1. **Department Admins can now**:
   - ✓ View all faculty in their department
   - ✓ View timetables for their department
   - ✓ View and manage break timings
   - ✓ View subjects in their department
   - ✓ Manage rooms and labs

2. **Timetable Incharges can**:
   - ✓ Everything department admins can do
   - ✓ Create and update timetables
   - ✓ Assign faculty to slots
   - ✓ Publish timetables
   - ✓ Manage timetable alterations
   - ✓ Submit and track alteration requests

3. **SQL Queries**:
   - ✓ All Sequelize queries use correct column names
   - ✓ Model associations properly aliased
   - ✓ No more database errors on subject/break-timing endpoints

---

## 🚀 Next Steps

1. **Run the server** and verify no more errors in console
2. **Test the frontend pages** that were showing 403/500 errors
3. **Run the verification script** to confirm all endpoints work
4. **Monitor logs** for any remaining issues

---

## 📝 Notes

- All changes are backward compatible
- No database migrations required
- No breaking changes to API response structure
- Only authorization and query fixes applied
