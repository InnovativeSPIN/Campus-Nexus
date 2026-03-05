# Timetable System - Visual Flow Diagrams

## 📊 Complete System Architecture Flow

```mermaid
graph TB
    Start([Department Admin Login]) --> Setup[Initial Setup Phase]
    Setup --> CreateRooms[Create Rooms & Labs]
    Setup --> ConfigBreaks[Configure Break Timings]
    CreateRooms --> ResourceReady{Resources Ready?}
    ConfigBreaks --> ResourceReady
    ResourceReady -->|Yes| CreateTT[Create Timetable]
    
    CreateTT --> ChooseMethod{Choose Method}
    ChooseMethod -->|CSV Upload| DownloadCSV[Download CSV Template]
    ChooseMethod -->|Manual Entry| VisualGrid[Open Visual Grid]
    
    DownloadCSV --> FillCSV[Fill CSV with Data]
    FillCSV --> UploadCSV[Upload CSV File]
    UploadCSV --> Validate{Validation}
    Validate -->|Errors| ShowErrors[Show Error Messages]
    ShowErrors --> FillCSV
    Validate -->|Success| SaveDB[(Save to Database)]
    
    VisualGrid --> SelectPeriod[Select Day & Period]
    SelectPeriod --> AddDetails[Add Faculty, Subject, Room]
    AddDetails --> ValidatePeriod{Validate}
    ValidatePeriod -->|Error| SelectPeriod
    ValidatePeriod -->|Success| SavePeriod[Save Period]
    SavePeriod --> MorePeriods{More Periods?}
    MorePeriods -->|Yes| SelectPeriod
    MorePeriods -->|No| Publish[Publish Timetable]
    Publish --> SaveDB
    
    SaveDB --> TTActive([Timetable Active])
    TTActive --> FacultyView[Faculty Views]
    TTActive --> StudentView[Student Views]
    TTActive --> LeaveFlow[Leave Requests]
    
    LeaveFlow --> LeaveWorkflow{Leave Workflow}
    LeaveWorkflow --> End([System Running])
```

## 🔄 Leave Substitution Workflow

```mermaid
sequenceDiagram
    participant F as Faculty (Dr. Smith)
    participant S as System
    participant Sub as Substitute Faculty
    participant Admin as Dept Admin
    participant DB as Database

    F->>S: Apply Leave (March 10)
    S->>DB: Fetch affected periods
    DB-->>S: Return 4 classes
    S-->>F: Show affected periods
    F->>S: Select substitutes for each period
    S->>DB: Save leave request (status: pending)
    S->>Sub: Send notification (substitution request)
    
    Sub->>S: View substitution requests
    S->>DB: Fetch pending requests
    DB-->>Sub: Show request details
    Sub->>S: Accept/Reject
    S->>DB: Update substitute_status
    
    alt All Substitutes Accepted
        S->>Admin: Notify (leave ready for approval)
        Admin->>S: View pending leaves
        S->>DB: Fetch leaves with accepted substitutes
        DB-->>Admin: Show leave details
        Admin->>S: Approve leave
        S->>DB: Update leave (status: approved)
        S->>DB: Create timetable_alterations
        S->>F: Notify (leave approved)
        S->>Sub: Notify (substitution confirmed)
    else Any Substitute Rejected
        S->>F: Notify (substitution rejected)
        F->>S: Select new substitute
    end
```

## 🏢 Room Allocation Flow

```mermaid
graph LR
    A[Select Day & Period] --> B[System Checks Available Rooms]
    B --> C{Query Database}
    C -->|Find Occupied Rooms| D[Filter Out Occupied]
    D --> E[Return Available Rooms]
    E --> F[Display in Dropdown]
    F --> G[User Selects Room]
    G --> H{Is Lab Session?}
    H -->|Yes| I[Validate Lab Assignment]
    H -->|No| J[Assign Room]
    I --> K{Lab Valid?}
    K -->|Yes| J
    K -->|No| L[Show Error]
    L --> F
    J --> M[Save Period with Room]
```

## 📅 Break Timing Configuration Flow

```mermaid
graph TD
    Start([Dept Admin]) --> SelectYear{Select Year Group}
    SelectYear -->|Year 1| Y1[Configure Year 1 Breaks]
    SelectYear -->|Year 2| Y2[Configure Year 2 Breaks]
    SelectYear -->|Year 3 & 4| Y34[Configure Year 3 & 4 Breaks Shared]
    
    Y1 --> AddBreak1[Add Break Details]
    Y2 --> AddBreak2[Add Break Details]
    Y34 --> AddBreak34[Add Break Details]
    
    AddBreak1 --> BreakForm1[Break Number<br/>Break Type short/lunch<br/>Period After<br/>Start Time<br/>End Time]
    AddBreak2 --> BreakForm2[Break Number<br/>Break Type short/lunch<br/>Period After<br/>Start Time<br/>End Time]
    AddBreak34 --> BreakForm34[Break Number<br/>Break Type short/lunch<br/>Period After<br/>Start Time<br/>End Time]
    
    BreakForm1 --> Save1[Save to year_break_timings]
    BreakForm2 --> Save2[Save to year_break_timings]
    BreakForm34 --> Save34[Save to year_break_timings]
    
    Save1 --> DB[(Database)]
    Save2 --> DB
    Save34 --> DB
    
    DB --> Complete([Breaks Configured])
```

## 📤 CSV Upload Validation Flow

```mermaid
flowchart TD
    Upload[Upload CSV File] --> Parse[Parse CSV Rows]
    Parse --> ValidateHeaders{Valid Headers?}
    ValidateHeaders -->|No| Error1[Error: Missing Columns]
    ValidateHeaders -->|Yes| LoopRows[Loop Through Each Row]
    
    LoopRows --> CheckFaculty{Faculty Exists?}
    CheckFaculty -->|No| Error2[Error: Faculty Not Found]
    CheckFaculty -->|Yes| CheckDept{Faculty in Department?}
    CheckDept -->|No| Error3[Error: Wrong Department]
    CheckDept -->|Yes| CheckRoom{Room Specified?}
    
    CheckRoom -->|Yes| ValidateRoom{Room Exists?}
    CheckRoom -->|No| CheckLab
    ValidateRoom -->|No| Error4[Error: Room Not Found]
    ValidateRoom -->|Yes| CheckRoomAvail{Room Available?}
    CheckRoomAvail -->|No| Error5[Error: Room Occupied]
    CheckRoomAvail -->|Yes| CheckLab{Lab Session?}
    
    CheckLab -->|Yes| ValidateLab{Lab Valid?}
    CheckLab -->|No| CheckDuplicate
    ValidateLab -->|No| Error6[Error: Invalid Lab]
    ValidateLab -->|Yes| CheckDuplicate{Duplicate Period?}
    
    CheckDuplicate -->|Yes| Error7[Error: Faculty Double-booked]
    CheckDuplicate -->|No| ValidRow[Row Valid ✓]
    
    ValidRow --> MoreRows{More Rows?}
    MoreRows -->|Yes| LoopRows
    MoreRows -->|No| AllValid{All Rows Valid?}
    
    AllValid -->|No| ReturnErrors[Return All Errors to User]
    AllValid -->|Yes| StartTx[Start Database Transaction]
    
    StartTx --> DeleteOld[Delete Old Records Same Faculty/Year]
    DeleteOld --> BulkInsert[Bulk Insert All New Records]
    BulkInsert --> Commit[Commit Transaction]
    Commit --> Success([Upload Success])
    
    Error1 --> ReturnErrors
    Error2 --> ReturnErrors
    Error3 --> ReturnErrors
    Error4 --> ReturnErrors
    Error5 --> ReturnErrors
    Error6 --> ReturnErrors
    Error7 --> ReturnErrors
```

## 👥 User Role Permission Flow

```mermaid
graph TB
    User([User Login]) --> CheckRole{User Role?}
    
    CheckRole -->|Super Admin| SA[Super Admin Dashboard]
    CheckRole -->|Dept Admin| DA[Dept Admin Dashboard]
    CheckRole -->|Timetable Incharge| TI[Timetable Incharge Dashboard]
    CheckRole -->|Faculty| FAC[Faculty Dashboard]
    CheckRole -->|Student| STU[Student Dashboard]
    
    SA --> SAActions[✓ All Department Access<br/>✓ Global Room/Lab Mgmt<br/>✓ All Timetables<br/>✓ All Approvals]
    
    DA --> DAActions[✓ Own Department Only<br/>✓ Manage Rooms/Labs<br/>✓ Configure Breaks<br/>✓ Upload Timetables<br/>✓ Approve Leaves]
    DA --> DACheck{Action Requires<br/>Department Check?}
    DACheck -->|Yes| ValidateDept{Same Department?}
    ValidateDept -->|No| Deny403[403 Forbidden]
    ValidateDept -->|Yes| Allow200[200 OK]
    DACheck -->|No| Allow200
    
    TI --> TIActions[✓ View All Dept TTs<br/>✓ Quick Edit Periods<br/>✗ No Leave Approval<br/>✗ No Resource Mgmt]
    
    FAC --> FACActions[✓ View Own Timetable<br/>✓ Apply Leave<br/>✓ Respond to Substitution<br/>✗ No Edit Timetable]
    
    STU --> STUActions[✓ View Own Timetable<br/>✗ No Edit Permissions]
```

## 🔍 Real-Time Availability Check Flow

```mermaid
sequenceDiagram
    participant UI as User Interface
    participant API as Backend API
    participant DB as Database
    
    UI->>API: GET /rooms/available?day=Monday&period=1
    API->>DB: SELECT * FROM rooms WHERE department_id=X AND is_active=true
    DB-->>API: Return all department rooms [R1, R2, R3, R4]
    
    API->>DB: SELECT room_id FROM timetable_periods<br/>WHERE day='Monday' AND period_number=1
    DB-->>API: Return occupied rooms [R2, R4]
    
    API->>API: Filter: available = all - occupied<br/>[R1, R2, R3, R4] - [R2, R4] = [R1, R3]
    API-->>UI: Return available rooms [R1, R3]
    
    UI->>UI: Display dropdown with only [R1, R3]
    UI->>API: User selects R1, POST /timetable-periods
    API->>DB: INSERT period with room_id=R1
    DB-->>API: Success
    API-->>UI: 201 Created
```

## 📊 Database Relationships Flow

```mermaid
erDiagram
    DEPARTMENTS ||--o{ ROOMS : has
    DEPARTMENTS ||--o{ LABS : has
    DEPARTMENTS ||--o{ YEAR_BREAK_TIMINGS : configures
    DEPARTMENTS ||--o{ TIMETABLE_MASTER : owns
    
    ROOMS ||--o{ LABS : "houses (optional)"
    ROOMS ||--o{ TIMETABLE_PERIODS : "assigned to"
    
    LABS ||--o{ TIMETABLE_PERIODS : "assigned to"
    
    TIMETABLE_MASTER ||--o{ TIMETABLE_PERIODS : contains
    
    TIMETABLE_PERIODS ||--o{ TIMETABLE_ALTERATIONS : "can be altered"
    
    LEAVES ||--o{ TIMETABLE_ALTERATIONS : creates
    
    YEAR_BREAK_TIMINGS {
        enum year_group "year_1, year_2, year_3_4"
        enum break_type "short, lunch"
        int break_number
        int period_after
        time start_time
        time end_time
    }
    
    TIMETABLE_PERIODS {
        int timetable_master_id FK
        enum day
        int period_number
        int room_id FK
        int lab_id FK
        bool is_lab_session
        enum session_type "theory, lab, tutorial"
    }
    
    LEAVES {
        json affected_periods
        string substitute_faculty_code
        enum substitute_status "pending, accepted, rejected"
        bool timetable_altered
    }
```

## 🎯 Complete Data Flow Timeline

```mermaid
timeline
    title Timetable Management Lifecycle
    
    section Setup Phase
        Day 1 : Department Admin creates rooms
              : Department Admin creates labs
              : Links labs to physical rooms
        Day 2 : Configure break timings
              : Year 1 separate breaks
              : Year 2 separate breaks
              : Year 3 & 4 shared breaks
              
    section Creation Phase
        Week 1 : Download CSV template
               : Fill timetable data
               : Include room and lab info
        Week 2 : Upload CSV file
               : System validates all entries
               : Database stores timetable
               
    section Active Phase
        Ongoing : Faculty view schedules
                : Students view schedules
                : Real-time availability checks
                : Leave requests submitted
                
    section Alteration Phase
        As Needed : Faculty apply leave
                  : Select substitutes
                  : Substitutes respond
                  : Admin approves
                  : Timetable altered
```

---

## 🚦 Quick Reference: API Flow Patterns

### Pattern 1: Simple GET (No Complex Logic)
```
Frontend: GET /api/v1/department-admin/rooms
    ↓
Backend: Extract user from JWT → Filter by department → Query DB
    ↓
Database: SELECT * FROM rooms WHERE department_id = ?
    ↓
Backend: Format response → Return JSON
    ↓
Frontend: Display in table/grid
```

### Pattern 2: CREATE with Validation
```
Frontend: POST /api/v1/department-admin/labs { data }
    ↓
Backend: Authenticate → Authorize role → Validate data
    ↓
Validation Checks:
  - Lab code unique?
  - Room exists?
  - Room belongs to department?
  - Subject IDs valid?
    ↓
[If errors] → Return 400 with error messages
[If success] ↓
Database: INSERT INTO labs ...
    ↓
Backend: Return 201 Created with lab object
    ↓
Frontend: Show success message → Refresh list
```

### Pattern 3: Complex Workflow (Leave)
```
Frontend: POST /api/v1/faculty/leave/apply-with-substitute
    ↓
Backend Multi-Step:
  1. Validate leave dates
  2. Fetch affected timetable periods
  3. Validate substitute faculty
  4. Check substitute availability
  5. Start database transaction
  6. Insert leave record
  7. Update leave with substitutes
  8. Create notifications
  9. Commit transaction
    ↓
Database: Multiple tables updated atomically
    ↓
Notification Service: Send emails/push
    ↓
Backend: Return 200 with leave ID
    ↓
Frontend: Navigate to "My Leaves" → Show pending status
```

---

**These flows represent the complete, production-ready timetable management system!** 🎉
