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
    updateEventApproval,
    getClassInchargeSports,
    getClassInchargeEvents
} from '../../controllers/student/studentExtracurricular.controller.js';
import { protect, authorize } from '../../middleware/auth.js';
import studentUpload from '../../middleware/studentUpload.js';

const router = express.Router();

// Protect all routes FIRST
router.use(protect);

// SPORTS CLASS INCHARGE (FACULTY/ADMIN) - MUST BE FIRST
router.get('/sports/class-incharge', authorize('faculty', 'admin', 'department-admin'), getClassInchargeSports);
router.put('/sports/class-incharge/:approvalId/approval', authorize('admin', 'faculty'), updateSportApproval);

// SPORTS STUDENT ROUTES
router.get('/sports', authorize('student'), getMySports);
router.post('/sports', authorize('student'), studentUpload.single('documentUrl'), createSport);
router.get('/sports/:id', authorize('student'), getSport);
router.put('/sports/:id', authorize('student'), studentUpload.single('documentUrl'), updateSport);
router.delete('/sports/:id', authorize('student'), deleteSport);

// EVENTS CLASS INCHARGE (FACULTY/ADMIN) - MUST BE BEFORE GENERIC EVENTS ROUTES
router.get('/events/class-incharge', authorize('faculty', 'admin', 'department-admin'), getClassInchargeEvents);
router.put('/events/class-incharge/:approvalId/approval', authorize('admin', 'faculty'), updateEventApproval);

// EVENTS STUDENT ROUTES
router.get('/events', authorize('student'), getMyEvents);
router.post('/events', authorize('student'), studentUpload.single('certificateUrl'), createEvent);
router.get('/events/:id', authorize('student'), getEvent);
router.put('/events/:id', authorize('student'), studentUpload.single('certificateUrl'), updateEvent);
router.delete('/events/:id', authorize('student'), deleteEvent);

export default router;
