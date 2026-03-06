import fs from 'fs';
import { models } from '../../models/index.js';
import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { Op } from 'sequelize';
/**
 * Check if faculty is a timetable incharge OR department admin for their department
 */
export const checkTimetableIncharge = asyncHandler(async (req, res, next) => {
  // Allow both timetable incharge and department admin roles
  // ERP Logic: Both roles can manage timetables
  // Check for both string role and numeric role_id (7 = department admin)
  const isDepartmentAdmin = 
    req.user.role === 'department_admin' || 
    req.user.role === 'department-admin' ||
    req.user.role_id === 7;
  
  if (
    !req.user.is_timetable_incharge &&
    !isDepartmentAdmin
  ) {
    return res.status(403).json({
      message: 'Only timetable incharge or department admin can access this resource'
    });
  }

  next();
});

/**
 * Get all timetables for a department.
 *
 * The `year` path parameter is accepted for compatibility but the
 * Timetable model does *not* have a `year` column. Originally the UI
 * used this to filter, but it resulted in SQL errors. We ignore it and
 * simply return every timetable belonging to the department.
 */
export const getTimetablesByDepartmentAndYear = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  
  // DEBUG: Log user info to diagnose department_id issue
  console.log('[DEBUG] getTimetablesByDepartmentAndYear - user:', JSON.stringify({
    userId: req.user.id,
    role: req.user.role,
    role_id: req.user.role_id,
    department_id: req.user.department_id,
    department: req.user.department,
    departmentCode: req.user.departmentCode
  }));

  // Validate department_id exists
  if (!department_id) {
    console.error('[DEBUG] department_id is missing or undefined!');
    return res.status(500).json({
      success: false,
      message: 'Department ID not found in user session. Please re-login.'
    });
  }

  const timetables = await models.Timetable.findAll({
    where: { department_id },
    include: [
      {
        model: models.Department,
        attributes: ['id', 'name']
      },
      {
        model: models.TimetableSlot,
        include: [
          { model: models.Subject, attributes: ['id', 'name'] },
          { model: models.Class, attributes: ['id', 'name'] }
        ]
      }
    ]
  });

  res.status(200).json({
    success: true,
    data: timetables
  });
});

/**
 * Create a new timetable for the department
 */
export const createTimetable = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { year, session_start, session_end, is_published } = req.body;

  // Validate required fields
  if (!year || !session_start || !session_end) {
    throw new ErrorResponse('Year, session start, and session end are required', 400);
  }

  // Check if timetable already exists for this department and year
  const existingTimetable = await models.Timetable.findOne({
    where: { department_id, year }
  });

  if (existingTimetable) {
    throw new ErrorResponse(`Timetable already exists for ${year} year`, 409);
  }

  const timetable = await models.Timetable.create({
    department_id,
    year,
    session_start,
    session_end,
    is_published: is_published || false
  });

  res.status(201).json({
    success: true,
    data: timetable
  });
});

/**
 * Update timetable
 */
export const updateTimetable = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { id } = req.params;
  const { year, session_start, session_end, is_published } = req.body;

  const timetable = await models.Timetable.findOne({
    where: { id, department_id }
  });

  if (!timetable) {
    throw new ErrorResponse('Timetable not found', 404);
  }

  // If trying to change year, check no duplicate exists
  if (year && year !== timetable.year) {
    const duplicate = await models.Timetable.findOne({
      where: { department_id, year }
    });
    if (duplicate) {
      throw new ErrorResponse(`Timetable already exists for ${year} year`, 409);
    }
  }

  await timetable.update({
    year: year || timetable.year,
    session_start: session_start || timetable.session_start,
    session_end: session_end || timetable.session_end,
    is_published: is_published !== undefined ? is_published : timetable.is_published
  });

  res.status(200).json({
    success: true,
    data: timetable
  });
});

/**
 * Assign faculty to a timetable slot
 * Validates: One faculty → One subject per class (per session)
 */
export const assignFacultyToSlot = asyncHandler(async (req, res, next) => {
  const { faculty_id: incharge_id, department_id } = req.user;
  const { timetable_id, class_id, subject_code, subject_name, faculty_id, day_of_week, start_time, end_time, room_number } = req.body;

  // Validate all required fields
  if (!timetable_id || !class_id || !subject_code || !subject_name || !faculty_id || !day_of_week || !start_time || !end_time) {
    throw new ErrorResponse('All required fields must be provided', 400);
  }

  // Verify timetable belongs to incharge's department
  const timetable = await models.Timetable.findOne({
    where: { id: timetable_id, department_id }
  });

  if (!timetable) {
    throw new ErrorResponse('Timetable not found', 404);
  }

  // Verify faculty belongs to same department
  const faculty = await models.Faculty.findOne({
    where: { faculty_id, department_id }
  });

  if (!faculty) {
    throw new ErrorResponse('Faculty not found in your department', 404);
  }

  // Check if faculty is already assigned to this subject in this class (for the entire timetable/session)
  const existingAssignment = await models.TimetableSlotAssignment.findOne({
    where: {
      timetable_id,
      class_id,
      subject_code,
      faculty_id,
      status: ['active', 'pending_approval']
    }
  });

  if (existingAssignment) {
    throw new ErrorResponse('Faculty is already assigned to this subject for this class', 409);
  }

  // Check for time slot conflicts for the faculty
  const timeConflict = await models.TimetableSlotAssignment.findOne({
    where: {
      faculty_id,
      day_of_week,
      start_time,
      end_time,
      year: timetable.year,
      status: ['active', 'pending_approval']
    }
  });

  if (timeConflict) {
    throw new ErrorResponse('Faculty has a time conflict with another class at this time slot', 409);
  }

  // Check for class room conflict
  const roomConflict = await models.TimetableSlotAssignment.findOne({
    where: {
      class_id,
      day_of_week,
      start_time,
      end_time,
      room_number,
      status: ['active', 'pending_approval']
    }
  });

  if (roomConflict) {
    throw new ErrorResponse('Room is already booked for this time slot', 409);
  }

  // Create the assignment
  const assignment = await models.TimetableSlotAssignment.create({
    timetable_id,
    class_id,
    subject_code,
    subject_name,
    faculty_id,
    assigned_by: incharge_id,
    day_of_week,
    start_time,
    end_time,
    room_number,
    year: timetable.year,
    status: 'pending_approval'
  });

  // Create notification for faculty
  await models.TimetableNotification.create({
    slot_assignment_id: assignment.id,
    subject_code,
    subject_name,
    class_id,
    faculty_id,
    requested_by: incharge_id,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    data: assignment,
    message: 'Faculty assigned to slot. Notification sent to faculty.'
  });
});

/**
 * Change faculty assignment for a slot (reassign)
 */
export const changeFacultyAssignment = asyncHandler(async (req, res, next) => {
  const { faculty_id: incharge_id, department_id } = req.user;
  const { assignment_id } = req.params;
  const { new_faculty_id, reason } = req.body;

  if (!new_faculty_id) {
    throw new ErrorResponse('New faculty ID is required', 400);
  }

  // Get existing assignment
  const assignment = await models.TimetableSlotAssignment.findOne({
    where: { id: assignment_id },
    include: [
      {
        model: models.Timetable,
        attributes: ['id', 'year', 'department_id']
      }
    ]
  });

  if (!assignment) {
    throw new ErrorResponse('Assignment not found', 404);
  }

  // Verify incharge owns this assignment
  if (assignment.Timetable.department_id !== department_id) {
    throw new ErrorResponse('You do not have permission to modify this assignment', 403);
  }

  // Verify new faculty belongs to same department
  const newFaculty = await models.Faculty.findOne({
    where: { id: new_faculty_id, department_id }
  });

  if (!newFaculty) {
    throw new ErrorResponse('New faculty not found in your department', 404);
  }

  // Check if new faculty is already assigned to this subject in this class
  const duplicateAssignment = await models.TimetableSlotAssignment.findOne({
    where: {
      timetable_id: assignment.timetable_id,
      class_id: assignment.class_id,
      subject_code: assignment.subject_code,
      faculty_id: new_faculty_id,
      id: { [Op.ne]: assignment_id },
      status: ['active', 'pending_approval']
    }
  });

  // Check for time conflict with new faculty
  const timeConflict = await models.TimetableSlotAssignment.findOne({
    where: {
      faculty_id: new_faculty_id,
      day_of_week: assignment.day_of_week,
      start_time: assignment.start_time,
      end_time: assignment.end_time,
      year: assignment.Timetable.year,
      id: { [Op.ne]: assignment_id },
      status: ['active', 'pending_approval']
    }
  });

  if (timeConflict) {
    throw new ErrorResponse('New faculty has a time conflict at this time slot', 409);
  }

  // Record the old faculty for notification purposes
  const oldFacultyId = assignment.faculty_id;

  // Update assignment
  await assignment.update({
    faculty_id: new_faculty_id,
    status: 'pending_approval'
  });

  // Create new notification for new faculty
  await models.TimetableNotification.create({
    slot_assignment_id: assignment.id,
    subject_code: assignment.subject_code,
    subject_name: assignment.subject_name,
    class_id: assignment.class_id,
    faculty_id: new_faculty_id,
    requested_by: incharge_id,
    status: 'pending'
  });

  // Optionally notify old faculty about reassignment
  if (reason) {
    // Could create a separate alteration record or notification
    await models.TimetableAlteration.create({
      department_id,
      timetable_id: assignment.timetable_id,
      faculty_id: oldFacultyId,
      old_faculty_id: oldFacultyId,
      new_faculty_id,
      slot_assignment_id: assignment.id,
      reason: `Faculty reassigned: ${reason}`,
      status: 'approved',
      approved_by: incharge_id,
      approved_at: new Date()
    });
  }

  res.status(200).json({
    success: true,
    data: assignment,
    message: 'Faculty reassigned. New notification sent to updated faculty.'
  });
});

/**
 * Get available faculty for assignment to a class
 */
export const getAvailableFacultyForClass = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { timetable_id, class_id, subject_id, day_of_week, start_time, end_time, year } = req.query;

  // Base query: faculty in department, not on leave
  let available = await models.Faculty.findAll({
    where: { department_id },
    attributes: ['id', 'first_name', 'last_name', 'email'],
    include: [
      {
        model: models.Subject,
        through: { attributes: [] },
        where: subject_id ? { id: subject_id } : undefined,
        required: !!subject_id
      }
    ]
  });

  // Filter out faculty with time conflicts
  if (day_of_week && start_time && end_time && year) {
    available = await Promise.all(
      available.map(async (faculty) => {
        const conflict = await models.TimetableSlotAssignment.findOne({
          where: {
            faculty_id: faculty.id,
            day_of_week,
            start_time,
            end_time,
            year,
            status: ['active', 'pending_approval']
          }
        });
        return conflict ? null : faculty;
      })
    );
    available = available.filter(f => f !== null);
  }

  res.status(200).json({
    success: true,
    data: available
  });
});

/**
 * Get all slot assignments for a timetable
 */
export const getSlotAssignments = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { timetable_id } = req.params;

  const timetable = await models.Timetable.findOne({
    where: { id: timetable_id, department_id }
  });

  if (!timetable) {
    throw new ErrorResponse('Timetable not found', 404);
  }

  const assignments = await models.TimetableSlotAssignment.findAll({
    where: { timetable_id },
    include: [
      {
        model: models.Faculty,
        attributes: ['id', 'first_name', 'last_name', 'email']
      },
      {
        model: models.Subject,
        attributes: ['id', 'name', 'code']
      },
      {
        model: models.Class,
        attributes: ['id', 'name', 'year']
      }
    ],
    order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
  });

  res.status(200).json({
    success: true,
    data: assignments
  });
});

/**
 * Delete a slot assignment
 */
export const deleteSlotAssignment = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { assignment_id } = req.params;

  const assignment = await models.TimetableSlotAssignment.findOne({
    where: { id: assignment_id },
    include: [
      {
        model: models.Timetable,
        attributes: ['department_id']
      }
    ]
  });

  if (!assignment) {
    throw new ErrorResponse('Assignment not found', 404);
  }

  if (assignment.Timetable.department_id !== department_id) {
    throw new ErrorResponse('You do not have permission to delete this assignment', 403);
  }

  // Delete associated notifications
  await models.TimetableNotification.destroy({
    where: { slot_assignment_id: assignment_id }
  });

  await assignment.destroy();

  res.status(200).json({
    success: true,
    message: 'Slot assignment deleted successfully'
  });
});

/**
 * Publish timetable (mark as final)
 */
export const publishTimetable = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { timetable_id } = req.params;

  const timetable = await models.Timetable.findOne({
    where: { id: timetable_id, department_id }
  });

  if (!timetable) {
    throw new ErrorResponse('Timetable not found', 404);
  }

  // Check all critical assignments are approved
  const pendingAssignments = await models.TimetableSlotAssignment.findCount({
    where: {
      timetable_id,
      status: 'pending_approval'
    }
  });

  if (pendingAssignments > 0) {
    throw new ErrorResponse(`Cannot publish: ${pendingAssignments} assignments are still pending approval`, 400);
  }

  await timetable.update({ is_published: true });

  res.status(200).json({
    success: true,
    data: timetable,
    message: 'Timetable published successfully'
  });
});

/**
 * Get all faculty within the department
 */
export const getDepartmentFaculty = asyncHandler(async (req, res, next) => {
  // Determine which department to filter by. Prefer authenticated session,
  // fallback to query string if somebody passes it explicitly (helps tests).
  let department_id =
    req.user?.department_id ||
    req.user?.departmentId ||
    req.user?.department?.id ||
    req.user?.department?.department_id ||
    null;

  // support query parameter in case frontend wants to send it directly
  if (!department_id && req.query.department_id) {
    department_id = req.query.department_id;
  }

  // cast to integer and validate
  department_id = department_id !== null ? parseInt(department_id, 10) : null;

  // if we still don't have a department_id we can try a lightweight lookup
  if (!department_id || isNaN(department_id)) {
    const userId = req.user.faculty_id || req.user.id;
    if (userId) {
      const faculty = await models.Faculty.findByPk(userId, {
        attributes: ['department_id']
      });
      if (faculty && faculty.department_id) {
        department_id = faculty.department_id;
      }
    }
  }

  if (!department_id || isNaN(department_id)) {
    // if we still can't resolve a department, do not crash the page,
    // simply return an empty list and allow the frontend to render
    // without faculty options.  This usually means the user's account
    // isn't linked to a department; the message can guide them.
    console.warn('Department ID missing for user', req.user?.id);
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
      message: 'No department associated with your account'
    });
  }

  // If frontend sent a year filter, return only faculty who teach that year
  // in the department by querying the simple timetable table.
  const yearParam = req.query.year;
  if (yearParam) {
    // Support Roman numerals like I, II, III, IV as well as numeric strings
    const romanToNumber = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };
    let yearValue = yearParam;
    if (typeof yearValue === 'string') {
      const up = yearValue.trim().toUpperCase();
      if (romanToNumber[up]) yearValue = romanToNumber[up];
      else yearValue = parseInt(yearValue, 10);
    }

    // Determine department short name used in TimetableSimple.department
    let departmentShort = req.user?.department || null;
    if (!departmentShort && department_id) {
      const dept = await models.Department.findByPk(department_id, { attributes: ['short_name'] });
      if (dept) departmentShort = dept.short_name;
    }

    if (!departmentShort) {
      return res.status(200).json({ success: true, count: 0, data: [], message: 'Department not resolved' });
    }

    // Query TimetableSimple for distinct faculty entries matching department and year
    const facultyRows = await models.TimetableSimple.findAll({
      where: {
        department: departmentShort,
        year: yearValue
      },
      attributes: ['facultyId', 'facultyName'],
      group: ['facultyId', 'facultyName'],
      order: [['facultyName', 'ASC']]
    });

    // Normalize field names to match existing frontend expectations
    const data = facultyRows.map(r => ({ faculty_id: r.facultyId, Name: r.facultyName }));

    return res.status(200).json({ success: true, count: data.length, data });
  }

  // Default: return all active faculty in department
  const faculties = await models.Faculty.findAll({
    where: {
      department_id,
      status: 'active'
    },
    attributes: ['faculty_id', 'Name', 'email', 'designation', 'department_id'],
    order: [['Name', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: faculties.length,
    data: faculties
  });
});

/**
 * Upload Timetable CSV for a specific faculty
 * Parses Day, Time, Subject Code, Subject Name, Class Room No
 */
export const uploadTimetableCSV = asyncHandler(async (req, res, next) => {
  const { department_id } = req.user;
  const { faculty_id, year, semester } = req.body;

  // Debug: Log what's received
  console.debug('[uploadTimetableCSV] Received body:', req.body);
  console.debug('[uploadTimetableCSV] Received files:', req.files);

  if (!department_id) {
    throw new ErrorResponse('Your account is not associated with a department', 400);
  }

  // Diagnostic logging to help debug issues
  console.debug('[uploadTimetableCSV] department_id=%s, faculty_id=%s, year=%s, semester=%s',
    department_id, faculty_id, year, semester);

  // Convert faculty_id to integer if it's a string
  const facultyIdInt = parseInt(faculty_id, 10);
  if (isNaN(facultyIdInt)) {
    throw new ErrorResponse('Invalid faculty ID format', 400);
  }

  if (!req.files || !req.files.file) {
    throw new ErrorResponse(`CSV file is required. Received: files=${!!req.files}, file=${!!req.files?.file}`, 400);
  }

  const file = req.files.file;
  if (!file.mimetype.includes('csv')) {
    throw new ErrorResponse('Please upload a valid CSV file', 400);
  }

  // Verify faculty belongs to the department
  const faculty = await models.Faculty.findOne({
    where: { faculty_id: facultyIdInt, department_id }
  });

  if (!faculty) {
    throw new ErrorResponse('Faculty not found in your department', 404);
  }

  // Read uploaded CSV file as string
  let fileContent = '';
  if (file.tempFilePath) {
    fileContent = fs.readFileSync(file.tempFilePath, 'utf-8');
  } else if (file.data) {
    fileContent = file.data.toString('utf-8');
  } else {
    throw new ErrorResponse('File upload error: no file content found.', 400);
  }

  // Convert file content into rows array only once
  const csvRows = fileContent
    .split(/\r?\n/)
    .slice(1)
    .filter(row => row.trim() !== "");

  console.log("Total Rows Parsed:", csvRows.length);

  // Day normalization mapping - handle both short and full day names
  const dayMap = {
    'mon': 'Monday', 'monday': 'Monday',
    'tue': 'Tuesday', 'tuesday': 'Tuesday',
    'wed': 'Wednesday', 'wednesday': 'Wednesday',
    'thu': 'Thursday', 'thursday': 'Thursday',
    'fri': 'Friday', 'friday': 'Friday',
    'sat': 'Saturday', 'saturday': 'Saturday'
  };

  const normalizeDay = (day) => {
    if (!day) return null;
    const normalized = day.toLowerCase().trim();
    return dayMap[normalized] || day; // Return original if not found in map
  };

  // Convert academic year format (e.g., "2025-2026") to single year (e.g., "2025")
  const academicYear = year && year.includes('-') ? year.split('-')[0] : year || new Date().getFullYear().toString();

  let timetable = await models.Timetable.findOne({
    where: {
      department_id,
      academic_year: academicYear,
      semester: semester || 'odd'
    }
  });

  if (!timetable) {
    timetable = await models.Timetable.create({
      name: `Faculty Timetable ${academicYear}`,
      academic_year: academicYear,
      semester: semester || 'odd',
      department_id,
      status: 'active',
      created_by: req.user.id
    });
  }

  const timetableId = timetable?.id;
  console.debug('[uploadTimetableCSV] timetableId=', timetableId, 'timetableObj=', timetable?.toJSON ? timetable.toJSON() : timetable);
  if (!timetableId) {
    throw new ErrorResponse('Upload error: unable to determine timetable id', 500);
  }

  // Clear existing slots for THIS timetable AND faculty before inserting new ones
  // This prevents duplicate key errors when re-uploading timetable
  // ERP Rule: Replace timetable instead of appending
  try {
    await models.TimetableSlot.destroy({
      where: {
        timetable_id: timetableId,
        faculty_id: facultyIdInt
      }
    });
    console.log('Existing slots for faculty deleted successfully');
  } catch (deleteError) {
    console.error('Error deleting slots:', deleteError);
    throw deleteError;
  }

  const slotsToCreate = [];

  // Loop through rows safely - do NOT split csvRows again
  for (const line of csvRows) {
    // Support CSVs using comma or tab separators (some exports use tabs)
    // Also remove any remaining carriage return characters
    const cols = line.replace(/\r/g, '').split(/,|\t/).map(c => c.trim().replace(/^"|"$/g, ''));

    console.log("Parsed Row:", cols);

    // Skip empty rows or rows with insufficient columns
    if (cols.length < 5 || cols.every(c => c === '')) continue;

    let [day, timeRange, subjectCode, subjectName, roomNo] = cols;

    // Normalize the day to full name (e.g., "Mon" -> "Monday")
    day = normalizeDay(day);

    // Skip rows with invalid day values after normalization
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!day || !validDays.includes(day)) {
      console.warn(`Invalid day value: "${cols[0]}", skipping row`);
      continue;
    }
    let [startTime, endTime] = timeRange.split('-');

    // Trim time values to remove hidden spaces that cause duplicates
    startTime = startTime ? startTime.trim() : '';
    endTime = endTime ? endTime.trim() : '';

    // Ensure valid time format (HH:MM to HH:MM:00 for TIME type)
    if (startTime && startTime.length === 5) startTime += ':00';
    if (endTime && endTime.length === 5) endTime += ':00';

    // Auto-find or create subject; prevents duplicates using UNIQUE constraint
    // department admin's id used for audit
    const adminId = req.user && req.user.id ? req.user.id : 0;

    const [subject, created] = await models.Subject.findOrCreate({
      where: { subject_code: subjectCode },
      defaults: {
        subject_name: subjectName,
        department_id,
        credits: 3,
        created_by: adminId
      }
    });
    // subject now guaranteed to exist; 'created' indicates if it was new
    // we ignore 'created' but could log if needed


    slotsToCreate.push({
      timetable_id: timetableId,
      day,
      period_number: slotsToCreate.length + 1, // simple mapping, can be refined based on time
      start_time: startTime,
      end_time: endTime,
      faculty_id: faculty.faculty_id,
      subject_id: subject.id,
      room: roomNo,
      type: 'lecture',
      status: 'active'
    });
  }

  if (slotsToCreate.length > 0) {
    // Remove duplicates from slotData before inserting
    // This prevents bulkCreate failure due to UNIQUE constraint (timetable_id, day, start_time)
    const uniqueSlots = [];
    const seen = new Set();

    for (const slot of slotsToCreate) {
      const key = `${slot.day}_${slot.start_time}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSlots.push(slot);
      }
    }

    console.log('Unique slots to insert:', uniqueSlots);

    try {
      // clear old slots for this timetable (already done above) and then insert new ones
      await models.TimetableSlot.bulkCreate(uniqueSlots);
    } catch (bulkError) {
      console.error('Bulk create error details:', {
        message: bulkError.message,
        original: bulkError.original,
        errors: bulkError.errors,
        sql: bulkError.sql
      });
      
      // Provide more helpful error message based on error type
      let errorMessage = bulkError.message;
      
      // Check for specific validation errors
      if (bulkError.errors && bulkError.errors.length > 0) {
        const validationErrors = bulkError.errors.map(e => e.message).join(', ');
        errorMessage = `Validation Error: ${validationErrors}`;
      }
      
      // Check for unique constraint violation
      if (bulkError.original && bulkError.original.code === 'ER_DUP_ENTRY') {
        errorMessage = 'Duplicate entry error: A slot with this day and time already exists';
      }
      
      throw new ErrorResponse(`Database Error: ${errorMessage}`, 500);
    }
  }

  res.status(200).json({
    success: true,
    message: `Successfully uploaded ${slotsToCreate.length} timetable slots for ${faculty.Name}`,
    data: slotsToCreate
  });
});

