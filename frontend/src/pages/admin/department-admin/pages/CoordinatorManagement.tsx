import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Users, BookOpen, Award, Loader2, Check, Calendar, Clock } from 'lucide-react';
import { MainLayout } from '@/pages/admin/department-admin/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { IntegratedNotificationBell } from '@/components/common/IntegratedNotificationBell';

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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between"
      >
        <div>
          <h1 className="page-header font-serif">Coordinator Management</h1>
          <p className="text-muted-foreground -mt-4">
            Assign Timetable Incharge and Placement Coordinators
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {formatDate(currentTime)}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-secondary" />
              {formatTime(currentTime)}
            </p>
          </div>
          <IntegratedNotificationBell />
        </div>
      </motion.div>

      {/* Faculty Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {faculty.length > 0 ? (
          faculty.map((fac, index) => (
            <motion.div
              key={fac.faculty_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="widget-card hover:shadow-lg transition-all"
            >
              {/* Faculty Header */}
              <div className="mb-5 pb-4 border-b border-border">
                <h3 className="text-lg font-bold text-foreground">{fac.Name}</h3>
                <p className="text-sm text-secondary font-medium mt-1">{fac.designation}</p>
                <p className="text-sm text-muted-foreground mt-1">{fac.email}</p>
              </div>

              {/* Current Roles */}
              <div className="mb-6 p-4 bg-muted/40 rounded-lg border border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Current Roles
                </p>
                <div className="flex flex-wrap gap-2">
                  {fac.is_timetable_incharge && (
                    <span className="inline-flex items-center gap-1.5 bg-blue-500/15 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-500/30">
                      <BookOpen className="w-3.5 h-3.5" />
                      Timetable Incharge
                    </span>
                  )}
                  {fac.is_placement_coordinator && (
                    <span className="inline-flex items-center gap-1.5 bg-green-500/15 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-medium border border-green-200 dark:border-green-500/30">
                      <Award className="w-3.5 h-3.5" />
                      Placement Coordinator
                    </span>
                  )}
                  {!fac.is_timetable_incharge && !fac.is_placement_coordinator && (
                    <span className="text-xs text-muted-foreground italic">No roles assigned</span>
                  )}
                </div>
              </div>

              {/* Assignment Buttons */}
              <div className="space-y-2.5">
                {/* Timetable Incharge Button */}
                <button
                  onClick={() => toggleTimetableIncharge(fac.faculty_id, !!fac.is_timetable_incharge)}
                  disabled={assignmentLoading[fac.faculty_id]}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg font-medium transition-all ${
                    fac.is_timetable_incharge
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      : 'bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-blue-500/30'
                  } ${
                    assignmentLoading[fac.faculty_id] ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">
                      {fac.is_timetable_incharge ? 'Remove' : 'Assign'} Timetable
                    </span>
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
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg font-medium transition-all ${
                    fac.is_placement_coordinator
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                      : 'bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-green-500/30'
                  } ${
                    assignmentLoading[`placement_${fac.faculty_id}`] ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span className="text-sm">
                      {fac.is_placement_coordinator ? 'Remove' : 'Assign'} Placement
                    </span>
                  </div>
                  {assignmentLoading[`placement_${fac.faculty_id}`] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : fac.is_placement_coordinator ? (
                    <Check className="w-4 h-4" />
                  ) : null}
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-16 text-center"
          >
            <Users className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              No faculty members found in your department
            </p>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default CoordinatorManagement;
