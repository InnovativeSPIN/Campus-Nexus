import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
const { Attendance, FacultyAttendance, Student, AttendanceStudent, Class: ClassModel, Subject, Faculty } = models;
import { Op } from 'sequelize';

// @desc      Get all attendance records
// @route     GET /api/v1/attendance
// @access    Private
export const getAllAttendance = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  let where = {};

  if (req.query.class) {
    where.classId = req.query.class;
  }

  if (req.query.subject) {
    where.subjectId = req.query.subject;
  }

  if (req.query.faculty) {
    where.facultyId = req.query.faculty;
  }

  if (req.query.date) {
    const date = new Date(req.query.date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    where.date = { [Op.gte]: date, [Op.lt]: nextDate };
  }

  if (req.query.startDate && req.query.endDate) {
    where.date = {
      [Op.gte]: new Date(req.query.startDate),
      [Op.lte]: new Date(req.query.endDate)
    };
  }

  const total = await Attendance.count({ where });
  const attendance = await Attendance.findAll({
    where,
    include: [
      { model: ClassModel, as: 'class', attributes: ['name', 'section'] },
      { model: Subject, as: 'subject', attributes: ['name', 'code'] },
      { model: Faculty, as: 'faculty', attributes: ['firstName', 'lastName'] },
      {
        model: AttendanceStudent,
        as: 'students',
        include: [{ model: Student, as: 'student', attributes: ['firstName', 'lastName', 'rollNumber'] }]
      }
    ],
    offset: startIndex,
    limit,
    order: [['date', 'DESC']]
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
      { model: ClassModel, as: 'class', attributes: ['name', 'section'] },
      { model: Subject, as: 'subject', attributes: ['name', 'code'] },
      { model: Faculty, as: 'faculty', attributes: ['firstName', 'lastName'] },
      {
        model: AttendanceStudent,
        as: 'students',
        include: [{ model: Student, as: 'student', attributes: ['firstName', 'lastName', 'rollNumber', 'studentId'] }]
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

// @desc      Mark attendance
// @route     POST /api/v1/attendance
// @access    Private/Faculty
export const markAttendance = asyncHandler(async (req, res, next) => {
  req.body.markedById = req.user.id;

  // Check if attendance already marked for this class, subject, date, and period
  const startOfDay = new Date(new Date(req.body.date).setHours(0, 0, 0, 0));
  const endOfDay = new Date(new Date(req.body.date).setHours(23, 59, 59, 999));

  const existingAttendance = await Attendance.findOne({
    where: {
      classId: req.body.class,
      subjectId: req.body.subject,
      date: {
        [Op.gte]: startOfDay,
        [Op.lt]: endOfDay
      },
      period: req.body.period
    }
  });

  if (existingAttendance) {
    return next(new ErrorResponse('Attendance already marked for this class, subject, date, and period', 400));
  }

  const students = Array.isArray(req.body.students) ? req.body.students : [];
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

  const attendance = await Attendance.create({
    classId: req.body.class,
    subjectId: req.body.subject,
    facultyId: req.body.faculty,
    date: req.body.date,
    period: req.body.period,
    markedById: req.body.markedById,
    ...totals
  });

  if (students.length > 0) {
    const rows = students.map((student) => ({
      attendanceId: attendance.id,
      studentId: student.student,
      status: student.status || 'absent',
      remarks: student.remarks
    }));
    await AttendanceStudent.bulkCreate(rows);
  }

  res.status(201).json({
    success: true,
    data: attendance
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
      { model: Subject, as: 'subject', attributes: ['name', 'code'] },
      { model: Faculty, as: 'faculty', attributes: ['firstName', 'lastName'] },
      {
        model: AttendanceStudent,
        as: 'students',
        include: [{ model: Student, as: 'student', attributes: ['firstName', 'lastName', 'rollNumber'] }]
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
      { model: Subject, as: 'subject', attributes: ['name', 'code'] },
      { model: Faculty, as: 'faculty', attributes: ['firstName', 'lastName'] },
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
      { model: Subject, as: 'subject', attributes: ['name', 'code'] },
      { model: Faculty, as: 'faculty', attributes: ['firstName', 'lastName'] },
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
    include: [{ model: Faculty, as: 'faculty', attributes: ['firstName', 'lastName', 'employeeId'] }],
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
