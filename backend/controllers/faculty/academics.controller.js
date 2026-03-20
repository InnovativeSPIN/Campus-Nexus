import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';

const { 
  FacultySubjectAssignment, 
  Subject, 
  Department, 
  Class: ClassModel,
  Faculty 
} = models;

// @route   GET /api/v1/faculty/academics/my-subjects
// @desc    Get all subjects assigned to the logged-in faculty
// @access  Private (Faculty)
export const getMyAssignedSubjects = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id || req.user.id;
  const { academic_year, semester, status } = req.query;

  const where = { faculty_id: facultyId };

  if (academic_year) where.academic_year = academic_year;
  if (semester) where.semester = semester;
  if (status) where.status = status || 'active';

  const assignments = await FacultySubjectAssignment.findAll({
    where,
    include: [
      {
        model: Subject,
        as: 'subject',
        attributes: [
          'id', 
          'subject_name', 
          'subject_code', 
          'credits', 
          'type', 
          'is_elective', 
          'is_laboratory',
          'hours_per_week',
          'lab_hours_per_week',
          'semester',
          'academic_year',
          'year',
          'department_id',
          'batch',
          'lab_name'
        ],
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'short_name', 'full_name']
          }
        ]
      },
      {
        model: ClassModel,
        as: 'class',
        attributes: ['id', 'name', 'capacity', 'section', 'semester', 'batch'],
        required: false
      }
    ],
    order: [['academic_year', 'DESC'], ['semester', 'ASC']]
  });

  // Transform to match frontend expectations
  const transformedAssignments = assignments.map(assignment => {
    const data = assignment.toJSON();
    const subject = data.subject || {};
    
    return {
      id: data.id,
      assignment_id: data.id,
      faculty_id: data.faculty_id,
      subject_id: data.subject_id,
      class_id: data.class_id,
      academic_year: data.academic_year,
      semester: data.semester,
      status: data.status,
      total_hours: data.total_hours,
      no_of_periods: data.no_of_periods,
      subject: {
        id: subject.id,
        code: subject.subject_code,
        name: subject.subject_name,
        credits: subject.credits,
        type: subject.type,
        is_elective: subject.is_elective,
        is_laboratory: subject.is_laboratory,
        hours_per_week: subject.hours_per_week,
        lab_hours_per_week: subject.lab_hours_per_week,
        semester: subject.semester,
        academic_year: subject.academic_year,
        year: subject.year,
        department_id: subject.department_id,
        batch: subject.batch,
        lab_name: subject.lab_name,
        department: subject.department
      },
      class: data.class,
      assigned_at: data.assigned_at
    };
  });

  // Group subjects by academic_year, semester, and department for the credits view
  const groupedBySemester = {};
  
  transformedAssignments.forEach(assignment => {
    const { academic_year, semester, subject } = assignment;
    const department = subject.department?.short_name || 'Unknown';
    const year = subject.year || Math.ceil(semester / 2);
    const key = `${department}-${year}-${semester}`;

    if (!groupedBySemester[key]) {
      groupedBySemester[key] = {
        semester,
        year,
        department,
        academic_year,
        subjects: []
      };
    }

    groupedBySemester[key].subjects.push({
      id: subject.id,
      code: subject.code,
      name: subject.name,
      category: subject.type || 'PCC',
      lectureHours: subject.hours_per_week || 0,
      tutorialHours: 0,
      practicalHours: subject.lab_hours_per_week || 0,
      totalHours: (subject.hours_per_week || 0) + (subject.lab_hours_per_week || 0),
      credits: subject.credits,
      is_elective: subject.is_elective,
      is_laboratory: subject.is_laboratory,
      lab_name: subject.lab_name
    });
  });

  res.status(200).json({
    success: true,
    count: transformedAssignments.length,
    data: transformedAssignments,
    grouped: Object.values(groupedBySemester)
  });
});

// @route   GET /api/v1/faculty/academics/my-classes
// @desc    Get all classes assigned to the logged-in faculty
// @access  Private (Faculty)
export const getMyAssignedClasses = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id || req.user.id;
  const { academic_year } = req.query;

  const where = { faculty_id: facultyId, status: 'active' };
  if (academic_year) where.academic_year = academic_year;

  const assignments = await FacultySubjectAssignment.findAll({
    where,
    include: [
      {
        model: Subject,
        as: 'subject',
        attributes: [
          'id', 
          'subject_name', 
          'subject_code', 
          'semester',
          'academic_year',
          'year'
        ],
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'short_name', 'full_name']
          }
        ]
      },
      {
        model: ClassModel,
        as: 'class',
        attributes: ['id', 'name', 'section', 'semester', 'batch', 'capacity']
      }
    ],
    order: [['academic_year', 'DESC'], ['semester', 'ASC']]
  });

  // Transform to match frontend expectations (ClassSubject interface)
  const classSubjects = assignments.map(assignment => {
    const data = assignment.toJSON();
    const subject = data.subject || {};
    const classInfo = data.class || {};
    const department = subject.department || {};

    return {
      id: data.id.toString(),
      assignment_id: data.id,
      program: `${department.short_name || department.full_name || 'Unknown'}`,
      semester: `${subject.semester}`,
      section: classInfo.section || 'N/A',
      subject: subject.subject_name,
      subjectCode: subject.subject_code,
      class_id: data.class_id,
      className: classInfo.name,
      batch: subject.academic_year || classInfo.batch
    };
  });

  res.status(200).json({
    success: true,
    count: classSubjects.length,
    data: classSubjects
  });
});
