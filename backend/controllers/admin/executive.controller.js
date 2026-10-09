import { models } from '../../models/index.js';

// @desc    Get executive dashboard statistics
// @route   GET /api/v1/executive/stats
// @access  Private (Executive Admin / Principal)
export const getExecutiveStats = async (req, res) => {
  try {
    const { Student, Faculty, Department } = models;

    const [totalStudents, totalFaculty, totalDepartments] = await Promise.all([
      Student ? Student.count() : Promise.resolve(0),
      Faculty ? Faculty.count() : Promise.resolve(0),
      Department ? Department.count() : Promise.resolve(0)
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalFaculty,
        totalDepartments,
        totalPrograms: null,
        placementRate: null,
        researchFunding: null
      }
    });
  } catch (error) {
    console.error('[EXECUTIVE STATS ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch executive stats',
      error: error.message
    });
  }
};

// @desc    Get pending approvals for executive
// @route   GET /api/v1/executive/pending-approvals
// @access  Private
export const getPendingApprovals = async (req, res) => {
  try {
    const { Leave, Faculty, Department, StudentEvent } = models;
    let pendingLeaves = [];
    let pendingStudentRequests = [];

    if (Leave) {
      pendingLeaves = await Leave.findAll({
        where: { status: 'pending' },
        include: [
          ...(Faculty ? [{ model: Faculty, as: 'applicant', attributes: ['faculty_id', 'Name', 'email'] }] : []),
          ...(Department ? [{ model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] }] : [])
        ],
        limit: 10
      });
    }

    if (StudentEvent) {
      pendingStudentRequests = await StudentEvent.findAll({
        where: { approvalStatus: 'pending' },
        limit: 10,
        order: [['createdAt', 'DESC']]
      });
    }
    res.status(200).json({
      success: true,
      data: { leaveApplications: pendingLeaves, studentRequests: pendingStudentRequests, facultyRequests: [], budgetApprovals: [], eventApprovals: [] }
    });
  } catch (error) {
    console.error('[EXECUTIVE APPROVALS ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending approvals',
      error: error.message
    });
  }
};

// @desc    Get charts data
// @route   GET /api/v1/executive/charts
// @access  Private
export const getExecutiveCharts = async (req, res) => {
  try {
    const { Student, StudentMarks, StudentAttendance, Department } = models;
    const [students, marks, attendance] = await Promise.all([
      Student.findAll({ attributes: ['id', 'year'], include: [{ model: Department, as: 'department', attributes: ['short_name', 'full_name'] }] }),
      StudentMarks.findAll({ attributes: ['studentId', 'semester', 'status'] }),
      StudentAttendance.findAll({ attributes: ['student_id', 'semester', 'status'] })
    ]);
    const studentById = new Map(students.map((student) => [student.id, student]));
    const groups = new Map();
    const getGroup = (department, semester, year) => {
      const key = `${department}|${semester}|${year}`;
      if (!groups.has(key)) groups.set(key, { dept: department, semester, year, resultValues: [], attendanceValues: [] });
      return groups.get(key);
    };
    for (const mark of marks) {
      const student = studentById.get(mark.studentId);
      const department = student?.department?.short_name || student?.department?.full_name;
      if (!student || !department || !mark.semester) continue;
      const group = getGroup(department, mark.semester, student.year || '');
      if (['pass', 'fail'].includes(mark.status)) group.resultValues.push(mark.status === 'pass' ? 100 : 0);
    }
    for (const record of attendance) {
      const student = studentById.get(record.student_id);
      const department = student?.department?.short_name || student?.department?.full_name;
      if (!student || !department || !record.semester) continue;
      const group = getGroup(department, record.semester, student.year || '');
      group.attendanceValues.push(['present', 'late', 'od', 'medical_leave', 'duty_leave'].includes(String(record.status).toLowerCase()) ? 100 : 0);
    }
    const academicDataBySemester = {};
    for (const group of groups.values()) {
      const suffix = group.semester === 1 ? 'st' : group.semester === 2 ? 'nd' : group.semester === 3 ? 'rd' : 'th';
      const row = { dept: group.dept, year: group.year, semester: `${group.semester}${suffix} Semester` };
      if (group.resultValues.length) row.result = Math.round(group.resultValues.reduce((a, b) => a + b, 0) / group.resultValues.length);
      if (group.attendanceValues.length) row.attendance = Math.round(group.attendanceValues.reduce((a, b) => a + b, 0) / group.attendanceValues.length);
      const key = group.year || 'Unclassified';
      if (!academicDataBySemester[key]) academicDataBySemester[key] = [];
      academicDataBySemester[key].push(row);
    }
    res.status(200).json({ success: true, data: { academicDataBySemester, strengthDataByProgram: null, placementDataByBatch: null } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// @desc    Get recent activities
// @route   GET /api/v1/executive/activities
// @access  Private
export const getExecutiveActivities = async (req, res) => {
  try {
    const { Announcement } = models;
    const announcements = Announcement ? await Announcement.findAll({ attributes: ['id', 'title', 'type', 'createdAt'], order: [['createdAt', 'DESC']], limit: 5 }) : [];
    res.status(200).json({ success: true, data: { recentActivities: announcements.map((announcement) => ({ text: announcement.title, time: announcement.createdAt, type: announcement.type })) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// @desc    Approve/Reject pending request
// @route   PUT /api/v1/executive/approve/:type/:id
// @access  Private
export const processApproval = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { action, remarks } = req.body;
    const { Leave } = models;

    if (type === 'leave' && Leave) {
      const leave = await Leave.findByPk(id);
      if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
      leave.status = action === 'approve' ? 'approved' : 'rejected';
      leave.approvedById = req.user.id;
      leave.approvalDate = new Date();
      leave.approvalRemarks = remarks || 'Executive approval decision';
      await leave.save();
      return res.status(200).json({ success: true, message: `Leave ${action}d successfully` });
    }

    res.status(200).json({ success: true, message: `Request ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get faculty attendance statistics by department and staff type
// @route   GET /api/v1/executive/faculty-attendance
// @access  Private (Executive Admin / Secretary / Principal)
export const getExecutiveFacultyAttendance = async (req, res) => {
  try {
    const { Faculty, Department, Attendance, FacultyAttendance, Leave } = models;
    const AttendanceModel = FacultyAttendance || Attendance;

    const [departments, facultyList, attendanceEntries, approvedLeaves] = await Promise.all([
      Department ? Department.findAll({ order: [['id', 'ASC']] }) : Promise.resolve([]),
      Faculty ? Faculty.findAll({ attributes: ['faculty_id', 'Name', 'department_id', 'role_id', 'designation', 'status'] }) : Promise.resolve([]),
      AttendanceModel ? AttendanceModel.findAll() : Promise.resolve([]),
      Leave ? Leave.findAll({ where: { status: 'approved' } }) : Promise.resolve([])
    ]);

    const isTeaching = (designation, roleId) => {
      const value = String(designation || '').toLowerCase().trim();
      if (roleId === 7) return true;
      if (!value) return null;
      if (/non[- ]?teaching|technical assistant|project assistant|lab assistant|technician|clerk|librarian|attender|office assistant/.test(value)) return false;
      if (/professor|lecturer|instructor|teacher|principal|dean|hod|academic/.test(value)) return true;
      return null;
    };

    const getFacultyAttRate = (f) => {
      const records = attendanceEntries.filter(a => a.staff_id === f.faculty_id);
      if (records.length > 0) {
        const present = records.filter(r => ['Present', 'On-Duty', 'OD'].includes(r.attendance_status)).length;
        const half = records.filter(r => ['Late', 'Half-Day'].includes(r.attendance_status)).length;
        return Math.round(((present + half * 0.5) / records.length) * 100);
      }
      const fLeaves = approvedLeaves.filter(l => l.applicantId === f.faculty_id);
      if (f.status === 'on_leave' || fLeaves.length > 0) return null;
      return null;
    };

    const deptResults = departments.map((d) => {
      const deptFaculty = facultyList.filter(f => f.department_id === d.id);
      const teaching = deptFaculty.filter(f => isTeaching(f.designation, f.role_id) !== false);
      const nonTeaching = deptFaculty.filter(f => isTeaching(f.designation, f.role_id) === false);

      const teachingRates = teaching.map(getFacultyAttRate).filter((rate) => rate !== null);
      const nonTeachingRates = nonTeaching.map(getFacultyAttRate).filter((rate) => rate !== null);
      const allRates = deptFaculty.map(getFacultyAttRate).filter((rate) => rate !== null);

      const avgTeaching = teachingRates.length ? Math.round(teachingRates.reduce((a,b)=>a+b, 0) / teachingRates.length) : null;
      const avgNonTeaching = nonTeachingRates.length ? Math.round(nonTeachingRates.reduce((a,b)=>a+b, 0) / nonTeachingRates.length) : null;
      const avgOverall = allRates.length ? Math.round(allRates.reduce((a,b)=>a+b, 0) / allRates.length) : null;

      return {
        id: d.id,
        name: d.short_name || d.full_name,
        fullName: d.full_name || d.short_name,
        attendance: avgOverall,
        teachingAttendance: avgTeaching,
        nonTeachingAttendance: avgNonTeaching,
        totalStaff: deptFaculty.length,
        teachingStaff: teaching.length,
        nonTeachingStaff: nonTeaching.length
      };
    });

    const allFacultyRates = facultyList.map(getFacultyAttRate).filter((rate) => rate !== null);
    const overallTeaching = facultyList.filter(f => isTeaching(f.designation, f.role_id) !== false).map(getFacultyAttRate).filter((rate) => rate !== null);
    const overallNonTeaching = facultyList.filter(f => isTeaching(f.designation, f.role_id) === false).map(getFacultyAttRate).filter((rate) => rate !== null);

    res.status(200).json({
      success: true,
      data: {
        departments: deptResults,
        overall: {
          attendance: allFacultyRates.length ? Math.round(allFacultyRates.reduce((a,b)=>a+b,0)/allFacultyRates.length) : null,
          teachingAttendance: overallTeaching.length ? Math.round(overallTeaching.reduce((a,b)=>a+b,0)/overallTeaching.length) : null,
          nonTeachingAttendance: overallNonTeaching.length ? Math.round(overallNonTeaching.reduce((a,b)=>a+b,0)/overallNonTeaching.length) : null,
          totalStaff: facultyList.length,
          teachingStaff: overallTeaching.length,
          nonTeachingStaff: overallNonTeaching.length
        }
      }
    });
  } catch (error) {
    console.error('[EXECUTIVE FACULTY ATTENDANCE ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty attendance stats',
      error: error.message
    });
  }
};

