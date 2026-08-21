import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';

const { Faculty, FacultyIndustryExperience } = models;

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
