import initModels from '../../models/index.js';

const { StudentAttendance, AttendanceStudent, Student, Subject, Class, PeriodSlot, TimetableMasterSlots, TimetableMaster, CourseLessonPlan } = initModels();

// Simple error response helper
const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, error: message });
};

/**
 * PERIOD CONFIGURATION
 * Period slot IDs to skip (breaks): 3 (Tea Break), 5 (Lunch), 8 (Short Break)
 */
const TEACHING_PERIODS = [1, 2, 4, 6, 7, 9, 10]; // Excluding breaks

/**
 * Get period slots configuration
 */
export const getPeriodSlots = async (req, res) => {
  try {
    const periods = await PeriodSlot.findAll({
      order: [['id', 'ASC']],
    });

    const formattedPeriods = periods.map(p => ({
      id: p.id,
      label: p.period_label || `Period ${p.id}`,
      startTime: p.start_time,
      endTime: p.end_time,
      isTeachingPeriod: TEACHING_PERIODS.includes(p.id),
      type: TEACHING_PERIODS.includes(p.id) ? 'teaching' : 'break'
    }));

    res.json({
      success: true,
      data: formattedPeriods,
    });
  } catch (error) {
    console.error('[getPeriodSlots] Error:', error);
    return errorResponse(res, 500, 'Failed to fetch period slots');
  }
};

/**
 * Mark attendance for a class (period-wise)
 * Body: {
 *   classDate: "2024-03-20",
 *   classSectionId: 1,
 *   subjectId: 1,
 *   periodSlotId: 1,
 *   attendance: { studentId: "Present/Absent/Late/On-Duty", ... }
 * }
 */
export const markPeriodAttendance = async (req, res) => {
  try {
    const { classDate, classSectionId, subjectId, periodSlotId, attendance } = req.body;
    const facultyId = req.user.facultyId;

    // Validate required fields
    if (!classDate || !classSectionId || !subjectId || !periodSlotId || !attendance) {
      return errorResponse(res, 400, 'Missing required fields');
    }

    // Check if it's a break period
    if (!TEACHING_PERIODS.includes(parseInt(periodSlotId))) {
      return errorResponse(res, 400, 'Cannot mark attendance for break periods');
    }

    const attendanceRecords = [];
    let failedCount = 0;

    for (const [studentId, status] of Object.entries(attendance)) {
      try {
        const student = await Student.findByPk(parseInt(studentId));
        if (!student) {
          failedCount++;
          continue;
        }

        // Create or update attendance record
        const [record, created] = await AttendanceStudent.findOrCreate({
          where: {
            student_id: parseInt(studentId),
            subject_id: parseInt(subjectId),
            class_section_id: parseInt(classSectionId),
            class_date: new Date(classDate),
            period_session_number: parseInt(periodSlotId),
          },
          defaults: {
            faculty_id: facultyId,
            attendance_status: status,
            marked_timestamp: new Date(),
          },
        });

        // Update if already exists
        if (!created) {
          record.attendance_status = status;
          record.marked_timestamp = new Date();
          await record.save();
        }

        attendanceRecords.push({
          studentId,
          status,
          created: created,
        });
      } catch (err) {
        console.error(`[markPeriodAttendance] Error for student ${studentId}:`, err);
        failedCount++;
      }
    }

    res.json({
      success: true,
      message: `Attendance marked for period ${periodSlotId}`,
      data: {
        total: Object.keys(attendance).length,
        successful: attendanceRecords.length,
        failed: failedCount,
        records: attendanceRecords,
      },
    });
  } catch (error) {
    console.error('[markPeriodAttendance] Error:', error);
    return errorResponse(res, 500, 'Failed to mark attendance');
  }
};

/**
 * Get class attendance summary for a date and subject
 */
export const getClassAttendanceSummary = async (req, res) => {
  try {
    const { classDate, classSectionId, subjectId } = req.query;

    if (!classDate || !classSectionId || !subjectId) {
      return errorResponse(res, 400, 'Missing required parameters');
    }

    // Get all attendance records for this class and subject on this date
    const attendanceRecords = await AttendanceStudent.findAll({
      where: {
        class_date: new Date(classDate),
        class_section_id: parseInt(classSectionId),
        subject_id: parseInt(subjectId),
      },
      include: [
        { model: Student, as: 'student', attributes: ['student_id', 'first_name', 'last_name', 'roll_number'] },
        { model: PeriodSlot, as: 'period', attributes: ['id', 'period_label'] },
      ],
      order: [['period_session_number', 'ASC'], ['student_id', 'ASC']],
    });

    // Group by period
    const groupedByPeriod = {};
    attendanceRecords.forEach(record => {
      const periodId = record.period_session_number;
      if (!groupedByPeriod[periodId]) {
        groupedByPeriod[periodId] = [];
      }
      groupedByPeriod[periodId].push({
        studentId: record.student_id,
        studentName: `${record.student.first_name} ${record.student.last_name}`,
        rollNumber: record.student.roll_number,
        status: record.attendance_status,
        markedAt: record.marked_timestamp,
      });
    });

    res.json({
      success: true,
      data: {
        classDate,
        classSectionId,
        subjectId,
        attendanceByPeriod: groupedByPeriod,
      },
    });
  } catch (error) {
    console.error('[getClassAttendanceSummary] Error:', error);
    return errorResponse(res, 500, 'Failed to fetch attendance summary');
  }
};

/**
 * Get student attendance for a semester/subject
 */
export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.query.studentId;
    const { semester, academicYear } = req.query;

    if (!studentId) {
      return errorResponse(res, 400, 'Student ID is required');
    }

    const student = await Student.findByPk(parseInt(studentId));
    if (!student) {
      return errorResponse(res, 404, 'Student not found');
    }

    // Determine target semester
    const targetSemester = semester ? parseInt(semester) : student.semester;
    const targetAcademicYear = academicYear || new Date().getFullYear().toString();

    // Pre-populate stats with all subjects for this semester
    const enrolledSubjects = await Subject.findAll({
      where: {
        department_id: student.departmentId,
        semester: targetSemester
      }
    });

    const subjectWiseStats = {};
    enrolledSubjects.forEach(subject => {
      subjectWiseStats[subject.id] = {
        subjectId: subject.id,
        subjectName: subject.subject_name ? subject.subject_name.trim() : 'Unknown',
        subjectCode: subject.subject_code || 'Unknown',
        totalPeriodsRequired: 0, // Total periods from course plan
        attended: 0, // Periods marked with present/od/late/medical_leave/duty_leave
        percentage: 0,
      };
    });

    // Fetch course plan periods for each subject
    const coursePlans = await CourseLessonPlan.findAll({
      where: {
        semester: targetSemester,
        // Optional: filter by academic year if provided
        ...(academicYear ? { academic_year: academicYear } : {})
      },
      attributes: ['subject_id', 'periods_required'],
      raw: true,
    });

    // Build a map of total periods by subject (sum all periods_required per subject)
    const subjectPeriodsTotalMap = {};
    coursePlans.forEach(plan => {
      if (!subjectPeriodsTotalMap[plan.subject_id]) {
        subjectPeriodsTotalMap[plan.subject_id] = 0;
      }
      subjectPeriodsTotalMap[plan.subject_id] += (plan.periods_required || 1);
    });

    // Initialize with course plan periods
    Object.keys(subjectWiseStats).forEach(subjectId => {
      const periodTotal = subjectPeriodsTotalMap[subjectId] || 0;
      subjectWiseStats[subjectId].totalPeriodsRequired = periodTotal;
    });

    // Get all attendance records for this student and semester
    let query = {
      student_id: parseInt(studentId),
      semester: targetSemester
    };
    
    const records = await StudentAttendance.findAll({
      where: query,
      include: [
        { model: Subject, as: 'subject', attributes: ['id', 'subject_code', 'subject_name'] },
        { model: Class, as: 'class', attributes: ['id', 'section'] },
        { model: PeriodSlot, as: 'period', attributes: ['id', 'period_label', 'start_time', 'end_time'] },
      ],
      order: [['attendance_date', 'DESC'], ['period_slot_id', 'ASC']],
    });

    // Count attended periods
    records.forEach(record => {
      const subjectId = record.subject_id;
      
      // Initialize if subject not in stats (shouldn't happen, but just in case)
      if (!subjectWiseStats[subjectId]) {
        subjectWiseStats[subjectId] = {
          subjectId,
          subjectName: record.subject?.subject_name || 'Unknown',
          subjectCode: record.subject?.subject_code || 'N/A',
          totalPeriodsRequired: subjectPeriodsTotalMap[subjectId] || 0,
          attended: 0,
          percentage: 0,
        };
      }

      const stats = subjectWiseStats[subjectId];

      // Count as attended if status is present, late, od, medical_leave, or duty_leave
      if (['present', 'late', 'od', 'medical_leave', 'duty_leave'].includes(record.status)) {
        stats.attended++;
      }
    });

    // Calculate percentages based on course plan periods
    Object.keys(subjectWiseStats).forEach(subjectId => {
      const stats = subjectWiseStats[subjectId];
      if (stats.totalPeriodsRequired > 0) {
        const calculatedPercentage = (stats.attended / stats.totalPeriodsRequired) * 100;
        // Cap at 100% - attendance can't be more than 100%
        stats.percentage = Math.min(Math.round(calculatedPercentage), 100);
      }
    });

    // Return all subjects (even those without course plans)
    const allStats = Object.values(subjectWiseStats);

    res.json({
      success: true,
      data: {
        studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
        subjectWiseStats: allStats,
        totalRecords: records.length,
      },
    });
  } catch (error) {
    console.error('[getStudentAttendance] Error:', error);
    return errorResponse(res, 500, 'Failed to fetch student attendance');
  }
};

/**
 * Get attendance report for a class
 */
export const getClassAttendanceReport = async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;

    if (!classId) {
      return errorResponse(res, 400, 'Class ID is required');
    }

    const query = {
      class_section_id: parseInt(classId),
    };

    if (startDate && endDate) {
      query.class_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const records = await AttendanceStudent.findAll({
      where: query,
      include: [
        { model: Student, as: 'student', attributes: ['student_id', 'first_name', 'last_name', 'roll_number'] },
        { model: Subject, as: 'subject', attributes: ['id', 'subject_code', 'subject_name'] },
        { model: PeriodSlot, as: 'period', attributes: ['id', 'period_label'] },
      ],
      order: [['student_id', 'ASC'], ['class_date', 'DESC'], ['period_session_number', 'ASC']],
    });

    // Group by student and calculate statistics
    const studentStats = {};
    records.forEach(record => {
      const studentId = record.student_id;
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          studentId,
          studentName: `${record.student.first_name} ${record.student.last_name}`,
          rollNumber: record.student.roll_number,
          totalClasses: 0,
          present: 0,
          absent: 0,
          late: 0,
          onDuty: 0,
          percentage: 0,
          subjectWise: {},
        };
      }

      const stats = studentStats[studentId];
      stats.totalClasses++;

      switch (record.attendance_status) {
        case 'Present':
          stats.present++;
          break;
        case 'Absent':
          stats.absent++;
          break;
        case 'Late':
          stats.late++;
          break;
        case 'On-Duty':
          stats.onDuty++;
          break;
      }

      // Subject-wise tracking
      const subjectId = record.subject_id;
      if (!stats.subjectWise[subjectId]) {
        stats.subjectWise[subjectId] = {
          subjectId,
          subjectName: record.subject?.subject_name || 'Unknown',
          subjectCode: record.subject?.subject_code || 'Unknown',
          total: 0,
          present: 0,
          percentage: 0,
        };
      }

      const subStat = stats.subjectWise[subjectId];
      subStat.total++;
      if (record.attendance_status === 'Present') {
        subStat.present++;
      }
    });

    // Calculate percentages
    Object.keys(studentStats).forEach(studentId => {
      const stats = studentStats[studentId];
      if (stats.totalClasses > 0) {
        stats.percentage = Math.round((stats.present / stats.totalClasses) * 100);
      }

      // Calculate subject-wise percentages
      Object.keys(stats.subjectWise).forEach(subjectId => {
        const subStat = stats.subjectWise[subjectId];
        if (subStat.total > 0) {
          subStat.percentage = Math.round((subStat.present / subStat.total) * 100);
        }
      });
    });

    res.json({
      success: true,
      data: {
        classId,
        startDate,
        endDate,
        studentStats: Object.values(studentStats),
        totalStudents: Object.keys(studentStats).length,
        totalRecords: records.length,
      },
    });
  } catch (error) {
    console.error('[getClassAttendanceReport] Error:', error);
    return errorResponse(res, 500, 'Failed to fetch attendance report');
  }
};

/**
 * Get teaching periods configuration
 */
export const getTeachingPeriods = async (req, res) => {
  try {
    const periods = await PeriodSlot.findAll({
      where: {
        id: TEACHING_PERIODS,
      },
      order: [['id', 'ASC']],
      attributes: ['id', 'period_label', 'start_time', 'end_time'],
    });

    res.json({
      success: true,
      data: periods,
      teachingPeriodIds: TEACHING_PERIODS,
    });
  } catch (error) {
    console.error('[getTeachingPeriods] Error:', error);
    return errorResponse(res, 500, 'Failed to fetch teaching periods');
  }
};
