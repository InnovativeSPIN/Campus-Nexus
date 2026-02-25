import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';

const { Faculty, FacultyEduQualification } = models;

// @desc      Get current faculty education qualifications
// @route     GET /api/v1/faculty/education
// @access    Private/Faculty
export const getMyEducation = asyncHandler(async (req, res, next) => {
    // 1. Get Employee ID (faculty_college_code) from req.user
    const faculty_college_code = req.user.faculty_college_code;

    // 2. Retrieve faculty_id using faculty_college_code
    const faculty = await Faculty.findOne({
        where: { faculty_college_code },
        attributes: ['faculty_id']
    });

    if (!faculty) {
        return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // 3. Retrieve education records using the found faculty_id
    const educationRows = await FacultyEduQualification.findAll({
        where: { faculty_id: faculty.faculty_id }
    });

    // Normalize response: include an `id` property for frontend convenience
    const education = educationRows.map(r => {
        const plain = r.get ? r.get({ plain: true }) : r;
        return {
            ...plain,
            id: plain.membership_id ?? null
        };
    });

    res.status(200).json({
        success: true,
        data: education
    });
});

// @desc      Add new education qualification or membership (supports multiple records per faculty)
// @route     POST /api/v1/faculty/education
// @access    Private/Faculty
export const addEducation = asyncHandler(async (req, res, next) => {
    // 1. Get Employee ID (faculty_college_code) from req.user
    const faculty_college_code = req.user.faculty_college_code;

    // 2. Retrieve faculty_id using the faculty_college_code (Employee ID)
    const faculty = await Faculty.findOne({
        where: { faculty_college_code },
        attributes: ['faculty_id']
    });

    if (!faculty) {
        return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // 3. Always create a new record to support multiple education/membership entries
    const educationData = {
        ...req.body,
        faculty_id: faculty.faculty_id
    };
    const education = await FacultyEduQualification.create(educationData);

    const plain = education.get ? education.get({ plain: true }) : education;
    res.status(201).json({
        success: true,
        data: { ...plain, id: plain.membership_id ?? null }
    });
});

// @desc      Update education qualification
// @route     PUT /api/v1/faculty/education/:id
// @access    Private/Faculty
export const updateEducation = asyncHandler(async (req, res, next) => {
    let education = await FacultyEduQualification.findByPk(req.params.id);

    if (!education) {
        return next(new ErrorResponse(`Education record not found with id of ${req.params.id}`, 404));
    }

    // Ensure the record belongs to the current faculty
    const faculty = await Faculty.findOne({
        where: { faculty_college_code: req.user.faculty_college_code },
        attributes: ['faculty_id']
    });

    if (education.faculty_id !== faculty.faculty_id) {
        return next(new ErrorResponse('Not authorized to update this record', 401));
    }

    education = await education.update(req.body);
    const plain = education.get ? education.get({ plain: true }) : education;

    res.status(200).json({
        success: true,
        data: { ...plain, id: plain.membership_id ?? null }
    });
});

// @desc      Delete education qualification or membership record
// @route     DELETE /api/v1/faculty/education/:id
// @access    Private/Faculty
export const deleteEducation = asyncHandler(async (req, res, next) => {
    const education = await FacultyEduQualification.findByPk(req.params.id);

    if (!education) {
        return next(new ErrorResponse(`Record not found with id of ${req.params.id}`, 404));
    }

    // Ensure the record belongs to the current faculty
    const faculty = await Faculty.findOne({
        where: { faculty_college_code: req.user.faculty_college_code },
        attributes: ['faculty_id']
    });

    if (education.faculty_id !== faculty.faculty_id) {
        return next(new ErrorResponse('Not authorized to access this record', 401));
    }

    // Delete the entire record since each entry is independent
    await education.destroy();
    
    res.status(200).json({
        success: true,
        message: 'Record deleted successfully',
        data: {}
    });
});
