import path from 'path';
import fs from 'fs';
import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';

// ─── helpers ──────────────────────────────────────────────────────────────────
const include = [{ model: null, as: 'createdBy', attributes: ['id', 'name', 'avatar'], required: false }];

function buildInclude() {
    const { User } = models;
    return [{ model: User, as: 'createdBy', attributes: ['id', 'name', 'avatar'], required: false }];
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/announcements
// All authenticated users. Results are filtered by targetRole + department.
// ─────────────────────────────────────────────────────────────────────────────
export const getAnnouncements = asyncHandler(async (req, res) => {
    const { Announcement, User } = models;
<<<<<<< Updated upstream
    const { role = '', departmentCode = '' } = req.user;

    const superRoles = ['superadmin', 'super-admin', 'executiveadmin', 'academicadmin'];

    let rows;

    if (superRoles.includes(role)) {
        // Super admins see every active announcement
        rows = await sequelize.query(
            `SELECT a.*, u.id as createdBy_id, u.name as createdBy_name, u.avatar as createdBy_avatar
             FROM announcements a
             LEFT JOIN users u ON a.createdById = u.id
             WHERE a.isActive = 1
             ORDER BY a.createdAt DESC`,
            { type: sequelize.QueryTypes.SELECT }
        );
    } else {
        // Role check via LIKE (avoids JSON_CONTAINS quoting issues)
        const deptSQL = departmentCode
            ? `AND (a.department IS NULL OR a.department = ${sequelize.escape(departmentCode)})`
            : 'AND a.department IS NULL';

        rows = await sequelize.query(
            `SELECT a.*, u.id as createdBy_id, u.name as createdBy_name, u.avatar as createdBy_avatar
             FROM announcements a
             LEFT JOIN users u ON a.createdById = u.id
             WHERE a.isActive = 1
               AND (
                     a.targetRole LIKE '%"all"%'
                  OR a.targetRole LIKE ${sequelize.escape(`%"${role}"%`)}
               )
               ${deptSQL}
             ORDER BY a.createdAt DESC`,
            { type: sequelize.QueryTypes.SELECT }
        );
=======
    try {
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

        return res.status(200).json({
            success: true,
            count: announcements.length,
            data: announcements
        });
    } catch (error) {
        console.error('[GET ANNOUNCEMENTS] Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch announcements'
        });
>>>>>>> Stashed changes
    }

    // Normalise: parse JSON fields that may come back as strings from raw query
    const data = rows.map(r => ({
        ...r,
        attachments: typeof r.attachments === 'string' ? tryParse(r.attachments, []) : (r.attachments ?? []),
        targetRole:  typeof r.targetRole  === 'string' ? tryParse(r.targetRole,  []) : (r.targetRole  ?? []),
        createdBy: r.createdBy_id
            ? { id: r.createdBy_id, name: r.createdBy_name, avatar: r.createdBy_avatar }
            : null,
    }));

    return res.status(200).json({ success: true, count: data.length, data });
});

<<<<<<< Updated upstream
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/announcements/admin
// Department-admins and faculty: global + their department's announcements.
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminAnnouncements = asyncHandler(async (req, res) => {
    const { role = '', departmentCode = '' } = req.user;

    const superRoles = ['superadmin', 'super-admin', 'executiveadmin', 'academicadmin'];

    let sql, bind;

    if (superRoles.includes(role)) {
        // Super admins see ALL announcements
        sql  = `SELECT a.*, u.id as createdBy_id, u.name as createdBy_name, u.avatar as createdBy_avatar
                FROM announcements a
                LEFT JOIN users u ON a.createdById = u.id
                ORDER BY a.createdAt DESC`;
        bind = [];
    } else if (departmentCode) {
        // Faculty / HOD: global announcements + their own department
        sql  = `SELECT a.*, u.id as createdBy_id, u.name as createdBy_name, u.avatar as createdBy_avatar
                FROM announcements a
                LEFT JOIN users u ON a.createdById = u.id
                WHERE (a.department IS NULL OR a.department = ?)
                ORDER BY a.createdAt DESC`;
        bind = [departmentCode];
    } else {
        // No departmentCode: show all (fallback)
        sql  = `SELECT a.*, u.id as createdBy_id, u.name as createdBy_name, u.avatar as createdBy_avatar
                FROM announcements a
                LEFT JOIN users u ON a.createdById = u.id
                ORDER BY a.createdAt DESC`;
        bind = [];
=======
// @desc      Get all announcements (Admin view)
// @route     GET /api/v1/announcements/admin
// @access    Private/Admin
export const getAdminAnnouncements = asyncHandler(async (req, res, next) => {
    const { Announcement, User } = models;
    try {
        const announcements = await Announcement.findAll({
            include: [{
                model: User,
                as: 'createdBy',
                attributes: ['name', 'avatar']
            }],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            count: announcements.length,
            data: announcements
        });
    } catch (error) {
        console.error('[GET ADMIN ANNOUNCEMENTS] Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch announcements'
        });
>>>>>>> Stashed changes
    }

    const rows = await sequelize.query(sql, {
        type: sequelize.QueryTypes.SELECT,
        replacements: bind.length ? bind : undefined
    });

    const data = rows.map(r => ({
        ...r,
        attachments: typeof r.attachments === 'string' ? tryParse(r.attachments, []) : (r.attachments ?? []),
        targetRole:  typeof r.targetRole  === 'string' ? tryParse(r.targetRole,  []) : (r.targetRole  ?? []),
        createdBy: r.createdBy_id
            ? { id: r.createdBy_id, name: r.createdBy_name, avatar: r.createdBy_avatar }
            : null,
    }));

    return res.status(200).json({ success: true, count: data.length, data });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/announcements/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getAnnouncement = asyncHandler(async (req, res, next) => {
    const { Announcement, User } = models;
<<<<<<< Updated upstream

    const announcement = await Announcement.findByPk(req.params.id, {
        include: buildInclude()
    });

    if (!announcement) {
        return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
=======
    try {
        const announcement = await Announcement.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'createdBy',
                attributes: ['name', 'avatar']
            }]
        });

        if (!announcement) {
            return res.status(404).json({
                success: false,
                error: `Announcement not found with id of ${req.params.id}`
            });
        }

        return res.status(200).json({
            success: true,
            data: announcement
        });
    } catch (error) {
        console.error('[GET ANNOUNCEMENT] Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch announcement'
        });
>>>>>>> Stashed changes
    }

    return res.status(200).json({ success: true, data: announcement });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/announcements
// ─────────────────────────────────────────────────────────────────────────────
export const createAnnouncement = asyncHandler(async (req, res, next) => {
    const { Announcement } = models;

    req.body.createdById = req.user.id;
    req.body.creatorRole = req.user.role;

    // Auto-assign department
    if (['department-admin', 'faculty'].includes(req.user.role) && req.user.departmentCode) {
        req.body.department = req.user.departmentCode;
    }

    // Handle file uploads
    let attachments = [];
    if (req.files && req.files.files) {
        let files = req.files.files;
        if (!Array.isArray(files)) files = [files];

        // Resolve upload directory relative to backend root
        const backendRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname.slice(process.platform === 'win32' ? 1 : 0)), '../..');
        const uploadDir   = path.join(backendRoot, 'public', 'uploads', 'announcements');

        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        for (const file of files) {
            const ext      = path.extname(file.name);
            const fileName = `announcement_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            await file.mv(path.join(uploadDir, fileName));
            attachments.push({ name: file.name, url: `/uploads/announcements/${fileName}`, type: file.mimetype });
        }
    }

    req.body.attachments = attachments;

    // Parse targetRole (may arrive as JSON string from FormData)
    if (typeof req.body.targetRole === 'string') {
        try   { req.body.targetRole = JSON.parse(req.body.targetRole); }
        catch { req.body.targetRole = req.body.targetRole.split(',').map(r => r.trim()); }
    }

    if (!req.body.targetRole || req.body.targetRole.length === 0) {
        req.body.targetRole = ['all'];
    }

    const announcement = await Announcement.create(req.body);

    return res.status(201).json({ success: true, data: announcement });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/announcements/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteAnnouncement = asyncHandler(async (req, res, next) => {
    const { Announcement } = models;

    const announcement = await Announcement.findByPk(req.params.id);

    if (!announcement) {
        return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
    }

    const superRoles = ['superadmin', 'super-admin'];
    const isOwner    = announcement.createdById === Number(req.user.id);

    if (!superRoles.includes(req.user.role) && !isOwner) {
        return next(new ErrorResponse('Not authorized to delete this announcement', 403));
    }

    // Clean up physical attachment files
    const attachments = tryParse(announcement.attachments, []);
    const backendRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname.slice(process.platform === 'win32' ? 1 : 0)), '../..');
    for (const file of attachments) {
        try {
            const p = path.join(backendRoot, 'public', file.url.replace(/^\//, ''));
            if (fs.existsSync(p)) fs.unlinkSync(p);
        } catch { /* ignore */ }
    }

    await announcement.destroy();
    return res.status(200).json({ success: true, data: {} });
});

// ─── Utilities ────────────────────────────────────────────────────────────────
function tryParse(val, fallback) {
    if (!val) return fallback;
    if (typeof val !== 'string') return val;
    try { return JSON.parse(val); } catch { return fallback; }
}
