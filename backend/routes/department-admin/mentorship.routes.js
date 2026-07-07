import express from 'express';
import {
  getMentors,
  getStudents,
  assignMentor,
  unassignMentor
} from '../../controllers/department-admin/mentorship.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('department-admin'));

router.get('/mentors', getMentors);
router.get('/students', getStudents);
router.post('/assign', assignMentor);
router.delete('/unassign', unassignMentor);

export default router;
