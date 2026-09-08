import express from 'express';
import {
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentStatistics
} from '../../controllers/admin/department.controller.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
    .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty', 'department-admin', 'secretary'), getDepartments)
    .post(authorize('superadmin', 'super-admin'), createDepartment);

router.route('/statistics')
    .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin'), getDepartmentStatistics);

router.route('/:id')
    .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'faculty', 'department-admin', 'secretary'), getDepartment)
    .put(authorize('superadmin', 'super-admin'), updateDepartment)
    .delete(authorize('superadmin', 'super-admin'), deleteDepartment);

export default router;
