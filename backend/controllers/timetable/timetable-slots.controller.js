import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';

const {
  TimetableMaster,
  TimetableMasterSlots,
  Subject,
  Faculty,
} = models;

/**
 * @desc    Add/Create a timetable slot
 * @route   POST /api/timetable-master/:masterId/slots
 * @access  Private - Department Admin or Timetable Incharge
 */
export const createSlot = asyncHandler(async (req, res, next) => {
  const { masterId } = req.params;
  const {
    day,
    period_slot_id,
    subject_id,
    faculty_id,
    session_type,
    is_lab_session,
    lab_pair_slot_id,
    lab_group,
    room,
    notes,
  } = req.body;

  // Validate required fields
  if (!day || !period_slot_id) {
    return next(new ErrorResponse('Missing required fields: day, period_slot_id', 400));
  }

  // Check if master exists
  const master = await TimetableMaster.findByPk(masterId);
  if (!master) {
    return next(new ErrorResponse(`Timetable master not found with id ${masterId}`, 404));
  }

  // Check department access for non-superadmin users
  const userRole = req.user?.role?.name;
  const userDepartmentId = req.user?.department_id;

  if (userRole === 'department-admin' || userRole === 'timetable-incharge') {
    if (!userDepartmentId) {
      return next(new ErrorResponse('User department ID not found', 400));
    }
    // Validate user can only create slots for their own department's timetable
    if (master.department_id !== userDepartmentId) {
      return next(new ErrorResponse('You do not have permission to add slots for this timetable', 403));
    }
  }

  // Break periods (period_slot_id 3, 5, 8) should only be used for breaks
  if ([3, 5, 8].includes(period_slot_id) && session_type !== 'break') {
    return next(
      new ErrorResponse(
        'Period IDs 3, 5, 8 are reserved for breaks and must use session_type="break"',
        400
      )
    );
  }

  // Check for duplicate slot (unique constraint: master_id, day, period_slot_id, lab_group)
  const existingSlot = await TimetableMasterSlots.findOne({
    where: {
      master_id: masterId,
      day,
      period_slot_id,
      lab_group: lab_group || null,
    },
  });

  if (existingSlot) {
    return next(new ErrorResponse('A slot already exists for this day, period, and lab group', 409));
  }

  const slot = await TimetableMasterSlots.create({
    master_id: masterId,
    day,
    period_slot_id,
    subject_id: subject_id || null,
    faculty_id: faculty_id || null,
    session_type: session_type || 'theory',
    is_lab_session: is_lab_session || false,
    lab_pair_slot_id: lab_pair_slot_id || null,
    lab_group: lab_group || null,
    room: room || null,
    notes: notes || null,
  });

  const result = await TimetableMasterSlots.findByPk(slot.id, {
    include: [
      { model: Subject, as: 'subject' },
      { model: Faculty, as: 'faculty' },
    ],
  });

  res.status(201).json({
    success: true,
    message: 'Slot created',
    data: result,
  });
});

/**
 * @desc    Get all slots for a timetable master
 * @route   GET /api/timetable-master/:masterId/slots
 * @access  Private
 */
export const getSlots = asyncHandler(async (req, res, next) => {
  const { masterId } = req.params;
  const { day } = req.query;

  // Check if master exists
  const master = await TimetableMaster.findByPk(masterId);
  if (!master) {
    return next(new ErrorResponse(`Timetable master not found with id ${masterId}`, 404));
  }

  // Check department access for non-superadmin users
  const userRole = req.user?.role?.name;
  const userDepartmentId = req.user?.department_id;

  if (userRole === 'department-admin' || userRole === 'timetable-incharge') {
    if (!userDepartmentId) {
      return next(new ErrorResponse('User department ID not found', 400));
    }
    // Validate user can only view slots from their own department's timetable
    if (master.department_id !== userDepartmentId) {
      return next(new ErrorResponse('You do not have permission to view slots for this timetable', 403));
    }
  }

  const where = { master_id: masterId };
  if (day) {
    where.day = day;
  }

  const slots = await TimetableMasterSlots.findAll({
    where,
    include: [
      { model: Subject, as: 'subject' },
      { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email', 'faculty_college_code'] },
    ],
    order: [['day', 'ASC'], ['period_slot_id', 'ASC']],
  });

  res.status(200).json({
    success: true,
    count: slots.length,
    data: slots,
  });
});

/**
 * @desc    Update a timetable slot
 * @route   PATCH /api/timetable-master/slots/:slotId
 * @access  Private - Department Admin or Timetable Incharge
 */
export const updateSlot = asyncHandler(async (req, res, next) => {
  const { slotId } = req.params;

  const slot = await TimetableMasterSlots.findByPk(slotId);
  if (!slot) {
    return next(new ErrorResponse(`Slot not found with id ${slotId}`, 404));
  }

  // Get the parent timetable master to check department access
  const master = await TimetableMaster.findByPk(slot.master_id);
  if (!master) {
    return next(new ErrorResponse('Parent timetable master not found', 404));
  }

  // Check department access for non-superadmin users
  const userRole = req.user?.role?.name;
  const userDepartmentId = req.user?.department_id;

  if (userRole === 'department-admin' || userRole === 'timetable-incharge') {
    if (!userDepartmentId) {
      return next(new ErrorResponse('User department ID not found', 400));
    }
    // Validate user can only update slots in their own department's timetable
    if (master.department_id !== userDepartmentId) {
      return next(new ErrorResponse('You do not have permission to update slots for this timetable', 403));
    }
  }

  const updateFields = {};
  const allowed = ['subject_id', 'faculty_id', 'session_type', 'is_lab_session', 'lab_pair_slot_id', 'lab_group', 'room', 'notes'];

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateFields[field] = req.body[field];
    }
  });

  await slot.update(updateFields);

  const result = await TimetableMasterSlots.findByPk(slotId, {
    include: [
      { model: Subject, as: 'subject' },
      { model: Faculty, as: 'faculty' },
    ],
  });

  res.status(200).json({
    success: true,
    message: 'Slot updated',
    data: result,
  });
});

/**
 * @desc    Delete a timetable slot
 * @route   DELETE /api/timetable-master/slots/:slotId
 * @access  Private - Department Admin or Timetable Incharge
 */
export const deleteSlot = asyncHandler(async (req, res, next) => {
  const { slotId } = req.params;

  const slot = await TimetableMasterSlots.findByPk(slotId);
  if (!slot) {
    return next(new ErrorResponse(`Slot not found with id ${slotId}`, 404));
  }

  // Get the parent timetable master to check department access
  const master = await TimetableMaster.findByPk(slot.master_id);
  if (!master) {
    return next(new ErrorResponse('Parent timetable master not found', 404));
  }

  // Check department access for non-superadmin users
  const userRole = req.user?.role?.name;
  const userDepartmentId = req.user?.department_id;

  if (userRole === 'department-admin' || userRole === 'timetable-incharge') {
    if (!userDepartmentId) {
      return next(new ErrorResponse('User department ID not found', 400));
    }
    // Validate user can only delete slots from their own department's timetable
    if (master.department_id !== userDepartmentId) {
      return next(new ErrorResponse('You do not have permission to delete slots for this timetable', 403));
    }
  }

  await slot.destroy();

  res.status(200).json({
    success: true,
    message: 'Slot deleted',
  });
});

/**
 * @desc    Bulk create/update slots for a timetable
 * @route   POST /api/timetable-master/:masterId/slots/bulk
 * @access  Private - Department Admin only
 */
export const bulkCreateSlots = asyncHandler(async (req, res, next) => {
  const { masterId } = req.params;
  const { slots } = req.body;

  if (!Array.isArray(slots) || slots.length === 0) {
    return next(new ErrorResponse('Slots array is required and must not be empty', 400));
  }

  const master = await TimetableMaster.findByPk(masterId);
  if (!master) {
    return next(new ErrorResponse(`Timetable master not found with id ${masterId}`, 404));
  }

  // Check department access for non-superadmin users
  const userRole = req.user?.role?.name;
  const userDepartmentId = req.user?.department_id;

  if (userRole === 'department-admin' || userRole === 'timetable-incharge') {
    if (!userDepartmentId) {
      return next(new ErrorResponse('User department ID not found', 400));
    }
    // Validate user can only create slots for their own department's timetable
    if (master.department_id !== userDepartmentId) {
      return next(new ErrorResponse('You do not have permission to create slots for this timetable', 403));
    }
  }

  // Delete existing slots for this master
  await TimetableMasterSlots.destroy({
    where: { master_id: masterId },
  });

  // Create new slots
  const createdSlots = await TimetableMasterSlots.bulkCreate(
    slots.map((slot) => ({
      ...slot,
      master_id: masterId,
    }))
  );

  res.status(201).json({
    success: true,
    message: `${createdSlots.length} slots created`,
    count: createdSlots.length,
    data: createdSlots,
  });
});
