import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  getDepartmentSubjects,
  getSubjectDetails,
  createSubject,
  updateSubject,
  deleteSubject,
  assignFacultyToSubject,
  removeFacultyAssignment,
  getAvailableFaculty,
} from '../../controllers/department-admin/subject.controller.js';

const router = express.Router();

// All routes require authentication and department-admin role
router.use(protect);
router.use(authorize('department-admin'));

// IMPORTANT: Specific routes MUST come BEFORE generic /:id routes
// Get available faculty for assignment
router.get('/available-faculty', getAvailableFaculty);

// Subject CRUD routes
router.route('/')
  .get(getDepartmentSubjects)
  .post(createSubject);

// Faculty assignment routes - MUST come before /:id routes
router.post('/:id/assign-faculty', assignFacultyToSubject);
router.delete('/:id/assignments/:assignment_id', removeFacultyAssignment);

// Generic routes with :id LAST (will match everything else)
router.route('/:id')
  .get(getSubjectDetails)
  .put(updateSubject)
  .delete(deleteSubject);

export default router;