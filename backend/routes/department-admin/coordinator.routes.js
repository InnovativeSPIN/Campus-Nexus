import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  getAllCoordinators,
  getCoordinatorDetails,
  assignTimetableIncharge,
  removeTimetableIncharge,
  assignPlacementCoordinator,
  removePlacementCoordinator,
} from '../../controllers/department-admin/coordinator.controller.js';

const router = express.Router();

// All routes require authentication and department-admin role
router.use(protect);
router.use(authorize('department-admin'));

// Get all coordinators/faculty
router.get('/', getAllCoordinators);

// Get coordinator details
router.get('/:id', getCoordinatorDetails);

// Timetable incharge routes
router.put('/:id/assign-timetable', assignTimetableIncharge);
router.put('/:id/remove-timetable', removeTimetableIncharge);

// Placement coordinator routes
router.put('/:id/assign-placement', assignPlacementCoordinator);
router.put('/:id/remove-placement', removePlacementCoordinator);

export default router;
