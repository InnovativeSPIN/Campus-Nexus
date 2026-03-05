import express from 'express';
import {
  assignClassIncharge,
  getClassIncharges,
  getClassInchargeById,
  getClassInchargeStudents,
  updateClassIncharge,
  deleteClassIncharge
} from '../../controllers/department-admin/class-incharge.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// Protect all routes - only department admin can access
router.use(protect, authorize('department-admin'));

// Create new incharge
router.post('/', assignClassIncharge);

// Get all incharges for department
router.get('/', getClassIncharges);

// Get students for a class via incharge
router.get('/:id/students', getClassInchargeStudents);

// Get incharge by ID
router.get('/:id', getClassInchargeById);

// Update incharge
router.put('/:id', updateClassIncharge);

// Delete incharge
router.delete('/:id', deleteClassIncharge);

export default router;
