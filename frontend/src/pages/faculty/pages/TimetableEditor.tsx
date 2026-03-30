import { useEffect, useState } from 'react';
import { Grid3x3, Plus, Trash2, Save, Clock, Edit2, X, Users } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/pages/admin/department-admin/components/layout/MainLayout';
import { motion } from 'framer-motion';

interface TimeSlot {
  id: number;
  timetable_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  class_id: number;
  subject_id: number;
  faculty_id: number;
  room_number?: string;
  status: string;
  Faculty?: { id: number; first_name: string; last_name: string };
  Subject?: { id: number; name: string; code: string };
  Class?: { id: number; name: string; year: string };
}

interface Timetable {
  id: number;
  year: string;
  department_id: number;
  session_start: string;
  session_end: string;
  is_published: boolean;
  TimetableSlots?: TimeSlot[];
}

interface AvailableFaculty {
  id: number;
  first_name: string;
  last_name: string;
}

interface BreakTiming {
  id: number;
  year: string;
  break_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  createdAt: string;
}

interface SlotFormData {
  day_of_week: string;
  start_time: string;
  end_time: string;
  class_id: number;
  subject_id: number;
  faculty_id: number;
  room_number: string;
}

interface BreakFormData {
  break_name: string;
  start_time: string;
  end_time: string;
}

interface FacultyInfo {
  facultyId: string;
  facultyName: string;
}

interface FacultyTimetableSlot {
  id: number;
  facultyId: string;
  facultyName: string;
  department: string;
  year: number;
  section: string;
  day: string;
  hour: number;
  subject: string;
  academicYear: string;
  createdAt: string;
  updatedAt: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetableEditor() {
  const { authToken } = useAuth();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
  const [years] = useState<string[]>(['1st', '2nd', '3rd', '4th']);
  const [selectedYear, setSelectedYear] = useState<string>('1st');
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<AvailableFaculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'slots' | 'breaks' | 'faculty-timetable'>('slots');
  
  // Faculty Timetable State
  const [facultyList, setFacultyList] = useState<FacultyInfo[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyInfo | null>(null);
  const [facultyTimetable, setFacultyTimetable] = useState<FacultyTimetableSlot[]>([]);
  const [loadingFacultyTimetable, setLoadingFacultyTimetable] = useState(false);
  
  // Slot Form State
  const [slotFormData, setSlotFormData] = useState<SlotFormData>({
    day_of_week: 'Monday',
    start_time: '08:00',
    end_time: '09:00',
    class_id: 0,
    subject_id: 0,
    faculty_id: 0,
    room_number: ''
  });

  // Break Timing State
  const [breakTimings, setBreakTimings] = useState<BreakTiming[]>([]);
  const [breakFormData, setBreakFormData] = useState<BreakFormData>({
    break_name: '',
    start_time: '',
    end_time: ''
  });
  const [editingBreakId, setEditingBreakId] = useState<number | null>(null);
  const [isSubmittingBreak, setIsSubmittingBreak] = useState(false);

  // no longer fetching department timetables; we only need faculty list

  // old timetable slot fetching logic removed; faculty timetable handled separately

  const fetchAvailableData = async () => {
    try {
      const [classRes, subjectRes] = await Promise.all([
        fetch('/api/v1/classes', { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch('/api/v1/subjects', { headers: { Authorization: `Bearer ${authToken}` } })
      ]);

      const classData = await classRes.json();
      const subjectData = await subjectRes.json();

      setClasses(classData.data || []);
      setSubjects(subjectData.data || []);

      // Faculty endpoint may return 403 for department-admin; fetch separately and ignore 403
      try {
        const facultyRes = await fetch('/api/v1/faculty', { headers: { Authorization: `Bearer ${authToken}` } });
        if (facultyRes.ok) {
          const facultyData = await facultyRes.json();
          setFaculty(facultyData.data || []);
        } else {
          // ignore forbidden or other errors for faculty list
          setFaculty([]);
        }
      } catch (err) {
        console.warn('Failed to fetch /api/v1/faculty (ignored):', err);
        setFaculty([]);
      }
    } catch (error) {
      console.error('Failed to fetch available data:', error);
    }
  };

  // Fetch Break Timings
  const fetchBreakTimings = async (year?: string) => {
    try {
      // department-admin break-timings endpoint expects values like "1st","2nd" etc.
      const endpoint = year
        ? `/api/v1/department-admin/break-timings/year/${year}`
        : '/api/v1/department-admin/break-timings';

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch break timings');
      }
      const data = await response.json();
      setBreakTimings(data.data || []);
    } catch (error) {
      // Don't show toast during render - schedule it for next tick
      setTimeout(() => {
        toast.error('Failed to load break timings');
      }, 0);
      console.error('Error fetching break timings:', error);
    }
  };

  // Fetch all timetables for a given department-year (used by slots/breaks tabs)
  const fetchTimetables = async (year?: string) => {
    try {
      // the backend no longer filters by year, so any value is fine
      const endpoint = year
        ? `/api/v1/department-admin/timetable/department/${year}`
        : '/api/v1/department-admin/timetable/department/1';
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch timetables');
      }
      const data = await response.json();
      setTimetables(data.data || []);
      // optionally reset selection if year changed
      setSelectedTimetable(null);
    } catch (error) {
      // Don't show toast during render - schedule it for next tick
      setTimeout(() => {
        toast.error('Failed to load timetables');
      }, 0);
      console.error('Error fetching timetables:', error);
      // don't disturb user, timetables may not be needed
    }
  };

  // dummy helper to satisfy existing slot-related logic
  const fetchSlotAssignments = async (timetableId: number) => {
    // The original implementation would fetch slot assignments and
    // attach them to selectedTimetable.TimetableSlots. If dept-admin
    // no longer needs this functionality, we can leave it as a no-op.
    try {
      const response = await fetch(`/api/v1/department-admin/timetable/${timetableId}/slots`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return;
      const data = await response.json();
      if (selectedTimetable) {
        setSelectedTimetable({ ...selectedTimetable, TimetableSlots: data.data || [] });
      }
    } catch (err) {
      console.error('Failed to fetch slot assignments', err);
    }
  };

  // Fetch faculty by year for department admin
  const fetchFacultyByYear = async (year: string) => {
    try {
      // convert to simple number if year is like '1st' or '2nd'
      const yearMap: any = { '1st': '1', '2nd': '2', '3rd': '3', '4th': '4' };
      const yearParam = yearMap[year] || year;
      const response = await fetch(`/api/v1/timetable/admin/faculty-by-year/${yearParam}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch faculty list');
      }
      const data = await response.json();
      setFacultyList(data.data || []);
      setSelectedFaculty(null);
      setFacultyTimetable([]);
    } catch (error) {
      // Don't show toast during render - schedule it for next tick
      setTimeout(() => {
        toast.error('Failed to load faculty list');
      }, 0);
      console.error('Error fetching faculty by year:', error);
    }
  };

  // Fetch faculty personal timetable
  const fetchFacultyTimetable = async (facultyId: string) => {
    setLoadingFacultyTimetable(true);
    try {
      const response = await fetch(`/api/v1/timetable/admin/faculty-timetable/${facultyId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch faculty timetable');
      }
      const data = await response.json();
      setFacultyTimetable(data.data || []);
    } catch (error) {
      // Don't show toast during render - schedule it for next tick
      setTimeout(() => {
        toast.error('Failed to load faculty timetable');
      }, 0);
      console.error('Error fetching faculty timetable:', error);
    } finally {
      setLoadingFacultyTimetable(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchTimetables(selectedYear);
      fetchAvailableData();
      fetchBreakTimings(selectedYear);
      fetchFacultyByYear(selectedYear);
    }
  }, [authToken, selectedYear]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTimetable || !slotFormData.class_id || !slotFormData.subject_id || !slotFormData.faculty_id) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch('/api/v1/department-admin/timetable/slots/assign', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timetable_id: selectedTimetable.id,
          ...slotFormData
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign faculty');
      }

      toast.success('Faculty assigned successfully');
      setSlotFormData({
        day_of_week: 'Monday',
        start_time: '08:00',
        end_time: '09:00',
        class_id: 0,
        subject_id: 0,
        faculty_id: 0,
        room_number: ''
      });
      setShowSlotForm(false);
      fetchSlotAssignments(selectedTimetable.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign faculty');
      console.error(error);
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (!window.confirm('Are you sure you want to delete this slot assignment?')) return;

    try {
      const response = await fetch(`/api/v1/department-admin/timetable/slots/${slotId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Slot deleted');
      if (selectedTimetable) {
        fetchSlotAssignments(selectedTimetable.id);
      }
    } catch (error) {
      toast.error('Failed to delete slot');
      console.error(error);
    }
  };

  // Handle Break Timing CRUD
  const handleCreateOrUpdateBreak = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!breakFormData.break_name || !breakFormData.start_time || !breakFormData.end_time) {
      toast.error('All fields are required');
      return;
    }

    if (breakFormData.end_time <= breakFormData.start_time) {
      toast.error('End time must be after start time');
      return;
    }

    setIsSubmittingBreak(true);
    try {
      const method = editingBreakId ? 'PUT' : 'POST';
      const endpoint = editingBreakId
        ? `/api/v1/department-admin/break-timings/${editingBreakId}`
        : '/api/v1/department-admin/break-timings/create';

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...breakFormData,
          year: selectedYear
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save break timing');
      }

      toast.success(editingBreakId ? 'Break timing updated' : 'Break timing created');
      setBreakFormData({
        break_name: '',
        start_time: '',
        end_time: ''
      });
      setEditingBreakId(null);
      fetchBreakTimings(selectedYear);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save break timing');
      console.error(error);
    } finally {
      setIsSubmittingBreak(false);
    }
  };

  const handleEditBreak = (timing: BreakTiming) => {
    setEditingBreakId(timing.id);
    setBreakFormData({
      break_name: timing.break_name,
      start_time: timing.start_time,
      end_time: timing.end_time
    });
  };

  const handleDeleteBreak = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this break timing?')) return;

    try {
      const response = await fetch(`/api/v1/department-admin/break-timings/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Break timing deleted');
      fetchBreakTimings(selectedYear);
    } catch (error) {
      toast.error('Failed to delete break timing');
      console.error(error);
    }
  };

  const handleCancelBreak = () => {
    setEditingBreakId(null);
    setBreakFormData({
      break_name: '',
      start_time: '',
      end_time: ''
    });
  };

  const calculateDuration = () => {
    if (!breakFormData.start_time || !breakFormData.end_time) return 0;
    const [startHours, startMins] = breakFormData.start_time.split(':').map(Number);
    const [endHours, endMins] = breakFormData.end_time.split(':').map(Number);
    const startTotalMins = startHours * 60 + startMins;
    const endTotalMins = endHours * 60 + endMins;
    return Math.max(0, endTotalMins - startTotalMins);
  };


  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Grid3x3 className="w-6 h-6 text-primary" />
            <div>
              <h1 className="page-header font-serif">Timetable Management</h1>
              <p className="text-muted-foreground -mt-4">Create and manage timetables</p>
            </div>
          </div>
          {selectedTimetable && !selectedTimetable.is_published && (
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2">
              <Save className="w-4 h-4" />
              Publish Timetable
            </button>
          )}
        </motion.div>

        {/* Year Selection (department admin) */}
        <div className="bg-muted/40 rounded-lg border border-border p-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  // automatically show faculty timetable tab when year changes
                  setActiveTab('faculty-timetable');
                }}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year} Year
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('slots')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'slots'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid3x3 className="inline w-4 h-4 mr-2" />
            Timetable Slots
          </button>
          <button
            onClick={() => setActiveTab('breaks')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'breaks'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="inline w-4 h-4 mr-2" />
            Break Timings
          </button>
          <button
            onClick={() => setActiveTab('faculty-timetable')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'faculty-timetable'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="inline w-4 h-4 mr-2" />
            Faculty Timetable
          </button>
        </div>

        {/* SLOTS TAB */}
        {activeTab === 'slots' && selectedTimetable && (
          <>
            {/* Add Slot Form */}
              {showSlotForm ? (
              <div className="bg-muted/40 border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Add Faculty to Slot</h2>
                <form onSubmit={handleAddSlot} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Day</label>
                      <select
                        value={slotFormData.day_of_week}
                        onChange={(e) => setSlotFormData({ ...slotFormData, day_of_week: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Class</label>
                      <select
                        value={slotFormData.class_id}
                        onChange={(e) => setSlotFormData({ ...slotFormData, class_id: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={0}>Select Class</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                      <select
                        value={slotFormData.subject_id}
                        onChange={(e) => setSlotFormData({ ...slotFormData, subject_id: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={0}>Select Subject</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Faculty</label>
                      <select
                        value={slotFormData.faculty_id}
                        onChange={(e) => setSlotFormData({ ...slotFormData, faculty_id: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={0}>Select Faculty</option>
                        {faculty.map((fac) => (
                          <option key={fac.id} value={fac.id}>
                            {fac.first_name} {fac.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={slotFormData.start_time}
                        onChange={(e) => setSlotFormData({ ...slotFormData, start_time: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">End Time</label>
                      <input
                        type="time"
                        value={slotFormData.end_time}
                        onChange={(e) => setSlotFormData({ ...slotFormData, end_time: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Room Number (Optional)</label>
                      <input
                        type="text"
                        value={slotFormData.room_number}
                        onChange={(e) => setSlotFormData({ ...slotFormData, room_number: e.target.value })}
                        placeholder="e.g., A-101"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Add to Timetable
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSlotForm(false)}
                      className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowSlotForm(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Slot
              </button>
            )}

            {/* Slots Table */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
              </div>
            ) : selectedTimetable.TimetableSlots && selectedTimetable.TimetableSlots.length > 0 ? (
              <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Day</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Time</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Subject</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Faculty</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Class</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Room</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-600">
                      {selectedTimetable.TimetableSlots.map((slot) => (
                        <tr key={slot.id} className="hover:bg-slate-700">
                          <td className="px-4 py-3 text-sm text-slate-300">{slot.day_of_week}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {slot.start_time} - {slot.end_time}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            <div>{slot.Subject?.name}</div>
                            <div className="text-xs text-slate-500">{slot.Subject?.code}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {slot.Faculty?.first_name} {slot.Faculty?.last_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">{slot.Class?.name}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{slot.room_number || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              slot.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : slot.status === 'pending_approval'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {slot.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
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
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                <Grid3x3 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No slots assigned yet. Create your first timetable slot above.</p>
              </div>
            )}
          </>
        )}

        {/* BREAKS TAB */}
        {activeTab === 'breaks' && (
          <div className="space-y-6">
            {/* Break Timing Form */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Manage Break Timings</h2>

              <form onSubmit={handleCreateOrUpdateBreak} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Break Name</label>
                    <input
                      type="text"
                      value={breakFormData.break_name}
                      onChange={(e) => setBreakFormData({ ...breakFormData, break_name: e.target.value })}
                      placeholder="Enter break name"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={breakFormData.start_time}
                      onChange={(e) => setBreakFormData({ ...breakFormData, start_time: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">End Time</label>
                    <input
                      type="time"
                      value={breakFormData.end_time}
                      onChange={(e) => setBreakFormData({ ...breakFormData, end_time: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {calculateDuration() > 0 && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded p-3">
                    <p className="text-sm text-blue-300">
                      Duration: <span className="font-bold">{calculateDuration()} minutes</span>
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  {editingBreakId && (
                    <button
                      type="button"
                      onClick={handleCancelBreak}
                      className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmittingBreak}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmittingBreak ? 'Saving...' : editingBreakId ? 'Update' : 'Create'} Break Timing
                  </button>
                </div>
              </form>

              {/* Break Timings List */}
              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
                  </div>
                ) : breakTimings.length === 0 ? (
                  <div className="bg-slate-700 border border-slate-600 rounded-lg p-8 text-center">
                    <Clock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No break timings configured for {selectedYear} year</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white">{selectedYear} Year Break Timings</h3>
                    {breakTimings.map((timing) => (
                      <div
                        key={timing.id}
                        className="bg-slate-700 border border-slate-600 rounded-lg p-4 flex items-start justify-between hover:bg-slate-600 transition-colors"
                      >
                        <div>
                          <h4 className="text-lg font-bold text-white">{timing.break_name}</h4>
                          <div className="grid grid-cols-3 gap-6 mt-2 text-sm">
                            <div>
                              <p className="text-slate-400">Start Time</p>
                              <p className="font-medium text-slate-300">{timing.start_time}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">End Time</p>
                              <p className="font-medium text-slate-300">{timing.end_time}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Duration</p>
                              <p className="font-medium text-slate-300">{timing.duration_minutes} minutes</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditBreak(timing)}
                            className="p-2 text-blue-400 hover:bg-slate-500 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBreak(timing.id)}
                            className="p-2 text-red-400 hover:bg-slate-500 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FACULTY TIMETABLE TAB */}
        {activeTab === 'faculty-timetable' && (
          <div className="space-y-6">
            {/* Faculty Selection Section */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Faculty</label>
                  <select
                    value={selectedFaculty?.facultyId || ''}
                    onChange={(e) => {
                      const faculty = facultyList.find((f) => f.facultyId === e.target.value);
                      if (faculty) {
                        setSelectedFaculty(faculty);
                        fetchFacultyTimetable(faculty.facultyId);
                      }
                    }}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select Faculty --</option>
                    {facultyList.map((f) => (
                      <option key={f.facultyId} value={f.facultyId}>
                        {f.facultyName}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedFaculty && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 flex items-center">
                    <div>
                      <p className="text-sm text-blue-300">Selected Faculty</p>
                      <p className="text-lg font-bold text-white">{selectedFaculty.facultyName}</p>
                      <p className="text-sm text-blue-200">ID: {selectedFaculty.facultyId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Faculty Timetable Display */}
            {selectedFaculty && !loadingFacultyTimetable && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Personal Timetable: {selectedFaculty.facultyName}
                </h2>

                {facultyTimetable.length === 0 ? (
                  <div className="bg-slate-700 border border-slate-600 rounded-lg p-8 text-center">
                    <Grid3x3 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No timetable records found for this faculty</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                    {/* Organize timetable by days */}
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                      const daySlots = facultyTimetable.filter((slot) => slot.day === day);
                      return (
                        <div
                          key={day}
                          className="bg-slate-700 border border-slate-600 rounded-lg overflow-hidden hover:border-blue-500 transition-colors"
                        >
                          <div className="bg-blue-900/50 px-4 py-3 border-b border-slate-600">
                            <h3 className="font-bold text-white text-center">{day}</h3>
                          </div>
                          <div className="p-4 space-y-2 min-h-[400px]">
                            {daySlots.length === 0 ? (
                              <p className="text-slate-400 text-sm text-center py-4">No classes</p>
                            ) : (
                              daySlots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className="bg-slate-600 rounded p-2 border-l-4 border-green-500 hover:bg-slate-500 transition-colors"
                                >
                                  <p className="font-bold text-white text-sm">{slot.subject}</p>
                                  <div className="text-xs text-slate-200 mt-1 space-y-0.5">
                                    <p>Hour: {slot.hour}</p>
                                    <p>Year: {slot.year} | Sec: {slot.section}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Detailed Table View */}
                {facultyTimetable.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-white mb-4">Detailed View</h3>
                    <div className="overflow-x-auto bg-slate-700 border border-slate-600 rounded-lg">
                      <table className="w-full text-sm text-left text-slate-300">
                        <thead className="bg-slate-800 border-b border-slate-600">
                          <tr>
                            <th className="px-6 py-3">Day</th>
                            <th className="px-6 py-3">Hour</th>
                            <th className="px-6 py-3">Subject</th>
                            <th className="px-6 py-3">Year</th>
                            <th className="px-6 py-3">Section</th>
                            <th className="px-6 py-3">Academic Year</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-600">
                          {facultyTimetable.map((slot) => (
                            <tr key={slot.id} className="hover:bg-slate-600 transition-colors">
                              <td className="px-6 py-4 font-medium text-white">{slot.day}</td>
                              <td className="px-6 py-4">{slot.hour}</td>
                              <td className="px-6 py-4 font-semibold text-green-400">{slot.subject}</td>
                              <td className="px-6 py-4">{slot.year}</td>
                              <td className="px-6 py-4">{slot.section}</td>
                              <td className="px-6 py-4">{slot.academicYear}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {selectedFaculty && loadingFacultyTimetable && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400" />
              </div>
            )}

            {/* No Faculty Selected */}
            {!selectedFaculty && (
              <div className="bg-slate-700 border border-slate-600 rounded-lg p-8 text-center">
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">Select a faculty to view their personal timetable</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
