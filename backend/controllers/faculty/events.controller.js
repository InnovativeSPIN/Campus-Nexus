import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';

const { Faculty, FacultyEvents } = models;

// @desc      Get current faculty events
// @route     GET /api/v1/faculty/events
// @access    Private/Faculty
export const getMyEvents = asyncHandler(async (req, res, next) => {
    // Get Employee ID (faculty_college_code) from req.user
    const faculty_college_code = req.user.faculty_college_code;

    // Retrieve faculty_id using faculty_college_code
    const faculty = await Faculty.findOne({
        where: { faculty_college_code },
        attributes: ['faculty_id']
    });

    if (!faculty) {
        return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // Retrieve events records using the found faculty_id
    const eventRows = await FacultyEvents.findAll({
        where: { faculty_id: faculty.faculty_id },
        order: [['event_date', 'DESC']]
    });

    // Normalize response: include an `id` property for frontend convenience
    const events = eventRows.map(r => {
        const plain = r.get ? r.get({ plain: true }) : r;
        return {
            ...plain,
            id: plain.event_id ?? null
        };
    });

    res.status(200).json({
        success: true,
        data: events
    });
});

// @desc      Add new event
// @route     POST /api/v1/faculty/events
// @access    Private/Faculty
export const addEvent = asyncHandler(async (req, res, next) => {
    const faculty_college_code = req.user.faculty_college_code;

    // Retrieve faculty_id using the faculty_college_code (Employee ID)
    const faculty = await Faculty.findOne({
        where: { faculty_college_code },
        attributes: ['faculty_id']
    });

    if (!faculty) {
        return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // Validate required fields
    const { event_name, category } = req.body;
    if (!event_name || !category) {
        return next(new ErrorResponse('Event name and category are required', 400));
    }

    // Create new event record
    const eventData = {
        ...req.body,
        faculty_id: faculty.faculty_id,
        event_name: req.body.event_name || req.body.name, // Support both field names
    };

    const event = await FacultyEvents.create(eventData);

    const plain = event.get ? event.get({ plain: true }) : event;
    res.status(201).json({
        success: true,
        data: { ...plain, id: plain.event_id ?? null }
    });
});

// @desc      Update event
// @route     PUT /api/v1/faculty/events/:id
// @access    Private/Faculty
export const updateEvent = asyncHandler(async (req, res, next) => {
    let event = await FacultyEvents.findByPk(req.params.id);

    if (!event) {
        return next(new ErrorResponse(`Event not found with id of ${req.params.id}`, 404));
    }

    // Ensure the record belongs to the current faculty
    const faculty = await Faculty.findOne({
        where: { faculty_college_code: req.user.faculty_college_code },
        attributes: ['faculty_id']
    });

    if (event.faculty_id !== faculty.faculty_id) {
        return next(new ErrorResponse('Not authorized to update this record', 401));
    }

    // Update with field name mapping support
    const updateData = { ...req.body };
    if (updateData.name && !updateData.event_name) {
        updateData.event_name = updateData.name;
        delete updateData.name;
    }

    event = await event.update(updateData);
    const plain = event.get ? event.get({ plain: true }) : event;

    res.status(200).json({
        success: true,
        data: { ...plain, id: plain.event_id ?? null }
    });
});

// @desc      Delete event
// @route     DELETE /api/v1/faculty/events/:id
// @access    Private/Faculty
export const deleteEvent = asyncHandler(async (req, res, next) => {
    const event = await FacultyEvents.findByPk(req.params.id);

    if (!event) {
        return next(new ErrorResponse(`Event not found with id of ${req.params.id}`, 404));
    }

    // Ensure the record belongs to the current faculty
    const faculty = await Faculty.findOne({
        where: { faculty_college_code: req.user.faculty_college_code },
        attributes: ['faculty_id']
    });

    if (event.faculty_id !== faculty.faculty_id) {
        return next(new ErrorResponse('Not authorized to delete this record', 401));
    }

    await event.destroy();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc      Get events by category
// @route     GET /api/v1/faculty/events/category/:category
// @access    Private/Faculty
export const getEventsByCategory = asyncHandler(async (req, res, next) => {
    const faculty_college_code = req.user.faculty_college_code;
    const { category } = req.params;

    const faculty = await Faculty.findOne({
        where: { faculty_college_code },
        attributes: ['faculty_id']
    });

    if (!faculty) {
        return next(new ErrorResponse('Faculty profile not found', 404));
    }

    const eventRows = await FacultyEvents.findAll({
        where: {
            faculty_id: faculty.faculty_id,
            category: category
        },
        order: [['event_date', 'DESC']]
    });

    const events = eventRows.map(r => {
        const plain = r.get ? r.get({ plain: true }) : r;
        return {
            ...plain,
            id: plain.event_id ?? null
        };
    });

    res.status(200).json({
        success: true,
        data: events
    });
});
