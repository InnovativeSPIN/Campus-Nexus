import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
const { DisciplinaryRecord, Student, Faculty } = models;

const getStudentId = async (userOrId, next) => {
    // if already a student instance, just return the id
    if (userOrId && userOrId.id && userOrId.studentId) {
        return userOrId.id;
    }
    // userId column doesn't exist; can't look up this way
    next(new ErrorResponse('Student profile not accessible', 404));
    return null;
};

// @desc   Get disciplinary records for logged-in student (read-only)
// @route  GET /api/student/disciplinary
// @access Private/Student
export const getMyDisciplinaryRecords = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const where = { studentId };
    if (req.query.resolved !== undefined) where.resolved = req.query.resolved === 'true';
    if (req.query.type) where.type = req.query.type;

    const records = await DisciplinaryRecord.findAll({
        where,
        include: [{ model: Faculty, as: 'issuedBy', attributes: ['firstName', 'lastName', 'designation'] }],
        order: [['recordDate', 'DESC']]
    });

    res.status(200).json({ success: true, count: records.length, data: records });
});

// @desc   Get single disciplinary record
// @route  GET /api/student/disciplinary/:id
// @access Private/Student
export const getDisciplinaryRecord = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const record = await DisciplinaryRecord.findOne({
        where: { id: req.params.id, studentId },
        include: [{ model: Faculty, as: 'issuedBy', attributes: ['firstName', 'lastName', 'designation'] }]
    });

    if (!record) return next(new ErrorResponse('Disciplinary record not found', 404));
    res.status(200).json({ success: true, data: record });
});

// @desc   Create disciplinary record (faculty/admin only)
// @route  POST /api/student/disciplinary
// @access Private/Faculty/Admin
export const createDisciplinaryRecord = asyncHandler(async (req, res, next) => {
    const faculty = await Faculty.findOne({ where: { userId: req.user.id } });

    const record = await DisciplinaryRecord.create({
        ...req.body,
        issuedByFacultyId: faculty ? faculty.id : null
    });

    res.status(201).json({ success: true, data: record });
});

// @desc   Update disciplinary record resolution (faculty/admin only)
// @route  PUT /api/student/disciplinary/:id
// @access Private/Faculty/Admin
export const updateDisciplinaryRecord = asyncHandler(async (req, res, next) => {
    const record = await DisciplinaryRecord.findByPk(req.params.id);
    if (!record) return next(new ErrorResponse('Disciplinary record not found', 404));

    await record.update(req.body);
    res.status(200).json({ success: true, data: record });
});

// @desc   Mark record as resolved (faculty/admin only)
// @route  PUT /api/student/disciplinary/:id/resolve
// @access Private/Faculty/Admin
export const resolveRecord = asyncHandler(async (req, res, next) => {
    const record = await DisciplinaryRecord.findByPk(req.params.id);
    if (!record) return next(new ErrorResponse('Disciplinary record not found', 404));

    await record.update({ resolved: true, resolvedDate: new Date() });
    res.status(200).json({ success: true, data: record });
});

// @desc   Delete disciplinary record (admin only)
// @route  DELETE /api/student/disciplinary/:id
// @access Private/Admin
export const deleteDisciplinaryRecord = asyncHandler(async (req, res, next) => {
    const record = await DisciplinaryRecord.findByPk(req.params.id);
    if (!record) return next(new ErrorResponse('Disciplinary record not found', 404));

    await record.destroy();
    res.status(200).json({ success: true, data: {} });
});
