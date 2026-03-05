import { useEffect, useState } from 'react';
import { toast } from '@/pages/admin/department-admin/components/ui/sonner';
import { Users, Plus, Edit, Trash2, Save, X, ChevronDown } from 'lucide-react';
import { MainLayout } from '@/pages/admin/department-admin/components/layout/MainLayout';
import { motion } from 'framer-motion';

interface Faculty {
  faculty_id: number;
  Name: string;
  email: string;
  designation: string;
}

interface ClassInfo {
  id: number;
  name: string;
  section: string;
  semester: number;
  batch: string;
  capacity: number;
}

interface ClassIncharge {
  id: number;
  class_id: number;
  faculty_id: number;
  academic_year: string;
  status: 'active' | 'inactive';
  class: ClassInfo;
  faculty: Faculty;
}

interface ClassStudent {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  semester: number;
}

export default function ClassInchargeManagement() {
  const [incharges, setIncharges] = useState<ClassIncharge[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingIncharge, setEditingIncharge] = useState<ClassIncharge | null>(null);
  const [expandedIncharge, setExpandedIncharge] = useState<number | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [semester, setSemester] = useState('');
  const [newAssignment, setNewAssignment] = useState({
    class_id: '',
    faculty_id: '',
    academic_year: '2024-25'
  });

  useEffect(() => {
    fetchIncharges();
    fetchFaculty();
  }, [academicYear, semester]);

  const fetchIncharges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      if (academicYear) params.append('academic_year', academicYear);
      if (semester) params.append('semester', semester);

      const response = await fetch(`/api/v1/department-admin/class-incharges?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) throw new Error('Failed to fetch incharges');

      const data = await response.json();
      setIncharges(data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load class incharges');
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/department-admin/allocation-faculty', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFaculty(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchClassStudents = async (inchargeId: number) => {
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/department-admin/class-incharges/${inchargeId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch students');

      const data = await response.json();
      setClassStudents(data.data.students);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAssignIncharge = async (inchargeData?: Partial<ClassIncharge>) => {
    try {
      const token = localStorage.getItem('authToken');
      const payload = inchargeData || newAssignment;

      if (!payload.class_id || !payload.faculty_id || !payload.academic_year) {
        toast.error('Please select class and faculty');
        return;
      }

      const method = editingIncharge ? 'PUT' : 'POST';
      const url = editingIncharge 
        ? `/api/v1/department-admin/class-incharges/${editingIncharge.id}`
        : '/api/v1/department-admin/class-incharges';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign incharge');
      }

      toast.success(editingIncharge ? 'Incharge updated' : 'Incharge assigned successfully');
      setShowAssignModal(false);
      setEditingIncharge(null);
      setNewAssignment({ class_id: '', faculty_id: '', academic_year: '2024-25' });
      fetchIncharges();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteIncharge = async (inchargeId: number) => {
    if (!confirm('Are you sure you want to remove this incharge?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/department-admin/class-incharges/${inchargeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete incharge');

      toast.success('Incharge removed successfully');
      fetchIncharges();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleClassStudents = async (inchargeId: number) => {
    if (expandedIncharge === inchargeId) {
      setExpandedIncharge(null);
      setClassStudents([]);
    } else {
      setExpandedIncharge(inchargeId);
      await fetchClassStudents(inchargeId);
    }
  };

  const handleEditStart = (incharge: ClassIncharge) => {
    setEditingIncharge(incharge);
    setNewAssignment({
      class_id: incharge.class_id.toString(),
      faculty_id: incharge.faculty_id.toString(),
      academic_year: incharge.academic_year
    });
    setShowAssignModal(true);
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="page-header font-serif">Class Incharge Management</h1>
            <p className="text-muted-foreground -mt-4">Assign class incharges for all semester classes</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingIncharge(null);
            setNewAssignment({ class_id: '', faculty_id: '', academic_year });
            setShowAssignModal(true);
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          Assign Incharge
        </button>
      </motion.div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-6 bg-muted/40 rounded-lg border border-border">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Academic Year
          </label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
          >
            <option value="2024-25">2024-25</option>
            <option value="2023-24">2023-24</option>
            <option value="2025-26">2025-26</option>
            <option value="2026-27">2026-27</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Semester (Optional)
          </label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Incharges List */}
      <div className="widget-card space-y-4">
        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading incharges...</div>
        ) : incharges.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No class incharges assigned yet</div>
        ) : (
          incharges.map((incharge) => (
            <div key={incharge.id} className="border border-slate-700 rounded-lg p-4 hover:bg-slate-700/30 transition-colors">
              {/* Incharge Header */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium text-white">
                        {incharge.class.name} - {incharge.class.section}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Semester {incharge.class.semester} • Batch {incharge.class.batch}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-slate-300">
                      <span className="font-medium">Incharge:</span> {incharge.faculty.Name} ({incharge.faculty.designation})
                    </p>
                    <p className="text-xs text-slate-400">{incharge.faculty.email}</p>
                    <p className="text-xs text-slate-400">Academic Year: {incharge.academic_year}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleClassStudents(incharge.id)}
                    className="text-blue-400 hover:text-blue-300 transition-colors p-2"
                  >
                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedIncharge === incharge.id ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleEditStart(incharge)}
                    className="text-blue-400 hover:text-blue-300 transition-colors p-2"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteIncharge(incharge.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Students List - Expanded */}
              {expandedIncharge === incharge.id && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  {loadingStudents ? (
                    <div className="text-center py-4 text-slate-400">Loading students...</div>
                  ) : classStudents.length === 0 ? (
                    <div className="text-center py-4 text-slate-400">No students in this class</div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-300 mb-3">
                        Total Students: {classStudents.length}
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-600">
                              <th className="text-left px-3 py-2 text-slate-400">Student ID</th>
                              <th className="text-left px-3 py-2 text-slate-400">Name</th>
                              <th className="text-left px-3 py-2 text-slate-400">Email</th>
                              <th className="text-left px-3 py-2 text-slate-400">Phone</th>
                              <th className="text-left px-3 py-2 text-slate-400">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classStudents.map((student) => (
                              <tr key={student.id} className="border-b border-slate-700 hover:bg-slate-700/20">
                                <td className="px-3 py-2 text-slate-300">{student.studentId}</td>
                                <td className="px-3 py-2 text-slate-300">
                                  {student.firstName} {student.lastName}
                                </td>
                                <td className="px-3 py-2 text-slate-400">{student.email}</td>
                                <td className="px-3 py-2 text-slate-400">{student.phone || '-'}</td>
                                <td className="px-3 py-2">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                    student.status === 'active'
                                      ? 'bg-green-900/30 text-green-400'
                                      : 'bg-gray-900/30 text-gray-400'
                                  }`}>
                                    {student.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">
                {editingIncharge ? 'Update Class Incharge' : 'Assign Class Incharge'}
              </h3>
              <p className="text-slate-400 text-sm">Select class and faculty for incharge assignment</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAssignIncharge(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Academic Year *
                </label>
                <select
                  value={newAssignment.academic_year}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, academic_year: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  disabled={!!editingIncharge}
                >
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                  <option value="2025-26">2025-26</option>
                </select>
              </div>

              {!editingIncharge && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Class *
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="Select class from assignment page"
                    value={newAssignment.class_id}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Faculty Incharge *
                </label>
                <select
                  value={newAssignment.faculty_id}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, faculty_id: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">Select Faculty</option>
                  {faculty.map((fac) => (
                    <option key={fac.faculty_id} value={fac.faculty_id}>
                      {fac.Name} - {fac.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {editingIncharge ? 'Update' : 'Assign'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setEditingIncharge(null);
                  }}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
