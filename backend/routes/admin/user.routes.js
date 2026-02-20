import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  getUsersByRole,
  getDashboardStats,
  uploadUserPhoto,
  getRoles
} from '../../controllers/admin/user.controller.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin roles
router.use(protect);
router.use(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin'));

// allow admins to fetch available role list (useful for client dropdowns)
router.route('/roles').get(getRoles);

router.route('/stats/dashboard').get(getDashboardStats);
router.route('/role/:role').get(getUsersByRole);

router.route('/:id/photo').put(uploadUserPhoto);

router.route('/')
  .get(getUsers)
  .post(authorize('superadmin', 'super-admin'), createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(authorize('superadmin', 'super-admin'), deleteUser);

router.route('/:id/deactivate').put(deactivateUser);
router.route('/:id/activate').put(activateUser);

export default router;
