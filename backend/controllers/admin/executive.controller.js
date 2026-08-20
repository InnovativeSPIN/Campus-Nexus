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
        totalPrograms: 28,
        placementRate: 87.6,
        researchFunding: 1.25
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
    const { Leave, Faculty, Department } = models;
    let pendingLeaves = [];

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

    res.status(200).json({
      success: true,
      data: {
        leaveApplications: pendingLeaves
      }
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
    res.status(200).json({
      success: true,
      data: {
        academicDataBySemester: null,
        strengthDataByProgram: null,
        placementDataByBatch: null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get recent activities
// @route   GET /api/v1/executive/activities
// @access  Private
export const getExecutiveActivities = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        recentActivities: []
      }
    });
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
      leave.remarks = remarks || `Executive ${action}d`;
      await leave.save();
      return res.status(200).json({ success: true, message: `Leave ${action}d successfully` });
    }

    res.status(200).json({ success: true, message: `Request ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
