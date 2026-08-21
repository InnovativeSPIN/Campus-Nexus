import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';

const { Faculty, FacultyIndustryExperience } = models;

// Helper to resolve faculty profile reliably
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

// @desc Get industry experiences for current faculty
// @route GET /api/v1/faculty/experience/industry
// @access Private/Faculty
export const getMyIndustryExperience = asyncHandler(async (req, res, next) => {
  const faculty = await getFacultyProfile(req.user);
  if (!faculty) return res.status(200).json({ success: true, data: [] });

  const rows = await FacultyIndustryExperience.findAll({ where: { faculty_id: faculty.faculty_id }, order: [['from_date','DESC']] });
  res.status(200).json({ success: true, data: rows });
});

// @desc Add an industry experience
// @route POST /api/v1/faculty/experience/industry
// @access Private/Faculty
export const addIndustryExperience = asyncHandler(async (req, res, next) => {
  const faculty = await getFacultyProfile(req.user);
  if (!faculty) return next(new ErrorResponse('Faculty profile not found', 404));

  const data = { ...req.body, faculty_id: faculty.faculty_id };
  const created = await FacultyIndustryExperience.create(data);
  res.status(201).json({ success: true, data: created });
});

// @desc Update industry experience
// @route PUT /api/v1/faculty/experience/industry/:id
// @access Private/Faculty
export const updateIndustryExperience = asyncHandler(async (req, res, next) => {
  let record = await FacultyIndustryExperience.findByPk(req.params.id);
  if (!record) return next(new ErrorResponse(`Record not found with id of ${req.params.id}`, 404));

  const faculty = await getFacultyProfile(req.user);
  if (!faculty || record.faculty_id !== faculty.faculty_id) return next(new ErrorResponse('Not authorized to update this record', 401));

  record = await record.update(req.body);
  res.status(200).json({ success: true, data: record });
});

// @desc Delete industry experience
// @route DELETE /api/v1/faculty/experience/industry/:id
// @access Private/Faculty
export const deleteIndustryExperience = asyncHandler(async (req, res, next) => {
  const record = await FacultyIndustryExperience.findByPk(req.params.id);
  if (!record) return next(new ErrorResponse(`Record not found with id of ${req.params.id}`, 404));

  const faculty = await getFacultyProfile(req.user);
  if (!faculty || record.faculty_id !== faculty.faculty_id) return next(new ErrorResponse('Not authorized to delete this record', 401));

  await record.destroy();
  res.status(200).json({ success: true, data: {} });
});
