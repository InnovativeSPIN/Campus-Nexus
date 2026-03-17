# Timetable Slot Management - How to Add Slots

## What Was Fixed ✅

The "Manage Slots" button in TimetableMasterManagement component now properly navigates to the TimetableSlotsManagement page.

### Changes Made:
1. Added `useNavigate` import from react-router-dom
2. Initialized `useNavigate()` hook in component
3. Updated button onClick to navigate to `/admin/department-admin/timetable-master/{masterId}/slots`

---

## How to Add Slots - Step by Step

### Step 1: Navigate to Timetable Master
1. Login to Department Admin panel
2. Click **"Timetable Master"** in sidebar
3. Click **"Create New Timetable"** button to create a timetable

### Step 2: Activate Timetable
1. After creating timetable, you'll see it in the list with status "draft"
2. Click the **"Activate"** button (green button with checkmark)
   - Status changes to "active"
   - Now you can add slots

### Step 3: Click "Manage Slots"
1. Click the **"Manage Slots"** button (clock icon)
   - Takes you to the TimetableSlotsManagement page
   - Shows timetable name in header

### Step 4: Add Slots
Click **"Add Slot"** button to open the dialog

Fill in the form:
- **Day** * (required): Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
- **Period** * (required): 
  - I (09:30–10:20)
  - II (10:20–11:10)
  - III (11:30–12:25)
  - IV (13:10–14:00)
  - V (14:00–14:50)
  - VI (15:10–16:00)
  - VII (16:00–16:45)
  - ⚠️ Note: Breaks (3, 5, 8) are not available—they're restricted

- **Subject** (optional): Select from dropdown or leave blank for Activity/Free period
- **Faculty** (optional): Select teacher who will teach this period
- **Session Type** (optional): theory, lab, tutorial, activity, project, or free
- **Room/Lab** (optional): e.g., "Room 101", "Lab 1"
- **Notes** (optional): e.g., "YOGA", "DM", "APP LAB"

Click **"Add Slot"** to save

### Step 5: View All Slots
After adding slots, they appear organized by day:
- Each day card shows all 7 periods
- "Not scheduled" indicates empty slots
- Edit or delete buttons available for each slot

---

## Example Workflow

### Create Timetable
```
1. Go to Timetable Master
2. Click "Create New Timetable"
3. Fill form:
   - Class: Computer Science - Semester 1
   - Academic Year: 2025-2026
   - Batch: 2023-2027
   - Effective From: 2026-03-01
4. Click "Create Timetable"
5. Status: Draft
```

### Assign Coordinators (Optional)
```
1. Click "Assign Coordinators" button
2. Select:
   - Class Coordinator
   - Assistant Coordinator
   - Timetable Incharge
   - HOD
3. Click "Update"
```

### Activate Timetable
```
1. Click "Activate" button (green)
2. Status changes to "Active"
3. Now ready for slots
```

### Manage Slots
```
1. Click "Manage Slots" button
2. Click "Add Slot"
3. Fill period details:
   - Day: Monday
   - Period: I (09:30–10:20)
   - Subject: Data Structures
   - Faculty: Dr. Smith
   - Session Type: theory
   - Room: Room 101
4. Click "Add Slot"
5. Repeat for all periods (6 days × 7 periods = 42 slots)
```

---

## Important Notes

### Period IDs (Cannot Schedule)
❌ **Breaks cannot have classes:**
- Period 3: Tea Break (11:10–11:30)
- Period 5: Lunch (12:25–13:10)
- Period 8: Short Break (14:50–15:10)

✅ **Available for scheduling:**
- Period 1: 09:30–10:20
- Period 2: 10:20–11:10
- Period 4: 11:30–12:25
- Period 6: 13:10–14:00
- Period 7: 14:00–14:50
- Period 9: 15:10–16:00
- Period 10: 16:00–16:45

### Timetable Status
- **Draft**: Can be edited, activated, or deleted
- **Active**: Locked from deletion, can be edited, can add slots
- **Inactive**: Read-only, cannot edit

### Required Fields for Slots
- Day (required)
- Period (required)
- Everything else is optional

---

## Troubleshooting

### "Manage Slots" button doesn't work
✅ **Fixed**: Button now navigates correctly. Clear browser cache if needed.

### Can't see "Add Slot" button
- Ensure timetable status is "Active" first
- Activate the timetable from the main list

### Period option shows as unavailable
- Periods 3, 5, 8 are breaks and intentionally restricted
- Select from the 7 available periods instead

### Can't delete timetable
- Only "draft" status timetables can be deleted
- "Active" or "Inactive" timetables cannot be deleted
- Deactivate it first if needed

### Form not submitting
- Check that Day and Period are filled (required fields)
- Check browser console for error messages
- Verify internet connection

---

## API Endpoints Used

**Add Slot**
```
POST /api/v1/timetable-master/{masterId}/slots
```

**Get Slots**
```
GET /api/v1/timetable-master/{masterId}/slots
```

**Update Slot**
```
PATCH /api/v1/timetable-master/slots/{slotId}
```

**Delete Slot**
```
DELETE /api/v1/timetable-master/slots/{slotId}
```

---

## Summary

✅ Timetable Master Management: Create, view, activate, deactivate
✅ Slot Management: Add, edit, delete slots for all periods
✅ Coordinator Assignment: Assign 4 coordinators to timetable
✅ Period Validation: Breaks automatically excluded
✅ Day Grouping: Slots organized by day for easy viewing

**Ready to add slots now!** 🎉
