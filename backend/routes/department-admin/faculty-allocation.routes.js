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
  getFacultyAllocationsBySemester,
  getTimetableAllocations,
  updateTimetableAllocation,
  getAllDepartments
} from '../../controllers/department-admin/faculty-allocation.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// Protect all routes - only department admin can access
router.use(protect, authorize('department-admin'));

// IMPORTANT: Define specific routes BEFORE generic routes with :id parameter
// Get dropdown data for allocation form (specific routes)
router.get('/subjects', getAllocationSubjects);
router.get('/faculty', getAllocationFaculty);
router.get('/classes', getAllocationClasses);
router.get('/departments', getAllDepartments);
router.get('/timetable-list', getTimetableAllocations);
router.get('/year/:academic_year/sem/:semester', getFacultyAllocationsBySemester);

// Get allocations list
router.get('/', getFacultyAllocations);

// Create allocation
router.post('/', allocateSubjectToFaculty);

// Get single allocation, update, and delete (generic routes with :id AFTER specific routes)
router.get('/:id', getAllocationDetails);
router.put('/:id', updateAllocation);
router.put('/timetable/:id', updateTimetableAllocation);
router.delete('/:id', deleteAllocation);

export default router;
