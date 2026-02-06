import express from 'express';
import {
    getAnnouncements,
    getAdminAnnouncements,
    createAnnouncement,
    deleteAnnouncement
} from '../../controllers/admin/announcement.controller.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getAnnouncements)
    .post(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin'), createAnnouncement);

router.route('/admin')
    .get(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin'), getAdminAnnouncements);

router.route('/:id')
    .delete(authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin'), deleteAnnouncement);

export default router;
