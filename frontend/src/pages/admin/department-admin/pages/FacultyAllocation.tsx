import { useState, useEffect } from 'react';
import { Input } from '@/pages/admin/department-admin/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Edit2, Save, X, Users, BookOpen } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { generateAcademicYears, getCurrentAcademicYear } from '@/utils/academicYear';
import { useAuth } from '@/contexts/AuthContext';

interface TimetableAllocation {
  id: number;
  day: string;
  hour: number;
  subject: string;
  section: string;
  year: number;
}

interface FacultyGroup {
  facultyId: string;
  facultyName: string;
  department: string;
  academicYear: string;
  allocations: TimetableAllocation[];
}

interface EditingState {
  id: number;
  field: 'facultyName' | 'subject';
  value: string;
}

export default function FacultyAllocationPage() {
  const { authToken } = useAuth();
  const [facultyGroups, setFacultyGroups] = useState<FacultyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [editingCell, setEditingCell] = useState<EditingState | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Fetch timetable allocations
  useEffect(() => {
    fetchTimetableAllocations();
  }, [academicYear]);

  const fetchTimetableAllocations = async () => {
    try {
      setLoading(true);
      const token = authToken || localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/department-admin/faculty-allocations/timetable-list?academic_year=${academicYear}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const result = await response.json();
      if (result.success) {
        setFacultyGroups(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch allocations');
      }
    } catch (error) {
      console.error('Error fetching timetable allocations:', error);
      toast.error('Failed to fetch allocations');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (id: number, field: 'facultyName' | 'subject', currentValue: string) => {
    setEditingCell({ id, field, value: currentValue });
  };

  const handleSaveEdit = async (allocationId: number) => {
    if (!editingCell) return;

    try {
      setSavingId(allocationId);
      const token = authToken || localStorage.getItem('authToken');

      const updatePayload: any = {};
      updatePayload[editingCell.field] = editingCell.value;

      const response = await fetch(`/api/v1/department-admin/faculty-allocations/timetable/${allocationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(updatePayload)
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`${editingCell.field === 'facultyName' ? 'Faculty name' : 'Subject'} updated successfully`);
        fetchTimetableAllocations();
        setEditingCell(null);
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch (error) {
      console.error('Error saving edit:', error);
      toast.error('Failed to save changes');
    } finally {
      setSavingId(null);
    }
  };

  const handleCancel = () => {
    setEditingCell(null);
  };

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <MainLayout>
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  Faculty Timetable Allocations
                </h1>
                <p className="text-gray-600 mt-1">View and edit faculty-subject allocations from uploaded timetables</p>
              </div>
            </div>

            {/* Academic Year Filter */}
            <div className="bg-white rounded-lg shadow-md p-4 w-64">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {generateAcademicYears().map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Faculty</p>
                  <p className="text-2xl font-bold text-gray-900">{facultyGroups.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Allocations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {facultyGroups.reduce((sum, g) => sum + g.allocations.length, 0)}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Allocations by Faculty */}
          <div className="space-y-6">
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">Loading allocations...</p>
              </div>
            ) : facultyGroups.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No allocations found for this academic year</p>
              </div>
            ) : (
              facultyGroups.map((group) => (
                <div key={group.facultyId} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Faculty Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold">{group.facultyName}</span>
                        </div>
                        <p className="text-blue-100 text-sm mt-1">ID: {group.facultyId}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-blue-100">{group.allocations.length} periods</p>
                        <p className="text-blue-200 text-xs">{group.academicYear}</p>
                      </div>
                    </div>
                  </div>

                  {/* Allocations Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Day</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hour</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {group.allocations
                          .sort((a, b) => {
                            const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
                            return dayDiff !== 0 ? dayDiff : a.hour - b.hour;
                          })
                          .map((alloc) => (
                            <tr key={alloc.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{alloc.day}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
                                  Period {alloc.hour}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {editingCell?.id === alloc.id && editingCell?.field === 'subject' ? (
                                  <Input
                                    autoFocus
                                    value={editingCell.value}
                                    onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                    className="w-full px-2 py-1 text-sm rounded"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') handleSaveEdit(alloc.id);
                                    }}
                                    onBlur={() => handleSaveEdit(alloc.id)}
                                  />
                                ) : (
                                  <span className="font-medium">{alloc.subject}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {alloc.section || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{alloc.year}</td>
                              <td className="px-4 py-3 text-sm text-center">
                                {editingCell?.id === alloc.id ? (
                                  <div className="flex justify-center gap-2">
                                    <button
                                      onClick={() => handleSaveEdit(alloc.id)}
                                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                      disabled={savingId === alloc.id}
                                      title="Save changes"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={handleCancel}
                                      className="text-red-600 hover:text-red-900"
                                      title="Cancel edit"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleEditStart(alloc.id, 'subject', alloc.subject)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Edit subject"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
