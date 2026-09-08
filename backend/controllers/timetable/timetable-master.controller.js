import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models, sequelize } from '../../models/index.js';
import { Op, QueryTypes } from 'sequelize';

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

  // Validate coordinators belong to same department
  if (class_coordinator_id || asst_coordinator_id || timetable_incharge_id || hod_id) {
    const coordinatorIds = [class_coordinator_id, asst_coordinator_id, timetable_incharge_id, hod_id].filter(id => id);

    if (coordinatorIds.length > 0) {
      const departmentFaculties = await Faculty.findAll({
        where: { department_id, status: 'active' },
        attributes: ['faculty_id'],
        raw: true,
      });
      const validFacultyIds = departmentFaculties.map(f => f.faculty_id);

      for (const coordinatorId of coordinatorIds) {
        if (!validFacultyIds.includes(coordinatorId)) {
          return next(new ErrorResponse(
            `Faculty ${coordinatorId} is not in department ${department_id}`,
            400
          ));
        }
      }

      // Allow same faculty in multiple roles - no restriction on multiple assignments
      // Faculty can be class coordinator AND timetable incharge
    }
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

  const finalBreakPeriodIds = Array.isArray(req.body.break_period_ids) ? req.body.break_period_ids : [];

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
    status: 'draft',
    class_coordinator_id: class_coordinator_id || null,
    asst_coordinator_id: asst_coordinator_id || null,
    timetable_incharge_id: timetable_incharge_id || null,
    hod_id: hod_id || null,
    created_by: req.user.faculty_id || req.user.id,
    break_period_ids: finalBreakPeriodIds,
  });

  // Sync faculty flags
  if (timetable_incharge_id) {
    await Faculty.update(
      { is_timetable_incharge: true },
      { where: { faculty_id: timetable_incharge_id } }
    );
  }
  if (class_coordinator_id) {
    await Faculty.update(
      { is_class_incharge: true },
      { where: { faculty_id: class_coordinator_id } }
    );
  }

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

  // IMPORTANT: req.user.role is a plain string (e.g. 'faculty', 'department-admin')
  // NOT an object - so never use req.user.role.name
  const userRole = typeof req.user?.role === 'string'
    ? req.user.role
    : (req.user?.role?.role_name || req.user?.role?.name || '');
  const userDepartmentId = req.user?.department_id;
  const facultyId = req.user?.faculty_id;

  console.log('[TIMETABLE-MASTER] getTimetableMasters called by user:', {
    userId: req.user?.id,
    role: userRole,
    userDepartmentId,
    facultyId,
    queryDepartmentId: req.query.department_id,
  });

  if (userRole === 'department-admin') {
    // Department admins see ALL timetables in their own department
    if (!userDepartmentId) {
      return next(new ErrorResponse('User department ID not found', 400));
    }
    where.department_id = userDepartmentId;
    console.log('[TIMETABLE-MASTER] dept-admin: restricting to dept:', userDepartmentId);
  } else if (userRole === 'faculty') {
    // Regular faculty can ONLY see timetables from their OWN department
    // AND ONLY the ones where they are assigned as timetable_incharge
    if (!userDepartmentId || !facultyId) {
      return next(new ErrorResponse('User department ID or faculty ID not found', 400));
    }
    where.department_id = userDepartmentId;
    where.timetable_incharge_id = facultyId;
    console.log('[TIMETABLE-MASTER] faculty timetable-incharge: dept', userDepartmentId, 'faculty', facultyId);
  } else if (req.query.department_id) {
    // For superadmin, allow filtering by department_id if provided
    where.department_id = req.query.department_id;
  }

  // Filters
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
      { model: Faculty, as: 'class_coordinator', attributes: ['faculty_id', 'Name', 'email', 'faculty_college_code'] },
      { model: Faculty, as: 'asst_coordinator', attributes: ['faculty_id', 'Name', 'email', 'faculty_college_code'] },
      { model: Faculty, as: 'timetable_incharge', attributes: ['faculty_id', 'Name', 'email', 'faculty_college_code'] },
      { model: Faculty, as: 'hod', attributes: ['faculty_id', 'Name', 'email', 'faculty_college_code'] },
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
      { model: Faculty, as: 'class_coordinator', attributes: ['faculty_id', 'Name', 'email', 'faculty_college_code'] },
      { model: Faculty, as: 'asst_coordinator', attributes: ['faculty_id', 'Name', 'email', 'faculty_college_code'] },
      { model: Faculty, as: 'timetable_incharge', attributes: ['faculty_id', 'Name', 'email', 'faculty_college_code'] },
      { model: Faculty, as: 'hod', attributes: ['faculty_id', 'Name', 'email', 'faculty_college_code'] },
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

  // Check department access for non-superadmin users
  // IMPORTANT: req.user.role is a plain string, not an object
  const userRole = typeof req.user?.role === 'string'
    ? req.user.role
    : (req.user?.role?.role_name || req.user?.role?.name || '');
  const userDepartmentId = req.user?.department_id;
  
  if (userRole === 'department-admin' || userRole === 'faculty') {
    if (timetable.department_id && userDepartmentId && Number(timetable.department_id) !== Number(userDepartmentId)) {
      return next(new ErrorResponse('You do not have permission to access this timetable', 403));
    }
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
  const coordinatorUpdates = {};

  // Fetch existing timetable
  const timetable = await TimetableMaster.findByPk(id);
  if (!timetable) {
    return next(new ErrorResponse(`Timetable master not found with id ${id}`, 404));
  }

  // Don't allow status change via this endpoint
  if (req.body.status) {
    return next(new ErrorResponse('Use separate endpoint to change status', 400));
  }

  // Allow updating coordinator assignments
  const allowed = ['class_coordinator_id', 'asst_coordinator_id', 'timetable_incharge_id', 'hod_id', 'revision_no'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
      if (field !== 'revision_no') {
        coordinatorUpdates[field] = req.body[field];
      }
    }
  });

  // If any coordinator is being assigned, validate they belong to the department
  if (Object.keys(coordinatorUpdates).length > 0) {
    const departmentId = timetable.department_id;
    const departmentFaculties = await Faculty.findAll({
      where: { department_id: departmentId, status: 'active' },
      attributes: ['faculty_id'],
      raw: true,
    });
    const validFacultyIds = departmentFaculties.map(f => f.faculty_id);

    // Validate each coordinator belongs to the department
    for (const [field, facultyId] of Object.entries(coordinatorUpdates)) {
      if (facultyId !== null && !validFacultyIds.includes(facultyId)) {
        return next(new ErrorResponse(
          `Faculty ${facultyId} is not in department ${departmentId}`,
          400
        ));
      }
    }

    // Allow same faculty in multiple roles - faculty can be class coordinator AND timetable incharge
    // No restriction on multiple role assignments
  }

  // Update timetable
  await timetable.update(updates);

  // Sync faculty flags based on new assignments
  if (Object.keys(coordinatorUpdates).length > 0) {
    const timetableInchargeId = updates.timetable_incharge_id || timetable.timetable_incharge_id;
    const classCoordinatorId = updates.class_coordinator_id || timetable.class_coordinator_id;

    // Update timetable incharge flag for new assignment
    if (updates.timetable_incharge_id !== undefined) {
      if (updates.timetable_incharge_id !== null) {
        await Faculty.update(
          { is_timetable_incharge: true },
          { where: { faculty_id: updates.timetable_incharge_id } }
        );
      }
      // Reset old assignment's flag if being removed
      if (timetable.timetable_incharge_id && updates.timetable_incharge_id !== timetable.timetable_incharge_id) {
        const oldCount = await TimetableMaster.count({
          where: {
            timetable_incharge_id: timetable.timetable_incharge_id,
            status: 'active',
          },
        });
        if (oldCount === 0) {
          await Faculty.update(
            { is_timetable_incharge: false },
            { where: { faculty_id: timetable.timetable_incharge_id } }
          );
        }
      }
    }

    // Update class incharge flag for class_coordinator_id
    if (updates.class_coordinator_id !== undefined) {
      if (updates.class_coordinator_id !== null) {
        await Faculty.update(
          { is_class_incharge: true },
          { where: { faculty_id: updates.class_coordinator_id } }
        );
      }
    }
  }

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
    message: 'Timetable master updated successfully',
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

  try {
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

    // Deactivate other active timetables for the same class/semester using raw query
    const [deactivateCount] = await sequelize.query(
      `UPDATE timetable_master 
       SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
       WHERE class_id = ? AND academic_year = ? AND semester = ? AND status = 'active' AND id != ?`,
      {
        replacements: [timetable.class_id, timetable.academic_year, timetable.semester, id],
        type: QueryTypes.UPDATE
      }
    );

    console.log('[activateTimetableMaster] Deactivated other timetables:', deactivateCount);

    // Activate this one using raw query
    const [activateCount] = await sequelize.query(
      `UPDATE timetable_master SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      {
        replacements: [id],
        type: QueryTypes.UPDATE
      }
    );

    console.log('[activateTimetableMaster] Activated timetable:', activateCount);

    // Sync coordinator flags for activated timetable
    if (timetable.timetable_incharge_id) {
      await Faculty.update(
        { is_timetable_incharge: true },
        { where: { faculty_id: timetable.timetable_incharge_id } }
      );
    }
    if (timetable.class_coordinator_id) {
      await Faculty.update(
        { is_class_incharge: true },
        { where: { faculty_id: timetable.class_coordinator_id } }
      );
    }

    // Fetch and return the updated record
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
  } catch (error) {
    console.error('[activateTimetableMaster] Error:', error.message, error);
    return next(new ErrorResponse(`Failed to activate timetable: ${error.message}`, 500));
  }
});

/**
 * @desc    Deactivate a timetable master
 * @route   PATCH /api/timetable-master/:id/deactivate
 * @access  Private - Department Admin only
 */
export const deactivateTimetableMaster = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const timetable = await TimetableMaster.findByPk(id);

    if (!timetable) {
      return next(new ErrorResponse(`Timetable master not found with id ${id}`, 404));
    }

    if (timetable.status === 'inactive') {
      return next(new ErrorResponse('Timetable is already inactive', 400));
    }

    // Directly update the database with raw query to avoid Sequelize validation conflicts
    const [updateCount] = await sequelize.query(
      `UPDATE timetable_master SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      {
        replacements: ['inactive', id],
        type: QueryTypes.UPDATE
      }
    );

    console.log('[deactivateTimetableMaster] Update result:', updateCount);

    // Sync coordinator flags - check if they still have other active assignments
    if (timetable.timetable_incharge_id) {
      const activeCount = await TimetableMaster.count({
        where: {
          timetable_incharge_id: timetable.timetable_incharge_id,
          status: 'active',
          id: { [Op.ne]: id }
        }
      });
      if (activeCount === 0) {
        await Faculty.update(
          { is_timetable_incharge: false },
          { where: { faculty_id: timetable.timetable_incharge_id } }
        );
      }
    }

    if (timetable.class_coordinator_id) {
      const activeCount = await TimetableMaster.count({
        where: {
          class_coordinator_id: timetable.class_coordinator_id,
          status: 'active',
          id: { [Op.ne]: id }
        }
      });
      if (activeCount === 0) {
        await Faculty.update(
          { is_class_incharge: false },
          { where: { faculty_id: timetable.class_coordinator_id } }
        );
      }
    }

    // Fetch and return the updated record
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
      message: 'Timetable master deactivated',
      data: result,
    });
  } catch (error) {
    console.error('[deactivateTimetableMaster] Error:', error.message, error);
    return next(new ErrorResponse(`Failed to deactivate timetable: ${error.message}`, 500));
  }
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
