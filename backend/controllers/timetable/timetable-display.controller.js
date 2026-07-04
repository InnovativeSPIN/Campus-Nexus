import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';

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
    const { academicYear, semester } = req.query;

    // If academicYear/semester not provided, get current active timetable
    let where = { class_id: classId };

    if (academicYear) where.academic_year = academicYear;
    if (semester) where.semester = semester;

    // Get the active timetable for this class
    const timetableMaster = await TimetableMaster.findOne({
      where: { ...where, status: 'active' },
      include: [
        { model: ClassModel, as: 'class', attributes: ['id', 'name', 'semester', 'batch'] },
        { model: Department, as: 'department', attributes: ['id', 'full_name', 'short_name'] },
        { model: Faculty, as: 'class_coordinator', attributes: ['faculty_id', 'Name', 'email', 'faculty_college_code'] },
        { model: Faculty, as: 'timetable_incharge', attributes: ['faculty_id', 'Name', 'email', 'faculty_college_code'] },
      ]
    });

    if (!timetableMaster) {
      return res.status(404).json({
        success: false,
        message: 'No active timetable found for this class'
      });
    }

    // Fetch slots from v_effective_timetable view or from master/overlay combined
    const slots = await TimetableMasterSlots.findAll({
      where: { master_id: timetableMaster.id },
      include: [
        { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code', 'type'] },
        { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email', 'faculty_college_code'] },
        { model: PeriodSlot, as: 'period', attributes: ['id', 'period_label', 'start_time', 'end_time'] },
      ],
      order: [
        ['day', 'ASC'], // Orders as created, you may want to use FIELD for day ordering
        [sequelize.literal('FIELD(day, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday")'), 'ASC'],
        ['period_slot_id', 'ASC'],
      ]
    });

    // Transform slots into a grid format (optional - depends on frontend needs)
    const timetableData = {
      timetableMaster: {
        id: timetableMaster.id,
        class: timetableMaster.class ? {
          id: timetableMaster.class.id,
          name: timetableMaster.class.name,
          semester: timetableMaster.class.semester,
          batch: timetableMaster.class.batch,
        } : null,
        department: timetableMaster.department ? {
          id: timetableMaster.department.id,
          name: timetableMaster.department.full_name,
          code: timetableMaster.department.short_name,
        } : null,
        academicYear: timetableMaster.academic_year,
        semester: timetableMaster.semester,
        semesterType: timetableMaster.semester_type,
        batch: timetableMaster.batch,
        roomNo: timetableMaster.room_no,
        effectiveFrom: timetableMaster.effective_from ? new Date(timetableMaster.effective_from).toISOString() : null,
        classCoordinator: timetableMaster.class_coordinator ? {
          id: timetableMaster.class_coordinator.faculty_id,
          name: timetableMaster.class_coordinator.Name,
          email: timetableMaster.class_coordinator.email,
        } : null,
        timetableIncharge: timetableMaster.timetable_incharge ? {
          id: timetableMaster.timetable_incharge.faculty_id,
          name: timetableMaster.timetable_incharge.Name,
          email: timetableMaster.timetable_incharge.email,
        } : null,
        status: timetableMaster.status,
        breakPeriodIds: timetableMaster.break_period_ids ? (
          typeof timetableMaster.break_period_ids === 'string'
            ? JSON.parse(timetableMaster.break_period_ids)
            : timetableMaster.break_period_ids
        ) : [3, 5, 8],
      },
      slots: slots.map(slot => ({
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
          type: slot.subject.type,
        } : null,
        faculty: slot.faculty ? {
          id: slot.faculty.faculty_id,
          name: slot.faculty.Name,
          email: slot.faculty.email,
        } : null,
        sessionType: slot.session_type,
        isLabSession: slot.is_lab_session,
        room: slot.room || null,
        notes: slot.notes || null,
        source: 'master', // Will be 'overlay' if from alteration
      }))
    };

    res.status(200).json({
      success: true,
      data: timetableData
    });
  } catch (error) {
    console.error('[TimetableDisplay] Error in getClassTimetable:', error);
    throw error; // Let asyncHandler catch it
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
    const { academicYear, semester } = req.query;

    // Check if faculty exists
    const faculty = await Faculty.findByPk(facultyId, {
      attributes: ['faculty_id', 'Name', 'email', 'department_id']
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Build where clause for slots
    let slotWhere = { faculty_id: facultyId };
    let masterWhere = { status: 'active' };

    if (academicYear) masterWhere.academic_year = academicYear;
    if (semester) masterWhere.semester = semester;

    // Get all active timetables this faculty is assigned to
    const timetables = await TimetableMaster.findAll({
      where: masterWhere,
      attributes: ['id', 'class_id', 'academic_year', 'semester', 'semester_type', 'batch', 'room_no', 'effective_from'],
      include: [
        { model: ClassModel, as: 'class', attributes: ['id', 'name', 'semester', 'batch'] },
        { model: Department, as: 'department', attributes: ['id', 'full_name', 'short_name'] },
        {
          model: TimetableMasterSlots,
          as: 'slots',
          attributes: ['id', 'day', 'period_slot_id', 'subject_id', 'faculty_id', 'session_type', 'room', 'notes'],
          where: slotWhere,
          required: true,
          include: [
            { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
            { model: PeriodSlot, as: 'period', attributes: ['id', 'period_label', 'start_time', 'end_time'] },
          ]
        }
      ],
      order: [
        ['academic_year', 'DESC'],
        ['semester', 'DESC'],
        [sequelize.col('class.name'), 'ASC'],
      ]
    });

    // Format response
    const formattedTimetables = timetables.map(tt => ({
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
    }));

    res.status(200).json({
      success: true,
      faculty: {
        id: faculty.faculty_id,
        name: faculty.Name,
        email: faculty.email,
        department_id: faculty.department_id,
      },
      timetables: formattedTimetables,
      totalClasses: formattedTimetables.reduce((sum, tt) => sum + (tt.slots ? tt.slots.length : 0), 0),
    });
  } catch (error) {
    console.error('[TimetableDisplay] Error in getFacultyTimetable:', error);
    throw error; // Let asyncHandler catch it
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

    // Get student's classId (note: camelCase)
    const student = await Student.findByPk(studentId);

    if (!student || !student.classId) {
      return res.status(404).json({
        success: false,
        message: 'Student class not found'
      });
    }

    // Get active timetable for this class
    const timetableMaster = await TimetableMaster.findOne({
      where: { class_id: student.classId, status: 'active' },
      include: [
        { model: ClassModel, as: 'class', attributes: ['id', 'name', 'semester', 'batch'] },
        { model: Department, as: 'department', attributes: ['id', 'full_name', 'short_name'] },
        { model: Faculty, as: 'class_coordinator', attributes: ['faculty_id', 'Name', 'email'] },
        { model: Faculty, as: 'asst_coordinator', attributes: ['faculty_id', 'Name', 'email'] },
        { model: Faculty, as: 'timetable_incharge', attributes: ['faculty_id', 'Name', 'email'] },
      ]
    });

    if (!timetableMaster) {
      return res.status(404).json({
        success: false,
        message: 'No active timetable found for your class'
      });
    }

    // Get all slots
    const slots = await TimetableMasterSlots.findAll({
      where: { master_id: timetableMaster.id },
      include: [
        { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code', 'type'] },
        { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email'] },
        { model: PeriodSlot, as: 'period', attributes: ['id', 'period_label', 'start_time', 'end_time'] },
      ],
      order: [
        [sequelize.literal('FIELD(day, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday")'), 'ASC'],
        ['period_slot_id', 'ASC'],
      ]
    });

    const timetableData = {
      student: {
        id: student.id,
        name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        rollNo: student.rollNumber,
      },
      timetableMaster: {
        id: timetableMaster.id,
        class: timetableMaster.class ? {
          id: timetableMaster.class.id,
          name: timetableMaster.class.name,
          semester: timetableMaster.class.semester,
          batch: timetableMaster.class.batch,
        } : null,
        department: timetableMaster.department ? {
          id: timetableMaster.department.id,
          name: timetableMaster.department.full_name,
          code: timetableMaster.department.short_name,
        } : null,
        academicYear: timetableMaster.academic_year,
        semester: timetableMaster.semester,
        semesterType: timetableMaster.semester_type,
        batch: timetableMaster.batch,
        roomNo: timetableMaster.room_no,
        effectiveFrom: timetableMaster.effective_from ? new Date(timetableMaster.effective_from).toISOString() : null,
        classCoordinator: timetableMaster.class_coordinator ? {
          id: timetableMaster.class_coordinator.faculty_id,
          name: timetableMaster.class_coordinator.Name,
          email: timetableMaster.class_coordinator.email,
        } : null,
        assistantCoordinator: timetableMaster.asst_coordinator ? {
          id: timetableMaster.asst_coordinator.faculty_id,
          name: timetableMaster.asst_coordinator.Name,
          email: timetableMaster.asst_coordinator.email,
        } : null,
        timetableIncharge: timetableMaster.timetable_incharge ? {
          id: timetableMaster.timetable_incharge.faculty_id,
          name: timetableMaster.timetable_incharge.Name,
          email: timetableMaster.timetable_incharge.email,
        } : null,
        status: timetableMaster.status,
        breakPeriodIds: timetableMaster.break_period_ids ? (
          typeof timetableMaster.break_period_ids === 'string'
            ? JSON.parse(timetableMaster.break_period_ids)
            : timetableMaster.break_period_ids
        ) : [3, 5, 8],
      },
      slots: slots.map(slot => ({
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
          type: slot.subject.type,
        } : null,
        faculty: slot.faculty ? {
          id: slot.faculty.faculty_id,
          name: slot.faculty.Name,
          email: slot.faculty.email,
        } : null,
        sessionType: slot.session_type,
        room: slot.room || null,
        notes: slot.notes || null,
      }))
    };

    res.status(200).json({
      success: true,
      data: timetableData
    });
  } catch (error) {
    console.error('[TimetableDisplay] Error in getMyClassTimetable:', error);
    throw error; // Let asyncHandler catch it
  }
});
