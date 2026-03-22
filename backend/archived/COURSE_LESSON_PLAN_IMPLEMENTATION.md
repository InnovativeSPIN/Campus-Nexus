# Course Lesson Plan Implementation Guide

## Problem Analysis

### Current Issue: 404 API Error
- **Error**: `GET /api/v1/faculty/leave-request/periods-for-dates` returns 404
- **Root Cause**: Vite proxy misconfigured pointing to port 3005 instead of backend port 5000
- **Fixed**: Updated [vite.config.ts](../frontend/vite.config.ts) proxy target from `localhost:3005` → `localhost:5000`

### Database Structure Understanding
- **timetable_master_slots**: Stores weekly schedule indexed by DAY (e.g., "Monday", "Tuesday")
  - Columns: `master_id`, `day`, `period_slot_id`, `subject_id`, `faculty_id`
  - Challenge: Day-based indexing requires mapping actual dates to day-of-week names
  - Solution: `getPeriodsForDateRange` correctly does this mapping

## Implementation Steps

### 1. API Fix (COMPLETED ✅)
- Fixed proxy configuration in vite.config.ts
- Updated target from `localhost:3005` → `localhost:5000`
- All three proxy paths updated: `/api`, `/uploads`, `/Format`

### 2. Course Lesson Plans Database Schema

#### Table: course_lesson_plans
Stores Section X (Lesson Plan) from Course File
```sql
CREATE TABLE IF NOT EXISTS course_lesson_plans (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT(11) NOT NULL,
  subject_id INT(11) NOT NULL,
  class_id INT(11) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester INT(2) NOT NULL,
  sno TINYINT(3) NOT NULL COMMENT 'Sequential number within subject',
  unit_number TINYINT(2),
  unit_label VARCHAR(50) COMMENT 'e.g., UNIT I, UNIT II',
  topic TEXT NOT NULL COMMENT 'Topic name from PDF',
  co_number VARCHAR(20) COMMENT 'CO1, CO2, C502.1',
  btl VARCHAR(100) COMMENT 'BT1, BT2, BT3 - BTL levels (comma-separated)',
  delivery_mode VARCHAR(255) COMMENT 'PPT, E-Resources, BB, etc.',
  reference_book VARCHAR(255) COMMENT 'T1-416, T2-03, etc.',
  periods_required TINYINT(1) DEFAULT 1,
  periods_taken TINYINT(3) DEFAULT 0,
  cumulative_periods INT(11) COMMENT 'Running total across all topics',
  is_completed BOOLEAN DEFAULT 0,
  tentative_date DATE COMMENT 'Planned date for this topic',
  created_by INT(11),
  updated_by INT(11),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uq_course_plan (faculty_id, subject_id, class_id, academic_year, semester, sno),
  KEY idx_faculty_subject (faculty_id, subject_id),
  KEY idx_class_academic (class_id, academic_year, semester),
  KEY idx_completed (is_completed),
  
  CONSTRAINT fk_clp_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(faculty_id) ON DELETE CASCADE,
  CONSTRAINT fk_clp_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_clp_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: period_topic_log
Links each attendance period to the lesson plan topic taught
```sql
CREATE TABLE IF NOT EXISTS period_topic_log (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  attendance_date DATE NOT NULL,
  period_slot_id INT(11) NOT NULL,
  faculty_id INT(11) NOT NULL,
  class_id INT(11) NOT NULL,
  subject_id INT(11) NOT NULL,
  lesson_plan_id INT(11) NOT NULL,
  co_number VARCHAR(20),
  btl VARCHAR(100),
  is_deviation BOOLEAN DEFAULT 0 COMMENT '1 if taught different topic than planned',
  deviation_note TEXT,
  master_slot_id INT(11) COMMENT 'FK -> timetable_master_slots.id',
  created_by INT(11),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uq_period_log (attendance_date, period_slot_id, faculty_id, class_id, subject_id),
  KEY idx_lesson_plan (lesson_plan_id),
  KEY idx_faculty_date (faculty_id, attendance_date),
  
  CONSTRAINT fk_ptl_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(faculty_id) ON DELETE CASCADE,
  CONSTRAINT fk_ptl_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_ptl_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_ptl_lesson_plan FOREIGN KEY (lesson_plan_id) REFERENCES course_lesson_plans(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ptl_slot FOREIGN KEY (master_slot_id) REFERENCES timetable_master_slots(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Sequelize Models
Create: `backend/models/CourseLessonPlan.model.js`
```javascript
import { DataTypes } from 'sequelize';

const CourseLessonPlan = (sequelize) => {
  const CourseLessonPlanModel = sequelize.define('CourseLessonPlan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    academic_year: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sno: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    unit_number: DataTypes.TINYINT,
    unit_label: DataTypes.STRING(50),
    topic: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    co_number: DataTypes.STRING(20),
    btl: DataTypes.STRING(100),
    delivery_mode: DataTypes.STRING(255),
    reference_book: DataTypes.STRING(255),
    periods_required: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    periods_taken: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    cumulative_periods: DataTypes.INTEGER,
    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tentative_date: DataTypes.DATE,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
  }, {
    tableName: 'course_lesson_plans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  CourseLessonPlanModel.associate = (models) => {
    CourseLessonPlanModel.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty',
    });
    CourseLessonPlanModel.belongsTo(models.Subject, {
      foreignKey: 'subject_id',
      as: 'subject',
    });
    CourseLessonPlanModel.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'class',
    });
    CourseLessonPlanModel.hasMany(models.PeriodTopicLog, {
      foreignKey: 'lesson_plan_id',
      as: 'periodLogs',
    });
  };

  return CourseLessonPlanModel;
};

export default CourseLessonPlan;
```

Create: `backend/models/PeriodTopicLog.model.js`
```javascript
import { DataTypes } from 'sequelize';

const PeriodTopicLog = (sequelize) => {
  const PeriodTopicLogModel = sequelize.define('PeriodTopicLog', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    attendance_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    period_slot_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lesson_plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    co_number: DataTypes.STRING(20),
    btl: DataTypes.STRING(100),
    is_deviation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deviation_note: DataTypes.TEXT,
    master_slot_id: DataTypes.INTEGER,
    created_by: DataTypes.INTEGER,
  }, {
    tableName: 'period_topic_log',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  PeriodTopicLogModel.associate = (models) => {
    PeriodTopicLogModel.belongsTo(models.CourseLessonPlan, {
      foreignKey: 'lesson_plan_id',
      as: 'lessonPlan',
    });
    PeriodTopicLogModel.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty',
    });
    PeriodTopicLogModel.belongsTo(models.Subject, {
      foreignKey: 'subject_id',
      as: 'subject',
    });
    PeriodTopicLogModel.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'class',
    });
  };

  return PeriodTopicLogModel;
};

export default PeriodTopicLog;
```

### 4. API Endpoints for Academics

File: `backend/controllers/faculty/academics.controller.js`

Key endpoints:
- `GET /faculty/academics/course-plans?subjectId=X&classId=Y` - Get lesson plans for subject
- `POST /faculty/academics/course-plans` - Create/save complete lesson plan set
- `PUT /faculty/academics/course-plans/:id` - Update single topic
- `GET /faculty/academics/course-plan-progress?subject=X&class=Y` - Get completion status

### 5. Frontend Integration: Academics Page

Update [Academics.tsx](frontend/src/pages/faculty/pages/Academics.tsx):
- Add "Course Plan" tab alongside "Syllabus" and "Materials"
- Course plan editor with table showing:
  - S.No | Unit | Topic | CO | BTL | Delivery Mode | Reference | Periods Needed | Periods Taken
- Unit headers collapsible by UNIT_LABEL
- Auto-compute cumulative periods
- Save/edit functionality with API integration

### 6. Attendance Integration
Modify Attendance.tsx:
- After faculty selects period, show dropdown: "What did you teach?"
- Load topics from `course_lesson_plans` where `is_completed=0`
- Pre-select next pending topic
- On attendance save, log to `period_topic_log`
- Auto-update `periods_taken` in course_lesson_plans

## Deployment Checklist
- [ ] Run SQL DDL for both tables
- [ ] Create CourseLessonPlan.model.js and import in models/index.js
- [ ] Create PeriodTopicLog.model.js and import in models/index.js
- [ ] Create academics.controller.js with endpoint handlers
- [ ] Add route file: academics.routes.js
- [ ] Update Academics.tsx component with course plan tab
- [ ] Modify Attendance.tsx to capture topic selection
- [ ] Test API endpoints
- [ ] Verify frontend receives periods correctly
