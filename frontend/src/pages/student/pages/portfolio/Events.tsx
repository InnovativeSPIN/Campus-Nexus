import { useState, useEffect } from 'react';
import SectionCard from '@/pages/student/components/common/SectionCard';
import Badge from '@/pages/student/components/common/Badge';
import { Edit, Trash2, Plus, Save, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/pages/student/components/ui/dialog';
import { useToast } from '@/pages/student/hooks/use-toast';
import {
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '@/pages/student/services/studentApi';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface Event {
  id: string;
  eventName: string;
  eventDate: string;
  eventType: string;
  organizer?: string;
  role: string;
  achievement?: string;
  level: string;
  approvalStatus?: ApprovalStatus;
  certificateUrl?: string;
}

interface EventFormData extends Omit<Event, 'id'> {
  document?: File | null;
}

interface EventsProps {
  onPendingChange?: (hasPending: boolean) => void;
}

const emptyForm: EventFormData = {
  eventName: '',
  eventDate: '',
  eventType: 'other',
  organizer: '',
  role: 'participant',
  achievement: '',
  level: 'college',
  approvalStatus: 'pending',
  certificateUrl: '',
  document: null,
};

export default function Events({ onPendingChange }: EventsProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>(emptyForm);

  useEffect(() => {
    setLoading(true);
    getMyEvents()
      .then((res: any) => setEvents(res.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (event: Event) => {
    setEditingId(event.id);
    setFormData({ ...event, document: null });
    setShowDialog(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast({ title: 'Event deleted successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete.', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!formData.eventName.trim() || !formData.eventDate) {
      toast({ title: 'Error', description: 'Event name and date are required.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const submitData = new FormData();
    submitData.append('eventName', formData.eventName);
    submitData.append('eventDate', formData.eventDate);
    submitData.append('eventType', formData.eventType);
    if (formData.organizer) submitData.append('organizer', formData.organizer);
    submitData.append('role', formData.role);
    if (formData.achievement) submitData.append('achievement', formData.achievement);
    submitData.append('level', formData.level);

    if (formData.document) {
      submitData.append('certificateUrl', formData.document);
    }

    try {
      if (editingId) {
        const res: any = await updateEvent(editingId, submitData);
        setEvents((prev) => prev.map((e) => (e.id === editingId ? res.data : e)));
        toast({ title: 'Request Submitted', description: 'Changes submitted for faculty approval.' });
      } else {
        const res: any = await createEvent(submitData);
        setEvents((prev) => [res.data, ...prev]);
        toast({ title: 'Request Submitted', description: 'Event submitted for faculty approval.' });
      }
      if (onPendingChange) onPendingChange(true);
      setShowDialog(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const getApprovalBadgeVariant = (status?: ApprovalStatus): 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">No events added yet.</div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <SectionCard
              key={event.id}
              title={event.eventName}
              actions={
                event.approvalStatus !== 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(event)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(event.id)} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              }
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Date: {event.eventDate}</p>
                  <p className="text-sm text-muted-foreground">Type: {event.eventType}</p>
                  <p className="text-sm text-muted-foreground">Role: {event.role}</p>
                  {event.achievement && <p className="text-sm text-muted-foreground">Achievement: {event.achievement}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant="info">{event.level}</Badge>
                  <Badge variant={getApprovalBadgeVariant(event.approvalStatus)}>{event.approvalStatus || 'pending'}</Badge>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            <DialogDescription>Fill in the details about your event participation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Event Name *</label>
              <input type="text" placeholder="e.g., Annual Tech Fest" value={formData.eventName} onChange={(e) => setFormData({ ...formData, eventName: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Event Date *</label>
              <input type="date" value={formData.eventDate} onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Event Type</label>
              <select value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg bg-background">
                <option value="cultural">Cultural</option>
                <option value="technical">Technical</option>
                <option value="sports">Sports</option>
                <option value="social">Social</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Organizer</label>
              <input type="text" placeholder="e.g., College, District Org" value={formData.organizer || ''} onChange={(e) => setFormData({ ...formData, organizer: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg bg-background">
                <option value="participant">Participant</option>
                <option value="organizer">Organizer</option>
                <option value="volunteer">Volunteer</option>
                <option value="speaker">Speaker</option>
                <option value="judge">Judge</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Level</label>
              <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg bg-background">
                <option value="college">College</option>
                <option value="district">District</option>
                <option value="state">State</option>
                <option value="national">National</option>
                <option value="international">International</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Achievement</label>
              <input type="text" placeholder="e.g., 1st Place, Best Speaker" value={formData.achievement || ''} onChange={(e) => setFormData({ ...formData, achievement: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Upload Certificate (Optional)</label>
              <input type="file" onChange={(e) => setFormData({ ...formData, document: e.target.files?.[0] || null })} className="w-full px-3 py-1.5 border border-input rounded-lg bg-background" accept=".jpg,.jpeg,.png,.pdf" />
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <DialogClose asChild>
                <button onClick={handleCancel} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
              </DialogClose>
              <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Submit'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
