import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';

const {
  Leave,
  Faculty,
  FacultySubstitutes,
  LeaveNotification,
  TimetableMaster,
  FacultySubjectAssignment,
  Subject,
  TimetableMasterSlots,
} = models;

/**
 * @desc    Substitute faculty accepts an alteration request
 * @route   PATCH /api/v1/faculty/alteration/:leaveId/accept
 * @access  Private (Faculty - Substitute)
 */
export const acceptAlteration = asyncHandler(async (req, res, next) => {
  const { leaveId } = req.params;
  const facultyId = req.user.faculty_id;
  const departmentId = req.user.department_id;

  try {
    const leave = await Leave.findByPk(leaveId);

    if (!leave) {
      return next(new ErrorResponse('Leave request not found', 404));
    }

    // Verify the substitute faculty is accepting their own request
    if (leave.substitute_faculty_id !== facultyId) {
      return next(new ErrorResponse('Not authorized to accept this request', 403));
    }

    // Verify request is pending
    if (leave.overall_status !== 'substitute_pending' || leave.substitute_approval_status !== 'pending') {
      return next(new ErrorResponse('This request is no longer pending', 400));
    }

    // STEP 1: Update Leave and FacultySubstitutes
    leave.overall_status = 'substitute_approved';
    leave.substitute_approval_status = 'approved';
    leave.substitute_approval_date = new Date();
    await leave.save();

    // Update FacultySubstitutes
    await FacultySubstitutes.update(
      {
        status: 'approved',
        approved_by: facultyId,
        approval_date: new Date(),
      },
      {
        where: {
          leave_id: leaveId,
          substitute_faculty_id: facultyId,
        },
      }
    );

    // STEP 2: Get the class and timetable incharge
    const timetableMaster = await TimetableMaster.findOne({
      where: {
        status: 'active',
      },
      attributes: ['id', 'timetable_incharge_id', 'class_id'],
    });

    if (!timetableMaster || !timetableMaster.timetable_incharge_id) {
      console.warn('[acceptAlteration] No active timetable incharge found');
      // Continue anyway, admin will handle
    } else {
      // STEP 3: Notify Timetable Incharge
      const substituteFaculty = await Faculty.findByPk(facultyId, {
        attributes: ['Name'],
      });

      const applicantFaculty = await Faculty.findByPk(leave.applicantId, {
        attributes: ['Name'],
      });

      const startStr = new Date(leave.startDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const endStr = new Date(leave.endDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      await LeaveNotification.create({
        recipientId: timetableMaster.timetable_incharge_id,
        recipientType: 'faculty',
        departmentId,
        senderId: facultyId,
        senderName: substituteFaculty.Name,
        leaveId: leaveId,
        facultyName: substituteFaculty.Name,
        type: 'alteration_accepted',
        title: `Timetable Alteration Ready to Apply`,
        message: `${substituteFaculty.Name} has accepted the alteration request from ${applicantFaculty.Name} (${leave.leaveType} leave, ${startStr} to ${endStr}). Please review and apply the alteration to the timetable.`,
        isRead: false,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alteration request accepted. Timetable incharge has been notified.',
      data: {
        leaveId: leave.id,
        status: leave.overall_status,
      },
    });
  } catch (error) {
    console.error('[acceptAlteration] Error:', error.message);
    return next(new ErrorResponse(`Error accepting request: ${error.message}`, 500));
  }
});

/**
 * @desc    Substitute faculty rejects an alteration request
 * @route   PATCH /api/v1/faculty/alteration/:leaveId/reject
 * @access  Private (Faculty - Substitute)
 */
export const rejectAlteration = asyncHandler(async (req, res, next) => {
  const { leaveId } = req.params;
  const { rejection_reason } = req.body;
  const facultyId = req.user.faculty_id;
  const departmentId = req.user.department_id;

  try {
    const leave = await Leave.findByPk(leaveId);

    if (!leave) {
      return next(new ErrorResponse('Leave request not found', 404));
    }

    // Verify the substitute faculty is rejecting their own request
    if (leave.substitute_faculty_id !== facultyId) {
      return next(new ErrorResponse('Not authorized to reject this request', 403));
    }

    // Verify request is pending
    if (leave.overall_status !== 'substitute_pending' || leave.substitute_approval_status !== 'pending') {
      return next(new ErrorResponse('This request is no longer pending', 400));
    }

    // STEP 1: Update Leave and FacultySubstitutes
    leave.overall_status = 'substitute_rejected';
    leave.substitute_approval_status = 'rejected';
    leave.substitute_approval_date = new Date();
    leave.substitute_rejection_reason = rejection_reason || null;
    await leave.save();

    // Update FacultySubstitutes
    await FacultySubstitutes.update(
      {
        status: 'rejected',
        approval_date: new Date(),
      },
      {
        where: {
          leave_id: leaveId,
          substitute_faculty_id: facultyId,
        },
      }
    );

    // STEP 2: Notify Original Faculty
    const substituteFaculty = await Faculty.findByPk(facultyId, {
      attributes: ['Name'],
    });

    const applicantFaculty = await Faculty.findByPk(leave.applicantId, {
      attributes: ['Name'],
    });

    const reasonText = rejection_reason ? ` Reason: ${rejection_reason}` : '';

    await LeaveNotification.create({
      recipientId: leave.applicantId,
      recipientType: 'faculty',
      departmentId,
      senderId: facultyId,
      senderName: substituteFaculty.Name,
      leaveId: leaveId,
      facultyName: applicantFaculty.Name,
      type: 'alteration_rejected',
      title: `Alteration Request Rejected`,
      message: `${substituteFaculty.Name} has rejected your alteration request.${reasonText} Please select another faculty to substitute.`,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: 'Alteration request rejected. Original faculty has been notified.',
      data: {
        leaveId: leave.id,
        status: leave.overall_status,
      },
    });
  } catch (error) {
    console.error('[rejectAlteration] Error:', error.message);
    return next(new ErrorResponse(`Error rejecting request: ${error.message}`, 500));
  }
});

/**
 * @desc    Check if a faculty can be contacted as substitute
 * @route   GET /api/v1/faculty/alteration/check-faculty/:facultyId
 * @access  Private (Faculty)
 */
export const checkFacultyAvailability = asyncHandler(async (req, res, next) => {
  const { facultyId: targetFacultyId } = req.params;

  try {
    const faculty = await Faculty.findByPk(targetFacultyId, {
      attributes: ['faculty_id', 'Name', 'email', 'status', 'department_id'],
    });

    if (!faculty) {
      return next(new ErrorResponse('Faculty not found', 404));
    }

    // Check if faculty is active
    const isAvailable = faculty.status === 'active';

    res.status(200).json({
      success: true,
      available: isAvailable,
      data: {
        faculty_id: faculty.faculty_id,
        name: faculty.Name,
        email: faculty.email,
        status: faculty.status,
      },
    });
  } catch (error) {
    console.error('[checkFacultyAvailability] Error:', error.message);
    return next(new ErrorResponse(`Error checking faculty: ${error.message}`, 500));
  }
});

/**
 * @desc    Get list of colleagues in the same department for substitute selection
 * @route   GET /api/v1/faculty/alteration/department-colleagues
 * @access  Private (Faculty)
 */
export const getDepartmentColleagues = asyncHandler(async (req, res, next) => {
  const departmentId = req.user.department_id;
  const facultyId = req.user.faculty_id;

  try {
    const colleagues = await Faculty.findAll({
      where: {
        department_id: departmentId,
        faculty_id: { [Op.ne]: facultyId }, // Exclude self
        status: 'active',
        role_id: 5, // Faculty role
      },
      attributes: ['faculty_id', 'Name', 'email', 'phone_number'],
      order: [['Name', 'ASC']],
    });

    res.status(200).json({
      success: true,
      count: colleagues.length,
      data: colleagues,
    });
  } catch (error) {
    console.error('[getDepartmentColleagues] Error:', error.message);
    return next(new ErrorResponse(`Error fetching colleagues: ${error.message}`, 500));
  }
});

/**
 * @desc    Get substitute faculty who teach same classes as current faculty
 * @route   GET /api/v1/faculty/leave-management/class-teachers
 * @access  Private (Faculty)
 */
export const getSubstitutesByClasses = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id;
  const academicYear = req.query.academic_year; // optional

  try {
    // Step 1: Get all subject IDs taught by current faculty (from FacultySubjectAssignment)
    let subjectIds = [];

    const assignmentWhere = {
      faculty_id: facultyId,
      status: 'active',
    };
    if (academicYear) {
      assignmentWhere.academic_year = academicYear;
    }

    const myAssignments = await FacultySubjectAssignment.findAll({
      where: assignmentWhere,
      attributes: ['subject_id'],
      raw: true,
    });

    if (myAssignments.length > 0) {
      subjectIds = [...new Set(myAssignments.map(a => a.subject_id).filter(Boolean))];
    }

    console.log('[getSubstitutesByClasses] facultyId:', facultyId, 'academicYear:', academicYear, 'initial subjectIds:', subjectIds);

    // Step 2: If no assignment records, try to get subjects from active timetable (TimetableMasterSlots)
    if (subjectIds.length === 0) {
      const masterWhere = {
        status: 'active',
      };
      if (academicYear) {
        masterWhere.academic_year = academicYear;
      }

      const slotAssignments = await TimetableMasterSlots.findAll({
        where: {
          faculty_id: facultyId,
        },
        include: [
          {
            model: TimetableMaster,
            as: 'master',
            where: masterWhere,
            required: true,
            attributes: [],
          },
        ],
        attributes: ['subject_id'],
        raw: true,
      });

      if (slotAssignments.length > 0) {
        subjectIds = [...new Set(slotAssignments.map(a => a.subject_id).filter(Boolean))];
      }
    }

    // Step 3: If still no subjects, return empty result
    if (subjectIds.length === 0) {
      console.log('[getSubstitutesByClasses] No subjects found for faculty', facultyId);
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    console.log('[getSubstitutesByClasses] Found subject IDs:', subjectIds, 'for faculty', facultyId);

    // Step 4: Find other faculty who teach these subjects (from FacultySubjectAssignment first)
    const colleagueWhere = {
      subject_id: { [Op.in]: subjectIds },
      status: 'active',
      faculty_id: { [Op.ne]: facultyId },
    };
    if (academicYear) {
      colleagueWhere.academic_year = academicYear;
    }

    let colleagues = await FacultySubjectAssignment.findAll({
      where: colleagueWhere,
      include: [
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['faculty_id', 'Name', 'email', 'phone_number', 'designation'],
          required: true,
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'subject_name', 'subject_code'],
          required: false,
        },
      ],
      raw: false,
      subQuery: false,
    });

    // Step 5: If no colleagues from assignments, get them from timetable slots
    if (colleagues.length === 0) {
      console.log('[getSubstitutesByClasses] No colleagues from FacultySubjectAssignment, checking TimetableMasterSlots');
      
      const slotColleagues = await TimetableMasterSlots.findAll({
        where: {
          faculty_id: { [Op.ne]: facultyId },
          subject_id: { [Op.in]: subjectIds },
        },
        include: [
          {
            model: TimetableMaster,
            as: 'master',
            where: {
              status: 'active',
              ...(academicYear ? { academic_year: academicYear } : {}),
            },
            required: true,
            attributes: ['class_id'],
          },
          {
            model: Faculty,
            as: 'faculty',
            attributes: ['faculty_id', 'Name', 'email', 'phone_number', 'designation'],
            required: true,
          },
          {
            model: Subject,
            as: 'subject',
            attributes: ['id', 'subject_name', 'subject_code'],
            required: false,
          },
        ],
        raw: false,
        subQuery: false,
      });

      colleagues = slotColleagues;
    }

    // Step 6: De-duplicate by faculty_id and aggregate subject/count data
    const uniqueFaculty = {};
    const facultySubjects = {};

    colleagues.forEach(assignment => {
      let fId, name, email, phone, designation, subject;

      // Handle both FacultySubjectAssignment and TimetableMasterSlots structures
      if (assignment.faculty) {
        fId = assignment.faculty.faculty_id;
        name = assignment.faculty.Name;
        email = assignment.faculty.email;
        phone = assignment.faculty.phone_number;
        designation = assignment.faculty.designation;
      }

      if (fId && !uniqueFaculty[fId]) {
        uniqueFaculty[fId] = {
          faculty_id: fId,
          Name: name,
          email: email,
          phone_number: phone,
          designation: designation,
        };
        facultySubjects[fId] = [];
      }

      if (assignment.subject && fId) {
        const subjectData = {
          subject_id: assignment.subject.id,
          subject_name: assignment.subject.subject_name,
          subject_code: assignment.subject.subject_code,
        };
        // Avoid duplicates in subject list
        if (!facultySubjects[fId].find(s => s.subject_id === subjectData.subject_id)) {
          facultySubjects[fId].push(subjectData);
        }
      }
    });

    // Step 7: Combine faculty with their subjects
    const result = Object.values(uniqueFaculty).map(faculty => ({
      ...faculty,
      matching_subjects: facultySubjects[faculty.faculty_id]?.length || 0,
      subjects: facultySubjects[faculty.faculty_id] || [],
    }));

    console.log('[getSubstitutesByClasses] Found', result.length, 'substitute faculty');

    const responsePayload = {
      success: true,
      count: result.length,
      data: result,
    };

    if (req.query.debug === 'true') {
      responsePayload.debug = {
        subjectIds,
        academicYear,
        colleagueCount: result.length,
      };
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('[getSubstitutesByClasses] Error:', error.message);
    return next(new ErrorResponse(`Error fetching substitute faculty: ${error.message}`, 500));
  }
});
