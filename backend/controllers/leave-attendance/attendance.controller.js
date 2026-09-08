import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
const { Attendance, FacultyAttendance, Student, StudentAttendance, Class: ClassModel, Subject, Faculty, FacultySubjectAssignment, PeriodTopicLog, CourseLessonPlan } = models;
import { Op } from 'sequelize';

// Teaching period slot IDs (1 through 10)
const TEACHING_PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const PERIOD_NUMBER_BY_SLOT = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
};

const normalizeAttendanceStatus = (status) => {
  if (!status) return 'absent';
  const norm = status.toString().trim().toLowerCase();
  switch (norm) {
    case 'present':
      return 'present';
    case 'absent':
      return 'absent';
    case 'late':
      return 'late';
    case 'od':
    case 'on-duty':
    case 'on duty':
      return 'od';
    case 'medical_leave':
    case 'medical leave':
      return 'medical_leave';
    case 'duty_leave':
    case 'duty leave':
      return 'duty_leave';
    case 'leave':
    case 'on-leave':
    case 'on leave':
      return 'absent';
    default:
      return 'absent';
  }
};

// @desc      Get all attendance records
// @route     GET /api/v1/attendance
// @access    Private
export const getAllAttendance = asyncHandler(async (req, res, next) => {
  // When class + date are provided, treat it as a student attendance lookup
  // (used by the faculty attendance UI).
  if (req.query.class && req.query.date) {
    const classId = parseInt(req.query.class, 10);
    const attendanceDate = new Date(req.query.date);
    const attendanceDateStr = attendanceDate.toISOString().slice(0, 10); // YYYY-MM-DD

    const where = {
      attendance_date: attendanceDateStr
    };

    if (!Number.isNaN(classId)) {
      where.class_id = classId;
    }

    if (req.query.subject) {
      where.subject_id = parseInt(req.query.subject, 10);
    }

    if (req.query.period) {
      where.period_slot_id = parseInt(req.query.period, 10);
    }

    if (req.query.faculty) {
      where.faculty_id = parseInt(req.query.faculty, 10);
    }

    const records = await StudentAttendance.findAll({
      where,
      include: [
        {
          model: Student,
          as: 'student',
          required: true, // INNER JOIN to exclude students who changed classes
          where: { classId: classId }, 
          attributes: ['id', 'studentId', 'firstName', 'lastName', 'rollNumber', 'photo']
        }
      ],
      order: [['period_number', 'ASC'], ['student_id', 'ASC']]
    });

    // Group records by period + subject (one session = one attendance sheet)
    const sessions = {};
    records.forEach((record) => {
      const key = `${record.subject_id}_${record.period_slot_id}`;
      if (!sessions[key]) {
        sessions[key] = {
          classId: record.class_id,
          subjectId: record.subject_id,
          facultyId: record.faculty_id,
          period: record.period_slot_id,
          periodNumber: record.period_number,
          attendanceDate: record.attendance_date,
          academicYear: record.academic_year,
          semester: record.semester,
          isLabSession: record.is_lab_session,
          labGroup: record.lab_group,
          sessionType: record.session_type,
          remarks: record.remarks,
          lesson_plan_id: record.lesson_plan_id,
          students: []
        };
      }

      sessions[key].students.push({
        studentId: record.student_id,
        status: record.status,
        remarks: record.remarks
      });
    });

    return res.status(200).json({
      success: true,
      count: Object.keys(sessions).length,
      data: Object.values(sessions)
    });
  }

  // Fallback: return a flat list of student attendance entries (paginated)
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  const where = {};

  if (req.query.class) {
    const classId = parseInt(req.query.class, 10);
    if (!Number.isNaN(classId)) {
      where.class_id = classId;
    }
  }

  if (req.query.subject) {
    const subjectId = parseInt(req.query.subject, 10);
    if (!Number.isNaN(subjectId)) {
      where.subject_id = subjectId;
    }
  }

  if (req.query.faculty) {
    where.faculty_id = parseInt(req.query.faculty, 10);
  }

  if (req.query.date) {
    const date = new Date(req.query.date);
    const dateStr = date.toISOString().slice(0, 10);
    where.attendance_date = dateStr;
  }

  if (req.query.startDate && req.query.endDate) {
    where.attendance_date = {
      [Op.gte]: new Date(req.query.startDate).toISOString().slice(0, 10),
      [Op.lte]: new Date(req.query.endDate).toISOString().slice(0, 10)
    };
  }

  const total = await StudentAttendance.count({ where });
  const attendance = await StudentAttendance.findAll({
    where,
    include: [
      { model: Student, as: 'student', attributes: ['id', 'studentId', 'firstName', 'lastName', 'rollNumber', 'photo'] },
      { model: Subject, as: 'subject', attributes: ['subject_name', 'subject_code'] },
      { model: ClassModel, as: 'class', attributes: ['id', 'name', 'section'] },
      { model: Faculty, as: 'faculty', attributes: ['Name'] }
    ],
    offset: startIndex,
    limit,
    order: [['attendance_date', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: attendance.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: attendance
  });
});

// @desc      Get single attendance record
// @route     GET /api/v1/attendance/:id
// @access    Private
export const getAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await Attendance.findByPk(req.params.id, {
    include: [
      { model: ClassModel, as: 'class', attributes: ['name'] },
      { model: Subject, as: 'subject', attributes: ['subject_name', 'subject_code'] },
      { model: Faculty, as: 'faculty', attributes: ['Name'] },
      {
        model: AttendanceStudent,
        as: 'students',
        include: [{ model: Student, as: 'student', attributes: ['firstName', 'lastName', 'rollNumber', 'studentId', 'photo'] }]
      }
    ]
  });

  if (!attendance) {
    return next(new ErrorResponse(`Attendance record not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc      Mark attendance (create or update per student)
// @route     POST /api/v1/attendance
// @access    Private/Faculty
export const markAttendance = asyncHandler(async (req, res, next) => {
  const classId = parseInt(req.body.classId ?? req.body.class, 10);
  const subjectId = parseInt(req.body.subjectId ?? req.body.subject, 10);
  // Support both faculty (req.user.facultyId) and department-admin (req.user.faculty_id) users
  const facultyId = parseInt(req.body.facultyId ?? req.body.faculty, 10) || req.user.faculty_id || req.user.facultyId || req.user.id;
  const periodSlotId = parseInt(req.body.periodSlotId ?? req.body.period, 10);
  const periodNumber = parseInt(req.body.periodNumber, 10) || PERIOD_NUMBER_BY_SLOT[periodSlotId] || periodSlotId;
  const attendanceDate = req.body.attendanceDate ?? req.body.date;
  const students = Array.isArray(req.body.students) ? req.body.students : [];
  const masterSlotId = req.body.masterSlotId ? parseInt(req.body.masterSlotId, 10) : null;
  const lessonPlanId = req.body.lesson_plan_id ? parseInt(req.body.lesson_plan_id, 10) : null;
  const markedBy = req.user.faculty_id || req.user.facultyId || req.user.id;

  if (!classId || !subjectId || !periodSlotId || !attendanceDate || !students.length) {
    console.error('[markAttendance] Missing required fields', {
      classId,
      subjectId,
      periodSlotId,
      attendanceDate,
      studentCount: students.length,
      bodyClass: req.body.classId ?? req.body.class,
      bodySubject: req.body.subjectId ?? req.body.subject,
      bodyPeriod: req.body.periodSlotId ?? req.body.period,
    });
    return next(new ErrorResponse('Missing required fields', 400));
  }

  if (!TEACHING_PERIODS.includes(periodSlotId)) {
    console.error('[markAttendance] Non-teaching period attempted', { periodSlotId });
    return next(new ErrorResponse('Cannot mark attendance for a non-teaching period', 400));
  }

  const classRow = await ClassModel.findByPk(classId, {
    attributes: ['id', 'academic_year', 'semester']
  });

  if (!classRow) {
    return next(new ErrorResponse('Class not found', 404));
  }

  const academicYear = (req.body.academicYear || classRow.academic_year || '').toString();
  const semester = parseInt(req.body.semester, 10) || parseInt(classRow.semester, 10);

  if (!academicYear || !semester) {
    return next(new ErrorResponse('academic_year and semester are required for attendance', 400));
  }

  const userRole = typeof req.user.role === 'object' ? req.user.role.role_name || req.user.role : req.user.role;
  const isFacultyUser = String(userRole).toLowerCase() === 'faculty';

  if (isFacultyUser) {
    const facultyAssignment = await FacultySubjectAssignment.findOne({
      where: {
        faculty_id: facultyId,
        subject_id: subjectId,
        class_id: classId,
        status: 'active',
      },
      attributes: ['id'],
    });

    if (!facultyAssignment) {
      return next(new ErrorResponse('Faculty is not assigned to this subject and class', 403));
    }
  }

  const sessionType = req.body.sessionType || 'theory';
  const isLabSession = Number(req.body.isLabSession) ? 1 : 0;
  const labGroup = req.body.labGroup || null;

  // Normalize date to YYYY-MM-DD (database stores DATE only)
  const attendanceDateStr = new Date(attendanceDate).toISOString().slice(0, 10);

  // Extract coverage tracking fields
  const coverageStatus = req.body.coverageStatus || null; // 'completed' or 'deviation'
  const periodsCovered = req.body.periodsCovered ? parseInt(req.body.periodsCovered, 10) : 0;
  const deviationReason = req.body.deviationReason || null;
  const additionalNotes = req.body.additionalNotes || null;

  // If lesson_plan_id is provided, update coverage and period_topic_log
  if (lessonPlanId) {
    try {
      // Fetch current lesson plan to calculate periods
      const currentLesson = await CourseLessonPlan.findByPk(lessonPlanId, {
        attributes: ['id', 'periods_taken', 'periods_required', 'unit_number', 'topic']
      });

      if (currentLesson && coverageStatus) {
        const updateData = {
          coverage_status: coverageStatus,
          coverage_date: new Date(),
          additional_notes: additionalNotes,
        };

        if (coverageStatus === 'completed') {
          // Mark as completed: increment periods_taken, set is_completed if full
          const newPeriodsTaken = currentLesson.periods_taken + periodsCovered;
          updateData.periods_taken = newPeriodsTaken;
          updateData.completed_date = new Date();

          // Set is_completed if total periods >= periods_required
          if (newPeriodsTaken >= currentLesson.periods_required) {
            updateData.is_completed = true;
          }
        } else if (coverageStatus === 'deviation') {
          // Deviation: don't update periods_taken, just store the reason
          updateData.deviation_reason = deviationReason;
        }

        await CourseLessonPlan.update(
          updateData,
          { where: { id: lessonPlanId } }
        );

        // Create period_topic_log entry with lesson details
        const isDeviation = coverageStatus === 'deviation' ? 1 : 0;
        await PeriodTopicLog.upsert({
          attendance_date: attendanceDateStr,
          period_slot_id: periodSlotId,
          faculty_id: facultyId,
          class_id: classId,
          subject_id: subjectId,
          lesson_plan_id: lessonPlanId,
          unit_number: currentLesson.unit_number,
          topic_summary: currentLesson.topic,
          periods_covered: periodsCovered > 0 ? periodsCovered : 1,
          is_deviation: isDeviation,
          deviation_note: deviationReason,
          master_slot_id: masterSlotId,
        });
      }
    } catch (err) {
      console.error('Coverage tracking error:', err);
      // Don't fail the entire request if coverage tracking fails
    }
  }

  // 1. Clean up any existing attendance for this specific session first 
  // to prevent "790 students" ghosts if mapping was changed
  await StudentAttendance.destroy({
    where: {
      attendance_date: attendanceDateStr,
      period_slot_id: periodSlotId,
      subject_id: subjectId,
      class_id: classId
    }
  });

  // 2. Upsert each student's attendance record
  const results = [];
  for (const student of students) {
    const studentId = parseInt(student.studentId ?? student.student ?? student.id, 10);
    if (!studentId) {
      console.error('[markAttendance] Skipping invalid student id', { student });
      continue;
    }

    const status = normalizeAttendanceStatus(student.status);

    const existing = await StudentAttendance.findOne({
      where: {
        student_id: studentId,
        attendance_date: attendanceDateStr,
        period_slot_id: periodSlotId,
        subject_id: subjectId,
      },
      attributes: ['id'],
    });

    const payload = {
      student_id: studentId,
      class_id: classId,
      subject_id: subjectId,
      faculty_id: facultyId,
      master_slot_id: masterSlotId,
      attendance_date: attendanceDateStr,
      period_slot_id: periodSlotId,
      period_number: periodNumber,
      academic_year: academicYear,
      semester,
      status,
      is_lab_session: isLabSession,
      lab_group: labGroup,
      session_type: sessionType,
      marked_by: markedBy,
      marked_at: new Date(),
      remarks: student.remarks || null,
      lesson_plan_id: lessonPlanId,
    };

    if (existing) {
      payload.is_modified = 1;
      payload.modified_by = markedBy;
      payload.modified_at = new Date();
    }

    try {
      await StudentAttendance.upsert(payload);
      results.push({ studentId, status, created: !existing });
    } catch (err) {
      console.error('[markAttendance] Failed to upsert student attendance', {
        studentId,
        classId,
        subjectId,
        periodSlotId,
        attendanceDate: attendanceDateStr,
        payload,
        error: err.message || err,
      });
      return next(new ErrorResponse('Failed to save attendance for student records', 500));
    }
  }

  res.status(201).json({
    success: true,
    message: 'Attendance saved',
    data: {
      attendanceDate: attendanceDateStr,
      classId,
      subjectId,
      period: periodSlotId,
      records: results
    }
  });
});

// @desc      Update attendance
// @route     PUT /api/v1/attendance/:id
// @access    Private/Faculty
export const updateAttendance = asyncHandler(async (req, res, next) => {
  let attendance = await Attendance.findByPk(req.params.id);

  if (!attendance) {
    return next(new ErrorResponse(`Attendance record not found with id of ${req.params.id}`, 404));
  }

  const students = Array.isArray(req.body.students) ? req.body.students : null;
  if (students) {
    const totals = students.reduce(
      (acc, s) => {
        if (s.status === 'present') acc.totalPresent += 1;
        else if (s.status === 'absent') acc.totalAbsent += 1;
        else if (s.status === 'late') acc.totalLate += 1;
        else if (s.status === 'excused') acc.totalExcused += 1;
        return acc;
      },
      { totalPresent: 0, totalAbsent: 0, totalLate: 0, totalExcused: 0 }
    );
    await Attendance.update({
      totalPresent: totals.totalPresent,
      totalAbsent: totals.totalAbsent,
      totalLate: totals.totalLate,
      totalExcused: totals.totalExcused
    }, { where: { id: req.params.id } });

    await AttendanceStudent.destroy({ where: { attendanceId: req.params.id } });
    const rows = students.map((student) => ({
      attendanceId: Number(req.params.id),
      studentId: student.student,
      status: student.status || 'absent',
      remarks: student.remarks
    }));
    await AttendanceStudent.bulkCreate(rows);
  }

  const updatePayload = { ...req.body };
  if (updatePayload.class) {
    updatePayload.classId = updatePayload.class;
    delete updatePayload.class;
  }
  if (updatePayload.subject) {
    updatePayload.subjectId = updatePayload.subject;
    delete updatePayload.subject;
  }
  if (updatePayload.faculty) {
    updatePayload.facultyId = updatePayload.faculty;
    delete updatePayload.faculty;
  }
  delete updatePayload.students;

  await Attendance.update(updatePayload, { where: { id: req.params.id } });
  attendance = await Attendance.findByPk(req.params.id);

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc      Delete attendance
// @route     DELETE /api/v1/attendance/:id
// @access    Private/Admin
export const deleteAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await Attendance.findByPk(req.params.id);

  if (!attendance) {
    return next(new ErrorResponse(`Attendance record not found with id of ${req.params.id}`, 404));
  }

  await AttendanceStudent.destroy({ where: { attendanceId: attendance.id } });
  await attendance.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get attendance by class and date range
// @route     GET /api/v1/attendance/class/:classId
// @access    Private
export const getAttendanceByClass = asyncHandler(async (req, res, next) => {
  let where = { classId: req.params.classId };

  if (req.query.startDate && req.query.endDate) {
    where.date = {
      [Op.gte]: new Date(req.query.startDate),
      [Op.lte]: new Date(req.query.endDate)
    };
  }

  const attendance = await Attendance.findAll({
    where,
    include: [
      { model: Subject, as: 'subject', attributes: ['subject_name', 'subject_code'] },
      { model: Faculty, as: 'faculty', attributes: ['Name'] },
      {
        model: AttendanceStudent,
        as: 'students',
        include: [{ 
          model: Student, 
          as: 'student', 
          required: true,
          where: { classId: req.params.classId },
          attributes: ['firstName', 'lastName', 'rollNumber', 'photo'] 
        }]
      }
    ],
    order: [['date', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: attendance.length,
    data: attendance
  });
});

// @desc      Get student attendance report
// @route     GET /api/v1/attendance/student/:studentId
// @access    Private
export const getStudentAttendance = asyncHandler(async (req, res, next) => {
  let attendanceWhere = {};

  if (req.query.startDate && req.query.endDate) {
    attendanceWhere.date = {
      [Op.gte]: new Date(req.query.startDate),
      [Op.lte]: new Date(req.query.endDate)
    };
  }

  if (req.query.subject) {
    attendanceWhere.subjectId = req.query.subject;
  }

  const attendance = await Attendance.findAll({
    where: attendanceWhere,
    include: [
      { model: Subject, as: 'subject', attributes: ['subject_name', 'subject_code'] },
      { model: Faculty, as: 'faculty', attributes: ['Name'] },
      {
        model: AttendanceStudent,
        as: 'students',
        where: { studentId: req.params.studentId },
        required: true
      }
    ],
    order: [['date', 'DESC']]
  });

  // Calculate attendance percentage
  let totalClasses = attendance.length;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;

  attendance.forEach(record => {
    const studentRecord = record.students?.find(
      s => s.studentId === Number(req.params.studentId)
    );
    if (studentRecord) {
      if (studentRecord.status === 'present') presentCount++;
      else if (studentRecord.status === 'absent') absentCount++;
      else if (studentRecord.status === 'late') lateCount++;
    }
  });

  const attendancePercentage = totalClasses > 0
    ? ((presentCount + lateCount) / totalClasses * 100).toFixed(2)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      attendance,
      summary: {
        totalClasses,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        attendancePercentage
      }
    }
  });
});

// @desc      Get my attendance (for logged in student)
// @route     GET /api/v1/attendance/my-attendance
// @access    Private/Student
export const getMyAttendance = asyncHandler(async (req, res, next) => {
  const student = req.user; // already validated as student by protect middleware

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  let attendanceWhere = {};

  if (req.query.startDate && req.query.endDate) {
    attendanceWhere.date = {
      [Op.gte]: new Date(req.query.startDate),
      [Op.lte]: new Date(req.query.endDate)
    };
  }

  const attendance = await Attendance.findAll({
    where: attendanceWhere,
    include: [
      { model: Subject, as: 'subject', attributes: ['subject_name', 'subject_code'] },
      { model: Faculty, as: 'faculty', attributes: ['Name'] },
      {
        model: AttendanceStudent,
        as: 'students',
        where: { studentId: student.id },
        required: true
      }
    ],
    order: [['date', 'DESC']]
  });

  // Calculate summary
  let totalClasses = attendance.length;
  let presentCount = 0;
  let absentCount = 0;

  attendance.forEach(record => {
    const studentRecord = record.students?.find(
      s => s.studentId === student.id
    );
    if (studentRecord) {
      if (studentRecord.status === 'present' || studentRecord.status === 'late') {
        presentCount++;
      } else {
        absentCount++;
      }
    }
  });

  res.status(200).json({
    success: true,
    data: {
      attendance,
      summary: {
        totalClasses,
        present: presentCount,
        absent: absentCount,
        percentage: totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : 0
      }
    }
  });
});

// @desc      Mark faculty attendance
// @route     POST /api/v1/attendance/faculty
// @access    Private/Admin
export const markFacultyAttendance = asyncHandler(async (req, res, next) => {
  const payload = {
    ...req.body,
    facultyId: req.body.faculty,
    markedById: req.user.id
  };
  delete payload.faculty;

  // Check if attendance already marked for this date
  const facultyDayStart = new Date(new Date(payload.date).setHours(0, 0, 0, 0));
  const facultyDayEnd = new Date(new Date(payload.date).setHours(23, 59, 59, 999));
  const existingAttendance = await FacultyAttendance.findOne({
    where: {
      facultyId: payload.facultyId,
      date: {
        [Op.gte]: facultyDayStart,
        [Op.lt]: facultyDayEnd
      }
    }
  });

  if (existingAttendance) {
    // Update existing
    await FacultyAttendance.update(payload, { where: { id: existingAttendance.id } });
    const updated = await FacultyAttendance.findByPk(existingAttendance.id);
    return res.status(200).json({
      success: true,
      data: updated
    });
  }

  const attendance = await FacultyAttendance.create(payload);

  res.status(201).json({
    success: true,
    data: attendance
  });
});

// @desc      Get faculty attendance
// @route     GET /api/v1/attendance/faculty/:facultyId
// @access    Private
export const getFacultyAttendance = asyncHandler(async (req, res, next) => {
  let where = { facultyId: req.params.facultyId };

  if (req.query.startDate && req.query.endDate) {
    where.date = {
      [Op.gte]: new Date(req.query.startDate),
      [Op.lte]: new Date(req.query.endDate)
    };
  }

  const attendance = await FacultyAttendance.findAll({
    where,
    include: [{ model: Faculty, as: 'faculty', attributes: ['Name', 'faculty_college_code'] }],
    order: [['date', 'DESC']]
  });

  // Calculate summary
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const absentDays = attendance.filter(a => a.status === 'absent').length;
  const halfDays = attendance.filter(a => a.status === 'half-day').length;
  const onLeaveDays = attendance.filter(a => a.status === 'on-leave').length;

  res.status(200).json({
    success: true,
    data: {
      attendance,
      summary: {
        totalDays,
        present: presentDays,
        absent: absentDays,
        halfDay: halfDays,
        onLeave: onLeaveDays,
        percentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0
      }
    }
  });
});

// @desc      Get attendance statistics
// @route     GET /api/v1/attendance/stats
// @access    Private/Admin
export const getAttendanceStats = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAttendance = await Attendance.findAll({
    where: { date: { [Op.gte]: today } },
    include: [{ model: AttendanceStudent, as: 'students' }]
  });

  let totalStudentsMarked = 0;
  let totalPresent = 0;
  let totalAbsent = 0;

  todayAttendance.forEach(record => {
    totalStudentsMarked += record.students?.length || 0;
    totalPresent += record.totalPresent;
    totalAbsent += record.totalAbsent;
  });

  // Monthly statistics
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthlyAttendance = await Attendance.findAll({
    where: { date: { [Op.gte]: startOfMonth } }
  });

  res.status(200).json({
    success: true,
    data: {
      today: {
        classesMarked: todayAttendance.length,
        totalStudentsMarked,
        present: totalPresent,
        absent: totalAbsent
      },
      monthly: {
        totalRecords: monthlyAttendance.length
      }
    }
  });
});

/**
 * Get Faculty's Timetable Slots for a given date
 * Returns subjects and periods from timetable_master and timetable_master_slots
 */
export const getFacultyTimetableSlots = asyncHandler(async (req, res, next) => {
  const { date } = req.params;
  // Support both faculty and department-admin users (field names differ)
  const facultyId = req.user.faculty_id || req.user.facultyId || req.user.id;

  if (!date) {
    return res.status(400).json({ success: false, error: 'Date parameter is required' });
  }

  const { TimetableMaster, TimetableMasterSlots, PeriodSlot, Subject, Class: ClassModel, Student } = models;

  try {
    // Get day of week name from date
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[dayOfWeek];

    // Fetch timetable assignments for this faculty on this day
    const timetableSlots = await TimetableMasterSlots.findAll({
      where: { faculty_id: facultyId, day: dayName },
      include: [
        {
          model: TimetableMaster,
          as: 'master',
          where: { status: 'active' },
          required: true,
          include: [
            { model: ClassModel, as: 'class', attributes: ['id', 'name', 'section'] }
          ]
        },
        { model: Subject, as: 'subject', attributes: ['id', 'subject_code', 'subject_name'] },
        {
          model: PeriodSlot,
          as: 'period',
          attributes: ['id', 'period_label', 'start_time', 'end_time', 'slot_type'],
          required: false
        },
      ],
      attributes: ['id', 'day', 'subject_id', 'period_slot_id', 'faculty_id', 'start_time', 'end_time', 'master_id', 'session_type', 'is_lab_session', 'lab_group'],
      raw: false,
    });

    // Fetch dynamic slot timing overrides across active masters
    const activeMasterIds = [...new Set(timetableSlots.map(s => s.master_id).filter(Boolean))];
    const masterPeriodTimingMap = new Map();
    if (activeMasterIds.length > 0) {
      const timingOverrides = await TimetableMasterSlots.findAll({
        where: {
          master_id: { [Op.in]: activeMasterIds },
          start_time: { [Op.ne]: null },
          end_time: { [Op.ne]: null }
        },
        attributes: ['master_id', 'period_slot_id', 'start_time', 'end_time'],
        raw: true
      });
      timingOverrides.forEach(to => {
        const key = `${to.master_id}_${to.period_slot_id}`;
        if (!masterPeriodTimingMap.has(key)) {
          masterPeriodTimingMap.set(key, { start_time: to.start_time, end_time: to.end_time });
        }
      });
    }

    // Format response removing duplicates
    const uniqueSlots = {};
    const classStudents = {};

    timetableSlots.forEach(slot => {
      // Include any slot that has a subject assigned to it (not an unassigned break)
      const hasSubject = !!slot.subject?.id;
      const isPureBreak = slot.session_type === 'break' && !hasSubject;

      if (!hasSubject || isPureBreak) return;

      // Use slot.id as the unique key so each timetable slot row is distinct
      const key = slot.id;
      if (!uniqueSlots[key] && slot.master && slot.master.class && slot.period) {
        const classId = slot.master.class_id;
        const timingOverride = masterPeriodTimingMap.get(`${slot.master_id}_${slot.period_slot_id}`);
        const startTime = slot.start_time || timingOverride?.start_time || slot.period?.start_time;
        const endTime = slot.end_time || timingOverride?.end_time || slot.period?.end_time;

        uniqueSlots[key] = {
          slotId: slot.id,
          masterSlotId: slot.id,
          classSectionId: classId,
          className: slot.master.class?.name || '',
          classSection: slot.master.class?.section || '',
          academicYear: slot.master.academic_year,
          semester: slot.master.semester,
          batch: slot.master.batch,
          facultyId: facultyId,
          subjectId: slot.subject?.id,
          subjectCode: slot.subject?.subject_code,
          subjectName: slot.subject?.subject_name,
          sessionType: slot.session_type,
          isLabSession: slot.is_lab_session,
          labGroup: slot.lab_group,
          periodId: slot.period?.id,
          periodLabel: slot.period?.period_label,
          startTime,
          endTime,
          dayOfWeek: slot.day,
        };

        // Prepare to fetch students for this class
        if (!classStudents[classId]) {
          classStudents[classId] = null;
        }
      }
    });

    // Fetch students for each unique class section
    for (const classStrId of Object.keys(classStudents)) {
      const classId = parseInt(classStrId);
      if (isNaN(classId)) {
        classStudents[classStrId] = [];
        continue;
      }

      const students = await Student.findAll({
        where: { classId: classId },
        attributes: ['id', 'studentId', 'firstName', 'lastName', 'rollNumber', 'photo'],
        order: [['rollNumber', 'ASC']],
        raw: true,
      });
      classStudents[classStrId] = students;
    }

    res.status(200).json({
      success: true,
      date,
      dayOfWeek: dayName,
      data: {
        slots: Object.values(uniqueSlots),
        studentsByClass: classStudents,
      }
    });
  } catch (error) {
    console.error('[getFacultyTimetableSlots] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch timetable slots' });
  }
});

/**
 * Get Department Admin's Classes/Slots for a given date
 * Fetches all classes with subjects and periods from timetable
 */
export const getDepartmentAdminClassSlots = asyncHandler(async (req, res, next) => {
  const { date } = req.params;
  const departmentId = req.user.departmentId || req.user.department_id || (typeof req.user.department === 'object' ? req.user.department?.id : null);

  if (!date) {
    return res.status(400).json({ success: false, error: 'Date parameter is required' });
  }

  if (!departmentId) {
    return res.status(400).json({ success: false, error: 'Department ID not found in token' });
  }

  const { TimetableMaster, TimetableMasterSlots, PeriodSlot, Subject, Class: ClassModel, Student } = models;

  try {
    // Get day of week name from date
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[dayOfWeek];

    // Fetch all active timetable assignments for department's classes on this day
    const timetableMasters = await TimetableMaster.findAll({
      where: { department_id: departmentId, status: 'active' },
      include: [
        {
          model: TimetableMasterSlots,
          as: 'slots',
          where: { day: dayName },
          required: true,
          include: [
            { model: Subject, as: 'subject', attributes: ['id', 'subject_code', 'subject_name'] },
            {
              model: PeriodSlot,
              as: 'period',
              attributes: ['id', 'period_label', 'start_time', 'end_time', 'slot_type'],
              required: false
            },
          ],
          attributes: ['id', 'day', 'subject_id', 'period_slot_id', 'faculty_id', 'start_time', 'end_time', 'master_id', 'session_type'],
        },
        { model: ClassModel, as: 'class', attributes: ['id', 'name', 'section'] },
      ],
      attributes: ['id', 'class_id', 'academic_year'],
      raw: false,
    });

    // Fetch dynamic slot timing overrides across active masters
    const activeMasterIds = timetableMasters.map(m => m.id);
    const masterPeriodTimingMap = new Map();
    if (activeMasterIds.length > 0) {
      const timingOverrides = await TimetableMasterSlots.findAll({
        where: {
          master_id: { [Op.in]: activeMasterIds },
          start_time: { [Op.ne]: null },
          end_time: { [Op.ne]: null }
        },
        attributes: ['master_id', 'period_slot_id', 'start_time', 'end_time'],
        raw: true
      });
      timingOverrides.forEach(to => {
        const key = `${to.master_id}_${to.period_slot_id}`;
        if (!masterPeriodTimingMap.has(key)) {
          masterPeriodTimingMap.set(key, { start_time: to.start_time, end_time: to.end_time });
        }
      });
    }

    // Format response ensuring class-specific period slot keys are preserved
    const uniqueSlots = {};
    timetableMasters.forEach(master => {
      master.slots.forEach(slot => {
        // Include any slot that has a subject assigned to it (not an unassigned break)
        const hasSubject = !!slot.subject?.id;
        const isPureBreak = slot.session_type === 'break' && !hasSubject;

        if (!hasSubject || isPureBreak) return;

        const key = `${master.class_id}_${slot.period_slot_id}_${slot.id}`;
        if (!uniqueSlots[key]) {
          const timingOverride = masterPeriodTimingMap.get(`${master.id}_${slot.period_slot_id}`);
          const startTime = slot.start_time || timingOverride?.start_time || slot.period?.start_time;
          const endTime = slot.end_time || timingOverride?.end_time || slot.period?.end_time;

          uniqueSlots[key] = {
            slotId: slot.id,
            masterSlotId: slot.id,
            classSectionId: master.class_id,
            className: master.class?.name || '',
            classSection: master.class?.section || '',
            academicYear: master.academic_year,
            facultyId: slot.faculty_id,
            subjectId: slot.subject?.id,
            subjectCode: slot.subject?.subject_code,
            subjectName: slot.subject?.subject_name,
            periodId: slot.period?.id,
            periodLabel: slot.period?.period_label,
            startTime,
            endTime,
            dayOfWeek: slot.day,
          };
        }
      });
    });

    // Fetch all department classes using correct column department_id
    const deptClasses = await ClassModel.findAll({
      where: { department_id: departmentId },
      attributes: ['id', 'name', 'section'],
      order: [['name', 'ASC'], ['section', 'ASC']],
      raw: true
    });

    const classStudents = {};
    const allClassIds = [...new Set([
      ...deptClasses.map(c => c.id),
      ...Object.values(uniqueSlots).map(s => s.classSectionId)
    ])];

    for (const classId of allClassIds) {
      if (!classId || isNaN(parseInt(classId))) {
        classStudents[classId] = [];
        continue;
      }

      const students = await Student.findAll({
        where: { classId: parseInt(classId, 10) },
        attributes: ['id', 'studentId', 'firstName', 'lastName', 'rollNumber', 'photo'],
        order: [['rollNumber', 'ASC']],
        raw: true,
      });
      classStudents[classId] = students;
    }

    const classList = deptClasses.map(c => ({
      id: c.id,
      name: c.name,
      section: c.section
    }));

    res.status(200).json({
      success: true,
      date,
      dayOfWeek: dayName,
      data: {
        slots: Object.values(uniqueSlots),
        classList: classList,
        studentsByClass: classStudents,
      }
    });
  } catch (error) {
    console.error('[getDepartmentAdminClassSlots] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch class slots' });
  }
});
