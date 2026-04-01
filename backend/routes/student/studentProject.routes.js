import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import studentUpload from '../../middleware/studentUpload.js';
import {
  getMyProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateProjectApproval,
  getClassInchargeProjects
} from '../../controllers/student/studentProject.controller.js';

const router = express.Router();

// Protect all routes FIRST
router.use(protect);

// FACULTY/ADMIN CLASS INCHARGE ROUTES - MUST BE FIRST BEFORE ANY OTHER ROUTES
router.get('/class-incharge', authorize('faculty', 'admin', 'department-admin'), getClassInchargeProjects);
router.put('/:id/approval', authorize('admin', 'faculty'), updateProjectApproval);

// STUDENT ROUTES
router.get('/', authorize('student'), getMyProjects);
router.post('/', authorize('student'), studentUpload.single('documentUrl'), createProject);

// STUDENT ID ROUTES - MUST BE LAST
router.get('/:id', authorize('student'), getProject);
router.put('/:id', authorize('student'), studentUpload.single('documentUrl'), updateProject);
router.delete('/:id', authorize('student'), deleteProject);

export default router;
