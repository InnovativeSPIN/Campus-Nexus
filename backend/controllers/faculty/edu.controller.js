import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';

const { Faculty, FacultyEduQualification } = models;

// Helper to resolve faculty profile reliably by faculty_id, email, or faculty_college_code
const getFacultyProfile = async (user) => {
    if (!user) return null;
    const targetId = user.faculty_id || user.facultyId || user.id;
    const orConditions = [];
    if (user.faculty_id) {
        orConditions.push({ faculty_id: user.faculty_id });
    } else if (targetId) {
        orConditions.push({ faculty_id: targetId });
    }
    if (user.faculty_college_code) {
        orConditions.push({ faculty_college_code: user.faculty_college_code });
    }
    if (user.email) {
        orConditions.push({ email: user.email });
    }
    if (orConditions.length === 0) return null;
    
    let faculty = await Faculty.findOne({
        where: { [Op.or]: orConditions },
        attributes: ['faculty_id', 'faculty_college_code', 'department_id', 'role_id', 'Name', 'email']
    });

    if (!faculty && user.email) {
        try {
            faculty = await Faculty.create({
                Name: user.name || user.Name || 'Faculty Member',
                email: user.email,
                role_id: user.role_id || 5,
                password: user.password || '$2a$10$7v59r2R3z4XWqY/r92k6eOaQG6B2d0D.uG0wK2X.y9h5G.9a.9.9',
                faculty_college_code: user.faculty_college_code || `FAC_${Date.now()}`
            });
        } catch (err) {
            console.warn('[getFacultyProfile] Auto-create faculty record failed:', err.message);
        }
    }

    return faculty;
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
