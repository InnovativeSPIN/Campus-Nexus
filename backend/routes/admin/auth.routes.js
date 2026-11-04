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
  updateFacultyPassword,
  getAdminsByRole,
  uploadAvatar,
  uploadStudentAvatar,
  getStudentDetails,
  getFacultyDetails,
  getHodDetails
} from '../../controllers/admin/auth.controller.js';

import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/student-login', studentLogin);
// identifier may be either a student ID or email address
router.get('/student-details/:identifier', getStudentDetails);
// faculty lookup by email or college code
router.get('/faculty-details/:identifier', getFacultyDetails);
// HOD lookup by email
router.get('/hod-details/:identifier', getHodDetails);
router.get('/logout', logout);
router.get('/admins/:role', getAdminsByRole);
router.get('/me', protect, getMe);
router.post('/avatar', protect, uploadAvatar);
router.post('/student-avatar', protect, uploadStudentAvatar);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/update-student-password', protect, updateStudentPassword);
router.put('/update-faculty-password', protect, updateFacultyPassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

export default router;
