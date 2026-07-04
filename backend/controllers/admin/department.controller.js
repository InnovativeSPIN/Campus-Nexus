import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
const { Department, User, Faculty, Student } = models;

// @desc      Get all departments
// @route     GET /api/v1/departments
// @access    Private/Admin
export const getDepartments = asyncHandler(async (req, res, next) => {
    // order by short_name since the table doesn't have a "name" column
    const departments = await Department.findAll({
        order: [['short_name', 'ASC']]
    });

    // Fetch counts for each department
    const departmentsWithInfo = await Promise.all(departments.map(async (dept) => {
        const facultyCount = await Faculty.count({ where: { department_id: dept.id } });
        const studentCount = await Student.count({ where: { departmentId: dept.id } });

        return {
            ...dept.toJSON(),
            name: dept.short_name || dept.full_name,
            headOfDepartment: 'Not Assigned',
            hodCount: 0,
            facultyCount: facultyCount,
            studentCount: studentCount
        };
    }));

    res.status(200).json({
        success: true,
        count: departmentsWithInfo.length,
        data: departmentsWithInfo
    });
});

// @desc      Get single department
// @route     GET /api/v1/departments/:id
// @access    Private/Admin
export const getDepartment = asyncHandler(async (req, res, next) => {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
        return next(new ErrorResponse(`Department not found with id of ${req.params.id}`, 404));
    }

    const facultyCount = await Faculty.count({ where: { department_id: department.id } });
    const studentCount = await Student.count({ where: { departmentId: department.id } });

    res.status(200).json({
        success: true,
        data: {
            ...department.toJSON(),
            name: department.short_name || department.full_name,
            headOfDepartment: 'Not Assigned',
            hodCount: 0,
            facultyCount: facultyCount,
            studentCount: studentCount
        }
    });
});

// @desc      Create department
// @route     POST /api/v1/departments
// @access    Private/Admin
export const createDepartment = asyncHandler(async (req, res, next) => {
    const department = await Department.create(req.body);

    res.status(201).json({
        success: true,
        data: department
    });
});

// @desc      Update department
// @route     PUT /api/v1/departments/:id
// @access    Private/Admin
export const updateDepartment = asyncHandler(async (req, res, next) => {
    await Department.update(req.body, { where: { id: req.params.id } });
    const department = await Department.findByPk(req.params.id);

    if (!department) {
        return next(new ErrorResponse(`Department not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: department
    });
});

// @desc      Delete department
// @route     DELETE /api/v1/departments/:id
// @access    Private/Admin
export const deleteDepartment = asyncHandler(async (req, res, next) => {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
        return next(new ErrorResponse(`Department not found with id of ${req.params.id}`, 404));
    }

    await department.destroy();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc      Get department statistics
// @route     GET /api/v1/departments/statistics
// @access    Private/DepartmentAdmin
export const getDepartmentStatistics = asyncHandler(async (req, res, next) => {
    // Get department ID from logged in user
    const departmentId = req.user.department_id || req.user.departmentId || (req.user.department && req.user.department.id);

    if (!departmentId) {
        return res.status(200).json({
            success: true,
            data: {
                totalStudents: 0,
                totalFaculty: 0,
                pendingApprovals: 0,
                averageAttendance: 85,
                syllabusProgress: 65,
                facultyOnLeave: 0,
                activeProjects: 0
            }
        });
    }

    const [totalStudents, totalFaculty] = await Promise.all([
        Student.count({ where: { departmentId: departmentId } }).catch(() => 0),
        Faculty.count({ where: { department_id: departmentId } }).catch(() => 0)
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalStudents,
            totalFaculty,
            pendingApprovals: 5,
            averageAttendance: 88,
            syllabusProgress: 72,
            facultyOnLeave: 2,
            activeProjects: 12
        }
    });
});
