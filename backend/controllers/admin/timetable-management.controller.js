import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';

const {
  TimetableMaster,
  TimetableDetails,
  TimetableStaffAlteration,
  FacultyLeaveSchedule,
  PeriodConfig,
  YearBreakTiming,
  Department,
  Class,
  Subject,
  Faculty,
  User
} = models;

// @desc      Get all timetables with filters
// @route     GET /api/v1/timetable/management
// @access    Private
export const getTimetables = asyncHandler(async (req, res, next) => {
  try {
    const { department_id, academic_year, semester, year, status } = req.query;
    const where = {};

    if (department_id) where.department_id = parseInt(department_id);
    if (academic_year) where.academic_year = academic_year;
    if (semester) where.semester = semester;
    if (year) where.year = year;
    if (status) where.status = status;

    const timetables = await TimetableMaster.findAll({
      where,
      include: [
        { model: Department, as: 'department', attributes: ['id', 'short_name'] },
        { model: User, as: 'incharge', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, data: timetables });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc      Get single timetable with details
// @route     GET /api/v1/timetable/management/:id
// @access    Private
export const getTimetableById = asyncHandler(async (req, res, next) => {
  try {
    const timetable = await TimetableMaster.findByPk(req.params.id, {
      include: [
        { model: Department, as: 'department' },
        {
          model: TimetableDetails,
          as: 'details',
          include: [
            { model: Class, as: 'class' },
            { model: Subject, as: 'subject' },
            { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'first_name', 'last_name'] }
          ],
          order: [['day_of_week', 'ASC'], ['period_number', 'ASC']]
        }
      ]
    });

    if (!timetable) {
      return next(new ErrorResponse('Timetable not found', 404));
    }

    // Get period configuration
    const periods = await PeriodConfig.findAll({
      where: { department_id: timetable.department_id }
    });

    res.status(200).json({
      success: true,
      data: {
        timetable,
        periods
      }
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc      Create new timetable
// @route     POST /api/v1/timetable/management
// @access    Private/SuperAdmin
export const createTimetable = asyncHandler(async (req, res, next) => {
  try {
    const {
      name,
      academic_year,
      semester,
      department_id,
      year,
      timetable_incharge_id,
      periods
    } = req.body;

    if (!name || !academic_year || !semester || !department_id) {
      return next(new ErrorResponse('Missing required fields', 400));
    }

    // Create timetable master
    const timetable = await TimetableMaster.create({
      name,
      academic_year,
      semester,
      department_id: parseInt(department_id),
      year,
      timetable_incharge_id: timetable_incharge_id ? parseInt(timetable_incharge_id) : null,
      status: 'draft',
      created_by: req.user.id
    });

    // Create period details
    if (periods && Array.isArray(periods)) {
      for (const period of periods) {
        await TimetableDetails.create({
          timetable_id: timetable.id,
          class_id: period.class_id,
          day_of_week: period.day_of_week,
          period_number: period.period_number,
          subject_id: period.subject_id || null,
          faculty_id: period.faculty_id || null,
          room_number: period.room_number || null,
          period_type: period.period_type || 'lecture',
          is_break: period.is_break || false,
          status: 'pending'
        });
      }
    }

    // Reload with associations
    const createdTimetable = await TimetableMaster.findByPk(timetable.id, {
      include: [
        { model: Department, as: 'department' },
        { model: TimetableDetails, as: 'details' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Timetable created successfully',
      data: createdTimetable
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc      Bulk upload timetable details
// @route     POST /api/v1/timetable/management/bulk-upload
// @access    Private/SuperAdmin
export const bulkUploadTimetable = asyncHandler(async (req, res, next) => {
  try {
    const { timetable_id, details } = req.body;

    if (!timetable_id || !details || !Array.isArray(details)) {
      return next(new ErrorResponse('Invalid request format', 400));
    }

    const timetable = await TimetableMaster.findByPk(timetable_id);
    if (!timetable) {
      return next(new ErrorResponse('Timetable not found', 404));
    }

    const results = {
      successful: [],
      failed: [],
      total: details.length
    };

    for (let i = 0; i < details.length; i++) {
      const detail = details[i];
      const rowNumber = i + 1;

      try {
        if (!detail.class_id || !detail.day_of_week || !detail.period_number) {
          throw new Error('Missing required fields: class_id, day_of_week, period_number');
        }

        const timetableDetail = await TimetableDetails.create({
          timetable_id: timetable_id,
          class_id: parseInt(detail.class_id),
          day_of_week: detail.day_of_week,
          period_number: parseInt(detail.period_number),
          subject_id: detail.subject_id ? parseInt(detail.subject_id) : null,
          faculty_id: detail.faculty_id ? parseInt(detail.faculty_id) : null,
          room_number: detail.room_number || null,
          period_type: detail.period_type || 'lecture',
          is_break: detail.is_break ? true : false,
          status: 'pending'
        });

        results.successful.push({
          row: rowNumber,
          class_id: detail.class_id,
          day: detail.day_of_week,
          message: 'Period added successfully'
        });
      } catch (error) {
        results.failed.push({
          row: rowNumber,
          error: error.message
        });
      }
    }

    res.status(207).json({
      success: true,
      message: `Bulk upload completed. ${results.successful.length} successful, ${results.failed.length} failed`,
      data: results
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc      Get faculty timetable (personal)
// @route     GET /api/v1/timetable/management/faculty/:faculty_id
// @access    Private
export const getFacultyTimetable = asyncHandler(async (req, res, next) => {
  try {
    const { faculty_id } = req.params;
    const { academic_year, semester } = req.query;

    const where = {
      faculty_id: parseInt(faculty_id)
    };

    const timetableDetails = await TimetableDetails.findAll({
      where,
      include: [
        {
          model: TimetableMaster,
          as: 'timetable',
          where: {
            ...(academic_year && { academic_year }),
            ...(semester && { semester })
          },
          include: [{ model: Department, as: 'department' }]
        },
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' }
      ],
      order: [['day_of_week', 'ASC'], ['period_number', 'ASC']]
    });

    // Check for leaves on that date
    const currentDate = new Date();
    const facultyLeaves = await FacultyLeaveSchedule.findAll({
      where: {
        faculty_id: parseInt(faculty_id),
        is_active: true,
        from_date: { [Op.lte]: currentDate },
        to_date: { [Op.gte]: currentDate }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        timetable: timetableDetails,
        leaves: facultyLeaves,
        isOnLeave: facultyLeaves.length > 0
      }
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc      Get class/student timetable
// @route     GET /api/v1/timetable/management/class/:class_id/timetable/:timetable_id
// @access    Private
export const getClassTimetable = asyncHandler(async (req, res, next) => {
  try {
    const { class_id, timetable_id } = req.params;

    const timetableDetails = await TimetableDetails.findAll({
      where: {
        class_id: parseInt(class_id),
        timetable_id: parseInt(timetable_id)
      },
      include: [
        { model: Subject, as: 'subject' },
        { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'first_name', 'last_name'] }
      ],
      order: [['day_of_week', 'ASC'], ['period_number', 'ASC']]
    });

    // Get break timings for this year
    const classData = await Class.findByPk(class_id);
    const timetable = await TimetableMaster.findByPk(timetable_id);

    const breakTimings = await YearBreakTiming.findAll({
      where: {
        department_id: classData.department_id,
        year: classData.semester <= 2 ? '1st' : classData.semester <= 4 ? '2nd' : classData.semester <= 6 ? '3rd' : '4th'
      },
      order: [['break_number', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: {
        timetable: timetableDetails,
        breakTimings,
        classInfo: classData
      }
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc      Request staff alteration (send to alternative faculty)
// @route     POST /api/v1/timetable/management/alter-staff
// @access    Private/SuperAdmin
export const alterStaff = asyncHandler(async (req, res, next) => {
  try {
    const {
      timetable_id,
      timetable_detail_id,
      original_faculty_id,
      alternative_faculty_id,
      reason
    } = req.body;

    if (!timetable_id || !timetable_detail_id || !alternative_faculty_id || !reason) {
      return next(new ErrorResponse('Missing required fields', 400));
    }

    // Create alteration request
    const alteration = await TimetableStaffAlteration.create({
      timetable_id: parseInt(timetable_id),
      timetable_detail_id: parseInt(timetable_detail_id),
      original_faculty_id: parseInt(original_faculty_id),
      alternative_faculty_id: parseInt(alternative_faculty_id),
      reason,
      requested_by: req.user.id,
      status: 'pending'
    });

    // Send notification to alternative faculty
    // TODO: Implement notification service

    res.status(201).json({
      success: true,
      message: 'Staff alteration request sent to alternative faculty',
      data: alteration
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc      Accept staff alteration
// @route     PUT /api/v1/timetable/management/alter-staff/:id/accept
// @access    Private
export const acceptStaffAlteration = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const alteration = await TimetableStaffAlteration.findByPk(id);
    if (!alteration) {
      return next(new ErrorResponse('Alteration request not found', 404));
    }

    if (alteration.status !== 'pending') {
      return next(new ErrorResponse('Alteration request is not pending', 400));
    }

    // Update alteration status
    alteration.status = 'accepted';
    alteration.alternative_response = response || null;
    alteration.accepted_at = new Date();
    await alteration.save();

    // Update timetable detail with new faculty
    const timetableDetail = await TimetableDetails.findByPk(alteration.timetable_detail_id);
    if (timetableDetail) {
      timetableDetail.faculty_id = alteration.alternative_faculty_id;
      await timetableDetail.save();
    }

    res.status(200).json({
      success: true,
      message: 'Staff change accepted successfully',
      data: alteration
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc      Reject staff alteration
// @route     PUT /api/v1/timetable/management/alter-staff/:id/reject
// @access    Private
export const rejectStaffAlteration = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const alteration = await TimetableStaffAlteration.findByPk(id);
    if (!alteration) {
      return next(new ErrorResponse('Alteration request not found', 404));
    }

    if (alteration.status !== 'pending') {
      return next(new ErrorResponse('Alteration request is not pending', 400));
    }

    alteration.status = 'rejected';
    alteration.alternative_response = reason || 'Request rejected';
    await alteration.save();

    res.status(200).json({
      success: true,
      message: 'Staff alteration request rejected',
      data: alteration
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc      Get period configuration
// @route     GET /api/v1/timetable/management/periods/:department_id
// @access    Private
export const getPeriodConfig = asyncHandler(async (req, res, next) => {
  try {
    const { department_id } = req.params;

    const periods = await PeriodConfig.findAll({
      where: {
        department_id: department_id === 'global' ? null : parseInt(department_id),
        status: 'active'
      },
      order: [['period_number', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: periods
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc      Create/Update period configuration
// @route     POST /api/v1/timetable/management/periods
// @access    Private/SuperAdmin
export const createPeriodConfig = asyncHandler(async (req, res, next) => {
  try {
    const { department_id, periods } = req.body;

    if (!periods || !Array.isArray(periods)) {
      return next(new ErrorResponse('Periods must be an array', 400));
    }

    // Delete existing periods for this department
    if (department_id) {
      await PeriodConfig.destroy({
        where: { department_id: parseInt(department_id) }
      });
    }

    const createdPeriods = [];
    for (const period of periods) {
      const created = await PeriodConfig.create({
        department_id: department_id ? parseInt(department_id) : null,
        period_number: period.period_number,
        start_time: period.start_time,
        end_time: period.end_time,
        duration_minutes: period.duration_minutes,
        is_break: period.is_break || false,
        break_name: period.break_name || null
      });
      createdPeriods.push(created);
    }

    res.status(201).json({
      success: true,
      message: 'Period configuration created successfully',
      data: createdPeriods
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc      Get staff leave notifications
// @route     GET /api/v1/timetable/management/staff-alterations/pending
// @access    Private
export const getPendingStaffAlterations = asyncHandler(async (req, res, next) => {
  try {
    const alterations = await TimetableStaffAlteration.findAll({
      where: { status: 'pending' },
      include: [
        { model: TimetableMaster, as: 'timetable' },
        { model: TimetableDetails, as: 'timetable_detail', include: [{ model: Subject, as: 'subject' }] },
        { model: Faculty, as: 'original_faculty', attributes: ['faculty_id', 'Name'] },
        { model: Faculty, as: 'alternative_faculty', attributes: ['faculty_id', 'Name'] },
        { model: User, as: 'requester', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: alterations
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
});

export default {
  getTimetables,
  getTimetableById,
  createTimetable,
  bulkUploadTimetable,
  getFacultyTimetable,
  getClassTimetable,
  alterStaff,
  acceptStaffAlteration,
  rejectStaffAlteration,
  getPeriodConfig,
  createPeriodConfig,
  getPendingStaffAlterations
};
