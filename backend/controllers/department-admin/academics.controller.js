import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import fs from 'fs';

const {
  CourseFile,
  CourseFileNotification,
  CourseLessonPlanNotification,
  Faculty,
  Subject,
  Class: ClassModel,
  Department,
  FacultySubjectAssignment,
  CourseLessonPlan
} = models;

/**
 * @desc    Get pending course file approvals for department admin
 * @route   GET /api/v1/department-admin/academics/approvals
 * @access  Private (Department Admin)
 * Query: ?status=submitted&sort=-submission_date
 */
export const getPendingCourseFileApprovals = asyncHandler(async (req, res, next) => {
  const departmentId = req.user.department_id;
  const { status = 'submitted', sortBy = '-submission_date' } = req.query;

  if (!departmentId) {
    return next(new ErrorResponse('Department information not found', 400));
  }

  try {
    const where = {
      department_id: departmentId,
      ...(status && { status })
    };

    let order = [['submission_date', 'DESC']];
    if (sortBy === '-submission_date') order = [['submission_date', 'DESC']];
    if (sortBy === 'submission_date') order = [['submission_date', 'ASC']];
    if (sortBy === '-status') order = [['status', 'DESC']];

    const approvals = await CourseFile.findAll({
      where,
      include: [
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['faculty_id', 'faculty_college_code', 'Name', 'email']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'subject_name', 'subject_code', 'semester']
        },
        {
          model: ClassModel,
          as: 'class',
          attributes: ['id', 'name', 'section', 'batch']
        },
        {
          model: Faculty,
          as: 'approver',
          attributes: ['faculty_id', 'faculty_college_code', 'Name']
        }
      ],
      order,
      raw: false
    });

    // Enhance response with additional metadata
    const enrichedApprovals = approvals.map(approval => {
      const data = approval.toJSON();
      return {
        ...data,
        file_size_mb: (data.file_size / (1024 * 1024)).toFixed(2),
        submission_humanized: new Date(data.submission_date).toLocaleDateString(),
        approval_humanized: data.approved_date ? new Date(data.approved_date).toLocaleDateString() : null,
        pending_days: data.submission_date ? Math.floor((new Date() - new Date(data.submission_date)) / (1000 * 60 * 60 * 24)) : null
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedApprovals.length,
      data: enrichedApprovals
    });
  } catch (error) {
    console.error('[getPendingCourseFileApprovals] Error:', error);
    return next(new ErrorResponse(`Error fetching approvals: ${error.message}`, 500));
  }
});

/**
 * @desc    Get single course file approval details
 * @route   GET /api/v1/department-admin/academics/approvals/:id
 * @access  Private (Department Admin)
 */
export const getCourseFileApprovalDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const departmentId = req.user.department_id;
  const adminId = req.user.faculty_id || req.user.id;

  try {
    const approval = await CourseFile.findByPk(id, {
      include: [
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['faculty_id', 'faculty_college_code', 'Name', 'email', 'phone_no']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'subject_name', 'subject_code', 'semester', 'credits']
        },
        {
          model: ClassModel,
          as: 'class',
          attributes: ['id', 'name', 'section', 'batch', 'capacity']
        },
        {
          model: Faculty,
          as: 'approver',
          attributes: ['faculty_id', 'faculty_college_code', 'Name']
        },
        {
          model: CourseFileNotification,
          as: 'notifications',
          attributes: ['id', 'notification_type', 'title', 'is_read', 'created_at'],
          where: { recipient_id: adminId },
          required: false
        }
      ]
    });

    if (!approval) {
      return next(new ErrorResponse('Approval request not found', 404));
    }

    if (approval.department_id !== departmentId) {
      return next(new ErrorResponse('Not authorized to view this approval', 403));
    }

    const data = approval.toJSON();
    data.file_size_mb = (data.file_size / (1024 * 1024)).toFixed(2);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[getCourseFileApprovalDetails] Error:', error);
    return next(new ErrorResponse(`Error fetching approval details: ${error.message}`, 500));
  }
});

/**
 * @desc    Approve course file
 * @route   POST /api/v1/department-admin/academics/approvals/:id/approve
 * @access  Private (Department Admin)
 * Body: { remarks }
 */
export const approveCourseFile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const departmentId = req.user.department_id;
  const adminId = req.user.faculty_id || req.user.id;

  try {
    const courseFile = await CourseFile.findByPk(id);

    if (!courseFile) {
      return next(new ErrorResponse('Course file not found', 404));
    }

    if (courseFile.department_id !== departmentId) {
      return next(new ErrorResponse('Not authorized to approve this file', 403));
    }

    if (courseFile.status !== 'submitted' && courseFile.status !== 'revision_requested') {
      return next(new ErrorResponse(`Cannot approve file with status: ${courseFile.status}`, 400));
    }

    // Update course file
    await courseFile.update({
      status: 'approved',
      approval_remarks: remarks || null,
      approved_by: adminId,
      approved_date: new Date(),
      is_active: true
    });

    console.log('[approveCourseFile] Course file approved:', {
      id,
      approved_by: adminId,
      department_id: departmentId
    });

    // Create notification for faculty
    await CourseFileNotification.create({
      course_file_id: id,
      recipient_type: 'faculty',
      recipient_id: courseFile.faculty_id,
      notification_type: 'approved',
      title: `Your Course File Has Been Approved`,
      message: `Your course file submission for subject has been reviewed and approved by the department.${remarks ? ` Remarks: ${remarks}` : ''}`,
      action_url: `/faculty/academics/course-files/${id}`
    });

    // Populate for response
    const updatedFile = await CourseFile.findByPk(id, {
      include: [
        { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'faculty_college_code', 'Name'] },
        { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
        { model: ClassModel, as: 'class', attributes: ['id', 'name'] },
        { model: Faculty, as: 'approver', attributes: ['faculty_id', 'faculty_college_code', 'Name'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Course file approved successfully',
      data: updatedFile
    });
  } catch (error) {
    console.error('[approveCourseFile] Error:', error);
    return next(new ErrorResponse(`Error approving course file: ${error.message}`, 500));
  }
});

/**
 * @desc    Reject course file
 * @route   POST /api/v1/department-admin/academics/approvals/:id/reject
 * @access  Private (Department Admin)
 * Body: { remarks (required) }
 */
export const rejectCourseFile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const departmentId = req.user.department_id;
  const adminId = req.user.faculty_id || req.user.id;

  if (!remarks || remarks.trim().length === 0) {
    return next(new ErrorResponse('Rejection remarks are required', 400));
  }

  try {
    const courseFile = await CourseFile.findByPk(id);

    if (!courseFile) {
      return next(new ErrorResponse('Course file not found', 404));
    }

    if (courseFile.department_id !== departmentId) {
      return next(new ErrorResponse('Not authorized to reject this file', 403));
    }

    if (courseFile.status !== 'submitted' && courseFile.status !== 'revision_requested') {
      return next(new ErrorResponse(`Cannot reject file with status: ${courseFile.status}`, 400));
    }

    // Update course file
    await courseFile.update({
      status: 'rejected',
      approval_remarks: remarks,
      approved_by: adminId,
      approved_date: new Date(),
      is_active: false
    });

    console.log('[rejectCourseFile] Course file rejected:', {
      id,
      rejected_by: adminId,
      remarks
    });

    // Create notification for faculty
    await CourseFileNotification.create({
      course_file_id: id,
      recipient_type: 'faculty',
      recipient_id: courseFile.faculty_id,
      notification_type: 'rejected',
      title: `Your Course File Was Not Approved`,
      message: `Your course file submission requires revision. Remarks: ${remarks}`,
      action_url: `/faculty/academics/course-files/${id}`
    });

    // Populate for response
    const updatedFile = await CourseFile.findByPk(id, {
      include: [
        { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'faculty_college_code', 'Name'] },
        { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
        { model: ClassModel, as: 'class', attributes: ['id', 'name'] },
        { model: Faculty, as: 'approver', attributes: ['faculty_id', 'faculty_college_code', 'Name'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Course file rejected',
      data: updatedFile
    });
  } catch (error) {
    console.error('[rejectCourseFile] Error:', error);
    return next(new ErrorResponse(`Error rejecting course file: ${error.message}`, 500));
  }
});

/**
 * @desc    Request revision on course file
 * @route   POST /api/v1/department-admin/academics/approvals/:id/revision
 * @access  Private (Department Admin)
 * Body: { remarks (required) }
 */
export const requestCourseFileRevision = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const departmentId = req.user.department_id;
  const adminId = req.user.faculty_id || req.user.id;

  if (!remarks || remarks.trim().length === 0) {
    return next(new ErrorResponse('Revision request remarks are required', 400));
  }

  try {
    const courseFile = await CourseFile.findByPk(id);

    if (!courseFile) {
      return next(new ErrorResponse('Course file not found', 404));
    }

    if (courseFile.department_id !== departmentId) {
      return next(new ErrorResponse('Not authorized to request revision on this file', 403));
    }

    if (courseFile.status !== 'submitted') {
      return next(new ErrorResponse(`Cannot request revision for file with status: ${courseFile.status}`, 400));
    }

    // Update course file
    await courseFile.update({
      status: 'revision_requested',
      approval_remarks: remarks,
      is_active: false
    });

    console.log('[requestCourseFileRevision] Revision requested:', {
      id,
      requested_by: adminId,
      remarks
    });

    // Create notification for faculty
    await CourseFileNotification.create({
      course_file_id: id,
      recipient_type: 'faculty',
      recipient_id: courseFile.faculty_id,
      notification_type: 'revision_requested',
      title: `Revision Requested For Your Course File`,
      message: `Please review and upload the updated course file. Revision notes: ${remarks}`,
      action_url: `/faculty/academics/course-files/${id}`
    });

    // Populate for response
    const updatedFile = await CourseFile.findByPk(id, {
      include: [
        { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'faculty_college_code', 'Name'] },
        { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
        { model: ClassModel, as: 'class', attributes: ['id', 'name'] },
        { model: Faculty, as: 'approver', attributes: ['faculty_id', 'faculty_college_code', 'Name'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Revision requested successfully',
      data: updatedFile
    });
  } catch (error) {
    console.error('[requestCourseFileRevision] Error:', error);
    return next(new ErrorResponse(`Error requesting revision: ${error.message}`, 500));
  }
});

/**
 * @desc    Get approval statistics for department
 * @route   GET /api/v1/department-admin/academics/approvals/stats
 * @access  Private (Department Admin)
 */
export const getApprovalStatistics = asyncHandler(async (req, res, next) => {
  const departmentId = req.user.department_id;

  try {
    const stats = await CourseFile.findAll({
      attributes: ['status'],
      where: { department_id: departmentId },
      raw: true
    });

    const grouped = {
      submitted: 0,
      approved: 0,
      rejected: 0,
      revision_requested: 0,
      draft: 0
    };

    stats.forEach(file => {
      if (grouped.hasOwnProperty(file.status)) {
        grouped[file.status]++;
      }
    });

    grouped.total = stats.length;
    grouped.pending = grouped.submitted + grouped.revision_requested;

    res.status(200).json({
      success: true,
      data: grouped
    });
  } catch (error) {
    console.error('[getApprovalStatistics] Error:', error);
    return next(new ErrorResponse(`Error fetching statistics: ${error.message}`, 500));
  }
});

/**
 * @desc    Get pending course lesson plan approvals for department admin
 * @route   GET /api/v1/department-admin/academics/course-plans/pending
 * @access  Private (Department Admin)
 */
export const getPendingCourseLessonPlanApprovals = asyncHandler(async (req, res, next) => {
  const departmentId = req.user.department_id;

  if (!departmentId) {
    return next(new ErrorResponse('Department information not found', 400));
  }

  try {
    // Get all pending plans
    const pendingPlans = await CourseLessonPlan.findAll({
      where: {
        approval_status: 'pending'
      },
      include: [
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['faculty_id', 'faculty_college_code', 'Name', 'email'],
          where: { department_id: departmentId },
          required: true
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'subject_name', 'subject_code']
        },
        {
          model: ClassModel,
          as: 'class',
          attributes: ['id', 'name', 'section']
        }
      ],
      order: [['created_at', 'DESC']],
      raw: false
    });

    // Group by upload_batch_id
    const groupedByBatch = {};
    pendingPlans.forEach(plan => {
      const batchId = plan.upload_batch_id || `legacy_${plan.faculty_id}_${plan.subject_id}_${plan.class_id}`;
      if (!groupedByBatch[batchId]) {
        groupedByBatch[batchId] = {
          batch_id: batchId,
          faculty: plan.faculty,
          subject: plan.subject,
          class: plan.class,
          academic_year: plan.academic_year,
          semester: plan.semester,
          batch_submission_date: plan.batch_submission_date || plan.created_at,
          topics_count: 0,
          topics: []
        };
      }
      groupedByBatch[batchId].topics.push({
        id: plan.id,
        sno: plan.sno,
        unit_number: plan.unit_number,
        unit_label: plan.unit_label,
        topic: plan.topic,
        co_number: plan.co_number,
        btl: plan.btl,
        delivery_mode: plan.delivery_mode,
        reference_book: plan.reference_book,
        periods_required: plan.periods_required,
        tentative_date: plan.tentative_date
      });
      groupedByBatch[batchId].topics_count++;
    });

    const groupedApprovals = Object.values(groupedByBatch);

    res.status(200).json({
      success: true,
      count: groupedApprovals.length,
      total_topics: pendingPlans.length,
      data: groupedApprovals
    });
  } catch (error) {
    console.error('[getPendingCourseLessonPlanApprovals] Error:', error);
    return next(new ErrorResponse(`Error fetching pending plans: ${error.message}`, 500));
  }
});

/**
 * @desc    Approve entire course lesson plan batch
 * @route   POST /api/v1/department-admin/academics/course-plans/batch/:batchId/approve
 * @access  Private (Department Admin)
 */
export const approveCourseLessonPlan = asyncHandler(async (req, res, next) => {
  const { batchId } = req.params;
  const { remarks } = req.body;
  const departmentId = req.user.department_id;
  const adminId = req.user.faculty_id || req.user.id;

  try {
    const { CourseLessonPlan } = models;

    // Find all topics in this batch
    const batchPlans = await CourseLessonPlan.findAll({
      where: {
        upload_batch_id: batchId,
        approval_status: 'pending'
      },
      include: [
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['department_id']
        }
      ]
    });

    if (batchPlans.length === 0) {
      return next(new ErrorResponse('Course lesson plan batch not found or not pending', 404));
    }

    // Check department authorization
    if (batchPlans[0].faculty.department_id !== departmentId) {
      return next(new ErrorResponse('Not authorized to approve this plan', 403));
    }

    // Update all plans in batch
    await Promise.all(
      batchPlans.map(plan =>
        plan.update({
          approval_status: 'approved',
          approved_by: adminId,
          approved_date: new Date(),
          approval_remarks: remarks || null,
          batch_submission_date: new Date()
        })
      )
    );

    console.log('[approveCourseLessonPlan] Batch approved:', { batchId, count: batchPlans.length, approved_by: adminId });

    // Get updated plans with all details
    const updatedPlans = await CourseLessonPlan.findAll({
      where: { upload_batch_id: batchId },
      include: [
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['faculty_id', 'Name', 'faculty_college_code']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'subject_name']
        },
        {
          model: ClassModel,
          as: 'class',
          attributes: ['id', 'name']
        }
      ],
      order: [['sno', 'ASC']]
    });

    res.status(200).json({
      success: true,
      message: `Course lesson plan batch approved (${updatedPlans.length} topics)`,
      count: updatedPlans.length,
      data: updatedPlans
    });
  } catch (error) {
    console.error('[approveCourseLessonPlan] Error:', error);
    return next(new ErrorResponse(`Error approving lesson plan: ${error.message}`, 500));
  }
});

/**
 * @desc    Reject entire course lesson plan batch
 * @route   POST /api/v1/department-admin/academics/course-plans/batch/:batchId/reject
 * @access  Private (Department Admin)
 */
export const rejectCourseLessonPlan = asyncHandler(async (req, res, next) => {
  const { batchId } = req.params;
  const { remarks } = req.body;
  const departmentId = req.user.department_id;
  const adminId = req.user.faculty_id || req.user.id;

  if (!remarks || remarks.trim().length === 0) {
    return next(new ErrorResponse('Rejection remarks are required', 400));
  }

  try {
    const { CourseLessonPlan } = models;

    // Find all topics in this batch
    const batchPlans = await CourseLessonPlan.findAll({
      where: {
        upload_batch_id: batchId,
        approval_status: 'pending'
      },
      include: [
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['department_id']
        }
      ]
    });

    if (batchPlans.length === 0) {
      return next(new ErrorResponse('Course lesson plan batch not found or not pending', 404));
    }

    // Check department authorization
    if (batchPlans[0].faculty.department_id !== departmentId) {
      return next(new ErrorResponse('Not authorized to reject this plan', 403));
    }

    // Update all plans in batch
    await Promise.all(
      batchPlans.map(plan =>
        plan.update({
          approval_status: 'rejected',
          approved_by: adminId,
          approved_date: new Date(),
          approval_remarks: remarks,
          batch_submission_date: new Date()
        })
      )
    );

    console.log('[rejectCourseLessonPlan] Batch rejected:', { batchId, count: batchPlans.length, rejected_by: adminId });

    // Get updated plans with all details
    const updatedPlans = await CourseLessonPlan.findAll({
      where: { upload_batch_id: batchId },
      include: [
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['faculty_id', 'Name', 'faculty_college_code']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'subject_name']
        },
        {
          model: ClassModel,
          as: 'class',
          attributes: ['id', 'name']
        }
      ],
      order: [['sno', 'ASC']]
    });

    res.status(200).json({
      success: true,
      message: `Course lesson plan batch rejected (${updatedPlans.length} topics)`,
      count: updatedPlans.length,
      data: updatedPlans
    });
  } catch (error) {
    console.error('[rejectCourseLessonPlan] Error:', error);
    return next(new ErrorResponse(`Error rejecting lesson plan: ${error.message}`, 500));
  }
});

export const getNotifications = asyncHandler(async (req, res, next) => {
  const adminId = req.user.faculty_id || req.user.id;

  try {
    const courseFileNotifications = await CourseFileNotification.findAll({
      where: { recipient_id: adminId },
      include: [
        {
          model: Faculty,
          as: 'recipient',
          attributes: ['faculty_id', 'faculty_college_code', 'Name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const courseLessonPlanNotifications = await CourseLessonPlanNotification.findAll({
      where: { recipient_id: adminId },
      include: [
        {
          model: Faculty,
          as: 'recipient',
          attributes: ['faculty_id', 'faculty_college_code', 'Name']
        },
        {
          model: Faculty,
          as: 'sender',
          attributes: ['faculty_id', 'faculty_college_code', 'Name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Merge and format
    const formattedFileNotifs = courseFileNotifications.map(n => ({
      id: `file_${n.id}`,
      title: n.title,
      description: 'Course File submission',
      message: n.message,
      source: 'admin',
      type: 'course_file',
      timestamp: n.created_at,
      isRead: n.is_read
    }));

    const formattedPlanNotifs = courseLessonPlanNotifications.map(n => ({
      id: `plan_${n.id}`,
      title: 'Course Plan Approval Request',
      description: `Course Plan submitted by ${n.sender ? n.sender.Name : 'Faculty'}`,
      message: `A course plan has been submitted for approval.`,
      source: 'admin',
      type: 'course_plan',
      timestamp: n.created_at,
      isRead: n.is_read
    }));

    const notifications = [...formattedFileNotifs, ...formattedPlanNotifs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('[getNotifications] Error:', error);
    return next(new ErrorResponse('Error fetching notifications', 500));
  }
});
