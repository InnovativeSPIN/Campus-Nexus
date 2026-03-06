import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface Alteration {
  id: number;
  semester: number;
  slot_id: number;
  old_faculty_id: number;
  new_faculty_id: number;
  reason: string;
  proposed_date: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function TimetableAlteration() {
  const { user, refreshUserData } = useAuth();
  const refreshedRef = useRef(false);
  const [alterations, setAlterations] = useState<Alteration[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    semester: '',
    slot_id: '',
    old_faculty_id: '',
    new_faculty_id: '',
    reason: '',
    proposed_date: '',
  });

  useEffect(() => {
    // Refresh user data once when component mounts to get latest coordinator status
    if (!refreshedRef.current) {
      refreshedRef.current = true;
      refreshUserData();
    }
  }, [refreshUserData]);

  useEffect(() => {
    if (user?.is_timetable_incharge) {
      fetchAlterations();
    }
  }, [user?.is_timetable_incharge]);

  const checkIfTimetableIncharge = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Access Denied</h2>
          <p className="text-slate-400 text-center">
            You are not assigned as a Timetable Incharge. Please contact your Department Admin.
          </p>
        </div>
      </div>
    );
  };

  const fetchAlterations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/faculty/timetable/alterations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch alterations');

      const data = await response.json();
      setAlterations(data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load timetable alterations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.semester || !formData.slot_id || !formData.old_faculty_id || !formData.new_faculty_id || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `/api/v1/faculty/timetable/alterations/${editingId}`
        : '/api/v1/faculty/timetable/alterations';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save alteration');

      await fetchAlterations();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        semester: '',
        slot_id: '',
        old_faculty_id: '',
        new_faculty_id: '',
        reason: '',
        proposed_date: '',
      });

      toast.success(editingId ? 'Alteration updated successfully' : 'Alteration created successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save alteration');
    } finally {
      setLoading(false);
    }
  };

  const deleteAlteration = async (id: number) => {
    if (!confirm('Are you sure you want to delete this alteration?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/faculty/timetable/alterations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete alteration');

      await fetchAlterations();
      toast.success('Alteration deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete alteration');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (!user?.is_timetable_incharge) {
    return checkIfTimetableIncharge();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Timetable Alterations</h1>
            <p className="text-slate-400">Manage timetable change requests</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Alteration
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? 'Edit Alteration' : 'Create New Alteration'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Semester *</label>
                  <input
                    type="number"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="Enter semester"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Slot ID *</label>
                  <input
                    type="number"
                    value={formData.slot_id}
                    onChange={(e) => setFormData({ ...formData, slot_id: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="Enter slot ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Old Faculty ID *</label>
                  <input
                    type="number"
                    value={formData.old_faculty_id}
                    onChange={(e) => setFormData({ ...formData, old_faculty_id: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="Enter old faculty ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">New Faculty ID *</label>
                  <input
                    type="number"
                    value={formData.new_faculty_id}
                    onChange={(e) => setFormData({ ...formData, new_faculty_id: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="Enter new faculty ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Proposed Date</label>
                  <input
                    type="date"
                    value={formData.proposed_date}
                    onChange={(e) => setFormData({ ...formData, proposed_date: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Reason *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                  rows={3}
                  placeholder="Enter reason for alteration"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editingId ? 'Update' : 'Create'} Alteration
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      semester: '',
                      slot_id: '',
                      old_faculty_id: '',
                      new_faculty_id: '',
                      reason: '',
                      proposed_date: '',
                    });
                  }}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Alterations List */}
        {loading && !showForm ? (
          <div className="flex items-center justify-center min-h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {alterations.map((alteration) => (
              <div
                key={alteration.id}
                className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-slate-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(alteration.status)}
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Semester {alteration.semester} - Slot {alteration.slot_id}
                      </h3>
                      <p className="text-sm text-slate-400 capitalize">
                        Status: <span className="font-medium">{alteration.status}</span>
                      </p>
                    </div>
                  </div>
                  {alteration.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(alteration.id);
                          setFormData({
                            semester: alteration.semester.toString(),
                            slot_id: alteration.slot_id.toString(),
                            old_faculty_id: alteration.old_faculty_id.toString(),
                            new_faculty_id: alteration.new_faculty_id.toString(),
                            reason: alteration.reason,
                            proposed_date: alteration.proposed_date?.split('T')[0] || '',
                          });
                          setShowForm(true);
                        }}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => deleteAlteration(alteration.id)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-400">From Faculty ID</p>
                    <p className="text-white font-medium">{alteration.old_faculty_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">To Faculty ID</p>
                    <p className="text-white font-medium">{alteration.new_faculty_id}</p>
                  </div>
                  {alteration.proposed_date && (
                    <div>
                      <p className="text-sm text-slate-400">Proposed Date</p>
                      <p className="text-white font-medium">
                        {new Date(alteration.proposed_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-400">Created</p>
                    <p className="text-white font-medium">
                      {new Date(alteration.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Reason</p>
                  <p className="text-slate-300">{alteration.reason}</p>
                </div>
              </div>
            ))}

            {alterations.length === 0 && (
              <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No timetable alterations yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
