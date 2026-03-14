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
  const [activeTab, setActiveTab] = useState<'curriculum' | 'faculty-allocation' | 'allocations'>('curriculum');

  // Allocations list
  const [allocations, setAllocations] = useState<any[]>([]);
  const [allocLoading, setAllocLoading] = useState(false);

  // Curriculum Mapping
  const [mappings, setMappings] = useState<any[]>([]);
  const [mappingLoading, setMappingLoading] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [mappingForm, setMappingForm] = useState({
    subject_id: '',
    class_id: '',
    semester: '',
    academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    is_core: true,
    status: 'active',
  });

  // Filters
  const [subjectFilters, setSubjectFilters] = useState({ semester: '', status: 'active', search: '' });
  const [allocFilters, setAllocFilters] = useState({ semester: '', academic_year: '', class_id: '' });

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
      if (allocFilters.class_id) params.append('class_id', allocFilters.class_id);
      const data = await apiFetch(`/api/v1/department-admin/faculty-allocations?${params}`);
      if (data.success) {
        setAllocations(data.data);
        console.log('Fetched allocations', data.data);
        console.log('First allocation has faculty?', data.data[0]?.faculty);
        console.log('Allocation keys:', Object.keys(data.data[0] || {}));
        if (data.data[0]?.faculty_id) {
          console.log(`Faculty ID ${data.data[0].faculty_id} has faculty object?`, Boolean(data.data[0].faculty));
        }
        
        // Detailed logging for all allocations
        console.log('[ALLOCATIONS-DEBUG] All allocations:');
        data.data.forEach(alloc => {
          console.log(`  ID ${alloc.id}: Subject ${alloc.subject_id}, Class ${alloc.class_id}, Sem ${alloc.semester}, Year ${alloc.academic_year}, Faculty Name: ${alloc.faculty?.Name || 'MISSING'}`);
        });
      } else {
        console.error('Failed to fetch allocations', data);
      }
    } catch (error) {
      console.error('Error fetching allocations:', error);
    }
    finally { setAllocLoading(false); }
  };

  const fetchMappings = async () => {
    setMappingLoading(true);
    try {
      const params = new URLSearchParams();
      if (allocFilters.semester) params.append('semester', allocFilters.semester);
      if (allocFilters.academic_year) params.append('academic_year', allocFilters.academic_year);
      if (allocFilters.class_id) params.append('class_id', allocFilters.class_id);
      const data = await apiFetch(`/api/v1/department-admin/subject-class-mappings?${params}`);
      if (data.success) {
        setMappings(data.data);
        console.log('[MAPPINGS-DEBUG] Fetched', data.data.length, 'mappings:');
        data.data.forEach(m => {
          console.log(`  ID ${m.id}: Subject ${m.subject_id}, Class ${m.class_id}, Sem ${m.semester}, Year ${m.academic_year}`);
        });
      } else {
        console.error('Failed to fetch mappings', data);
      }
    } catch (error) {
      console.error('Error fetching mappings:', error);
    }
    finally { setMappingLoading(false); }
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
  useEffect(() => { fetchMappings(); }, [allocFilters]);
  useEffect(() => { fetchDepartments(); fetchFaculty('all'); fetchClasses(); }, []);

  // whenever semester or year in the form changes refresh available class list
  useEffect(() => {
    if (allocForm.semester) {
      fetchClasses(allocForm.semester, allocForm.year);
    }
  }, [allocForm.semester, allocForm.year]);

  // When mapping modal opens or subject is selected, fetch classes for that subject's semester
  useEffect(() => {
    if (showMappingModal && mappingForm.subject_id) {
      // Find the subject to get its semester
      const selectedSubject = subjects.find(s => s.id.toString() === mappingForm.subject_id);
      if (selectedSubject) {
        fetchClasses(selectedSubject.semester.toString());
        setMappingForm(f => ({ ...f, semester: selectedSubject.semester.toString() }));
      }
    } else if (showMappingModal) {
      // Modal opened without subject, fetch all classes
      fetchClasses();
    }
  }, [showMappingModal, mappingForm.subject_id, subjects]);

  // Whenever selected class changes, attempt to fill the batch from student profiles
  useEffect(() => {
    const fetchBatchFromClass = async (classId: string) => {
      if (!classId) return;

      // Prefer class.batch if present (faster, no extra request)
      const selectedClass = classes.find(c => c.id.toString() === classId);
      if (selectedClass && selectedClass.batch) {
        setAllocForm(f => ({ ...f, batch: selectedClass.batch }));
        return;
      }

      // Fallback: query students in class and derive batch from first result
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
  }, [allocForm.class_id, classes]);

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

    // Load all faculty (cross-dept allowed) for allocation dropdown
    setFacultyDeptFilter('all');
    fetchFaculty('all');

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

  // ── Save curriculum mapping ─────────────────────────────────────────────────

  const handleSaveMapping = async () => {
    if (!mappingForm.subject_id || !mappingForm.class_id || !mappingForm.semester || !mappingForm.academic_year) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const payload = {
        subject_id: parseInt(mappingForm.subject_id),
        class_id: parseInt(mappingForm.class_id),
        semester: parseInt(mappingForm.semester),
        academic_year: mappingForm.academic_year,
        is_core: mappingForm.is_core,
        status: mappingForm.status,
      };

      const data = await apiFetch('/api/v1/department-admin/subject-class-mappings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (data.success) {
        toast.success('Mapping created successfully');
        setShowMappingModal(false);
        fetchMappings();
        fetchSubjects();
      } else {
        toast.error(data.error || 'Failed to create mapping');
      }
    } catch (error) {
      console.error('Error saving mapping:', error);
      toast.error('Error saving mapping');
    }
  };

  // ── Delete curriculum mapping ───────────────────────────────────────────────

  const handleDeleteMapping = async (mappingId: number) => {
    if (!confirm('Delete this curriculum mapping?')) return;

    try {
      const data = await apiFetch(`/api/v1/department-admin/subject-class-mappings/${mappingId}`, {
        method: 'DELETE'
      });

      if (data.success) {
        toast.success('Mapping deleted successfully');
        fetchMappings();
        fetchSubjects();
      } else {
        toast.error(data.error || 'Failed to delete mapping');
      }
    } catch (error) {
      console.error('Error deleting mapping:', error);
      toast.error('Error deleting mapping');
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

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
            {(['curriculum', 'faculty-allocation', 'allocations'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md font-semibold text-sm transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-[#790c0c] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'curriculum' ? 'Curriculum Mapping' : tab === 'faculty-allocation' ? 'Faculty Subject Allocation' : 'Allocations'}
              </button>
            ))}
          </div>

          {/* ═══ CURRICULUM MAPPING TAB ════════════════════════════════════ */}
          {activeTab === 'curriculum' && (
            <>
              {/* Filters & Add Button */}
              <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-center">
                <select
                  value={allocFilters.semester}
                  onChange={e => setAllocFilters(f => ({ ...f, semester: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/20"
                >
                  <option value="">All Semesters</option>
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>

                <select
                  value={allocFilters.class_id}
                  onChange={e => setAllocFilters(f => ({ ...f, class_id: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/20"
                >
                  <option value="">All Classes</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id.toString()}>
                      {c.name} {c.room ? `| ${c.room}` : ''}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="e.g., 2025-2026"
                  value={allocFilters.academic_year}
                  onChange={e => setAllocFilters(f => ({ ...f, academic_year: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/20"
                />
                <button
                  onClick={() => {
                    setMappingForm({
                      subject_id: '',
                      class_id: '',
                      semester: allocFilters.semester || '',
                      academic_year: allocFilters.academic_year || (new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)),
                      is_core: true,
                      status: 'active',
                    });
                    setShowMappingModal(true);
                  }}
                  className="ml-auto flex gap-2 items-center px-4 py-2 bg-[#790c0c] text-white rounded-lg hover:bg-[#590909] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Mapping
                </button>
              </div>

              {/* Mappings List */}
              {mappingLoading ? (
                <div className="text-center py-16 text-gray-400">Loading mappings...</div>
              ) : mappings.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No curriculum mappings found</div>
              ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Subject</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Class</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Semester</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Academic Year</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Type</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Status</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {mappings.map(mapping => (
                          <tr key={mapping.id} className="hover:bg-gray-50">
                            <td className="px-5 py-3 font-medium text-gray-800">{mapping.subject?.name}</td>
                            <td className="px-5 py-3 text-gray-700">{mapping.class?.name}</td>
                            <td className="px-5 py-3 text-gray-500">{mapping.semester}</td>
                            <td className="px-5 py-3 text-gray-500">{mapping.academic_year}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                mapping.is_core ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {mapping.is_core ? 'Core' : 'Elective'}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                mapping.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {mapping.status}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <button
                                onClick={() => handleDeleteMapping(mapping.id)}
                                className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-all"
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

              {/* Curriculum Mapping Modal */}
              <AnimatePresence>
                {showMappingModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
                    onClick={() => setShowMappingModal(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      onClick={e => e.stopPropagation()}
                      className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Add Subject-Class Mapping</h3>
                        <button onClick={() => setShowMappingModal(false)} className="text-gray-500 hover:text-gray-700">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Subject */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                          <select
                            value={mappingForm.subject_id}
                            onChange={e => setMappingForm({...mappingForm, subject_id: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/20"
                          >
                            <option value="">Select Subject</option>
                            {subjects.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name || s.subject_name} ({s.code || s.subject_code})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Class */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                          <select
                            value={mappingForm.class_id}
                            onChange={e => setMappingForm({...mappingForm, class_id: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/20"
                          >
                            <option value="">Select Class</option>
                            {classes.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Semester */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                          <select
                            value={mappingForm.semester}
                            onChange={e => setMappingForm({...mappingForm, semester: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/20"
                          >
                            <option value="">Select Semester</option>
                            {[1,2,3,4,5,6,7,8].map(s => (
                              <option key={s} value={s}>Semester {s}</option>
                            ))}
                          </select>
                        </div>

                        {/* Academic Year */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                          <input
                            type="text"
                            placeholder="e.g., 2025-2026"
                            value={mappingForm.academic_year}
                            onChange={e => setMappingForm({...mappingForm, academic_year: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/20"
                          />
                        </div>

                        {/* Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                          <select
                            value={mappingForm.is_core ? 'core' : 'elective'}
                            onChange={e => setMappingForm({...mappingForm, is_core: e.target.value === 'core'})}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/20"
                          >
                            <option value="core">Core</option>
                            <option value="elective">Elective</option>
                          </select>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end pt-4">
                          <button
                            onClick={() => setShowMappingModal(false)}
                            className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveMapping}
                            className="px-4 py-2 bg-[#790c0c] text-white rounded-lg hover:bg-[#590909] transition-all"
                          >
                            Save Mapping
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* ═══ FACULTY SUBJECT ALLOCATION TAB ═════════════════════════════ */}
          {activeTab === 'faculty-allocation' && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-center">
                <select
                  value={allocFilters.semester}
                  onChange={e => setAllocFilters(f => ({ ...f, semester: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/20"
                >
                  <option value="">All Semesters</option>
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>

                <select
                  value={allocFilters.class_id}
                  onChange={e => setAllocFilters(f => ({ ...f, class_id: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/20"
                >
                  <option value="">All Classes</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id.toString()}>
                      {c.name} {c.room ? `| ${c.room}` : ''}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Academic year (e.g. 2025-2026)"
                  value={allocFilters.academic_year}
                  onChange={e => setAllocFilters(f => ({ ...f, academic_year: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#790c0c]/20"
                />
                <button
                  onClick={() => setAllocFilters({ semester: '', academic_year: '', class_id: '' })}
                  className="text-sm text-gray-500 underline hover:text-gray-700"
                >
                  Clear Filters
                </button>
              </div>

              {/* Subject-Class Mappings with Faculty Allocation */}
              {mappingLoading ? (
                <div className="text-center py-16 text-gray-400">Loading subject-class mappings...</div>
              ) : mappings.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No subject-class mappings found. Create mappings in the Curriculum Mapping tab first.</div>
              ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Subject Code</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Subject Name</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Class</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Sem</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Academic Year</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Type</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Allocated Faculty</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Hrs / Periods</th>
                          <th className="px-5 py-3 text-left font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {mappings.map(mapping => {
                          const subjectName = mapping.subject?.name || 'N/A';
                          const subjectCode = mapping.subject?.code || 'N/A';
                          const className = mapping.class?.name || 'N/A';
                          const type = mapping.is_core ? 'Core' : 'Elective';
                          
                          // Find allocation for this mapping
                          const allocation = allocations.find(a => 
                            a.subject_id === mapping.subject_id && 
                            a.class_id === mapping.class_id &&
                            a.semester === mapping.semester &&
                            a.academic_year === mapping.academic_year
                          );
                          
                          // Debug logging
                          if (!allocation) {
                            console.log(`[ALLOC-SEARCH] No match for mapping ${mapping.id}:`, {
                              lookingFor: {
                                subject_id: mapping.subject_id,
                                class_id: mapping.class_id,
                                semester: mapping.semester,
                                academic_year: mapping.academic_year
                              },
                              availableAllocations: allocations.map(a => ({
                                id: a.id,
                                subject_id: a.subject_id,
                                class_id: a.class_id,
                                semester: a.semester,
                                academic_year: a.academic_year,
                                faculty: a.faculty?.Name
                              }))
                            });
                          } else {
                            console.log(`[ALLOC-FOUND] Mapping ${mapping.id} matched allocation ${allocation.id}:`, {
                              facultyName: allocation.faculty?.Name,
                              hasFaculty: Boolean(allocation.faculty)
                            });
                          }
                          
                          const facultyName = allocation?.faculty?.Name || 'Unallocated';
                          const facultyDesignation = allocation?.faculty?.designation || '';
                          const totalHours = allocation?.total_hours || '--';
                          const noOfPeriods = allocation?.no_of_periods || '--';

                          return (
                            <tr key={mapping.id} className="hover:bg-gray-50">
                              <td className="px-5 py-3 font-medium text-gray-800">{subjectCode}</td>
                              <td className="px-5 py-3 text-gray-700">{subjectName}</td>
                              <td className="px-5 py-3 text-gray-700">{className}</td>
                              <td className="px-5 py-3 text-gray-500">{mapping.semester}</td>
                              <td className="px-5 py-3 text-gray-500">{mapping.academic_year}</td>
                              <td className="px-5 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  type === 'Core' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {type}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                {allocation ? (
                                  <div>
                                    <div className="font-medium text-gray-800">{facultyName}</div>
                                    {facultyDesignation && (
                                      <div className="text-xs text-gray-500">{facultyDesignation}</div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">Unallocated</span>
                                )}
                              </td>
                              <td className="px-5 py-3 text-gray-500">
                                {allocation ? `${totalHours}h / ${noOfPeriods}p` : '--'}
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex flex-wrap gap-2 items-center">
                                  <button
                                    onClick={() => {
                                      // Open allocation modal for this mapping
                                      setAllocForm({
                                        subject_id: mapping.subject_id.toString(),
                                        faculty_id: allocation?.faculty_id?.toString() || '',
                                        class_id: mapping.class_id.toString(),
                                        year: Math.ceil(mapping.semester / 2).toString(),
                                        academic_year: mapping.academic_year,
                                        semester: mapping.semester.toString(),
                                        total_hours: (allocation?.total_hours || '45').toString(),
                                        no_of_periods: (allocation?.no_of_periods || '3').toString(),
                                        batch: '',
                                      });
                                      setAllocatingSubject({
                                        id: mapping.subject_id,
                                        name: subjectName,
                                        code: subjectCode,
                                        semester: mapping.semester,
                                        sem_type: 'odd',
                                        credits: 0,
                                        type: '',
                                        is_elective: false,
                                        is_laboratory: false,
                                        status: 'active'
                                      });
                                      setShowAllocModal(true);
                                    }}
                                    className="px-3 py-1.5 bg-[#790c0c] hover:bg-[#5a0909] text-white text-xs font-semibold rounded-lg transition"
                                  >
                                    {allocation ? 'Edit' : 'Allocate'}
                                  </button>
                                  {allocation && (
                                    <button
                                      onClick={() => handleDeleteAllocation(allocation.id)}
                                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition"
                                    >
                                      <Trash2 className="w-3 h-3" />
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
