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
import { Plus, Trash2, Edit2, Upload } from 'lucide-react';

interface Subject {
  id: number;
  code: string;
  name: string;
  description?: string;
  department_id: number;
  department?: { short_name: string; full_name: string };
  semester: number;
  sem_type: 'odd' | 'even';
  academic_year?: string;
  batch?: string;
  year?: number;
  lab_name?: string;
  credits: number;
  type: string;
  is_elective: boolean;
  is_laboratory: boolean;
  subject_category?: 'academic' | 'library' | 'sports' | 'placement';
  available_to_all_departments?: boolean;
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
  const [batches, setBatches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department_id: '',
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

  const [bulkUploadModal, setBulkUploadModal] = useState<{
    open: boolean;
    file: File | null;
    uploading: boolean;
    errors?: string[];
    results?: {
      successful: Array<{ row: number; code: string; name: string; message: string }>;
      failed: Array<{ row: number; code: string; error: string }>;
      total: number;
    };
  }>({
    open: false,
    file: null,
    uploading: false,
  });

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    department_id: '',
    credits: 4,
    type: 'Theory',
    subject_category: 'academic', // 'academic', 'library', 'sports', 'placement'
    is_elective: false,
    is_laboratory: false,
    available_to_all_departments: false,
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
          if (Array.isArray(result.batches)) setBatches(result.batches);
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
      credits: 4,
      type: 'Theory',
      subject_category: 'academic',
      is_elective: false,
      is_laboratory: false,
      available_to_all_departments: false,
      status: 'active',
    });
    setFormModal({ open: true, mode: 'add' });
  };

  const handleEditClick = (subject: Subject) => {
    setFormData({
      code: subject.code,
      name: subject.name,
      description: subject.description || '',
      department_id: subject.department_id ? subject.department_id.toString() : '',
      credits: subject.credits,
      type: subject.type,
      subject_category: subject.code === 'LIB' || subject.name?.includes('Library') ? 'library' : 
                        subject.code === 'SPT' || subject.name?.includes('Sports') ? 'sports' :
                        subject.code === 'PLC' || subject.name?.includes('Placement') ? 'placement' : 'academic',
      is_elective: subject.is_elective,
      is_laboratory: subject.is_laboratory,
      available_to_all_departments: subject.available_to_all_departments || false,
      status: subject.status,
    });
    setFormModal({ open: true, mode: 'edit', data: subject });
  };

  const handleSubmit = async () => {
    try {
      // Validation - different rules for special subjects
      const isSpecialSubject = ['library', 'sports', 'placement'].includes(formData.subject_category);
      
      // Department is required if NOT assigning to all departments
      if (!formData.name) {
        toast.error('Please fill all required fields (Name)');
        return;
      }

      if (!formData.available_to_all_departments && (!formData.department_id || formData.department_id === '')) {
        toast.error('Please select a Department or check "Assign to All Departments"');
        return;
      }

      // For academic subjects, code and credits are required
      if (!isSpecialSubject && (!formData.code || formData.credits === null)) {
        toast.error('Subject Code and Credits are required for academic subjects');
        return;
      }

      const payload = {
        code: isSpecialSubject ? formData.subject_category.toUpperCase().substring(0, 3) : formData.code,
        name: formData.name,
        description: formData.description || null,
        department_id: formData.available_to_all_departments ? null : (formData.department_id ? parseInt(formData.department_id) : null),
        credits: isSpecialSubject ? 0 : parseInt(formData.credits.toString()),
        type: formData.type,
        subject_category: formData.subject_category,
        is_elective: formData.is_elective,
        is_laboratory: formData.is_laboratory,
        available_to_all_departments: formData.available_to_all_departments,
        status: formData.status,
      };

      console.log('📦 Payload being sent:', payload);

      // VALIDATION CRITERIA:
      // ✓ Same subject (code + name) CAN be allocated to different departments
      // ✗ Prevent exact duplicate: same code + name + department
      
      const exactDuplicate = subjects.find(s =>
        s.code.trim().toLowerCase() === payload.code.trim().toLowerCase() &&
        s.name.trim().toLowerCase() === payload.name.trim().toLowerCase() &&
        s.department_id === payload.department_id &&
        (formModal.mode === 'add' || s.id !== formModal.data?.id)
      );

      if (exactDuplicate) {
        toast.error(`"${payload.name}" (${payload.code}) already exists in this department`);
        return;
      }

      const url =
        formModal.mode === 'add'
          ? '/api/v1/admin/subjects'
          : `/api/v1/admin/subjects/${formModal.data?.id}`;

      console.log('🔵 SUBJECT SAVE payload:', payload, 'url:', url);
      const response = await fetch(url, {
        method: formModal.mode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('🔵 SUBJECT SAVE response:', result, 'Status:', response.status);
      
      if (!response.ok) {
        const errorMsg = result.error || result.message || `Server error (${response.status})`;
        console.error('❌ API Error:', errorMsg);
        toast.error(errorMsg);
        return;
      }

      if (result.success) {
        toast.success(formModal.mode === 'add' ? 'Subject created successfully' : 'Subject updated successfully');
        setFormModal({ open: false, mode: 'add' });
        fetchSubjects();
      } else {
        toast.error(result.error || 'Failed to save subject');
      }
    } catch (error: any) {
      console.error('❌ Exception:', error);
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

  const parseCSV = (text: string): Array<Record<string, any>> => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain headers and at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    // Accept either 'department' or 'department_id'
    const hasDepartmentInfo = headers.includes('department') || headers.includes('department_id');
    
    // Check for essential fields
    if (!headers.includes('name') || !headers.includes('code')) {
      throw new Error('Missing required columns: "name" and "code" are mandatory');
    }

    if (!hasDepartmentInfo) {
      throw new Error('Missing department info: provide either "department" (name) or "department_id" (numeric ID)');
    }

    const data: Array<Record<string, any>> = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, any> = {};

      headers.forEach((header, index) => {
        const value = values[index];
        // Convert string values to appropriate types
        if (header === 'department_id') {
          row[header] = value ? parseInt(value) : null;
        } else if (header === 'credits') {
          row[header] = value ? parseInt(value) : 0;
        } else if (header === 'is_elective' || header === 'is_laboratory') {
          row[header] = value?.toLowerCase() === 'true' || value === '1';
        } else if (header === 'department') {
          // Store department name for later resolution
          row['department_name'] = value || null;
        } else {
          row[header] = value || null;
        }
      });

      data.push(row);
    }

    return data;
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadModal.file) {
      toast.error('Please select a file');
      return;
    }

    try {
      setBulkUploadModal(prev => ({ ...prev, uploading: true, errors: [] }));

      const fileContent = await bulkUploadModal.file.text();
      const parsedSubjects = parseCSV(fileContent);

      if (parsedSubjects.length === 0) {
        const errorMsg = 'No valid subjects found in the file';
        toast.error(errorMsg);
        setBulkUploadModal(prev => ({ ...prev, uploading: false, errors: [errorMsg] }));
        return;
      }

      // Resolve department names to IDs
      const processedSubjects = parsedSubjects.map((subj, index) => {
        const processed = { ...subj };
        const errors: string[] = [];
        
        // If department name is provided, resolve it to ID
        if (processed.department_name) {
          const dept = departments.find(d => 
            d.full_name.toLowerCase() === processed.department_name.toLowerCase() ||
            d.short_name.toLowerCase() === processed.department_name.toLowerCase()
          );
          
          if (!dept) {
            errors.push(`Row ${index + 2}: Department "${processed.department_name}" not found. Available: ${departments.map(d => d.short_name).join(', ')}`);
          } else {
            processed.department_id = dept.id;
            delete processed.department_name;
          }
        }

        // Auto-generate code for special subjects if not provided
        if (!processed.code) {
          if (processed.name?.toLowerCase().includes('library')) {
            processed.code = 'LIB';
          } else if (processed.name?.toLowerCase().includes('sports')) {
            processed.code = 'SPT';
          } else if (processed.name?.toLowerCase().includes('placement')) {
            processed.code = 'PLC';
          } else {
            // For academic subjects, require code
            errors.push(`Row ${index + 2}: Subject code is required for "${processed.name}"`);
          }
        }

        // Set default credits to 0 for special subjects
        if (!processed.credits && ['LIB', 'SPT', 'PLC'].includes(processed.code)) {
          processed.credits = 0;
        }

        // Store errors if any
        if (errors.length > 0) {
          processed._rowErrors = errors;
        }

        return processed;
      });

      // Separate rows with errors
      const rowsWithErrors = processedSubjects.filter(s => s._rowErrors && s._rowErrors.length > 0);
      const validRows = processedSubjects.filter(s => !s._rowErrors || s._rowErrors.length === 0);

      if (rowsWithErrors.length > 0) {
        const errorMessages = rowsWithErrors.flatMap(s => s._rowErrors || []);
        setBulkUploadModal(prev => ({ ...prev, uploading: false, errors: errorMessages }));
        
        toast.error(`⚠️ Found ${errorMessages.length} validation error(s) in CSV file`);
        return;
      }

      const response = await fetch('/api/v1/admin/subjects/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: validRows }),
      });

      const result = await response.json();

      if (result.success) {
        const successCount = result.data.successful.length;
        const failCount = result.data.failed.length;
        
        setBulkUploadModal(prev => ({
          ...prev,
          results: result.data,
          uploading: false,
        }));
        
        if (failCount === 0) {
          toast.success(`✓ All ${successCount} subjects uploaded successfully!`);
        } else {
          toast.warning(`⚠️ ${successCount} successful, ${failCount} failed`);
        }
        
        // Refetch subjects after successful upload
        setTimeout(() => {
          fetchSubjects();
        }, 1000);
      } else {
        const errorMsg = result.error || 'Failed to upload subjects';
        toast.error(errorMsg);
        setBulkUploadModal(prev => ({ ...prev, uploading: false, errors: [errorMsg] }));
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error processing CSV file';
      toast.error(`❌ ${errorMsg}`);
      setBulkUploadModal(prev => ({ ...prev, uploading: false, errors: [errorMsg] }));
    }
  };

  const downloadTemplate = () => {
    const template = `code,name,department,credits,type,is_elective,is_laboratory,status
CS101,Programming Fundamentals,Computer Science,4,Theory,false,false,active
CS102,Data Structures,Computer Science,4,Theory,false,false,active
CS201,Database Management,Computer Science,4,Practical,false,true,active
IT102,Web Development,Information Technology,3,Practical,false,true,active
CS301,Theory of Computation,Computer Science,4,Theory,false,false,active
CS305,Design Patterns,Computer Science,4,Practical,true,false,active
LIB,Library Services,Computer Science,0,Seminar,false,false,active
SPT,Sports Activities,Computer Science,0,Seminar,false,false,active
PLC,Placement Drive,Computer Science,0,Seminar,false,false,active`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'subjects_template.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Subject Management</h1>
            <div className="flex flex-wrap justify-start gap-2 md:justify-end">
              <Button
                onClick={() => setBulkUploadModal({ ...bulkUploadModal, open: true })}
                className="bg-green-600 hover:bg-green-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
              <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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
                <table className="w-full min-w-[900px] table-auto">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Code</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Department</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Credits</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Lab</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {subjects.map(subject => (
                      <tr key={subject.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{subject.code}</td>
                        <td className="px-6 py-3 text-sm text-gray-600 max-w-[240px] truncate" title={subject.name}>{subject.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap">{subject.department?.short_name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap">{subject.type}</td>
                        <td className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap">{subject.credits}</td>
                        <td className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {subject.is_laboratory ? '✓ Lab' : '—'}
                        </td>
                        <td className="px-6 py-3 text-sm whitespace-nowrap">
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
                            title="Edit subject"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ open: true, data: subject })}
                            className="text-red-600 hover:text-red-900"
                            title="Delete subject"
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
              <h2 className="text-xl font-bold mb-4">{formModal.mode === 'add' ? 'Add Subject' : 'Edit Subject'}</h2>

              {formModal.mode === 'add' && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">✓ Note:</span> Subjects with the same code and name can be allocated to different departments and semesters. Only exact duplicates (same code + name + department + semester) are prevented.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Category *</label>
                  <Select value={formData.subject_category} onValueChange={(value) => {
                    setFormData({ 
                      ...formData, 
                      subject_category: value as any,
                      code: value !== 'academic' ? value.toUpperCase().substring(0, 3) : formData.code,
                      credits: value !== 'academic' ? 0 : formData.credits
                    });
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic (Theory/Practical)</SelectItem>
                      <SelectItem value="library">Library Services</SelectItem>
                      <SelectItem value="sports">Sports Activities</SelectItem>
                      <SelectItem value="placement">Placement & Internship</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.subject_category !== 'academic' ? '✓ Code will be auto-generated (LIB/SPT/PLC)' : 'Requires manual code entry'}
                  </p>
                </div>

                {formData.subject_category === 'academic' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code *</label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g., CS101"
                    />
                  </div>
                )}

                <div className={formData.subject_category === 'academic' ? '' : 'md:col-span-2'}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Programming Fundamentals"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <Select 
                    value={formData.department_id} 
                    onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                    disabled={formData.available_to_all_departments}
                  >
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
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="assign-all-depts"
                    checked={formData.available_to_all_departments}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      available_to_all_departments: e.target.checked,
                      department_id: e.target.checked ? '' : formData.department_id
                    })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="assign-all-depts" className="text-sm font-medium text-gray-700">
                    Assign to All Departments
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits (1-10) *</label>
                  <Input
                    type="number"
                    value={String(formData.credits || '')}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ 
                        ...formData, 
                        credits: value === '' ? 0 : parseInt(value) || 0
                      });
                    }}
                    min="1"
                    max="10"
                    placeholder="e.g., 4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
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
                </div>

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
                    <span>Lab (Dept Admin adds lab name)</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">ℹ️ Note:</span> Semester, academic year, batch, and lab names are handled by department admins during subject allocation and faculty assignment.
                </p>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={handleSubmit}
                  disabled={!formData.name || (!formData.department_id && !formData.available_to_all_departments)}
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

      {/* Bulk Upload Modal */}
      {bulkUploadModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Bulk Upload Subjects</h2>

              {bulkUploadModal.results || bulkUploadModal.errors ? (
                // Show results or errors
                <div className="space-y-4">
                  {bulkUploadModal.errors && bulkUploadModal.errors.length > 0 && (
                    <div className="bg-red-50 border-2 border-red-300 rounded p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-red-600 font-bold text-xl">❌</div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-red-900 mb-2">CSV Validation Errors Found:</p>
                          <div className="bg-white border border-red-200 rounded max-h-64 overflow-y-auto">
                            {bulkUploadModal.errors.map((error, idx) => (
                              <div key={idx} className="p-3 border-b border-red-100 text-sm text-red-800 last:border-b-0">
                                <p className="font-medium">• {error}</p>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-red-700 mt-3 font-semibold">Please fix the errors above and upload again.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {bulkUploadModal.results && (
                    <>
                      <div className={`border rounded p-4 ${bulkUploadModal.results.failed.length === 0 ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
                        <p className={`text-sm font-bold ${bulkUploadModal.results.failed.length === 0 ? 'text-green-900' : 'text-yellow-900'}`}>
                          {bulkUploadModal.results.failed.length === 0 
                            ? `✓ Upload Complete: ${bulkUploadModal.results.successful.length}/${bulkUploadModal.results.total} subjects uploaded successfully!`
                            : `⚠️ Upload Summary: ${bulkUploadModal.results.successful.length} successful, ${bulkUploadModal.results.failed.length} failed out of ${bulkUploadModal.results.total} total`
                          }
                        </p>
                      </div>

                      {bulkUploadModal.results.successful.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-green-700 mb-2">✓ Successful uploads ({bulkUploadModal.results.successful.length}):</h3>
                          <div className="bg-green-50 border border-green-200 rounded max-h-48 overflow-y-auto">
                            {bulkUploadModal.results.successful.map((item, idx) => (
                              <div key={idx} className="p-3 border-b border-green-200 text-sm text-gray-700 last:border-b-0">
                                <span className="font-medium text-green-900">{item.code}</span> - {item.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {bulkUploadModal.results.failed.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-red-700 mb-2">❌ Failed uploads ({bulkUploadModal.results.failed.length}):</h3>
                          <div className="bg-red-50 border-2 border-red-300 rounded max-h-48 overflow-y-auto">
                            {bulkUploadModal.results.failed.map((item, idx) => (
                              <div key={idx} className="p-3 border-b border-red-200 text-sm last:border-b-0">
                                <span className="font-bold text-red-900">Row {item.row}: {item.code || 'N/A'}</span>
                                <p className="text-red-700 text-xs mt-1">Error: {item.error}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="mt-6 flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setBulkUploadModal({ open: false, file: null, uploading: false })}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                // Show upload form
                <div className="space-y-4">
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 relative cursor-pointer hover:bg-gray-100 transition">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setBulkUploadModal({ ...bulkUploadModal, file: e.target.files?.[0] || null })}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      id="csv-input"
                    />
                    <label htmlFor="csv-input" className="cursor-pointer">
                      <div className="text-center pointer-events-none">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Drag and drop your CSV file here</p>
                        <p className="text-xs text-gray-500 mt-1">or click to select from your computer</p>
                        <span className="text-blue-600 hover:text-blue-700 underline text-sm mt-2 inline-block">Select CSV file</span>
                      </div>
                    </label>
                  </div>

                  {bulkUploadModal.file && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm text-blue-900">
                        Selected file: <span className="font-semibold">{bulkUploadModal.file.name}</span>
                      </p>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <p className="text-sm font-semibold text-yellow-900 mb-2">✓ Required CSV Columns:</p>
                    <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                      <li><span className="font-semibold">code</span> - Subject code (e.g., CS101 for academic, LIB/SPT/PLC for special)</li>
                      <li><span className="font-semibold">name</span> - Subject name (required)</li>
                      <li><span className="font-semibold">department</span> - Department name (e.g., "Computer Science", "IT") - <span className="font-bold text-blue-900">Use department name, NOT ID!</span></li>
                      <li><span className="font-semibold">credits</span> - Credit hours 1-10 (0 for Library/Sports/Placement)</li>
                    </ul>
                    <p className="text-xs text-yellow-800 mt-3 font-semibold mb-2">Optional Columns:</p>
                    <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                      <li><span className="font-semibold">type</span> - "Theory", "Practical", "Theory+Practical", "Project", "Seminar", "Internship" (optional)</li>
                      <li><span className="font-semibold">is_elective</span> - true/false (optional)</li>
                      <li><span className="font-semibold">is_laboratory</span> - true/false (for Lab subjects - leave empty; dept admin adds lab name)</li>
                      <li><span className="font-semibold">status</span> - "active", "inactive", "archived" (default: active)</li>
                    </ul>
                    <p className="text-xs bg-blue-100 text-blue-900 p-2 rounded mt-3 font-semibold">📋 Note: Semester, Academic Year, and Batch are handled by Department Admins during faculty allocation. Just add the subject details here!</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <p className="text-sm font-semibold text-green-700 mb-2">✓ Subject Management Workflow:</p>
                    <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
                      <li><span className="font-semibold">SuperAdmin:</span> Adds generic subject details (code, name, type, credits)</li>
                      <li><span className="font-semibold">Dept Admin:</span> Maps subjects to semesters, assigns faculty, adds lab names</li>
                      <li>Lab subjects: Leave lab_name empty here → Department admin fills it during allocation</li>
                      <li>Same subject can exist in multiple departments with different mapping details</li>
                    </ul>
                  </div>

                  <div className="mt-6 flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={downloadTemplate}
                    >
                      Download Template
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setBulkUploadModal({ open: false, file: null, uploading: false, results: undefined })}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      onClick={handleBulkUpload}
                      disabled={!bulkUploadModal.file || bulkUploadModal.uploading}
                    >
                      {bulkUploadModal.uploading ? 'Uploading...' : 'Upload Subjects'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
