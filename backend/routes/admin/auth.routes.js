import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  getAdminsByRole,
  uploadAvatar
} from '../../controllers/admin/auth.controller.js';

import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/admins/:role', getAdminsByRole);
router.get('/me', protect, getMe);
router.post('/avatar', protect, uploadAvatar);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

export default router;
