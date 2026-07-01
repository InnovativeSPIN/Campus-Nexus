import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Megaphone,
  Send,
  Clock,
  CheckCircle,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/pages/faculty/hooks/use-toast';

interface ExamNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  targetRole: string[];
  created_at: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<ExamNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'general',
  });
  
  // Target roles (multi-select representation)
  const [targets, setTargets] = useState({
    student: true,
    faculty: true,
    'department-admin': false,
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/exam-cell/notifications', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const result = await response.json();
      if (result.success) {
        // Handle targetRole parse if returned as string from DB or format
        const formatted = (result.data || []).map((n: any) => {
          let roles = n.targetRole;
          if (typeof roles === 'string') {
            try {
              roles = JSON.parse(roles);
            } catch {
              roles = [roles];
            }
          }
          return {
            ...n,
            targetRole: Array.isArray(roles) ? roles : [roles]
          };
        });
        setNotifications(formatted);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRoleToggle = (role: 'student' | 'faculty' | 'department-admin') => {
    setTargets(prev => ({ ...prev, [role]: !prev[role] }));
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields before broadcasting.",
        variant: "destructive",
      });
      return;
    }

    const selectedRoles = Object.keys(targets).filter(
      key => targets[key as keyof typeof targets]
    );

    if (selectedRoles.length === 0) {
      toast({
        title: "Target Required",
        description: "Please select at least one target audience role.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/exam-cell/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: form.title,
          message: form.message,
          type: form.type,
          targetRole: selectedRoles
        })
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Broadcast Sent!",
          description: "Your notification was sent and added to announcements.",
        });
        setForm({ title: '', message: '', type: 'general' });
        // Refresh history
        fetchNotifications();
      } else {
        toast({
          title: "Broadcast Failed",
          description: result.error || "Failed to send notification.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif text-foreground">Exam Cell Broadcast Center</h1>
        <p className="text-muted-foreground text-sm">Send academic notifications or announce grade releases</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Create Broadcast Form */}
        <Card className="lg:col-span-1 border border-border/60 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="font-serif">New Broadcast</CardTitle>
            <CardDescription>Dispatch a campus announcement</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notification Title</label>
                <Input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Model Exam Timetable Released"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Announcement Type</label>
                <Select value={form.type} onValueChange={val => setForm(f => ({ ...f, type: val }))}>
                  <SelectTrigger className="h-10 bg-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General announcement</SelectItem>
                    <SelectItem value="marks_submitted">Marks submission audit</SelectItem>
                    <SelectItem value="result_published">Results published notice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Audience</label>
                <div className="space-y-2 border rounded-xl p-3 bg-muted/10">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={targets.student}
                      onChange={() => handleRoleToggle('student')}
                      className="rounded text-primary focus:ring-primary h-4 w-4"
                    />
                    Students (Announcement)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={targets.faculty}
                      onChange={() => handleRoleToggle('faculty')}
                      className="rounded text-primary focus:ring-primary h-4 w-4"
                    />
                    Faculty Members
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={targets['department-admin']}
                      onChange={() => handleRoleToggle('department-admin')}
                      className="rounded text-primary focus:ring-primary h-4 w-4"
                    />
                    HODs / Department Admins
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message Content</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Draft your detailed message here..."
                  className="w-full p-3 border rounded-xl bg-background text-sm h-32 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <Button type="submit" disabled={sending} className="w-full gap-2 h-10 font-bold">
                <Send className="h-4 w-4" /> {sending ? 'Broadcasting...' : 'Send Broadcast'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sent History */}
        <Card className="lg:col-span-2 border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif">Broadcast Log</CardTitle>
            <CardDescription>Auditable record of dispatched notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed p-6">
                <Bell className="h-10 w-10 opacity-30 mb-2" />
                <p className="font-semibold text-sm">No notification history</p>
                <p className="text-xs">Broadcast logs will appear here when you send a message.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {notifications.map((notif, idx) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border rounded-xl p-4 bg-muted/10 hover:bg-muted/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          notif.type === 'result_published' ? 'bg-green-100 text-green-700' :
                          notif.type === 'marks_submitted' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {notif.type.replace('_', ' ')}
                        </span>
                        <h4 className="font-bold text-sm text-foreground">{notif.title}</h4>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(notif.created_at || (notif as any).createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed bg-background/50 border border-border/40 p-2.5 rounded-lg">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>Audience: </span>
                      <div className="flex flex-wrap gap-1">
                        {notif.targetRole.map(role => (
                          <span key={role} className="bg-primary/5 text-primary border border-primary/10 px-1.5 py-0.2 rounded font-mono">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
