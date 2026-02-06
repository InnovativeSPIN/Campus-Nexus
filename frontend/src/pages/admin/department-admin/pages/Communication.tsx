import { useState, useEffect } from "react";
import { MainLayout } from "@/pages/admin/department-admin/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/admin/department-admin/components/ui/button";
import { Input } from "@/pages/admin/department-admin/components/ui/input";
import { Textarea } from "@/pages/admin/department-admin/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/admin/department-admin/components/ui/tabs";
import { Badge } from "@/pages/admin/department-admin/components/ui/badge";
import {
  MessageSquare,
  Bell,
  Send,
  Megaphone,
  Search,
  Plus,
  X,
  Download,
  Trash2,
} from "lucide-react";
import { cn } from "@/pages/admin/department-admin/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  category: string;
  targetRole: string[];
  department?: string;
  createdBy: { _id: string; name: string };
  createdAt: string;
  attachments: { name: string; url: string; type: string }[];
}

interface Query {
  id: string;
  student: string;
  rollNo: string;
  subject: string;
  message: string;
  date: string;
  status: "pending" | "replied";
  reply?: string;
}

const mockQueries: Query[] = [
  {
    id: "1",
    student: "Aditya Kumar",
    rollNo: "CSE001",
    subject: "Data Structures",
    message: "Sir, I have doubt in the time complexity analysis of QuickSort. Can you please explain the worst case scenario?",
    date: "2024-01-19",
    status: "pending",
  },
  {
    id: "2",
    student: "Priya Sharma",
    rollNo: "CSE002",
    subject: "Algorithms",
    message: "When will the assignment 3 solutions be uploaded?",
    date: "2024-01-18",
    status: "replied",
    reply: "The solutions will be uploaded by this weekend.",
  },
];

export default function Communication() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    category: "General",
    targetRole: ["faculty", "student"] as string[],
    files: [] as File[],
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/announcements/admin');
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (err) {
      toast.error("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePostAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      toast.warning("Please fill in title and message");
      return;
    }

    const formData = new FormData();
    formData.append('title', newAnnouncement.title);
    formData.append('message', newAnnouncement.message);
    formData.append('category', newAnnouncement.category);
    formData.append('targetRole', newAnnouncement.targetRole.join(','));

    newAnnouncement.files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await fetch('/api/v1/announcements', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Announcement posted successfully!");
        setShowAnnouncementForm(false);
        setNewAnnouncement({
          title: "",
          message: "",
          category: "General",
          targetRole: ["faculty", "student"],
          files: [],
        });
        fetchAnnouncements();
      } else {
        toast.error(data.error || "Failed to post announcement");
      }
    } catch (err) {
      toast.error("An error occurred while posting");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await fetch(`/api/v1/announcements/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success("Announcement deleted");
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const filteredQueries = mockQueries.filter(
    (q) =>
      q.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-header font-serif">Communication Center</h1>
          <p className="text-muted-foreground -mt-4">
            Manage departmental announcements and queries
          </p>
        </div>
        <Button onClick={() => setShowAnnouncementForm(!showAnnouncementForm)} className="bg-primary hover:bg-primary/90">
          {showAnnouncementForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showAnnouncementForm ? "Cancel" : "New Announcement"}
        </Button>
      </div>

      {showAnnouncementForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-6 bg-card rounded-2xl border border-primary/20 shadow-xl"
        >
          <h3 className="text-lg font-bold mb-4">Post New Announcement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Announcement Title</label>
              <Input
                placeholder="e.g. Mid-term Exam Schedule"
                value={newAnnouncement.title}
                onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Category</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={newAnnouncement.category}
                onChange={e => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
              >
                <option value="General">General</option>
                <option value="Examination">Examination</option>
                <option value="Events">Events</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold">Message Content</label>
              <Textarea
                placeholder="Write your announcement message here..."
                rows={4}
                value={newAnnouncement.message}
                onChange={e => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Attachments</label>
              <Input
                type="file"
                multiple
                onChange={e => {
                  if (e.target.files) {
                    setNewAnnouncement({ ...newAnnouncement, files: Array.from(e.target.files) });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold block mb-2">Target Audience</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAnnouncement.targetRole.includes('faculty')}
                    onChange={e => {
                      const roles = e.target.checked
                        ? [...newAnnouncement.targetRole, 'faculty']
                        : newAnnouncement.targetRole.filter(r => r !== 'faculty');
                      setNewAnnouncement({ ...newAnnouncement, targetRole: roles });
                    }}
                  /> Faculty
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAnnouncement.targetRole.includes('student')}
                    onChange={e => {
                      const roles = e.target.checked
                        ? [...newAnnouncement.targetRole, 'student']
                        : newAnnouncement.targetRole.filter(r => r !== 'student');
                      setNewAnnouncement({ ...newAnnouncement, targetRole: roles });
                    }}
                  /> Students
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowAnnouncementForm(false)}>Cancel</Button>
            <Button onClick={handlePostAnnouncement}>Post Announcement</Button>
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="notices" className="w-full">
        <TabsList className="mb-6 bg-muted/50 p-1">
          <TabsTrigger value="notices" className="gap-2">
            <Bell className="w-4 h-4" /> Notice Board
          </TabsTrigger>
          <TabsTrigger value="queries" className="gap-2">
            <MessageSquare className="w-4 h-4" /> Student Queries
            <Badge variant="secondary">{mockQueries.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notices">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />)}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border">
              <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">No announcements found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <motion.div
                  key={ann._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="widget-card group relative"
                >
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{ann.title}</h4>
                        <p className="text-xs text-muted-foreground">Posted on {new Date(ann.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{ann.category}</Badge>
                      {/* Check if creator's ID matches user's ID */}
                      {ann.createdBy?._id === user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteAnnouncement(ann._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground pl-12 mb-4 leading-relaxed">{ann.message}</p>

                  <div className="pl-12 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] uppercase font-black text-muted-foreground mr-2">Target:</span>
                    {ann.targetRole.map(role => (
                      <Badge key={role} variant="secondary" className="text-[9px] uppercase">{role}</Badge>
                    ))}

                    {ann.attachments.length > 0 && (
                      <div className="flex gap-2 ml-4">
                        {ann.attachments.map((file, i) => (
                          <a
                            key={i}
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                          >
                            <Download className="w-3 h-3" /> {file.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="queries">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search queries..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              {filteredQueries.map(q => (
                <div
                  key={q.id}
                  className={cn("widget-card cursor-pointer", selectedQuery?.id === q.id && "ring-2 ring-primary bg-primary/5")}
                  onClick={() => setSelectedQuery(q)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-bold">{q.student}</h5>
                    <Badge variant={q.status === 'pending' ? 'warning' : 'success' as any} className={cn(q.status === 'pending' ? 'bg-warning text-white' : 'bg-success text-white')}>{q.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{q.message}</p>
                </div>
              ))}
            </div>

            <div className="widget-card h-fit sticky top-6">
              {selectedQuery ? (
                <div className="space-y-4">
                  <h4 className="font-bold border-b pb-2">{selectedQuery.subject}</h4>
                  <p className="text-sm bg-muted p-4 rounded-xl">{selectedQuery.message}</p>
                  {selectedQuery.reply && (
                    <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-xl">
                      <p className="text-xs font-bold text-primary mb-1">Response:</p>
                      <p className="text-sm">{selectedQuery.reply}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Textarea placeholder="Type reply..." value={replyText} onChange={e => setReplyText(e.target.value)} />
                    <Button className="w-full gap-2"><Send className="w-4 h-4" /> Send Reply</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground">Select a query to respond</div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
