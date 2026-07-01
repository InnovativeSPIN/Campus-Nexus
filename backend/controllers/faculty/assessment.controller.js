import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';

const { Student, StudentInternalMark, ExamCellSubmission, ExamCellNotification, Subject, Class } = models;

// @desc   Get students list and existing marks for assessment
// @route  GET /api/v1/faculty/academics/assessment/students
// @access Private/Faculty
export const getAssessmentStudents = asyncHandler(async (req, res, next) => {
  const { classId, subjectId, semester, academicYear, internalNumber } = req.query;

  if (!classId || !subjectId || !semester || !academicYear || !internalNumber) {
    return next(new ErrorResponse('Please provide all query filters: classId, subjectId, semester, academicYear, internalNumber', 400));
  }

  try {
    // 1. Get class details
    const cls = await Class.findByPk(classId);
    if (!cls) {
      return next(new ErrorResponse('Class not found', 404));
    }

    // 2. Fetch all active students in the class
    const students = await Student.findAll({
      where: { classId, status: 'active' },
      attributes: ['id', 'studentId', 'firstName', 'lastName', 'email', 'status'],
      order: [['studentId', 'ASC']]
    });

    // 3. Fetch existing marks for this batch/internalNumber
    const marks = await StudentInternalMark.findAll({
      where: {
        subjectId,
        semester,
        academicYear,
        internalNumber,
        classId
      }
    });

    // 4. Fetch the batch submission status from exam_cell_submissions
    const submission = await ExamCellSubmission.findOne({
      where: {
        subject_id: subjectId,
        class_id: classId,
        semester,
        academic_year: academicYear,
        internal_number: internalNumber
      }
    });

    // Map marks by studentId
    const marksMap = {};
    marks.forEach(m => {
      marksMap[m.studentId] = m;
    });

    // Combine students and marks
    const data = students.map(student => {
      const mark = marksMap[student.id];
      return {
        id: student.id,
        regNo: student.studentId,
        name: `${student.firstName} ${student.lastName || ''}`.trim(),
        marks: mark ? {
          markId: mark.id,
          internal100: mark.internal100 !== null ? mark.internal100.toString() : "",
          internal60: mark.internalScore !== null ? mark.internalScore.toString() : "",
          assignment1: mark.assignment1 !== null ? mark.assignment1.toString() : "",
          assignment2: mark.assignment2 !== null ? mark.assignment2.toString() : "",
          assignmentTotal: mark.assessmentScore !== null ? mark.assessmentScore.toString() : "",
          workingHours: mark.workingHours !== null ? mark.workingHours.toString() : "60",
          presentHours: mark.presentHours !== null ? mark.presentHours.toString() : "",
          attendancePercentage: mark.attendancePercentage !== null ? mark.attendancePercentage.toString() + "%" : "",
          totalMarks: mark.totalScore !== null ? mark.totalScore.toString() : "",
          remarks: mark.remarks || "",
          status: mark.totalScore !== null ? (parseFloat(mark.totalScore) >= 50 ? "Pass" : "Fail") : "-",
          verified: mark.status === 'verified' || mark.status === 'published',
          dbStatus: mark.status
        } : {
          markId: null,
          internal100: "",
          internal60: "",
          assignment1: "",
          assignment2: "",
          assignmentTotal: "",
          workingHours: "60",
          presentHours: "",
          attendancePercentage: "",
          totalMarks: "",
          remarks: "",
          status: "-",
          verified: false,
          dbStatus: "draft"
        }
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      status: submission ? submission.status : 'draft',
      rejectionReason: submission ? submission.rejection_reason : null,
      data
    });
  } catch (error) {
    return next(new ErrorResponse(`Error fetching assessment: ${error.message}`, 500));
  }
});

// @desc   Save/update marks as draft (single or batch save)
// @route  POST /api/v1/faculty/academics/assessment/marks/save
// @access Private/Faculty
export const saveAssessmentMarks = asyncHandler(async (req, res, next) => {
  const { subjectId, classId, semester, academicYear, internalNumber, batch, marks } = req.body;

  if (!subjectId || !classId || !semester || !academicYear || !internalNumber || !marks || !Array.isArray(marks)) {
    return next(new ErrorResponse('Please provide all required fields and marks array', 400));
  }

  try {
    // Check if batch is already submitted/published
    const submission = await ExamCellSubmission.findOne({
      where: {
        subject_id: subjectId,
        class_id: classId,
        semester,
        academic_year: academicYear,
        internal_number: internalNumber
      }
    });

    if (submission && ['submitted', 'under_review', 'published'].includes(submission.status)) {
      return next(new ErrorResponse(`Cannot save drafts. Marks for this batch are already ${submission.status}.`, 400));
    }

    const savedRecords = [];

    for (const entry of marks) {
      const {
        studentId,
        internal100,
        internal60,
        assignment1,
        assignment2,
        assignmentTotal,
        workingHours,
        presentHours,
        attendancePercentage,
        totalMarks,
        remarks
      } = entry;

      // Find or create StudentInternalMark
      const [record, created] = await StudentInternalMark.findOrCreate({
        where: {
          studentId,
          subjectId,
          semester,
          academicYear,
          internalNumber
        },
        defaults: {
          internal100: internal100 !== "" ? parseFloat(internal100) : null,
          internalScore: internal60 !== "" ? parseFloat(internal60) : null,
          assignment1: assignment1 !== "" ? parseFloat(assignment1) : null,
          assignment2: assignment2 !== "" ? parseFloat(assignment2) : null,
          assessmentScore: assignmentTotal !== "" ? parseFloat(assignmentTotal) : null,
          workingHours: workingHours !== "" ? parseInt(workingHours) : 60,
          presentHours: presentHours !== "" ? parseInt(presentHours) : null,
          attendancePercentage: attendancePercentage !== "" ? parseFloat(attendancePercentage) : null,
          totalScore: totalMarks !== "" ? parseFloat(totalMarks) : null,
          remarks: remarks || null,
          status: 'draft',
          classId
        }
      });

      if (!created) {
        await record.update({
          internal100: internal100 !== "" ? parseFloat(internal100) : null,
          internalScore: internal60 !== "" ? parseFloat(internal60) : null,
          assignment1: assignment1 !== "" ? parseFloat(assignment1) : null,
          assignment2: assignment2 !== "" ? parseFloat(assignment2) : null,
          assessmentScore: assignmentTotal !== "" ? parseFloat(assignmentTotal) : null,
          workingHours: workingHours !== "" ? parseInt(workingHours) : 60,
          presentHours: presentHours !== "" ? parseInt(presentHours) : null,
          attendancePercentage: attendancePercentage !== "" ? parseFloat(attendancePercentage) : null,
          totalScore: totalMarks !== "" ? parseFloat(totalMarks) : null,
          remarks: remarks || null,
          status: 'draft',
          classId
        });
      }

      savedRecords.push(record);
    }

    res.status(200).json({
      success: true,
      message: 'Draft marks saved successfully',
      count: savedRecords.length
    });
  } catch (error) {
    return next(new ErrorResponse(`Error saving marks: ${error.message}`, 500));
  }
});

// @desc   Submit batch to exam cell
// @route  POST /api/v1/faculty/academics/assessment/marks/submit
// @access Private/Faculty
export const submitAssessmentMarks = asyncHandler(async (req, res, next) => {
  const { subjectId, classId, semester, academicYear, internalNumber, batch } = req.body;

  if (!subjectId || !classId || !semester || !academicYear || !internalNumber || !batch) {
    return next(new ErrorResponse('Please provide all details: subjectId, classId, semester, academicYear, internalNumber, batch', 400));
  }

  try {
    const facultyId = req.user.faculty_id;
    if (!facultyId) {
      return next(new ErrorResponse('Faculty ID not found for current session', 400));
    }

    // 1. Fetch marks for this batch
    const marks = await StudentInternalMark.findAll({
      where: {
        subjectId,
        semester,
        academicYear,
        internalNumber,
        classId
      }
    });

    // 2. Validate all marks are filled
    if (marks.length === 0) {
      return next(new ErrorResponse('No marks records found to submit. Please save draft marks first.', 400));
    }

    const incomplete = marks.some(m => m.internal100 === null || m.internalScore === null || m.totalScore === null);
    if (incomplete) {
      return next(new ErrorResponse('Please fill all student internal and assessment scores before submitting to the Exam Cell.', 400));
    }

    // 3. Update status to submitted for all records
    await StudentInternalMark.update({
      status: 'submitted',
      submittedBy: facultyId,
      submittedAt: new Date()
    }, {
      where: {
        subjectId,
        semester,
        academicYear,
        internalNumber,
        classId
      }
    });

    // 4. Create or update ExamCellSubmission
    let submission = await ExamCellSubmission.findOne({
      where: {
        faculty_id: facultyId,
        subject_id: subjectId,
        class_id: classId,
        semester,
        academic_year: academicYear,
        internal_number: internalNumber
      }
    });

    if (submission) {
      await submission.update({
        status: 'submitted',
        total_students: marks.length,
        submitted_at: new Date(),
        rejection_reason: null
      });
    } else {
      submission = await ExamCellSubmission.create({
        faculty_id: facultyId,
        subject_id: subjectId,
        class_id: classId,
        semester,
        academic_year: academicYear,
        batch,
        internal_number: internalNumber,
        status: 'submitted',
        total_students: marks.length,
        submitted_at: new Date()
      });
    }

    // 5. Create Exam Cell Notification
    await ExamCellNotification.create({
      submissionId: submission.id,
      createdBy: req.user.id,
      title: 'Marks Batch Submitted',
      message: `Faculty has submitted assessment marks for Subject ${subjectId}, Class ${classId}, IA #${internalNumber}`,
      type: 'marks_submitted',
      targetRole: ['exam-cell-admin']
    });

    res.status(200).json({
      success: true,
      message: 'Marks submitted to Exam Cell for review',
      data: submission
    });
  } catch (error) {
    return next(new ErrorResponse(`Error submitting marks: ${error.message}`, 500));
  }
});

// @desc   List all submissions by current faculty
// @route  GET /api/v1/faculty/academics/assessment/submissions
// @access Private/Faculty
export const getFacultySubmissions = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id;
  if (!facultyId) {
    return next(new ErrorResponse('Faculty ID not found', 400));
  }

  try {
    const submissions = await ExamCellSubmission.findAll({
      where: { faculty_id: facultyId },
      include: [
        { model: Subject, as: 'subject', attributes: ['subject_name', 'subject_code'] },
        { model: Class, as: 'class', attributes: ['name', 'section', 'semester'] }
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
