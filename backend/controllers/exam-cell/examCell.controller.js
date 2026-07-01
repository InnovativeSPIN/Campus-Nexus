import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';

const {
  Student,
  StudentInternalMark,
  ExamCellSubmission,
  ExamCellNotification,
  Subject,
  Class,
  Faculty,
  Department,
  Announcement,
  User
} = models;

// @desc   Get dashboard statistics for exam cell admin
// @route  GET /api/v1/exam-cell/dashboard/stats
// @access Private/ExamCellAdmin
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  try {
    const pending = await ExamCellSubmission.count({ where: { status: 'submitted' } });
    const underReview = await ExamCellSubmission.count({ where: { status: 'under_review' } });
    const published = await ExamCellSubmission.count({ where: { status: 'published' } });
    const rejected = await ExamCellSubmission.count({ where: { status: 'rejected' } });

    res.status(200).json({
      success: true,
      data: {
        pending,
        underReview,
        published,
        rejected
      }
    });
  } catch (error) {
    return next(new ErrorResponse(`Error fetching dashboard stats: ${error.message}`, 500));
  }
});

// @desc   List all submissions filterable by status, department, class, semester, year, etc.
// @route  GET /api/v1/exam-cell/submissions
// @access Private/ExamCellAdmin
export const getSubmissions = asyncHandler(async (req, res, next) => {
  const { status, classId, semester, academicYear, internalNumber, search } = req.query;

  const where = {};
  if (status) where.status = status;
  if (classId) where.class_id = classId;
  if (semester) where.semester = semester;
  if (academicYear) where.academic_year = academicYear;
  if (internalNumber) where.internal_number = internalNumber;

  try {
    const submissions = await ExamCellSubmission.findAll({
      where,
      include: [
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['faculty_id', 'Name', 'email', 'department_id'],
          include: [{ model: Department, as: 'department', attributes: ['short_name', 'full_name'] }]
        },
        { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'section', 'semester'] }
      ],
      order: [['submitted_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    return next(new ErrorResponse(`Error fetching submissions: ${error.message}`, 500));
  }
});

// @desc   Get full details of a single submission with student marks
// @route  GET /api/v1/exam-cell/submissions/:id
// @access Private/ExamCellAdmin
export const getSubmissionDetails = asyncHandler(async (req, res, next) => {
  try {
    const submission = await ExamCellSubmission.findByPk(req.params.id, {
      include: [
        { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'Name', 'email'] },
        { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'section', 'semester'] }
      ]
    });

    if (!submission) {
      return next(new ErrorResponse('Submission batch not found', 404));
    }

    // Fetch marks for this submission batch
    const marks = await StudentInternalMark.findAll({
      where: {
        subjectId: submission.subject_id,
        classId: submission.class_id,
        semester: submission.semester,
        academicYear: submission.academic_year,
        internalNumber: submission.internal_number
      },
      include: [
        { model: Student, as: 'student', attributes: ['id', 'studentId', 'firstName', 'lastName'] }
      ],
      order: [[{ model: Student, as: 'student' }, 'studentId', 'ASC']]
    });

    // Format output
    const formattedMarks = marks.map(m => ({
      markId: m.id,
      regNo: m.student?.studentId || 'N/A',
      name: m.student ? `${m.student.firstName} ${m.student.lastName || ''}`.trim() : 'Unknown',
      internal100: m.internal100 !== null ? m.internal100.toString() : "",
      internal60: m.internalScore !== null ? m.internalScore.toString() : "",
      assignment1: m.assignment1 !== null ? m.assignment1.toString() : "",
      assignment2: m.assignment2 !== null ? m.assignment2.toString() : "",
      assignmentTotal: m.assessmentScore !== null ? m.assessmentScore.toString() : "",
      workingHours: m.workingHours !== null ? m.workingHours.toString() : "60",
      presentHours: m.presentHours !== null ? m.presentHours.toString() : "",
      attendancePercentage: m.attendancePercentage !== null ? m.attendancePercentage.toString() + "%" : "",
      totalMarks: m.totalScore !== null ? m.totalScore.toString() : "",
      remarks: m.remarks || "",
      status: m.totalScore !== null ? (parseFloat(m.totalScore) >= 50 ? "Pass" : "Fail") : "-",
      verified: m.status === 'verified' || m.status === 'published',
      dbStatus: m.status
    }));

    res.status(200).json({
      success: true,
      data: {
        submission,
        marks: formattedMarks
      }
    });
  } catch (error) {
    return next(new ErrorResponse(`Error fetching details: ${error.message}`, 500));
  }
});

// @desc   Verify a submission (mark as under_review)
// @route  PUT /api/v1/exam-cell/submissions/:id/verify
// @access Private/ExamCellAdmin
export const verifySubmission = asyncHandler(async (req, res, next) => {
  try {
    const submission = await ExamCellSubmission.findByPk(req.params.id);

    if (!submission) {
      return next(new ErrorResponse('Submission batch not found', 404));
    }

    await submission.update({
      status: 'under_review',
      reviewed_by: req.user.id,
      reviewed_at: new Date()
    });

    await StudentInternalMark.update({
      status: 'verified',
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    }, {
      where: {
        subjectId: submission.subject_id,
        classId: submission.class_id,
        semester: submission.semester,
        academicYear: submission.academic_year,
        internalNumber: submission.internal_number
      }
    });

    res.status(200).json({
      success: true,
      message: 'Submission is now under review',
      data: submission
    });
  } catch (error) {
    return next(new ErrorResponse(`Error verifying submission: ${error.message}`, 500));
  }
});

// @desc   Edit a single student's mark entry (verify/correct)
// @route  PUT /api/v1/exam-cell/marks/:markId
// @access Private/ExamCellAdmin
export const updateStudentMark = asyncHandler(async (req, res, next) => {
  const { internal100, internal60, assignment1, assignment2, assignmentTotal, workingHours, presentHours, attendancePercentage, totalMarks, remarks } = req.body;

  try {
    const mark = await StudentInternalMark.findByPk(req.params.markId);
    if (!mark) {
      return next(new ErrorResponse('Student mark entry not found', 404));
    }

    // Check if published already
    if (mark.status === 'published') {
      return next(new ErrorResponse('Cannot modify marks that are already published.', 400));
    }

    await mark.update({
      internal100: internal100 !== undefined ? (internal100 !== "" ? parseFloat(internal100) : null) : mark.internal100,
      internalScore: internal60 !== undefined ? (internal60 !== "" ? parseFloat(internal60) : null) : mark.internalScore,
      assignment1: assignment1 !== undefined ? (assignment1 !== "" ? parseFloat(assignment1) : null) : mark.assignment1,
      assignment2: assignment2 !== undefined ? (assignment2 !== "" ? parseFloat(assignment2) : null) : mark.assignment2,
      assessmentScore: assignmentTotal !== undefined ? (assignmentTotal !== "" ? parseFloat(assignmentTotal) : null) : mark.assessmentScore,
      workingHours: workingHours !== undefined ? (workingHours !== "" ? parseInt(workingHours) : 60) : mark.workingHours,
      presentHours: presentHours !== undefined ? (presentHours !== "" ? parseInt(presentHours) : 0) : mark.presentHours,
      attendancePercentage: attendancePercentage !== undefined ? (attendancePercentage !== "" ? parseFloat(attendancePercentage) : null) : mark.attendancePercentage,
      totalScore: totalMarks !== undefined ? (totalMarks !== "" ? parseFloat(totalMarks) : null) : mark.totalScore,
      remarks: remarks !== undefined ? remarks : mark.remarks,
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Student mark entry updated successfully',
      data: mark
    });
  } catch (error) {
    return next(new ErrorResponse(`Error updating student mark: ${error.message}`, 500));
  }
});

// @desc   Publish result (release marks to students)
// @route  POST /api/v1/exam-cell/submissions/:id/publish
// @access Private/ExamCellAdmin
export const publishSubmission = asyncHandler(async (req, res, next) => {
  try {
    const submission = await ExamCellSubmission.findByPk(req.params.id, {
      include: [
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' }
      ]
    });

    if (!submission) {
      return next(new ErrorResponse('Submission batch not found', 404));
    }

    if (submission.status === 'published') {
      return next(new ErrorResponse('This batch has already been published.', 400));
    }

    // 1. Update submission status to published
    await submission.update({
      status: 'published',
      published_by: req.user.id,
      published_at: new Date()
    });

    // 2. Fetch all student internal marks for this batch
    const marks = await StudentInternalMark.findAll({
      where: {
        subjectId: submission.subject_id,
        classId: submission.class_id,
        semester: submission.semester,
        academicYear: submission.academic_year,
        internalNumber: submission.internal_number
      }
    });

    // 3. Bulk update student internal marks to published and calculate totalScore
    for (const m of marks) {
      const int60 = parseFloat(m.internalScore) || 0;
      const assTotal = parseFloat(m.assessmentScore) || 0;
      const totalScore = int60 + assTotal;

      await m.update({
        status: 'published',
        publishedBy: req.user.id,
        publishedAt: new Date(),
        totalScore: totalScore
      });
    }

    // 4. Send exam cell notifications
    await ExamCellNotification.create({
      submissionId: submission.id,
      createdBy: req.user.id,
      title: `Result Released: IA #${submission.internal_number}`,
      message: `The internal assessment scores for ${submission.subject?.subject_name} (${submission.class?.name}) have been published.`,
      type: 'result_published',
      targetRole: ['student', 'faculty', 'department-admin'],
      department_id: submission.class?.department_id,
      class_id: submission.class_id,
      semester: submission.semester,
      academic_year: submission.academic_year
    });

    // 5. Create Announcement for students
    let deptShortName = null;
    if (submission.class?.department_id) {
      const dept = await Department.findByPk(submission.class.department_id);
      deptShortName = dept?.short_name || null;
    }

    await Announcement.create({
      title: `IA Results Published: Sem ${submission.semester} - ${submission.subject?.subject_name}`,
      message: `Internal Assessment #${submission.internal_number} results for ${submission.subject?.subject_name} (${submission.class?.name || 'All Classes'}) have been published and are available in your portal.`,
      type: 'result',
      priority: 'high',
      targetRole: ['student'],
      department: deptShortName,
      createdById: req.user.id,
      creatorRole: 'exam-cell-admin',
      isActive: true
    });

    res.status(200).json({
      success: true,
      message: `Marks published successfully. Released scores for ${marks.length} students.`,
      publishedCount: marks.length
    });
  } catch (error) {
    return next(new ErrorResponse(`Error publishing submission: ${error.message}`, 500));
  }
});

// @desc   Reject submission back to faculty with reason
// @route  POST /api/v1/exam-cell/submissions/:id/reject
// @access Private/ExamCellAdmin
export const rejectSubmission = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  if (!reason) {
    return next(new ErrorResponse('Please provide a reason for rejecting the marks.', 400));
  }

  try {
    const submission = await ExamCellSubmission.findByPk(req.params.id);

    if (!submission) {
      return next(new ErrorResponse('Submission batch not found', 404));
    }

    // 1. Update submission status to rejected
    await submission.update({
      status: 'rejected',
      rejection_reason: reason,
      reviewed_by: req.user.id,
      reviewed_at: new Date()
    });

    // 2. Update all student internal marks in the batch to rejected
    await StudentInternalMark.update({
      status: 'rejected',
      rejectionReason: reason
    }, {
      where: {
        subjectId: submission.subject_id,
        classId: submission.class_id,
        semester: submission.semester,
        academicYear: submission.academic_year,
        internalNumber: submission.internal_number
      }
    });

    // 3. Create Notification for Faculty
    await ExamCellNotification.create({
      submissionId: submission.id,
      createdBy: req.user.id,
      title: 'Marks Batch Rejected',
      message: `Your marks batch for Subject ${submission.subject_id}, IA #${submission.internal_number} has been rejected by the Exam Cell. Reason: ${reason}`,
      type: 'marks_rejected',
      targetRole: ['faculty'],
      class_id: submission.class_id
    });

    res.status(200).json({
      success: true,
      message: 'Marks batch has been rejected and sent back to faculty',
      data: submission
    });
  } catch (error) {
    return next(new ErrorResponse(`Error rejecting submission: ${error.message}`, 500));
  }
});

// @desc   View published results by class
// @route  GET /api/v1/exam-cell/students/:classId/results
// @access Private/ExamCellAdmin
export const getPublishedClassResults = asyncHandler(async (req, res, next) => {
  const { classId } = req.params;
  const { subjectId, semester, academicYear, internalNumber } = req.query;

  const where = { classId, status: 'published' };
  if (subjectId) where.subjectId = subjectId;
  if (semester) where.semester = semester;
  if (academicYear) where.academicYear = academicYear;
  if (internalNumber) where.internalNumber = internalNumber;

  try {
    const marks = await StudentInternalMark.findAll({
      where,
      include: [
        { model: Student, as: 'student', attributes: ['id', 'studentId', 'firstName', 'lastName'] },
        { model: Subject, as: 'subject', attributes: ['subject_name', 'subject_code'] }
      ]
    });

    res.status(200).json({
      success: true,
      count: marks.length,
      data: marks
    });
  } catch (error) {
    return next(new ErrorResponse(`Error fetching published results: ${error.message}`, 500));
  }
});

// @desc   Create and broadcast a custom notification
// @route  POST /api/v1/exam-cell/notifications
// @access Private/ExamCellAdmin
export const createCustomNotification = asyncHandler(async (req, res, next) => {
  const { title, message, type, targetRole, departmentId, classId, semester, academicYear } = req.body;

  if (!title || !message || !type || !targetRole) {
    return next(new ErrorResponse('Please fill all required fields: title, message, type, targetRole', 400));
  }

  try {
    const notification = await ExamCellNotification.create({
      createdBy: req.user.id,
      title,
      message,
      type,
      targetRole,
      departmentId: departmentId || null,
      classId: classId || null,
      semester: semester || null,
      academicYear: academicYear || null,
      isSent: true,
      sentAt: new Date()
    });

    // Also insert into general Announcements if targetRole contains student
    if (targetRole.includes('student')) {
      let deptShortName = null;
      if (departmentId) {
        const dept = await Department.findByPk(departmentId);
        deptShortName = dept?.short_name || null;
      }

      await Announcement.create({
        title,
        message,
        type: 'general',
        priority: 'normal',
        targetRole: ['student'],
        department: deptShortName,
        semester: semester ? semester.toString() : null,
        year: academicYear,
        createdById: req.user.id,
        creatorRole: 'exam-cell-admin',
        isActive: true
      });
    }

    res.status(201).json({
      success: true,
      message: 'Notification created and broadcasted successfully',
      data: notification
    });
  } catch (error) {
    return next(new ErrorResponse(`Error creating notification: ${error.message}`, 500));
  }
});

// @desc   List all notifications created by exam cell
// @route  GET /api/v1/exam-cell/notifications
// @access Private/ExamCellAdmin
export const getNotificationsList = asyncHandler(async (req, res, next) => {
  try {
    const notifications = await ExamCellNotification.findAll({
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    return next(new ErrorResponse(`Error fetching notifications: ${error.message}`, 500));
  }
});
