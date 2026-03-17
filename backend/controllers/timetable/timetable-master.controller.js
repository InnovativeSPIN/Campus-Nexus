import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';

const {
  TimetableMaster,
  TimetableMasterSlots,
  Class: ClassModel,
  Department,
  Faculty,
  Subject,
  Leave,
  User,
} = models;

/**
 * @desc    Create a new timetable master (from Coordinator Page)
 * @route   POST /api/timetable-master
 * @access  Private - Department Admin only
 */
export const createTimetableMaster = asyncHandler(async (req, res, next) => {
  const {
    class_id,
    department_id,
    academic_year,
    semester,
    semester_type,
    batch,
    room_no,
    effective_from,
    revision_no,
    class_coordinator_id,
    asst_coordinator_id,
    timetable_incharge_id,
    hod_id,
  } = req.body;

  // Validate required fields
  if (!class_id || !department_id || !academic_year || !semester || !semester_type || !batch || !effective_from) {
    return next(new ErrorResponse('Missing required fields', 400));
  }

  // Check if an active timetable already exists for this class/semester combo
  const existingActive = await TimetableMaster.findOne({
    where: {
      class_id,
      academic_year,
      semester,
      status: 'active',
    },
  });

  if (existingActive) {
    return next(
      new ErrorResponse(
        `An active timetable already exists for this class and semester. Please deactivate it first.`,
        409
      )
    );
  }

  const timetableMaster = await TimetableMaster.create({
    class_id,
    department_id,
    academic_year,
    semester,
    semester_type,
    batch,
    room_no: room_no || null,
    effective_from: new Date(effective_from),
    revision_no: revision_no || null,
    status: 'draft', // Create in draft status
    class_coordinator_id: class_coordinator_id || null,
    asst_coordinator_id: asst_coordinator_id || null,
    timetable_incharge_id: timetable_incharge_id || null,
    hod_id: hod_id || null,
    created_by: req.user.faculty_id || req.user.id,
  });

  const result = await TimetableMaster.findByPk(timetableMaster.id, {
    include: [
      { model: ClassModel, as: 'class' },
      { model: Department, as: 'department' },
      { model: Faculty, as: 'class_coordinator' },
      { model: Faculty, as: 'asst_coordinator' },
      { model: Faculty, as: 'timetable_incharge' },
      { model: Faculty, as: 'hod' },
      { model: Faculty, as: 'creator' },
    ],
  });

  res.status(201).json({
    success: true,
    message: 'Timetable master created in draft status',
    data: result,
  });
});

/**
 * @desc    Get all timetable masters with filters
 * @route   GET /api/timetable-master
 * @access  Private
 */
export const getTimetableMasters = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const offset = (page - 1) * limit;

  const where = {};

  // Filters
  if (req.query.department_id) {
    where.department_id = req.query.department_id;
  }
  if (req.query.class_id) {
    where.class_id = req.query.class_id;
  }
  if (req.query.academic_year) {
    where.academic_year = req.query.academic_year;
  }
  if (req.query.semester) {
    where.semester = req.query.semester;
  }
  if (req.query.status) {
    where.status = req.query.status;
  }

  const total = await TimetableMaster.count({ where });
  const timetables = await TimetableMaster.findAll({
    where,
    include: [
      { model: ClassModel, as: 'class' },
      { model: Department, as: 'department' },
      { model: Faculty, as: 'class_coordinator', attributes: ['faculty_id', 'Name', 'email'] },
      { model: Faculty, as: 'asst_coordinator', attributes: ['faculty_id', 'Name', 'email'] },
      { model: Faculty, as: 'timetable_incharge', attributes: ['faculty_id', 'Name', 'email'] },
      { model: Faculty, as: 'hod', attributes: ['faculty_id', 'Name', 'email'] },
    ],
    offset,
    limit,
    order: [['created_at', 'DESC']],
  });

  console.log('[TIMETABLE-MASTER] DEBUG - Raw DB response:', JSON.stringify(timetables.map(t => ({
    id: t.id,
    status: t.status,
    statusType: typeof t.status,
    statusIsNull: t.status === null,
    statusIsEmpty: t.status === '',
    allFields: Object.keys(t.dataValues)
  }))));

  res.status(200).json({
    success: true,
    count: timetables.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: timetables,
  });
});

/**
 * @desc    Get single timetable masterby ID
 * @route   GET /api/timetable-master/:id
 * @access  Private
 */
export const getTimetableMaster = asyncHandler(async (req, res, next) => {
  const timetable = await TimetableMaster.findByPk(req.params.id, {
    include: [
      { model: ClassModel, as: 'class' },
      { model: Department, as: 'department' },
      { model: Faculty, as: 'class_coordinator', attributes: ['faculty_id', 'Name', 'email'] },
      { model: Faculty, as: 'asst_coordinator', attributes: ['faculty_id', 'Name', 'email'] },
      { model: Faculty, as: 'timetable_incharge', attributes: ['faculty_id', 'Name', 'email'] },
      { model: Faculty, as: 'hod', attributes: ['faculty_id', 'Name', 'email'] },
      {
        model: models.TimetableMasterSlots,
        as: 'slots',
        include: [
          { model: Subject, as: 'subject' },
          { model: Faculty, as: 'faculty' },
        ],
      },
    ],
  });

  if (!timetable) {
    return next(new ErrorResponse(`Timetable master not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: timetable,
  });
});

/**
 * @desc    Update timetable master details (coordinators, etc.)
 * @route   PATCH /api/timetable-master/:id
 * @access  Private - Department Admin only
 */
export const updateTimetableMaster = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updates = {};

  // Allow updating coordinator assignments
  const allowed = ['class_coordinator_id', 'asst_coordinator_id', 'timetable_incharge_id', 'hod_id', 'revision_no'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const timetable = await TimetableMaster.findByPk(id);

  if (!timetable) {
    return next(new ErrorResponse(`Timetable master not found with id ${id}`, 404));
  }

  // Don't allow status change via this endpoint
  if (req.body.status) {
    return next(new ErrorResponse('Use separate endpoint to change status', 400));
  }

  await timetable.update(updates);

  const result = await TimetableMaster.findByPk(id, {
    include: [
      { model: ClassModel, as: 'class' },
      { model: Department, as: 'department' },
      { model: Faculty, as: 'class_coordinator' },
      { model: Faculty, as: 'asst_coordinator' },
      { model: Faculty, as: 'timetable_incharge' },
      { model: Faculty, as: 'hod' },
    ],
  });

  res.status(200).json({
    success: true,
    message: 'Timetable master updated',
    data: result,
  });
});

/**
 * @desc    Activate a timetable master (change status to active)
 * @route   PATCH /api/timetable-master/:id/activate
 * @access  Private - Department Admin only
 */
export const activateTimetableMaster = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const timetable = await TimetableMaster.findByPk(id);

  if (!timetable) {
    return next(new ErrorResponse(`Timetable master not found with id ${id}`, 404));
  }

  if (timetable.status === 'active') {
    return next(new ErrorResponse('Timetable is already active', 400));
  }

  // Check if it has slots
  const slotCount = await models.TimetableMasterSlots.count({
    where: { master_id: id },
  });

  console.log('[activateTimetableMaster] timetableId:', id, 'slotCount:', slotCount);

  if (slotCount === 0) {
    return next(new ErrorResponse('Cannot activate timetable without slots', 400));
  }

  // Deactivate other active timetables for the same class/semester
  await TimetableMaster.update(
    { status: 'inactive' },
    {
      where: {
        class_id: timetable.class_id,
        academic_year: timetable.academic_year,
        semester: timetable.semester,
        status: 'active',
      },
    }
  );

  // Activate this one
  await timetable.update({ status: 'active' });

  const result = await TimetableMaster.findByPk(id, {
    include: [
      { model: ClassModel, as: 'class' },
      { model: Department, as: 'department' },
      { model: Faculty, as: 'class_coordinator' },
      { model: Faculty, as: 'asst_coordinator' },
      { model: Faculty, as: 'timetable_incharge' },
      { model: Faculty, as: 'hod' },
    ],
  });

  res.status(200).json({
    success: true,
    message: 'Timetable master activated',
    data: result,
  });
});

/**
 * @desc    Deactivate a timetable master
 * @route   PATCH /api/timetable-master/:id/deactivate
 * @access  Private - Department Admin only
 */
export const deactivateTimetableMaster = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const timetable = await TimetableMaster.findByPk(id);

  if (!timetable) {
    return next(new ErrorResponse(`Timetable master not found with id ${id}`, 404));
  }

  if (timetable.status === 'inactive') {
    return next(new ErrorResponse('Timetable is already inactive', 400));
  }

  await timetable.update({ status: 'inactive' });

  const result = await TimetableMaster.findByPk(id);

  res.status(200).json({
    success: true,
    message: 'Timetable master deactivated',
    data: result,
  });
});

/**
 * @desc    Delete a timetable master (only if draft)
 * @route   DELETE /api/timetable-master/:id
 * @access  Private - Department Admin only
 */
export const deleteTimetableMaster = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const timetable = await TimetableMaster.findByPk(id);

  if (!timetable) {
    return next(new ErrorResponse(`Timetable master not found with id ${id}`, 404));
  }

  if (timetable.status !== 'draft') {
    return next(new ErrorResponse('Can only delete draft timetables', 400));
  }

  // Delete related slots
  await models.TimetableMasterSlots.destroy({
    where: { master_id: id },
  });

  // Delete timetable master
  await timetable.destroy();

  res.status(200).json({
    success: true,
    message: 'Timetable master deleted',
  });
});
