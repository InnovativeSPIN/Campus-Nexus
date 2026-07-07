import { useState, useEffect } from 'react';
import { toast } from '@/pages/admin/department-admin/components/ui/sonner';
import { MainLayout } from '@/pages/admin/department-admin/components/layout/MainLayout';
import { Users, Search, Check, ChevronDown, UserPlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAcademicYears, getCurrentAcademicYear } from '@/utils/academicYear';

interface Mentor {
  faculty_id: number;
  Name: string;
  email: string;
  designation: string;
  mentee_count: number;
}

interface Student {
  id: string;
  studentId: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  batch: string;
  semester: number;
  mentor_id: number | null;
  mentor_name: string | null;
}

export default function MentorshipAllocation() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [academicYear, setAcademicYear] = useState('2023-2024'); // Fixed academic year for DB
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('All');
  const [activeMentorId, setActiveMentorId] = useState<number | null>(null);
  
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isAssigning, setIsAssigning] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [mentorsData, studentsData] = await Promise.all([
        apiFetch(`/api/v1/department-admin/mentorship/mentors?academic_year=${academicYear}`),
        apiFetch(`/api/v1/department-admin/mentorship/students?academic_year=${academicYear}`)
      ]);

      if (mentorsData.success) setMentors(mentorsData.data);
      if (studentsData.success) setStudents(studentsData.data);
    } catch (error) {
      console.error('Error fetching mentorship data:', error);
      toast.error('Failed to load mentorship data');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [academicYear]);

  const handleAssign = async () => {
    if (!selectedMentor || selectedStudents.length === 0) {
      toast.error('Please select a mentor and at least one student');
      return;
    }

    setIsAssigning(true);
    try {
      const res = await apiFetch('/api/v1/department-admin/mentorship/assign', {
        method: 'POST',
        body: JSON.stringify({
          faculty_id: selectedMentor.faculty_id,
          student_ids: selectedStudents,
          academic_year: academicYear
        })
      });

      if (res.success) {
        toast.success('Students assigned to mentor successfully');
        setShowAssignModal(false);
        setSelectedStudents([]);
        loadData();
      } else {
        toast.error(res.error || 'Failed to assign students');
      }
    } catch (error) {
      console.error('Error assigning students:', error);
      toast.error('Error assigning students');
    }
    setIsAssigning(false);
  };

  const handleUnassign = async (studentId: string) => {
    try {
      const res = await apiFetch('/api/v1/department-admin/mentorship/unassign', {
        method: 'DELETE',
        body: JSON.stringify({
          student_ids: [studentId],
          academic_year: academicYear
        })
      });

      if (res.success) {
        toast.success('Student unassigned successfully');
        loadData();
      } else {
        toast.error(res.error || 'Failed to unassign student');
      }
    } catch (error) {
      console.error('Error unassigning student:', error);
      toast.error('Error unassigning student');
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYearFilter === 'All' ? true : s.semester === (parseInt(selectedYearFilter) * 2) || s.semester === (parseInt(selectedYearFilter) * 2 - 1) || Math.ceil(s.semester / 2).toString() === selectedYearFilter;
    const matchesMentor = activeMentorId ? s.mentor_id === activeMentorId : true;
    
    return matchesSearch && matchesYear && matchesMentor;
  });

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentorship Allocation</h1>
            <p className="text-sm text-gray-500">Assign students to faculty mentors</p>
          </div>
          <div className="flex gap-4">
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
            </select>
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Assign Students
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mentors List */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Faculty Mentors
                </h2>
                {activeMentorId && (
                  <button 
                    onClick={() => setActiveMentorId(null)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {mentors.map(mentor => (
                  <div 
                    key={mentor.faculty_id} 
                    onClick={() => setActiveMentorId(mentor.faculty_id)}
                    className={`p-4 transition-colors cursor-pointer ${activeMentorId === mentor.faculty_id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{mentor.Name}</h3>
                        <p className="text-sm text-gray-500">{mentor.designation}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {mentor.mentee_count} Mentees
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Students List */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="font-semibold text-gray-700">
                  {activeMentorId 
                    ? `Mentees of ${mentors.find(m => m.faculty_id === activeMentorId)?.Name || 'Selected Mentor'}` 
                    : 'All Students'}
                </h2>
                <div className="flex gap-3">
                  <select
                    value={selectedYearFilter}
                    onChange={e => setSelectedYearFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="All">All Years</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-medium">Roll No</th>
                      <th className="px-6 py-3 font-medium">Name</th>
                      <th className="px-6 py-3 font-medium">Sem/Batch</th>
                      <th className="px-6 py-3 font-medium">Mentor</th>
                      <th className="px-6 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{student.rollNumber}</td>
                        <td className="px-6 py-4">{student.firstName} {student.lastName}</td>
                        <td className="px-6 py-4">Sem {student.semester} ({student.batch})</td>
                        <td className="px-6 py-4">
                          {student.mentor_id ? (
                            <span className="text-green-600 font-medium">{student.mentor_name}</span>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {student.mentor_id && (
                            <button
                              onClick={() => handleUnassign(student.id)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Unassign
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        <AnimatePresence>
          {showAssignModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h2 className="text-lg font-bold text-gray-900">Assign Mentees</h2>
                  <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Select Mentor */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">1. Select Mentor</h3>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {mentors.map(mentor => (
                          <div
                            key={mentor.faculty_id}
                            onClick={() => setSelectedMentor(mentor)}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedMentor?.faculty_id === mentor.faculty_id
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            <div className="font-medium text-gray-900">{mentor.Name}</div>
                            <div className="text-xs text-gray-500 mt-1">Current mentees: {mentor.mentee_count}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Select Students */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-gray-700">2. Select Students</h3>
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                          {selectedStudents.length} selected
                        </span>
                      </div>
                      <div className="relative mb-3">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search unassigned students..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1 max-h-[350px] overflow-y-auto border border-gray-200 rounded-md p-2">
                        {students
                          .filter(s => !s.mentor_id) // Only show unassigned
                          .filter(s => 
                            s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map(student => (
                          <label key={student.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudents([...selectedStudents, student.id]);
                                } else {
                                  setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                }
                              }}
                              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                            <div className="ml-3 text-sm">
                              <span className="font-medium text-gray-900">{student.rollNumber}</span>
                              <span className="text-gray-500 ml-2">{student.firstName} {student.lastName}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={isAssigning || !selectedMentor || selectedStudents.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
