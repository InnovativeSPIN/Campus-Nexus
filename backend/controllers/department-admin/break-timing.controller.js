import models from '../../models/index.js';
import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';

/**
 * Get break timings for a specific year in the department
 */
export const getBreakTimingsByYear = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { year } = req.params;

  // Validate year
  if (!['1st', '2nd', '3rd', '4th'].includes(year)) {
    throw new ErrorResponse('Invalid year. Must be 1st, 2nd, 3rd, or 4th', 400);
  }

  const breakTimings = await models.YearBreakTiming.findAll({
    where: { department_id, year },
    order: [['start_time', 'ASC']]
  });

  res.status(200).json({
    success: true,
    data: breakTimings
  });
});

/**
 * Get all break timings for a department (all years)
 */
export const getAllBreakTimings = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;

  const breakTimings = await models.YearBreakTiming.findAll({
    where: { department_id },
    order: [['year', 'ASC'], ['start_time', 'ASC']],
    include: [
      {
        model: models.Department,
        attributes: ['id', 'name']
      }
    ]
  });

  res.status(200).json({
    success: true,
    data: breakTimings
  });
});

/**
 * Create a new break timing for a year
 */
export const createBreakTiming = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { year, break_name, start_time, end_time, duration_minutes } = req.body;

  // Validate required fields
  if (!year || !break_name || !start_time || !end_time) {
    throw new ErrorResponse('Year, break name, start time, and end time are required', 400);
  }

  // Validate year
  if (!['1st', '2nd', '3rd', '4th'].includes(year)) {
    throw new ErrorResponse('Invalid year. Must be 1st, 2nd, 3rd, or 4th', 400);
  }

  // Validate time format (HH:MM:SS)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/;
  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    throw new ErrorResponse('Invalid time format. Use HH:MM or HH:MM:SS', 400);
  }

  // Validate end time is after start time
  if (end_time <= start_time) {
    throw new ErrorResponse('End time must be after start time', 400);
  }

  // Check if break timing already exists for this time slot
  const existingBreak = await models.YearBreakTiming.findOne({
    where: {
      department_id,
      year,
      break_name
    }
  });

  if (existingBreak) {
    throw new ErrorResponse(`Break '${break_name}' already exists for ${year} year`, 409);
  }

  // Calculate duration if not provided
  let calculatedDuration = duration_minutes;
  if (!calculatedDuration) {
    const [startHours, startMins] = start_time.split(':').map(Number);
    const [endHours, endMins] = end_time.split(':').map(Number);
    const startTotalMins = startHours * 60 + startMins;
    const endTotalMins = endHours * 60 + endMins;
    calculatedDuration = endTotalMins - startTotalMins;
  }

  const breakTiming = await models.YearBreakTiming.create({
    department_id,
    year,
    break_name,
    start_time,
    end_time,
    duration_minutes: calculatedDuration
  });

  res.status(201).json({
    success: true,
    data: breakTiming
  });
});

/**
 * Update break timing
 */
export const updateBreakTiming = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { id } = req.params;
  const { year, break_name, start_time, end_time, duration_minutes } = req.body;

  const breakTiming = await models.YearBreakTiming.findOne({
    where: { id, department_id }
  });

  if (!breakTiming) {
    throw new ErrorResponse('Break timing not found', 404);
  }

  // Validate year if provided
  if (year && !['1st', '2nd', '3rd', '4th'].includes(year)) {
    throw new ErrorResponse('Invalid year. Must be 1st, 2nd, 3rd, or 4th', 400);
  }

  // Validate times if provided
  if (start_time || end_time) {
    const newStart = start_time || breakTiming.start_time;
    const newEnd = end_time || breakTiming.end_time;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/;

    if (!timeRegex.test(newStart) || !timeRegex.test(newEnd)) {
      throw new ErrorResponse('Invalid time format. Use HH:MM or HH:MM:SS', 400);
    }

    if (newEnd <= newStart) {
      throw new ErrorResponse('End time must be after start time', 400);
    }
  }

  // Check for duplicate break name if year or break_name is changing
  if ((year || break_name) && (year !== breakTiming.year || break_name !== breakTiming.break_name)) {
    const duplicate = await models.YearBreakTiming.findOne({
      where: {
        department_id,
        year: year || breakTiming.year,
        break_name: break_name || breakTiming.break_name,
        id: { [models.Sequelize.Op.ne]: id }
      }
    });

    if (duplicate) {
      throw new ErrorResponse('A break with this name already exists for this year', 409);
    }
  }

  // Calculate new duration if times changed
  let newDuration = duration_minutes || breakTiming.duration_minutes;
  if (start_time || end_time) {
    const [startHours, startMins] = (start_time || breakTiming.start_time).split(':').map(Number);
    const [endHours, endMins] = (end_time || breakTiming.end_time).split(':').map(Number);
    const startTotalMins = startHours * 60 + startMins;
    const endTotalMins = endHours * 60 + endMins;
    newDuration = endTotalMins - startTotalMins;
  }

  await breakTiming.update({
    year: year || breakTiming.year,
    break_name: break_name || breakTiming.break_name,
    start_time: start_time || breakTiming.start_time,
    end_time: end_time || breakTiming.end_time,
    duration_minutes: newDuration
  });

  res.status(200).json({
    success: true,
    data: breakTiming
  });
});

/**
 * Delete break timing
 */
export const deleteBreakTiming = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { id } = req.params;

  const breakTiming = await models.YearBreakTiming.findOne({
    where: { id, department_id }
  });

  if (!breakTiming) {
    throw new ErrorResponse('Break timing not found', 404);
  }

  await breakTiming.destroy();

  res.status(200).json({
    success: true,
    message: 'Break timing deleted successfully'
  });
});

/**
 * Bulk create break timings for a year (useful for initial setup)
 */
export const bulkCreateBreakTimings = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { year, breaks } = req.body;

  if (!year || !Array.isArray(breaks) || breaks.length === 0) {
    throw new ErrorResponse('Year and breaks array are required', 400);
  }

  if (!['1st', '2nd', '3rd', '4th'].includes(year)) {
    throw new ErrorResponse('Invalid year. Must be 1st, 2nd, 3rd, or 4th', 400);
  }

  // Delete existing breaks for this year
  await models.YearBreakTiming.destroy({
    where: { department_id, year }
  });

  // Create new breaks
  const createdBreaks = await Promise.all(
    breaks.map(async (breakItem) => {
      const { break_name, start_time, end_time, duration_minutes } = breakItem;

      if (!break_name || !start_time || !end_time) {
        throw new ErrorResponse('Each break must have name, start_time, and end_time', 400);
      }

      // Calculate duration
      const [startHours, startMins] = start_time.split(':').map(Number);
      const [endHours, endMins] = end_time.split(':').map(Number);
      const startTotalMins = startHours * 60 + startMins;
      const endTotalMins = endHours * 60 + endMins;
      const calcDuration = duration_minutes || (endTotalMins - startTotalMins);

      return await models.YearBreakTiming.create({
        department_id,
        year,
        break_name,
        start_time,
        end_time,
        duration_minutes: calcDuration
      });
    })
  );

  res.status(201).json({
    success: true,
    data: createdBreaks,
    message: `Created ${createdBreaks.length} break timings for ${year} year`
  });
});
