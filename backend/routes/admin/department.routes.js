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

// All routes require authentication and admin roles
router.use(protect);
router.use(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'));

router.route('/')
    .get(getDepartments)
    .post(authorize('superadmin', 'super-admin'), createDepartment);

router.route('/:id')
    .get(getDepartment)
    .put(authorize('superadmin', 'super-admin'), updateDepartment)
    .delete(authorize('superadmin', 'super-admin'), deleteDepartment);

export default router;
