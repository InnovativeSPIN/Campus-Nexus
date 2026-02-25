import express from 'express';
import {
  allocateSubjectToFaculty,
  getFacultyAllocations,
  getAllocationDetails,
  updateAllocation,
  deleteAllocation,
  getAllocationSubjects,
  getAllocationFaculty,
  getAllocationClasses,
  getFacultyAllocationsBySemester
} from '../../controllers/department-admin/faculty-allocation.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// Protect all routes - only department admin can access
router.use(protect, authorize('department-admin'));

// Get dropdown data for allocation form
router.get('/subjects', getAllocationSubjects);
router.get('/faculty', getAllocationFaculty);
router.get('/classes', getAllocationClasses);

// Get allocations
router.get('/', getFacultyAllocations);
router.get('/year/:academic_year/sem/:semester', getFacultyAllocationsBySemester);

// Get single allocation
router.get('/:id', getAllocationDetails);

// Create allocation
router.post('/', allocateSubjectToFaculty);

// Update allocation
router.put('/:id', updateAllocation);

// Delete allocation
router.delete('/:id', deleteAllocation);

export default router;
