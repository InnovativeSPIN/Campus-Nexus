import express from 'express';
import {
    getAnnouncements,
    getAnnouncement,
    getAdminAnnouncements,
    createAnnouncement,
    deleteAnnouncement
} from '../../controllers/admin/announcement.controller.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getAnnouncements)
    .post(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin', 'faculty'), createAnnouncement);

router.route('/admin')
    .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin'), getAdminAnnouncements);

router.route('/:id')
    .get(getAnnouncement)
    .delete(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin', 'faculty'), deleteAnnouncement);

export default router;
