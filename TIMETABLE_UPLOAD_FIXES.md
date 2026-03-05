# Timetable Bulk Upload - Fixes Applied

## Critical Issue Identified & Fixed

The faculty lookup query was only returning 3 records instead of 40+. This was caused by the `include` association with Department using an INNER JOIN by default, which filtered out records when the association couldn't be properly loaded.

### Root Cause
```javascript
// OLD - Uses INNER JOIN, filters out some records
faculties = await Faculty.findAll({
  include: [{ model: models.Department, as: 'department', ... }]
});

// NEW - Uses LEFT JOIN to include all faculty regardless of department association
faculties = await Faculty.findAll({
  include: [{
    model: models.Department,
    as: 'department',
    required: false  // <-- KEY FIX: LEFT JOIN instead of INNER JOIN
  }]
});
```

## Issues Fixed

### 1. **Faculty Query Returning Too Few Results**
   **Root Cause:** INNER JOIN with Department association was filtering out faculty records
   
   **Fixes Applied:**
   - Changed include to use `required: false` for LEFT JOIN behavior
   - Added better debugging logs to show how many records were found
   - Added fallback logic to handle edge cases
   - Created debug endpoint to verify faculty data in database

### 2. **"Unexpected end of form file" Error**
   **Root Cause:** Conflict between `express-fileupload()` and Multer middlewares
   
   **Fixes Applied:**
   - Modified [server.js](backend/server.js) to skip `express-fileupload` middleware for `/api/v1/timetable/bulk-upload` endpoint
   - Added proper size limits to body parsers: `express.json({ limit: '50mb' })`

### 3. **Faculty ID Validation Issues**
   **Root Cause:** CSV files may use `faculty_id` or `faculty_college_code` but controller only accepted `facultyId`
   
   **Fixes Applied:**
   - Updated [timetable-bulk.controller.js](backend/controllers/timetable/timetable-bulk.controller.js) to accept multiple column name formats
   - Now handles both camelCase and snake_case column names
   - Frontend validation updated in [CreateTimetable.tsx](frontend/src/pages/admin/department-admin/pages/CreateTimetable.tsx)

## Updated Faculty Query

**Location:** [timetable-bulk.controller.js](backend/controllers/timetable/timetable-bulk.controller.js)

```javascript
// Get faculty records with LEFT JOIN to department
faculties = await Faculty.findAll({
  where: { faculty_college_code: { [Op.in]: facultyIds } },
  include: [{ 
    model: models.Department, 
    as: 'department', 
    attributes: ['short_name', 'full_name', 'id'],
    required: false  // Use LEFT JOIN instead of INNER JOIN
  }],
  attributes: ['faculty_id', 'faculty_college_code', 'Name', 'department_id'],
  subQuery: false,
  limit: 1000
});
```

## CSV Column Mapping

Your CSV can now include any of these column names (will be auto-detected):

| Field | Accepted Column Names |
|-------|----------------------|
| Faculty ID | `facultyId`, `faculty_id`, `faculty_college_code` |
| Faculty Name | `facultyName`, `faculty_name` |
| Department | `department`, `dept` |
| Year | `year`, `academic_year` |
| Section | `section`, `class_section` |
| Day | `day`, `day_of_week` |
| Hour/Period | `hour`, `period` |
| Subject | `subject`, `subject_code` |
| Academic Year | `academicYear`, `academic_year`, `year_sem` |
| Room | `roomNumber`, `room_number` |
| Lab | `labName`, `lab_name` |
| Lab Session | `isLabSession`, `is_lab_session` |
| Session Type | `sessionType`, `session_type` |

## How to Verify & Test

### Step 1: Check Available Faculty Codes
Before uploading, verify what faculty codes are actually in your database:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8086/api/v1/timetable/debug/faculty-codes
```

This will show:
- Total count of faculty in database
- List of all faculty_college_code values
- Sample of 20 faculty records

### Step 2: Update Your CSV
Ensure your CSV uses faculty codes that match the ones returned from the debug endpoint.

For example, if the debug endpoint shows codes like: `CS10, NS80T01, NS40T23, NS50T08, ...`
Then your CSV should use these exact codes (case-sensitive).

### Step 3: Try Upload Again
Once you've verified the codes and updated your CSV:
1. Restart your backend server
2. Upload the CSV
3. Check server logs for detailed debug information

## Files Modified

1. ✅ [backend/server.js](backend/server.js) - Fixed middleware conflicts
2. ✅ [backend/middleware/upload.js](backend/middleware/upload.js) - Enhanced multer config
3. ✅ [backend/routes/timetable/timetable.routes.js](backend/routes/timetable/timetable.routes.js) - Added debug endpoint & better error handling
4. ✅ [backend/controllers/timetable/timetable-bulk.controller.js](backend/controllers/timetable/timetable-bulk.controller.js) - Fixed query, added logging
5. ✅ [frontend/src/pages/admin/department-admin/pages/CreateTimetable.tsx](frontend/src/pages/admin/department-admin/pages/CreateTimetable.tsx) - Updated validation

## Server Debug Output Example

After restart, when uploading a CSV, you should see logs like:

```
uploadWithErrorHandling called
Content-Length: 5234
[DEBUG] CSV Headers detected: facultyId,facultyName,department,year,section,day,hour,subject,academicYear
[DEBUG] Looking up 5 unique faculty IDs: NS70T09, NS40T23, NS60T15, NS50T08, NS50T08
[DEBUG] Query returned 5 faculties from DB out of 5 requested
[DEBUG] Found 5 faculties in database
[DEBUG] Sample faculty codes: NS70T09, NS40T23, NS60T15, NS50T08
[Processing continues...]
```

If you see fewer faculties returned than requested, the debug endpoint will show you which codes exist in the database.

## Troubleshooting Checklist

- [ ] Restarted backend server after changes
- [ ] Checked `/api/v1/timetable/debug/faculty-codes` endpoint
- [ ] Verified CSV contains valid faculty codes from database
- [ ] CSV column names match one of the accepted formats
- [ ] All required fields are present in CSV
- [ ] CSV file is valid (not corrupted)
- [ ] Checked server logs for detailed error messages

## Common Error: "Faculty not found"

**Error Message:**
```
Row 2: facultyId "NS70T09" not found in faculty_profiles table
```

**Solution:**
1. Run the debug endpoint to see valid faculty codes
2. Check if the code in your CSV exactly matches the database (case-sensitive)
3. Some faculty codes might have spaces or special characters - verify exact format
4. If a faculty code exists in DB but still shows error, check the Department association



