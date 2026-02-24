import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';

const { Faculty, FacultyPhd } = models;

// @desc Get current faculty PhD records
// @route GET /api/v1/faculty/phd
// @access Private/Faculty
export const getMyPhd = asyncHandler(async (req, res, next) => {
  const faculty_college_code = req.user.faculty_college_code;

  const faculty = await Faculty.findOne({ where: { faculty_college_code }, attributes: ['faculty_id'] });
  if (!faculty) return next(new ErrorResponse('Faculty profile not found', 404));

  const rows = await FacultyPhd.findAll({ where: { faculty_id: faculty.faculty_id } });
  const data = rows.map(r => r.get ? r.get({ plain: true }) : r);

  res.status(200).json({ success: true, data });
});

// @desc Add a PhD record
// @route POST /api/v1/faculty/phd
// @access Private/Faculty
export const addPhd = asyncHandler(async (req, res, next) => {
  const faculty_college_code = req.user.faculty_college_code;
  const faculty = await Faculty.findOne({ where: { faculty_college_code }, attributes: ['faculty_id'] });
  if (!faculty) return next(new ErrorResponse('Faculty profile not found', 404));

  const phd = await FacultyPhd.create({ ...req.body, faculty_id: faculty.faculty_id });
  const plain = phd.get ? phd.get({ plain: true }) : phd;

  // Update faculty phd_status to match this record's status
  try {
    if (req.body.status) {
      await Faculty.update({ phd_status: req.body.status }, { where: { faculty_id: faculty.faculty_id } });
    }
  } catch (e) {
    console.warn('Failed to update faculty phd_status after creating PhD record', e);
  }

  res.status(201).json({ success: true, data: plain });
});

// @desc Update a PhD record
// @route PUT /api/v1/faculty/phd/:id
// @access Private/Faculty
export const updatePhd = asyncHandler(async (req, res, next) => {
  const phd = await FacultyPhd.findByPk(req.params.id);
  if (!phd) return next(new ErrorResponse(`PhD record not found with id of ${req.params.id}`, 404));

  const faculty = await Faculty.findOne({ where: { faculty_college_code: req.user.faculty_college_code }, attributes: ['faculty_id'] });
  if (phd.faculty_id !== faculty.faculty_id) return next(new ErrorResponse('Not authorized to update this record', 401));

  const updated = await phd.update(req.body);
  const plain = updated.get ? updated.get({ plain: true }) : updated;
  // Update faculty phd_status based on updated record
  try {
    if (plain.status) {
      await Faculty.update({ phd_status: plain.status }, { where: { faculty_id: faculty.faculty_id } });
    }
  } catch (e) {
    console.warn('Failed to update faculty phd_status after updating PhD record', e);
  }

  res.status(200).json({ success: true, data: plain });
});

// @desc Delete a PhD record
// @route DELETE /api/v1/faculty/phd/:id
// @access Private/Faculty
export const deletePhd = asyncHandler(async (req, res, next) => {
  const phd = await FacultyPhd.findByPk(req.params.id);
  if (!phd) return next(new ErrorResponse(`PhD record not found with id of ${req.params.id}`, 404));

  const faculty = await Faculty.findOne({ where: { faculty_college_code: req.user.faculty_college_code }, attributes: ['faculty_id'] });
  if (phd.faculty_id !== faculty.faculty_id) return next(new ErrorResponse('Not authorized to delete this record', 401));

  await phd.destroy();
  // After deletion, determine remaining PhD records and update faculty.phd_status accordingly
  try {
    const remaining = await FacultyPhd.findAll({ where: { faculty_id: faculty.faculty_id } });
    let newStatus = 'No';
    if (remaining && remaining.length > 0) {
      const statuses = remaining.map(r => r.status && r.status.toString());
      if (statuses.includes('Yes')) newStatus = 'Yes';
      else if (statuses.includes('Pursuing')) newStatus = 'Pursuing';
      else newStatus = statuses[0] || 'Yes';
    }
    await Faculty.update({ phd_status: newStatus }, { where: { faculty_id: faculty.faculty_id } });
  } catch (e) {
    console.warn('Failed to recompute faculty phd_status after deleting PhD record', e);
  }

  res.status(200).json({ success: true, message: 'PhD record deleted', data: {} });
});
