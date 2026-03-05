import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';

const { StudentLeave, Student, User } = models;

// @desc   Get all leave applications for logged-in student
// @route  GET /api/v1/student-leaves
// @access Private/Student
export const getMyLeaves = asyncHandler(async (req, res, next) => {
    const studentId = req.user.id; // from protect middleware

    const where = { studentId };
    if (req.query.status) where.status = req.query.status;

    const leaves = await StudentLeave.findAll({
        where,
        include: [{ model: User, as: 'approvedBy', attributes: ['name'] }],
        order: [['startDate', 'DESC']]
    });

    res.status(200).json({ success: true, count: leaves.length, data: leaves });
});

// @desc   Get single leave application
// @route  GET /api/v1/student-leaves/:id
// @access Private/Student
export const getLeave = asyncHandler(async (req, res, next) => {
    const studentId = req.user.id;

    const leave = await StudentLeave.findOne({
        where: { id: req.params.id, studentId },
        include: [{ model: User, as: 'approvedBy', attributes: ['name'] }]
    });

    if (!leave) return next(new ErrorResponse('Leave application not found', 404));
    res.status(200).json({ success: true, data: leave });
});

// @desc   Apply for leave
// @route  POST /api/v1/student-leaves
// @access Private/Student
export const applyLeave = asyncHandler(async (req, res, next) => {
    const studentId = req.user.id;

    const leave = await StudentLeave.create({
        ...req.body,
        studentId,
        status: 'pending',
        attachment: req.file ? req.file.filename : req.body.attachment
    });

    res.status(201).json({ success: true, data: leave });
});

// @desc   Update leave application
// @route  PUT /api/v1/student-leaves/:id
// @access Private/Student
export const updateLeave = asyncHandler(async (req, res, next) => {
    const studentId = req.user.id;

    const leave = await StudentLeave.findOne({ where: { id: req.params.id, studentId } });
    if (!leave) return next(new ErrorResponse('Leave application not found', 404));

    if (leave.status !== 'pending') {
        return next(new ErrorResponse('Cannot update leave that is already processed', 400));
    }

    // Prevent student from manually setting approval fields
    delete req.body.approvedById;
    delete req.body.approvalDate;
    delete req.body.studentId;

    await leave.update({ ...req.body, status: 'pending' });
    res.status(200).json({ success: true, data: leave });
});

// @desc   Cancel leave application
// @route  DELETE /api/v1/student-leaves/:id
// @access Private/Student
export const cancelLeave = asyncHandler(async (req, res, next) => {
    const studentId = req.user.id;

    const leave = await StudentLeave.findOne({ where: { id: req.params.id, studentId } });
    if (!leave) return next(new ErrorResponse('Leave application not found', 404));

    if (leave.status !== 'pending') {
        return next(new ErrorResponse('Cannot cancel leave that is already processed', 400));
    }

    await leave.update({ status: 'cancelled' });
    res.status(200).json({ success: true, data: { message: 'Leave application cancelled' } });
});

// @desc   Approve / reject leave application (faculty/admin)
// @route  PUT /api/v1/student-leaves/:id/approval
// @access Private/Faculty/Admin
export const processLeaveApproval = asyncHandler(async (req, res, next) => {
    const { status, approvalRemarks } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
        return next(new ErrorResponse('status must be approved or rejected', 400));
    }

    const leave = await StudentLeave.findByPk(req.params.id);
    if (!leave) return next(new ErrorResponse('Leave application not found', 404));

    await leave.update({
        status,
        approvalRemarks: approvalRemarks || null,
        approvedById: req.user.id,
        approvalDate: new Date()
    });

    res.status(200).json({ success: true, data: leave });
});
