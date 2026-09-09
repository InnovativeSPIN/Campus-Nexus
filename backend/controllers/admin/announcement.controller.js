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
const SUPER_ROLES = ['superadmin', 'super-admin', 'executiveadmin', 'academicadmin'];

function targetRoleCondition(role, alias = 'a') {
    return `(CAST(${alias}.targetRole AS CHAR) LIKE '%"all"%' OR CAST(${alias}.targetRole AS CHAR) LIKE ${sequelize.escape(`%"${role}"%`)})`;
}

function academicYearValues(value) {
    const raw = String(value ?? '').trim().toUpperCase();
    const numeric = { I: '1', II: '2', III: '3', IV: '4', '1ST': '1', '2ND': '2', '3RD': '3', '4TH': '4' };
    const number = numeric[raw] || (/^[1-4]$/.test(raw) ? raw : null);
    if (!number) return [raw];
    const roman = ['', 'I', 'II', 'III', 'IV'][Number(number)];
    const ordinal = ['', '1ST', '2ND', '3RD', '4TH'][Number(number)];
    return [raw, number, roman, ordinal];
}

function academicTargetConditions(user, alias = 'a') {
    const semester = String(user.semester ?? '').trim();
    const yearValues = academicYearValues(user.year).map(value => sequelize.escape(String(value)));
    const numericSemester = Number(user.semester);
    const currentTerm = Number.isFinite(numericSemester) && numericSemester > 0 && numericSemester % 2 === 0 ? 'even' : 'odd';

    if (user.role !== 'student') {
        return ` AND (${alias}.semester IS NULL OR TRIM(${alias}.semester) = '')
                 AND (${alias}.year IS NULL OR TRIM(${alias}.year) = '')
                 AND (${alias}.term IS NULL OR LOWER(TRIM(${alias}.term)) IN ('', 'both'))`;
    }

    return ` AND (${alias}.semester IS NULL OR TRIM(${alias}.semester) = '' OR ${alias}.semester = ${sequelize.escape(semester)})
             AND (${alias}.year IS NULL OR TRIM(${alias}.year) = '' OR UPPER(TRIM(${alias}.year)) IN (${yearValues.join(', ')}))
             AND (${alias}.term IS NULL OR TRIM(${alias}.term) = '' OR LOWER(TRIM(${alias}.term)) IN ('both', ${sequelize.escape(currentTerm)}))`;
}
function recipientConditions(user, alias = 'a') {
    const role = user.role || '';
    const departmentCode = user.departmentCode || '';
    const department = departmentCode
        ? `((${alias}.department IS NULL) OR ${alias}.department = ${sequelize.escape(departmentCode)})`
        : `${alias}.department IS NULL`;
    return ` AND ${targetRoleCondition(role, alias)} AND ${department}${academicTargetConditions(user, alias)}`;
}

// GET /api/v1/announcements
// All authenticated users. Results are filtered by targetRole + department.
// ─────────────────────────────────────────────────────────────────────────────
export const getAnnouncements = asyncHandler(async (req, res) => {
    const { role = '' } = req.user;
    let rows;

    if (SUPER_ROLES.includes(role)) {
        rows = await sequelize.query(
            `SELECT a.*, u.id as createdBy_id, u.name as createdBy_name, u.avatar as createdBy_avatar
             FROM announcements a
             LEFT JOIN users u ON a.createdById = u.id
             WHERE a.isActive = 1
             ORDER BY a.createdAt DESC`,
            { type: sequelize.QueryTypes.SELECT }
        );
    } else {
        const user = req.user;
        rows = await sequelize.query(
            `SELECT a.*, u.id as createdBy_id, u.name as createdBy_name, u.avatar as createdBy_avatar
             FROM announcements a
             LEFT JOIN users u ON a.createdById = u.id
             WHERE a.isActive = 1${recipientConditions(user)}
             ORDER BY a.createdAt DESC`,
            { type: sequelize.QueryTypes.SELECT }
        );
    }

    const data = rows.map(r => ({
        ...r,
        attachments: typeof r.attachments === 'string' ? tryParse(r.attachments, []) : (r.attachments ?? []),
        targetRole: typeof r.targetRole === 'string' ? tryParse(r.targetRole, []) : (r.targetRole ?? []),
        createdBy: r.createdBy_id ? { id: r.createdBy_id, name: r.createdBy_name, avatar: r.createdBy_avatar } : null,
    }));

    return res.status(200).json({ success: true, count: data.length, data });
});
// GET /api/v1/announcements/admin
// Department-admins and faculty: global + their department's announcements.
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminAnnouncements = asyncHandler(async (req, res) => {
    const { role = '' } = req.user;
    let sql;

    if (SUPER_ROLES.includes(role)) {
        sql = `SELECT a.*, u.id as createdBy_id, u.name as createdBy_name, u.avatar as createdBy_avatar
               FROM announcements a
               LEFT JOIN users u ON a.createdById = u.id
               ORDER BY a.createdAt DESC`;
    } else {
        const user = req.user;
        sql = `SELECT a.*, u.id as createdBy_id, u.name as createdBy_name, u.avatar as createdBy_avatar
               FROM announcements a
               LEFT JOIN users u ON a.createdById = u.id
               WHERE a.isActive = 1${recipientConditions(user)}
               ORDER BY a.createdAt DESC`;
    }

    const rows = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
    const data = rows.map(r => ({
        ...r,
        attachments: typeof r.attachments === 'string' ? tryParse(r.attachments, []) : (r.attachments ?? []),
        targetRole: typeof r.targetRole === 'string' ? tryParse(r.targetRole, []) : (r.targetRole ?? []),
        createdBy: r.createdBy_id ? { id: r.createdBy_id, name: r.createdBy_name, avatar: r.createdBy_avatar } : null,
    }));

    return res.status(200).json({ success: true, count: data.length, data });
});
export const getAnnouncement = asyncHandler(async (req, res, next) => {
    const { role = '' } = req.user;
    let rows;

    if (SUPER_ROLES.includes(role)) {
        rows = await sequelize.query(
            `SELECT a.*, u.id as createdBy_id, u.name as createdBy_name, u.avatar as createdBy_avatar
             FROM announcements a
             LEFT JOIN users u ON a.createdById = u.id
             WHERE a.id = ${sequelize.escape(req.params.id)} AND a.isActive = 1`,
            { type: sequelize.QueryTypes.SELECT }
        );
    } else {
        const user = req.user;
        rows = await sequelize.query(
            `SELECT a.*, u.id as createdBy_id, u.name as createdBy_name, u.avatar as createdBy_avatar
             FROM announcements a
             LEFT JOIN users u ON a.createdById = u.id
             WHERE a.id = ${sequelize.escape(req.params.id)} AND a.isActive = 1${recipientConditions(user)}`,
            { type: sequelize.QueryTypes.SELECT }
        );
    }

    if (!rows.length) return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
    const r = rows[0];
    return res.status(200).json({ success: true, data: {
        ...r,
        attachments: typeof r.attachments === 'string' ? tryParse(r.attachments, []) : (r.attachments ?? []),
        targetRole: typeof r.targetRole === 'string' ? tryParse(r.targetRole, []) : (r.targetRole ?? []),
        createdBy: r.createdBy_id ? { id: r.createdBy_id, name: r.createdBy_name, avatar: r.createdBy_avatar } : null,
    }});
});
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