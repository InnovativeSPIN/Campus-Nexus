import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';
import { notifyClassIncharge, notifyStudentPortfolioResult } from '../../utils/portfolioNotification.js';
import getAssignedClassIdForFaculty from '../../utils/getAssignedClassIdForFaculty.js';
const { StudentSport, StudentEvent, Student, User, Faculty, TimetableMaster } = models;

const getStudentId = async (userOrId, next) => {
    if (userOrId && typeof userOrId === 'object' && userOrId.studentId) {
        return userOrId.id;
    }
    next(new ErrorResponse('Student profile not accessible', 404));
    return null;
};

// ──────────────────────────────── SPORTS ──────────────────────────────────

// @desc   Get all sports for logged-in student
// @route  GET /api/student/sports
// @access Private/Student
export const getMySports = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const where = { studentId };
    if (req.query.status) where.status = req.query.status;
    if (req.query.approvalStatus) where.approvalStatus = req.query.approvalStatus;

    const sports = await StudentSport.findAll({
        where,
        include: [{ model: Faculty, as: 'approvedBy', attributes: [['Name', 'name']] }],
        order: [['joinedDate', 'DESC']]
    });

    res.status(200).json({ success: true, count: sports.length, data: sports });
});

// @desc   Get single sport
// @route  GET /api/student/sports/:id
// @access Private/Student
export const getSport = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const sport = await StudentSport.findOne({ where: { id: req.params.id, studentId } });
    if (!sport) return next(new ErrorResponse('Sport record not found', 404));
    res.status(200).json({ success: true, data: sport });
});

// @desc   Add new sport
// @route  POST /api/student/sports
// @access Private/Student
export const createSport = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const student = await Student.findByPk(studentId);
    if (!student) return next(new ErrorResponse('Student not found', 404));

    const data = { ...req.body, studentId, classId: student.classId, approvalStatus: 'pending' };
    if (req.file) data.documentUrl = req.uploadSubFolder ? `${req.uploadSubFolder}/${req.file.filename}` : req.file.filename;
    const sport = await StudentSport.create(data);

    // Notification to class incharge (non-blocking)
    notifyClassIncharge(studentId, {
        referenceId: sport.id,
        referenceType: 'sport',
        itemTitle: sport.name
    });

    res.status(201).json({ success: true, data: sport });
});

// @desc   Update sport
// @route  PUT /api/student/sports/:id
// @access Private/Student
export const updateSport = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const sport = await StudentSport.findOne({ where: { id: req.params.id, studentId } });
    if (!sport) return next(new ErrorResponse('Sport record not found', 404));

    delete req.body.approvedById; delete req.body.approvalDate; delete req.body.studentId;
    const dataToUpdate = { ...req.body, approvalStatus: 'pending' };
    if (req.file) dataToUpdate.documentUrl = req.uploadSubFolder ? `${req.uploadSubFolder}/${req.file.filename}` : req.file.filename;

    await sport.update(dataToUpdate);
    res.status(200).json({ success: true, data: sport });
});

// @desc   Delete sport
// @route  DELETE /api/student/sports/:id
// @access Private/Student
export const deleteSport = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const sport = await StudentSport.findOne({ where: { id: req.params.id, studentId } });
    if (!sport) return next(new ErrorResponse('Sport record not found', 404));

    await sport.destroy();
    res.status(200).json({ success: true, data: {} });
});

// @desc   Approve/reject sport (faculty/admin)
// @route  PUT /api/student/sports/:id/approval
// @access Private/Faculty/Admin
export const updateSportApproval = asyncHandler(async (req, res, next) => {
    const { approvalStatus, approvalRemarks } = req.body;
    if (!['approved', 'rejected'].includes(approvalStatus)) {
        return next(new ErrorResponse(`approvalStatus must be approved or rejected, received: "${approvalStatus}"`, 400));
    }
    const sport = await StudentSport.findByPk(req.params.id);
    if (!sport) return next(new ErrorResponse('Sport record not found', 404));

    await sport.update({ approvalStatus, approvalRemarks: approvalRemarks || null, approvedById: req.user.id, approvalDate: new Date() });

    // Notify student (non-blocking)
    notifyStudentPortfolioResult(sport.studentId, {
        referenceId: sport.id,
        referenceType: 'sport',
        itemTitle: sport.name,
        status: approvalStatus,
        remarks: approvalRemarks
    });

    res.status(200).json({ success: true, data: sport });
});

// Using centralized getAssignedClassIdForFaculty from utils
// Checks: ClassIncharge table, TimetableMaster coords, Faculty is_class_incharge flag, Multiple assignments

// @desc   Get sports for class in-charge
// @route  GET /api/student/sports/class-incharge
// @access Private/Faculty
export const getClassInchargeSports = asyncHandler(async (req, res, next) => {
    console.log(`\n[SPORTS-CONTROLLER] ╔════════════════════════════════════════╗`);
    console.log(`[SPORTS-CONTROLLER] ║ GET CLASS INCHARGE SPORTS              ║`);
    console.log(`[SPORTS-CONTROLLER] ╚════════════════════════════════════════╝`);
    console.log(`[SPORTS-CONTROLLER] req.user object:`, {
        faculty_id: req.user?.faculty_id,
        id: req.user?.id,
        Name: req.user?.Name,
        email: req.user?.email,
        role: req.user?.role,
        is_class_incharge: req.user?.is_class_incharge
    });

    const facultyId = req.user.faculty_id || req.user.id;
    console.log(`[SPORTS-CONTROLLER] Faculty ID to use: ${facultyId}\n`);

    const classId = await getAssignedClassIdForFaculty(facultyId, models);
    console.log(`[SPORTS-CONTROLLER] Class ID returned from utility: ${classId}\n`);
    if (!classId) {
        return next(new ErrorResponse('User is not assigned as a class in-charge', 403));
    }

    const { approvalStatus } = req.query;

    const where = { classId };
    if (approvalStatus) where.approvalStatus = approvalStatus;

    const sports = await StudentSport.findAll({
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

    res.status(200).json({ success: true, count: sports.length, data: sports });
});

// ──────────────────────────────── EVENTS ──────────────────────────────────

// @desc   Get all events for logged-in student
// @route  GET /api/student/events
// @access Private/Student
export const getMyEvents = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const where = { studentId };
    if (req.query.eventType) where.eventType = req.query.eventType;
    if (req.query.approvalStatus) where.approvalStatus = req.query.approvalStatus;

    const events = await StudentEvent.findAll({
        where,
        include: [{ model: Faculty, as: 'approvedBy', attributes: [['Name', 'name']] }],
        order: [['eventDate', 'DESC']]
    });

    res.status(200).json({ success: true, count: events.length, data: events });
});

// @desc   Get single event
// @route  GET /api/student/events/:id
// @access Private/Student
export const getEvent = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const event = await StudentEvent.findOne({ where: { id: req.params.id, studentId } });
    if (!event) return next(new ErrorResponse('Event record not found', 404));
    res.status(200).json({ success: true, data: event });
});

// @desc   Add new event
// @route  POST /api/student/events
// @access Private/Student
export const createEvent = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const student = await Student.findByPk(studentId);
    if (!student) return next(new ErrorResponse('Student not found', 404));

    const data = { ...req.body, studentId, classId: student.classId, approvalStatus: 'pending' };
    if (req.file) data.certificateUrl = req.uploadSubFolder ? `${req.uploadSubFolder}/${req.file.filename}` : req.file.filename;
    const event = await StudentEvent.create(data);

    // Notification to class incharge (non-blocking)
    notifyClassIncharge(studentId, {
        referenceId: event.id,
        referenceType: 'event',
        itemTitle: event.eventName
    });

    res.status(201).json({ success: true, data: event });
});

// @desc   Update event
// @route  PUT /api/student/events/:id
// @access Private/Student
export const updateEvent = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const event = await StudentEvent.findOne({ where: { id: req.params.id, studentId } });
    if (!event) return next(new ErrorResponse('Event record not found', 404));

    delete req.body.approvedById; delete req.body.approvalDate; delete req.body.studentId;
    const dataToUpdate = { ...req.body, approvalStatus: 'pending' };
    if (req.file) dataToUpdate.certificateUrl = req.uploadSubFolder ? `${req.uploadSubFolder}/${req.file.filename}` : req.file.filename;

    await event.update(dataToUpdate);
    res.status(200).json({ success: true, data: event });
});

// @desc   Delete event
// @route  DELETE /api/student/events/:id
// @access Private/Student
export const deleteEvent = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const event = await StudentEvent.findOne({ where: { id: req.params.id, studentId } });
    if (!event) return next(new ErrorResponse('Event record not found', 404));

    await event.destroy();
    res.status(200).json({ success: true, data: {} });
});

// @desc   Approve/reject event (faculty/admin)
// @route  PUT /api/student/events/:id/approval
// @access Private/Faculty/Admin
export const updateEventApproval = asyncHandler(async (req, res, next) => {
    const { approvalStatus, approvalRemarks } = req.body;
    if (!['approved', 'rejected'].includes(approvalStatus)) {
        return next(new ErrorResponse(`approvalStatus must be approved or rejected, received: "${approvalStatus}"`, 400));
    }
    const event = await StudentEvent.findByPk(req.params.id);
    if (!event) return next(new ErrorResponse('Event record not found', 404));

    await event.update({ approvalStatus, approvalRemarks: approvalRemarks || null, approvedById: req.user.id, approvalDate: new Date() });

    // Notify student (non-blocking)
    notifyStudentPortfolioResult(event.studentId, {
        referenceId: event.id,
        referenceType: 'event',
        itemTitle: event.eventName,
        status: approvalStatus,
        remarks: approvalRemarks
    });

    res.status(200).json({ success: true, data: event });
});

// @desc   Get events for class in-charge
// @route  GET /api/student/events/class-incharge
// @access Private/Faculty
export const getClassInchargeEvents = asyncHandler(async (req, res, next) => {
    console.log(`\n[EVENTS-CONTROLLER] ╔════════════════════════════════════════╗`);
    console.log(`[EVENTS-CONTROLLER] ║ GET CLASS INCHARGE EVENTS              ║`);
    console.log(`[EVENTS-CONTROLLER] ╚════════════════════════════════════════╝`);
    console.log(`[EVENTS-CONTROLLER] Faculty ID to use: ${req.user?.faculty_id || req.user?.id}\n`);

    const facultyId = req.user.faculty_id || req.user.id;
    const classId = await getAssignedClassIdForFaculty(facultyId, models);
    console.log(`[EVENTS-CONTROLLER] Class ID returned from utility: ${classId}\n`);
    if (!classId) {
        return next(new ErrorResponse('User is not assigned as a class in-charge', 403));
    }

    const { approvalStatus } = req.query;

    const where = { classId };
    if (approvalStatus) where.approvalStatus = approvalStatus;

    const events = await StudentEvent.findAll({
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

    res.status(200).json({ success: true, count: events.length, data: events });
});
