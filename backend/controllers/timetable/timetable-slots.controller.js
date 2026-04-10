import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';

const {
  TimetableMaster,
  TimetableMasterSlots,
  Subject,
  Faculty,
  SubjectClassMapping,
  FacultySubjectAssignment,
  Class: ClassModel,
} = models;

/**
 * Helper: resolve req.user.role to a plain lowercase string.
 * req.user.role is set as a plain string by auth middleware (e.g. 'faculty', 'department-admin'),
 * NOT as an object - so req.user.role.name is always undefined.
 */
const getUserRole = (req) => {
  const role = req.user?.role;
  if (!role) return '';
  if (typeof role === 'string') return role.trim().toLowerCase();
  return (role.role_name || role.name || '').trim().toLowerCase();
};

/**
 * Helper: verify the requesting user has write access to the given timetable master.
 *   - superadmin → always allowed
 *   - department-admin → must be in same department
 *   - faculty → must be in same department AND be the timetable_incharge for this master
 *
 * Returns an ErrorResponse if access is denied, or null if allowed.
 */
const checkWriteAccess = async (req, master) => {
  const userRole = getUserRole(req);
  const userDepartmentId = req.user?.department_id;
  const facultyId = req.user?.faculty_id;

  if (userRole === 'department-admin') {
    if (!userDepartmentId || !master.department_id) {
      return new ErrorResponse('User or timetable department ID not found', 400);
    }
    if (Number(master.department_id) !== Number(userDepartmentId)) {
      return new ErrorResponse('You do not have permission to manage slots for this timetable', 403);
    }
    return null; // allowed
  }

  if (userRole === 'faculty') {
    if (!userDepartmentId || !facultyId) {
      return new ErrorResponse('Faculty ID or department ID not found', 400);
    }
    // Must be same department
    if (Number(master.department_id) !== Number(userDepartmentId)) {
      return new ErrorResponse('You do not have permission to manage slots for a different department', 403);
    }
    // Must be the timetable_incharge for this specific timetable
    if (Number(master.timetable_incharge_id) !== Number(facultyId)) {
      return new ErrorResponse('Only the assigned Timetable Incharge can manage slots for this timetable', 403);
    }
    return null; // allowed
  }

  // superadmin and other privileged roles — no restriction
  return null;
};

/**
 * Helper: check read access (dept-level only, no incharge check needed for viewing)
 */
const checkReadAccess = (req, master) => {
  const userRole = getUserRole(req);
  const userDepartmentId = req.user?.department_id;

  if (userRole === 'department-admin' || userRole === 'faculty') {
    if (!userDepartmentId || !master.department_id) {
      return new ErrorResponse('User or timetable department ID not found', 400);
    }
    if (Number(master.department_id) !== Number(userDepartmentId)) {
      return new ErrorResponse('You do not have permission to view slots for this timetable', 403);
    }
  }
  return null;
};

/**
 * Helper function to normalize time format
 * Converts "HH:MM" to "HH:MM:SS" and validates format
 */
const normalizeTimeFormat = (time) => {
  if (!time) return null;
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
  const match = time.match(timeRegex);
  
  if (!match) {
    throw new Error(`Invalid time format: ${time}. Expected HH:MM or HH:MM:SS`);
  }
  
  const hours = match[1];
  const minutes = match[2];
  const seconds = match[3] || '00';
  
  return `${hours.padStart(2, '0')}:${minutes}:${seconds}`;
};

/**
 * @desc    Add/Create a timetable slot
 * @route   POST /api/timetable-master/:masterId/slots
 * @access  Private - Department Admin or Timetable Incharge (faculty)
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
    start_time,
    end_time,
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

  // Check write access (dept + incharge validation)
  const accessError = await checkWriteAccess(req, master);
  if (accessError) return next(accessError);

  // Get configured break periods from timetable
  let breakPeriodIds = [];
  if (master.break_period_ids) {
    try {
      breakPeriodIds = typeof master.break_period_ids === 'string' 
        ? JSON.parse(master.break_period_ids) 
        : master.break_period_ids;
    } catch (err) {
      console.error('[SLOT CREATE] Failed to parse break_period_ids:', master.break_period_ids, err);
      breakPeriodIds = [];
    }
  }

  // If period is configured as a break, it must use session_type='break'
  if (breakPeriodIds.includes(Number(period_slot_id)) && session_type !== 'break') {
    return next(
      new ErrorResponse(
        `Period IDs ${breakPeriodIds.join(', ')} are configured as breaks and must use session_type="break"`,
        400
      )
    );
  }

  // Check for duplicate slot
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

  try {
    console.log('[SLOT CREATE] Payload:', { masterId, day, period_slot_id, subject_id, faculty_id, session_type, start_time, end_time });

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
      start_time: start_time ? normalizeTimeFormat(start_time) : null,
      end_time: end_time ? normalizeTimeFormat(end_time) : null,
    });

    console.log('[SLOT CREATE] Slot created successfully:', slot.id);

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
  } catch (error) {
    console.error('[SLOT CREATE] Error:', error.name, error.message);
    
    if (error.message.includes('Invalid time format')) {
      return next(new ErrorResponse(error.message, 400));
    }
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => `${e.path}: ${e.message}`).join(', ');
      return next(new ErrorResponse(`Validation error: ${messages}`, 400));
    }
    throw error;
  }
});

/**
 * @desc    Get all slots for a timetable master
 * @route   GET /api/timetable-master/:masterId/slots
 * @access  Private - Any authenticated user in same department
 */
export const getSlots = asyncHandler(async (req, res, next) => {
  const { masterId } = req.params;
  const { day } = req.query;

  // Check if master exists
  const master = await TimetableMaster.findByPk(masterId);
  if (!master) {
    return next(new ErrorResponse(`Timetable master not found with id ${masterId}`, 404));
  }

  // Check read access (dept-level only)
  const accessError = checkReadAccess(req, master);
  if (accessError) return next(accessError);

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
 * @route   PATCH /api/timetable-master/:masterId/slots/:slotId
 * @access  Private - Department Admin or Timetable Incharge (faculty)
 */
export const updateSlot = asyncHandler(async (req, res, next) => {
  const { slotId } = req.params;

  const slot = await TimetableMasterSlots.findByPk(slotId);
  if (!slot) {
    return next(new ErrorResponse(`Slot not found with id ${slotId}`, 404));
  }

  // Get the parent timetable master to check department + incharge access
  const master = await TimetableMaster.findByPk(slot.master_id);
  if (!master) {
    return next(new ErrorResponse('Parent timetable master not found', 404));
  }

  // Check write access
  const accessError = await checkWriteAccess(req, master);
  if (accessError) return next(accessError);

  const updateFields = {};
  const allowed = ['subject_id', 'faculty_id', 'session_type', 'is_lab_session', 'lab_pair_slot_id', 'lab_group', 'room', 'notes', 'start_time', 'end_time'];

  try {
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        if ((field === 'start_time' || field === 'end_time') && req.body[field]) {
          updateFields[field] = normalizeTimeFormat(req.body[field]);
        } else {
          updateFields[field] = req.body[field];
        }
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
  } catch (error) {
    if (error.message.includes('Invalid time format')) {
      return next(new ErrorResponse(error.message, 400));
    }
    throw error;
  }
});

/**
 * @desc    Delete a timetable slot
 * @route   DELETE /api/timetable-master/:masterId/slots/:slotId
 * @access  Private - Department Admin or Timetable Incharge (faculty)
 */
export const deleteSlot = asyncHandler(async (req, res, next) => {
  const { slotId } = req.params;

  const slot = await TimetableMasterSlots.findByPk(slotId);
  if (!slot) {
    return next(new ErrorResponse(`Slot not found with id ${slotId}`, 404));
  }

  const master = await TimetableMaster.findByPk(slot.master_id);
  if (!master) {
    return next(new ErrorResponse('Parent timetable master not found', 404));
  }

  // Check write access
  const accessError = await checkWriteAccess(req, master);
  if (accessError) return next(accessError);

  await slot.destroy();

  res.status(200).json({
    success: true,
    message: 'Slot deleted',
  });
});

/**
 * @desc    Bulk create/update slots for a timetable
 * @route   POST /api/timetable-master/:masterId/slots/bulk
 * @access  Private - Department Admin or Timetable Incharge (faculty)
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

  // Check write access
  const accessError = await checkWriteAccess(req, master);
  if (accessError) return next(accessError);

  try {
    // Validate and normalize time formats for all slots
    const normalizedSlots = slots.map((slot) => {
      const normalized = { ...slot };
      
      if (normalized.start_time) {
        normalized.start_time = normalizeTimeFormat(normalized.start_time);
      }
      if (normalized.end_time) {
        normalized.end_time = normalizeTimeFormat(normalized.end_time);
      }
      
      return normalized;
    });

    // Delete existing slots for this master
    await TimetableMasterSlots.destroy({
      where: { master_id: masterId },
    });

    // Create new slots
    const createdSlots = await TimetableMasterSlots.bulkCreate(
      normalizedSlots.map((slot) => ({
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
  } catch (error) {
    if (error.message.includes('Invalid time format')) {
      return next(new ErrorResponse(error.message, 400));
    }
    throw error;
  }
});

/**
 * @desc    Get subjects for a specific timetable (via class mapping)
 * @route   GET /api/timetable-master/:masterId/slots/subjects
 * @access  Private - dept-admin or faculty in same department
 */
export const getSubjectsForTimetable = asyncHandler(async (req, res, next) => {
  const { masterId } = req.params;

  const master = await TimetableMaster.findByPk(masterId, {
    attributes: ['id', 'class_id', 'department_id'],
    include: [{ model: ClassModel, as: 'class', attributes: ['id', 'name'] }],
  });
  if (!master) return next(new ErrorResponse(`Timetable master not found: ${masterId}`, 404));

  // Dept check
  const accessError = checkReadAccess(req, master);
  if (accessError) return next(accessError);

  // Fetch subjects via SubjectClassMapping for this class
  const mappings = await SubjectClassMapping.findAll({
    where: { class_id: master.class_id, department_id: master.department_id },
    include: [{
      model: Subject,
      as: 'subject',
      attributes: ['id', 'subject_name', 'subject_code'],
    }],
  });

  const subjects = mappings
    .map(m => m.subject)
    .filter(s => s && s.id)
    .reduce((acc, s) => {
      if (!acc.find(x => x.id === s.id)) {
        acc.push({ id: s.id, name: s.subject_name, code: s.subject_code });
      }
      return acc;
    }, []);

  res.status(200).json({ success: true, count: subjects.length, data: subjects });
});

/**
 * @desc    Get faculty for a specific timetable (allocated to that class)
 * @route   GET /api/timetable-master/:masterId/slots/faculty
 * @access  Private - dept-admin or faculty in same department
 */
export const getFacultyForTimetable = asyncHandler(async (req, res, next) => {
  const { masterId } = req.params;

  const master = await TimetableMaster.findByPk(masterId, {
    attributes: ['id', 'class_id', 'department_id'],
  });
  if (!master) return next(new ErrorResponse(`Timetable master not found: ${masterId}`, 404));

  const accessError = checkReadAccess(req, master);
  if (accessError) return next(accessError);

  // Fetch faculty allocated to this class via FacultySubjectAssignment
  const assignments = await FacultySubjectAssignment.findAll({
    where: { class_id: master.class_id, status: 'active' },
    include: [{
      model: Faculty,
      as: 'faculty',
      attributes: ['faculty_id', 'Name', 'email', 'faculty_college_code'],
    }],
  });

  const facultyList = assignments
    .map(a => a.faculty)
    .filter(f => f && f.faculty_id)
    .reduce((acc, f) => {
      if (!acc.find(x => x.faculty_id === f.faculty_id)) {
        acc.push({
          faculty_id: f.faculty_id,
          Name: f.Name,
          email: f.email,
          college_code: f.faculty_college_code,
        });
      }
      return acc;
    }, []);

  res.status(200).json({ success: true, count: facultyList.length, data: facultyList });
});

/**
 * @desc    Get break period configuration for a timetable
 * @route   GET /api/timetable-master/:masterId/break-config
 * @access  Private - Any authenticated user in same department
 */
export const getBreakConfiguration = asyncHandler(async (req, res, next) => {
  const { masterId } = req.params;

  const master = await TimetableMaster.findByPk(masterId, {
    attributes: ['id', 'break_period_ids', 'department_id'],
  });
  if (!master) {
    return next(new ErrorResponse(`Timetable master not found with id ${masterId}`, 404));
  }

  // Check read access
  const accessError = checkReadAccess(req, master);
  if (accessError) return next(accessError);

  // Parse break_period_ids if it's a string (MySQL stores JSON as string sometimes)
  let breakIds = [];
  if (master.break_period_ids) {
    try {
      // If it's a string, parse it; if already an array, use it as-is
      if (typeof master.break_period_ids === 'string') {
        breakIds = JSON.parse(master.break_period_ids);
      } else if (Array.isArray(master.break_period_ids)) {
        breakIds = master.break_period_ids;
      }
    } catch (err) {
      console.error(`[GET BREAK CONFIG] Failed to parse break_period_ids:`, master.break_period_ids, err);
      breakIds = []; // Use empty array if parsing fails
    }
  }

  console.log(`[GET BREAK CONFIG] Timetable ${masterId} - break_period_ids from DB:`, master.break_period_ids, 'Parsed as:', breakIds);

  res.status(200).json({
    success: true,
    data: {
      masterId: master.id,
      breakPeriodIds: breakIds,
    },
  });
});

/**
 * @desc    Save break period configuration for a timetable
 * @route   POST /api/timetable-master/:masterId/break-config
 * @access  Private - Department Admin or Timetable Incharge (faculty)
 */
export const saveBreakConfiguration = asyncHandler(async (req, res, next) => {
  const { masterId } = req.params;
  const { breakPeriodIds } = req.body;

  console.log(`[SAVE BREAK CONFIG] Received breakPeriodIds:`, breakPeriodIds, 'Type:', typeof breakPeriodIds, 'isArray:', Array.isArray(breakPeriodIds));

  if (!Array.isArray(breakPeriodIds)) {
    return next(new ErrorResponse('breakPeriodIds must be an array', 400));
  }

  const master = await TimetableMaster.findByPk(masterId);
  if (!master) {
    return next(new ErrorResponse(`Timetable master not found with id ${masterId}`, 404));
  }

  // Check write access
  const accessError = await checkWriteAccess(req, master);
  if (accessError) return next(accessError);

  // Update the break_period_ids field
  await master.update({
    break_period_ids: breakPeriodIds,
  });

  // Fetch fresh to confirm
  const updated = await TimetableMaster.findByPk(masterId, {
    attributes: ['id', 'break_period_ids']
  });
  console.log(`[SAVE BREAK CONFIG] After update - break_period_ids from DB:`, updated.break_period_ids, 'Type:', typeof updated.break_period_ids);

  // Parse break_period_ids if needed (MySQL stores JSON as string)
  let savedBreakIds = breakPeriodIds;
  if (updated.break_period_ids) {
    try {
      if (typeof updated.break_period_ids === 'string') {
        savedBreakIds = JSON.parse(updated.break_period_ids);
      } else if (Array.isArray(updated.break_period_ids)) {
        savedBreakIds = updated.break_period_ids;
      }
    } catch (err) {
      console.error(`[SAVE BREAK CONFIG] Failed to parse saved break_period_ids:`, updated.break_period_ids);
      savedBreakIds = breakPeriodIds; // Fallback to what we sent
    }
  }
  console.log(`[SAVE BREAK CONFIG] Returning break config:`, savedBreakIds);

  res.status(200).json({
    success: true,
    message: 'Break configuration saved successfully',
    data: {
      masterId: master.id,
      breakPeriodIds: savedBreakIds,
    },
  });
});

/**
 * @desc    Get all period slots with their times for a timetable
 * @route   GET /api/timetable-master/:masterId/period-slots
 * @access  Private - Any authenticated user in same department
 * Fetch dynamic period times from slots to display in UI instead of hardcoded times
 */
export const getPeriodSlots = asyncHandler(async (req, res, next) => {
  const { masterId } = req.params;

  const master = await TimetableMaster.findByPk(masterId, {
    attributes: ['id', 'department_id'],
  });
  if (!master) {
    return next(new ErrorResponse(`Timetable master not found with id ${masterId}`, 404));
  }

  // Check read access
  const accessError = checkReadAccess(req, master);
  if (accessError) return next(accessError);

  // Fetch all slots for Monday to get unique periods with their times
  const mondaySlots = await TimetableMasterSlots.findAll({
    where: {
      master_id: masterId,
      day: 'Monday',
    },
    attributes: ['period_slot_id', 'start_time', 'end_time'],
    order: [['period_slot_id', 'ASC']],
  });

  // Convert to period format with times
  const periods = mondaySlots.map((slot) => {
    let timeRange = "";
    
    if (slot.start_time && slot.end_time) {
      // Format times like "09:30 - 10:20"
      const formatTime = (time) => {
        if (!time) return "";
        if (typeof time === 'string') {
          // If it's already a string like "09:30:00"
          const parts = time.split(':');
          return `${parts[0]}:${parts[1]}`;
        }
        return time;
      };
      timeRange = `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`;
    }

    return {
      id: slot.period_slot_id,
      time: timeRange,
    };
  });

  console.log('[GET PERIOD SLOTS] Timetable', masterId, 'Period slots:', periods);

  res.status(200).json({
    success: true,
    count: periods.length,
    data: periods,
  });
});

