import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Users, BookOpen, Award, Loader2, Check } from 'lucide-react';

// Removed unused user
type FacultyType = {
  faculty_id: number;
  Name: string;
  email: string;
  designation: string;
  is_timetable_incharge?: boolean;
  is_placement_coordinator?: boolean;
};

const CoordinatorManagement = () => {
  const [faculty, setFaculty] = useState<FacultyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState<Record<string | number, boolean>>({});

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/department-admin/coordinators', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch faculty');

      const data = await response.json();
      setFaculty(data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load faculty data');
    } finally {
      setLoading(false);
    }
  };

  const toggleTimetableIncharge = async (facultyId: number, currentStatus: boolean) => {
    setAssignmentLoading(prev => ({ ...prev, [facultyId]: true }));
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = currentStatus ? 'remove-timetable' : 'assign-timetable';
      
      const response = await fetch(`/api/v1/department-admin/coordinators/${facultyId}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to update assignment');

      const data = await response.json();
      setFaculty(prev =>
        prev.map(f =>
          f.faculty_id === facultyId
            ? { ...f, is_timetable_incharge: !currentStatus }
            : f
        )
      );
      
      toast.success(data.message);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update assignment');
    } finally {
      setAssignmentLoading(prev => ({ ...prev, [facultyId]: false }));
    }
  };

  const togglePlacementCoordinator = async (facultyId: number, currentStatus: boolean) => {
    setAssignmentLoading(prev => ({ ...prev, [`placement_${facultyId}`]: true }));
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = currentStatus ? 'remove-placement' : 'assign-placement';
      
      const response = await fetch(`/api/v1/department-admin/coordinators/${facultyId}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to update assignment');

      const data = await response.json();
      setFaculty(prev =>
        prev.map(f =>
          f.faculty_id === facultyId
            ? { ...f, is_placement_coordinator: !currentStatus }
            : f
        )
      );
      
      toast.success(data.message);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update assignment');
    } finally {
      setAssignmentLoading(prev => ({ ...prev, [`placement_${facultyId}`]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Coordinator Management</h1>
          <p className="text-slate-400">Assign Timetable Incharge and Placement Coordinators</p>
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {faculty.map((fac) => (
            <div
              key={fac.faculty_id}
              className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-slate-600 transition-colors"
            >
              {/* Faculty Header */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">{fac.Name}</h3>
                <p className="text-sm text-slate-400">{fac.designation}</p>
                <p className="text-sm text-slate-500 mt-1">{fac.email}</p>
              </div>

              {/* Current Roles */}
              <div className="mb-6 p-3 bg-slate-700/50 rounded-lg">
                <p className="text-sm font-semibold text-slate-300 mb-2">Current Roles</p>
                <div className="flex flex-wrap gap-2">
                  {fac.is_timetable_incharge && (
                    <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                      <BookOpen className="w-3 h-3" />
                      Timetable Incharge
                    </span>
                  )}
                  {fac.is_placement_coordinator && (
                    <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                      <Award className="w-3 h-3" />
                      Placement Coordinator
                    </span>
                  )}
                  {!fac.is_timetable_incharge && !fac.is_placement_coordinator && (
                    <span className="text-sm text-slate-400 italic">No roles assigned</span>
                  )}
                </div>
              </div>

              {/* Assignment Buttons */}
              <div className="space-y-3">
                {/* Timetable Incharge Button */}
                <button
                  onClick={() => toggleTimetableIncharge(fac.faculty_id, !!fac.is_timetable_incharge)}
                  disabled={assignmentLoading[fac.faculty_id]}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg font-medium transition-all ${
                    fac.is_timetable_incharge
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  } ${
                    assignmentLoading[fac.faculty_id] ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{fac.is_timetable_incharge ? 'Remove' : 'Assign'} Timetable Incharge</span>
                  </div>
                  {assignmentLoading[fac.faculty_id] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : fac.is_timetable_incharge ? (
                    <Check className="w-4 h-4" />
                  ) : null}
                </button>

                {/* Placement Coordinator Button */}
                <button
                  onClick={() => togglePlacementCoordinator(fac.faculty_id, !!fac.is_placement_coordinator)}
                  disabled={assignmentLoading[`placement_${fac.faculty_id}`]}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg font-medium transition-all ${
                    fac.is_placement_coordinator
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  } ${
                    assignmentLoading[`placement_${fac.faculty_id}`] ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>{fac.is_placement_coordinator ? 'Remove' : 'Assign'} Placement Coordinator</span>
                  </div>
                  {assignmentLoading[`placement_${fac.faculty_id}`] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : fac.is_placement_coordinator ? (
                    <Check className="w-4 h-4" />
                  ) : null}
                </button>
              </div>
            </div>
          ))}
        </div>

        {faculty.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No faculty members found in your department</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoordinatorManagement;
