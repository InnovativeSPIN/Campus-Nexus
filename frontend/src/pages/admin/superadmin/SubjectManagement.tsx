import { useState, useEffect } from 'react';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { Button } from '@/pages/admin/superadmin/components/ui/button';
import { Input } from '@/pages/admin/superadmin/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/pages/admin/superadmin/components/ui/select';
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
} from '@/pages/admin/superadmin/components/ui/alert-dialog';
import { Plus, Trash2, Edit2, ChevronDown } from 'lucide-react';

interface Subject {
  id: number;
  code: string;
  name: string;
  department_id: number;
  department?: { short_name: string; full_name: string };
  semester: number;
  sem_type: 'odd' | 'even';
  credits: number;
  type: string;
  is_elective: boolean;
  is_laboratory: boolean;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

interface Department {
  id: number;
  short_name: string;
  full_name: string;
}

export default function SuperAdminSubjectManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department_id: '',
    semester: '',
    sem_type: '',
    status: ''
  });

  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    data?: Subject;
  }>({
    open: false,
    mode: 'add',
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    data: Subject | null;
  }>({
    open: false,
    data: null,
  });

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    department_id: '',
    semester: '',
    sem_type: 'odd',
    credits: 4,
    type: 'Theory',
    is_elective: false,
    is_laboratory: false,
    status: 'active',
  });

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/v1/admin/subjects/departments-semesters');
        const result = await response.json();
        if (result.success) {
          setDepartments(result.data);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast.error('Failed to fetch departments');
      }
    };

    fetchDepartments();
  }, []);

  // Fetch subjects
  useEffect(() => {
    fetchSubjects();
  }, [filters]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.department_id) params.append('department_id', filters.department_id);
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.sem_type) params.append('sem_type', filters.sem_type);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/v1/admin/subjects?${params}`);
      const result = await response.json();
      if (result.success) {
        setSubjects(result.data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      department_id: '',
      semester: '',
      sem_type: 'odd',
      credits: 4,
      type: 'Theory',
      is_elective: false,
      is_laboratory: false,
      status: 'active',
    });
    setFormModal({ open: true, mode: 'add' });
  };

  const handleEditClick = (subject: Subject) => {
    setFormData({
      code: subject.code,
      name: subject.name,
      description: subject.description || '',
      department_id: subject.department_id.toString(),
      semester: subject.semester.toString(),
      sem_type: subject.sem_type,
      credits: subject.credits,
      type: subject.type,
      is_elective: subject.is_elective,
      is_laboratory: subject.is_laboratory,
      status: subject.status,
    });
    setFormModal({ open: true, mode: 'edit', data: subject });
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.code || !formData.name || !formData.department_id || !formData.semester) {
        toast.error('Please fill all required fields');
        return;
      }

      const payload = {
        ...formData,
        department_id: parseInt(formData.department_id),
        semester: parseInt(formData.semester),
        credits: parseInt(formData.credits.toString()),
      };

      const url = formModal.mode === 'add' 
        ? '/api/v1/admin/subjects' 
        : `/api/v1/admin/subjects/${formModal.data?.id}`;

      const response = await fetch(url, {
        method: formModal.mode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(formModal.mode === 'add' ? 'Subject created successfully' : 'Subject updated successfully');
        setFormModal({ open: false, mode: 'add' });
        fetchSubjects();
      } else {
        toast.error(result.error || 'Failed to save subject');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error saving subject');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.data) return;

    try {
      const response = await fetch(`/api/v1/admin/subjects/${deleteDialog.data.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Subject deleted successfully');
        setDeleteDialog({ open: false, data: null });
        fetchSubjects();
      } else {
        toast.error('Failed to delete subject');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error deleting subject');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Subject Management</h1>
            <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={filters.department_id} onValueChange={(value) => setFilters({ ...filters, department_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.short_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2 items-center">
                {filters.department_id && (
                  <button
                    onClick={() => setFilters({ ...filters, department_id: '' })}
                    className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>

              <Select value={filters.semester} onValueChange={(value) => setFilters({ ...filters, semester: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2 items-center">
                {filters.semester && (
                  <button
                    onClick={() => setFilters({ ...filters, semester: '' })}
                    className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>

              <Select value={filters.sem_type} onValueChange={(value) => setFilters({ ...filters, sem_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Sem Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="odd">Odd</SelectItem>
                  <SelectItem value="even">Even</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2 items-center">
                {filters.sem_type && (
                  <button
                    onClick={() => setFilters({ ...filters, sem_type: '' })}
                    className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>

              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2 items-center">
                {filters.status && (
                  <button
                    onClick={() => setFilters({ ...filters, status: '' })}
                    className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Loading subjects...</div>
            ) : subjects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No subjects found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Sem</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Credits</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {subjects.map(subject => (
                      <tr key={subject.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{subject.code}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{subject.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{subject.department?.short_name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{subject.semester} ({subject.sem_type})</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{subject.type}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{subject.credits}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            subject.status === 'active' ? 'bg-green-100 text-green-800' :
                            subject.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {subject.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm flex gap-2">
                          <button
                            onClick={() => handleEditClick(subject)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ open: true, data: subject })}
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{formModal.mode === 'add' ? 'Add Subject' : 'Edit Subject'}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Subject Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., CS101"
                  required
                />
                <Input
                  label="Subject Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Programming Fundamentals"
                  required
                />

                <Select value={formData.department_id} onValueChange={(value) => setFormData({ ...formData, department_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
                      const year = Math.ceil(sem / 2);
                      return (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem} (Year {year})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Select value={formData.sem_type} onValueChange={(value) => setFormData({ ...formData, sem_type: value as 'odd' | 'even' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Sem Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="odd">Odd Semester</SelectItem>
                    <SelectItem value="even">Even Semester</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  label="Credits (1-10)"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                  min="1"
                  max="10"
                  placeholder="e.g., 4"
                />

                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Theory">Theory</SelectItem>
                    <SelectItem value="Practical">Practical</SelectItem>
                    <SelectItem value="Theory+Practical">Theory+Practical</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_elective}
                      onChange={(e) => setFormData({ ...formData, is_elective: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Elective</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_laboratory}
                      onChange={(e) => setFormData({ ...formData, is_laboratory: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Lab</span>
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Subject description"
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                />
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
                  {formModal.mode === 'add' ? 'Create Subject' : 'Update Subject'}
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
              <AlertDialogTitle>Delete Subject</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteDialog.data.name}"? This action cannot be undone.
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
    </AdminLayout>
  );
}
