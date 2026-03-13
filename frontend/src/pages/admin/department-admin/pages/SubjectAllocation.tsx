import { useEffect, useState } from 'react';
import { toast } from '@/pages/admin/department-admin/components/ui/sonner';
import { MainLayout } from '@/pages/admin/department-admin/components/layout/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, Trash2, Users, X, Search,
  GraduationCap, FlaskConical, Building2
} from 'lucide-react';

// ─────────────────────── Types ───────────────────────────────────────────────

interface Department {
  id: number;
  short_name: string;
  full_name: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  subject_name?: string;
  subject_code?: string;
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
  status: string;
  assignedFaculty?: AssignedFaculty[];
}

interface FacultyOption {
  faculty_id: number;
  Name: string;
  email: string;
  designation: string;
  department_id: number;
  department?: { id: number; short_name: string; full_name: string };
}

interface AssignedFaculty {
  faculty_id: number;
  Name: string;
  email: string;
  designation: string;
  department_id?: number;
  FacultySubjectAssignment?: {
    id: number;
    academic_year: string;
    semester: number;
    class_id?: number;
    total_hours: number;
    no_of_periods: number;
    status: string;
  };
}

interface ClassOption {
  id: number;
  name: string;
  semester: number;
  batch: string;
  capacity?: number;
  room?: string;
}

interface AllocationFormState {
  subject_id: string;
  faculty_id: string;
  class_id: string;
  year: string;            // year of study (1,2,3...)
  academic_year: string;   // academic year range
  semester: string;
  total_hours: string;
  no_of_periods: string;
  batch: string;           // batch year
}

// ─────────────────────── Component ───────────────────────────────────────────

export default function SubjectAllocation() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<FacultyOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'subjects' | 'allocations'>('subjects');

  // Allocations list
  const [allocations, setAllocations] = useState<any[]>([]);
  const [allocLoading, setAllocLoading] = useState(false);

  // Filters
  const [subjectFilters, setSubjectFilters] = useState({ semester: '', status: 'active', search: '' });
  const [allocFilters, setAllocFilters] = useState({ semester: '', academic_year: '' });

  // Modals
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [allocatingSubject, setAllocatingSubject] = useState<Subject | null>(null);
  const [allocForm, setAllocForm] = useState<AllocationFormState>({
    subject_id: '',
    faculty_id: '',
    class_id: '',
    year: '',
    academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    semester: '',
    total_hours: '45',
    no_of_periods: '3',
    batch: new Date().getFullYear().toString(),
  });
  const [facultyDeptFilter, setFacultyDeptFilter] = useState('all');
  const [saving, setSaving] = useState(false);

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const token = () => localStorage.getItem('authToken') || '';

  const apiFetch = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token()}`,
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
    });
    return res.json();
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subjectFilters.semester) params.append('semester', subjectFilters.semester);
      if (subjectFilters.status) params.append('status', subjectFilters.status);
      const data = await apiFetch(`/api/v1/department-admin/subjects?${params}`);
      if (data.success) {
        setSubjects(data.data);
      } else {
        console.error('Failed to fetch subjects', data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
    finally { setLoading(false); }
  };

  const fetchAllocations = async () => {
    setAllocLoading(true);
    try {
      const params = new URLSearchParams();
      if (allocFilters.semester) params.append('semester', allocFilters.semester);
      if (allocFilters.academic_year) params.append('academic_year', allocFilters.academic_year);
      const data = await apiFetch(`/api/v1/department-admin/faculty-allocations?${params}`);
      if (data.success) {
        setAllocations(data.data);
      } else {
        console.error('Failed to fetch allocations', data);
      }
    } catch (error) {
      console.error('Error fetching allocations:', error);
    }
    finally { setAllocLoading(false); }
  };

  const fetchFaculty = async (deptId?: string) => {
    try {
      const params = new URLSearchParams();
      if (deptId && deptId !== 'all') params.append('department_id', deptId);
      else params.append('all', 'true');
      const data = await apiFetch(`/api/v1/department-admin/faculty-allocations/faculty?${params}`);
      if (data.success) {
        setFaculty(data.data);
      } else {
        console.error('Failed to fetch faculty', data);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const fetchClasses = async (semester?: string, year?: string) => {
    try {
      const params = new URLSearchParams();
      if (semester) params.append('semester', semester);
      if (year) params.append('year', year);
      const data = await apiFetch(`/api/v1/department-admin/faculty-allocations/classes?${params}`);
      if (data.success) setClasses(data.data);
    } catch { /* non-critical */ }
  };

  const fetchDepartments = async () => {
    try {
      const data = await apiFetch('/api/v1/department-admin/faculty-allocations/departments');
      if (data.success) {
        setDepartments(data.data);
      } else {
        console.error('Failed to fetch departments', data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => { fetchSubjects(); }, [subjectFilters.semester, subjectFilters.status]);
  useEffect(() => { fetchAllocations(); }, [allocFilters]);
  useEffect(() => { fetchDepartments(); fetchFaculty('all'); }, []);

  // whenever semester or year in the form changes refresh available class list
  useEffect(() => {
    if (allocForm.semester) {
      fetchClasses(allocForm.semester, allocForm.year);
    }
  }, [allocForm.semester, allocForm.year]);

  // Whenever selected class changes, attempt to fill the batch from student profiles
  useEffect(() => {
    const fetchBatchFromClass = async (classId: string) => {
      if (!classId) return;
      try {
        const data = await apiFetch(`/api/v1/students/class/${classId}`);
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const firstStudent = data.data[0];
          if (firstStudent.batch) {
            setAllocForm(f => ({ ...f, batch: firstStudent.batch }));
          }
        }
      } catch {
        // ignore
      }
    };

    if (allocForm.class_id) {
      fetchBatchFromClass(allocForm.class_id);
    }
  }, [allocForm.class_id]);

  // ── Allocation modal open ──────────────────────────────────────────────────

  const openAllocModal = async (subject: Subject) => {
    // Fetch latest subject info so batch (and other fields) reflect any recent updates
    const subjectResp = await apiFetch(`/api/v1/department-admin/subjects/${subject.id}`);
    const subjectData = subjectResp.success ? subjectResp.data : subject;

    setAllocatingSubject(subjectData as Subject);

    const assigned = subjectData.assignedFaculty && subjectData.assignedFaculty.length > 0
      ? subjectData.assignedFaculty[0]
      : null;

    setAllocForm({
      subject_id: subjectData.id.toString(),
      faculty_id: assigned?.faculty_id?.toString() || '',
      class_id: '',
      year: subjectData.year ? subjectData.year.toString() : Math.ceil(subjectData.semester / 2).toString(),
      academic_year: subjectData.academic_year || (new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)),
      semester: subjectData.semester.toString(),
      total_hours: '45',
      no_of_periods: '3',
      batch: subjectData.batch || '',
    });

    // pass year along when fetching classes in case backend later supports filtering
    fetchClasses(subjectData.semester.toString(), subjectData.year?.toString());
    setFacultyDeptFilter('all');
    setShowAllocModal(true);
  };

  // ── Faculty dept filter change ─────────────────────────────────────────────

  const handleFacultyDeptFilter = (deptId: string) => {
    setFacultyDeptFilter(deptId);
    fetchFaculty(deptId);
  };

  // ── Save allocation ────────────────────────────────────────────────────────

  const handleSaveAllocation = async () => {
    if (!allocForm.faculty_id || !allocForm.subject_id || !allocForm.class_id || !allocForm.academic_year || !allocForm.semester) {
      console.warn('Missing required fields for allocation');
      return;
    }
    setSaving(true);
    try {
      const yearValue = Math.min(Math.max(parseInt(allocForm.year) || 1, 1), 4);
      const payload: any = {
        faculty_id: parseInt(allocForm.faculty_id),
        subject_id: parseInt(allocForm.subject_id),
        class_id: parseInt(allocForm.class_id),
        academic_year: allocForm.academic_year,
        semester: parseInt(allocForm.semester),
        year: yearValue,
        total_hours: parseInt(allocForm.total_hours) || 45,
        no_of_periods: parseInt(allocForm.no_of_periods) || 3,
      };

      // Include batch only if it exists on the subject
      if (allocForm.batch) {
        payload.batch = allocForm.batch;
      }

      // include year if present (backend will ignore if unsupported)
      if (allocForm.year) payload.year = allocForm.year;
      const data = await apiFetch('/api/v1/department-admin/faculty-allocations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data.success) {
        setShowAllocModal(false);
        fetchSubjects();
        fetchAllocations();
      } else {
        console.error('Failed to save allocation:', data);
      }
    } catch (error) {
      console.error('Error saving allocation:', error);
    }
    finally { setSaving(false); }
  };

  // ── Delete allocation ──────────────────────────────────────────────────────

  const handleDeleteAllocation = async (id: number) => {
    if (!confirm('Remove this faculty assignment?')) return;
    try {
      const data = await apiFetch(`/api/v1/department-admin/faculty-allocations/${id}`, { method: 'DELETE' });
      if (data.success) {
        fetchAllocations();
        fetchSubjects();
      } else {
        console.error('Failed to remove assignment:', data);
      }
    } catch (error) {
      console.error('Error removing assignment:', error);
    }
  };

  // ── Unassign faculty from subject (one-to-one assignment) ───────────────────

  const handleUnassignSubject = async (subjectId: number, assignmentId: number) => {
    if (!confirm('Remove the assigned faculty from this subject?')) return;

    try {
      const data = await apiFetch(`/api/v1/department-admin/subjects/${subjectId}/assignments/${assignmentId}`, {
        method: 'DELETE'
      });
      if (data.success) {
        fetchSubjects();
        fetchAllocations();
      } else {
        console.error('Failed to unassign faculty:', data);
      }
    } catch (error) {
      console.error('Error unassigning faculty:', error);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const filteredSubjects = subjects.filter(s => {
    if (!subjectFilters.search) return true;
    const q = subjectFilters.search.toLowerCase();
    return (s.name || s.subject_name || '').toLowerCase().includes(q) ||
      (s.code || s.subject_code || '').toLowerCase().includes(q);
  });

  const filteredFaculty = faculty.filter(f =>
    facultyDeptFilter === 'all' || f.department_id?.toString() === facultyDeptFilter
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-[#790c0c]" />
                Subject Allocation
              </h1>
              <p className="text-gray-500 mt-1 text-sm">Assign faculty to subjects for each class and academic year</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-lg shadow p-1 mb-6 w-fit">
            {(['subjects', 'allocations'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md font-semibold text-sm transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-[#790c0c] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'subjects' ? 'Subjects' : 'Allocations'}
              </button>
            ))}
          </div>

          {/* ═══ SUBJECTS TAB ═══════════════════════════════════════════════ */}
          {activeTab === 'subjects' && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search subjects..."
                    value={subjectFilters.search}
                    onChange={e => setSubjectFilters(f => ({ ...f, search: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/20"
                  />
                </div>
                <select
                  value={subjectFilters.semester}
                  onChange={e => setSubjectFilters(f => ({ ...f, semester: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/20"
                >
                  <option value="">All Semesters</option>
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={s}>Semester {s} (Year {Math.ceil(s/2)})</option>
                  ))}
                </select>
                <select
                  value={subjectFilters.status}
                  onChange={e => setSubjectFilters(f => ({ ...f, status: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/20"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="">All Status</option>
                </select>
              </div>

              {/* Subjects List */}
              {loading ? (
                <div className="text-center py-16 text-gray-400">Loading subjects...</div>
              ) : filteredSubjects.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No subjects found</div>
              ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Code</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Subject</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Sem</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Year</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Credits</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Assigned Faculty</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredSubjects.map(subject => {
                          const name = subject.name || subject.subject_name || '';
                          const code = subject.code || subject.subject_code || '';
                          const year = subject.year ?? Math.ceil(subject.semester / 2);
                          const assigned = subject.assignedFaculty?.[0];
                          const assignedName = assigned?.Name;
                          const assignedDesignation = assigned?.designation;
                          const assignmentId = assigned?.FacultySubjectAssignment?.id;

                          return (
                            <tr key={subject.id} className="hover:bg-gray-50">
                              <td className="px-5 py-3 font-medium text-gray-800">{code}</td>
                              <td className="px-5 py-3 text-gray-700">{name}</td>
                              <td className="px-5 py-3 text-gray-500">{subject.semester} ({subject.sem_type})</td>
                              <td className="px-5 py-3 text-gray-500">{year}</td>
                              <td className="px-5 py-3 text-gray-500">{subject.credits}</td>
                              <td className="px-5 py-3">
                                {assigned ? (
                                  <div>
                                    <div className="font-medium text-gray-800">{assignedName}</div>
                                    {assignedDesignation && (
                                      <div className="text-xs text-gray-500">{assignedDesignation}</div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Unassigned</span>
                                )}
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex flex-wrap gap-2 items-center">
                                  <button
                                    onClick={() => openAllocModal(subject)}
                                    className="px-3 py-1.5 bg-[#790c0c] hover:bg-[#5a0909] text-white text-xs font-semibold rounded-lg transition"
                                  >
                                    {assigned ? 'Change' : 'Assign'}
                                  </button>
                                  {assignmentId && (
                                    <button
                                      onClick={() => handleUnassignSubject(subject.id, assignmentId)}
                                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
                                    >
                                      Unassign
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══ ALLOCATIONS TAB ════════════════════════════════════════════ */}
          {activeTab === 'allocations' && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-center">
                <select
                  value={allocFilters.semester}
                  onChange={e => setAllocFilters(f => ({ ...f, semester: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Semesters</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Academic year (e.g. 2025-2026)"
                  value={allocFilters.academic_year}
                  onChange={e => setAllocFilters(f => ({ ...f, academic_year: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm w-52"
                />
                <button
                  onClick={() => setAllocFilters({ semester: '', academic_year: '' })}
                  className="text-sm text-gray-500 underline"
                >
                  Clear
                </button>
              </div>

              {allocLoading ? (
                <div className="text-center py-16 text-gray-400">Loading allocations...</div>
              ) : allocations.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No allocations found</div>
              ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Subject</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Faculty</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Dept</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Class</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Sem</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Acad. Year</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Hrs / Periods</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Status</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {allocations.map(alloc => (
                          <tr key={alloc.id} className="hover:bg-gray-50">
                            <td className="px-5 py-3">
                              <div className="font-medium text-gray-800">{alloc.subject?.name || alloc.subject?.subject_name}</div>
                              <div className="text-xs text-gray-400">{alloc.subject?.code || alloc.subject?.subject_code}</div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="font-medium text-gray-800">{alloc.faculty?.Name}</div>
                              <div className="text-xs text-gray-400">{alloc.faculty?.designation}</div>
                            </td>
                            <td className="px-5 py-3 text-gray-500">
                              {alloc.faculty?.department?.full_name || alloc.faculty?.department?.short_name || '—'}
                            </td>
                            <td className="px-5 py-3 text-gray-500">
                              {alloc.class ? `${alloc.class.name}` : '—'}
                            </td>
                            <td className="px-5 py-3 text-gray-500">{alloc.semester}</td>
                            <td className="px-5 py-3 text-gray-500">{alloc.academic_year}</td>
                            <td className="px-5 py-3 text-gray-500">{alloc.total_hours}h / {alloc.no_of_periods}p</td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                alloc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {alloc.status}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <button
                                onClick={() => handleDeleteAllocation(alloc.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══ ALLOCATION MODAL ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAllocModal && allocatingSubject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal header */}
              <div className="flex justify-between items-start p-6 border-b">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Assign Faculty</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {allocatingSubject.code || allocatingSubject.subject_code} — {allocatingSubject.name || allocatingSubject.subject_name}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      Sem {allocatingSubject.semester}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      Year {allocatingSubject.year ?? Math.ceil(allocatingSubject.semester / 2)}
                    </span>
                    {allocatingSubject.is_laboratory && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded flex items-center gap-1">
                        <FlaskConical className="w-3 h-3" /> Lab: {allocatingSubject.lab_name || 'Yes'}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowAllocModal(false)}
                  className="text-gray-400 hover:text-gray-600 mt-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-5">

                {/* Department filter for faculty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> Filter Faculty by Department
                  </label>
                  <select
                    value={facultyDeptFilter}
                    onChange={e => handleFacultyDeptFilter(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/30"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id.toString()}>{d.short_name} — {d.full_name}</option>
                    ))}
                  </select>
                </div>

                {/* Faculty selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" /> Select Faculty *
                  </label>
                  <select
                    value={allocForm.faculty_id}
                    onChange={e => setAllocForm(f => ({ ...f, faculty_id: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/30"
                  >
                    <option value="">— Choose Faculty —</option>
                    {filteredFaculty.map(f => (
                      <option key={f.faculty_id} value={f.faculty_id}>
                        {f.Name} | {f.designation} {f.department ? `[${f.department.short_name}]` : ''}
                      </option>
                    ))}
                  </select>
                  {filteredFaculty.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">No faculty found for selected department.</p>
                  )}
                </div>

                {/* Class selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Class *</label>
                    <select
                      value={allocForm.class_id}
                      onChange={e => setAllocForm(f => ({ ...f, class_id: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/30"
                    >
                      <option value="">— Select class —</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.room ? `| Room ${c.room}` : ''} {c.capacity ? `| ${c.capacity} students` : ''}
                        </option>
                      ))}
                    </select>
                </div>

                {/* Year, academic year + Semester row */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Year of Study *</label>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={allocForm.year}
                      onChange={e => {
                        const value = Number(e.target.value);
                        setAllocForm(f => ({ ...f, year: String(Math.min(Math.max(1, value), 4)) }));
                      }}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year *</label>
                    <input
                      type="text"
                      value={allocForm.academic_year}
                      onChange={e => setAllocForm(f => ({ ...f, academic_year: e.target.value }))}
                      placeholder="e.g. 2025-2026"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Semester *</label>
                    <select
                      value={allocForm.semester}
                      onChange={e => setAllocForm(f => ({ ...f, semester: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/30"
                    >
                      {[1,2,3,4,5,6,7,8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hours + Periods */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Hours</label>
                    <input
                      type="number"
                      min="0"
                      value={allocForm.total_hours}
                      onChange={e => setAllocForm(f => ({ ...f, total_hours: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Periods / Week</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={allocForm.no_of_periods}
                      onChange={e => setAllocForm(f => ({ ...f, no_of_periods: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/30"
                    />
                  </div>
                </div>

                {/* Batch Year */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Year</label>
                  <input
                    type="text"
                    placeholder="Auto-filled from subject"
                    value={allocForm.batch}
                    readOnly
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
                  />
                  {!allocForm.batch && (
                    <p className="text-xs text-gray-400 mt-1">Batch is not set on this subject. Update the subject to add a batch year.</p>
                  )}
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => setShowAllocModal(false)}
                  className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  onClick={handleSaveAllocation}
                  className="px-6 py-2 bg-[#790c0c] hover:bg-[#5a0909] text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Assign Faculty'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
