# Integration Guide: Period-Wise Student Attendance

## Quick Start

This guide shows how to integrate the new period-wise attendance system into existing Faculty and Department Admin attendance pages.

---

## Integration Steps

### Step 1: Update Faculty Attendance Page

**File:** `frontend/src/pages/faculty/pages/Attendance.tsx`

Add these imports at the top:

```typescript
import { getTeachingPeriodsOptions, formatPeriodDisplay, isTeachingPeriod } from '@/utils/periodConfiguration';
import PeriodAttendanceMarking from '@/components/PeriodAttendanceMarking';
```

Add state for period selection in the component:

```typescript
const [selectedPeriod, setSelectedPeriod] = useState('1');
const [useNewPeriodSystem, setUseNewPeriodSystem] = useState(true); // Toggle between old/new system
```

Add period selection UI (add this in the form section):

```tsx
{useNewPeriodSystem && (
  <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border mb-4">
    <div className="space-y-2">
      <Label>Select Period</Label>
      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {getTeachingPeriodsOptions().map(period => (
            <SelectItem key={period.value} value={period.value}>
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>System Mode</Label>
      <div className="flex items-center gap-2 mt-2">
        <Switch
          id="period-system"
          checked={useNewPeriodSystem}
          onCheckedChange={setUseNewPeriodSystem}
        />
        <Label htmlFor="period-system">Period-wise Attendance</Label>
      </div>
    </div>
  </div>
)}
```

Replace or augment the attendance save function:

```typescript
const handleSaveWithPeriod = async () => {
  if (!useNewPeriodSystem || !isTeachingPeriod(parseInt(selectedPeriod))) {
    toast.error('Invalid period selected');
    return;
  }

  // Use PeriodAttendanceMarking component's save logic
  // The component handles the API call internally
};
```

Add the new component to the UI (in a tab or section):

```tsx
{useNewPeriodSystem && students.length > 0 && (
  <div className="mt-6">
    <PeriodAttendanceMarking
      classDate={selectedDate}
      classSectionId={parseInt(selectedSection)}
      subjectId={parseInt(selectedSubject)}
      students={students}
      authToken={authToken}
      onSuccess={() => {
        // Refresh data or show success message
        toast.success('Attendance marked successfully!');
      }}
    />
  </div>
)}
```

---

### Step 2: Update Department Admin Attendance Page

**File:** `frontend/src/pages/admin/department-admin/pages/Attendance.tsx`

Follow the same steps as Faculty Attendance page. The component is reusable and will work for both roles.

Key difference: Department Admin may want to see attendance across multiple classes. Add a class selection dropdown if not already present:

```tsx
<Select value={selectedClass} onValueChange={setSelectedClass}>
  <SelectTrigger>
    <SelectValue placeholder="Select Class" />
  </SelectTrigger>
  <SelectContent>
    {classes.map(cls => (
      <SelectItem key={cls.id} value={cls.id}>
        {cls.name} - {cls.section}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

### Step 3: Add Student Attendance View

Create a new page/tab for students to view their attendance:

**File:** `frontend/src/pages/student/pages/Attendance.tsx` (or update existing)

```typescript
import StudentAttendanceView from '@/components/StudentAttendanceView';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentAttendancePage() {
  const { user, authToken } = useAuth();
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Your Attendance</h1>
      <StudentAttendanceView
        studentId={user?.studentId}
        authToken={authToken}
      />
    </div>
  );
}
```

---

## Component API Reference

### PeriodAttendanceMarking

**Props:**
```typescript
interface PeriodAttendanceMarkingProps {
  classDate: string;           // ISO date format: "2024-03-20"
  classSectionId: number;      // Class ID
  subjectId: number;           // Subject ID
  students: Student[];         // Array of student objects
  loading?: boolean;           // Show loading state
  authToken?: string;          // Bearer token for auth
  onSuccess?: () => void;      // Callback on successful save
}
```

**Student Object:**
```typescript
interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  photo?: string;
}
```

**Features:**
- Period selection dropdown (filters to teaching periods only)
- Student search/filter
- Mark all present button
- Real-time attendance count
- Status-based color coding
- Automatic API integration

### StudentAttendanceView

**Props:**
```typescript
interface StudentAttendanceViewProps {
  studentId: string;      // Student ID to fetch attendance for
  authToken?: string;     // Bearer token for auth
}
```

**Features:**
- Subject-wise statistics
- Attendance percentage per subject
- Attendance status breakdown (pie chart)
- Period-wise history
- Overall statistics
- Responsive design with charts

---

## Data Flow Diagram

```
Faculty/Admin Marks Attendance
        ↓
Period Selection (1-10)
        ↓
Student List (filtered by class/section)
        ↓
Mark status (Present/Absent/Late/OD)
        ↓
API POST /api/v1/student/attendance/mark-period
        ↓
Database: Create/Update student_attendance_entry records
        ↓
Response: Count of successful/failed saves
        ↓
UI: Toast notification + clear form
```

---

## Environment Configuration

Add these to your `.env` file if needed:

```env
# Period Configuration
VITE_TEACHING_PERIODS=1,2,4,6,7,9,10
VITE_BREAK_PERIODS=3,5,8

# API Endpoints
VITE_API_BASE_URL=http://localhost:3005/api/v1
VITE_ATTENDANCE_ENDPOINT=/student/attendance
```

---

## Form Validation

The system automatically validates:

1. **Period Validation**
   ```
   ✅ Periods 1, 2, 4, 6, 7, 9, 10 allowed
   ❌ Periods 3, 5, 8 rejected (breaks)
   ```

2. **Attendance Data**
   ```
   ✅ At least one student marked
   ✅ Valid status value
   ❌ Empty attendance rejected
   ```

3. **Date Range**
   ```
   ✅ Past dates allowed (for correction marking)
   ✅ Today's date allowed
   ⚠️  Future dates may be restricted
   ```

---

## Styling Customization

The components use Tailwind CSS. Customize colors by modifying these classes:

**Status Colors:**
- Present: `bg-green-50 text-green-600`
- Absent: `bg-red-50 text-red-600`
- Late: `bg-yellow-50 text-yellow-600`
- On-Duty: `bg-purple-50 text-purple-600`

**Component Colors:**
- Primary: Primary accent color
- Secondary: Secondary accent color
- Muted: Background/neutral color

---

## Testing the Integration

### 1. Faculty Tests
```javascript
// Test 1: Mark attendance for Period 1
faculty.selectClass(CSE-A)
faculty.selectSubject(Data-Structures)
faculty.selectPeriod(1) // Should succeed
faculty.markAllPresent()
faculty.save() // Should create 50 records

// Test 2: Try marking break period
faculty.selectPeriod(3) // Tea Break
faculty.markAllPresent()
faculty.save() // Should show: "Cannot mark attendance for break periods"

// Test 3: Verify period in database
SELECT COUNT(*) FROM student_attendance_entry 
WHERE period_session_number = 1 AND subject_id = 1;
// Should return count matching number of students
```

### 2. Admin Tests
```javascript
// Test 1: View attendance report
admin.goToAttendance()
admin.selectClass() // Can select from search
admin.selectDateRange() // Optional
admin.viewReport() // Should show student-wise stats

// Test 2: Verify filtering
admin.filterBySubject(Data-Structures)
// Should show only records for this subject

// Test 3: Export functionality (future)
admin.exportAsCSV() // Should include all periods
```

### 3. Student Tests
```javascript
// Test 1: View own attendance
student.goToAttendance()
// Should show all subjects with percentages

// Test 2: View period breakdown
student.selectSubject(Data-Structures)
// Should show periods 1,2,4,6,7,9,10 data
// Each period shows list of dates and status

// Test 3: Verify calculations
// sum(present) / sum(total) * 100 = percentage
```

---

## Troubleshooting

### Issue: Period Dropdown Shows Wrong Periods
**Solution:** Verify period configuration in `periodConfiguration.ts`
```typescript
const TEACHING_PERIOD_IDS = [1, 2, 4, 6, 7, 9, 10];
const BREAK_PERIOD_IDS = [3, 5, 8];
```

### Issue: Attendance Not Saving
**Solution:** Check:
1. Authentication token validity
2. Network request status in DevTools
3. Backend logs for errors
4. Database constraints/triggers

### Issue: Wrong Student List Showing
**Solution:** Verify query parameters:
```typescript
{
  department: selectedDepartment,
  semester: selectedSemester,
  section: selectedSection,
}
```

### Issue: Percentage Calculation Wrong
**Solution:** Verify calculation:
```javascript
percentage = (presentCount / totalCount) * 100
// Only count "Present" status in numerator
// Include all attendance records in denominator
```

---

## API Response Examples

### Mark Period Attendance

**Request:**
```json
{
  "classDate": "2024-03-20",
  "classSectionId": 1,
  "subjectId": 5,
  "periodSlotId": 2,
  "attendance": {
    "1": "Present",
    "2": "Absent",
    "3": "Late",
    "4": "On-Duty",
    "5": "Present"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked for period 2",
  "data": {
    "total": 5,
    "successful": 5,
    "failed": 0,
    "records": [
      { "studentId": "1", "status": "Present", "created": true },
      { "studentId": "2", "status": "Absent", "created": true },
      // ...
    ]
  }
}
```

### Get Student Attendance

**Request:**
```
GET /api/v1/student/attendance/student/123?studentId=123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "studentId": "123",
    "studentName": "John Doe",
    "rollNumber": "CSE001",
    "totalRecords": 50,
    "subjectWiseStats": [
      {
        "subjectId": 1,
        "subjectName": "Data Structures",
        "subjectCode": "CS301",
        "total": 10,
        "present": 9,
        "absent": 1,
        "late": 0,
        "onDuty": 0,
        "percentage": 90,
        "byPeriod": {
          "1": {
            "periodId": 1,
            "periodLabel": "I",
            "records": [
              { "date": "2024-03-01", "status": "Present" },
              // ...
            ]
          },
          // ... other periods
        }
      },
      // ... other subjects
    ]
  }
}
```

---

## Best Practices

✅ **DO:**
- Mark attendance immediately after class
- Use quick "Mark All" for majority, then adjust exceptions
- Keep period configuration in sync with college timings
- Regular backups of attendance data
- Generate monthly reports for records

❌ **DON'T:**
- Mark break period attendance (3, 5, 8)
- Overwrite past attendance without audit trail (future enhancement)
- Ignore duplicate entries (system auto-updates)
- Leave form fields empty
- Force attendance without proper verification

---

## Performance Notes

- **Large Classes (100+ students):** Component uses virtual scrolling
- **Date Range Queries:** Index on `class_date` for fast retrieval
- **Period Aggregation:** Pre-calculate during off-peak hours (future enhancement)
- **Memory:** Student list pagination for 1000+ students

---

## Version History

- **v1.0** (Current)
  - Period-wise attendance marking
  - Student view with statistics
  - Period configuration (1-10 periods)
  - Support for 4 status types

- **v1.1** (Planned)
  - Bulk import from CSV
  - Automated notifications for low attendance
  - Mobile app support
  - Biometric integration

---

## Support

For issues or questions:
1. Check error messages in UI (toast notifications)
2. Review browser console for JS errors
3. Check backend logs for API errors
4. Cross-reference with `STUDENT_ATTENDANCE_MANAGEMENT_GUIDE.md`

---

## References

- Main Guide: `STUDENT_ATTENDANCE_MANAGEMENT_GUIDE.md`
- API Testing: `API_TESTING_GUIDE.md`
- Database Schema: `DATABASE_SCHEMA.md`
- Period Specification: `dpcument.md` (Timetable Management & Alteration Workflow)
