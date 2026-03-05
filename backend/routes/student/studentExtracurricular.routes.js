import express from 'express';
import {
    getMySports,
    getSport,
    createSport,
    updateSport,
    deleteSport,
    updateSportApproval,
    getMyEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventApproval
} from '../../controllers/student/studentExtracurricular.controller.js';
import { protect, authorize } from '../../middleware/auth.js';
import studentUpload from '../../middleware/studentUpload.js';

const router = express.Router();

router.use(protect);

// ── Sports ────────────────────────────────────────────────
router.get('/sports', authorize('student'), getMySports);
router.get('/sports/:id', authorize('student'), getSport);
router.post('/sports', authorize('student'), studentUpload.single('documentUrl'), createSport);
router.put('/sports/:id', authorize('student'), studentUpload.single('documentUrl'), updateSport);
router.delete('/sports/:id', authorize('student'), deleteSport);
router.put('/sports/:id/approval', authorize('admin', 'faculty'), updateSportApproval);

// ── Events ────────────────────────────────────────────────
router.get('/events', authorize('student'), getMyEvents);
router.get('/events/:id', authorize('student'), getEvent);
router.post('/events', authorize('student'), studentUpload.single('certificateUrl'), createEvent);
router.put('/events/:id', authorize('student'), studentUpload.single('certificateUrl'), updateEvent);
router.delete('/events/:id', authorize('student'), deleteEvent);
router.put('/events/:id/approval', authorize('admin', 'faculty'), updateEventApproval);

export default router;
