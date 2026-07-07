import express from 'express';
import {
  getMyMentees,
  getMenteeDetails,
  updateMenteeDetails
} from '../../controllers/faculty/mentorship.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('faculty', 'department-admin'));

router.get('/my-mentees', getMyMentees);
router.get('/student/:studentId', getMenteeDetails);
router.put('/student/:studentId', updateMenteeDetails);

export default router;
