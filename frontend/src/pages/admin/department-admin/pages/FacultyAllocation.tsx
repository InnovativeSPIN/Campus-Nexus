import { useState, useEffect } from 'react';
import { Button } from '@/pages/admin/department-admin/components/ui/button';
import { Input } from '@/pages/admin/department-admin/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/pages/admin/department-admin/components/ui/select';
import { toast } from '@/components/ui/sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/pages/admin/department-admin/components/ui/alert-dialog';
import { Plus, Trash2, Edit2, BookOpen, Users, LayoutGrid } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { generateAcademicYears, getCurrentAcademicYear } from '@/utils/academicYear';

interface FacultyAllocation {
  id: number;
  faculty_id: number;
  subject_id: number;
  class_id?: number;
  academic_year: string;
  semester: number;
  total_hours?: number;
  no_of_periods?: number;
  status: 'active' | 'inactive';
  faculty?: { faculty_id: number; Name: string; email: string; designation: string };
  subject?: { id: number; code: string; name: string; semester: number; sem_type: string; type: string };
  class?: { id: number; name: string; section: string; batch: string };
}

interface Subject {
  id: number;
  code: string;
  name: string;
  semester: number;
  sem_type: string;
  type: string;
  credits: number;
}

interface Faculty {
  faculty_id: number;
  Name: string;
  email: string;
  designation: string;
  qualification: string;
}

interface Class {
  id: number;
  name: string;
  section: string;
  semester: number;
  batch: string;
  capacity: number;
  room: string;
}

export default function FacultyAllocationPage() {
  const [allocations, setAllocations] = useState<FacultyAllocation[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    academic_year: getCurrentAcademicYear(),
    semester: '',
    faculty_id: '',
    class_id: ''
  });

  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    data?: FacultyAllocation;
  }>({
    open: false,
    mode: 'add',
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    data: FacultyAllocation | null;
  }>({
    open: false,
    data: null,
  });

  // Form state
  const [formData, setFormData] = useState({
    faculty_id: '',
    subject_id: '',
    class_id: '',
    academic_year: getCurrentAcademicYear(),
    semester: '',
    total_hours: '',
    no_of_periods: '',
  });

  // Fetch initial data
  useEffect(() => {
    Promise.all([
      fetchAllocations(),
      fetchSubjects(),
      fetchFaculty(),
      fetchClasses()
    ]);
  }, [filters]);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        academic_year: filters.academic_year,
        ...(filters.semester && { semester: filters.semester }),
        ...(filters.faculty_id && { faculty_id: filters.faculty_id }),
        ...(filters.class_id && { class_id: filters.class_id })
      });

      const response = await fetch(`/api/v1/department-admin/faculty-allocations?${params}`);
      const result = await response.json();
      if (result.success) {
        setAllocations(result.data);
      }
    } catch (error) {
      console.error('Error fetching allocations:', error);
      toast.error('Failed to fetch allocations');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/v1/department-admin/faculty-allocations/subjects');
      const result = await response.json();
      if (result.success) {
        setSubjects(result.data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await fetch('/api/v1/department-admin/faculty-allocations/faculty');
      const result = await response.json();
      if (result.success) {
        setFaculty(result.data);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/v1/department-admin/faculty-allocations/classes');
      const result = await response.json();
      if (result.success) {
        setClasses(result.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleAddClick = () => {
    setFormData({
      faculty_id: '',
      subject_id: '',
      class_id: '',
      academic_year: filters.academic_year,
      semester: filters.semester || '',
      total_hours: '',
      no_of_periods: '',
    });
    setFormModal({ open: true, mode: 'add' });
  };

  const handleEditClick = (allocation: FacultyAllocation) => {
    setFormData({
      faculty_id: allocation.faculty_id.toString(),
      subject_id: allocation.subject_id.toString(),
      class_id: allocation.class_id?.toString() || '',
      academic_year: allocation.academic_year,
      semester: allocation.semester.toString(),
      total_hours: allocation.total_hours?.toString() || '',
      no_of_periods: allocation.no_of_periods?.toString() || '',
    });
    setFormModal({ open: true, mode: 'edit', data: allocation });
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.faculty_id || !formData.subject_id || !formData.semester) {
        toast.error('Please select faculty, subject, and semester');
        return;
      }

      const payload = {
        faculty_id: parseInt(formData.faculty_id),
        subject_id: parseInt(formData.subject_id),
        class_id: formData.class_id ? parseInt(formData.class_id) : null,
        academic_year: formData.academic_year,
        semester: parseInt(formData.semester),
        total_hours: formData.total_hours ? parseInt(formData.total_hours) : 0,
        no_of_periods: formData.no_of_periods ? parseInt(formData.no_of_periods) : 0,
      };

      const url = formModal.mode === 'add'
        ? '/api/v1/department-admin/faculty-allocations'
        : `/api/v1/department-admin/faculty-allocations/${formModal.data?.id}`;

      const response = await fetch(url, {
        method: formModal.mode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(formModal.mode === 'add' ? 'Allocation created' : 'Allocation updated');
        setFormModal({ open: false, mode: 'add' });
        fetchAllocations();
      } else {
        toast.error(result.error || 'Failed to save allocation');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error saving allocation');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.data) return;

    try {
      const response = await fetch(`/api/v1/department-admin/faculty-allocations/${deleteDialog.data.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Allocation deleted');
        setDeleteDialog({ open: false, data: null });
        fetchAllocations();
      } else {
        toast.error('Failed to delete allocation');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error deleting allocation');
    }
  };

  const filteredClasses = formData.semester 
    ? classes.filter(c => c.semester === parseInt(formData.semester))
    : classes;

  return (
    <MainLayout>
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <LayoutGrid className="w-8 h-8 text-blue-600" />
                Subject Allocation
              </h1>
              <p className="text-gray-600 mt-1">Assign subjects and classes to faculty members</p>
            </div>
            <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Allocation
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={filters.academic_year} onValueChange={(value) => setFilters({ ...filters, academic_year: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  {generateAcademicYears().map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Select value={filters.semester} onValueChange={(value) => setFilters({ ...filters, semester: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Semesters" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.semester && (
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ ...filters, semester: '' })}
                    className="px-3"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Select value={filters.faculty_id} onValueChange={(value) => setFilters({ ...filters, faculty_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculty.map(f => (
                      <SelectItem key={f.faculty_id} value={f.faculty_id.toString()}>
                        {f.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.faculty_id && (
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ ...filters, faculty_id: '' })}
                    className="px-3"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Select value={filters.class_id} onValueChange={(value) => setFilters({ ...filters, class_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name} {c.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.class_id && (
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ ...filters, class_id: '' })}
                    className="px-3"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Allocations</p>
                  <p className="text-2xl font-bold text-gray-900">{allocations.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Faculty</p>
                  <p className="text-2xl font-bold text-gray-900">{new Set(allocations.map(a => a.faculty_id)).size}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Assigned Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{new Set(allocations.filter(a => a.class_id).map(a => a.class_id)).size}</p>
                </div>
                <LayoutGrid className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Allocations Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Loading allocations...</div>
            ) : allocations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <LayoutGrid className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                No allocations found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Faculty</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hours</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Periods</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Semester</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {allocations.map(allocation => (
                      <tr key={allocation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                          <div>
                            <p className="font-semibold">{allocation.faculty?.Name}</p>
                            <p className="text-gray-600 text-xs">{allocation.faculty?.designation}</p>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          <div>
                            <p className="font-semibold">{allocation.subject?.code}</p>
                            <p className="text-gray-600 text-xs">{allocation.subject?.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          {allocation.class ? (
                            <div>
                              <p className="font-semibold">{allocation.class.name}</p>
                              <p className="text-gray-600 text-xs">{allocation.class.section}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-semibold">
                            {allocation.total_hours || 0} hrs
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
                            {allocation.no_of_periods || 0} p/w
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                            {allocation.semester}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">{allocation.academic_year}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            allocation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {allocation.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm flex gap-2">
                          <button
                            onClick={() => handleEditClick(allocation)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ open: true, data: allocation })}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {formModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {formModal.mode === 'add' ? 'New Subject Allocation' : 'Edit Allocation'}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {/* Academic Year */}
                <Select value={formData.academic_year} onValueChange={(value) => setFormData({ ...formData, academic_year: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Academic Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateAcademicYears().map(year => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Faculty */}
                <Select value={formData.faculty_id} onValueChange={(value) => setFormData({ ...formData, faculty_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculty.map(f => (
                      <SelectItem key={f.faculty_id} value={f.faculty_id.toString()}>
                        {f.Name} - {f.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Semester (Year) */}
                <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map(year => (
                      <SelectItem key={year} value={(year * 2 - 1).toString()}>
                        Year {year} (Sem {year * 2 - 1}-{year * 2})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Subject */}
                <Select value={formData.subject_id} onValueChange={(value) => setFormData({ ...formData, subject_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.semester && subjects
                      .filter(s => {
                        const subjectSem = parseInt(formData.semester);
                        return s.semester === subjectSem || s.semester === subjectSem + 1;
                      })
                      .map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.code} - {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {/* Class (without section) - with Clear button */}
                <div className="flex gap-2">
                  <Select value={formData.class_id} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredClasses
                        .reduce((unique: any[], c: any) => {
                          const exists = unique.find(item => item.name === c.name);
                          return exists ? unique : [...unique, c];
                        }, [])
                        .map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name} - Batch {c.batch}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {formData.class_id && (
                    <Button
                      variant="outline"
                      onClick={() => setFormData({ ...formData, class_id: '' })}
                      className="px-3"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Total Hours */}
                <Input
                  label="Total Hours"
                  type="number"
                  value={formData.total_hours}
                  onChange={(e) => setFormData({ ...formData, total_hours: e.target.value })}
                  placeholder="e.g., 45"
                />

                {/* Number of Periods */}
                <Input
                  label="Number of Periods (per week)"
                  type="number"
                  value={formData.no_of_periods}
                  onChange={(e) => setFormData({ ...formData, no_of_periods: e.target.value })}
                  placeholder="e.g., 3"
                />

                {/* Subject Info Display (Auto-fetch) */}
                {formData.subject_id && (
                  <div className="col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    {(() => {
                      const subject = subjects.find(s => s.id === parseInt(formData.subject_id));
                      return subject ? (
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">{subject.code}</p>
                          <p className="text-gray-600">{subject.name}</p>
                          <p className="text-gray-500 text-xs mt-1">Sem: {subject.semester} | Type: {subject.type} | Credits: {subject.credits}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setFormModal({ open: false, mode: 'add' })}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSubmit}
                >
                  {formModal.mode === 'add' ? 'Create Allocation' : 'Update'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteDialog.open && deleteDialog.data && (
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, data: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Allocation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {deleteDialog.data.faculty?.Name} from {deleteDialog.data.subject?.code}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </MainLayout>
  );
}
