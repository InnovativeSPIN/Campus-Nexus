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
  SubjectClassMapping,
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

    // STEP 2: Notify Timetable Incharge
    const timetableMaster = await TimetableMaster.findOne({
      where: {
        department_id: departmentId,
        status: 'active',
      },
      attributes: ['id', 'timetable_incharge_id', 'class_id'],
    });

    const substituteFaculty = await Faculty.findByPk(facultyId, {
      attributes: ['Name'],
    });

    const applicantFaculty = await Faculty.findByPk(leave.applicantId, {
      attributes: ['Name'],
    });

    const startStr = new Date(leave.startDate).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

    const endStr = new Date(leave.endDate).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

    const notificationData = {
      recipientType: 'faculty',
      departmentId,
      senderId: facultyId,
      senderName: substituteFaculty.Name,
      leaveId: leaveId,
      facultyName: substituteFaculty.Name,
      type: 'alteration_accepted',
      title: `Timetable Alteration Ready to Apply`,
      message: `${substituteFaculty.Name} has accepted the alteration request from ${applicantFaculty.Name} (${leave.leaveType} leave, ${startStr} to ${endStr}).`,
      isRead: false,
    };

    // Notify Timetable Incharge
    if (timetableMaster && timetableMaster.timetable_incharge_id) {
      await LeaveNotification.create({
        ...notificationData,
        recipientId: timetableMaster.timetable_incharge_id,
        message: notificationData.message + ' Please review and apply the alteration to the timetable.',
      });
    }

    // STEP 3: Notify Department Admin(s)
    const deptAdmins = await Faculty.findAll({
      where: {
        department_id: departmentId,
        role_id: 7, // Dept Admin
        status: 'active',
      },
      attributes: ['faculty_id'],
    });

    for (const admin of deptAdmins) {
      await LeaveNotification.create({
        ...notificationData,
        recipientId: admin.faculty_id,
        message: notificationData.message + ' The substitute faculty has confirmed their availability.',
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
 * @desc    Get substitute faculty who teach same classes as current faculty or a specific class/subject
 * @route   GET /api/v1/faculty/leave-management/class-teachers
 * @access  Private (Faculty)
 */
export const getSubstitutesByClasses = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.faculty_id;
  const academicYear = req.query.academic_year;
  const semester = req.query.semester ? parseInt(req.query.semester, 10) : null;
  const classId = req.query.class_id ? parseInt(req.query.class_id, 10) : null;
  const subjectId = req.query.subject_id ? parseInt(req.query.subject_id, 10) : null;

  try {
    let targetSubjectIds = [];
    let targetClassIds = [];

    // If explicit class+subject are supplied, validate mapping and use that
    if (classId && subjectId) {
      const mapping = await SubjectClassMapping.findOne({
        where: {
          class_id: classId,
          subject_id: subjectId,
          status: 'active',
          ...(academicYear ? { academic_year: academicYear } : {}),
          ...(semester ? { semester } : {}),
        },
      });

      if (!mapping) {
        // mapping not found does not mean no substitute; still attempt by assignment as fallback
        console.log('[getSubstitutesByClasses] No subject-class mapping found, still searching by assignment for class+subject.');
      }

      targetSubjectIds = [subjectId];
      targetClassIds = [classId];

    } else if (classId) {
      // If classId is provided, use subjects mapped to that class
      const mappings = await SubjectClassMapping.findAll({
        where: {
          class_id: classId,
          status: 'active',
          ...(academicYear ? { academic_year: academicYear } : {}),
        },
        attributes: ['subject_id'],
        raw: true,
      });

      targetSubjectIds = [...new Set(mappings.map((m) => m.subject_id).filter(Boolean))];
      targetClassIds = [classId];

    } else if (subjectId) {
      // If only subjectId is provided, the class context may vary; still use this subject
      targetSubjectIds = [subjectId];

      const mappings = await SubjectClassMapping.findAll({
        where: {
          subject_id: subjectId,
          status: 'active',
          ...(academicYear ? { academic_year: academicYear } : {}),
        },
        attributes: ['class_id'],
        raw: true,
      });
      targetClassIds = [...new Set(mappings.map((m) => m.class_id).filter(Boolean))];
    }

    // If no explicit class/subject input, derive from current faculty assignments
    if (targetSubjectIds.length === 0) {
      const assignmentWhere = {
        faculty_id: facultyId,
        status: 'active',
        ...(academicYear ? { academic_year: academicYear } : {}),
      };

      const myAssignments = await FacultySubjectAssignment.findAll({
        where: assignmentWhere,
        attributes: ['subject_id', 'class_id'],
        raw: true,
      });

      targetSubjectIds = [...new Set(myAssignments.map((a) => a.subject_id).filter(Boolean))];
      targetClassIds = [...new Set(myAssignments.map((a) => a.class_id).filter(Boolean))];

      // fallback using timetable slots if no assignments
      if (targetSubjectIds.length === 0) {
        const slotAssignments = await TimetableMasterSlots.findAll({
          where: {
            faculty_id: facultyId,
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
              attributes: [],
            },
          ],
          attributes: ['subject_id', 'class_id'],
          raw: true,
        });

        targetSubjectIds = [...new Set(slotAssignments.map((a) => a.subject_id).filter(Boolean))];
        targetClassIds = [...new Set(slotAssignments.map((a) => a.class_id).filter(Boolean))];
      }
    }

    if (targetSubjectIds.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    // CORE: strict filter by class+subject (if provided), fallback to derived targets only
    const assignmentFilter = {
      status: 'active',
      faculty_id: { [Op.ne]: facultyId },
    };

    if (classId && subjectId) {
      assignmentFilter.class_id = classId;
      assignmentFilter.subject_id = subjectId;
    } else if (classId) {
      assignmentFilter.class_id = classId;
      if (targetSubjectIds.length > 0) assignmentFilter.subject_id = { [Op.in]: targetSubjectIds };
    } else if (subjectId) {
      assignmentFilter.subject_id = subjectId;
      if (targetClassIds.length > 0) assignmentFilter.class_id = { [Op.in]: targetClassIds };
    } else {
      if (targetClassIds.length > 0) assignmentFilter.class_id = { [Op.in]: targetClassIds };
      if (targetSubjectIds.length > 0) assignmentFilter.subject_id = { [Op.in]: targetSubjectIds };
    }

    // restrict by academic year/semester if given
    if (academicYear) {
      assignmentFilter.academic_year = academicYear;
    }
    if (semester) {
      assignmentFilter.semester = semester;
    }

    console.log('[getSubstitutesByClasses] assignmentFilter', assignmentFilter);

    let colleagues = await FacultySubjectAssignment.findAll({
      where: assignmentFilter,
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

    // If no explicit substitutes exist, do not broaden to full department (strict behavior required)
    if (colleagues.length === 0) {
      console.log('[getSubstitutesByClasses] no assignment match found; returning empty list for class/subject criteria');
    }

    // fallback 2: if still empty and class-specific mapping exists, use class-only (all subjects) to find any assigned faculty for that class
    if (colleagues.length === 0 && classId) {
      const fallbackFilter = {
        class_id: classId,
        status: 'active',
        faculty_id: { [Op.ne]: facultyId },
      };
      if (academicYear) fallbackFilter.academic_year = academicYear;
      if (semester) fallbackFilter.semester = semester;
      colleagues = await FacultySubjectAssignment.findAll({
        where: fallbackFilter,
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
    }

    console.log('[getSubstitutesByClasses] final raw colleagues count before dedup', colleagues.length);

    // If still no substitutes found from matching class/subject, fall back to department are all active faculty except self
    if (colleagues.length === 0) {
      console.log('[getSubstitutesByClasses] no matches; falling back to all department faculty except self');
      const deptColleagues = await Faculty.findAll({
        where: {
          department_id: req.user.department_id,
          faculty_id: { [Op.ne]: facultyId },
          status: 'active',
          role_id: 5,
        },
        attributes: ['faculty_id', 'Name', 'email', 'phone_number', 'designation'],
      });
      colleagues = deptColleagues.map((f) => ({
        faculty: f,
        subject: null,
      }));
    }

    // De-duplicate by faculty_id and aggregate subjects
    const uniqueFaculty = {};
    const facultySubjects = {};
    colleagues.forEach((assignment) => {
      const f = assignment.faculty;
      if (!f) return;

      const facultyIdKey = f.faculty_id;
      if (!uniqueFaculty[facultyIdKey]) {
        uniqueFaculty[facultyIdKey] = {
          faculty_id: f.faculty_id,
          Name: f.Name,
          email: f.email,
          phone_number: f.phone_number,
          designation: f.designation,
        };
        facultySubjects[facultyIdKey] = [];
      }

      if (assignment.subject) {
        const subjectData = {
          subject_id: assignment.subject.id,
          subject_name: assignment.subject.subject_name,
          subject_code: assignment.subject.subject_code,
        };
        if (!facultySubjects[facultyIdKey].find((s) => s.subject_id === subjectData.subject_id)) {
          facultySubjects[facultyIdKey].push(subjectData);
        }
      }
    });

    const result = Object.values(uniqueFaculty).map((faculty) => ({
      ...faculty,
      matching_subjects: facultySubjects[faculty.faculty_id]?.length || 0,
      subjects: facultySubjects[faculty.faculty_id] || [],
    }));

    const responsePayload = {
      success: true,
      count: result.length,
      data: result,
    };

    if (req.query.debug === 'true') {
      responsePayload.debug = {
        classId,
        subjectId,
        academicYear,
        targetSubjectIds,
        targetClassIds,
        colleagueCount: result.length,
      };
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('[getSubstitutesByClasses] Error:', error.message);
    return next(new ErrorResponse(`Error fetching substitute faculty: ${error.message}`, 500));
  }
});
