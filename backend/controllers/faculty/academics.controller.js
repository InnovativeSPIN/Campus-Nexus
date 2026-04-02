import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const { 
  FacultySubjectAssignment, 
  Subject, 
  Department, 
  Class: ClassModel,
  Faculty,
  CourseLessonPlan,
  CourseFile,
  CourseFileNotification
} = models;

// @route   GET /api/v1/faculty/academics/my-subjects
// @desc    Get all subjects assigned to the logged-in faculty or department
// @access  Private (Faculty)
export const getMyAssignedSubjects = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id || req.user.id;
  const departmentId = req.user.department_id;
  const userRole = req.user.role;
  const { academic_year, semester, status } = req.query;

  // For department-admin, we'll filter via the include where clause below.
  // For faculty, filter by their faculty_id
  let where;
  if (userRole === 'department-admin' && departmentId) {
    // Will filter via Subject include where clause
    where = {};
  } else {
    where = { faculty_id: facultyId };
  }

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
        ],
        // For department-admin, filter by department (required: true forces inner join)
        ...(userRole === 'department-admin' && departmentId ? { where: { department_id: departmentId }, required: true } : { required: false })
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
// @desc    Get all classes assigned to the logged-in faculty or department
// @access  Private (Faculty)
export const getMyAssignedClasses = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id || req.user.id;
  const departmentId = req.user.department_id;
  const userRole = req.user.role;
  const { academic_year } = req.query;

  // For department-admin, we'll filter via the include where clause below.
  // For faculty, filter by their faculty_id
  let where;
  if (userRole === 'department-admin' && departmentId) {
    // Will filter via Subject include where clause
    where = { status: 'active' };
  } else {
    where = { faculty_id: facultyId, status: 'active' };
  }
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
          'year',
          'department_id'
        ],
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'short_name', 'full_name']
          }
        ],
        // For department-admin, filter by department (required: true forces inner join)
        ...(userRole === 'department-admin' && departmentId ? { where: { department_id: departmentId }, required: true } : { required: false })
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
      faculty_id: data.faculty_id,
      subject_id: subject.id,
      class_id: data.class_id,
      program: `${department.short_name || department.full_name || 'Unknown'}`,
      semester: `${subject.semester}`,
      section: classInfo.section || 'N/A',
      subject: subject.subject_name,
      subjectCode: subject.subject_code,
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

// ==================== COURSE LESSON PLAN ENDPOINTS ====================

/**
 * @desc    Get all lesson plans for a faculty's subject
 * @route   GET /api/v1/faculty/academics/course-plans
 * @access  Private (Faculty)
 * Query: ?subjectId=X&classId=Y&facultyId=Z&academicYear=2025-2026&semester=4
 * Note: facultyId is required for department-admin, optional for regular faculty
 */
export const getCourseLessonPlans = asyncHandler(async (req, res, next) => {
  const { subjectId, classId, facultyId: queryFacultyId, academicYear, semester, includePending } = req.query;
  const departmentId = req.user.department_id;
  const userRole = req.user.role;

  // Derive facultyId (department admin may request on behalf of other faculty)
  const facultyIdRaw = queryFacultyId || req.user.faculty_id || req.user.id;
  const facultyId = parseInt(facultyIdRaw, 10);
  const subjectIdNum = parseInt(subjectId, 10);
  const classIdNum = parseInt(classId, 10);

  console.log('[getCourseLessonPlans] User role:', userRole, 'Request facultyId:', facultyIdRaw, 'Resolved facultyId:', facultyId, 'Dept:', departmentId, 'subjectId:', subjectId, 'classId:', classId);

  if (!subjectId || isNaN(subjectIdNum) || subjectIdNum <= 0) {
    return next(new ErrorResponse('Please provide a valid subjectId', 400));
  }
  if (!classId || isNaN(classIdNum) || classIdNum <= 0) {
    return next(new ErrorResponse('Please provide a valid classId', 400));
  }
  if (!facultyId || isNaN(facultyId) || facultyId <= 0) {
    return next(new ErrorResponse('Faculty information not found for this user', 400));
  }

  try {
    const currentYear = new Date().getFullYear();
    const defaultYear = `${currentYear}-${currentYear + 1}`;

    if (userRole === 'department-admin' && departmentId) {
      const assignmentCheck = await FacultySubjectAssignment.findOne({
        where: {
          faculty_id: facultyId,
          subject_id: subjectIdNum,
          class_id: classIdNum,
          status: 'active'
        },
        include: [{
          model: Subject,
          as: 'subject',
          where: { department_id: departmentId },
          required: true
        }]
      });

      if (!assignmentCheck) {
        console.warn('[getCourseLessonPlans] Dept-admin not authorized for this faculty+subject+class', { departmentId, facultyId, subjectIdNum, classIdNum });
        return next(new ErrorResponse('Not authorized to view this subject course plan', 403));
      }
    }

    // Build approval status filter:
    // - Faculty viewing their own: show both pending and approved
    // - Faculty viewing as dept-admin: show only approved 
    // - Students viewing: show only approved
    const isOwnPlan = req.user.faculty_id === facultyId || req.user.id === facultyId;
    let approvalStatusWhere = {};
    
    if ((userRole === 'faculty' && isOwnPlan) || includePending === 'true') {
      // Faculty sees own pending + approved plans (and NULL for backward compatibility)
      approvalStatusWhere = { [Op.in]: ['pending', 'approved', null] };
    } else {
      // Others see only approved plans
      approvalStatusWhere = { [Op.in]: ['approved', null] };  // Include NULL for backward compatibility
    }

    const plans = await CourseLessonPlan.findAll({
      where: {
        faculty_id: facultyId,
        subject_id: subjectIdNum,
        class_id: classIdNum,
        academic_year: academicYear || defaultYear,
        semester: semester ? parseInt(semester, 10) : 4,
        approval_status: approvalStatusWhere
      },
      include: [
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'subject_name', 'subject_code'],
        },
        {
          model: ClassModel,
          as: 'class',
          attributes: ['id', 'name', 'semester'],
        },
      ],
      order: [['sno', 'ASC']],
      raw: false,
    });

    console.log('[getCourseLessonPlans] Found', plans.length, 'plans for faculty', facultyId);

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    console.error('[getCourseLessonPlans] fatal error:', {
      subjectIdNum,
      classIdNum,
      facultyId,
      userRole,
      departmentId,
      errorMessage: error.message,
      stack: error.stack,
    });

    return next(new ErrorResponse(`Error fetching lesson plans: ${error.message}`, 500));
  }
});

/**
 * @desc    Create or update complete lesson plan for a subject
 * @route   POST /api/v1/faculty/academics/course-plans
 * @access  Private (Faculty)
 */
export const createCourseLessonPlan = asyncHandler(async (req, res, next) => {
  const { subjectId, classId, facultyId: queryFacultyId, academicYear, semester } = req.query;
  const { topics, academicYear: bodyAcademicYear, academic_year: body_academic_year, semester: bodySemester } = req.body || {};
  const finalAcademicYear = academicYear || bodyAcademicYear || body_academic_year;
  const facultyId = parseInt(queryFacultyId || req.user.faculty_id || req.user.id, 10);
  const subjectIdNum = parseInt(subjectId, 10);
  const classIdNum = parseInt(classId, 10);

  if (!facultyId || isNaN(facultyId) || facultyId <= 0) {
    return next(new ErrorResponse('Faculty information not found for this user', 400));
  }
  if (!subjectId || isNaN(subjectIdNum) || subjectIdNum <= 0) {
    return next(new ErrorResponse('Please provide a valid subjectId', 400));
  }
  if (!classId || isNaN(classIdNum) || classIdNum <= 0) {
    return next(new ErrorResponse('Please provide a valid classId', 400));
  }

  if (!subjectId || !classId || !topics || !Array.isArray(topics)) {
    return next(
      new ErrorResponse('Please provide subjectId, classId, and topics array', 400)
    );
  }

  try {
    const currentYear = new Date().getFullYear();
    const defaultYear = `${currentYear}-${currentYear + 1}`;

    // Remove existing plans for this subject/class/semester combination
    const academicYearVal = finalAcademicYear || defaultYear;
    const semesterVal = bodySemester || semester || 4;

    await CourseLessonPlan.destroy({
      where: {
        faculty_id: facultyId,
        subject_id: subjectIdNum,
        class_id: classIdNum,
        academic_year: academicYearVal,
        semester: semesterVal,
      },
    });

    // Calculate cumulative periods
    let cumulativePeriods = 0;
    const plansToCreate = topics.map((topic, index) => {
      cumulativePeriods += topic.periods_required || 1;
      return {
        faculty_id: facultyId,
        subject_id: subjectId,
        class_id: classId,
        academic_year: academicYearVal,
        semester: semesterVal,
        sno: index + 1,
        unit_number: topic.unit_number,
        unit_label: topic.unit_label,
        topic: topic.topic,
        co_number: topic.co_number,
        btl: topic.btl,
        delivery_mode: topic.delivery_mode,
        reference_book: topic.reference_book,
        periods_required: topic.periods_required || 1,
        periods_taken: 0,
        cumulative_periods: cumulativePeriods,
        is_completed: false,
        tentative_date: topic.tentative_date,
        created_by: facultyId,
      };
    });

    // Bulk create
    const createdPlans = await CourseLessonPlan.bulkCreate(plansToCreate);

    res.status(201).json({
      success: true,
      count: createdPlans.length,
      message: 'Lesson plans created successfully',
      data: createdPlans,
    });
  } catch (error) {
    console.error('[createCourseLessonPlan] Error:', error);
    return next(new ErrorResponse(`Error creating lesson plans: ${error.message}`, 500));
  }
});

/**
 * @desc    Get pending topics for attendance marking
 * @route   GET /api/v1/faculty/academics/course-plans/pending
 * @access  Private (Faculty)
 * Query: ?subjectId=X&classId=Y&facultyId=Z
 */
export const createCourseLessonPlanBulk = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id || req.user.id;
  const { subjectId, classId, academicYear, academic_year, semester, topics } = req.body;

  // Support both camelCase and snake_case for academic_year
  const academicYearValue = academicYear || academic_year;

  console.log('[createCourseLessonPlanBulk] Request:', {
    facultyId,
    subjectId,
    classId,
    academicYear: academicYearValue,
    semester,
    topicsCount: topics?.length
  });

  if (!subjectId || !classId || !topics || !Array.isArray(topics) || topics.length === 0) {
    return next(new ErrorResponse('Please provide subjectId, classId, and topics array (non-empty)', 400));
  }

  const subjectIdNum = parseInt(subjectId, 10);
  const classIdNum = parseInt(classId, 10);

  if (isNaN(subjectIdNum) || isNaN(classIdNum)) {
    return next(new ErrorResponse('Invalid subjectId or classId', 400));
  }

  try {
    const currentYear = new Date().getFullYear();
    const defaultYear = `${currentYear}-${currentYear + 1}`;
    const academicYearVal = academicYearValue || defaultYear;
    const semesterVal = semester || 1;

    // Generate unique batch ID for this upload
    const uploadBatchId = `${facultyId}_${subjectIdNum}_${classIdNum}_${Date.now()}`;

    console.log('[createCourseLessonPlanBulk] Deleting existing plans...');
    // Remove existing plans for this subject/class/semester combination
    await CourseLessonPlan.destroy({
      where: {
        faculty_id: facultyId,
        subject_id: subjectIdNum,
        class_id: classIdNum,
        academic_year: academicYearVal,
        semester: semesterVal,
      },
    });

    console.log('[createCourseLessonPlanBulk] Creating new plans...');
    // Map topics to database records
    const plansToCreate = topics.map((topic) => ({
      faculty_id: facultyId,
      subject_id: subjectIdNum,
      class_id: classIdNum,
      academic_year: academicYearVal,
      semester: semesterVal,
      sno: topic.sno || 1,
      unit_number: topic.unit_number || 1,
      unit_label: topic.unit_label || '',
      topic: topic.topic,
      co_number: topic.co_number || null,
      btl: topic.btl || null,
      delivery_mode: topic.delivery_mode || null,
      reference_book: topic.reference_book || null,
      periods_required: topic.periods_required || 1,
      periods_taken: 0,
      cumulative_periods: topic.cumulative_periods || 0,
      is_completed: false,
      tentative_date: topic.tentative_date || null,
      approval_status: 'pending',  // Set to pending - needs department admin approval
      approved_by: null,
      approved_date: null,
      approval_remarks: null,
      batch_submission_date: new Date(),
      upload_batch_id: uploadBatchId,
      created_by: facultyId,
    }));

    const createdPlans = await CourseLessonPlan.bulkCreate(plansToCreate);
    console.log('[createCourseLessonPlanBulk] Successfully created', createdPlans.length, 'topics with batch:', uploadBatchId);

    // Send notification to department admins for approval
    try {
      const { Faculty } = models;
      const departmentId = req.user.department_id;
      
      const departmentAdmins = await Faculty.findAll({
        where: {
          role_id: 7, // Department admin role
          department_id: departmentId,
          is_active: true
        },
        attributes: ['faculty_id'],
        raw: true
      });

      const deptAdminIds = departmentAdmins.map(admin => admin.faculty_id);
      
      if (deptAdminIds.length > 0 && models.CourseLessonPlanNotification) {
        const notifications = deptAdminIds.map(adminId => ({
          course_lesson_plan_id: createdPlans[0]?.id,
          faculty_id: createdPlans[0]?.faculty_id,
          subject_id: subjectIdNum,
          class_id: classIdNum,
          recipient_type: 'department-admin',
          recipient_id: adminId,
          notification_type: 'approval_request',
          is_read: false,
          created_at: new Date()
        }));

        // Don't fail if notification fails
        try {
          await models.CourseLessonPlanNotification.bulkCreate(notifications).catch(err => {
            console.warn('[createCourseLessonPlanBulk] Notification creation failed (non-fatal):', err.message);
          });
        } catch (notifErr) {
          console.warn('[createCourseLessonPlanBulk] Notification error (ignored):', notifErr.message);
        }
      }
    } catch (notificationError) {
      console.warn('[createCourseLessonPlanBulk] Notification error (non-critical):', notificationError.message);
      // Don't fail the main request
    }

    res.status(201).json({
      success: true,
      count: createdPlans.length,
      message: `${createdPlans.length} lesson plan topics created successfully and submitted for approval`,
      data: createdPlans,
    });
  } catch (error) {
    console.error('[createCourseLessonPlanBulk] Error:', error);
    return next(new ErrorResponse(`Error creating lesson plans: ${error.message}`, 500));
  }
});

/**
 * @desc    Get pending topics for attendance marking
 * @route   GET /api/v1/faculty/academics/course-plans/pending
 * @access  Private (Faculty)
 * Query: ?subjectId=X&classId=Y&facultyId=Z
 */
export const getPendingCourseLessonPlans = asyncHandler(async (req, res, next) => {
  const { subjectId, classId, facultyId: queryFacultyId } = req.query;
  const facultyId = parseInt(queryFacultyId || req.user.faculty_id || req.user.id, 10);
  const subjectIdNum = parseInt(subjectId, 10);
  const classIdNum = parseInt(classId, 10);

  if (!facultyId || isNaN(facultyId) || facultyId <= 0) {
    return next(new ErrorResponse('Faculty information not found for this user', 400));
  }
  if (!subjectId || isNaN(subjectIdNum) || subjectIdNum <= 0) {
    return next(new ErrorResponse('Please provide a valid subjectId', 400));
  }
  if (!classId || isNaN(classIdNum) || classIdNum <= 0) {
    return next(new ErrorResponse('Please provide a valid classId', 400));
  }

  try {
    console.log('[getPendingCourseLessonPlans] Fetching topics:', { facultyId, subjectIdNum, classIdNum });
    
    // Get all uncompleted topics for this subject/class, ordered by sno
    const pendingTopics = await CourseLessonPlan.findAll({
      where: {
        faculty_id: facultyId,
        subject_id: subjectIdNum,
        class_id: classIdNum,
        is_completed: false,
      },
      order: [['sno', 'ASC']],
      attributes: ['id', 'sno', 'unit_label', 'topic', 'periods_required', 'periods_taken', 'co_number', 'btl', 'unit_number'],
      raw: true,
    });

    console.log('[getPendingCourseLessonPlans] Found topics:', pendingTopics.length);

    res.status(200).json({
      success: true,
      count: pendingTopics.length,
      data: pendingTopics,
      message: pendingTopics.length > 0 ? 'Pending topics for marking' : 'All topics completed',
    });
  } catch (error) {
    console.error('[getPendingCourseLessonPlans] Error:', error.message, error.stack);
    return next(
      new ErrorResponse(`Error fetching pending topics: ${error.message}`, 500)
    );
  }
});

/**
 * @desc    Get lesson plan progress/completion status
 * @route   GET /api/v1/faculty/academics/course-plans/progress
 * @access  Private (Faculty)
 * Query: ?subjectId=X&classId=Y&facultyId=Z&academicYear=2025-2026&semester=4
 */
export const getCourseLessonPlanProgress = asyncHandler(async (req, res, next) => {
  const { subjectId, classId, facultyId: queryFacultyId, academicYear, semester } = req.query;
  let facultyId = queryFacultyId || req.user.faculty_id || req.user.id;

  if (!facultyId) {
    return next(new ErrorResponse('Faculty information not found for this user', 400));
  }

  try {
    const currentYear = new Date().getFullYear();
    const defaultYear = `${currentYear}-${currentYear + 1}`;

    const progress = await CourseLessonPlan.findAll({
      where: {
        faculty_id: parseInt(facultyId),
        subject_id: parseInt(subjectId),
        class_id: parseInt(classId),
        academic_year: academicYear || defaultYear,
        semester: semester ? parseInt(semester) : 4,
      },
      attributes: [
        'id',
        'sno',
        'topic',
        'periods_required',
        'periods_taken',
        'is_completed',
        'cumulative_periods',
      ],
      order: [['sno', 'ASC']],
    });

    // Calculate summary
    const totalTopics = progress.length;
    const totalPeriodsPlanned = progress.reduce((sum, p) => sum + (p.periods_required || 1), 0);
    const totalPeriodsTaught = progress.reduce((sum, p) => sum + (p.periods_taken || 0), 0);
    const topicsCompleted = progress.filter((p) => p.is_completed).length;
    const completionPercentage = totalTopics > 0 ? (topicsCompleted / totalTopics) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        topics: progress,
        summary: {
          totalTopics,
          totalPeriodsPlanned,
          totalPeriodsTaught,
          topicsCompleted,
          completionPercentage: parseFloat(completionPercentage.toFixed(2)),
        },
      },
    });
  } catch (error) {
    console.error('[getCourseLessonPlanProgress] Error:', error);
    return next(
      new ErrorResponse(`Error fetching lesson plan progress: ${error.message}`, 500)
    );
  }
});

// ==================== COURSE FILE UPLOAD ENDPOINTS ====================

/**
 * @desc    Upload course file (PDF) and submit for approval
 * @route   POST /api/v1/faculty/academics/course-files/upload
 * @access  Private (Faculty)
 * Body: FormData with file, subjectId, classId, notes
 */
export const uploadCourseFile = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id || req.user.id;
  const departmentId = req.user.department_id;
  const { subjectId, classId, notes, academic_year, semester } = req.body;

  if (!req.file) {
    return next(new ErrorResponse('No file uploaded', 400));
  }

  if (!subjectId || !classId) {
    return next(new ErrorResponse('SubjectId and classId are required', 400));
  }

  try {
    const subjectIdNum = parseInt(subjectId, 10);
    const classIdNum = parseInt(classId, 10);
    
    // Use provided academic_year and semester or fallback to current defaults
    const currentYear = new Date().getFullYear();
    const defaultAcademicYear = `${currentYear}-${currentYear + 1}`;
    const defaultSemester = new Date().getMonth() < 6 ? 2 : 1;

    const academicYear = academic_year || defaultAcademicYear;
    const semesterVal = semester ? parseInt(semester, 10) : defaultSemester;

    // Verify faculty has assignment to this subject/class
    const assignment = await FacultySubjectAssignment.findOne({
      where: {
        faculty_id: facultyId,
        subject_id: subjectIdNum,
        class_id: classIdNum,
        status: 'active'
      },
      include: [{
        model: Subject,
        as: 'subject',
        required: true
      }]
    });

    if (!assignment) {
      return next(new ErrorResponse('Not assigned to this subject/class combination', 403));
    }

    // Calculate file hash for duplicate detection
    const fileContent = fs.readFileSync(req.file.path);
    const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');

    // Check for duplicate files
    const existingFile = await CourseFile.findOne({
      where: {
        file_hash: fileHash,
        faculty_id: facultyId,
        subject_id: subjectIdNum
      }
    });

    if (existingFile && existingFile.status !== 'rejected') {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return next(new ErrorResponse('This file was already uploaded. Please make changes and upload again.', 409));
    }

    // Create course file record
    const courseFile = await CourseFile.create({
      faculty_id: facultyId,
      subject_id: subjectIdNum,
      class_id: classIdNum,
      department_id: assignment.subject.department_id,
      academic_year: academicYear,
      semester: semesterVal,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_size: req.file.size,
      file_hash: fileHash,
      status: 'submitted',
      submission_date: new Date(),
      notes: notes || null,
      created_by: facultyId
    });

    console.log('[uploadCourseFile] New course file uploaded:', {
      id: courseFile.id,
      faculty_id: facultyId,
      subject_id: subjectIdNum,
      file: req.file.originalname
    });

    // Get department admins notification
    // Filter for admins in this department or assigned to this subject
    const departmentAdminsAssignments = await FacultySubjectAssignment.findAll({
      where: {
        subject_id: assignment.subject_id
      },
      include: [{ 
        model: Faculty, 
        as: 'faculty', 
        required: true,
        where: { role_id: [7] } // 7 is typically department admin
      }],
      attributes: ['faculty_id']
    });

    const deptAdminIds = [...new Set(departmentAdminsAssignments.map(a => a.faculty_id))];

    // Create notifications for all department admins
    if (deptAdminIds.length > 0) {
      const notifications = deptAdminIds.map(adminId => ({
        course_file_id: courseFile.id,
        recipient_type: 'department-admin',
        recipient_id: adminId,
        notification_type: 'approval_request',
        title: `Course File Approval Request - ${assignment.subject.subject_name}`,
        message: `Faculty ${req.user.faculty_college_code || req.user.id} has submitted a course file for ${assignment.subject.subject_name} (${assignment.subject.subject_code})`,
        action_url: `/admin/approvals/${courseFile.id}`
      }));

      await CourseFileNotification.bulkCreate(notifications);
    }

    // Populate related data for response
    const populatedFile = await CourseFile.findByPk(courseFile.id, {
      include: [
        { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
        { model: ClassModel, as: 'class', attributes: ['id', 'name', 'section'] },
        { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'faculty_college_code', 'Name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Course file submitted for approval',
      data: populatedFile
    });
  } catch (error) {
    // Keep the uploaded file for debugging if subject/assignment resolution fails.
    // We only remove the file when it was a duplicate (handled earlier).
    console.error('[uploadCourseFile] Error:', error);
    return next(new ErrorResponse(`Error uploading course file: ${error.message}`, 500));
  }
});

/**
 * @desc    Upload course plan PDF (Section X) for approval
 * @route   POST /api/v1/faculty/academics/course-plans/upload
 * @access  Private (Faculty)
 * Body: multipart/form-data with field `coursePlan` and text fields subjectId, classId, academic_year, semester
 */
export const uploadCoursePlan = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id || req.user.id;
  const departmentId = req.user.department_id;
  const { subjectId, classId, academic_year, semester, notes } = req.body;

  console.log('[uploadCoursePlan] Starting upload:', {
    facultyId,
    departmentId,
    subjectId,
    classId,
    fileReceived: !!req.file,
    fileName: req.file?.originalname
  });

  if (!req.file) {
    return next(new ErrorResponse('No course plan file uploaded', 400));
  }
  if (!subjectId || !classId) {
    return next(new ErrorResponse('SubjectId and classId are required', 400));
  }

  try {
    const subjectIdNum = parseInt(subjectId, 10);
    const classIdNum = parseInt(classId, 10);

    if (isNaN(subjectIdNum) || isNaN(classIdNum)) {
      return next(new ErrorResponse('Invalid subjectId or classId format', 400));
    }

    const currentYear = new Date().getFullYear();
    const defaultAcademicYear = `${currentYear}-${currentYear + 1}`;
    const defaultSemester = new Date().getMonth() < 6 ? 2 : 1;

    const academicYear = academic_year || defaultAcademicYear;
    const semesterVal = semester ? parseInt(semester, 10) : defaultSemester;

    console.log('[uploadCoursePlan] Checking faculty assignment...');
    // Verify faculty assignment
    const assignment = await FacultySubjectAssignment.findOne({
      where: {
        faculty_id: facultyId,
        subject_id: subjectIdNum,
        class_id: classIdNum,
        status: 'active'
      },
      include: [{ model: Subject, as: 'subject', required: true }]
    });

    if (!assignment) {
      console.warn('[uploadCoursePlan] Assignment not found:', {
        facultyId,
        subjectIdNum,
        classIdNum
      });
      return next(new ErrorResponse('Not assigned to this subject/class combination', 403));
    }

    console.log('[uploadCoursePlan] Assignment verified, hashing file...');
    // Hash for duplicates
    const fileContent = fs.readFileSync(req.file.path);
    const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');

    console.log('[uploadCoursePlan] Checking for duplicate files...');
    const existingPlan = await CourseFile.findOne({
      where: {
        file_hash: fileHash,
        faculty_id: facultyId,
        subject_id: subjectIdNum,
        class_id: classIdNum,
        status: { [Op.in]: ['submitted', 'approved', 'revision_requested'] }
      }
    });

    if (existingPlan) {
      console.log('[uploadCoursePlan] Duplicate detected');
      return next(new ErrorResponse('This course plan was already uploaded. Please modify and upload again.', 409));
    }

    console.log('[uploadCoursePlan] Creating course file record...');
    const coursePlan = await CourseFile.create({
      faculty_id: facultyId,
      subject_id: subjectIdNum,
      class_id: classIdNum,
      department_id: assignment.subject.department_id,
      academic_year: academicYear,
      semester: semesterVal,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_size: req.file.size,
      file_hash: fileHash,
      status: 'submitted',
      submission_date: new Date(),
      notes: notes || 'course_plan_pdf',
      created_by: facultyId
    });

    console.log('[uploadCoursePlan] Course plan record created:', coursePlan.id);

    // Notify department admins (role_id 7) for this department
    try {
      const departmentAdmins = await Faculty.findAll({
        where: {
          role_id: 7,
          department_id: departmentId,
          is_active: true
        },
        attributes: ['faculty_id'],
        raw: true
      });

      const deptAdminIds = departmentAdmins.map(admin => admin.faculty_id);
      
      if (deptAdminIds.length > 0) {
        const notifications = deptAdminIds.map(adminId => ({
          course_file_id: coursePlan.id,
          recipient_type: 'department-admin',
          recipient_id: adminId,
          notification_type: 'approval_request',
          title: `Course Plan Approval Request - ${assignment.subject.subject_name}`,
          message: `Faculty ${req.user.faculty_college_code || req.user.id} submitted a course plan for ${assignment.subject.subject_name} (${assignment.subject.subject_code})`,
          action_url: `/admin/approvals/${coursePlan.id}`
        }));

        await CourseFileNotification.bulkCreate(notifications);
        console.log('[uploadCoursePlan] Notified', deptAdminIds.length, 'department admins');
      } else {
        console.warn('[uploadCoursePlan] No department admins found for department', departmentId);
      }
    } catch (notificationError) {
      console.warn('[uploadCoursePlan] Notification error (non-fatal):', notificationError.message);
      // Don't fail the upload if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Course plan submitted for approval',
      data: coursePlan
    });
  } catch (error) {
    console.error('[uploadCoursePlan] Error:', error);
    return next(new ErrorResponse(`Error uploading course plan: ${error.message}`, 500));
  }
});

/**
 * @desc    Get course files for faculty (all statuses)
 * @route   GET /api/v1/faculty/academics/course-files
 * @access  Private (Faculty)
 * Query: ?subjectId=X&classId=Y
 */
export const getFacultyCourseFiles = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id || req.user.id;
  const { subjectId, classId, status } = req.query;

  try {
    let where = { faculty_id: facultyId };

    if (subjectId) where.subject_id = parseInt(subjectId, 10);
    if (classId) where.class_id = parseInt(classId, 10);
    if (status) where.status = status;

    const courseFiles = await CourseFile.findAll({
      where,
      include: [
        { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
        { model: ClassModel, as: 'class', attributes: ['id', 'name', 'section'] },
        { model: Faculty, as: 'approver', attributes: ['faculty_id', 'faculty_college_code', 'Name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: courseFiles.length,
      data: courseFiles
    });
  } catch (error) {
    console.error('[getFacultyCoursefFiles] Error:', error);
    return next(new ErrorResponse(`Error fetching course files: ${error.message}`, 500));
  }
});

/**
 * @desc    Download course plan template
 * @route   GET /api/v1/faculty/academics/course-plans/template/download
 * @access  Private (Faculty)
 */
export const downloadCoursePlanTemplate = asyncHandler(async (req, res, next) => {
  try {
    const templatePath = path.join(process.cwd(), 'public', 'uploads', 'course-plan-template.txt');

    if (!fs.existsSync(templatePath)) {
      return next(new ErrorResponse('Template not found', 404));
    }

    res.download(templatePath, 'Course-Plan-Template.txt');
    console.log('[downloadCoursePlanTemplate] Template downloaded');
  } catch (error) {
    console.error('[downloadCoursePlanTemplate] Error:', error);
    return next(new ErrorResponse(`Error downloading template: ${error.message}`, 500));
  }
});

export const downloadCoursePlanCsvTemplate = asyncHandler(async (req, res, next) => {
  try {
    const templatePath = path.join(process.cwd(), 'public', 'uploads', 'course-plan-template.csv');

    if (!fs.existsSync(templatePath)) {
      return next(new ErrorResponse('CSV template not found', 404));
    }

    res.download(templatePath, 'Course-Plan-Template.csv');
    console.log('[downloadCoursePlanCsvTemplate] CSV template downloaded');
  } catch (error) {
    console.error('[downloadCoursePlanCsvTemplate] Error:', error);
    return next(new ErrorResponse(`Error downloading CSV template: ${error.message}`, 500));
  }
});

/**
 * @desc    Download course file (PDF)
 * @route   GET /api/v1/faculty/academics/course-files/:id/download
 * @access  Private
 */
export const downloadCourseFile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const facultyId = req.user.faculty_id || req.user.id;
  const userRole = req.user.role;

  try {
    const courseFile = await CourseFile.findByPk(id);

    if (!courseFile) {
      return next(new ErrorResponse('Course file not found', 404));
    }

    // Check authorization: faculty can download their own, admin can download all
    if (userRole !== 'admin' && userRole !== 'department-admin' && courseFile.faculty_id !== facultyId) {
      return next(new ErrorResponse('Not authorized to download this file', 403));
    }

    // Check if file exists
    if (!fs.existsSync(courseFile.file_path)) {
      return next(new ErrorResponse('File not found on server', 404));
    }

    // Stream the file
    res.download(courseFile.file_path, courseFile.file_name);
  } catch (error) {
    console.error('[downloadCourseFil] Error:', error);
    return next(new ErrorResponse(`Error downloading course file: ${error.message}`, 500));
  }
});

// @route   POST /api/v1/faculty/academics/coverage-tracking
// @desc    Record syllabus coverage tracking (completed/deviation)
// @access  Private (Faculty)
export const recordCoverageTracking = asyncHandler(async (req, res, next) => {
  const { lesson_plan_id, status, coverage_date, deviation_reason, periods_delta, additional_notes } = req.body;
  const facultyId = req.user.faculty_id || req.user.id;

  // Validation
  if (!lesson_plan_id || !status || !coverage_date) {
    return next(new ErrorResponse('Missing required fields: lesson_plan_id, status, coverage_date', 400));
  }

  if (!['completed', 'deviation'].includes(status)) {
    return next(new ErrorResponse('Invalid status. Must be "completed" or "deviation"', 400));
  }

  if (status === 'deviation' && !deviation_reason) {
    return next(new ErrorResponse('Deviation reason is required when status is deviation', 400));
  }

  try {
    // Find the course lesson plan
    const coursePlan = await CourseLessonPlan.findByPk(lesson_plan_id);

    if (!coursePlan) {
      return next(new ErrorResponse('Course lesson plan not found', 404));
    }

    // Verify faculty ownership
    if (coursePlan.faculty_id !== facultyId) {
      return next(new ErrorResponse('Not authorized to update this lesson plan', 403));
    }

    // Update the course plan with coverage data
    const updates = {
      coverage_status: status,
      coverage_date: coverage_date,
      additional_notes: additional_notes || null
    };

    // If deviation, store the reason
    if (status === 'deviation') {
      updates.deviation_reason = deviation_reason;
    }

    // If completed, update the periods_taken
    if (status === 'completed') {
      const newPeriodsTaken = (coursePlan.periods_taken || 0) + (periods_delta ? Math.abs(periods_delta) : 0);
      updates.periods_taken = newPeriodsTaken;
      updates.is_completed = true;
      updates.completed_date = new Date();
    }

    await coursePlan.update(updates);

    res.status(200).json({
      success: true,
      message: `Topic coverage recorded as ${status}`,
      data: {
        lesson_plan_id: coursePlan.id,
        status: status,
        coverage_date: coverage_date,
        periods_taken: updates.periods_taken || coursePlan.periods_taken,
        is_completed: updates.is_completed || coursePlan.is_completed
      }
    });
  } catch (error) {
    console.error('[recordCoverageTracking] Error:', error);
    return next(new ErrorResponse(`Error recording coverage: ${error.message}`, 500));
  }
});

// @route   GET /api/v1/faculty/academics/today-schedule
// @desc    Get faculty's schedule for today with current/next class info
// @access  Private (Faculty)
export const getTodaySchedule = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id || req.user.id;

  try {
    const { TimetableMasterSlots, TimetableMaster, PeriodSlot, Class: ClassModel, Student: StudentModel } = models;

    // Get today's day name (Monday-Saturday)
    const now = new Date();
    const todayDayName = now.toLocaleDateString('en-US', { weekday: 'long' });

    console.log('[getTodaySchedule] Faculty ID:', facultyId, 'Day:', todayDayName);

    // Fetch timetable slots for today for this faculty
    const todayClasses = await TimetableMasterSlots.findAll({
      where: {
        faculty_id: facultyId,
        day: todayDayName,
      },
      include: [
        {
          model: TimetableMaster,
          as: 'master',
          attributes: ['id', 'class_id', 'department_id', 'academic_year', 'semester'],
          include: [
            {
              model: ClassModel,
              as: 'class',
              attributes: ['id', 'name', 'section']
            }
          ]
        },
        {
          model: PeriodSlot,
          as: 'period',
          attributes: ['id', 'start_time', 'end_time', 'period_label']
        }
      ],
      order: [['period_slot_id', 'ASC']],
      raw: false,
      subQuery: false
    });

    console.log('[getTodaySchedule] Found', todayClasses.length, 'slots for today');

    const classIds = Array.from(new Set(todayClasses.map(slot => slot.master?.class_id).filter(id => id)));
    const studentCountsByClass = {};

    if (classIds.length > 0) {
      // Count students for each class to display accurate class size
      for (const classId of classIds) {
        const count = await StudentModel.count({
          where: {
            classId,
            status: 'active'
          }
        });
        studentCountsByClass[classId] = count;
      }
    }

    // Format the response
    const formattedClasses = await Promise.all(todayClasses.map(async slot => {
      const period = slot.period || {};
      const master = slot.master || {};
      const classData = master.class || {};
      const classId = master.class_id;

      return {
        id: slot.id,
        subject: slot.notes || 'Class',
        subjectCode: slot.notes || '',
        classId,
        className: classData.name ? `${classData.name}${classData.section ? '-' + classData.section : ''}` : 'TBD',
        room: slot.room || 'TBD',
        day: slot.day,
        timeSlot: {
          start: period.start_time ? (typeof period.start_time === 'string' ? period.start_time.substring(0, 5) : new Date(period.start_time).toTimeString().substring(0, 5)) : '00:00',
          end: period.end_time ? (typeof period.end_time === 'string' ? period.end_time.substring(0, 5) : new Date(period.end_time).toTimeString().substring(0, 5)) : '00:00'
        },
        type: slot.session_type || 'lecture',
        studentsCount: classId ? (studentCountsByClass[classId] || 0) : 0,
        totalPeriods: 1,
        periodNumber: slot.period_slot_id
      };
    }));

    res.status(200).json({
      success: true,
      count: formattedClasses.length,
      dayName: todayDayName,
      data: formattedClasses
    });
  } catch (error) {
    console.error('[getTodaySchedule] Error:', error);
    return next(new ErrorResponse(`Error fetching today's schedule: ${error.message}`, 500));
  }
});
