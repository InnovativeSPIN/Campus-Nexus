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

// Subject CRUD routes
router.route('/')
  .get(getDepartmentSubjects)
  .post(createSubject);

router.route('/:id')
  .get(getSubjectDetails)
  .put(updateSubject)
  .delete(deleteSubject);

// Faculty assignment routes
router.get('/available-faculty', getAvailableFaculty);
router.post('/:id/assign-faculty', assignFacultyToSubject);
router.delete('/:id/assignments/:assignment_id', removeFacultyAssignment);

export default router;