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

// GET  /        → all authenticated users get role/dept filtered announcements
// POST /        → admin, dept-admin, faculty can create
router.route('/')
    .get(getAnnouncements)
    .post(
        authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin', 'faculty'),
        createAnnouncement
    );

// GET  /admin   → dept-admin and faculty see their dept's full announcement list
router.route('/admin')
    .get(
        authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin', 'faculty'),
        getAdminAnnouncements
    );

// GET  /:id     → all authenticated users
// DELETE /:id   → owner or privileged admin
router.route('/:id')
    .get(getAnnouncement)
    .delete(
        authorize('superadmin', 'super-admin', 'executiveadmin', 'academicadmin', 'department-admin', 'faculty'),
        deleteAnnouncement
    );

export default router;
