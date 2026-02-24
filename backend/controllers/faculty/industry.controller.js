import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';

const { Faculty, FacultyIndustryExperience } = models;

// @desc Get industry experiences for current faculty
// @route GET /api/v1/faculty/experience/industry
// @access Private/Faculty
export const getMyIndustryExperience = asyncHandler(async (req, res, next) => {
  const faculty = await Faculty.findOne({ where: { faculty_college_code: req.user.faculty_college_code }, attributes: ['faculty_id'] });
  if (!faculty) return next(new ErrorResponse('Faculty profile not found', 404));

  const rows = await FacultyIndustryExperience.findAll({ where: { faculty_id: faculty.faculty_id }, order: [['from_date','DESC']] });
  res.status(200).json({ success: true, data: rows });
});

// @desc Add an industry experience
// @route POST /api/v1/faculty/experience/industry
// @access Private/Faculty
export const addIndustryExperience = asyncHandler(async (req, res, next) => {
  const faculty = await Faculty.findOne({ where: { faculty_college_code: req.user.faculty_college_code }, attributes: ['faculty_id'] });
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

  const faculty = await Faculty.findOne({ where: { faculty_college_code: req.user.faculty_college_code }, attributes: ['faculty_id'] });
  if (record.faculty_id !== faculty.faculty_id) return next(new ErrorResponse('Not authorized to update this record', 401));

  record = await record.update(req.body);
  res.status(200).json({ success: true, data: record });
});

// @desc Delete industry experience
// @route DELETE /api/v1/faculty/experience/industry/:id
// @access Private/Faculty
export const deleteIndustryExperience = asyncHandler(async (req, res, next) => {
  const record = await FacultyIndustryExperience.findByPk(req.params.id);
  if (!record) return next(new ErrorResponse(`Record not found with id of ${req.params.id}`, 404));

  const faculty = await Faculty.findOne({ where: { faculty_college_code: req.user.faculty_college_code }, attributes: ['faculty_id'] });
  if (record.faculty_id !== faculty.faculty_id) return next(new ErrorResponse('Not authorized to delete this record', 401));

  await record.destroy();
  res.status(200).json({ success: true, data: {} });
});
