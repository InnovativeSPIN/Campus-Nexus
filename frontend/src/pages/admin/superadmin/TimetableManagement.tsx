import { useState, useEffect } from 'react';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { Button } from '@/pages/admin/superadmin/components/ui/button';
import { Input } from '@/pages/admin/superadmin/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/pages/admin/superadmin/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Plus, Upload, Eye, Edit2, Trash2, AlertCircle } from 'lucide-react';

interface Timetable {
  id: number;
  name: string;
  academic_year: string;
  semester: 'odd' | 'even';
  department_id: number;
  year?: '1st' | '2nd' | '3rd' | '4th';
  status: 'draft' | 'pending_approval' | 'active' | 'inactive';
  department?: { short_name: string };
  created_at: string;
}

interface Department {
  id: number;
  short_name: string;
  full_name: string;
}

export default function TimetableManagement() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [pendingAlterations, setPendingAlterations] = useState([]);
  
  const [filters, setFilters] = useState({
    department_id: '',
    academic_year: '',
    semester: '',
    year: '',
    status: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    academic_year: new Date().getFullYear().toString(),
    semester: 'odd',
    department_id: '',
    year: ''
  });

  const [bulkUploadData, setBulkUploadData] = useState<{
    file: File | null;
    timetable_id: number | null;
    uploading: boolean;
  }>({
    file: null,
    timetable_id: null,
    uploading: false
  });

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/v1/departments');
        const result = await response.json();
        if (result.success) {
          setDepartments(result.data);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch timetables
  useEffect(() => {
    fetchTimetables();
  }, [filters]);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.department_id) params.append('department_id', filters.department_id);
      if (filters.academic_year) params.append('academic_year', filters.academic_year);
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.year) params.append('year', filters.year);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/v1/timetable-management?${params}`);
      const result = await response.json();
      if (result.success) {
        setTimetables(result.data);
      }

      // Fetch pending alterations
      const alterResponse = await fetch('/api/v1/timetable-management/staff-alterations/pending');
      const alterResult = await alterResponse.json();
      if (alterResult.success) {
        setPendingAlterations(alterResult.data);
      }
    } catch (error) {
      console.error('Error fetching timetables:', error);
      toast.error('Failed to fetch timetables');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTimetable = async () => {
    try {
      if (!formData.name || !formData.department_id) {
        toast.error('Please fill required fields');
        return;
      }

      const response = await fetch('/api/v1/timetable-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          department_id: parseInt(formData.department_id)
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Timetable created successfully');
        setShowCreateModal(false);
        fetchTimetables();
        setFormData({
          name: '',
          academic_year: new Date().getFullYear().toString(),
          semester: 'odd',
          department_id: '',
          year: ''
        });
      } else {
        toast.error(result.error || 'Failed to create timetable');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error creating timetable');
    }
  };

  const downloadTemplate = () => {
    const template = `class_id,day_of_week,period_number,subject_id,faculty_id,room_number,period_type,is_break
1,Monday,1,101,1,101A,lecture,false
1,Monday,2,101,1,101A,lecture,false
1,Monday,3,,,,break,true
1,Monday,4,102,2,101A,lecture,false`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'timetable_template.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header with Notifications */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Timetable Management</h1>
              <div className="flex gap-2">
                <Button onClick={() => setShowBulkUploadModal(true)} className="bg-green-600 hover:bg-green-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Upload
                </Button>
                <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Timetable
                </Button>
              </div>
            </div>

            {/* Pending Alterations Alert */}
            {pendingAlterations.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-900">Pending Staff Alterations</h3>
                    <p className="text-sm text-yellow-800 mt-1">
                      You have {pendingAlterations.length} pending staff alteration request(s) awaiting response.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

              <Input
                type="text"
                placeholder="Academic Year (e.g., 2024-2025)"
                value={filters.academic_year}
                onChange={(e) => setFilters({ ...filters, academic_year: e.target.value })}
              />

              <Select value={filters.semester} onValueChange={(value) => setFilters({ ...filters, semester: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="odd">Odd</SelectItem>
                  <SelectItem value="even">Even</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.year} onValueChange={(value) => setFilters({ ...filters, year: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st Year</SelectItem>
                  <SelectItem value="2nd">2nd Year</SelectItem>
                  <SelectItem value="3rd">3rd Year</SelectItem>
                  <SelectItem value="4th">4th Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timetables Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Loading timetables...</div>
            ) : timetables.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No timetables found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Academic Year</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Semester</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {timetables.map(timetable => (
                      <tr key={timetable.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{timetable.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{timetable.department?.short_name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{timetable.year || '-'}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{timetable.academic_year}</td>
                        <td className="px-6 py-3 text-sm text-gray-600 capitalize">{timetable.semester}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            timetable.status === 'active' ? 'bg-green-100 text-green-800' :
                            timetable.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            timetable.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {timetable.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm flex gap-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-orange-600 hover:text-orange-900">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
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

      {/* Create Timetable Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Create New Timetable</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., CSE A - Semester 6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                  <Input
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    placeholder="e.g., 2024-2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                  <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value as 'odd' | 'even' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="odd">Odd</SelectItem>
                      <SelectItem value="even">Even</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year (Optional)</label>
                  <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st">1st Year</SelectItem>
                      <SelectItem value="2nd">2nd Year</SelectItem>
                      <SelectItem value="3rd">3rd Year</SelectItem>
                      <SelectItem value="4th">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateTimetable}>
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Bulk Upload Timetable</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Timetable *</label>
                  <Select value={bulkUploadData.timetable_id?.toString() || ''} onValueChange={(value) => setBulkUploadData({ ...bulkUploadData, timetable_id: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Timetable" />
                    </SelectTrigger>
                    <SelectContent>
                      {timetables.filter(t => t.status === 'draft').map(timetable => (
                        <SelectItem key={timetable.id} value={timetable.id.toString()}>
                          {timetable.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setBulkUploadData({ ...bulkUploadData, file: e.target.files?.[0] || null })}
                    className="hidden"
                    id="csv-input"
                  />
                  <label htmlFor="csv-input" className="cursor-pointer block">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Select CSV file</p>
                      {bulkUploadData.file && (
                        <p className="text-xs text-green-600 mt-2">✓ {bulkUploadData.file.name}</p>
                      )}
                    </div>
                  </label>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
                  <p className="font-semibold mb-2">CSV Columns Required:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• class_id, day_of_week, period_number</li>
                    <li>• Optional: subject_id, faculty_id, room_number, period_type, is_break</li>
                  </ul>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <Button variant="outline" onClick={downloadTemplate}>
                    Download Template
                  </Button>
                  <Button variant="outline" onClick={() => setShowBulkUploadModal(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700" disabled={!bulkUploadData.file || !bulkUploadData.timetable_id}>
                    Upload
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
