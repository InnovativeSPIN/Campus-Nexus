import express from 'express';
import {
    getMyCertifications,
    getCertification,
    createCertification,
    updateCertification,
    deleteCertification,
    updateApprovalStatus,
    getClassInchargeCertifications
} from '../../controllers/student/studentCertification.controller.js';
import { protect, authorize } from '../../middleware/auth.js';
import studentUpload from '../../middleware/studentUpload.js';

const router = express.Router();

router.use(protect);

// Student routes
router.get('/', authorize('student'), getMyCertifications);
router.get('/class-incharge', authorize('faculty', 'admin'), getClassInchargeCertifications);
router.get('/:id', authorize('student'), getCertification);
router.post('/', authorize('student'), studentUpload.single('documentUrl'), createCertification);
router.put('/:id', authorize('student'), studentUpload.single('documentUrl'), updateCertification);
router.delete('/:id', authorize('student'), deleteCertification);

// Faculty / Admin approval route
router.put('/:id/approval', authorize('admin', 'faculty'), updateApprovalStatus);

export default router;
