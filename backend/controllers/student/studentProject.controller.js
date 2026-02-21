import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
const { StudentProject, Student, User } = models;

const getStudentId = async (userOrId, next) => {
    if (userOrId && typeof userOrId === 'object' && userOrId.studentId) {
        return userOrId.id;
    }
    next(new ErrorResponse('Student profile not accessible', 404));
    return null;
};

// @desc   Get all projects for logged-in student
// @route  GET /api/student/projects
// @access Private/Student
export const getMyProjects = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const where = { studentId };
    if (req.query.status) where.status = req.query.status;
    if (req.query.approvalStatus) where.approvalStatus = req.query.approvalStatus;

    const projects = await StudentProject.findAll({
        where,
        include: [{ model: User, as: 'approvedBy', attributes: ['name'] }],
        order: [['startDate', 'DESC']]
    });

    res.status(200).json({ success: true, count: projects.length, data: projects });
});

// @desc   Get single project
// @route  GET /api/student/projects/:id
// @access Private/Student
export const getProject = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const project = await StudentProject.findOne({
        where: { id: req.params.id, studentId },
        include: [{ model: User, as: 'approvedBy', attributes: ['name'] }]
    });

    if (!project) return next(new ErrorResponse('Project not found', 404));
    res.status(200).json({ success: true, data: project });
});

// @desc   Add new project
// @route  POST /api/student/projects
// @access Private/Student
export const createProject = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const project = await StudentProject.create({ ...req.body, studentId, approvalStatus: 'pending' });
    res.status(201).json({ success: true, data: project });
});

// @desc   Update project
// @route  PUT /api/student/projects/:id
// @access Private/Student
export const updateProject = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const project = await StudentProject.findOne({ where: { id: req.params.id, studentId } });
    if (!project) return next(new ErrorResponse('Project not found', 404));

    delete req.body.approvedById;
    delete req.body.approvalDate;
    delete req.body.studentId;

    await project.update({ ...req.body, approvalStatus: 'pending' });
    res.status(200).json({ success: true, data: project });
});

// @desc   Delete project
// @route  DELETE /api/student/projects/:id
// @access Private/Student
export const deleteProject = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const project = await StudentProject.findOne({ where: { id: req.params.id, studentId } });
    if (!project) return next(new ErrorResponse('Project not found', 404));

    await project.destroy();
    res.status(200).json({ success: true, data: {} });
});

// @desc   Approve/reject project (faculty/admin)
// @route  PUT /api/student/projects/:id/approval
// @access Private/Faculty/Admin
export const updateProjectApproval = asyncHandler(async (req, res, next) => {
    const { approvalStatus, approvalRemarks } = req.body;
    if (!['approved', 'rejected'].includes(approvalStatus)) {
        return next(new ErrorResponse('approvalStatus must be approved or rejected', 400));
    }
    const project = await StudentProject.findByPk(req.params.id);
    if (!project) return next(new ErrorResponse('Project not found', 404));

    await project.update({ approvalStatus, approvalRemarks: approvalRemarks || null, approvedById: req.user.id, approvalDate: new Date() });
    res.status(200).json({ success: true, data: project });
});
