import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  getMyAssignedSubjects,
  getMyAssignedClasses
} from '../../controllers/faculty/academics.controller.js';

const router = express.Router();

// All routes require authentication and faculty role
router.use(protect);
router.use(authorize('faculty', 'department-admin'));

// Get faculty's assigned subjects
router.get('/my-subjects', getMyAssignedSubjects);

// Get faculty's assigned classes
router.get('/my-classes', getMyAssignedClasses);

export default router;
