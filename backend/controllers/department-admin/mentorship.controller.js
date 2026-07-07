import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';

const { Faculty, Student, MentorAllocation } = models;

// @route   GET /api/v1/department-admin/mentorship/mentors
// @desc    Get all faculty in the department with their mentee counts
// @access  Private (Department Admin)
export const getMentors = asyncHandler(async (req, res, next) => {
  const departmentId = req.user.department_id;
  const { academic_year } = req.query;

  if (!academic_year) {
    return next(new ErrorResponse('Please provide academic_year', 400));
  }

  const mentors = await Faculty.findAll({
    where: { department_id: departmentId, status: 'active' },
    attributes: ['faculty_id', 'Name', 'email', 'designation', 'profile_image_url']
  });

  const allocations = await MentorAllocation.findAll({
    where: { academic_year, status: 'active' },
    attributes: ['faculty_id', [sequelize.fn('COUNT', sequelize.col('student_id')), 'mentee_count']],
    group: ['faculty_id']
  });

  const countsMap = {};
  allocations.forEach(a => {
    countsMap[a.faculty_id] = a.get('mentee_count');
  });

  const result = mentors.map(m => {
    const obj = m.toJSON();
    obj.mentee_count = countsMap[obj.faculty_id] || 0;
    return obj;
  });

  res.status(200).json({
    success: true,
    data: result
  });
});

// @route   GET /api/v1/department-admin/mentorship/students
// @desc    Get students and their mentor status
// @access  Private (Department Admin)
export const getStudents = asyncHandler(async (req, res, next) => {
  const departmentId = req.user.department_id;
  const { academic_year, batch, semester } = req.query;

  if (!academic_year) {
    return next(new ErrorResponse('Please provide academic_year', 400));
  }

  const where = { departmentId, status: 'active' };
  if (batch) where.batch = batch;
  if (semester) where.semester = semester;

  const students = await Student.findAll({
    where,
    attributes: ['id', 'studentId', 'rollNumber', 'firstName', 'lastName', 'email', 'gender', 'photo', 'batch', 'semester']
  });

  const allocations = await MentorAllocation.findAll({
    where: { academic_year, status: 'active' },
    attributes: ['student_id', 'faculty_id']
  });

  const allocationMap = {};
  allocations.forEach(a => {
    allocationMap[a.student_id] = a.faculty_id;
  });

  const facultyIds = [...new Set(allocations.map(a => a.faculty_id))];
  const facultyRecords = await Faculty.findAll({
    where: { faculty_id: { [Op.in]: facultyIds } },
    attributes: ['faculty_id', 'Name']
  });

  const facultyMap = {};
  facultyRecords.forEach(f => {
    facultyMap[f.faculty_id] = f.Name;
  });

  const result = students.map(s => {
    const obj = s.toJSON();
    const assigned_faculty_id = allocationMap[obj.id];
    obj.mentor_id = assigned_faculty_id || null;
    obj.mentor_name = assigned_faculty_id ? facultyMap[assigned_faculty_id] : null;
    return obj;
  });

  res.status(200).json({
    success: true,
    count: result.length,
    data: result
  });
});

// @route   POST /api/v1/department-admin/mentorship/assign
// @desc    Assign students to a mentor
// @access  Private (Department Admin)
export const assignMentor = asyncHandler(async (req, res, next) => {
  const { faculty_id, student_ids, academic_year } = req.body;
  const assigned_by = req.user.id; // User ID of the admin

  if (!faculty_id || !student_ids || !student_ids.length || !academic_year) {
    return next(new ErrorResponse('Please provide faculty_id, student_ids, and academic_year', 400));
  }

  const transaction = await sequelize.transaction();
  try {
    // Check if faculty exists in department
    const faculty = await Faculty.findOne({
      where: { faculty_id, department_id: req.user.department_id }
    });
    if (!faculty) {
      await transaction.rollback();
      return next(new ErrorResponse('Faculty not found in your department', 404));
    }

    // Inactivate any existing assignments for these students in this academic year
    await MentorAllocation.update(
      { status: 'inactive' },
      { where: { student_id: { [Op.in]: student_ids }, academic_year }, transaction }
    );

    // Create new assignments
    const allocations = student_ids.map(student_id => ({
      faculty_id,
      student_id,
      academic_year,
      assigned_by,
      status: 'active'
    }));

    // Use bulkCreate with updateOnDuplicate to handle unique constraint (if reusing records)
    await MentorAllocation.bulkCreate(allocations, {
      updateOnDuplicate: ['faculty_id', 'assigned_by', 'assigned_at', 'status'],
      transaction
    });

    await transaction.commit();
    res.status(200).json({
      success: true,
      message: 'Students assigned to mentor successfully'
    });
  } catch (error) {
    await transaction.rollback();
    return next(new ErrorResponse('Error assigning students', 500));
  }
});

// @route   DELETE /api/v1/department-admin/mentorship/unassign
// @desc    Unassign students from any mentor
// @access  Private (Department Admin)
export const unassignMentor = asyncHandler(async (req, res, next) => {
  const { student_ids, academic_year } = req.body;

  if (!student_ids || !student_ids.length || !academic_year) {
    return next(new ErrorResponse('Please provide student_ids and academic_year', 400));
  }

  await MentorAllocation.update(
    { status: 'inactive' },
    { where: { student_id: { [Op.in]: student_ids }, academic_year } }
  );

  res.status(200).json({
    success: true,
    message: 'Students unassigned successfully'
  });
});
