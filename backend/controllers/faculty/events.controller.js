import path from 'path';
import fs from 'fs';
import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';

const { Faculty, FacultyEvents } = models;

// @desc      Get current faculty events
// @route     GET /api/v1/faculty/events
// @access    Private/Faculty
export const getMyEvents = asyncHandler(async (req, res, next) => {
    const userRole = req.user.role;
    const uploaderName = req.user.Name || req.user.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();

    // If faculty, show their events. If department-admin, show events uploaded by them and events for faculty in their department.
    let whereClause = {};

    if (userRole === 'faculty' || req.user.faculty_college_code) {
        const faculty_college_code = req.user.faculty_college_code;
        const faculty = await Faculty.findOne({ where: { faculty_college_code }, attributes: ['faculty_id', 'department_id'] });
        if (!faculty) {
            return next(new ErrorResponse('Faculty profile not found', 404));
        }
        whereClause = { faculty_id: faculty.faculty_id };
    } else if (userRole === 'department-admin') {
        // find all faculty ids in this department
        const deptId = req.user.departmentId || req.user.department_id || null;
        let facultyIds = [];
        if (deptId) {
            const facRows = await Faculty.findAll({ where: { department_id: deptId }, attributes: ['faculty_id'] });
            facultyIds = facRows.map(f => f.faculty_id);
        }

        whereClause = {
            [Op.or]: [
                { organizer: uploaderName },
                ...(facultyIds.length ? [{ faculty_id: { [Op.in]: facultyIds } }] : [])
            ]
        };
    } else {
        // default: nothing
        whereClause = {};
    }

    const eventRows = await FacultyEvents.findAll({ where: whereClause, order: [['event_date', 'DESC']] });

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
    // If the requester is a faculty, retrieve faculty_id using faculty_college_code
    let faculty = null;
    if (req.user.role === 'faculty' || req.user.faculty_college_code) {
        const faculty_college_code = req.user.faculty_college_code;
        faculty = await Faculty.findOne({ where: { faculty_college_code }, attributes: ['faculty_id'] });
        if (!faculty) {
            return next(new ErrorResponse('Faculty profile not found', 404));
        }
    }

    // department-admin may add events for a specific faculty; allow passing id or code in body
    let facultyId = faculty ? faculty.faculty_id : null;
    if (!facultyId && req.user.role === 'department-admin') {
        if (req.body.faculty_id) {
            facultyId = req.body.faculty_id;
        } else if (req.body.faculty_college_code) {
            const f2 = await Faculty.findOne({ where: { faculty_college_code: req.body.faculty_college_code }, attributes: ['faculty_id'] });
            if (f2) {
                facultyId = f2.faculty_id;
            } else {
                return next(new ErrorResponse('Faculty profile not found (from body)', 404));
            }
        }
        if (!facultyId) {
            return next(new ErrorResponse('Faculty association is required for department-admin', 400));
        }
    }

    // Normalize common input names (support FormData and JSON variations)
    const event_name = (req.body && (req.body.event_name || req.body.name || req.body.eventName || req.body.name)) || '';
    const category = (req.body && (req.body.category || req.body.event_category || req.body.eventCategory || req.body.selectedEventCategory)) || '';

    // Quick debugging: if missing required fields, log incoming payload for developer diagnostics
    if (!event_name || !category) {
        console.debug('[events.addEvent] Missing fields. req.body:', req.body, 'req.files:', !!req.files);
        return next(new ErrorResponse('Event name and category are required', 400));
    }

    // Prepare event data
    const uploaderName = req.user.Name || req.user.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
    const roleFolder = (req.user.role === 'department-admin') ? 'department-admins' : 'faculty';

    // Parse event_date properly
    let eventDate = null;
    if (req.body.event_date) {
        eventDate = new Date(req.body.event_date);
        if (isNaN(eventDate.getTime())) {
            return next(new ErrorResponse('Invalid event date format', 400));
        }
    }

    const eventData = {
        event_name: event_name || '',
        category: category || '',
        faculty_id: facultyId,
        event_date: eventDate,
        organizer: req.body.organizer || uploaderName,
        organizer_type: req.body.organizer_type || 'participated',
        url: req.body.url || null
    };

    // debug
    console.log('[events.addEvent] Incoming request body:', JSON.stringify(req.body, null, 2));
    console.log('[events.addEvent] final eventData:', JSON.stringify(eventData, null, 2));

    // basic validation before hitting DB
    if (!eventData.event_name || eventData.event_name.trim() === '') {
        return next(new ErrorResponse('Event name cannot be empty', 400));
    }
    if (!eventData.category || eventData.category.trim() === '') {
        return next(new ErrorResponse('Event category cannot be empty', 400));
    }
    if (!eventData.faculty_id) {
        return next(new ErrorResponse('Faculty id missing', 400));
    }
    
    // Validate category ENUM
    const validCategories = ['Resource Person', 'FDP', 'Seminar', 'Workshop'];
    if (!validCategories.includes(eventData.category)) {
        return next(new ErrorResponse(`Invalid category. Must be one of: ${validCategories.join(', ')}`, 400));
    }

    // Validate organizer_type ENUM
    const validOrganizerTypes = ['organized', 'participated'];
    if (eventData.organizer_type && !validOrganizerTypes.includes(eventData.organizer_type)) {
        return next(new ErrorResponse(`Invalid organizer_type. Must be one of: ${validOrganizerTypes.join(', ')}`, 400));
    }

    // Handle single file upload (express-fileupload)
    try {
        const file = req.files && (req.files.file || req.files.document || req.files.documents);
        if (file) {
            const uploadFile = Array.isArray(file) ? file[0] : file;
            const ext = path.parse(uploadFile.name).ext || '';
            const cleanName = uploaderName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
            const fileName = `event_${cleanName}_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            const uploadDir = path.resolve(process.env.FILE_UPLOAD_PATH || './public/uploads', roleFolder, cleanName, 'events');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            const uploadPath = path.resolve(uploadDir, fileName);
            await uploadFile.mv(uploadPath);
            eventData.document_url = `/uploads/${roleFolder}/${cleanName}/events/${fileName}`;
        }
    } catch (err) {
        console.error('File Upload Error:', err);
        return next(new ErrorResponse('Problem with file upload', 500));
    }

    let event;
    try {
        console.log('[events.addEvent] About to create event with data:', JSON.stringify(eventData, null, 2));
        event = await FacultyEvents.create(eventData);
        console.log('[events.addEvent] Event created successfully:', event.event_id);
    } catch (err) {
        console.error('[events.addEvent] ERROR - Sequelize create failed');
        console.error('[events.addEvent] Error Message:', err.message);
        console.error('[events.addEvent] Error Code:', err.code);
        console.error('[events.addEvent] Error Name:', err.name);
        if (err.original) {
            console.error('[events.addEvent] MySQL Error:', {
                errno: err.original.errno,
                code: err.original.code,
                sqlState: err.original.sqlState,
                sqlMessage: err.original.sqlMessage,
                sql: err.original.sql
            });
        }
        console.error('[events.addEvent] eventData that caused error:', JSON.stringify(eventData, null, 2));
        
        // Return more specific error based on the error type
        if (err.name === 'SequelizeValidationError') {
            const messages = err.errors?.map((e) => e.message).join('; ') || err.message;
            return next(new ErrorResponse(`Validation error: ${messages}`, 400));
        } else if (err.name === 'SequelizeForeignKeyConstraintError') {
            return next(new ErrorResponse('Invalid faculty reference or constraint violation', 400));
        } else if (err.name === 'SequelizeUniqueConstraintError') {
            return next(new ErrorResponse('Duplicate entry detected', 400));
        }
        
        return next(new ErrorResponse('Database error when creating event', 500));
    }

    const plain = event.get ? event.get({ plain: true }) : event;
    console.log('[events.addEvent] Event created successfully:', {
        event_id: plain.event_id,
        event_name: plain.event_name,
        category: plain.category,
        faculty_id: plain.faculty_id,
        organizer: plain.organizer,
        document_url: plain.document_url
    });
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

    // Ensure the record belongs to the current faculty OR was created by the department-admin
    const uploaderName = req.user.Name || req.user.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
    if (req.user.role === 'faculty' || req.user.faculty_college_code) {
        const faculty = await Faculty.findOne({ where: { faculty_college_code: req.user.faculty_college_code }, attributes: ['faculty_id'] });
        if (!faculty) return next(new ErrorResponse('Faculty profile not found', 404));
        if (event.faculty_id !== faculty.faculty_id) {
            return next(new ErrorResponse('Not authorized to update this record', 401));
        }
    } else if (req.user.role === 'department-admin') {
        // allow update if organizer matches
        if (event.organizer !== uploaderName) {
            return next(new ErrorResponse('Not authorized to update this record', 401));
        }
    } else {
        return next(new ErrorResponse('Not authorized to update this record', 401));
    }

    // Update with field name mapping support
    const updateData = { ...req.body };
    if (updateData.name && !updateData.event_name) {
        updateData.event_name = updateData.name;
        delete updateData.name;
    }

    // Handle file upload replacement if provided
    try {
        const file = req.files && (req.files.file || req.files.document || req.files.documents);
        if (file) {
            const uploadFile = Array.isArray(file) ? file[0] : file;
            const ext = path.parse(uploadFile.name).ext || '';
            const roleFolder = (req.user.role === 'department-admin') ? 'department-admins' : 'faculty';
            const cleanName = uploaderName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
            const fileName = `event_${cleanName}_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            const uploadDir = path.resolve(process.env.FILE_UPLOAD_PATH || './public/uploads', roleFolder, cleanName, 'events');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            const uploadPath = path.resolve(uploadDir, fileName);
            await uploadFile.mv(uploadPath);

            // delete old file if exists
            if (event.document_url) {
                const oldFilePath = path.resolve(process.env.FILE_UPLOAD_PATH || './public/uploads', event.document_url.replace('/uploads/', ''));
                if (fs.existsSync(oldFilePath)) {
                    try { fs.unlinkSync(oldFilePath); } catch (e) { /* ignore */ }
                }
            }

            updateData.document_url = `/uploads/${roleFolder}/${cleanName}/events/${fileName}`;
        }
    } catch (err) {
        console.error('File Upload Error:', err);
        return next(new ErrorResponse('Problem with file upload', 500));
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

    // Ensure the record belongs to the current faculty or the department-admin who created it
    if (req.user.role === 'faculty' || req.user.faculty_college_code) {
        const faculty = await Faculty.findOne({ where: { faculty_college_code: req.user.faculty_college_code }, attributes: ['faculty_id'] });
        if (!faculty) return next(new ErrorResponse('Faculty profile not found', 404));
        if (event.faculty_id !== faculty.faculty_id) {
            return next(new ErrorResponse('Not authorized to delete this record', 401));
        }
    } else if (req.user.role === 'department-admin') {
        const uploaderName = req.user.Name || req.user.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
        if (event.organizer !== uploaderName) {
            return next(new ErrorResponse('Not authorized to delete this record', 401));
        }
    } else {
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
