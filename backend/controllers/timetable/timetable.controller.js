import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models, sequelize } from '../../models/index.js';
const { Timetable, PeriodConfig, Faculty, Student, TimetableSlot, Department, Class: ClassModel, Subject, User, TimetableAlteration, TimetableMaster, TimetableMasterSlots, PeriodSlot } = models;
import TimetableSimple from '../../models/TimetableSimple.model.js';
import { Op, QueryTypes } from 'sequelize';

// @desc      Get all timetables
// @route     GET /api/v1/timetable
// @access    Private
export const getAllTimetables = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  let where = {};

  if (req.query.department) {
    where.departmentId = req.query.department;
  }

  if (req.query.class) {
    where.classId = req.query.class;
  }

  if (req.query.semester) {
    where.semester = parseInt(req.query.semester);
  }

  if (req.query.academicYear) {
    where.academicYear = req.query.academicYear;
  }

  if (req.query.isActive !== undefined) {
    where.isActive = req.query.isActive === 'true';
  }

  const total = await Timetable.count({ where });
  const timetables = await Timetable.findAll({
    where,
    include: [
      { model: ClassModel, as: 'class', attributes: ['name'] },
      { model: Department, as: 'department', attributes: ['name', 'code'] },
      { model: User, as: 'createdBy', attributes: ['name'] },
      {
        model: TimetableSlot,
        as: 'slots',
        include: [
          { model: Subject, as: 'subject', attributes: ['name', 'code'] },
          { model: Faculty, as: 'faculty', attributes: ['firstName', 'lastName', 'employeeId'] }
        ]
      }
    ],
    offset: startIndex,
    limit,
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: timetables.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: timetables
  });
});

// @desc      Get single timetable
// @route     GET /api/v1/timetable/:id
// @access    Private
export const getTimetable = asyncHandler(async (req, res, next) => {
  const timetable = await Timetable.findByPk(req.params.id, {
    include: [
      { model: ClassModel, as: 'class', attributes: ['name', 'room'] },
      { model: Department, as: 'department', attributes: ['name', 'code'] },
      { model: User, as: 'createdBy', attributes: ['name'] },
      {
        model: TimetableSlot,
        as: 'slots',
        include: [
          { model: Subject, as: 'subject', attributes: ['name', 'code', 'credits', 'type'] },
          { model: Faculty, as: 'faculty', attributes: ['firstName', 'lastName', 'employeeId', 'email'] }
        ]
      }
    ]
  });

  if (!timetable) {
    return next(new ErrorResponse(`Timetable not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: timetable
  });
});

// @desc      Get timetable by class
// @route     GET /api/v1/timetable/class/:classId
// @access    Private
export const getTimetableByClass = asyncHandler(async (req, res, next) => {
  const classId = req.params.classId;

  try {
    // Use raw SQL query to fetch timetable data for a specific class
    const sql = `
      SELECT 
        s.id,
        s.day,
        s.period_slot_id as hour,
        p.period_label,
        COALESCE(sub.subject_name, 'Unknown') as subject,
        COALESCE(sub.subject_code, 'N/A') as subject_code,
        c.section,
        d.short_name as department,
        CEIL(c.semester / 2) as year,
        tm.academic_year as academicYear,
        COALESCE(f.Name, '') as faculty_name,
        s.session_type as sessionType,
        s.room,
        COALESCE(s.start_time, p.start_time) as start_time,
        COALESCE(s.end_time, p.end_time) as end_time
      FROM timetable_master_slots s
      INNER JOIN timetable_master tm ON s.master_id = tm.id
      INNER JOIN classes c ON tm.class_id = c.id
      INNER JOIN departments d ON tm.department_id = d.id
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN period_slots p ON s.period_slot_id = p.id
      LEFT JOIN faculty_profiles f ON s.faculty_id = f.faculty_id
      WHERE tm.class_id = ?
      AND tm.status = 'active'
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

    const timetable = await sequelize.query(sql, {
      replacements: [classId],
      type: QueryTypes.SELECT
    });

    if (!timetable || timetable.length === 0) {
      return next(new ErrorResponse('No active timetable found for this class', 404));
    }

    // Disable caching to ensure fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.status(200).json({
      success: true,
      count: timetable.length,
      timetable: timetable
    });
  } catch (err) {
    console.error('[TIMETABLE] getTimetableByClass error:', err);
    return next(new ErrorResponse(`Failed to fetch class timetable: ${err.message}`, 500));
  }
});

// @desc      Get timetable for faculty
// @route     GET /api/v1/timetable/faculty/:facultyId
// @access    Private
export const getTimetableByFaculty = asyncHandler(async (req, res, next) => {
  const slots = await TimetableSlot.findAll({
    where: { facultyId: req.params.facultyId },
    include: [
      {
        model: Timetable,
        where: { isActive: true },
        include: [
          { model: ClassModel, as: 'class', attributes: ['name'] },
          { model: Department, as: 'department', attributes: ['name', 'code'] }
        ]
      },
      { model: Subject, as: 'subject', attributes: ['name', 'code'] },
      { model: Faculty, as: 'faculty', attributes: ['firstName', 'lastName'] }
    ]
  });

  const facultySchedule = slots.map((slot) => ({
    ...slot.toJSON(),
    class: slot.Timetable?.class,
    department: slot.Timetable?.department
  }));

  res.status(200).json({
    success: true,
    count: facultySchedule.length,
    data: facultySchedule
  });
});

// @desc      Create timetable
// @route     POST /api/v1/timetable
// @access    Private/Admin
export const createTimetable = asyncHandler(async (req, res, next) => {
  req.body.createdById = req.user.id;

  // Deactivate existing timetable for the same class
  await Timetable.update(
    { isActive: false },
    { where: { classId: req.body.class, isActive: true } }
  );

  const timetable = await Timetable.create({
    classId: req.body.class,
    departmentId: req.body.department,
    semester: req.body.semester,
    academicYear: req.body.academicYear,
    effectiveFrom: req.body.effectiveFrom,
    effectiveTo: req.body.effectiveTo,
    isActive: req.body.isActive ?? true,
    createdById: req.body.createdById
  });

  if (Array.isArray(req.body.slots) && req.body.slots.length > 0) {
    // Delete existing slots belonging to the timetable before bulkCreate
    // This prevents duplicate constraint errors (UNIQUE: timetable_id, day, start_time)
    await TimetableSlot.destroy({
      where: {
        timetableId: timetable.id
      },
      force: true
    });

    const rows = req.body.slots.map((slot) => ({
      timetableId: timetable.id,
      day: slot.day,
      period: slot.period,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subjectId: slot.subject,
      facultyId: slot.faculty,
      room: slot.room,
      type: slot.type
    }));
    await TimetableSlot.bulkCreate(rows);
  }

  res.status(201).json({
    success: true,
    data: timetable
  });
});

// @desc      Update timetable
// @route     PUT /api/v1/timetable/:id
// @access    Private/Admin
export const updateTimetable = asyncHandler(async (req, res, next) => {
  let timetable = await Timetable.findByPk(req.params.id);

  if (!timetable) {
    return next(new ErrorResponse(`Timetable not found with id of ${req.params.id}`, 404));
  }

  const updatePayload = { ...req.body };
  if (updatePayload.class) {
    updatePayload.classId = updatePayload.class;
    delete updatePayload.class;
  }
  if (updatePayload.department) {
    updatePayload.departmentId = updatePayload.department;
    delete updatePayload.department;
  }
  await Timetable.update(updatePayload, { where: { id: req.params.id } });
  timetable = await Timetable.findByPk(req.params.id);

  res.status(200).json({
    success: true,
    data: timetable
  });
});

// @desc      Delete timetable
// @route     DELETE /api/v1/timetable/:id
// @access    Private/Admin
export const deleteTimetable = asyncHandler(async (req, res, next) => {
  const timetable = await Timetable.findByPk(req.params.id);

  if (!timetable) {
    return next(new ErrorResponse(`Timetable not found with id of ${req.params.id}`, 404));
  }

  await TimetableSlot.destroy({ where: { timetableId: timetable.id } });
  await timetable.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Add slot to timetable
// @route     POST /api/v1/timetable/:id/slots
// @access    Private/Admin
export const addSlot = asyncHandler(async (req, res, next) => {
  const timetable = await Timetable.findByPk(req.params.id);

  if (!timetable) {
    return next(new ErrorResponse(`Timetable not found with id of ${req.params.id}`, 404));
  }

  // Check for conflicts
  const existingSlot = await TimetableSlot.findOne({
    where: {
      timetableId: req.params.id,
      day: req.body.day,
      period: req.body.period
    }
  });

  if (existingSlot) {
    return next(new ErrorResponse('A slot already exists for this day and period', 400));
  }

  await TimetableSlot.create({
    timetableId: req.params.id,
    day: req.body.day,
    period: req.body.period,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    subjectId: req.body.subject,
    facultyId: req.body.faculty,
    room: req.body.room,
    type: req.body.type
  });

  res.status(200).json({
    success: true,
    data: timetable
  });
});

// @desc      Update slot in timetable
// @route     PUT /api/v1/timetable/:id/slots/:slotId
// @access    Private/Admin
export const updateSlot = asyncHandler(async (req, res, next) => {
  const timetable = await Timetable.findByPk(req.params.id);

  if (!timetable) {
    return next(new ErrorResponse(`Timetable not found with id of ${req.params.id}`, 404));
  }

  const slot = await TimetableSlot.findOne({
    where: {
      id: req.params.slotId,
      timetableId: req.params.id
    }
  });

  if (!slot) {
    return next(new ErrorResponse('Slot not found', 404));
  }

  const updatePayload = { ...req.body };
  if (updatePayload.subject) {
    updatePayload.subjectId = updatePayload.subject;
    delete updatePayload.subject;
  }
  if (updatePayload.faculty) {
    updatePayload.facultyId = updatePayload.faculty;
    delete updatePayload.faculty;
  }

  await TimetableSlot.update(updatePayload, { where: { id: slot.id } });

  res.status(200).json({
    success: true,
    data: timetable
  });
});

// @desc      Remove slot from timetable
// @route     DELETE /api/v1/timetable/:id/slots/:slotId
// @access    Private/Admin
export const removeSlot = asyncHandler(async (req, res, next) => {
  const timetable = await Timetable.findByPk(req.params.id);

  if (!timetable) {
    return next(new ErrorResponse(`Timetable not found with id of ${req.params.id}`, 404));
  }

  const deleted = await TimetableSlot.destroy({
    where: {
      id: req.params.slotId,
      timetableId: req.params.id
    }
  });

  if (!deleted) {
    return next(new ErrorResponse('Slot not found', 404));
  }

  res.status(200).json({
    success: true,
    data: timetable
  });
});

// @desc      Get period configurations
// @route     GET /api/v1/timetable/config/periods
// @access    Private
export const getPeriodConfigs = asyncHandler(async (req, res, next) => {
  const configs = await PeriodConfig.findAll({ where: { isActive: true } });

  res.status(200).json({
    success: true,
    count: configs.length,
    data: configs
  });
});

// @desc      Create period configuration
// @route     POST /api/v1/timetable/config/periods
// @access    Private/Admin
export const createPeriodConfig = asyncHandler(async (req, res, next) => {
  // If this is set as default, remove default from others
  if (req.body.isDefault) {
    await PeriodConfig.update({ isDefault: false }, { where: {} });
  }

  const config = await PeriodConfig.create(req.body);

  res.status(201).json({
    success: true,
    data: config
  });
});

// @desc      Get today's schedule for logged in user
// @route     GET /api/v1/timetable/today
// @access    Private
export const getTodaySchedule = asyncHandler(async (req, res, next) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];

  let schedule = [];

  if (req.user.role === 'faculty') {
    // Get faculty's schedule for today
    const faculty = await Faculty.findOne({ where: { userId: req.user.id } });

    if (faculty) {
      const slots = await TimetableSlot.findAll({
        where: { day: today, facultyId: faculty.id },
        include: [
          {
            model: Timetable,
            where: { isActive: true },
            include: [{ model: ClassModel, as: 'class', attributes: ['name'] }]
          },
          { model: Subject, as: 'subject', attributes: ['name', 'code'] }
        ]
      });

      slots.forEach(slot => {
        schedule.push({
          ...slot.toJSON(),
          class: slot.Timetable?.class
        });
      });
    }
  } else if (req.user.role === 'student') {
    // Get student's class schedule for today
    const student = req.user; // already validated by protect middleware

    if (student && student.classId) {
      const timetable = await Timetable.findOne({
        where: {
          classId: student.classId,
          isActive: true
        }
      });

      if (timetable) {
        const slots = await TimetableSlot.findAll({
          where: { timetableId: timetable.id, day: today },
          include: [
            { model: Subject, as: 'subject', attributes: ['name', 'code'] },
            { model: Faculty, as: 'faculty', attributes: ['firstName', 'lastName'] }
          ]
        });
        schedule = slots.map(slot => slot.toJSON());

        // apply substitutions for students
        try {
          const now = new Date();
          const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          const altRecords = await TimetableAlteration.findAll({
            where: {
              created_at: { [Op.gte]: cutoff },
              [Op.or]: schedule.map(s => ({
                day: s.day,
                hour: s.hour,
                section: s.section,
                year: s.year
              }))
            }
          });
          const alts = altRecords.map(a => a.toJSON ? a.toJSON() : a);
          schedule = schedule.map(slot => {
            const matching = alts.find(alt =>
              alt.day === slot.day &&
              alt.hour === slot.hour &&
              alt.section === slot.section &&
              (alt.year === slot.year || alt.semester === slot.year)
            );
            if (matching) {
              return {
                ...slot,
                faculty: {
                  firstName: matching.newFacultyName || slot.faculty?.firstName,
                  lastName: ''
                },
                isAltered: true,
                alteredAt: matching.created_at,
                originalFacultyId: matching.old_faculty_id
              };
            }
            return slot;
          });
        } catch (err) {
          console.error('[TIMETABLE] error applying alterations to student schedule', err);
        }
      }
    }
  }

  // Sort by period number
  schedule.sort((a, b) => a.period - b.period);

  res.status(200).json({
    success: true,
    day: today,
    count: schedule.length,
    data: schedule
  });
});

// @desc      Get faculty by year for department admin
// @route     GET /api/v1/timetable/year/:year/faculties
// @access    Private/Department-Admin
export const getFacultyByYear = asyncHandler(async (req, res, next) => {
  const isDepartmentAdmin = req.user.role === 'department_admin' || req.user.role === 'department-admin' || req.user.role_id === 7;
  if (!isDepartmentAdmin) {
    return next(new ErrorResponse('Only department admin can access this feature', 403));
  }

  let { year } = req.params;
  const yearMap = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4 };
  const yearNum = yearMap[year] || parseInt(year, 10);

  // DEBUG: Log user department info
  console.log('[DEBUG] getFacultyByYear - user:', JSON.stringify({
    userId: req.user.id,
    role: req.user.role,
    department_id: req.user.department_id,
    department: req.user.department,
    departmentCode: req.user.departmentCode
  }));

  // Build a list of possible department identifiers (short_name, full_name, code)
  const deptCandidates = [];
  // req.user.department may be a string or an object
  if (req.user.department) {
    if (typeof req.user.department === 'string') deptCandidates.push(req.user.department);
    else if (typeof req.user.department === 'object') {
      if (req.user.department.short_name) deptCandidates.push(req.user.department.short_name);
      if (req.user.department.full_name) deptCandidates.push(req.user.department.full_name);
    }
  }
  if (req.user.departmentCode && typeof req.user.departmentCode === 'string') deptCandidates.push(req.user.departmentCode);
  if (req.user.department_id) {
    try {
      const deptRecord = await Department.findByPk(req.user.department_id, { attributes: ['short_name', 'full_name'] });
      if (deptRecord) {
        if (deptRecord.short_name) deptCandidates.push(deptRecord.short_name);
        if (deptRecord.full_name) deptCandidates.push(deptRecord.full_name);
      }
    } catch (err) {
      console.warn('Failed to lookup department by id:', req.user.department_id, err && err.message);
    }
  }

  // Deduplicate and sanitize
  const uniqueDepts = Array.from(new Set(deptCandidates.filter(Boolean).map(String)));

  try {
    console.log(`[TIMETABLE] Fetching faculty for year: ${year} (${yearNum}), dept candidates: ${uniqueDepts.join(',')}`);

    if (uniqueDepts.length === 0) {
      console.warn('[TIMETABLE] No department identifiers available for user; returning empty list');
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    // Build dynamic IN clause for departments
    const placeholders = uniqueDepts.map(() => '?').join(',');
    const replacements = [yearNum, ...uniqueDepts];

    const sql = `
      SELECT DISTINCT 
        f.id AS facultyId, 
        f.Name AS facultyName 
      FROM timetable_master_slots s
      INNER JOIN timetable_master tm ON s.master_id = tm.id
      INNER JOIN classes c ON tm.class_id = c.id
      INNER JOIN faculty_profiles f ON s.faculty_id = f.faculty_id
      WHERE CEIL(c.semester / 2) = ? 
      AND tm.department_id IN (${placeholders}) 
      ORDER BY f.Name ASC
    `;
    const faculty = await sequelize.query(sql, { replacements, type: QueryTypes.SELECT });

    console.log(`[TIMETABLE] Found ${faculty.length} faculty for year ${year}`);
    res.status(200).json({ success: true, count: faculty.length, data: faculty });
  } catch (err) {
    console.error('[TIMETABLE] getFacultyByYear error:', err && err.stack ? err.stack : err);
    return next(new ErrorResponse('Failed to fetch faculty list', 500));
  }
});

// @desc      Get faculty timetable for department admin
// @route     GET /api/v1/timetable/admin/faculty-timetable/:facultyId
// @access    Private/DepartmentAdmin
export const getFacultyTimetable = asyncHandler(async (req, res, next) => {
  const { facultyId } = req.params;

  try {
    let departmentId = req.user.department_id || req.user.departmentId;

    if (!departmentId) {
      return next(new ErrorResponse('No department associated with your account', 400));
    }

    console.log(`[TIMETABLE] Fetching timetable for faculty: ${facultyId}, department_id: ${departmentId}`);

    // Use raw SQL query to fetch timetable data for a specific faculty
    const sql = `
      SELECT 
        s.id,
        s.day,
        s.period_slot_id as hour,
        p.period_label,
        COALESCE(sub.subject_name, 'Unknown') as subject,
        COALESCE(sub.subject_code, 'N/A') as subject_code,
        c.section,
        d.short_name as department,
        CEIL(c.semester / 2) as year,
        tm.academic_year as academicYear,
        COALESCE(f.Name, '') as faculty_name,
        s.session_type as sessionType,
        s.room,
        COALESCE(s.start_time, p.start_time) as start_time,
        COALESCE(s.end_time, p.end_time) as end_time
      FROM timetable_master_slots s
      INNER JOIN timetable_master tm ON s.master_id = tm.id
      INNER JOIN classes c ON tm.class_id = c.id
      INNER JOIN departments d ON tm.department_id = d.id
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN period_slots p ON s.period_slot_id = p.id
      LEFT JOIN faculty_profiles f ON s.faculty_id = f.faculty_id
      WHERE s.faculty_id = ?
      AND tm.department_id = ?
      AND tm.status = 'active'
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

    const timetable = await sequelize.query(sql, {
      replacements: [facultyId, departmentId],
      type: QueryTypes.SELECT
    });

    // Allow empty timetable for department admins who may not have classes assigned yet
    console.log(`[TIMETABLE] Found ${timetable.length} slots for faculty ${facultyId}`);

    // Disable caching to ensure fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.status(200).json({
      success: true,
      count: timetable.length,
      timetable: timetable
    });
  } catch (err) {
    console.error('[TIMETABLE] getFacultyTimetable error:', err);
    return next(new ErrorResponse(`Failed to fetch faculty timetable: ${err.message}`, 500));
  }
});

// @desc      Get timetable by department and year (for timetable alteration)
// @route     GET /api/v1/timetable/department/:year
// @access    Private/Faculty (timetable incharge)
export const getTimetableByDepartmentAndYear = asyncHandler(async (req, res, next) => {
  const { year } = req.params;
  const { section, academicYear } = req.query;

  // Get user's department from token
  const deptCandidates = [];
  if (req.user.department) {
    if (typeof req.user.department === 'string') deptCandidates.push(req.user.department);
    else if (typeof req.user.department === 'object') {
      if (req.user.department.short_name) deptCandidates.push(req.user.department.short_name);
      if (req.user.department.full_name) deptCandidates.push(req.user.department.full_name);
    }
  }
  if (req.user.departmentCode && typeof req.user.departmentCode === 'string') deptCandidates.push(req.user.departmentCode);

  const uniqueDepts = Array.from(new Set(deptCandidates.filter(Boolean).map(String)));

  if (uniqueDepts.length === 0) {
    return next(new ErrorResponse('No department associated with your account', 400));
  }

  // Build query
  const whereClause = {
    year: parseInt(year, 10)
  };

  if (section) {
    whereClause.section = section;
  }

  if (academicYear) {
    whereClause.academicYear = academicYear;
  }

  try {
    // Use raw query to handle the department IN clause
    const placeholders = uniqueDepts.map(() => '?').join(',');
    const replacements = [...uniqueDepts, parseInt(year, 10)];

    let sql = `
      SELECT 
        s.*, 
        s.period_slot_id as hour,
        tm.academic_year as academicYear, 
        c.section, 
        c.semester, 
        CEIL(c.semester / 2) as year,
        fp.Name as facultyName,
        sub.subject_name as subject,
        p.start_time as p_start_time,
        p.end_time as p_end_time
      FROM timetable_master_slots s
      INNER JOIN timetable_master tm ON s.master_id = tm.id
      INNER JOIN classes c ON tm.class_id = c.id
      LEFT JOIN faculty_profiles fp ON s.faculty_id = fp.id
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN period_slots p ON s.period_slot_id = p.id
      WHERE tm.department_id IN (${placeholders}) AND CEIL(c.semester / 2) = ?
    `;

    if (section) {
      sql += ` AND c.section = ?`;
      replacements.push(section);
    }

    if (academicYear) {
      sql += ` AND tm.academic_year = ?`;
      replacements.push(academicYear);
    }

    sql += ` ORDER BY CASE s.day WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7 END ASC, s.period_slot_id ASC`;

    const timetable = await sequelize.query(sql, { replacements, type: QueryTypes.SELECT });

    res.status(200).json({
      success: true,
      count: timetable.length,
      timetable: timetable
    });
  } catch (err) {
    console.error('[TIMETABLE] getTimetableByDepartmentAndYear error:', err);
    return next(new ErrorResponse('Failed to fetch timetable', 500));
  }
});

// @desc      Get department timetable for logged-in department admin
// @route     GET /api/v1/timetable/department/me
// @access    Private/DepartmentAdmin
export const getDepartmentTimetable = asyncHandler(async (req, res, next) => {
  const { academicYear } = req.query;

  try {
    // Get user's department
    let departmentId = req.user.department_id || req.user.departmentId;

    console.log('[TIMETABLE] getDepartmentTimetable - User info:', {
      userId: req.user.id,
      department_id: req.user.department_id,
      departmentId: req.user.departmentId,
      resolvedDepartmentId: departmentId
    });

    if (!departmentId) {
      return next(new ErrorResponse('No department associated with your account', 400));
    }

    // Use raw SQL query to fetch timetable data
    // Fixed: subject_name, d.short_name (not d.code), and proper table references
    let sql = `
      SELECT 
        s.id,
        s.day,
        s.period_slot_id as hour,
        p.period_label,
        COALESCE(sub.subject_name, 'Unknown') as subject,
        COALESCE(sub.subject_code, 'N/A') as subject_code,
        c.section,
        d.short_name as department,
        CEIL(c.semester / 2) as year,
        tm.academic_year as academicYear,
        COALESCE(f.Name, '') as faculty_name,
        s.session_type as sessionType,
        s.room
      FROM timetable_master_slots s
      INNER JOIN timetable_master tm ON s.master_id = tm.id
      INNER JOIN classes c ON tm.class_id = c.id
      INNER JOIN departments d ON tm.department_id = d.id
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN period_slots p ON s.period_slot_id = p.id
      LEFT JOIN faculty_profiles f ON s.faculty_id = f.faculty_id
      WHERE tm.department_id = ?
      AND tm.status = 'active'
    `;

    let params = [departmentId];

    if (academicYear) {
      sql += ` AND tm.academic_year = ?`;
      params.push(academicYear);
    }

    sql += ` 
      ORDER BY c.semester ASC, 
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

    console.log('[TIMETABLE] Executing SQL:', sql);
    console.log('[TIMETABLE] With params:', params);

    const timetable = await sequelize.query(sql, {
      replacements: params,
      type: QueryTypes.SELECT
    });

    console.log('[TIMETABLE] Query returned', timetable.length, 'rows');

    res.status(200).json({
      success: true,
      count: timetable.length,
      timetable: timetable,
      message: timetable.length === 0 ? 'No active timetables found for your department' : undefined
    });
  } catch (err) {
    console.error('[TIMETABLE] getDepartmentTimetable error:', err);
    console.error('[TIMETABLE] Error stack:', err.stack);
    return next(new ErrorResponse(`Failed to fetch department timetable: ${err.message}`, 500));
  }
});

// @desc      Apply timetable alteration (replace faculty)
// @route     POST /api/v1/timetable/alteration
// @access    Private/Faculty (timetable incharge)
export const applyTimetableAlteration = asyncHandler(async (req, res, next) => {
  const { department, year, section, day, hour, subject, originalFacultyId, replacementFacultyId, replacementFacultyName } = req.body;

  if (!department || !year || !section || !day || !hour || !subject || !originalFacultyId || !replacementFacultyId) {
    return res.status(400).json({
      success: false,
      error: 'Please provide all required fields: department, year, section, day, hour, subject, originalFacultyId, replacementFacultyId'
    });
  }

  try {
    // Find the department ID from the department name
    const deptRecord = await Department.findOne({
      where: {
        [Op.or]: [
          { short_name: department },
          { full_name: department }
        ]
      }
    });

    if (!deptRecord) {
      return next(new ErrorResponse('Department not found', 404));
    }

    // Find the actual timetable slot to verify it exists
    const timetableSlot = await TimetableSimple.findOne({
      where: {
        department: department,
        year: parseInt(year, 10),
        section: section,
        day: day,
        hour: parseInt(hour, 10),
        subject: subject,
        facultyId: originalFacultyId
      }
    });

    // Look up faculty IDs by their college codes
    const originalFaculty = await Faculty.findOne({
      where: { faculty_college_code: originalFacultyId }
    });

    const replacementFaculty = await Faculty.findOne({
      where: { faculty_college_code: replacementFacultyId }
    });

    if (!originalFaculty || !replacementFaculty) {
      return next(new ErrorResponse('One or both faculty members not found', 404));
    }

    // Create a temporary alteration record (24-hour validity)
    const alteration = await TimetableAlteration.create({
      department_id: deptRecord.id,
      semester: parseInt(year, 10),
      // slot info saved separately for easy querying later
      day: day,
      hour: parseInt(hour, 10),
      section: section,
      subject: subject,
      year: parseInt(year, 10),
      slot_id: 0, // Not using slot_id for simple timetable
      old_faculty_id: originalFaculty.faculty_id,
      new_faculty_id: replacementFaculty.faculty_id,
      reason: `Temporary substitution for ${day} Hour ${hour} - ${subject}`,
      requested_by: req.user.faculty_id || req.user.id,
      status: 'approved', // Auto-approve for direct substitutions
      proposed_date: new Date(),
      approved_by: req.user.faculty_id || req.user.id,
      approval_date: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Timetable altered successfully! This is a temporary change valid for 24 hours.',
      data: {
        id: alteration.id,
        department: department,
        year: year,
        section: section,
        day: day,
        hour: hour,
        subject: subject,
        originalFacultyId: originalFacultyId,
        originalFacultyName: timetableSlot?.facultyName || 'TBA',
        replacementFacultyId: replacementFacultyId,
        replacementFacultyName: replacementFacultyName,
        createdAt: alteration.createdAt
      }
    });
  } catch (err) {
    console.error('[TIMETABLE] applyTimetableAlteration error:', err);
    return next(new ErrorResponse('Failed to apply timetable alteration', 500));
  }
});
