# EduVertex — Timetable Management & Alteration Workflow
## Agent Build Specification (Claude Haiku 4.5)

> **Purpose:** This document is the single source of truth for building the Timetable Management module of EduVertex ERP. Read every section before writing a single line of code. All table names, column names, role names, and flow steps are exact and must be used verbatim.

---

## 1. ROLES INVOLVED

| Role | DB Source | Role ID | Key Flag Columns |
|---|---|---|---|
| `department-admin` | `faculty_profiles` | `role_id = 7` | Has full timetable create/edit access |
| `timetable-incharge` | `faculty_profiles` | `role_id = 5` + `is_timetable_incharge = 1` | Assigned per timetable; can apply alterations |
| `faculty` | `faculty_profiles` | `role_id = 5` | Requests leave with alteration; receives alteration requests |

> A faculty member can simultaneously be timetable-incharge (`is_timetable_incharge = 1`) while also being a regular teaching faculty (`role_id = 5`). These are not mutually exclusive.

---

## 2. TIMETABLE MANAGEMENT — FULL FLOW

### 2.1 Who Creates the Timetable

The **department-admin** (`role_id = 7`) is the ONLY role that can create a new timetable in the time table management page in department admin module . They do this from the **Coordinator Page**, which also lets them assign the timetable-incharge and class coordinator for each class .

**Step-by-step:**

1. Department-admin opens the Coordinator Page.
2. Selects a class, semester, academic year, batch.
3. Assigns:
   - `class_coordinator_id` → faculty who coordinates the class
   - `asst_coordinator_id` → assistant coordinator
   - `timetable_incharge_id` → **faculty with `is_timetable_incharge = 1`** who will manage alterations
   - `hod_id` → head of department
4. Fills timetable metadata: `room_no`, `effective_from`, `revision_no`, `semester_type`.
5. Clicks **Create Timetable** → system **INSERT**s into `timetable_master` with `status = 'draft'`.
6. Department-admin then fills in each day × period slot → **INSERT**s rows into `timetable_master_slots`.
7. When complete, department-admin activates it → **UPDATE** `timetable_master SET status = 'active'`.

**DB WRITE — timetable_master:**
```
INSERT INTO timetable_master (
  class_id,           -- FK → classes.id
  department_id,      -- FK → departments.id
  academic_year,      -- e.g. '2025-2026'
  semester,           -- 1–8
  semester_type,      -- 'odd' or 'even'
  batch,              -- e.g. '2023-2027'
  room_no,            -- e.g. 'CR-15'
  effective_from,     -- DATE
  revision_no,        -- e.g. '05.01.2026/01'
  status,             -- 'draft' on create, 'active' after activation
  class_coordinator_id,    -- FK → faculty_profiles.faculty_id
  asst_coordinator_id,     -- FK → faculty_profiles.faculty_id
  timetable_incharge_id,   -- FK → faculty_profiles.faculty_id (is_timetable_incharge=1)
  hod_id,                  -- FK → faculty_profiles.faculty_id
  created_by               -- FK → faculty_profiles.faculty_id (department-admin)
)
```

**DB WRITE — timetable_master_slots (one row per period cell):**
```
INSERT INTO timetable_master_slots (
  master_id,         -- FK → timetable_master.id
  day,               -- 'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'
  period_slot_id,    -- FK → period_slots.id (1=I, 2=II, 4=III, 6=IV, 7=V, 9=VI, 10=VII)
                     -- NOTE: IDs 3, 5, 8 are break rows — never insert slots for these
  subject_id,        -- FK → subjects.id (NULL for activity/free)
  faculty_id,        -- FK → faculty_profiles.faculty_id (NULL for activity/free)
  session_type,      -- 'theory'|'lab'|'tutorial'|'activity'|'project'|'free'
  is_lab_session,    -- 0 or 1 (1 = this is a double-period lab)
  lab_pair_slot_id,  -- FK → timetable_master_slots.id (the paired lab slot, NULL for theory)
  lab_group,         -- 'A'|'B' etc. (NULL for non-lab)
  room,              -- override room for this slot (NULL = use master room_no)
  notes              -- short label e.g. 'YOGA', 'DM', 'APP LAB'
)
```

**UNIQUE constraint:** `(master_id, day, period_slot_id, lab_group)` — no duplicate slots.

**ACTIVE constraint:** Only ONE `status = 'active'` row allowed per `(class_id, academic_year, semester)` — enforced by UNIQUE KEY `uq_active_class_sem`.

### 2.2 Who Can Manage (Edit) the Timetable

Both **department-admin** (`role_id = 7`) and **timetable-incharge** (`is_timetable_incharge = 1`) can manage the timetable slots.

- Department-admin: full CRUD on `timetable_master` and `timetable_master_slots`
- Timetable-incharge: can **UPDATE** `timetable_master_slots` (edit slots), and can **INSERT/UPDATE** `timetable_overlay` (apply alterations for specific dates)

### 2.3 Timetable Read (Rendering)

Always query the view `v_effective_timetable` — never query `timetable_master_slots` directly for display. The view merges the overlay on top of the master:

```sql
SELECT * FROM v_effective_timetable
WHERE class_id = ?
  AND academic_year = ?
  AND semester = ?
  AND (overlay_date = CURDATE() OR overlay_date IS NULL)
ORDER BY slot_order
```

- If `source = 'overlay'` → the cell was altered; show substitute faculty and highlight in orange.
- If `source = 'master'` → normal scheduled slot.

**period_slot_id reference (from `period_slots` table):**
| id | label | time | type |
|---|---|---|---|
| 1 | I | 09:30–10:20 | teaching |
| 2 | II | 10:20–11:10 | teaching |
| 3 | Tea Break | 11:10–11:30 | break — SKIP |
| 4 | III | 11:30–12:25 | teaching |
| 5 | Lunch | 12:25–13:10 | break — SKIP |
| 6 | IV | 13:10–14:00 | teaching |
| 7 | V | 14:00–14:50 | teaching |
| 8 | Short Break | 14:50–15:10 | break — SKIP |
| 9 | VI | 15:10–16:00 | teaching |
| 10 | VII | 16:00–16:45 | teaching |

---

## 3. ALTERATION WORKFLOW — EXACT STEP-BY-STEP

This is the **core workflow**. Every step below maps to exact DB writes.

### Overview
```
Faculty (leave request with alteration faculty name)
  → System sends alteration request to the named substitute faculty
    → Substitute faculty ACCEPTS or REJECTS
      → If ACCEPTED: notify Timetable-Incharge
        → Timetable-Incharge applies the alteration in the timetable
          → Department-Admin dashboard receives the modification notification
```

---

### STEP 1 — Faculty Submits Leave with Alteration Request

The faculty who wants leave fills a form that includes:
- Leave date(s), leave type, reason
- **For each affected period:** the substitute faculty name they are requesting

This creates two records simultaneously:

**DB WRITE 1 — INSERT into `leave_requests`:**
```
INSERT INTO leave_requests (
  applicant_type,         -- 'faculty'
  applicant_id,           -- faculty_profiles.faculty_id of the requester
  department_id,          -- FK → departments.id
  class_id,               -- FK → classes.id (which class is affected)
  leave_type_id,          -- FK → leave_types.id (CL=1, ML=2, OD=3, EL=5 etc.)
  start_date,             -- DATE
  end_date,               -- DATE
  total_days,             -- DECIMAL(4,1)
  reason,                 -- TEXT
  affected_periods,       -- JSON array — CRITICAL FIELD
                          -- Format: [
                          --   { "date": "2026-03-18",
                          --     "period_slot_id": 6,
                          --     "class_id": 21,
                          --     "subject_id": 98,
                          --     "master_id": 1,
                          --     "requested_substitute_faculty_id": 406 }
                          -- ]
  substitute_faculty_id,  -- FK → faculty_profiles.faculty_id (primary substitute requested)
  overall_status          -- 'pending'
)
```

**DB WRITE 2 — INSERT into `faculty_substitutes` (one row per affected period):**
```
INSERT INTO faculty_substitutes (
  faculty_id,              -- absent faculty (FK → faculty_profiles.faculty_id)
  substitute_faculty_id,   -- requested substitute (FK → faculty_profiles.faculty_id)
  start_date,              -- leave start date
  end_date,                -- leave end date
  reason,                  -- leave reason
  leave_id,                -- FK → leave_requests.id (just created above)
  status,                  -- 'pending' — waiting for substitute to accept
  requested_by             -- same as faculty_id (the one requesting)
)
```

**DB WRITE 3 — INSERT into `leave_notifications_v2` (notify substitute faculty):**
```
INSERT INTO leave_notifications_v2 (
  leave_request_id,     -- FK → leave_requests.id
  recipient_type,       -- 'faculty'
  recipient_id,         -- substitute_faculty_id (the one being requested)
  notification_type,    -- 'submitted'
  title,                -- 'Alteration Request from [faculty name]'
  message,              -- 'You have been requested to substitute for [subject] on [dates]. Please accept or reject.'
  is_read               -- 0
)
```

---

### STEP 2 — Substitute Faculty Accepts or Rejects

The substitute faculty sees the alteration request in their notification panel. They accept or reject.

**If ACCEPTED:**

**DB WRITE — UPDATE `faculty_substitutes`:**
```
UPDATE faculty_substitutes
SET status = 'approved',
    approved_by = substitute_faculty_id,  -- self-approval (acceptance)
    approval_date = NOW(),
    updated_at = NOW()
WHERE id = [faculty_substitutes.id]
  AND substitute_faculty_id = [logged-in faculty id]
```

**DB WRITE — INSERT into `leave_notifications_v2` (notify timetable-incharge):**
```
INSERT INTO leave_notifications_v2 (
  leave_request_id,     -- FK → leave_requests.id
  recipient_type,       -- 'faculty'
  recipient_id,         -- timetable_incharge_id from timetable_master
                        -- (fetch: SELECT timetable_incharge_id FROM timetable_master
                        --         WHERE class_id = ? AND status = 'active')
  notification_type,    -- 'approved'  (substitute approved = alteration confirmed)
  title,                -- '[Substitute name] accepted alteration for [subject] on [date]'
  message,              -- 'Please update the timetable to reflect this alteration.'
  is_read               -- 0
)
```

**If REJECTED:**

**DB WRITE — UPDATE `faculty_substitutes`:**
```
UPDATE faculty_substitutes
SET status = 'rejected',
    updated_at = NOW()
WHERE id = ?
```

**DB WRITE — INSERT into `leave_notifications_v2` (notify original faculty):**
```
INSERT INTO leave_notifications_v2 (
  leave_request_id,     -- FK → leave_requests.id
  recipient_type,       -- 'faculty'
  recipient_id,         -- original absent faculty id
  notification_type,    -- 'rejected'
  title,                -- '[Substitute name] rejected your alteration request'
  message,              -- 'Please request another faculty or contact the timetable incharge.'
  is_read               -- 0
)
```

---

### STEP 3 — Timetable-Incharge Applies the Alteration

The timetable-incharge (`is_timetable_incharge = 1`) sees the notification in their dashboard. They open the Alterations panel and apply the change.

For **each affected period** in the leave request's `affected_periods` JSON array:

**DB WRITE — INSERT into `timetable_overlay`:**
```
INSERT INTO timetable_overlay (
  master_id,               -- FROM timetable_master WHERE class_id = ? AND status = 'active'
  overlay_date,            -- the specific date of the affected period
  period_slot_id,          -- period_slot_id from affected_periods JSON
  original_faculty_id,     -- absent faculty (FK → faculty_profiles.faculty_id)
  substitute_faculty_id,   -- accepted substitute (FK → faculty_profiles.faculty_id)
  original_subject_id,     -- subject being substituted (FK → subjects.id)
  substitute_subject_id,   -- same as original unless class is different (usually same)
  reason,                  -- 'Leave: [leave_type_code] — [reason text]'
  leave_request_id,        -- FK → leave_requests.id
  created_by,              -- timetable_incharge faculty_id
  status                   -- 'active'
)
```

**UNIQUE constraint:** `(master_id, overlay_date, period_slot_id)` — only one overlay per slot per date. If re-altering, UPDATE instead of INSERT.

**DB WRITE — INSERT into `timetable_notifications` (for audit log):**
```
INSERT INTO timetable_notifications (
  slot_assignment_id,   -- FK → timetable_slot_assignments.id
                        -- (use 0 or the relevant slot ID; this table is audit-only)
  subject_code,         -- subjects.subject_code
  subject_name,         -- subjects.subject_name
  class_id,             -- FK → classes.id
  faculty_id,           -- substitute faculty id
  requested_by,         -- timetable_incharge faculty_id
  status                -- 'approved'
)
```

**DB WRITE — UPDATE `leave_requests` (mark leave as processing):**
```
UPDATE leave_requests
SET overall_status = 'approved',
    updated_at = NOW()
WHERE id = [leave_request_id]
```

**DB WRITE — UPDATE `faculty_leave_schedules` (record the leave period schedule):**
```
INSERT INTO faculty_leave_schedules (
  faculty_id,     -- absent faculty
  leave_id,       -- FK → leave_requests.id
  from_date,      -- leave start_date
  to_date,        -- leave end_date
  is_active,      -- 1
  reason          -- leave reason
)
```

**DB WRITE — UPDATE `staff_attendance` (mark faculty as on_leave for those dates):**
```
INSERT INTO staff_attendance (
  faculty_id,         -- absent faculty
  department_id,      -- faculty's department
  attendance_date,    -- each date in the leave range
  day_status,         -- 'on_leave'
  leave_request_id    -- FK → leave_requests.id
)
ON DUPLICATE KEY UPDATE
  day_status = 'on_leave',
  leave_request_id = VALUES(leave_request_id)
```

---

### STEP 4 — Department-Admin Dashboard Receives Notification

Once the timetable-incharge applies the overlay:

**DB WRITE — INSERT into `leave_notifications_v2` (notify department-admin):**
```
INSERT INTO leave_notifications_v2 (
  leave_request_id,   -- FK → leave_requests.id
  recipient_type,     -- 'faculty'  (department-admin is stored as faculty with role_id=7)
  recipient_id,       -- department-admin faculty_id
                      -- (fetch: SELECT faculty_id FROM faculty_profiles
                      --         WHERE department_id = ? AND role_id = 7)
  notification_type,  -- 'approved'
  title,              -- 'Timetable updated: [class name] — [date]'
  message,            -- '[Timetable-incharge name] has applied an alteration for [absent faculty]
                      --  on [date]. [Subject] Period [period_label] → Substitute: [sub name]'
  is_read             -- 0
)
```

**DB READ — Department-Admin Dashboard query:**
```sql
SELECT
  lr.id,
  lr.start_date, lr.end_date,
  fp_absent.Name AS absent_faculty,
  fp_sub.Name AS substitute_faculty,
  s.subject_name,
  ps.period_label,
  to_overlay.overlay_date,
  to_overlay.status AS overlay_status,
  ln.title, ln.message, ln.sent_at
FROM leave_notifications_v2 ln
JOIN leave_requests lr ON ln.leave_request_id = lr.id
JOIN timetable_overlay to_overlay ON to_overlay.leave_request_id = lr.id
JOIN faculty_profiles fp_absent ON fp_absent.faculty_id = lr.applicant_id
JOIN faculty_profiles fp_sub ON fp_sub.faculty_id = to_overlay.substitute_faculty_id
JOIN subjects s ON s.id = to_overlay.original_subject_id
JOIN period_slots ps ON ps.id = to_overlay.period_slot_id
WHERE ln.recipient_id = [department_admin_faculty_id]
  AND ln.is_read = 0
ORDER BY ln.sent_at DESC
```

---

## 4. ALTERATION WORKFLOW STATE MACHINE

```
leave_requests.overall_status:
  'pending'
    │
    ├─ faculty_substitutes.status = 'pending'   [waiting for substitute to respond]
    │
    ├─ faculty_substitutes.status = 'approved'  [substitute accepted]
    │     → notify timetable-incharge
    │
    ├─ faculty_substitutes.status = 'rejected'  [substitute rejected]
    │     → notify original faculty to re-request
    │
    └─ timetable_overlay inserted               [timetable-incharge applied it]
          → leave_requests.overall_status = 'approved'
          → staff_attendance.day_status = 'on_leave'
          → department-admin notified
```

---

## 5. API ENDPOINTS TO BUILD

### Timetable Management

| Method | Endpoint | Action | DB Tables |
|---|---|---|---|
| GET | `/api/v1/timetable-master` | Get all timetable masters | `timetable_master` |
| GET | `/api/v1/timetable-master/:id` | Get single timetable master | `timetable_master` JOIN `faculty_profiles` |
| POST | `/api/v1/timetable-master` | Create timetable master | INSERT `timetable_master` |
| PATCH | `/api/v1/timetable-master/:id` | Update coordinator assignments | UPDATE `timetable_master` |
| PATCH | `/api/v1/timetable-master/:id/activate` | Activate timetable | UPDATE `timetable_master` SET status='active' |
| PATCH | `/api/v1/timetable-master/:id/deactivate` | Deactivate timetable | UPDATE `timetable_master` SET status='inactive' |
| DELETE | `/api/v1/timetable-master/:id` | Delete timetable (draft only) | DELETE `timetable_master` |

### Timetable Slots Management

| Method | Endpoint | Action | DB Tables |
|---|---|---|---|
| GET | `/api/v1/timetable-master/:masterId/slots` | Get all slots for a timetable | `timetable_master_slots` |
| POST | `/api/v1/timetable-master/:masterId/slots` | Create a slot | INSERT `timetable_master_slots` |
| POST | `/api/v1/timetable-master/:masterId/slots/bulk` | Bulk create slots from CSV | INSERT multiple `timetable_master_slots` |
| PATCH | `/api/v1/timetable-master/:masterId/slots/:slotId` | Update a slot | UPDATE `timetable_master_slots` |
| DELETE | `/api/v1/timetable-master/:masterId/slots/:slotId` | Delete a slot | DELETE `timetable_master_slots` |

### Timetable Display (for viewing)

| Method | Endpoint | Action | Access | DB Tables |
|---|---|---|---|---|
| GET | `/api/v1/timetable-display/my-class-timetable` | Get student's class timetable | Student | `timetable_master_slots` JOIN `timetable_master` |
| GET | `/api/v1/timetable-display/class/:classId` | Get class timetable | Any authenticated | `timetable_master_slots` JOIN `timetable_master` |
| GET | `/api/v1/timetable-display/my-timetable` | Get faculty's individual timetable | Faculty | `timetable_master_slots` JOIN `timetable_master` |
| GET | `/api/v1/timetable-display/faculty/:facultyId` | Get specific faculty timetable | Admin/Dept-Admin | `timetable_master_slots` JOIN `timetable_master` |

### Alteration Workflow

| Method | Endpoint | Action | DB Tables |
|---|---|---|---|
| POST | `/api/v1/alteration/request` | Faculty submits leave + alteration | INSERT `leave_requests`, `faculty_substitutes`, `leave_notifications_v2` |
| GET | `/api/v1/alteration/pending/:facultyId` | Get pending alteration requests for a substitute | SELECT `faculty_substitutes` + `leave_notifications_v2` WHERE recipient_id = ? |
| PATCH | `/api/v1/alteration/:substituteId/accept` | Substitute accepts | UPDATE `faculty_substitutes`, INSERT `leave_notifications_v2` to timetable-incharge |
| PATCH | `/api/v1/alteration/:substituteId/reject` | Substitute rejects | UPDATE `faculty_substitutes`, INSERT `leave_notifications_v2` to original faculty |
| GET | `/api/v1/alteration/incharge/:facultyId` | Timetable-incharge pending queue | SELECT from `leave_notifications_v2` WHERE recipient_id = ? AND notification_type = 'approved' |
| POST | `/api/v1/alteration/apply` | Timetable-incharge applies overlay | INSERT `timetable_overlay`, `faculty_leave_schedules`, `timetable_notifications`, UPDATE `staff_attendance`, INSERT `leave_notifications_v2` to dept-admin |
| GET | `/api/v1/alteration/admin/:deptId` | Department-admin notification feed | JOIN query across `leave_notifications_v2`, `timetable_overlay`, `leave_requests` |
| DELETE | `/api/v1/alteration/overlay/:overlayId` | Revert an alteration | UPDATE `timetable_overlay` SET status='cancelled' |

---

## 6. CRITICAL BUSINESS RULES FOR THE AGENT

1. **Timetable creation is department-admin only.** Do not allow `role_id = 5` faculty (even timetable-incharge) to create a new timetable master. They can only edit slots and apply overlays.

2. **Timetable-incharge assignment comes from `timetable_master.timetable_incharge_id`.** To find who is incharge for a class, always do:
   ```sql
   SELECT timetable_incharge_id FROM timetable_master
   WHERE class_id = ? AND status = 'active'
   ```
   Do NOT rely solely on `faculty_profiles.is_timetable_incharge = 1` — a faculty may be incharge for one department but not for every timetable.

3. **The alteration flow does NOT directly modify `timetable_master_slots`.** All date-specific changes go into `timetable_overlay`. The master slots are the permanent weekly pattern; overlays are date exceptions.

4. **`v_effective_timetable` view uses `COALESCE(overlay, master)`.** Always query this view for display. The `source` column tells you whether a cell came from master (`'master'`) or overlay (`'overlay'`).

5. **Period slots IDs 3, 5, 8 are break rows.** Never insert `timetable_master_slots` rows with `period_slot_id` IN (3, 5, 8). These are display-only break rows.

6. **`affected_periods` in `leave_requests` is a JSON array.** When the timetable-incharge applies the alteration, iterate over this JSON to create one `timetable_overlay` row per entry.

7. **Notification recipient for timetable-incharge:** Fetch `timetable_master.timetable_incharge_id` for the relevant class. Do not hardcode any faculty ID.

8. **Notification recipient for department-admin:** Query:
   ```sql
   SELECT faculty_id FROM faculty_profiles
   WHERE department_id = ? AND role_id = 7 AND status = 'active'
   ```

9. **`faculty_substitutes.status` lifecycle:** `pending` → `approved` (substitute accepts) OR `rejected` (substitute rejects). Never skip directly to applied — the timetable-incharge step is always required between acceptance and overlay creation.

10. **`leave_requests.overall_status`** should only be set to `'approved'` AFTER the timetable-incharge writes the overlay. Not when the substitute accepts. Not when the HOD approves leave separately.

---

## 7. DATABASE FOREIGN KEY CHAIN FOR THIS WORKFLOW

```
faculty_profiles.faculty_id
  ├─ leave_requests.applicant_id              (absent faculty)
  ├─ leave_requests.substitute_faculty_id     (requested substitute)
  ├─ faculty_substitutes.faculty_id           (absent)
  ├─ faculty_substitutes.substitute_faculty_id (substitute)
  ├─ faculty_substitutes.requested_by         (absent faculty, same as faculty_id here)
  ├─ timetable_overlay.original_faculty_id    (absent)
  ├─ timetable_overlay.substitute_faculty_id  (substitute)
  ├─ timetable_overlay.created_by             (timetable-incharge)
  ├─ timetable_master.timetable_incharge_id   (incharge)
  └─ leave_notifications_v2.recipient_id      (any role)

leave_requests.id
  ├─ faculty_substitutes.leave_id
  ├─ timetable_overlay.leave_request_id
  ├─ faculty_leave_schedules.leave_id
  ├─ staff_attendance.leave_request_id
  └─ leave_notifications_v2.leave_request_id

timetable_master.id
  ├─ timetable_master_slots.master_id
  └─ timetable_overlay.master_id
```

---

## 8. QUICK REFERENCE — TABLES USED IN THIS MODULE

| Table | Purpose in This Module | Key Operation |
|---|---|---|
| `timetable_master` | Timetable header; stores incharge, coordinator, room, status | INSERT (create), UPDATE (activate/edit) |
| `timetable_master_slots` | Weekly schedule — each day×period cell | INSERT (fill slots), UPDATE (edit slot) |
| `timetable_overlay` | Date-specific alteration record | INSERT (apply alteration), UPDATE (cancel) |
| `timetable_notifications` | Audit log for slot assignment changes | INSERT (when overlay applied) |
| `period_slots` | 10 fixed rows — periods I–VII + 3 breaks | READ ONLY — never modify |
| `leave_requests` | Faculty leave with affected_periods JSON | INSERT (submit), UPDATE (status changes) |
| `faculty_substitutes` | Substitute acceptance tracking | INSERT (on submit), UPDATE (accept/reject) |
| `faculty_leave_schedules` | Faculty leave date range record | INSERT (when overlay applied) |
| `staff_attendance` | Daily attendance — marks day_status=on_leave | INSERT/UPDATE (when overlay applied) |
| `leave_notifications_v2` | All notifications across all steps | INSERT at every step |
| `v_effective_timetable` | Merged view: overlay over master | SELECT (for display only) |
| `faculty_profiles` | Role check, incharge lookup, dept-admin lookup | SELECT (role/flag checks) |
| `departments` | Department filter | SELECT (for dept-admin lookup) |
| `classes` | Class name, room, batch info | SELECT (for display) |
| `subjects` | Subject name in notifications | SELECT (for display) |

---

*End of specification. Build each endpoint in the order of the flow: timetable creation → coordinator assignment → alteration request → substitute accept/reject → incharge applies → admin notified.*
