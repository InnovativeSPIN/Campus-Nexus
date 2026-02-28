import path from 'path';
import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';
const { Announcement, User } = models;
import { Op, Sequelize } from 'sequelize';

// @desc      Get all announcements for user
// @route     GET /api/v1/announcements
// @access    Private
export const getAnnouncements = asyncHandler(async (req, res, next) => {
    const { role, departmentCode, departmentId } = req.user;

    let where = { isActive: true };

    // If not superadmin, filter by role and department
    const superRoles = ['superadmin', 'super-admin', 'executiveadmin', 'academicadmin'];

    // Departments excluded from department-specific announcements (only see global)
    const excludedDepartments = [8, 9, 11];

    if (!superRoles.includes(role)) {
        // Build role check: targetRole contains 'all' OR targetRole contains user's role
        const roleConditions = [
            Sequelize.where(
                Sequelize.fn('JSON_CONTAINS', Sequelize.col('targetRole'), JSON.stringify('all')),
                1
            ),
            Sequelize.where(
                Sequelize.fn('JSON_CONTAINS', Sequelize.col('targetRole'), JSON.stringify(role)),
                1
            )
        ];

        // Check if user is in an excluded department
        const isExcludedDepartment = excludedDepartments.includes(Number(departmentId));

        // Build department check
        let departmentConditions;
        if (isExcludedDepartment) {
            // Excluded departments only see global announcements
            departmentConditions = { department: null };
        } else {
            // Other departments see global + their own department announcements
            departmentConditions = {
                [Op.or]: [
                    { department: null },
                    { department: departmentCode }
                ]
            };
        }

        // Combine: (role condition) AND (department condition)
        if (departmentCode) {
            where[Op.and] = [
                { [Op.or]: roleConditions },
                departmentConditions
            ];
        } else {
            // If no department code, just check role conditions
            where[Op.or] = roleConditions;
        }
    }

    const announcements = await Announcement.findAll({
        where,
        include: [{
            model: User,
            as: 'createdBy',
            attributes: ['name', 'avatar']
        }],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: announcements.length,
        data: announcements
    });
});

// @desc      Get all announcements (Admin view)
// @route     GET /api/v1/announcements/admin
// @access    Private/Admin
export const getAdminAnnouncements = asyncHandler(async (req, res, next) => {
    const announcements = await Announcement.findAll({
        include: [{
            model: User,
            as: 'createdBy',
            attributes: ['name', 'avatar']
        }],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: announcements.length,
        data: announcements
    });
});

// @desc      Get single announcement by ID
// @route     GET /api/v1/announcements/:id
// @access    Private
export const getAnnouncement = asyncHandler(async (req, res, next) => {
    const announcement = await Announcement.findByPk(req.params.id, {
        include: [{
            model: User,
            as: 'createdBy',
            attributes: ['name', 'avatar']
        }]
    });

    if (!announcement) {
        return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: announcement
    });
});

// @desc      Create announcement
// @route     POST /api/v1/announcements
// @access    Private/Admin
export const createAnnouncement = asyncHandler(async (req, res, next) => {
    req.body.createdById = req.user.id;
    req.body.creatorRole = req.user.role;

    // Set department if created by department-admin or faculty
    if ((req.user.role === 'department-admin' || req.user.role === 'faculty') && req.user.departmentCode) {
        req.body.department = req.user.departmentCode;
    }

    // Handle attachments
    let attachments = [];
    if (req.files && req.files.files) {
        let files = req.files.files;
        if (!Array.isArray(files)) {
            files = [files];
        }

        for (const file of files) {
            const ext = path.parse(file.name).ext;
            const fileName = `announcement_${Date.now()}_${Math.round(Math.random() * 1E9)}${ext}`;
            const uploadPath = path.resolve(process.env.FILE_UPLOAD_PATH, 'announcements', fileName);

            await file.mv(uploadPath);

            attachments.push({
                name: file.name,
                url: `/uploads/announcements/${fileName}`,
                type: file.mimetype.split('/')[1]
            });
        }
    }

    req.body.attachments = attachments;

    // Parse targetRole if it's a string (from FormData)
    if (typeof req.body.targetRole === 'string') {
        req.body.targetRole = req.body.targetRole.split(',');
    }

    const announcement = await Announcement.create(req.body);

    res.status(201).json({
        success: true,
        data: announcement
    });
});

// @desc      Delete announcement
// @route     DELETE /api/v1/announcements/:id
// @access    Private/Admin
export const deleteAnnouncement = asyncHandler(async (req, res, next) => {
    const announcement = await Announcement.findByPk(req.params.id);

    if (!announcement) {
        return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
    }

    // Check ownership if not superadmin
    const superRoles = ['superadmin', 'super-admin'];
    if (!superRoles.includes(req.user.role) && announcement.createdById !== Number(req.user.id)) {
        return next(new ErrorResponse(`User not authorized to delete this announcement`, 401));
    }

    await announcement.destroy();

    res.status(200).json({
        success: true,
        data: {}
    });
});
