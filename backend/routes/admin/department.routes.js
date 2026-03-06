import express from 'express';
import {
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment
} from '../../controllers/admin/department.controller.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
    .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty', 'department-admin'), getDepartments)
    .post(authorize('superadmin', 'super-admin'), createDepartment);

router.route('/:id')
    .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty', 'department-admin'), getDepartment)
    .put(authorize('superadmin', 'super-admin'), updateDepartment)
    .delete(authorize('superadmin', 'super-admin'), deleteDepartment);

export default router;
