import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';

const { StudentLeave, Student, User, Faculty, TimetableMaster } = models;

// @desc   Get all leave applications for logged-in student
// @route  GET /api/v1/student-leaves
// @access Private/Student
export const getMyLeaves = asyncHandler(async (req, res, next) => {
    const studentId = req.user.id; // from protect middleware

    const where = { studentId };
    if (req.query.status) where.overall_status = req.query.status;
    if (req.query.classInchargeStatus) where.class_incharge_approval_status = req.query.classInchargeStatus;
    if (req.query.deptAdminStatus) where.department_admin_approval_status = req.query.deptAdminStatus;

    const leaves = await StudentLeave.findAll({
        where,
        include: [
            { model: Faculty, as: 'classInchargeApprover', attributes: ['Name', 'email'] },
            { model: Faculty, as: 'deptAdminApprover', attributes: ['Name', 'email'] }
        ],
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
        include: [
            { model: Faculty, as: 'classInchargeApprover', attributes: ['Name', 'email'] },
            { model: Faculty, as: 'deptAdminApprover', attributes: ['Name', 'email'] }
        ]
    });

    if (!leave) return next(new ErrorResponse('Leave application not found', 404));
    res.status(200).json({ success: true, data: leave });
});

// @desc   Apply for leave
// @route  POST /api/v1/student-leaves
// @access Private/Student
export const applyLeave = asyncHandler(async (req, res, next) => {
    const studentId = req.user.id;

    // Fetch student's classId if not provided
    const student = await Student.findByPk(studentId);
    if (!student) return next(new ErrorResponse('Student not found', 404));

    const leave = await StudentLeave.create({
        ...req.body,
        studentId,
        classId: student.classId,
        overall_status: 'pending',
        class_incharge_approval_status: 'pending',
        department_admin_approval_status: 'pending',
        attachment: req.file ? req.file.filename : req.body.attachment
    });

    res.status(201).json({ success: true, data: leave });
});

// @desc   Get leaves for class in-charge
// @route  GET /api/v1/student-leaves/class-incharge
// @access Private/Faculty
export const getClassInchargeLeaves = asyncHandler(async (req, res, next) => {
    // Get faculty ID from user
    const facultyId = req.user.faculty_id;

    if (!facultyId) {
        return next(new ErrorResponse('Faculty ID not found', 400));
    }

    // Check if faculty is class coordinator or assistant coordinator in an active timetable
    const timetable = await TimetableMaster.findOne({
        where: {
            status: { [Op.in]: ['draft', 'active'] },
            [Op.or]: [
                { class_coordinator_id: facultyId },
                { asst_coordinator_id: facultyId }
            ]
        },
        attributes: ['class_id']
    });

    if (!timetable) {
        return next(new ErrorResponse('User is not assigned as a class in-charge', 403));
    }

    const classId = timetable.class_id;
    const { status } = req.query;

    const where = { classId };
    if (status) where.class_incharge_approval_status = status;

    const leaves = await StudentLeave.findAll({
        where,
        include: [
            {
                model: Student,
                as: 'student',
                attributes: ['id', 'studentId', 'firstName', 'lastName', 'rollNumber']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: leaves.length,
        data: leaves
    });
});


// @desc   Update leave application
// @route  PUT /api/v1/student-leaves/:id
// @access Private/Student
export const updateLeave = asyncHandler(async (req, res, next) => {
    const studentId = req.user.id;

    const leave = await StudentLeave.findOne({ where: { id: req.params.id, studentId } });
    if (!leave) return next(new ErrorResponse('Leave application not found', 404));

    if (leave.overall_status !== 'pending') {
        return next(new ErrorResponse('Cannot update leave that is already processed', 400));
    }

    // Prevent student from manually setting approval fields
    delete req.body.class_incharge_approval_status;
    delete req.body.class_incharge_id;
    delete req.body.class_incharge_remarks;
    delete req.body.class_incharge_approval_date;
    delete req.body.department_admin_approval_status;
    delete req.body.department_admin_id;
    delete req.body.department_admin_remarks;
    delete req.body.department_admin_approval_date;
    delete req.body.overall_status;
    delete req.body.studentId;

    await leave.update({ ...req.body, overall_status: 'pending' });
    res.status(200).json({ success: true, data: leave });
});

// @desc   Cancel leave application
// @route  DELETE /api/v1/student-leaves/:id
// @access Private/Student
export const cancelLeave = asyncHandler(async (req, res, next) => {
    const studentId = req.user.id;

    const leave = await StudentLeave.findOne({ where: { id: req.params.id, studentId } });
    if (!leave) return next(new ErrorResponse('Leave application not found', 404));

    if (leave.overall_status !== 'pending') {
        return next(new ErrorResponse('Cannot cancel leave that is already processed', 400));
    }

    await leave.update({ overall_status: 'cancelled' });
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

    // Determine the role and execute appropriate approval flow.
    // Approval requires both Class Incharge and Department Admin.
    const facultyId = req.user.faculty_id;

    // Class Incharge approval
    if (req.user.role === 'faculty') {
        const isClassIncharge = await checkIfClassIncharge(facultyId, leave.classId);
        if (!isClassIncharge) {
            return next(new ErrorResponse('You are not authorized to approve this leave. Only the assigned Class In-charge can do this.', 403));
        }

        leave.class_incharge_approval_status = status;
        leave.class_incharge_id = facultyId;
        leave.class_incharge_remarks = approvalRemarks || null;
        leave.class_incharge_approval_date = new Date();

        if (status === 'rejected') {
            leave.overall_status = 'rejected';
        }

        // If class incharge approves, keep overall status pending until dept admin approves.
        if (status === 'approved' && leave.department_admin_approval_status === 'approved') {
            leave.overall_status = 'approved';
        }
    }

    // Department Admin approval
    if (req.user.role === 'department-admin') {
        const isDeptAdmin = await checkIfDepartmentAdmin(facultyId, req.user.department_id);
        if (!isDeptAdmin) {
            return next(new ErrorResponse('You are not authorized to approve this leave. Only the Department Admin can do this.', 403));
        }

        // Ensure class incharge approval is in place first
        if (leave.class_incharge_approval_status !== 'approved') {
            return next(new ErrorResponse('Leave must be approved by the Class Incharge before Department Admin approval.', 400));
        }

        leave.department_admin_approval_status = status;
        leave.department_admin_id = facultyId;
        leave.department_admin_remarks = approvalRemarks || null;
        leave.department_admin_approval_date = new Date();

        if (status === 'approved') {
            leave.overall_status = 'approved';
        } else if (status === 'rejected') {
            leave.overall_status = 'rejected';
        }
    }

    await leave.save();

    res.status(200).json({ success: true, data: leave });
});

