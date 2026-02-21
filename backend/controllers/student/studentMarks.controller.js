import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
const { StudentMarks, StudentInternalMark, Subject, Student } = models;

// ─── Helper ────────────────────────────────────────────────────────────────
const getStudentRecord = async (userOrId, next) => {
    // if already a student instance, just return it
    if (userOrId && userOrId.id && userOrId.studentId) {
        return userOrId;
    }
    // userId column doesn't exist; can't look up students this way
    next(new ErrorResponse('Student profile not accessible', 404));
    return null;
};

// @desc   Get semester marks for logged-in student
// @route  GET /api/student/marks?semester=&academicYear=
// @access Private/Student
export const getMyMarks = asyncHandler(async (req, res, next) => {
    const student = await getStudentRecord(req.user.id, next);
    if (!student) return;

    const where = { studentId: student.id };
    if (req.query.semester) where.semester = parseInt(req.query.semester);
    if (req.query.academicYear) where.academicYear = req.query.academicYear;

    const marks = await StudentMarks.findAll({
        where,
        include: [{ model: Subject, as: 'subject', attributes: ['name', 'code', 'credits'] }],
        order: [['semester', 'ASC']]
    });

    res.status(200).json({ success: true, count: marks.length, data: marks });
});

// @desc   Get internal marks for logged-in student
// @route  GET /api/student/marks/internal?semester=&internalNumber=
// @access Private/Student
export const getMyInternalMarks = asyncHandler(async (req, res, next) => {
    const student = await getStudentRecord(req.user.id, next);
    if (!student) return;

    const where = { studentId: student.id };
    if (req.query.semester) where.semester = parseInt(req.query.semester);
    if (req.query.internalNumber) where.internalNumber = parseInt(req.query.internalNumber);
    if (req.query.academicYear) where.academicYear = req.query.academicYear;

    const internalMarks = await StudentInternalMark.findAll({
        where,
        include: [{ model: Subject, as: 'subject', attributes: ['name', 'code'] }],
        order: [['semester', 'ASC'], ['internalNumber', 'ASC']]
    });

    res.status(200).json({ success: true, count: internalMarks.length, data: internalMarks });
});

// @desc   Create/update marks (admin/faculty only)
// @route  POST /api/student/marks
// @access Private/Admin/Faculty
export const upsertMarks = asyncHandler(async (req, res, next) => {
    const { studentId, subjectId, semester, academicYear, internalMarks, externalMarks } = req.body;

    const [record, created] = await StudentMarks.findOrCreate({
        where: { studentId, subjectId, semester, academicYear },
        defaults: { internalMarks, externalMarks, credits: req.body.credits || 4 }
    });

    if (!created) {
        await record.update({ internalMarks, externalMarks });
    }

    res.status(created ? 201 : 200).json({ success: true, data: record });
});

// @desc   Create/update internal mark (admin/faculty only)
// @route  POST /api/student/marks/internal
// @access Private/Admin/Faculty
export const upsertInternalMark = asyncHandler(async (req, res, next) => {
    const { studentId, subjectId, semester, academicYear, internalNumber, internalScore, assessmentScore } = req.body;

    const [record, created] = await StudentInternalMark.findOrCreate({
        where: { studentId, subjectId, semester, academicYear, internalNumber },
        defaults: { internalScore, assessmentScore }
    });

    if (!created) {
        await record.update({ internalScore, assessmentScore });
    }

    res.status(created ? 201 : 200).json({ success: true, data: record });
});

// @desc   Get CGPAs across semesters for logged-in student (summary)
// @route  GET /api/student/marks/summary
// @access Private/Student
export const getMarksSummary = asyncHandler(async (req, res, next) => {
    const student = await getStudentRecord(req.user.id, next);
    if (!student) return;

    const marks = await StudentMarks.findAll({
        where: { studentId: student.id, status: { $in: ['pass', 'fail'] } },
        include: [{ model: Subject, as: 'subject', attributes: ['name', 'code', 'credits'] }],
        order: [['semester', 'ASC']]
    });

    // Group by semester
    const semesterMap = {};
    for (const m of marks) {
        const sem = m.semester;
        if (!semesterMap[sem]) semesterMap[sem] = { semester: sem, subjects: [], totalCredits: 0, weightedGP: 0 };
        semesterMap[sem].subjects.push(m);
        semesterMap[sem].totalCredits += m.credits;
        semesterMap[sem].weightedGP += (m.gradePoints || 0) * m.credits;
    }

    const semesters = Object.values(semesterMap).map(s => ({
        ...s,
        gpa: s.totalCredits > 0 ? +(s.weightedGP / s.totalCredits).toFixed(2) : 0
    }));

    const allCredits = semesters.reduce((t, s) => t + s.totalCredits, 0);
    const allWeighted = semesters.reduce((t, s) => t + s.weightedGP, 0);
    const cgpa = allCredits > 0 ? +(allWeighted / allCredits).toFixed(2) : 0;

    res.status(200).json({ success: true, data: { cgpa, semesters } });
});

// @desc   Delete a mark record (admin only)
// @route  DELETE /api/student/marks/:id
// @access Private/Admin
export const deleteMark = asyncHandler(async (req, res, next) => {
    const record = await StudentMarks.findByPk(req.params.id);
    if (!record) return next(new ErrorResponse('Mark record not found', 404));
    await record.destroy();
    res.status(200).json({ success: true, data: {} });
});
