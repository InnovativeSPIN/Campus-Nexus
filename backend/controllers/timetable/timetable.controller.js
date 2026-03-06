import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models, sequelize } from '../../models/index.js';
const { Timetable, PeriodConfig, Faculty, Student, TimetableSlot, Department, Class: ClassModel, Subject, User, TimetableAlteration } = models;
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
      { model: ClassModel, as: 'class', attributes: ['name', 'section'] },
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
      { model: ClassModel, as: 'class', attributes: ['name', 'section', 'room'] },
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
  const timetable = await Timetable.findOne({
    where: {
      classId: req.params.classId,
      isActive: true
    },
    include: [
      { model: ClassModel, as: 'class', attributes: ['name', 'section', 'room'] },
      { model: Department, as: 'department', attributes: ['name', 'code'] },
      {
        model: TimetableSlot,
        as: 'slots',
        include: [
          { model: Subject, as: 'subject', attributes: ['name', 'code'] },
          { model: Faculty, as: 'faculty', attributes: ['firstName', 'lastName'] }
        ]
      }
    ]
  });

  if (!timetable) {
    return next(new ErrorResponse('No active timetable found for this class', 404));
  }

  res.status(200).json({
    success: true,
    data: timetable
  });
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
          { model: ClassModel, as: 'class', attributes: ['name', 'section'] },
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
            include: [{ model: ClassModel, as: 'class', attributes: ['name', 'section'] }]
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

    const sql = `SELECT DISTINCT facultyId, facultyName FROM timetable WHERE year = ? AND department IN (${placeholders}) ORDER BY facultyName ASC`;
    const faculty = await sequelize.query(sql, { replacements, type: QueryTypes.SELECT });

    console.log(`[TIMETABLE] Found ${faculty.length} faculty for year ${year}`);
    res.status(200).json({ success: true, count: faculty.length, data: faculty });
  } catch (err) {
    console.error('[TIMETABLE] getFacultyByYear error:', err && err.stack ? err.stack : err);
    return next(new ErrorResponse('Failed to fetch faculty list', 500));
  }
});

// @desc      Get faculty personal timetable for department admin
// @route     GET /api/v1/timetable/faculty/:facultyId
// @access    Private/Department-Admin
export const getFacultyTimetable = asyncHandler(async (req, res, next) => {
  const isDepartmentAdmin2 = req.user.role === 'department_admin' || req.user.role === 'department-admin' || req.user.role_id === 7;
  if (!isDepartmentAdmin2) {
    return next(new ErrorResponse('Only department admin can access this feature', 403));
  }

  const { facultyId } = req.params;
  // Build department candidates similar to getFacultyByYear
  const deptCandidates = [];
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
  const uniqueDepts = Array.from(new Set(deptCandidates.filter(Boolean).map(String)));

  try {
    console.log(`[TIMETABLE] Fetching timetable for faculty: ${facultyId}, dept candidates: ${uniqueDepts.join(',')}`);

    if (uniqueDepts.length === 0) {
      console.warn('[TIMETABLE] No department identifiers available for user; returning not found');
      return next(new ErrorResponse('No department associated with your account', 400));
    }

    const placeholders = uniqueDepts.map(() => '?').join(',');
    const replacements = [facultyId, ...uniqueDepts];

    const sql = `SELECT * FROM timetable WHERE facultyId = ? AND department IN (${placeholders}) ORDER BY CASE day WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7 END ASC, hour ASC`;
    const timetable = await sequelize.query(sql, { replacements, type: QueryTypes.SELECT });

    if (timetable.length === 0) {
      return next(new ErrorResponse('No timetable found for this faculty', 404));
    }

    console.log(`[TIMETABLE] Found ${timetable.length} slots for faculty ${facultyId}`);
    res.status(200).json({ success: true, count: timetable.length, data: timetable });
  } catch (err) {
    console.error('[TIMETABLE] getFacultyTimetable error:', err && err.stack ? err.stack : err);
    return next(new ErrorResponse('Failed to fetch faculty timetable', 500));
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
    
    let sql = `SELECT * FROM timetable WHERE department IN (${placeholders}) AND year = ?`;
    
    if (section) {
      sql += ` AND section = ?`;
      replacements.push(section);
    }
    
    if (academicYear) {
      sql += ` AND academicYear = ?`;
      replacements.push(academicYear);
    }
    
    sql += ` ORDER BY CASE day WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7 END ASC, hour ASC`;

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
