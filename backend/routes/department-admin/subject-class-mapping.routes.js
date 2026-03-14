import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  getMappings,
  getMapping,
  createMapping,
  updateMapping,
  deleteMapping,
  getUnmappedSubjects
} from '../../controllers/department-admin/subject-class-mapping.controller.js';

const router = express.Router();

// All routes require authentication and department-admin role
router.use(protect);
router.use(authorize('department-admin'));

// Get unmapped subjects for a class - MUST come before /:id routes
router.get('/unmapped/subjects/:classId', getUnmappedSubjects);

// Main CRUD routes
router.route('/')
  .get(getMappings)
  .post(createMapping);

// Routes with :id LAST
router.route('/:id')
  .get(getMapping)
  .put(updateMapping)
  .delete(deleteMapping);

export default router;
