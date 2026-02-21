import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
const { StudentSport, StudentEvent, Student, User } = models;

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
        include: [{ model: User, as: 'approvedBy', attributes: ['name'] }],
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

    const sport = await StudentSport.create({ ...req.body, studentId, approvalStatus: 'pending' });
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
    await sport.update({ ...req.body, approvalStatus: 'pending' });
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
        return next(new ErrorResponse('approvalStatus must be approved or rejected', 400));
    }
    const sport = await StudentSport.findByPk(req.params.id);
    if (!sport) return next(new ErrorResponse('Sport record not found', 404));

    await sport.update({ approvalStatus, approvalRemarks: approvalRemarks || null, approvedById: req.user.id, approvalDate: new Date() });
    res.status(200).json({ success: true, data: sport });
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
        include: [{ model: User, as: 'approvedBy', attributes: ['name'] }],
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

    const event = await StudentEvent.create({ ...req.body, studentId, approvalStatus: 'pending' });
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
    await event.update({ ...req.body, approvalStatus: 'pending' });
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
        return next(new ErrorResponse('approvalStatus must be approved or rejected', 400));
    }
    const event = await StudentEvent.findByPk(req.params.id);
    if (!event) return next(new ErrorResponse('Event record not found', 404));

    await event.update({ approvalStatus, approvalRemarks: approvalRemarks || null, approvedById: req.user.id, approvalDate: new Date() });
    res.status(200).json({ success: true, data: event });
});
