import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { MainLayout } from '@/pages/faculty/components/layout/MainLayout';
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      <MainLayout>
        <div className="flex items-center justify-center py-20 px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-8 md:p-12 max-w-lg text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Access Denied</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              You are not assigned as a <span className="text-primary font-semibold">Timetable Incharge</span>. 
              Please contact your Department Admin to gain access to this page.
            </p>
            <div className="w-full h-px bg-border/50 mb-8" />
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
              EduVertex Academic Management System
            </p>
          </motion.div>
        </div>
      </MainLayout>
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
      setAlterations(data.data || []);
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
      const url = editingId 
        ? `/api/v1/faculty/timetable/alterations/${editingId}`
        : '/api/v1/faculty/timetable/alterations';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save alteration');

      toast.success(editingId ? 'Alteration updated' : 'Alteration requested successfully');
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
      fetchAlterations();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save alteration');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (alt: Alteration) => {
    setEditingId(alt.id);
    setFormData({
      semester: alt.semester.toString(),
      slot_id: alt.slot_id.toString(),
      old_faculty_id: alt.old_faculty_id.toString(),
      new_faculty_id: alt.new_faculty_id.toString(),
      reason: alt.reason,
      proposed_date: alt.proposed_date ? alt.proposed_date.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const deleteAlteration = async (id: number) => {
    if (!confirm('Are you sure you want to delete this alteration request?')) return;

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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  if (!user?.is_timetable_incharge) {
    return checkIfTimetableIncharge();
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Timetable Alterations</h1>
            <p className="text-muted-foreground text-lg">Manage and track timetable change requests across the department</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (showForm) {
                setEditingId(null);
                setFormData({
                  semester: '', slot_id: '', old_faculty_id: '',
                  new_faculty_id: '', reason: '', proposed_date: ''
                });
              }
              setShowForm(!showForm);
            }}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
              showForm 
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {showForm ? <XIcon className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Cancel Request' : 'New Alteration Request'}
          </motion.button>
        </motion.div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Edit2 className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-foreground">
                    {editingId ? 'Edit Alteration Request' : 'New Alteration Details'}
                  </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Semester *</label>
                      <input
                        type="number"
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className="w-full bg-muted border border-border rounded-xl px-5 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="e.g. 5"
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Slot ID *</label>
                      <input
                        type="number"
                        value={formData.slot_id}
                        onChange={(e) => setFormData({ ...formData, slot_id: e.target.value })}
                        className="w-full bg-muted border border-border rounded-xl px-5 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="Slot number"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Proposed Date</label>
                      <input
                        type="date"
                        value={formData.proposed_date}
                        onChange={(e) => setFormData({ ...formData, proposed_date: e.target.value })}
                        className="w-full bg-muted border border-border rounded-xl px-5 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Current Faculty ID *</label>
                      <input
                        type="number"
                        value={formData.old_faculty_id}
                        onChange={(e) => setFormData({ ...formData, old_faculty_id: e.target.value })}
                        className="w-full bg-muted border border-border rounded-xl px-5 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="Enter faculty ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">New Faculty ID *</label>
                      <input
                        type="number"
                        value={formData.new_faculty_id}
                        onChange={(e) => setFormData({ ...formData, new_faculty_id: e.target.value })}
                        className="w-full bg-muted border border-border rounded-xl px-5 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="Enter replacement ID"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Reason for Alteration *</label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full bg-muted border border-border rounded-xl px-5 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-h-[120px]"
                      placeholder="Explain why this change is needed..."
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-8 py-3 rounded-xl border border-border font-bold text-muted-foreground hover:bg-muted transition-all"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2"
                    >
                      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                      {editingId ? 'Update Request' : 'Submit Alteration Request'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content List */}
        <div className="space-y-6">
          {loading && !showForm ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground font-medium">Synchronizing alteration records...</p>
            </div>
          ) : alterations.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-card rounded-2xl border border-border border-dashed"
            >
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-serif font-bold text-foreground">No Alteration History</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                Any timetable alterations you request as the incharge will appear here.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {alterations.map((alt, idx) => (
                <motion.div
                  key={alt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-card hover:bg-accent/5 transition-all duration-300 rounded-2xl border border-border p-6 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row gap-6 md:items-center flex-1">
                      <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shrink-0 border border-secondary/20">
                        <span className="text-xl font-serif font-bold">S{alt.semester}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-foreground">Alteration Slot #{alt.slot_id}</h3>
                          <span className={`${getStatusBadgeClass(alt.status)} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border`}>
                            {alt.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{new Date(alt.proposed_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <UserIcon className="w-4 h-4 text-secondary" />
                            <span>F-{alt.old_faculty_id}  F-{alt.new_faculty_id}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 italic mt-2">
                          "{alt.reason}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                      <div className="mr-0 lg:mr-8 flex flex-col items-end">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(alt.status)}
                          <span className="text-sm font-serif font-bold capitalize text-foreground">{alt.status}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1 italic">
                          ID: #{alt.id}
                        </span>
                      </div>
                      
                      {alt.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(alt)}
                            className="p-2.5 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-all border border-border"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteAlteration(alt.id)}
                            className="p-2.5 bg-muted hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-all border border-border"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

const XIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
