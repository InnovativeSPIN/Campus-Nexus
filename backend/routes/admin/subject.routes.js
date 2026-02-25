import express from 'express';
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByDepartmentAndSemester,
  getDepartmentsSemesters
} from '../../controllers/admin/subject.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// Protect all routes - only superadmin can access
router.use(protect, authorize('superadmin'));

// Get all available semesters and departments
router.get('/departments-semesters', getDepartmentsSemesters);

// Get all subjects with optional filters
router.get('/', getSubjects);

// Get subjects by department and semester
router.get('/dept/:department_id/sem/:semester', getSubjectsByDepartmentAndSemester);

// Get single subject
router.get('/:id', getSubject);

// Create subject
router.post('/', createSubject);

// Update subject
router.put('/:id', updateSubject);

// Delete subject
router.delete('/:id', deleteSubject);

export default router;
