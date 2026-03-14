import { useEffect, useState } from 'react';
import { toast } from '@/pages/admin/department-admin/components/ui/sonner';
import { Users, Plus, Edit, Trash2, Save, X, ChevronDown } from 'lucide-react';
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

interface ClassInchargeManagementProps {
  hideHeader?: boolean;
}

export default function ClassInchargeManagement({ hideHeader }: ClassInchargeManagementProps) {
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
    <div>
      {!hideHeader && (
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
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-6 bg-muted/40 rounded-xl border border-border">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Academic Year
          </label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="2024-25">2024-25</option>
            <option value="2023-24">2023-24</option>
            <option value="2025-26">2025-26</option>
            <option value="2026-27">2026-27</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Semester (Optional)
          </label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : incharges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-14 w-14 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground text-lg">No class incharges assigned yet</p>
            <p className="text-muted-foreground/70 text-sm mt-1">Click "Assign Incharge" to get started</p>
          </div>
        ) : (
          incharges.map((incharge) => (
            <motion.div
              key={incharge.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all bg-card"
            >
              {/* Incharge Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-base">
                        {incharge.class.name} — {incharge.class.section}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Semester {incharge.class.semester} • Batch {incharge.class.batch}
                      </p>
                    </div>
                  </div>

                  <div className="ml-13 grid grid-cols-1 sm:grid-cols-2 gap-2 ml-0 pl-13">
                    <div className="bg-muted/40 rounded-lg px-4 py-2 border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Incharge Faculty</p>
                      <p className="text-sm font-semibold text-foreground">{incharge.faculty.Name}</p>
                      <p className="text-xs text-muted-foreground">{incharge.faculty.designation}</p>
                    </div>
                    <div className="bg-muted/40 rounded-lg px-4 py-2 border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Contact</p>
                      <p className="text-sm text-foreground">{incharge.faculty.email}</p>
                      <p className="text-xs text-muted-foreground">Academic Year: {incharge.academic_year}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => toggleClassStudents(incharge.id)}
                    className="text-primary hover:text-primary/80 transition-colors p-2 rounded-lg hover:bg-primary/10"
                    title="View students"
                  >
                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedIncharge === incharge.id ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleEditStart(incharge)}
                    className="text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteIncharge(incharge.id)}
                    className="text-red-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Students List - Expanded */}
              {expandedIncharge === incharge.id && (
                <div className="mt-5 pt-4 border-t border-border">
                  {loadingStudents ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    </div>
                  ) : classStudents.length === 0 ? (
                    <p className="text-center py-6 text-muted-foreground text-sm">No students in this class</p>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-foreground text-sm">
                          Students ({classStudents.length})
                        </h4>
                      </div>
                      <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="min-w-full text-sm">
                          <thead className="bg-muted/40">
                            <tr>
                              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Student ID</th>
                              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone</th>
                              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {classStudents.map((student) => (
                              <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-2.5 font-mono text-sm text-foreground">{student.studentId}</td>
                                <td className="px-4 py-2.5 text-foreground font-medium">
                                  {student.firstName} {student.lastName}
                                </td>
                                <td className="px-4 py-2.5 text-muted-foreground">{student.email}</td>
                                <td className="px-4 py-2.5 text-muted-foreground">{student.phone || '—'}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    student.status === 'active'
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                      : 'bg-muted text-muted-foreground'
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
            </motion.div>
          ))
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border p-6 rounded-xl shadow-xl w-full max-w-md mx-auto"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground mb-1">
                {editingIncharge ? 'Update Class Incharge' : 'Assign Class Incharge'}
              </h3>
              <p className="text-muted-foreground text-sm">Select class and faculty for incharge assignment</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAssignIncharge(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Academic Year *
                </label>
                <select
                  value={newAssignment.academic_year}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, academic_year: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!!editingIncharge}
                >
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                  <option value="2025-26">2025-26</option>
                </select>
              </div>

              {!editingIncharge && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Class *
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="Select class from assignment page"
                    value={newAssignment.class_id}
                    className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-muted-foreground focus:outline-none cursor-not-allowed"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Faculty Incharge *
                </label>
                <select
                  value={newAssignment.faculty_id}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, faculty_id: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 px-4 rounded-lg font-medium transition-colors"
                >
                  {editingIncharge ? 'Update' : 'Assign'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setEditingIncharge(null);
                  }}
                  className="flex-1 bg-muted hover:bg-muted/80 text-foreground border border-border py-2.5 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
