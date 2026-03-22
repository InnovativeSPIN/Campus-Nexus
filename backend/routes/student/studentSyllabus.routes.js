import express from 'express';
import { getStudentSyllabus } from '../../controllers/student/student.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication and student role
router.use(protect);
router.use(authorize('student'));

// Get student's approved course syllabus
router.get('/syllabus', getStudentSyllabus);

export default router;
