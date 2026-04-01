import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import studentUpload from '../../middleware/studentUpload.js';
import {
    getMyCertifications,
    getCertification,
    createCertification,
    updateCertification,
    deleteCertification,
    updateApprovalStatus,
    getClassInchargeCertifications
} from '../../controllers/student/studentCertification.controller.js';

const router = express.Router();

// Protect all routes FIRST
router.use(protect);

// FACULTY/ADMIN CLASS INCHARGE ROUTES - MUST BE FIRST BEFORE ANY OTHER ROUTES
router.get('/class-incharge', authorize('faculty', 'admin', 'department-admin'), getClassInchargeCertifications);
router.put('/:id/approval', authorize('admin', 'faculty'), updateApprovalStatus);

// STUDENT ROUTES
router.get('/', authorize('student'), getMyCertifications);
router.post('/', authorize('student'), studentUpload.single('documentUrl'), createCertification);

// STUDENT ID ROUTES - MUST BE LAST
router.get('/:id', authorize('student'), getCertification);
router.put('/:id', authorize('student'), studentUpload.single('documentUrl'), updateCertification);
router.delete('/:id', authorize('student'), deleteCertification);

export default router;
