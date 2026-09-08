import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models, sequelize } from '../../models/index.js';
import { Op, QueryTypes } from 'sequelize';

const {
  TimetableMaster,
  TimetableMasterSlots,
  Student,
  Faculty,
  Class: ClassModel,
  Subject,
  PeriodSlot,
  Department,
} = models;

/**
 * @desc    Get class timetable for students
 * @route   GET /api/v1/timetable/class/:classId
 * @access  Private - Students of that class
 *
 * Uses v_effective_timetable view which merges master slots with overlays
 * Returns the weekly schedule with period information
 */
export const getClassTimetable = asyncHandler(async (req, res, next) => {
  try {
    const { classId } = req.params;

    const sql = `
      SELECT 
        s.id,
        s.day,
        s.period_slot_id as hour,
        p.id as period_id,
        p.period_label,
        COALESCE(s.start_time, p.start_time) as start_time,
        COALESCE(s.end_time, p.end_time) as end_time,
        sub.id as subject_id,
        COALESCE(sub.subject_name, 'Subject') as subject_name,
        COALESCE(sub.subject_code, '') as subject_code,
        fp.faculty_id,
        COALESCE(fp.Name, '') as faculty_name,
        c.id as class_id,
        c.name as class_name,
        c.section,
        d.id as department_id,
        d.short_name as dept_code,
        d.full_name as dept_name,
        tm.id as master_id,
        tm.academic_year,
        tm.semester,
        s.session_type,
        s.room
      FROM timetable_master_slots s
      INNER JOIN timetable_master tm ON s.master_id = tm.id
      INNER JOIN classes c ON tm.class_id = c.id
      LEFT JOIN departments d ON tm.department_id = d.id
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN period_slots p ON s.period_slot_id = p.id
      LEFT JOIN faculty_profiles fp ON s.faculty_id = fp.faculty_id
      WHERE tm.class_id = ?
      ORDER BY 
        CASE s.day 
          WHEN 'Monday' THEN 1 
          WHEN 'Tuesday' THEN 2 
          WHEN 'Wednesday' THEN 3 
          WHEN 'Thursday' THEN 4 
          WHEN 'Friday' THEN 5 
          WHEN 'Saturday' THEN 6 
        END ASC,
        s.period_slot_id ASC
    `;

    const rawSlots = await sequelize.query(sql, {
      replacements: [classId],
      type: QueryTypes.SELECT
    });

    const slots = rawSlots.map(slot => ({
      id: slot.id,
      day: slot.day,
      period: {
        id: slot.hour || slot.period_id || 1,
        label: slot.period_label || `Period ${slot.hour || 1}`,
        startTime: slot.start_time || '',
        endTime: slot.end_time || '',
      },
      subject: {
        id: slot.subject_id,
        name: slot.subject_name,
        code: slot.subject_code,
      },
      faculty: {
        id: slot.faculty_id,
        name: slot.faculty_name,
      },
      class: {
        id: slot.class_id,
        name: slot.class_name,
        section: slot.section,
      },
      department: {
        id: slot.department_id,
        name: slot.dept_name,
        code: slot.dept_code,
      },
      sessionType: slot.session_type || 'theory',
      room: slot.room || '',
    }));

    res.status(200).json({
      success: true,
      data: {
        timetableMaster: {
          id: rawSlots[0]?.master_id || 1,
          class: { id: classId, name: rawSlots[0]?.class_name || 'Class' },
          department: { id: rawSlots[0]?.department_id, code: rawSlots[0]?.dept_code }
        },
        slots: slots
      }
    });
  } catch (error) {
    console.error('[TimetableDisplay] Error in getClassTimetable:', error);
    next(error);
  }
});

/**
 * @desc    Get faculty individual timetable
 * @route   GET /api/v1/timetable/faculty/:facultyId
 * @access  Private - Faculty can only access their own, others need admin
 *
 * Returns all slots for a faculty across all active timetables
 * Includes both master schedule and any active overlays (alterations)
 */
export const getFacultyTimetable = asyncHandler(async (req, res, next) => {
  try {
    const { facultyId } = req.params;

    let faculty = null;
    try {
      faculty = await Faculty.findOne({
        where: {
          [Op.or]: [
            { faculty_id: facultyId },
            { id: facultyId },
            { faculty_college_code: facultyId }
          ]
        },
        attributes: ['faculty_id', 'Name', 'email', 'department_id', 'faculty_college_code']
      });
    } catch (e) {
      console.warn('[TimetableDisplay] Faculty lookup exception:', e);
    }

    const targetFacultyId = faculty ? faculty.faculty_id : facultyId;

    const sql = `
      SELECT 
        s.id,
        s.day,
        s.period_slot_id as hour,
        p.id as period_id,
        p.period_label,
        COALESCE(s.start_time, p.start_time) as start_time,
        COALESCE(s.end_time, p.end_time) as end_time,
        sub.id as subject_id,
        COALESCE(sub.subject_name, 'Subject') as subject_name,
        COALESCE(sub.subject_code, '') as subject_code,
        c.id as class_id,
        c.name as class_name,
        c.section,
        d.id as department_id,
        d.short_name as dept_code,
        d.full_name as dept_name,
        tm.id as master_id,
        tm.academic_year,
        tm.semester,
        s.session_type,
        s.room
      FROM timetable_master_slots s
      INNER JOIN timetable_master tm ON s.master_id = tm.id
      INNER JOIN classes c ON tm.class_id = c.id
      LEFT JOIN departments d ON tm.department_id = d.id
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN period_slots p ON s.period_slot_id = p.id
      WHERE (s.faculty_id = ? OR s.faculty_id = ?)
      ORDER BY 
        CASE s.day 
          WHEN 'Monday' THEN 1 
          WHEN 'Tuesday' THEN 2 
          WHEN 'Wednesday' THEN 3 
          WHEN 'Thursday' THEN 4 
          WHEN 'Friday' THEN 5 
          WHEN 'Saturday' THEN 6 
        END ASC,
        s.period_slot_id ASC
    `;

    const rawSlots = await sequelize.query(sql, {
      replacements: [targetFacultyId, facultyId],
      type: QueryTypes.SELECT
    });

    const slots = rawSlots.map(slot => ({
      id: slot.id,
      day: slot.day,
      period: {
        id: slot.hour || slot.period_id || 1,
        label: slot.period_label || `Period ${slot.hour || 1}`,
        startTime: slot.start_time || '',
        endTime: slot.end_time || '',
      },
      subject: {
        id: slot.subject_id,
        name: slot.subject_name,
        code: slot.subject_code,
      },
      class: {
        id: slot.class_id,
        name: slot.class_name,
        section: slot.section,
      },
      department: {
        id: slot.department_id,
        name: slot.dept_name,
        code: slot.dept_code,
      },
      sessionType: slot.session_type || 'theory',
      room: slot.room || '',
    }));

    res.status(200).json({
      success: true,
      faculty: {
        id: faculty ? faculty.faculty_id : facultyId,
        name: faculty ? faculty.Name : 'Faculty',
        email: faculty ? faculty.email : '',
        department_id: faculty ? faculty.department_id : null,
      },
      timetables: [{
        id: 1,
        slots: slots
      }],
      slots: slots,
      totalClasses: slots.length
    });
  } catch (error) {
    console.error('[TimetableDisplay] Error in getFacultyTimetable:', error);
    next(error);
  }
});

/**
 * @desc    Get my timetable (logged-in faculty)
 * @route   GET /api/v1/timetable/my-timetable
 * @access  Private - Faculty only
 */
export const getMyTimetable = asyncHandler(async (req, res, next) => {
  try {
    console.log('[TimetableDisplay] getMyTimetable called for user:', req.user);

    const facultyId = req.user.faculty_id || req.user.id;

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID not found in session'
      });
    }

    // Call getFacultyTimetable logic
    const { academicYear, semester } = req.query;

    const faculty = await Faculty.findByPk(facultyId, {
      attributes: ['faculty_id', 'Name', 'email', 'department_id']
    });

    if (!faculty) {
      console.log('[TimetableDisplay] Faculty not found for ID:', facultyId);
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found'
      });
    }

    console.log('[TimetableDisplay] Found faculty:', faculty.Name);

    let masterWhere = { status: 'active' };
    if (academicYear) masterWhere.academic_year = academicYear;
    if (semester) masterWhere.semester = semester;

    console.log('[TimetableDisplay] Querying timetables with:', masterWhere);

    const timetables = await TimetableMaster.findAll({
      where: masterWhere,
      attributes: ['id', 'class_id', 'academic_year', 'semester', 'semester_type', 'batch', 'room_no', 'effective_from'],
      include: [
        {
          model: ClassModel,
          as: 'class',
          attributes: ['id', 'name', 'semester', 'batch'],
          required: false
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'full_name', 'short_name'],
          required: false
        },
        {
          model: TimetableMasterSlots,
          as: 'slots',
          attributes: ['id', 'day', 'period_slot_id', 'subject_id', 'faculty_id', 'session_type', 'room', 'notes'],
          where: { faculty_id: facultyId },
          required: false,
          include: [
            {
              model: Subject,
              as: 'subject',
              attributes: ['id', 'subject_name', 'subject_code'],
              required: false
            },
            {
              model: PeriodSlot,
              as: 'period',
              attributes: ['id', 'period_label', 'start_time', 'end_time'],
              required: false
            },
          ]
        }
      ],
      subQuery: false,
      raw: false
    });

    console.log('[TimetableDisplay] Found timetables:', timetables.length);

    const formattedTimetables = timetables
      .filter(tt => tt.slots && tt.slots.length > 0) // Only return timetables with slots for this faculty
      .map(tt => {
        try {
          return {
            id: tt.id,
            class: tt.class ? {
              id: tt.class.id,
              name: tt.class.name,
              batch: tt.class.batch,
              semester: tt.class.semester,
            } : null,
            department: tt.department ? {
              id: tt.department.id,
              name: tt.department.full_name,
              code: tt.department.short_name,
            } : null,
            academicYear: tt.academic_year,
            semester: tt.semester,
            semesterType: tt.semester_type,
            batch: tt.batch,
            effectiveFrom: tt.effective_from ? new Date(tt.effective_from).toISOString() : null,
            slots: (tt.slots || []).map(slot => ({
              id: slot.id,
              day: slot.day,
              period: slot.period ? {
                id: slot.period.id,
                label: slot.period.period_label || `Period ${slot.period.id}`,
                startTime: slot.period.start_time,
                endTime: slot.period.end_time,
              } : null,
              subject: slot.subject ? {
                id: slot.subject.id,
                name: slot.subject.subject_name,
                code: slot.subject.subject_code,
              } : null,
              sessionType: slot.session_type,
              room: slot.room || null,
              notes: slot.notes || null,
            }))
          };
        } catch (mapError) {
          console.error('[TimetableDisplay] Error mapping timetable:', mapError);
          throw mapError;
        }
      });

    console.log('[TimetableDisplay] Returning formatted timetables:', formattedTimetables.length);

    const responseData = {
      success: true,
      faculty: {
        id: faculty.faculty_id,
        name: faculty.Name,
        email: faculty.email,
      },
      timetables: formattedTimetables,
    };

    console.log('[TimetableDisplay] Response data ready:', JSON.stringify(responseData).substring(0, 100));

    res.status(200).json(responseData);
  } catch (error) {
    console.error('[TimetableDisplay] Error in getMyTimetable:', error);
    throw error; // Let asyncHandler catch it
  }
});

/**
 * @desc    Get student class timetable (logged-in student)
 * @route   GET /api/v1/timetable-display/my-class-timetable
 * @access  Private - Student only
 */
export const getMyClassTimetable = asyncHandler(async (req, res, next) => {
  try {
    const studentId = req.user.id;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID not found in session'
      });
    }

    // Since we're delegating to getEffectiveClassTimetable, we need to import Student
    const { Student } = (await import('../../models/index.js')).models;
    const student = await Student.findByPk(studentId);

    if (!student || !student.classId) {
      return res.status(404).json({
        success: false,
        message: 'Student class not found'
      });
    }

    req.params.classId = student.classId;

    // Intercept res.json to format the response properly for the student frontend
    const originalJson = res.json;
    res.json = function (body) {
      if (body.success && body.timetableMaster) {
        return originalJson.call(this, {
          success: true,
          data: {
            student: {
              id: student.id,
              name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
              rollNo: student.rollNumber,
            },
            timetableMaster: {
              id: body.timetableMaster.id,
              class: {
                id: student.classId,
                name: body.timetableMaster.className,
                semester: body.timetableMaster.semester,
                program: ''
              },
              department: {
                id: 0,
                name: body.timetableMaster.department,
                code: body.timetableMaster.departmentCode
              },
              academicYear: body.timetableMaster.academicYear,
              semester: body.timetableMaster.semester,
              semesterType: body.timetableMaster.semesterType,
              batch: body.timetableMaster.batch,
              roomNo: body.timetableMaster.roomNo,
              effectiveFrom: body.timetableMaster.effectiveFrom,
              classCoordinator: body.timetableMaster.coordinator,
              breakPeriodIds: body.timetableMaster.breakPeriodIds
            },
            slots: body.slots
          }
        });
      }
      return originalJson.call(this, body);
    };

    return await getEffectiveClassTimetable(req, res, next);
  } catch (error) {
    console.error('[TimetableDisplay] Error in getMyClassTimetable:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

/**
 * @desc    Get effective timetable for a class on a specific date (with alteration overlay)
 * @route   GET /api/v1/timetable/view/:classId?date=YYYY-MM-DD
 * @access  Private
 *
 * Uses raw SQL joining timetable_master_slots with timetable_overlay for the requested date.
 * Returns each slot with isAlteration flag and alteration metadata (substitute/original faculty).
 */
export const getEffectiveClassTimetable = asyncHandler(async (req, res, next) => {
  try {
    const { classId } = req.params;
    const queryDate = req.query.date || new Date().toISOString().split('T')[0];

    const [masterRows] = await sequelize.query(
      `SELECT tm.id as master_id, tm.academic_year, tm.semester, tm.semester_type,
              tm.batch, tm.room_no, tm.effective_from, tm.break_period_ids,
              c.name as class_name, c.batch as class_batch,
              d.full_name as dept_name, d.short_name as dept_code,
              fp.faculty_id as coord_id, fp.Name as coord_name
       FROM timetable_master tm
       JOIN classes c ON c.id = tm.class_id
       JOIN departments d ON d.id = tm.department_id
       LEFT JOIN faculty_profiles fp ON fp.faculty_id = tm.class_coordinator_id
       WHERE tm.class_id = ? AND tm.status = 'active'
       LIMIT 1`,
      { replacements: [classId] }
    );

    if (!masterRows || masterRows.length === 0) {
      return res.status(404).json({ success: false, message: 'No active timetable found for this class' });
    }

    const master = masterRows[0];
    const masterId = master.master_id;

    const queryDateObj = new Date(queryDate);
    const dayOfWeek = queryDateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const mondayDate = new Date(queryDateObj);
    mondayDate.setDate(queryDateObj.getDate() + diffToMonday);

    const weekDates = {
      Monday: new Date(mondayDate).toISOString().split('T')[0],
      Tuesday: new Date(new Date(mondayDate).setDate(mondayDate.getDate() + 1)).toISOString().split('T')[0],
      Wednesday: new Date(new Date(mondayDate).setDate(mondayDate.getDate() + 2)).toISOString().split('T')[0],
      Thursday: new Date(new Date(mondayDate).setDate(mondayDate.getDate() + 3)).toISOString().split('T')[0],
      Friday: new Date(new Date(mondayDate).setDate(mondayDate.getDate() + 4)).toISOString().split('T')[0],
      Saturday: new Date(new Date(mondayDate).setDate(mondayDate.getDate() + 5)).toISOString().split('T')[0],
    };

    const [slots] = await sequelize.query(
      `SELECT
         tms.id as slot_id,
         tms.day,
         ps.id as period_slot_id,
         ps.slot_order,
         ps.period_label,
         COALESCE(tms.start_time, ps.start_time) as start_time,
         COALESCE(tms.end_time, ps.end_time) as end_time,
         ps.slot_type,
         ps.break_name,
         tms.session_type,
         tms.is_lab_session,
         tms.lab_group,
         tms.room,
         tms.notes,
         tms.faculty_id as original_faculty_id,
         orig_fp.Name as original_faculty_name,
         tms.subject_id as original_subject_id,
         orig_s.subject_name as original_subject_name,
         orig_s.subject_code as original_subject_code,
         tov.id as overlay_id,
         tov.substitute_faculty_id,
         sub_fp.Name as substitute_faculty_name,
         tov.substitute_subject_id,
         sub_s.subject_name as substitute_subject_name,
         tov.overlay_date,
         tov.leave_request_id,
         COALESCE(tov.substitute_faculty_id, tms.faculty_id) as effective_faculty_id,
         COALESCE(sub_fp.Name, orig_fp.Name) as effective_faculty_name,
         COALESCE(tov.substitute_subject_id, tms.subject_id) as effective_subject_id,
         COALESCE(sub_s.subject_name, orig_s.subject_name) as effective_subject_name,
         COALESCE(sub_s.subject_code, orig_s.subject_code) as effective_subject_code
       FROM timetable_master_slots tms
       JOIN period_slots ps ON ps.id = tms.period_slot_id
       LEFT JOIN timetable_overlay tov ON (
         tov.master_id = tms.master_id
         AND tov.period_slot_id = tms.period_slot_id
         AND tov.status = 'active'
         AND (
           (tms.day = 'Monday' AND tov.overlay_date = :Monday) OR
           (tms.day = 'Tuesday' AND tov.overlay_date = :Tuesday) OR
           (tms.day = 'Wednesday' AND tov.overlay_date = :Wednesday) OR
           (tms.day = 'Thursday' AND tov.overlay_date = :Thursday) OR
           (tms.day = 'Friday' AND tov.overlay_date = :Friday) OR
           (tms.day = 'Saturday' AND tov.overlay_date = :Saturday)
         )
       )
       LEFT JOIN faculty_profiles orig_fp ON orig_fp.faculty_id = tms.faculty_id
       LEFT JOIN subjects orig_s ON orig_s.id = tms.subject_id
       LEFT JOIN faculty_profiles sub_fp ON sub_fp.faculty_id = tov.substitute_faculty_id
       LEFT JOIN subjects sub_s ON sub_s.id = tov.substitute_subject_id
       WHERE tms.master_id = :masterId
       ORDER BY FIELD(tms.day,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), ps.slot_order`,
      { replacements: { ...weekDates, masterId } }
    );

    const leaveIds = [...new Set(slots.map(s => s.leave_request_id).filter(Boolean))];
    const leaveEndDates = {};
    if (leaveIds.length > 0) {
      const placeholders = leaveIds.map(() => '?').join(',');
      const [leaveRows] = await sequelize.query(
        `SELECT id, endDate as end_date FROM leaves WHERE id IN (${placeholders})`,
        { replacements: leaveIds }
      );
      leaveRows.forEach(lr => { leaveEndDates[lr.id] = lr.end_date; });
    }

    let breakPeriodIds = [];
    if (master.break_period_ids) {
      try {
        breakPeriodIds = typeof master.break_period_ids === 'string'
          ? JSON.parse(master.break_period_ids)
          : (master.break_period_ids || []);
      } catch (e) {
        breakPeriodIds = [];
      }
    }

    const formattedSlots = slots.map(slot => {
      const isAlteration = !!slot.overlay_id;
      const isTeachingSession = !!slot.effective_subject_id || ['theory', 'lab', 'tutorial', 'project', 'activity'].includes(String(slot.session_type || '').toLowerCase());
      const isBreak = !isTeachingSession && (slot.session_type === 'break' || slot.slot_type === 'break' || breakPeriodIds.includes(slot.period_slot_id));
      return {
        id: slot.slot_id,
        day: slot.day,
        period: {
          id: slot.period_slot_id,
          label: slot.period_label || (isBreak ? (slot.break_name || 'Break') : ''),
          startTime: slot.start_time,
          endTime: slot.end_time,
          slotType: isBreak ? 'break' : 'teaching',
          isBreak,
        },
        faculty: slot.effective_faculty_id ? {
          id: slot.effective_faculty_id,
          name: slot.effective_faculty_name,
        } : null,
        subject: slot.effective_subject_id ? {
          id: slot.effective_subject_id,
          name: slot.effective_subject_name,
          code: slot.effective_subject_code,
        } : null,
        sessionType: slot.session_type,
        isLabSession: !!slot.is_lab_session,
        labGroup: slot.lab_group || null,
        room: slot.room || null,
        notes: slot.notes || null,
        isAlteration,
        source: isAlteration ? 'overlay' : 'master',
        alteration: isAlteration ? {
          substituteFacultyId: slot.substitute_faculty_id,
          substituteFacultyName: slot.substitute_faculty_name,
          originalFacultyId: slot.original_faculty_id,
          originalFacultyName: slot.original_faculty_name,
          overlayDate: slot.overlay_date,
          leaveId: slot.leave_request_id,
          leaveEndDate: slot.leave_request_id ? leaveEndDates[slot.leave_request_id] : null,
        } : null,
      };
    });

    res.status(200).json({
      success: true,
      queryDate,
      timetableMaster: {
        id: masterId,
        className: master.class_name,
        batch: master.class_batch,
        department: master.dept_name,
        departmentCode: master.dept_code,
        academicYear: master.academic_year,
        semester: master.semester,
        semesterType: master.semester_type,
        roomNo: master.room_no,
        effectiveFrom: master.effective_from,
        coordinator: master.coord_id ? { id: master.coord_id, name: master.coord_name } : null,
        breakPeriodIds,
      },
      slots: formattedSlots,
      totalSlots: formattedSlots.length,
      totalAlterations: formattedSlots.filter(s => s.isAlteration).length,
    });
  } catch (error) {
    console.error('[TimetableDisplay] Error in getEffectiveClassTimetable:', error);
    throw error;
  }
});

/**
 * @desc    Get all active period slots (real-time master period definitions, times, and break types)
 * @route   GET /api/v1/timetable-display/period-slots
 * @access  Private
 */
export const getAllMasterPeriodSlots = asyncHandler(async (req, res, next) => {
  try {
    // Ensure base period_slots entries in DB have clean period numbers (1..10) and Roman labels
    try {
      await sequelize.query(`
        UPDATE period_slots 
        SET slot_type = 'teaching', break_name = NULL, period_number = id, 
            period_label = CASE id 
              WHEN 1 THEN 'I' WHEN 2 THEN 'II' WHEN 3 THEN 'III' WHEN 4 THEN 'IV' WHEN 5 THEN 'V' 
              WHEN 6 THEN 'VI' WHEN 7 THEN 'VII' WHEN 8 THEN 'VIII' WHEN 9 THEN 'IX' WHEN 10 THEN 'X' 
              ELSE period_label END 
        WHERE id BETWEEN 1 AND 10;
      `);
    } catch (e) {
      console.warn('[getAllMasterPeriodSlots] DB update notice:', e.message);
    }

    const [periodSlots] = await sequelize.query(
      `SELECT id, slot_order, slot_type, period_number, period_label, start_time, end_time, duration_minutes, break_name
       FROM period_slots
       WHERE is_active = 1
       ORDER BY slot_order ASC`
    );

    const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const formatted = periodSlots.map(ps => {
      const startStr = ps.start_time ? String(ps.start_time).substring(0, 5) : '';
      const endStr = ps.end_time ? String(ps.end_time).substring(0, 5) : '';
      const pNum = ps.period_number || ps.id;
      const label = ROMAN[pNum] || `Period ${pNum}`;

      return {
        id: ps.id,
        slotOrder: ps.slot_order,
        slotType: 'teaching',
        periodNumber: pNum,
        label,
        startTime: startStr,
        endTime: endStr,
        isBreak: false,
        breakName: null,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error('[TimetableDisplay] Error in getAllMasterPeriodSlots:', error);
    next(error);
  }
});
