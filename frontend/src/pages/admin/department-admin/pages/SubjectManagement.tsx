import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BookOpen, Plus, Edit, Trash2, Users, Save, X } from 'lucide-react';
import { MainLayout } from '@/pages/admin/department-admin/components/layout/MainLayout';
import { motion } from 'framer-motion';

interface Subject {
  id: number;
  name: string;
  code: string;
  semester: number;
  credits: number;
  type: 'Theory' | 'Practical' | 'Theory+Practical';
  is_elective: boolean;
  description?: string;
  status: 'active' | 'inactive';
  assignedFaculty?: Faculty[];
}

interface Faculty {
  faculty_id: number;
  Name: string;
  email: string;
  designation: string;
  FacultySubjectAssignment?: {
    academic_year: string;
    status: string;
  };
}

export default function SubjectManagement() {
  // Removed unused user
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [assigningFaculty, setAssigningFaculty] = useState<number | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    semester: 1,
    credits: 1,
    type: 'Theory' as const,
    is_elective: false,
    description: ''
  });
  const [filters, setFilters] = useState({
    semester: '',
    type: '',
    status: 'active'
  });

  useEffect(() => {
    fetchSubjects();
    fetchAvailableFaculty();
  }, [filters]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/v1/department-admin/subjects?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) throw new Error('Failed to fetch subjects');

      const data = await response.json();
      setSubjects(data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableFaculty = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/department-admin/subjects/available-faculty', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFaculty(data.data);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/department-admin/subjects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subjectForm)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subject');
      }

      toast.success('Subject created successfully');
      setShowCreateModal(false);
      setSubjectForm({
        name: '',
        code: '',
        semester: 1,
        credits: 1,
        type: 'Theory',
        is_elective: false,
        description: ''
      });
      fetchSubjects();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateSubject = async (id: number) => {
    if (!editingSubject) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/department-admin/subjects/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingSubject)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update subject');
      }

      toast.success('Subject updated successfully');
      setEditingSubject(null);
      fetchSubjects();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/department-admin/subjects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete subject');
      }

      toast.success('Subject deleted successfully');
      fetchSubjects();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAssignFaculty = async (subjectId: number, facultyId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/department-admin/subjects/${subjectId}/assign-faculty`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          faculty_id: facultyId,
          academic_year: '2024-25', // You might want to make this dynamic
          semester: subjects.find(s => s.id === subjectId)?.semester
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign faculty');
      }

      toast.success('Faculty assigned successfully');
      setAssigningFaculty(null);
      fetchSubjects();
      fetchAvailableFaculty();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    if (filters.type && subject.type !== filters.type) return false;
    return true;
  });

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="page-header font-serif">Subject Management</h1>
            <p className="text-muted-foreground -mt-4">Manage subjects and faculty assignments</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Subject
        </button>
      </motion.div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-6 bg-muted/40 rounded-lg border border-border">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Semester
            </label>
            <select
              value={filters.semester}
              onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Types</option>
              <option value="Theory">Theory</option>
              <option value="Practical">Practical</option>
              <option value="Theory+Practical">Theory + Practical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="">All Statuses</option>
            </select>
          </div>
        </div>

        {/* Subjects Table */}
        <div className="widget-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Subject Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type & Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Assigned Faculty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-400">
                    Loading subjects...
                  </td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-400">
                    No subjects found
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      {editingSubject?.id === subject.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingSubject.name}
                            onChange={(e) => setEditingSubject(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                            placeholder="Subject Name"
                          />
                          <input
                            type="text"
                            value={editingSubject.code}
                            onChange={(e) => setEditingSubject(prev => prev ? { ...prev, code: e.target.value } : null)}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                            placeholder="Subject Code"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-white">{subject.name}</div>
                          <div className="text-sm text-slate-400">{subject.code}</div>
                          {subject.is_elective && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-900/30 text-orange-400 border border-orange-600/30">
                              Elective
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingSubject?.id === subject.id ? (
                        <select
                          value={editingSubject.semester}
                          onChange={(e) => setEditingSubject(prev => prev ? { ...prev, semester: parseInt(e.target.value) } : null)}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>{sem}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-white">Semester {subject.semester}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingSubject?.id === subject.id ? (
                        <div className="space-y-2">
                          <select
                            value={editingSubject.type}
                            onChange={(e) => setEditingSubject(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                          >
                            <option value="Theory">Theory</option>
                            <option value="Practical">Practical</option>
                            <option value="Theory+Practical">Theory + Practical</option>
                          </select>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={editingSubject.credits}
                            onChange={(e) => setEditingSubject(prev => prev ? { ...prev, credits: parseInt(e.target.value) } : null)}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                            placeholder="Credits"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-white">{subject.type}</div>
                          <div className="text-sm text-slate-400">{subject.credits} Credits</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {subject.assignedFaculty && subject.assignedFaculty.length > 0 ? (
                          subject.assignedFaculty.map((fac) => (
                            <div key={fac.faculty_id} className="text-sm text-white">
                              {fac.Name}
                              <span className="text-xs text-slate-400 ml-1">
                                ({fac.FacultySubjectAssignment?.academic_year})
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400 italic">No faculty assigned</span>
                        )}
                        {assigningFaculty === subject.id ? (
                          <div className="mt-2">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignFaculty(subject.id, parseInt(e.target.value));
                                }
                              }}
                              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                              defaultValue=""
                            >
                              <option value="">Select Faculty</option>
                              {faculty.map((fac) => (
                                <option key={fac.faculty_id} value={fac.faculty_id}>
                                  {fac.Name} - {fac.designation}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => setAssigningFaculty(null)}
                              className="mt-1 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAssigningFaculty(subject.id)}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                          >
                            <Users className="h-3 w-3" />
                            Assign Faculty
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingSubject?.id === subject.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateSubject(subject.id)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingSubject(null)}
                            className="text-slate-400 hover:text-slate-300 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingSubject({ ...subject })}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(subject.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Subject Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Create New Subject</h3>
                <p className="text-slate-400 text-sm">Add a new subject to your department</p>
              </div>
              <form onSubmit={handleCreateSubject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="e.g., Data Structures and Algorithms"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="e.g., CSE301"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Semester *
                    </label>
                    <select
                      required
                      value={subjectForm.semester}
                      onChange={(e) => setSubjectForm(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Credits *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="10"
                      value={subjectForm.credits}
                      onChange={(e) => setSubjectForm(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Type *
                  </label>
                  <select
                    required
                    value={subjectForm.type}
                    onChange={(e) => setSubjectForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                    <option value="Theory+Practical">Theory + Practical</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={subjectForm.is_elective}
                      onChange={(e) => setSubjectForm(prev => ({ ...prev, is_elective: e.target.checked }))}
                      className="mr-2 text-primary bg-slate-700 border-slate-600 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-slate-300">Elective Subject</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={subjectForm.description}
                    onChange={(e) => setSubjectForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                    rows={3}
                    placeholder="Optional description of the subject"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Create Subject
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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