import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';

const { Faculty, FacultyExperience } = models;

// Helper to resolve faculty profile reliably
const getFacultyProfile = async (user) => {
    if (!user) return null;
    const targetId = user.faculty_id || user.id;
    const orConditions = [];
    if (targetId) {
        orConditions.push({ faculty_id: targetId });
        orConditions.push({ id: targetId });
    }
    if (user.faculty_college_code) {
        orConditions.push({ faculty_college_code: user.faculty_college_code });
    }
    if (user.email) {
        orConditions.push({ email: user.email });
    }
    if (orConditions.length === 0) return null;
    
    return await Faculty.findOne({
        where: { [Op.or]: orConditions },
        attributes: ['faculty_id', 'faculty_college_code']
    });
};

// @desc      Get current faculty experience
// @route     GET /api/v1/faculty/experience
// @access    Private/Faculty
export const getMyExperience = asyncHandler(async (req, res, next) => {
    const faculty = await getFacultyProfile(req.user);

    if (!faculty) {
        return res.status(200).json({
            success: true,
            data: []
        });
    }

    const experience = await FacultyExperience.findAll({
        where: { faculty_id: faculty.faculty_id }
    });

    res.status(200).json({
        success: true,
        data: experience
    });
});

// @desc      Add new teaching experience
// @route     POST /api/v1/faculty/experience
// @access    Private/Faculty
export const addExperience = asyncHandler(async (req, res, next) => {
    const faculty = await getFacultyProfile(req.user);

    if (!faculty) {
        return next(new ErrorResponse('Faculty profile not found', 404));
    }

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

    const faculty = await getFacultyProfile(req.user);

    if (!faculty || experience.faculty_id !== faculty.faculty_id) {
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

    const faculty = await getFacultyProfile(req.user);

    if (!faculty || experience.faculty_id !== faculty.faculty_id) {
        return next(new ErrorResponse('Not authorized to access this record', 401));
    }

    await experience.destroy();
    
    res.status(200).json({ 
        success: true, 
        message: 'Record deleted successfully',
        data: {} 
    });
});
