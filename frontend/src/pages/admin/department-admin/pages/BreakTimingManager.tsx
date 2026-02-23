import { useEffect, useState } from 'react';
import { Clock, Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface BreakTiming {
  id: number;
  year: string;
  break_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  createdAt: string;
}

interface FormData {
  year: string;
  break_name: string;
  start_time: string;
  end_time: string;
}

export default function BreakTimingManager() {
  const { authToken } = useAuth();
  const [breakTimings, setBreakTimings] = useState<BreakTiming[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('1st');
  const [formData, setFormData] = useState<FormData>({
    year: '1st',
    break_name: '',
    start_time: '',
    end_time: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBreakTimings = async (year?: string) => {
    setLoading(true);
    try {
      const endpoint = year
        ? `/api/v1/department-admin/break-timings/year/${year}`
        : '/api/v1/department-admin/break-timings';

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch break timings');
      const data = await response.json();
      setBreakTimings(data.data || []);
    } catch (error) {
      toast.error('Failed to load break timings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchBreakTimings(selectedYear);
    }
  }, [authToken, selectedYear]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.break_name || !formData.start_time || !formData.end_time) {
      toast.error('All fields are required');
      return;
    }

    if (formData.end_time <= formData.start_time) {
      toast.error('End time must be after start time');
      return;
    }

    setIsSubmitting(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId
        ? `/api/v1/department-admin/break-timings/${editingId}`
        : '/api/v1/department-admin/break-timings/create';

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          year: selectedYear
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save break timing');
      }

      toast.success(editingId ? 'Break timing updated' : 'Break timing created');
      setFormData({
        year: selectedYear,
        break_name: '',
        start_time: '',
        end_time: ''
      });
      setEditingId(null);
      fetchBreakTimings(selectedYear);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save break timing');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (timing: BreakTiming) => {
    setEditingId(timing.id);
    setFormData({
      year: timing.year,
      break_name: timing.break_name,
      start_time: timing.start_time,
      end_time: timing.end_time
    });
  };

  const handleDelete = async (id: number) => {
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

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      year: selectedYear,
      break_name: '',
      start_time: '',
      end_time: ''
    });
  };

  const calculateDuration = () => {
    if (!formData.start_time || !formData.end_time) return 0;
    const [startHours, startMins] = formData.start_time.split(':').map(Number);
    const [endHours, endMins] = formData.end_time.split(':').map(Number);
    const startTotalMins = startHours * 60 + startMins;
    const endTotalMins = endHours * 60 + endMins;
    return Math.max(0, endTotalMins - startTotalMins);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Break Timing Manager</h1>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Configure Break Timings</h2>

          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    handleCancel();
                  }}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Break Name (e.g., Mid Break, Tea Break)
              </label>
              <input
                type="text"
                value={formData.break_name}
                onChange={(e) => setFormData({ ...formData, break_name: e.target.value })}
                placeholder="Enter break name"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
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
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'} Break Timing
            </button>
          </div>
        </form>
      </div>

        {/* Break Timings List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
            </div>
          ) : breakTimings.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
              <Clock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">No break timings configured for {selectedYear} year</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">{selectedYear} Year Break Timings</h2>
              {breakTimings.map((timing) => (
                <div
                  key={timing.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-start justify-between hover:bg-slate-700 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{timing.break_name}</h3>
                    <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
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

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(timing)}
                      className="p-2 text-blue-400 hover:bg-slate-600 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(timing.id)}
                      className="p-2 text-red-400 hover:bg-slate-600 rounded-lg transition-colors"
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
  );
}
