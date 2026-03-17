# Database Schema Reference - Timetable Management

## Table: timetable_master
Main header table for class schedules

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| id | INTEGER | ✓ | Primary key, auto-increment |
| class_id | INTEGER | ✓ | FK → classes.id |
| department_id | INTEGER | ✓ | FK → departments.id |
| academic_year | VARCHAR(20) | ✓ | e.g., "2025-2026" |
| semester | INTEGER | ✓ | 1-8 |
| semester_type | ENUM('odd','even') | ✓ | Semester classification |
| batch | VARCHAR(20) | ✓ | e.g., "2023-2027" |
| room_no | VARCHAR(50) | | Default room for schedule |
| effective_from | DATE | ✓ | When timetable becomes effective |
| revision_no | VARCHAR(50) | | Revision identifier |
| status | ENUM('draft','active','inactive') | ✓ | Default: 'draft' |
| class_coordinator_id | INTEGER | | FK → faculty_profiles.faculty_id |
| asst_coordinator_id | INTEGER | | FK → faculty_profiles.faculty_id |
| timetable_incharge_id | INTEGER | | FK → faculty_profiles.faculty_id |
| hod_id | INTEGER | | FK → faculty_profiles.faculty_id |
| created_by | INTEGER | ✓ | FK → faculty_profiles.faculty_id |
| created_at | TIMESTAMP | ✓ | Auto generated |
| updated_at | TIMESTAMP | ✓ | Auto generated |

**Constraints:**
- UNIQUE: (class_id, academic_year, semester) WHERE status='active' → Only one active timetable

---

## Table: timetable_master_slots
Weekly schedule pattern - each day × period cell

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| id | INTEGER | ✓ | Primary key, auto-increment |
| master_id | INTEGER | ✓ | FK → timetable_master.id |
| day | ENUM('Monday',...,'Saturday') | ✓ | Day of week |
| period_slot_id | INTEGER | ✓ | FK → period_slots.id (1,2,4,6,7,9,10 only) |
| subject_id | INTEGER | | FK → subjects.id |
| faculty_id | INTEGER | | FK → faculty_profiles.faculty_id |
| session_type | ENUM('theory','lab','tutorial','activity','project','free') | ✓ | Default: 'theory' |
| is_lab_session | BOOLEAN | ✓ | Default: false |
| lab_pair_slot_id | INTEGER | | FK → timetable_master_slots.id (for double periods) |
| lab_group | ENUM('A','B','C','D') | | Lab group assignment |
| room | VARCHAR(50) | | Override master room |
| notes | VARCHAR(255) | | Label: YOGA, DM, APP LAB, etc. |
| created_at | TIMESTAMP | ✓ | Auto generated |
| updated_at | TIMESTAMP | ✓ | Auto generated |

**Constraints:**
- UNIQUE: (master_id, day, period_slot_id, lab_group)
- NEVER insert period_slot_id ∈ (3, 5, 8) - these are breaks
- Period slot IDs:
  - 1 = I (09:30–10:20)
  - 2 = II (10:20–11:10)
  - 3 = Tea Break (11:10–11:30) ❌
  - 4 = III (11:30–12:25)
  - 5 = Lunch (12:25–13:10) ❌
  - 6 = IV (13:10–14:00)
  - 7 = V (14:00–14:50)
  - 8 = Short Break (14:50–15:10) ❌
  - 9 = VI (15:10–16:00)
  - 10 = VII (16:00–16:45)

---

## Table: timetable_overlay
Date-specific alterations on top of master schedule

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| id | INTEGER | ✓ | Primary key, auto-increment |
| master_id | INTEGER | ✓ | FK → timetable_master.id |
| overlay_date | DATE | ✓ | Specific date of alteration |
| period_slot_id | INTEGER | ✓ | FK → period_slots.id |
| original_faculty_id | INTEGER | ✓ | FK → faculty_profiles.faculty_id (absent) |
| substitute_faculty_id | INTEGER | ✓ | FK → faculty_profiles.faculty_id (on duty) |
| original_subject_id | INTEGER | | FK → subjects.id |
| substitute_subject_id | INTEGER | | Usually same as original |
| reason | TEXT | | Leave reason concatenation |
| leave_request_id | INTEGER | | FK → leave_requests.id (audit trail) |
| created_by | INTEGER | ✓ | FK → faculty_profiles.faculty_id (timetable-incharge) |
| status | ENUM('active','cancelled') | ✓ | Default: 'active' |
| created_at | TIMESTAMP | ✓ | Auto generated |
| updated_at | TIMESTAMP | ✓ | Auto generated |

**Constraints:**
- UNIQUE: (master_id, overlay_date, period_slot_id)

**Example:**
```
Master slot: Mon, Period I, Prof. A teaches Subject X, Room 101
Overlay: 2026-03-18, Period I, Prof. A absent, Prof. B teaching instead
Reason: "Leave: Medical - Sick leave"
```

---

## Table: faculty_substitutes
Substitution request tracking

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| id | INTEGER | ✓ | Primary key, auto-increment |
| faculty_id | INTEGER | ✓ | FK → faculty_profiles.faculty_id (absent) |
| substitute_faculty_id | INTEGER | ✓ | FK → faculty_profiles.faculty_id (requested) |
| start_date | DATE | ✓ | Leave start |
| end_date | DATE | ✓ | Leave end |
| reason | TEXT | | Leave reason |
| leave_id | INTEGER | | FK → leave_requests.id |
| status | ENUM('pending','approved','rejected') | ✓ | Default: 'pending' |
| approved_by | INTEGER | | substitute_faculty_id when approved |
| approval_date | DATETIME | | Date of response |
| requested_by | INTEGER | ✓ | FK → faculty_profiles.faculty_id (same as faculty_id) |
| created_at | TIMESTAMP | ✓ | Auto generated |
| updated_at | TIMESTAMP | ✓ | Auto generated |

**Status Lifecycle:**
- pending → substitute views notification
- pending → approved → timetable-incharge notified → overlay created
- pending → rejected → original faculty notified (retry)

---

## Table: leave_requests (EXISTING - ENHANCED)
Faculty leave requests

| Column | Type | Required | Enhanced For |
|--------|------|----------|---------------|
| id | INTEGER | ✓ | |
| applicant_id | INTEGER | ✓ | Absent faculty |
| department_id | INTEGER | | |
| class_id | INTEGER | | Class affected |
| leave_type | VARCHAR | ✓ | Type of leave |
| start_date | DATE | ✓ | |
| end_date | DATE | ✓ | |
| total_days | DECIMAL(4,1) | ✓ | |
| reason | TEXT | ✓ | |
| overall_status | ENUM('pending','approved','rejected','cancelled') | ✓ | Workflow status |
| **affected_periods** | JSON | | **NEW: Array of periods** |
| **substitute_faculty_id** | INTEGER | | **NEW: Requested substitute** |
| created_at | TIMESTAMP | ✓ | |
| updated_at | TIMESTAMP | ✓ | |

**affected_periods JSON Structure:**
```json
[
  {
    "date": "2026-03-18",
    "period_slot_id": 6,
    "class_id": 21,
    "subject_id": 98,
    "master_id": 1,
    "requested_substitute_faculty_id": 406
  }
]
```

---

## Table: faculty_leave_schedules (EXISTING - USED)
Faculty leave date range recording

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key |
| faculty_id | INTEGER | FK → faculty_profiles.faculty_id |
| leave_id | INTEGER | FK → leave_requests.id |
| from_date | DATE | Leave start |
| to_date | DATE | Leave end |
| is_active | BOOLEAN | Active flag |
| reason | TEXT | Leave reason |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

## Table: staff_attendance (EXISTING - UPDATED)
Daily attendance marking

Added for alteration workflow:
| Column | Type | Purpose |
|--------|------|---------|
| attendance_date | DATE | Date marked as on_leave |
| day_status | ENUM | 'on_leave' for leave dates |
| leave_request_id | INTEGER | FK → leave_requests.id (audit) |

---

## Relationships Diagram

```
faculty_profiles
├─ is_timetable_incharge = 1 → timetable_master.timetable_incharge_id
├─ role_id = 7 (dept-admin) → timetable_master.created_by
├─ Can fill multiple coordinator roles → timetable_master.*_coordinator_id

timetable_master (one per active class×semester)
│
├─ has many → timetable_master_slots (weekly pattern)
│  │
│  └─ Each slot can have → timetable_overlay (date exceptions)
│     └─ Links to → leave_requests
│
└─ Coordinators:
   ├─ class_coordinator_id → faculty teaches/cares class
   ├─ asst_coordinator_id → assists coordinator
   ├─ timetable_incharge_id → approves slot changes/overlays
   └─ hod_id → heads department

leave_requests (faculty leave + alteration)
│
├─ affected_periods (JSON) → which slots affected
├─ substitute_faculty_id → who to cover
│
└─ has one → faculty_substitutes (approval tracking)
   └─ on acceptance → notifies timetable_incharge
      └─ who applies → timetable_overlay
         └─ which updates → staff_attendance
         └─ which notifies → dept_admin
```

---

## Key Constraints & Validations

### timetable_master
- Cannot create active timetable if one exists for (class_id, academic_year, semester)
- Cannot delete non-draft timetables
- All coordinators must exist in faculty_profiles
- effective_from must be valid date

### timetable_master_slots
- period_slot_id must NOT be 3, 5, or 8 (breaks)
- No duplicate (master_id, day, period_slot_id, lab_group)
- If is_lab_session=true, must have lab_pair_slot_id

### timetable_overlay
- No duplicate (master_id, overlay_date, period_slot_id)
- master_id must reference active timetable
- overlay_date must be within academic year
- substitute_faculty_id ≠ original_faculty_id

### faculty_substitutes
- Status follows: pending → approved OR rejected
- Cannot skip to applied directly
- leave_id must reference actual leave request
- start_date ≤ end_date

### leave_requests
- overall_status only becomes 'approved' after overlay created
- affected_periods must be valid JSON array
- substitute_faculty_id must exist
- total_days = abs(end_date - start_date) + 1

---

## Migration Notes

If using Sequelize migrations, create migration file:
```bash
npx sequelize migration:generate --name add-timetable-master-models
```

Then run:
```bash
npx sequelize db:migrate
```

Or manually execute SQL commands to create tables with above schema.

