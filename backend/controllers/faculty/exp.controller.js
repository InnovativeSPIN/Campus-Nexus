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

// @desc      Add or Update experience (One row per faculty)
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

    // Check if a record already exists for this faculty (teaching experience stored per-faculty)
    let experience = await FacultyExperience.findOne({ where: { faculty_id: faculty.faculty_id } });

    if (experience) {
        // Update existing record - only allow teaching-related fields
        const allowed = ['designation','institution_name','university','department','from_date','to_date','period','is_current'];
        const updateData = {};
        allowed.forEach(key => {
            if (req.body[key] !== undefined && req.body[key] !== null) updateData[key] = req.body[key];
        });

        experience = await experience.update(updateData);

        res.status(200).json({
            success: true,
            data: experience
        });
    } else {
        // Create new record
        // Only set teaching-related fields on create
        const allowed = ['designation','institution_name','university','department','from_date','to_date','period','is_current'];
        const experienceData = { faculty_id: faculty.faculty_id };
        allowed.forEach(key => { if (req.body[key] !== undefined) experienceData[key] = req.body[key]; });
        experience = await FacultyExperience.create(experienceData);

        res.status(201).json({
            success: true,
            data: experience
        });
    }
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

// @desc      Delete experience qualification (or clear section fields)
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

    const { section } = req.query;

    if (section === 'teaching') {
        experience.designation = null;
        experience.institution_name = null;
        experience.university = null;
        experience.department = null;
    }

    // After removing teaching fields, if row has no teaching data remaining (and no common fields), delete it
    const hasTeaching = experience.designation || experience.institution_name || experience.university || experience.department;
    const hasCommon = experience.from_date || experience.to_date || experience.period || experience.is_current;

    if (!hasTeaching && !hasCommon) {
        await experience.destroy();
        return res.status(200).json({ success: true, data: {} });
    }

    await experience.save();
    return res.status(200).json({ success: true, data: experience });
});
