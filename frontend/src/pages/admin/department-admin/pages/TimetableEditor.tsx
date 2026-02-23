import { useEffect, useState } from 'react';
import { Grid3x3, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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

interface FormData {
  day_of_week: string;
  start_time: string;
  end_time: string;
  class_id: number;
  subject_id: number;
  faculty_id: number;
  room_number: string;
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
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    day_of_week: 'Monday',
    start_time: '08:00',
    end_time: '09:00',
    class_id: 0,
    subject_id: 0,
    faculty_id: 0,
    room_number: ''
  });

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/department-admin/timetable/department/${selectedYear}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch timetables');
      const data = await response.json();
      setTimetables(data.data);
      if (data.data.length > 0) {
        setSelectedTimetable(data.data[0]);
        fetchSlotAssignments(data.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load timetables');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlotAssignments = async (timetableId: number) => {
    try {
      const response = await fetch(`/api/v1/department-admin/timetable/${timetableId}/slots`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch slot assignments');
      const data = await response.json();
      setTimetables((prev) =>
        prev.map((t) => (t.id === timetableId ? { ...t, TimetableSlots: data.data } : t))
      );
    } catch (error) {
      console.error('Failed to fetch slot assignments:', error);
    }
  };

  const fetchAvailableData = async () => {
    try {
      const [classRes, subjectRes, facultyRes] = await Promise.all([
        fetch('/api/v1/classes', {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        fetch('/api/v1/subjects', {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        fetch('/api/v1/faculty', {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ]);

      const classData = await classRes.json();
      const subjectData = await subjectRes.json();
      const facultyData = await facultyRes.json();

      setClasses(classData.data || []);
      setSubjects(subjectData.data || []);
      setFaculty(facultyData.data || []);
    } catch (error) {
      console.error('Failed to fetch available data:', error);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchTimetables();
      fetchAvailableData();
    }
  }, [authToken, selectedYear]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTimetable || !formData.class_id || !formData.subject_id || !formData.faculty_id) {
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
          ...formData
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign faculty');
      }

      toast.success('Faculty assigned successfully');
      setFormData({
        day_of_week: 'Monday',
        start_time: '08:00',
        end_time: '09:00',
        class_id: 0,
        subject_id: 0,
        faculty_id: 0,
        room_number: ''
      });
      setShowForm(false);
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Grid3x3 className="w-6 h-6 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Timetable Editor</h1>
          </div>
          {selectedTimetable && !selectedTimetable.is_published && (
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2">
              <Save className="w-4 h-4" />
              Publish Timetable
            </button>
          )}
        </div>

        {/* Timetable Selection */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year} Year
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Select Timetable</label>
            <select
              value={selectedTimetable?.id || ''}
              onChange={(e) => {
                const timetable = timetables.find((t) => t.id === parseInt(e.target.value));
                if (timetable) {
                  setSelectedTimetable(timetable);
                  fetchSlotAssignments(timetable.id);
                }
              }}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a timetable</option>
              {timetables.map((timetable) => (
                <option key={timetable.id} value={timetable.id}>
                  {timetable.session_start} - {timetable.session_end}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

        {/* Add Slot Form */}
        {selectedTimetable && (
          <>
            {showForm ? (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Add Faculty to Slot</h2>
                <form onSubmit={handleAddSlot} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Day</label>
                      <select
                        value={formData.day_of_week}
                        onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
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
                      value={formData.class_id}
                      onChange={(e) => setFormData({ ...formData, class_id: parseInt(e.target.value) })}
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
                      value={formData.subject_id}
                      onChange={(e) => setFormData({ ...formData, subject_id: parseInt(e.target.value) })}
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
                      value={formData.faculty_id}
                      onChange={(e) => setFormData({ ...formData, faculty_id: parseInt(e.target.value) })}
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
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">End Time</label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Room Number (Optional)</label>
                    <input
                      type="text"
                      value={formData.room_number}
                      onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
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
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Slot
              </button>
            )}
          </>
        )}

        {/* Timetable Grid */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
          </div>
        ) : selectedTimetable && selectedTimetable.TimetableSlots && selectedTimetable.TimetableSlots.length > 0 ? (
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
      </div>
    </div>
  );
}
