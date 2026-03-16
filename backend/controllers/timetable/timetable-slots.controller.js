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

  const where = { master_id: masterId };
  if (day) {
    where.day = day;
  }

  const slots = await TimetableMasterSlots.findAll({
    where,
    include: [
      { model: Subject, as: 'subject' },
      { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email'] },
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
