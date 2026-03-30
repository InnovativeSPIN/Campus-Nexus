# EduVertex — Period-Wise Student Attendance
## Complete Agent Build Specification

> **Database:** `eduvertex` (MariaDB 10.4)  
> **Audience:** Claude Haiku 4.5 agent building the attendance module.  
> **Rule:** Use every table name, column name, and enum value EXACTLY as written. Do not invent columns.

---

## 0. WHAT YOU ARE BUILDING

A period-wise student attendance system where:

1. **Faculty** opens the attendance panel, selects class + date + period (I–VII), sees the subject auto-loaded from the timetable, and marks each student: Present / Absent / Late / OD / Medical Leave / Duty Leave.
2. Every mark = one row per student per period in `student_attendance`.
3. Three report views:
   - **Period-wise** — who attended which period on a given date
   - **Subject-wise** — total classes vs attended per subject, with % (use `v_subject_attendance_report` view)
   - **Overall** — aggregate across all subjects per student with eligibility flag (≥75% = eligible, 65–74% = condonation, <65% = detained)
4. **Different year groups have different break timings** — use `year_break_timings` for UI display.

---

## 1. TABLES USED IN THIS MODULE

| Table | Role |
|---|---|
| `student_attendance` | Core write table — one row per student per period per subject per date |
| `period_slots` | Reference — 10 rows for all period and break slots |
| `year_break_timings` | Break timing config — different timings per year (1st/2nd/3rd/4th) |
| `timetable_master_slots` | Auto-load subject/faculty for a period |
| `timetable_master` | Timetable header — links class to slots |
| `timetable_overlay` | Alteration check — substitute subject/faculty if altered |
| `student_profile` | Student list (filter by `classId` and `status='active'`) |
| `faculty_subject_assignments` | Validate faculty is assigned to subject+class |
| `subjects` | Subject name, code, type |
| `classes` | Class name, batch, semester |
| `staff_period_attendance` | Faculty teaching log — written alongside student attendance |
| `staff_attendance` | Faculty daily header — one row per faculty per day |
| `v_subject_attendance_report` | Read-only DB view — subject-wise % already computed |
| `faculty_profiles` | Auth and department_id lookup |

---

## 2. PERIOD SLOTS REFERENCE (READ-ONLY — NEVER INSERT/UPDATE THIS TABLE)

```
id | period_label | start_time | end_time | slot_type | period_number
 1 |      I       |  09:30:00  | 10:20:00 | teaching  |      1
 2 |      II      |  10:20:00  | 11:10:00 | teaching  |      2
 3 |    Break     |  11:10:00  | 11:30:00 |   break   |    NULL
 4 |      III     |  11:30:00  | 12:25:00 | teaching  |      3
 5 |    Lunch     |  12:25:00  | 13:10:00 |   break   |    NULL
 6 |      IV      |  13:10:00  | 14:00:00 | teaching  |      4
 7 |      V       |  14:00:00  | 14:50:00 | teaching  |      5
 8 |    Break     |  14:50:00  | 15:10:00 |   break   |    NULL
 9 |      VI      |  15:10:00  | 16:00:00 | teaching  |      6
10 |      VII     |  16:00:00  | 16:45:00 | teaching  |      7
```

**7 Teaching period_slot_ids:** 1, 2, 4, 6, 7, 9, 10  
**Break period_slot_ids (NEVER use for attendance):** 3, 5, 8

---

## 3. BREAK TIMINGS BY YEAR GROUP

**Table: `year_break_timings`** — different year groups have different break schedules.

This table may be missing from your current DB. If so, CREATE and seed it first (see Section 11).

**Semester → Year group mapping:**
- semester 1 or 2 → year = '1st'
- semester 3 or 4 → year = '2nd'
- semester 5 or 6 → year = '3rd'
- semester 7 or 8 → year = '4th'

**Seeded break times from DB:**
```
year='1st': Tea Break 10:40–11:10 (30 min), Lunch 12:50–13:30 (40 min)
year='2nd': Tea Break 10:40–11:10 (30 min), Lunch 12:50–13:30 (40 min)
year='3rd': Tea Break 10:40–11:00 (20 min), Lunch 12:50–13:20 (30 min)
year='4th': Tea Break 10:40–11:00 (20 min), Lunch 12:50–13:20 (30 min)
```

**These times are for UI display only.** The `period_slot_id` used in `student_attendance` never changes based on year — always use `period_slots.id`. Only the visual break slot label and duration changes.

**Query for break timings:**
```sql
SELECT break_name, start_time, end_time, duration_minutes, break_type, period_after
FROM year_break_timings
WHERE year = :year_group  -- '1st'|'2nd'|'3rd'|'4th'
ORDER BY start_time ASC
```
If no rows found, fall back to period_slots break rows (ids 3, 5, 8).

---

## 4. student_attendance TABLE — ALL COLUMNS

```sql
id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT   -- PK, BIGINT for millions of rows
student_id      INT NOT NULL           -- FK → student_profile.id
class_id        INT NOT NULL           -- FK → classes.id
subject_id      INT NOT NULL           -- FK → subjects.id (auto-loaded, never entered by faculty)
faculty_id      INT NOT NULL           -- FK → faculty_profiles.faculty_id (who taught the class)
master_slot_id  INT DEFAULT NULL       -- FK → timetable_master_slots.id (the timetable slot)
attendance_date DATE NOT NULL          -- YYYY-MM-DD
period_slot_id  TINYINT UNSIGNED NOT NULL  -- FK → period_slots.id (only 1,2,4,6,7,9,10)
period_number   TINYINT UNSIGNED NOT NULL  -- 1 through 7 (teaching period number)
academic_year   VARCHAR(9) NOT NULL    -- e.g. '2025-2026'
semester        TINYINT UNSIGNED NOT NULL  -- current semester of the class
status          ENUM('present','absent','late','od','medical_leave','duty_leave') NOT NULL DEFAULT 'absent'
is_lab_session  TINYINT(1) NOT NULL DEFAULT 0
lab_group       VARCHAR(20) DEFAULT NULL   -- 'A'|'B' for split batches
session_type    ENUM('theory','lab','tutorial','activity','project') NOT NULL DEFAULT 'theory'
marked_by       INT NOT NULL           -- FK → faculty_profiles.faculty_id (who clicked Save)
marked_at       DATETIME NOT NULL DEFAULT current_timestamp()
is_modified     TINYINT(1) NOT NULL DEFAULT 0   -- 1 = edited after first mark
modified_by     INT DEFAULT NULL       -- FK → faculty_profiles.faculty_id (editor)
modified_at     DATETIME DEFAULT NULL
remarks         VARCHAR(255) DEFAULT NULL

UNIQUE KEY uq_student_date_period_subject (student_id, attendance_date, period_slot_id, subject_id)
```

**CRITICAL:** UNIQUE KEY on `(student_id, attendance_date, period_slot_id, subject_id)`.  
Always use **INSERT ... ON DUPLICATE KEY UPDATE** (UPSERT). Never plain INSERT.

---

## 5. MARKING ATTENDANCE — STEP-BY-STEP FLOW

### Step 1 — Faculty Opens Panel and Selects Period

Faculty picks: class → date → period number.  
System auto-resolves subject and faculty using the timetable:

```sql
SELECT
  COALESCE(tov.substitute_subject_id, tms.subject_id)  AS subject_id,
  COALESCE(tov.substitute_faculty_id, tms.faculty_id)  AS faculty_id,
  tms.session_type,
  tms.is_lab_session,
  tms.lab_group,
  tms.notes,
  tms.id AS master_slot_id,
  CASE WHEN tov.id IS NOT NULL THEN 'overlay' ELSE 'master' END AS source
FROM timetable_master tm
JOIN timetable_master_slots tms
  ON tms.master_id = tm.id
  AND tms.day = DAYNAME(:attendance_date)
  AND tms.period_slot_id = :period_slot_id
LEFT JOIN timetable_overlay tov
  ON tov.master_id = tm.id
  AND tov.period_slot_id = :period_slot_id
  AND tov.overlay_date = :attendance_date
  AND tov.status = 'active'
WHERE tm.class_id = :class_id
  AND tm.status = 'active'
LIMIT 1
```

### Step 2 — Load Students

```sql
SELECT id, studentId, rollNumber, firstName, lastName, photo
FROM student_profile
WHERE classId = :class_id
  AND status = 'active'
ORDER BY rollNumber ASC
```

Note: column is `classId` (camelCase) in `student_profile`.

### Step 3 — Check Existing Marks (Edit Mode)

```sql
SELECT student_id, status, remarks, is_modified
FROM student_attendance
WHERE class_id = :class_id
  AND subject_id = :subject_id
  AND attendance_date = :attendance_date
  AND period_slot_id = :period_slot_id
```

Pre-fill UI if rows exist.

### Step 4 — Save All Marks (UPSERT per student)

```sql
INSERT INTO student_attendance (
  student_id, class_id, subject_id, faculty_id, master_slot_id,
  attendance_date, period_slot_id, period_number, academic_year, semester,
  status, is_lab_session, lab_group, session_type, marked_by, marked_at, remarks
) VALUES (
  :student_id, :class_id, :subject_id, :faculty_id, :master_slot_id,
  :attendance_date, :period_slot_id, :period_number, :academic_year, :semester,
  :status, :is_lab_session, :lab_group, :session_type, :marked_by, NOW(), :remarks
)
ON DUPLICATE KEY UPDATE
  status      = VALUES(status),
  remarks     = VALUES(remarks),
  is_modified = 1,
  modified_by = :marked_by,
  modified_at = NOW()
```

Run for EVERY student — even those marked absent.

### Step 5 — Write Faculty Teaching Log

**Step 5a — Daily header (staff_attendance):**
```sql
INSERT INTO staff_attendance (
  faculty_id, department_id, attendance_date, day_status, check_in_time, marked_by, marked_at
) VALUES (
  :faculty_id, :department_id, :attendance_date, 'present', TIME(NOW()), :faculty_id, NOW()
)
ON DUPLICATE KEY UPDATE
  day_status = 'present', marked_at = NOW()
```

**Step 5b — Period log (staff_period_attendance):**
```sql
INSERT INTO staff_period_attendance (
  staff_att_id, faculty_id, class_id, subject_id, attendance_date,
  period_slot_id, period_number, session_type, status,
  students_present, students_total
) VALUES (
  :staff_att_id, :faculty_id, :class_id, :subject_id, :attendance_date,
  :period_slot_id, :period_number, :session_type, 'conducted',
  :present_count,   -- COUNT(status IN ('present','late','od'))
  :total_students   -- COUNT(*) from student_profile WHERE classId=? AND status='active'
)
ON DUPLICATE KEY UPDATE
  students_present = VALUES(students_present),
  students_total   = VALUES(students_total),
  status           = 'conducted'
```

---

## 6. READING ATTENDANCE — THREE VIEWS

### 6.1 Period-wise View

```sql
SELECT
  sa.period_slot_id, ps.period_label, ps.start_time, ps.end_time,
  s.subject_code, s.subject_name,
  sp.studentId, sp.rollNumber,
  CONCAT(sp.firstName, ' ', sp.lastName) AS student_name,
  sa.status, sa.remarks, sa.marked_at, sa.is_modified
FROM student_attendance sa
JOIN student_profile sp ON sp.id  = sa.student_id
JOIN period_slots ps     ON ps.id  = sa.period_slot_id
JOIN subjects s          ON s.id   = sa.subject_id
WHERE sa.class_id        = :class_id
  AND sa.attendance_date = :date
ORDER BY ps.slot_order, sp.rollNumber
```

### 6.2 Subject-wise View (USE THE DB VIEW)

```sql
SELECT student_name, rollNumber, subject_code, subject_name,
       faculty_name, total_classes, attended, absent_count,
       attendance_pct, eligibility_status
FROM v_subject_attendance_report
WHERE class_id     = :class_id
  AND academic_year = :academic_year
  AND semester      = :semester
ORDER BY rollNumber, subject_code
```

**Eligibility (already computed in view):**
- `attendance_pct >= 75` → `eligible`
- `attendance_pct >= 65` → `condonation`
- `attendance_pct < 65`  → `detained`

**What counts as attended:** `present`, `late`, `od`  
**What counts as absent:** `absent` only  
**medical_leave / duty_leave:** included in `total_classes` denominator but not in attended count.

### 6.3 Overall View (All Subjects Combined)

```sql
SELECT
  sa.student_id,
  CONCAT(sp.firstName,' ',sp.lastName) AS student_name,
  sp.rollNumber, sp.studentId,
  COUNT(*)                                              AS total_periods,
  SUM(sa.status IN ('present','late','od'))             AS total_attended,
  SUM(sa.status = 'absent')                             AS total_absent,
  ROUND(SUM(sa.status IN ('present','late','od')) * 100.0 / NULLIF(COUNT(*),0), 2) AS overall_pct,
  CASE
    WHEN ROUND(SUM(sa.status IN ('present','late','od')) * 100.0 / NULLIF(COUNT(*),0), 2) >= 75 THEN 'eligible'
    WHEN ROUND(SUM(sa.status IN ('present','late','od')) * 100.0 / NULLIF(COUNT(*),0), 2) >= 65 THEN 'condonation'
    ELSE 'detained'
  END AS eligibility_status
FROM student_attendance sa
JOIN student_profile sp ON sp.id = sa.student_id
WHERE sa.class_id     = :class_id
  AND sa.academic_year = :academic_year
  AND sa.semester      = :semester
GROUP BY sa.student_id
ORDER BY sp.rollNumber
```

---

## 7. API ENDPOINTS

### Marking

| Method | Endpoint | Tables |
|---|---|---|
| GET | `/api/attendance/schedule/:classId/:date` | `classes`, `year_break_timings`, `period_slots` |
| GET | `/api/attendance/slot-info?classId=&date=&periodSlotId=` | `timetable_master_slots`, `timetable_overlay` |
| GET | `/api/attendance/students/:classId` | `student_profile` |
| GET | `/api/attendance/:classId/:date/:periodSlotId` | `student_attendance` |
| POST | `/api/attendance/mark` | UPSERT `student_attendance`, `staff_attendance`, `staff_period_attendance` |
| PATCH | `/api/attendance/correct` | UPDATE `student_attendance` (is_modified=1) |

### Reports

| Method | Endpoint | Source |
|---|---|---|
| GET | `/api/attendance/period-wise/:classId/:date` | JOIN query on `student_attendance` |
| GET | `/api/attendance/subject-wise/:classId` | `v_subject_attendance_report` view |
| GET | `/api/attendance/overall/:classId` | GROUP BY query on `student_attendance` |
| GET | `/api/attendance/student/:studentId` | `student_attendance` WHERE student_id=? |
| GET | `/api/attendance/defaulters/:classId` | `v_subject_attendance_report` WHERE attendance_pct < 75 |

---

## 8. BUSINESS RULES (ALL MUST BE ENFORCED)

1. **Subject is NEVER entered by faculty.** Always auto-loaded from `timetable_master_slots` + `timetable_overlay` for the selected class+date+period.

2. **Always UPSERT** — UNIQUE KEY `(student_id, attendance_date, period_slot_id, subject_id)` already exists. Use ON DUPLICATE KEY UPDATE.

3. **On edit, set `is_modified=1`, `modified_by`, `modified_at`** on every updated row.

4. **Only period_slot_id values 1, 2, 4, 6, 7, 9, 10 are valid** for `student_attendance`. Never write break IDs (3, 5, 8).

5. **OD and Late count as present** in percentage calculation. medical_leave and duty_leave do NOT improve %.

6. **Faculty validation:** Check `faculty_subject_assignments` WHERE `faculty_id=? AND subject_id=? AND class_id=? AND status='active'` before allowing marking.

7. **Lab sessions:** Two consecutive periods may have the same `subject_id` with `is_lab_session=1`. Each period is a SEPARATE row in `student_attendance`. Never merge them.

8. **`faculty_id` in `student_attendance`** = effective_faculty_id from timetable slot (may be substitute). `marked_by` = logged-in faculty (whoever clicked Save). These can differ.

9. **`year_break_timings`** affects UI display only — it changes the visual break labels in the period selector. It does NOT change `period_slot_id` values stored in attendance rows.

10. **`master_slot_id`** must be populated from `timetable_master_slots.id`. This is critical for future-proofing: if the timetable is revised, old attendance records still reference their original slot.

---

## 11. year_break_timings — CREATE IF MISSING

If this table does not exist in your database, run this before building:

```sql
CREATE TABLE IF NOT EXISTS year_break_timings (
  id               INT(11) NOT NULL AUTO_INCREMENT,
  department_id    INT(11) NOT NULL DEFAULT 0,
  year_group       ENUM('year_1','year_2','year_3_4') DEFAULT NULL,
  year             ENUM('1st','2nd','3rd','4th') NOT NULL,
  break_number     INT(11) DEFAULT NULL,
  period_after     INT(11) DEFAULT NULL,
  break_name       VARCHAR(100) NOT NULL,
  break_type       ENUM('short','lunch') DEFAULT NULL,
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  duration_minutes INT(11) NOT NULL,
  createdAt        DATETIME NOT NULL DEFAULT current_timestamp(),
  updatedAt        DATETIME NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_department_year (department_id, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO year_break_timings (department_id, year, break_number, period_after, break_name, break_type, start_time, end_time, duration_minutes) VALUES
(0, '1st', 1, 2, 'Tea Break',   'short',  '10:40:00', '11:10:00', 30),
(0, '1st', 2, 4, 'Lunch Break', 'lunch',  '12:50:00', '13:30:00', 40),
(0, '2nd', 1, 2, 'Tea Break',   'short',  '10:40:00', '11:10:00', 30),
(0, '2nd', 2, 4, 'Lunch Break', 'lunch',  '12:50:00', '13:30:00', 40),
(0, '3rd', 1, 2, 'Tea Break',   'short',  '10:40:00', '11:00:00', 20),
(0, '3rd', 2, 4, 'Lunch Break', 'lunch',  '12:50:00', '13:20:00', 30),
(0, '4th', 1, 2, 'Tea Break',   'short',  '10:40:00', '11:00:00', 20),
(0, '4th', 2, 4, 'Lunch Break', 'lunch',  '12:50:00', '13:20:00', 30);
```

---

## 12. FK CHAIN

```
faculty_profiles.faculty_id
  ├── student_attendance.faculty_id       (who taught)
  ├── student_attendance.marked_by        (who saved)
  ├── student_attendance.modified_by      (who edited)
  ├── staff_attendance.faculty_id
  └── staff_period_attendance.faculty_id

student_profile.id
  └── student_attendance.student_id

classes.id
  ├── student_attendance.class_id
  ├── student_profile.classId
  ├── timetable_master.class_id
  └── staff_period_attendance.class_id

subjects.id
  ├── student_attendance.subject_id
  └── staff_period_attendance.subject_id

period_slots.id
  ├── student_attendance.period_slot_id
  ├── timetable_master_slots.period_slot_id
  └── staff_period_attendance.period_slot_id

timetable_master_slots.id
  └── student_attendance.master_slot_id

staff_attendance.id (BIGINT)
  └── staff_period_attendance.staff_att_id
```

---

## 13. BUILD ORDER

1. Verify `year_break_timings` exists and is seeded — create + seed if missing
2. Build `GET /api/attendance/schedule/:classId/:date` — period list with break timings
3. Build `GET /api/attendance/students/:classId` — active student list
4. Build `GET /api/attendance/slot-info` — auto-load subject from timetable
5. Build `GET /api/attendance/:classId/:date/:periodSlotId` — existing marks
6. Build `POST /api/attendance/mark` — UPSERT + staff logs (core endpoint)
7. Build `PATCH /api/attendance/correct` — edit single student mark
8. Build `GET /api/attendance/period-wise/:classId/:date` — period view report
9. Build `GET /api/attendance/subject-wise/:classId` — query v_subject_attendance_report
10. Build `GET /api/attendance/overall/:classId` — aggregate
11. Build `GET /api/attendance/defaulters/:classId` — below 75%

---

*End of specification. All table names, column names, enum values, and queries are from the live eduvertex database. Do not invent new tables or columns.*
