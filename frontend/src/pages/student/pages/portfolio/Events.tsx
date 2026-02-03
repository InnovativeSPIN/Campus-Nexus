import { useState } from 'react';
import SectionCard from '@/pages/student/components/common/SectionCard';
import Badge from '@/pages/student/components/common/Badge';
import { Edit, Trash2, Plus, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/pages/student/components/ui/dialog';
import { useToast } from '@/pages/student/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  date: string;
  category: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  location: string;
}

const initialEvents: Event[] = [
  {
    id: '1',
    name: 'Annual Sports Day',
    date: '2024-03-15',
    category: 'Sports',
    status: 'upcoming',
    location: 'Main Ground',
  },
  {
    id: '2',
    name: 'Cultural Fest',
    date: '2024-04-20',
    category: 'Cultural',
    status: 'upcoming',
    location: 'Auditorium',
  },
  {
    id: '3',
    name: 'Debate Competition',
    date: '2024-02-10',
    category: 'Academic',
    status: 'completed',
    location: 'Conference Hall',
  },
];

export default function Events() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Event>({
    id: '',
    name: '',
    date: '',
    category: '',
    status: 'upcoming',
    location: '',
  });

  const handleEdit = (event: Event) => {
    setEditingId(event.id);
    setFormData(event);
    setShowDialog(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      id: Math.random().toString(),
      name: '',
      date: '',
      category: '',
      status: 'upcoming',
      location: '',
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setEvents(events.filter(e => e.id !== id));
    setIsSaving(false);
    toast({
      title: 'Success',
      description: 'Event deleted successfully.',
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Event name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.date) {
      toast({
        title: 'Error',
        description: 'Event date is required.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (editingId) {
      setEvents(events.map(e => e.id === editingId ? formData : e));
      toast({
        title: 'Success',
        description: 'Event updated successfully.',
      });
    } else {
      setEvents([...events, formData]);
      toast({
        title: 'Success',
        description: 'Event added successfully.',
      });
    }

    setIsSaving(false);
    setShowDialog(false);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setEditingId(null);
    setFormData({
      id: '',
      name: '',
      date: '',
      category: '',
      status: 'upcoming',
      location: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      <div className="grid gap-4">

        {events.map((event) => (
          <SectionCard
            key={event.id}
            title={event.name}
            className="cursor-pointer hover:shadow-md transition-shadow"
            actions={
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  disabled={isSaving}
                  className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            }
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Date: {event.date}</p>
                <p className="text-sm text-muted-foreground">Location: {event.location}</p>
                <p className="text-sm text-muted-foreground">Category: {event.category}</p>
              </div>
              <Badge variant={event.status === 'upcoming' ? 'info' : event.status === 'completed' ? 'success' : 'danger'}>
                {event.status}
              </Badge>
            </div>
          </SectionCard>
        ))}

        {/* Edit/Add Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Event' : 'Add New Event'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event Name *</label>
                <input
                  type="text"
                  placeholder="Enter event name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  placeholder="e.g., Sports, Cultural, Academic"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Enter event location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'upcoming' | 'completed' | 'cancelled' })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <DialogClose asChild>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </DialogClose>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}


