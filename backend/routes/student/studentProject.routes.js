import express from 'express';
import {
    getMyProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    updateProjectApproval
} from '../../controllers/student/studentProject.controller.js';
import { protect, authorize } from '../../middleware/auth.js';
import studentUpload from '../../middleware/studentUpload.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('student'), getMyProjects);
router.get('/:id', authorize('student'), getProject);
router.post('/', authorize('student'), studentUpload.single('documentUrl'), createProject);
router.put('/:id', authorize('student'), studentUpload.single('documentUrl'), updateProject);
router.delete('/:id', authorize('student'), deleteProject);

router.put('/:id/approval', authorize('admin', 'faculty'), updateProjectApproval);

export default router;
