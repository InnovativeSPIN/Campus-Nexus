import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  getPlacementOverview,
  getPlacementDrives,
  createPlacementDrive,
  getPlacementStats,
  getDriveRegistrations,
  checkPlacementCoordinator,
} from '../../controllers/faculty/placement-coordinator.controller.js';

const router = express.Router();

// All routes require authentication and faculty role
router.use(protect);
router.use(authorize('faculty'));

// Placement coordinator routes (only for placement coordinator)
router.use(checkPlacementCoordinator);

router.get('/overview', getPlacementOverview);
router.get('/stats', getPlacementStats);

// Drives management
router.get('/drives', getPlacementDrives);
router.post('/drives', createPlacementDrive);

// Drive registrations
router.get('/drives/:driveId/students', getDriveRegistrations);

export default router;
