import express from 'express';
import {
  register,
  login,
  studentLogin,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  updateStudentPassword,
  getAdminsByRole,
  uploadAvatar,
  uploadStudentAvatar,
  getStudentDetails
} from '../../controllers/admin/auth.controller.js';

import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/student-login', studentLogin);
// identifier may be either a student ID or email address
router.get('/student-details/:identifier', getStudentDetails);
router.get('/logout', logout);
router.get('/admins/:role', getAdminsByRole);
router.get('/me', protect, getMe);
router.post('/avatar', protect, uploadAvatar);
router.post('/student-avatar', protect, uploadStudentAvatar);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/update-student-password', protect, updateStudentPassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

export default router;
