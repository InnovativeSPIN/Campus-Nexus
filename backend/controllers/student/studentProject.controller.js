import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import { notifyClassIncharge } from '../../utils/portfolioNotification.js';
const { StudentProject, Student, User, Faculty } = models;

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
        include: [{ model: Faculty, as: 'approvedBy', attributes: [['Name', 'name']] }],
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
        include: [{ model: Faculty, as: 'approvedBy', attributes: [['Name', 'name']] }]
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

    const student = await Student.findByPk(studentId);
    if (!student) return next(new ErrorResponse('Student not found', 404));

    const data = { ...req.body, studentId, classId: student.classId, approvalStatus: 'pending' };
    if (req.file) data.documentUrl = req.file.filename;

    const project = await StudentProject.create(data);

    // Notification to class incharge (non-blocking)
    notifyClassIncharge(studentId, {
        referenceId: project.id,
        referenceType: 'project',
        itemTitle: project.title
    });

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

    const dataToUpdate = { ...req.body, approvalStatus: 'pending' };
    if (req.file) dataToUpdate.documentUrl = req.file.filename;

    await project.update(dataToUpdate);
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

// @desc   Get projects for class in-charge
// @route  GET /api/student/projects/class-incharge
// @access Private/Faculty
export const getClassInchargeProjects = asyncHandler(async (req, res, next) => {
    const faculty = await models.Faculty.findOne({ where: { faculty_id: req.user.id } });
    if (!faculty || !faculty.is_class_incharge || !faculty.class_incharge_class_id) {
        return next(new ErrorResponse('User is not assigned as a class in-charge', 403));
    }

    const classId = faculty.class_incharge_class_id;
    const { approvalStatus } = req.query;

    const where = { classId };
    if (approvalStatus) where.approvalStatus = approvalStatus;

    const projects = await StudentProject.findAll({
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

    res.status(200).json({ success: true, count: projects.length, data: projects });
});
