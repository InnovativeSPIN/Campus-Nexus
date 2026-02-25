import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';

const { Faculty, FacultyExperience } = models;

// @desc      Get current faculty experience
// @route     GET /api/v1/faculty/experience
// @access    Private/Faculty
export const getMyExperience = asyncHandler(async (req, res, next) => {
    const faculty = await Faculty.findOne({
        where: { faculty_college_code: req.user.faculty_college_code },
        attributes: ['faculty_id']
    });

    if (!faculty) {
        return next(new ErrorResponse('Faculty profile not found', 404));
    }

    const experience = await FacultyExperience.findAll({
        where: { faculty_id: faculty.faculty_id }
    });

    res.status(200).json({
        success: true,
        data: experience
    });
});

// @desc      Add new teaching experience (supports multiple records per faculty)
// @route     POST /api/v1/faculty/experience
// @access    Private/Faculty
export const addExperience = asyncHandler(async (req, res, next) => {
    const faculty = await Faculty.findOne({
        where: { faculty_college_code: req.user.faculty_college_code },
        attributes: ['faculty_id']
    });

    if (!faculty) {
        return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // Always create a new record to support multiple teaching experience entries
    const allowed = ['designation','institution_name','university','department','from_date','to_date','period','is_current'];
    const experienceData = { faculty_id: faculty.faculty_id };
    allowed.forEach(key => { if (req.body[key] !== undefined) experienceData[key] = req.body[key]; });
    
    const experience = await FacultyExperience.create(experienceData);

    res.status(201).json({
        success: true,
        data: experience
    });
});

// @desc      Update experience record
// @route     PUT /api/v1/faculty/experience/:id
// @access    Private/Faculty
export const updateExperience = asyncHandler(async (req, res, next) => {
    let experience = await FacultyExperience.findByPk(req.params.id);

    if (!experience) {
        return next(new ErrorResponse(`Experience record not found with id of ${req.params.id}`, 404));
    }

    const faculty = await Faculty.findOne({
        where: { faculty_college_code: req.user.faculty_college_code },
        attributes: ['faculty_id']
    });

    if (experience.faculty_id !== faculty.faculty_id) {
        return next(new ErrorResponse('Not authorized to update this record', 401));
    }

    experience = await experience.update(req.body);

    res.status(200).json({
        success: true,
        data: experience
    });
});

// @desc      Delete teaching experience record
// @route     DELETE /api/v1/faculty/experience/:id
// @access    Private/Faculty
export const deleteExperience = asyncHandler(async (req, res, next) => {
    const experience = await FacultyExperience.findByPk(req.params.id);

    if (!experience) {
        return next(new ErrorResponse(`Record not found with id of ${req.params.id}`, 404));
    }

    const faculty = await Faculty.findOne({
        where: { faculty_college_code: req.user.faculty_college_code },
        attributes: ['faculty_id']
    });

    if (experience.faculty_id !== faculty.faculty_id) {
        return next(new ErrorResponse('Not authorized to access this record', 401));
    }

    // Delete the entire record since each entry is independent
    await experience.destroy();
    
    res.status(200).json({ 
        success: true, 
        message: 'Record deleted successfully',
        data: {} 
    });
});
