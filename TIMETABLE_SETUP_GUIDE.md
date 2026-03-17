# Timetable Management & Leave Alteration - Setup Guide

## ✅ COMPLETED IMPLEMENTATION

### Backend (Node.js/Express)
- ✅ 3 New Database Models (TimetableMasterSlots, TimetableOverlay, FacultySubstitutes)
- ✅ Updated TimetableMaster Model with all required fields
- ✅ 3 New Controllers (timetable-master, timetable-slots, timetable-alteration)
- ✅ 3 New Route Files (matching specification endpoints)
- ✅ Routes registered in server.js

### Frontend (React/TypeScript)
- ✅ TimetableMasterManagement.tsx - Create & manage timetable masters
- ✅ TimetableSlotsManagement.tsx - Add/edit/delete period slots
- ✅ LeaveWithAlteration.tsx - Submit leaves with substitute requests

---

## 🔧 NEXT STEPS TO COMPLETE INTEGRATION

### 1. Update Department Admin Routes
Edit: `frontend/src/pages/admin/department-admin/DepartmentAdminRoutes.tsx`

Add these routes:
```tsx
import TimetableMasterManagement from './pages/TimetableMasterManagement';
import TimetableSlotsManagement from './pages/TimetableSlotsManagement';
import LeaveWithAlteration from './pages/LeaveWithAlteration';

// Add to routes array:
{
  path: 'timetable-master',
  element: <TimetableMasterManagement />,
},
{
  path: 'timetable-master/:masterId/slots',
  element: <TimetableSlotsManagement />,
},
{
  path: 'leave-with-alteration',
  element: <LeaveWithAlteration />,
},
```

### 2. Update Department Admin Navigation Menu
Edit: `frontend/src/pages/admin/department-admin/components/layout/Sidebar.tsx`

Add menu items:
```tsx
{
  label: 'Timetable Master',
  icon: Calendar,
  path: '/admin/department/timetable-master',
},
{
  label: 'Leave & Alteration',
  icon: CalendarDays,
  path: '/admin/department/leave-with-alteration',
},
```

### 3. Database Migration (If Using Migrations)
Run migrations to create tables if using Sequelize migrations:
```bash
npm run migrate
```

Or manually ensure these tables exist with the columns defined in models.

### 4. Test the API Endpoints
```bash
# Test creating timetable master
curl -X POST http://localhost:5000/api/v1/timetable-master \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "class_id": 1,
    "department_id": 1,
    "academic_year": "2025-2026",
    "semester": 1,
    "semester_type": "odd",
    "batch": "2023-2027",
    "effective_from": "2026-01-15"
  }'

# Test getting timetable masters
curl http://localhost:5000/api/v1/timetable-master \
  -H "Authorization: Bearer <token>"
```

### 5. Create Faculty/Substitute Pages (Optional - Already Structured)
- View pending alteration requests (substitute faculty)
- Accept/reject interface
- Timetable incharge dashboard

---

## 📋 VERIFICATION CHECKLIST

### Backend
- [ ] All new models imported in `backend/models/index.js`
- [ ] All models exported in models/index.js
- [ ] Controllers created in `backend/controllers/timetable/`
- [ ] Routes created and mounted in `backend/server.js`
- [ ] No console errors on server startup

### Frontend
- [ ] New pages created in `frontend/src/pages/admin/department-admin/pages/`
- [ ] Routes added to DepartmentAdminRoutes.tsx
- [ ] Navigation menu updated
- [ ] All imports resolve without errors
- [ ] (Optional) Test components in dev server

### Database
- [ ] Tables created: timetable_master_slots, timetable_overlay, faculty_substitutes
- [ ] Columns match model schema
- [ ] Foreign key relationships established
- [ ] Unique constraints created

---

## 🎯 TESTING WORKFLOW

### Full Workflow Test (End-to-End)
1. **Create Timetable Master**
   - Go to Timetable Master Management
   - Click "Create New Timetable"
   - Fill in: Class, Academic Year, Semester, Batch, Effective From
   - Verify created in draft status

2. **Assign Coordinators**
   - Click "Assign Coordinators" on the created timetable
   - Select: Class Coordinator, Asst Coordinator, Timetable Incharge, HOD
   - Verify assignments saved

3. **Manage Slots**
   - Click "Manage Slots"
   - Add slots for each day/period
   - Verify slots display correctly
   - Edit and delete slots

4. **Activate Timetable**
   - Go back to Timetable Master Management
   - Click "Activate" on draft timetable
   - Verify status changes to active

5. **Submit Leave with Alteration** (Faculty/Class)
   - Go to Leave & Alteration
   - Click "New Leave Request"
   - Fill in: Leave Type, Class, Dates, Reason
   - Select substitute faculty
   - Submit request
   - Verify notification created

6. **Accept Alteration** (Substitute Faculty - future)
   - View pending requests
   - Accept the request
   - Verify timetable incharge notified

7. **Apply Alteration** (Timetable Incharge - future)
   - View approved requests
   - Apply alteration
   - Verify overlay created
   - Verify dept-admin notified

---

## 📁 FILE STRUCTURE SUMMARY

```
backend/
├── models/
│   ├── TimetableMasterSlots.model.js (NEW)
│   ├── TimetableOverlay.model.js (NEW)
│   ├── FacultySubstitutes.model.js (NEW)
│   ├── TimetableMaster.model.js (UPDATED)
│   └── index.js (UPDATED - imports new models)
├── controllers/
│   └── timetable/
│       ├── timetable-master.controller.js (NEW)
│       ├── timetable-slots.controller.js (NEW)
│       ├── timetable-alteration.controller.js (NEW)
│       └── [existing files]
├── routes/
│   └── timetable/
│       ├── timetable-master.routes.js (NEW)
│       ├── timetable-slots.routes.js (NEW)
│       ├── timetable-alteration.routes.js (NEW)
│       └── timetable.routes.js (existing)
└── server.js (UPDATED - added new route imports & mounting)

frontend/
└── src/pages/admin/department-admin/
    ├── pages/
    │   ├── TimetableMasterManagement.tsx (NEW)
    │   ├── TimetableSlotsManagement.tsx (NEW)
    │   ├── LeaveWithAlteration.tsx (NEW)
    │   └── [existing pages]
    ├── DepartmentAdminRoutes.tsx (NEEDS UPDATE)
    └── components/layout/
        └── Sidebar.tsx (NEEDS UPDATE)
```

---

## 🔐 API AUTHENTICATION

All endpoints require:
- Header: `Authorization: Bearer <authToken>`
- Roles: department-admin (role_id=7) for management endpoints

---

## 🎨 UI/UX Features

### TimetableMasterManagement
- Status badges (draft/active/inactive)
- Create dialog with form validation
- Coordinator assignment modal
- Quick action buttons
- Grid layout with responsive design

### TimetableSlotsManagement
- Day-based grouping
- Period selection with times
- Subject/Faculty selection
- Session type selection (theory/lab/tutorial/activity/project/free)
- Prevents breaks (IDs 3, 5, 8)
- Edit inline, delete with confirmation

### LeaveWithAlteration
- Tabbed form (Leave Details + Substitute Faculty)
- Auto-calculate total days
- Workflow timeline visualization
- Status indicators with icons
- Pending/Approved/Rejected views

---

## 📞 SUPPORT

For issues or questions about the implementation:
1. Check database models for field requirements
2. Verify all routes are mounted in server.js
3. Ensure frontend components import correct paths
4. Check browser console for React errors
5. Check server logs for API errors

---

## 🚀 DEPLOYMENT NOTES

1. **Database**: Run migrations before deployment
2. **Environment**: Ensure authToken handling in frontend
3. **CORS**: Update if frontend URL differs from config
4. **File Storage**: Ensure uploads directory exists (if adding timetable PDFs)

