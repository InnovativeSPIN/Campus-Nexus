import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import { notifyClassIncharge } from '../../utils/portfolioNotification.js';
const { StudentCertification, Student, User, Faculty } = models;

const getStudentId = async (userOrId, next) => {
    // if already a student instance (has studentId), return its id
    if (userOrId && typeof userOrId === 'object' && userOrId.studentId) {
        return userOrId.id;
    }
    // userId column doesn't exist in database
    next(new ErrorResponse('Student profile not accessible', 404));
    return null;
};

// @desc   Get all certifications for logged-in student
// @route  GET /api/student/certifications
// @access Private/Student
export const getMyCertifications = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const where = { studentId };
    if (req.query.approvalStatus) where.approvalStatus = req.query.approvalStatus;

    const certifications = await StudentCertification.findAll({
        where,
        include: [{ model: Faculty, as: 'approvedBy', attributes: [['Name', 'name']] }],
        order: [['issueDate', 'DESC']]
    });

    res.status(200).json({ success: true, count: certifications.length, data: certifications });
});

// @desc   Get single certification
// @route  GET /api/student/certifications/:id
// @access Private/Student
export const getCertification = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const cert = await StudentCertification.findOne({
        where: { id: req.params.id, studentId },
        include: [{ model: Faculty, as: 'approvedBy', attributes: [['Name', 'name']] }]
    });

    if (!cert) return next(new ErrorResponse('Certification not found', 404));
    res.status(200).json({ success: true, data: cert });
});

// @desc   Add new certification
// @route  POST /api/student/certifications
// @access Private/Student
export const createCertification = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const student = await Student.findByPk(studentId);
    if (!student) return next(new ErrorResponse('Student not found', 404));

    const cert = await StudentCertification.create({
        ...req.body,
        studentId,
        classId: student.classId,
        approvalStatus: 'pending',
        documentUrl: req.file ? req.file.filename : req.body.documentUrl
    });

    // Notification to class incharge (non-blocking)
    notifyClassIncharge(studentId, {
        referenceId: cert.id,
        referenceType: 'certification',
        itemTitle: cert.name
    });

    res.status(201).json({ success: true, data: cert });
});

// @desc   Update certification (resets approval to pending)
// @route  PUT /api/student/certifications/:id
// @access Private/Student
export const updateCertification = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const cert = await StudentCertification.findOne({ where: { id: req.params.id, studentId } });
    if (!cert) return next(new ErrorResponse('Certification not found', 404));

    // Prevent student from manually setting approvalStatus
    delete req.body.approvedById;
    delete req.body.approvalDate;
    delete req.body.studentId;

    const dataToUpdate = { ...req.body, approvalStatus: 'pending' };
    if (req.file) dataToUpdate.documentUrl = req.file.filename;

    await cert.update(dataToUpdate);
    res.status(200).json({ success: true, data: cert });
});

// @desc   Delete certification
// @route  DELETE /api/student/certifications/:id
// @access Private/Student
export const deleteCertification = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const cert = await StudentCertification.findOne({ where: { id: req.params.id, studentId } });
    if (!cert) return next(new ErrorResponse('Certification not found', 404));

    await cert.destroy();
    res.status(200).json({ success: true, data: {} });
});

// @desc   Approve / reject certification (faculty/admin)
// @route  PUT /api/student/certifications/:id/approval
// @access Private/Faculty/Admin
export const updateApprovalStatus = asyncHandler(async (req, res, next) => {
    const { approvalStatus, approvalRemarks } = req.body;
    if (!['approved', 'rejected'].includes(approvalStatus)) {
        return next(new ErrorResponse('approvalStatus must be approved or rejected', 400));
    }

    const cert = await StudentCertification.findByPk(req.params.id);
    if (!cert) return next(new ErrorResponse('Certification not found', 404));

    await cert.update({
        approvalStatus,
        approvalRemarks: approvalRemarks || null,
        approvedById: req.user.id,
        approvalDate: new Date()
    });

    res.status(200).json({ success: true, data: cert });
});

// @desc   Get certifications for class in-charge
// @route  GET /api/student/certifications/class-incharge
// @access Private/Faculty
export const getClassInchargeCertifications = asyncHandler(async (req, res, next) => {
    const faculty = await models.Faculty.findOne({ where: { faculty_id: req.user.id } });
    if (!faculty || !faculty.is_class_incharge || !faculty.class_incharge_class_id) {
        return next(new ErrorResponse('User is not assigned as a class in-charge', 403));
    }

    const classId = faculty.class_incharge_class_id;
    const { approvalStatus } = req.query;

    const where = { classId };
    if (approvalStatus) where.approvalStatus = approvalStatus;

    const certifications = await StudentCertification.findAll({
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

    res.status(200).json({ success: true, count: certifications.length, data: certifications });
});
