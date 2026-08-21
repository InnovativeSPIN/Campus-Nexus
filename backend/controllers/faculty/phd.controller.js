import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';

const { Faculty, FacultyPhd } = models;

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

// @desc Get current faculty PhD records
// @route GET /api/v1/faculty/phd
// @access Private/Faculty
export const getMyPhd = asyncHandler(async (req, res, next) => {
  const faculty = await getFacultyProfile(req.user);
  if (!faculty) {
    return res.status(200).json({ success: true, data: [] });
  }

  const rows = await FacultyPhd.findAll({ where: { faculty_id: faculty.faculty_id } });
  const data = rows.map(r => r.get ? r.get({ plain: true }) : r);

  res.status(200).json({ success: true, data });
});

// @desc Add a PhD record
// @route POST /api/v1/faculty/phd
// @access Private/Faculty
export const addPhd = asyncHandler(async (req, res, next) => {
  const faculty = await getFacultyProfile(req.user);
  if (!faculty) return next(new ErrorResponse('Faculty profile not found', 404));

  const phd = await FacultyPhd.create({ ...req.body, faculty_id: faculty.faculty_id });
  const plain = phd.get ? phd.get({ plain: true }) : phd;

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

  const faculty = await getFacultyProfile(req.user);
  if (!faculty || phd.faculty_id !== faculty.faculty_id) return next(new ErrorResponse('Not authorized to update this record', 401));

  const updated = await phd.update(req.body);
  const plain = updated.get ? updated.get({ plain: true }) : updated;
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

  const faculty = await getFacultyProfile(req.user);
  if (!faculty || phd.faculty_id !== faculty.faculty_id) return next(new ErrorResponse('Not authorized to delete this record', 401));

  await phd.destroy();
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
