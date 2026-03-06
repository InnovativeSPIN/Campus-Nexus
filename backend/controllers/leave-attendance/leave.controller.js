import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models, sequelize } from '../../models/index.js';
const { Leave, LeaveBalance, User, Department, Faculty, LeaveNotification } = models;
import { Op } from 'sequelize';

// @desc      Get all leave applications
// @route     GET /api/v1/leave
// @access    Private
export const getAllLeaves = asyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    let where = {};

    // For non-admin users, show only their leaves
    if (!['superadmin', 'executiveadmin', 'academicadmin'].includes(req.user.role)) {
      where.applicantId = req.user.id;
    }

    // Filter by status
    if (req.query.status) {
      where.status = req.query.status;
    }

    // Filter by leave type
    if (req.query.leaveType) {
      where.leaveType = req.query.leaveType;
    }

    // Filter by department
    if (req.query.department) {
      where.departmentId = req.query.department;
    }

    // Filter by applicant type
    if (req.query.applicantType) {
      where.applicantType = req.query.applicantType;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      where.startDate = { [Op.gte]: new Date(req.query.startDate) };
      where.endDate = { [Op.lte]: new Date(req.query.endDate) };
    }

    const total = await Leave.count({ where });
    const leaves = await Leave.findAll({
      where,
      offset: startIndex,
      limit,
      order: [['createdAt', 'DESC']],
      raw: true
    });

    res.status(200).json({
      success: true,
      count: leaves.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: leaves
    });
  } catch (error) {
    console.error('[getAllLeaves] Error:', error.message);
    return next(new ErrorResponse(`Error fetching leaves: ${error.message}`, 500));
  }
});

// @desc      Get single leave application
// @route     GET /api/v1/leave/:id
// @access    Private
export const getLeave = asyncHandler(async (req, res, next) => {
  try {
    const leave = await Leave.findByPk(req.params.id, {
      raw: true
    });

    if (!leave) {
      return next(new ErrorResponse(`Leave application not found with id of ${req.params.id}`, 404));
    }

    // Check if user is authorized to view this leave
    if (
      !['superadmin', 'executiveadmin', 'academicadmin', 'department-admin'].includes(req.user.role) &&
      leave.applicantId !== Number(req.user.id)
    ) {
      return next(new ErrorResponse('Not authorized to view this leave application', 403));
    }

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    console.error('[getLeave] Error:', error.message);
    return next(new ErrorResponse(`Error fetching leave: ${error.message}`, 500));
  }
});

// @desc      Create leave application
// @route     POST /api/v1/leave
// @access    Private
export const createLeave = asyncHandler(async (req, res, next) => {
  req.body.applicantId = req.user.id;
  req.body.applicantType = ['faculty', 'department-admin'].includes(req.user.role) ? 'faculty' : 'student';

  // Set department ID if user has department (faculty or student with department)
  if (req.user.departmentId) {
    req.body.departmentId = req.user.departmentId;
  }

  // Store reassign faculty (parse as int since FormData sends strings)
  if (req.body.reassignFacultyId) {
    const parsedId = parseInt(req.body.reassignFacultyId, 10);
    if (!isNaN(parsedId)) {
      req.body.reassign_faculty_id = parsedId;
      console.log('[Leave] Reassign faculty ID set to:', parsedId);
    }
  }

  // Handle file upload
  if (req.file) {
    req.body.documentUrl = `/uploads/leaves/${req.file.filename}`;
  }


  // Calculate total days
  const start = new Date(req.body.startDate);
  const end = new Date(req.body.endDate);
  const diffTime = Math.abs(end - start);
  req.body.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const leave = await Leave.create(req.body);

  // Notify department admin OR reassign faculty
  try {
    const senderName = req.user.Name || req.user.name || 'Faculty';
    const startStr = new Date(req.body.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const endStr = new Date(req.body.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    if (leave.reassign_faculty_id) {
      // Step 1: Notify Reassign Faculty
      await LeaveNotification.create({
        recipientId: leave.reassign_faculty_id,
        recipientType: 'faculty',
        departmentId: leave.departmentId,
        senderId: req.user.id,
        senderName,
        leaveId: leave.id,
        facultyName: senderName,
        leaveType: req.body.leaveType,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        type: 'reassignment_requested',
        title: `Load Reassignment Request`,
        message: `${senderName} has requested you to cover their classes from ${startStr} to ${endStr} due to ${req.body.leaveType} leave.`,
        isRead: false,
      });

      // Update leave to indicate waiting for substitute
      leave.substitute_status = 'pending';
      await leave.save();
    } else if (leave.departmentId) {
      // Step 1 (Direct): Notify HOD if no reassign faculty
      // But if user is the HOD themselves, notify executive admin
      const normalizedRole = req.user.role.trim().toLowerCase().replace(/-/g, '');
      const isDeptAdmin = normalizedRole === 'departmentadmin';

      if (isDeptAdmin) {
        // Notify Executive Admin
        await LeaveNotification.create({
          recipientId: null, // Broadcast to all executive admins
          recipientType: 'executiveadmin',
          departmentId: leave.departmentId,
          senderId: req.user.id,
          senderName,
          leaveId: leave.id,
          facultyName: senderName,
          leaveType: req.body.leaveType,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          type: 'leave_submitted',
          title: `HOD Leave Request: ${senderName}`,
          message: `${senderName} (HOD) has applied for ${req.body.leaveType} leave from ${startStr} to ${endStr}`,
          isRead: false,
        });
      } else {
        // Usual flow: Notify HOD
        const deptAdmin = await Faculty.findOne({
          where: { department_id: leave.departmentId, role_id: 7, status: 'active' },
          attributes: ['faculty_id'],
        });

        await LeaveNotification.create({
          recipientId: deptAdmin?.faculty_id || null,
          recipientType: 'department-admin',
          departmentId: leave.departmentId,
          senderId: req.user.id,
          senderName,
          leaveId: leave.id,
          facultyName: senderName,
          leaveType: req.body.leaveType,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          type: 'leave_submitted',
          title: `Leave Request from ${senderName}`,
          message: `${senderName} has applied for ${req.body.leaveType} leave from ${startStr} to ${endStr}`,
          isRead: false,
        });
      }
    }
  } catch (notifErr) {

    console.error('[Leave] Notification error (non-fatal):', notifErr.message);
  }

  res.status(201).json({
    success: true,
    data: leave
  });
});

// @desc      Update leave application
// @route     PUT /api/v1/leave/:id
// @access    Private
export const updateLeave = asyncHandler(async (req, res, next) => {
  let leave = await Leave.findByPk(req.params.id);

  if (!leave) {
    return next(new ErrorResponse(`Leave application not found with id of ${req.params.id}`, 404));
  }

  // Only allow update if status is pending and user is the applicant
  if (leave.status !== 'pending') {
    return next(new ErrorResponse('Cannot update leave application after it has been processed', 400));
  }

  if (leave.applicantId !== Number(req.user.id)) {
    return next(new ErrorResponse('Not authorized to update this leave application', 403));
  }

  await Leave.update(req.body, { where: { id: req.params.id } });
  leave = await Leave.findByPk(req.params.id);

  res.status(200).json({
    success: true,
    data: leave
  });
});

// @desc      Approve/Reject leave application
// @route     PUT /api/v1/leave/:id/status
// @access    Private/Admin
export const updateLeaveStatus = asyncHandler(async (req, res, next) => {
  const leave = await Leave.findByPk(req.params.id);

  if (!leave) {
    return next(new ErrorResponse(`Leave application not found with id of ${req.params.id}`, 404));
  }

  // Allow processed statuses only for higher admins or if the leave is still in the workflow
  const currentStatus = leave.status;
  const normalizedRole = req.user.role.trim().toLowerCase().replace(/-/g, '');
  const isHigherAdmin = ['superadmin', 'executiveadmin', 'academicadmin'].includes(normalizedRole);
  const isDeptAdmin = normalizedRole === 'departmentadmin';

  if (currentStatus === 'approved' || currentStatus === 'rejected' || currentStatus === 'cancelled') {
    return next(new ErrorResponse('Leave application has already been final-processed', 400));
  }

  // Check authorization - department admin can only approve leaves from their department and not their own
  if (isDeptAdmin) {
    if (leave.departmentId !== Number(req.user.departmentId)) {
      return next(new ErrorResponse('Not authorized to approve leave applications from other departments', 403));
    }
    if (leave.applicantId === req.user.id) {
      return next(new ErrorResponse('Not authorized to approve your own leave application', 403));
    }
  }

  // Flow Logic:
  // 1. If Dept Admin approves a Faculty request: status becomes 'hod_approved', notify Exec Admin.
  // 2. If Exec Admin approves any request (HOD 'pending' or Faculty 'hod_approved'): status becomes 'approved', update balance.

  let nextStatus = req.body.status;

  if (isDeptAdmin && req.body.status === 'approved') {
    // Dept Admin's approval is just an intermediate step
    nextStatus = 'hod_approved';
  }

  leave.status = nextStatus;
  leave.approvedById = req.user.id;
  leave.approvalDate = Date.now();
  leave.approvalRemarks = req.body.remarks;

  await leave.save();

  // Update leave balance if finally approved by higher admin or if HOD's own leave is approved
  if (nextStatus === 'approved' && leave.applicantType === 'faculty') {
    try {
      const currentYear = new Date().getFullYear().toString();
      const [rows] = await sequelize.query(
        'SELECT * FROM `leave_balance` WHERE userId = ? AND academicYear = ? LIMIT 1',
        { replacements: [leave.applicantId, currentYear] }
      );

      const balRow = rows && rows[0] ? rows[0] : null;
      if (balRow && balRow[leave.leaveType]) {
        let parsed = typeof balRow[leave.leaveType] === 'string'
          ? JSON.parse(balRow[leave.leaveType])
          : balRow[leave.leaveType];

        const days = parseFloat(leave.totalDays) || 0;
        parsed.balance = (parseFloat(parsed.balance) || 0) - days;
        parsed.used = (parseFloat(parsed.used) || 0) + days;

        await sequelize.query(
          `UPDATE \`leave_balance\` SET \`${leave.leaveType}\` = ? WHERE id = ?`,
          { replacements: [JSON.stringify(parsed), balRow.id] }
        );
        console.log(`[LeaveStatus] Updated balance for user ${leave.applicantId}, type ${leave.leaveType}`);
      }
    } catch (balErr) {
      console.error('[LeaveStatus] Balance update error (non-fatal):', balErr.message);
    }
  }


  // Create notifications (non-fatal)
  try {
    const approverName = req.user.Name || req.user.name || (isDeptAdmin ? 'Department Admin' : 'Executive Admin');
    const isApproved = nextStatus === 'approved';
    const isHODApproved = nextStatus === 'hod_approved';
    const isRejected = nextStatus === 'rejected';

    // Find the faculty applicant for their name
    const applicantFaculty = await Faculty.findByPk(leave.applicantId, { attributes: ['faculty_id', 'Name', 'department_id'] });
    const applicantName = applicantFaculty?.Name || 'Faculty';

    if (isHODApproved) {
      // 1. Notify Executive Admin that HOD approved it
      await LeaveNotification.create({
        recipientId: null,
        recipientType: 'executiveadmin',
        departmentId: leave.departmentId,
        senderId: req.user.id,
        senderName: approverName,
        leaveId: leave.id,
        facultyName: applicantName,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        type: 'leave_submitted', // Standard type so they see it in requests
        title: `HOD Approved Request: ${applicantName}`,
        message: `${approverName} has approved ${applicantName}'s leave. Waiting for your final sign-off.`,
        isRead: false,
      });

      // 2. Notify Faculty that HOD approved (intermediate)
      await LeaveNotification.create({
        recipientId: leave.applicantId,
        recipientType: 'faculty',
        departmentId: leave.departmentId,
        senderId: req.user.id,
        senderName: approverName,
        leaveId: leave.id,
        facultyName: applicantName,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        type: 'leave_approved',
        title: `HOD Step Completed`,
        message: `Your leave has been approved by your HOD. It's now with the Executive Admin for final approval.`,
        isRead: false,
      });
    } else if (isApproved || isRejected) {
      const statusLabel = isApproved ? 'Approved' : 'Rejected';

      // Notify the faculty who applied
      await LeaveNotification.create({
        recipientId: leave.applicantId,
        recipientType: 'faculty',
        departmentId: leave.departmentId,
        senderId: req.user.id,
        senderName: approverName,
        leaveId: leave.id,
        facultyName: applicantName,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        type: isApproved ? 'leave_approved' : 'leave_rejected',
        title: `Leave ${statusLabel}`,
        message: `Your ${leave.leaveType} leave request has been ${statusLabel} by the ${isDeptAdmin ? 'Department Admin' : 'Executive Admin'}.${req.body.remarks ? ` Remarks: ${req.body.remarks}` : ''}`,
        isRead: false,
      });
    }
  } catch (notifErr) {
    console.error('[LeaveStatus] Notification error (non-fatal):', notifErr.message);
  }

  res.status(200).json({
    success: true,
    data: leave
  });
});

// @desc      Cancel leave application
// @route     PUT /api/v1/leave/:id/cancel
// @access    Private
export const cancelLeave = asyncHandler(async (req, res, next) => {
  const leave = await Leave.findByPk(req.params.id);

  if (!leave) {
    return next(new ErrorResponse(`Leave application not found with id of ${req.params.id}`, 404));
  }

  if (leave.applicantId !== Number(req.user.id)) {
    return next(new ErrorResponse('Not authorized to cancel this leave application', 403));
  }

  // If leave was approved, restore balance
  if (leave.status === 'approved') {
    try {
      const currentYear = new Date().getFullYear().toString();
      const [rows] = await sequelize.query(
        'SELECT * FROM `leave_balance` WHERE userId = ? AND academicYear = ? LIMIT 1',
        { replacements: [leave.applicantId, currentYear] }
      );

      const balRow = rows && rows[0] ? rows[0] : null;
      if (balRow && balRow[leave.leaveType]) {
        let parsed = typeof balRow[leave.leaveType] === 'string'
          ? JSON.parse(balRow[leave.leaveType])
          : balRow[leave.leaveType];

        const days = parseFloat(leave.totalDays) || 0;
        // Restore balance
        parsed.balance = (parseFloat(parsed.balance) || 0) + days;
        parsed.used = (parseFloat(parsed.used) || 0) - days;

        await sequelize.query(
          `UPDATE \`leave_balance\` SET \`${leave.leaveType}\` = ? WHERE id = ?`,
          { replacements: [JSON.stringify(parsed), balRow.id] }
        );
        console.log(`[CancelLeave] Restored balance for user ${leave.applicantId}, type ${leave.leaveType}`);
      }
    } catch (balErr) {
      console.error('[CancelLeave] Balance restoration error (non-fatal):', balErr.message);
    }
  }

  leave.status = 'cancelled';
  await leave.save();

  res.status(200).json({
    success: true,
    data: leave
  });
});

// @desc      Delete leave application
// @route     DELETE /api/v1/leave/:id
// @access    Private (admin: any; faculty: own pending only)
export const deleteLeave = asyncHandler(async (req, res, next) => {
  const leave = await Leave.findByPk(req.params.id);

  if (!leave) {
    return next(new ErrorResponse(`Leave application not found with id of ${req.params.id}`, 404));
  }

  const isAdmin = ['superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin'].includes(req.user.role);

  if (!isAdmin) {
    if (leave.applicantId !== Number(req.user.id)) {
      return next(new ErrorResponse('Not authorized to delete this leave application', 403));
    }
    if (leave.status !== 'pending') {
      return next(new ErrorResponse('Only pending leave applications can be deleted', 400));
    }
  }

  await leave.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get my leave applications
// @route     GET /api/v1/leave/my-leaves
// @access    Private
export const getMyLeaves = asyncHandler(async (req, res, next) => {
  // Check if user is authenticated
  if (!req.user || !req.user.id) {
    console.error('[Leave] Authentication failed - req.user:', req.user);
    return next(new ErrorResponse('User not authenticated', 401));
  }

  try {
    console.log('[Leave] Fetching leaves for user:', req.user.id, 'Role:', req.user.role);

    // First, just count the records to verify the query works
    const count = await Leave.count({
      where: { applicantId: req.user.id }
    });
    console.log('[Leave] Count query returned:', count);

    // Now fetch the leaves
    const leaves = await Leave.findAll({
      where: { applicantId: req.user.id },
      order: [['createdAt', 'DESC']],
      raw: true  // Return plain objects instead of Sequelize instances
    });

    console.log('[Leave] Found', leaves.length, 'leaves');

    // Enrich with reassigned faculty name
    const reassignIds = [...new Set(leaves.map(l => l.reassign_faculty_id).filter(Boolean))];
    let reassignFacultyMap = {};
    if (reassignIds.length > 0) {
      const reassignFaculty = await Faculty.findAll({
        where: { faculty_id: reassignIds },
        attributes: ['faculty_id', 'Name', 'designation'],
        raw: true,
      });
      reassignFacultyMap = Object.fromEntries(reassignFaculty.map(f => [f.faculty_id, f]));
    }

    const enrichedLeaves = leaves.map(l => ({
      ...l,
      reassignFacultyName: l.reassign_faculty_id && reassignFacultyMap[l.reassign_faculty_id]
        ? reassignFacultyMap[l.reassign_faculty_id].Name
        : null,
    }));

    res.status(200).json({
      success: true,
      count: enrichedLeaves.length,
      data: enrichedLeaves
    });
  } catch (error) {
    console.error('[Leave] Query Error:', error.message, error.stack);
    return next(new ErrorResponse(`Error fetching leaves: ${error.message}`, 500));
  }
});

// @desc      Get leave balance for the logged-in faculty
// @route     GET /api/v1/leave/balance
// @access    Private (Faculty)
export const getLeaveBalance = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id; // leave_balance uses userId (the user's login id)
    const currentYear = new Date().getFullYear().toString();

    // The real data lives in `leave_balance` table with JSON columns per type:
    // Medical, Casual, Earned, On-Duty, Personal, Maternity, Comp-Off
    // Each column is a JSON string: {"balance": N, "used": N}
    const [results] = await sequelize.query(
      'SELECT * FROM `leave_balance` WHERE userId = ? AND academicYear = ? LIMIT 1',
      { replacements: [userId, currentYear] }
    );

    const leaveTypes = ['Medical', 'Casual', 'Earned', 'On-Duty', 'Personal', 'Maternity', 'Comp-Off'];
    const balanceMap = {};

    const row = results && results[0] ? results[0] : null;

    leaveTypes.forEach((type) => {
      if (row && row[type]) {
        try {
          const parsed = typeof row[type] === 'string' ? JSON.parse(row[type]) : row[type];
          const allowed = parseFloat(parsed.balance) || 0;
          const used = parseFloat(parsed.used) || 0;
          balanceMap[type] = {
            total_allowed: allowed,
            used_leaves: used,
            remaining_leaves: Math.max(0, allowed - used),
          };
        } catch {
          balanceMap[type] = { total_allowed: 0, used_leaves: 0, remaining_leaves: 0 };
        }
      } else {
        balanceMap[type] = { total_allowed: 0, used_leaves: 0, remaining_leaves: 0 };
      }
    });

    res.status(200).json({
      success: true,
      data: balanceMap,
    });
  } catch (error) {
    console.error('[getLeaveBalance] Error:', error.message);
    return next(new ErrorResponse(`Error fetching leave balance: ${error.message}`, 500));
  }
});

// @desc      Get pending leave count (for admin dashboard)
// @route     GET /api/v1/leave/pending-count
// @access    Private/Admin
export const getPendingCount = asyncHandler(async (req, res, next) => {
  const normalizedRole = req.user.role.trim().toLowerCase().replace(/-/g, '');
  const isHigherAdmin = ['superadmin', 'executiveadmin', 'academicadmin'].includes(normalizedRole);
  const isDeptAdmin = normalizedRole === 'departmentadmin';

  let where = {};
  let include = [];

  if (isDeptAdmin) {
    // HOD sees pending leaves in their department, excluding their own
    where.status = 'pending';
    where.departmentId = req.user.departmentId;
    where.applicantId = { [Op.ne]: req.user.id }; // Exclude self-leaves
    // Check if reassign faculty has already accepted (if any)
    where[Op.and] = [
      {
        [Op.or]: [
          { reassign_faculty_id: null },
          { substitute_status: 'accepted' }
        ]
      }
    ];
  } else if (isHigherAdmin) {
    // Higher Admin sees:
    // 1. Faculty leaves that are 'hod_approved'
    // 2. HOD leaves that are 'pending'
    where[Op.or] = [
      { status: 'hod_approved' },
      {
        [Op.and]: [
          { status: 'pending' },
          // Filter by applicant role = 7 (HOD)
          sequelize.literal(`EXISTS (SELECT 1 FROM faculty_profiles WHERE faculty_profiles.faculty_id = Leave.applicantId AND faculty_profiles.role_id = 7)`)
        ]
      }
    ];
  } else {
    // Regular faculty or others - arguably shouldn't even call this, but safety first:
    return res.status(200).json({ success: true, data: { pendingCount: 0 } });
  }

  const count = await Leave.count({ where });

  res.status(200).json({
    success: true,
    data: { pendingCount: count }
  });
});

// @desc      Get pending leaves for approval
// @route     GET /api/v1/leave/pending-approvals
// @access    Private/Admin
export const getPendingLeaves = asyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    const normalizedRole = req.user.role.trim().toLowerCase().replace(/-/g, '');
    const isHigherAdmin = ['superadmin', 'executiveadmin', 'academicadmin'].includes(normalizedRole);
    const isDeptAdmin = normalizedRole === 'departmentadmin';

    let where = {};

    if (isDeptAdmin) {
      where.status = 'pending';
      where.departmentId = req.user.departmentId;
      where.applicantId = { [Op.ne]: req.user.id }; // Don't allow HOD to approve their own
      where[Op.and] = [
        {
          [Op.or]: [
            { reassign_faculty_id: null },
            { substitute_status: 'accepted' }
          ]
        }
      ];
    } else if (isHigherAdmin) {
      where[Op.or] = [
        { status: 'hod_approved' },
        {
          [Op.and]: [
            { status: 'pending' },
            sequelize.literal(`EXISTS (SELECT 1 FROM faculty_profiles WHERE faculty_profiles.faculty_id = Leave.applicantId AND faculty_profiles.role_id = 7)`)
          ]
        }
      ];
    }


    console.log('[PendingLeaves] Fetching with where:', where, 'User role:', req.user.role);

    // Superadmins, executive, academic see all pending leaves
    // Department admin sees only from their department

    const total = await Leave.count({ where });
    console.log('[PendingLeaves] Total count:', total);

    const rawLeaves = await Leave.findAll({
      where,
      offset: startIndex,
      limit,
      order: [['createdAt', 'DESC']],
      raw: true
    });

    // Enrich with names from faculty table
    const applicantIds = [...new Set(rawLeaves.map(l => l.applicantId))];
    const reassignFacultyIds = [...new Set(rawLeaves.map(l => l.reassign_faculty_id).filter(Boolean))];
    const approverIds = [...new Set(rawLeaves.map(l => l.approvedById).filter(Boolean))];
    const allFacultyIds = [...new Set([...applicantIds, ...reassignFacultyIds, ...approverIds])];

    const facultyList = allFacultyIds.length
      ? await Faculty.findAll({
        where: { faculty_id: allFacultyIds },
        attributes: ['faculty_id', 'Name', 'email', 'designation'],
        raw: true,
      })
      : [];
    const facultyMap = Object.fromEntries(facultyList.map(f => [f.faculty_id, f]));

    const leaves = rawLeaves.map(l => ({
      ...l,
      applicant: facultyMap[l.applicantId]
        ? {
          name: facultyMap[l.applicantId].Name,
          email: facultyMap[l.applicantId].email,
          role: facultyMap[l.applicantId].designation || 'Faculty',
        }
        : { name: 'Unknown', email: '', role: 'Faculty' },
      reassignFacultyName: l.reassign_faculty_id && facultyMap[l.reassign_faculty_id]
        ? facultyMap[l.reassign_faculty_id].Name
        : null,
      approverName: l.approvedById && facultyMap[l.approvedById]
        ? facultyMap[l.approvedById].Name
        : null,
    }));

    console.log('[PendingLeaves] Found', leaves.length, 'leaves');

    res.status(200).json({
      success: true,
      count: leaves.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: leaves
    });
  } catch (error) {
    console.error('[PendingLeaves] Error:', error.message, error.stack);
    return next(new ErrorResponse(`Error fetching pending leaves: ${error.message}`, 500));
  }
});

// @desc      Get leave notifications for current user
// @route     GET /api/v1/leave/notifications
// @access    Private
export const getLeaveNotifications = asyncHandler(async (req, res, next) => {
  try {
    const where = {};

    if (req.user.role === 'faculty') {
      where.recipientType = 'faculty';
      where.recipientId = req.user.id;
    } else if (req.user.role === 'department-admin') {
      where.recipientType = 'department-admin';
      where.departmentId = req.user.departmentId;
    } else if (['executiveadmin', 'superadmin', 'super-admin', 'academicadmin'].includes(req.user.role)) {
      where.recipientType = 'executiveadmin';
    } else {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const notifications = await LeaveNotification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 30,
      raw: true,
    });

    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    console.error('[LeaveNotifications] Error:', error.message);
    return next(new ErrorResponse(`Error fetching notifications: ${error.message}`, 500));
  }
});

// @desc      Get unread leave notification count
// @route     GET /api/v1/leave/notifications/unread-count
// @access    Private
export const getLeaveNotificationCount = asyncHandler(async (req, res, next) => {
  try {
    const where = { isRead: false };

    if (req.user.role === 'faculty') {
      where.recipientType = 'faculty';
      where.recipientId = req.user.id;
    } else if (req.user.role === 'department-admin') {
      where.recipientType = 'department-admin';
      where.departmentId = req.user.departmentId;
    } else if (['executiveadmin', 'superadmin', 'super-admin', 'academicadmin'].includes(req.user.role)) {
      where.recipientType = 'executiveadmin';
    } else {
      return res.status(200).json({ success: true, data: { count: 0 } });
    }

    const count = await LeaveNotification.count({ where });
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    console.error('[LeaveNotifCount] Error:', error.message);
    return next(new ErrorResponse(`Error fetching count: ${error.message}`, 500));
  }
});

// @desc      Mark leave notification as read
// @route     PUT /api/v1/leave/notifications/:id/read
// @access    Private
export const markLeaveNotificationRead = asyncHandler(async (req, res, next) => {
  try {
    await LeaveNotification.update(
      { isRead: true },
      { where: { id: req.params.id } }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    return next(new ErrorResponse(`Error marking notification as read: ${error.message}`, 500));
  }
});

// @desc      Mark all leave notifications as read for current user
// @route     PUT /api/v1/leave/notifications/mark-all-read
// @access    Private
export const markAllLeaveNotificationsRead = asyncHandler(async (req, res, next) => {
  try {
    const where = {};

    if (req.user.role === 'faculty') {
      where.recipientType = 'faculty';
      where.recipientId = req.user.id;
    } else if (req.user.role === 'department-admin') {
      where.recipientType = 'department-admin';
      where.departmentId = req.user.departmentId;
    } else if (['executiveadmin', 'superadmin'].includes(req.user.role)) {
      where.recipientType = 'executiveadmin';
    }

    await LeaveNotification.update({ isRead: true }, { where });
    res.status(200).json({ success: true });
  } catch (error) {
    return next(new ErrorResponse(`Error marking notifications as read: ${error.message}`, 500));
  }
});

// @desc      Get load reassignment requests for current faculty
// @route     GET /api/v1/leave/reassignment-requests
// @access    Private (Faculty)
export const getReassignmentRequests = asyncHandler(async (req, res, next) => {
  try {
    const leaves = await Leave.findAll({
      where: {
        reassign_faculty_id: req.user.id,
        substitute_status: 'pending'
      },
      include: [
        {
          model: Faculty,
          as: 'applicant',
          attributes: ['faculty_id', 'Name', 'department_id'],
          include: [{
            model: Department,
            as: 'department',
            attributes: ['id', 'full_name', 'short_name']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: leaves
    });
  } catch (error) {
    console.error('[GetReassignmentRequests] Error:', error.message);
    return next(new ErrorResponse(`Error fetching reassignment requests: ${error.message}`, 500));
  }
});

// @desc      Process load reassignment request
// @route     PUT /api/v1/leave/:id/reassignment-response
// @access    Private (Faculty)
export const processReassignmentResponse = asyncHandler(async (req, res, next) => {
  const { status, remarks } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return next(new ErrorResponse('Status must be accepted or rejected', 400));
  }

  const leave = await Leave.findByPk(req.params.id);
  if (!leave) {
    return next(new ErrorResponse('Leave application not found', 404));
  }

  // Ensure current user is the reassign faculty
  if (leave.reassign_faculty_id !== req.user.id) {
    return next(new ErrorResponse('Not authorized to respond to this request', 403));
  }

  if (leave.substitute_status !== 'pending') {
    return next(new ErrorResponse('Request has already been processed', 400));
  }

  leave.substitute_status = status;
  leave.substitute_remarks = remarks || null;
  leave.substitute_response_at = new Date();

  // If rejected, the whole leave is automatically rejected
  if (status === 'rejected') {
    leave.status = 'rejected';
    leave.approvalRemarks = `Load Reassignment rejected by ${req.user.Name || req.user.name}.`;
  }

  await leave.save();

  // Create notifications
  try {
    const respondentName = req.user.Name || req.user.name || 'Faculty';

    // Find applicant
    const applicantFaculty = await Faculty.findByPk(leave.applicantId, { attributes: ['faculty_id', 'Name', 'department_id', 'role_id'] });
    const applicantName = applicantFaculty?.Name || 'Faculty';
    const isApplicantHOD = applicantFaculty?.role_id === 7;

    if (status === 'accepted') {
      // 1. Notify HOD that leave is ready for approval
      // If applicant is HOD themselves, notify Executive Admin
      if (isApplicantHOD) {
        await LeaveNotification.create({
          recipientId: null,
          recipientType: 'executiveadmin',
          departmentId: leave.departmentId,
          senderId: req.user.id,
          senderName: respondentName,
          leaveId: leave.id,
          facultyName: applicantName,
          leaveType: leave.leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          type: 'leave_submitted',
          title: `HOD Leave Request ready: ${applicantName}`,
          message: `${respondentName} has accepted load reassignment for HOD ${applicantName}. The request is now ready for your approval.`,
          isRead: false,
        });
      } else {
        const deptAdmin = await Faculty.findOne({
          where: { department_id: leave.departmentId, role_id: 7, status: 'active' },
          attributes: ['faculty_id'],
        });

        const startStr = new Date(leave.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const endStr = new Date(leave.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

        await LeaveNotification.create({
          recipientId: deptAdmin?.faculty_id || null,
          recipientType: 'department-admin',
          departmentId: leave.departmentId,
          senderId: req.user.id,
          senderName: respondentName,
          leaveId: leave.id,
          facultyName: applicantName,
          leaveType: leave.leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          type: 'leave_submitted', // Standard type so HOD sees it as a new request
          title: `Leave Request ready: ${applicantName}`,
          message: `${respondentName} has accepted load reassignment for ${applicantName}. The request is now ready for your approval.`,
          isRead: false,
        });
      }

      // 2. Notify Applicant that their load was accepted
      await LeaveNotification.create({
        recipientId: leave.applicantId,
        recipientType: 'faculty',
        departmentId: leave.departmentId,
        senderId: req.user.id,
        senderName: respondentName,
        leaveId: leave.id,
        facultyName: applicantName,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        type: 'load_accepted',
        title: `Load Accepted by ${respondentName}`,
        message: `${respondentName} has accepted your load reassignment request. Your leave is now pending HOD approval.`,
        isRead: false,
      });

    } else {
      // status === 'rejected'
      // Notify Applicant that their load was rejected (and thus leave is rejected)
      await LeaveNotification.create({
        recipientId: leave.applicantId,
        recipientType: 'faculty',
        departmentId: leave.departmentId,
        senderId: req.user.id,
        senderName: respondentName,
        leaveId: leave.id,
        facultyName: applicantName,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        type: 'load_rejected',
        title: `Load Rejected by ${respondentName}`,
        message: `${respondentName} has rejected your load reassignment request. Your leave application has been automatically rejected.`,
        isRead: false,
      });
    }
  } catch (notifErr) {
    console.error('[ReassignmentResponse] Notification error:', notifErr.message);
  }

  res.status(200).json({
    success: true,
    data: leave
  });
});

