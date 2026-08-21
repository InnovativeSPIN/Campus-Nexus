import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';

const { Faculty, FacultyEduQualification } = models;

// Helper to resolve faculty profile reliably by faculty_id, id, email, or faculty_college_code
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

// @desc      Get current faculty education qualifications
// @route     GET /api/v1/faculty/education
// @access    Private/Faculty
export const getMyEducation = asyncHandler(async (req, res, next) => {
    const faculty = await getFacultyProfile(req.user);

    if (!faculty) {
        return res.status(200).json({
            success: true,
            data: []
        });
    }

    const educationRows = await FacultyEduQualification.findAll({
        where: { faculty_id: faculty.faculty_id }
    });

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

// @desc      Add new education qualification or membership
// @route     POST /api/v1/faculty/education
// @access    Private/Faculty
export const addEducation = asyncHandler(async (req, res, next) => {
    const faculty = await getFacultyProfile(req.user);

    if (!faculty) {
        return next(new ErrorResponse('Faculty profile not found', 404));
    }

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

    const faculty = await getFacultyProfile(req.user);

    if (!faculty || education.faculty_id !== faculty.faculty_id) {
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

    const faculty = await getFacultyProfile(req.user);

    if (!faculty || education.faculty_id !== faculty.faculty_id) {
        return next(new ErrorResponse('Not authorized to access this record', 401));
    }

    await education.destroy();
    
    res.status(200).json({
        success: true,
        message: 'Record deleted successfully',
        data: {}
    });
});
