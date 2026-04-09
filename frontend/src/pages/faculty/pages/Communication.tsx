import { useState, useEffect } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Input } from "@/pages/faculty/components/ui/input";
import { Textarea } from "@/pages/faculty/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import { Badge } from "@/pages/faculty/components/ui/badge";
import {
  MessageSquare,
  Bell,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Search,
  Plus,
  X,
  Download,
  Trash2,
} from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Notice {
  id: number;
  title: string;
  message: string;
  type?: string;
  priority?: string;
  creatorRole: string;
  createdAt: string;
  department?: string;
  semester?: string;
  year?: string;
  term?: string;
  attachments?: { name: string; url: string; type: string }[];
  createdBy?: { id: number; name: string; avatar?: string };
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

// ─── Mock student queries (replace with API when backend is ready) ──────────
const MOCK_QUERIES: Query[] = [
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
    reply: "The solutions will be uploaded by this weekend. Please check the study materials section.",
  },
  {
    id: "3",
    student: "Rahul Verma",
    rollNo: "CSE003",
    subject: "OOP",
    message: "Is there any reference book you would recommend for understanding design patterns better?",
    date: "2024-01-17",
    status: "pending",
  },
];

// ─── Utility ────────────────────────────────────────────────────────────────
function getAuthToken(): string {
  return localStorage.getItem("authToken") ?? "";
}

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-destructive/10 text-destructive border-destructive/30",
  high:   "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  normal: "bg-secondary/10 text-secondary border-secondary/30",
  low:    "bg-muted text-muted-foreground border-border",
};

// ═══════════════════════════════════════════════════════════════════════════
export default function FacultyCommunication() {
  // ── Announcement state ──────────────────────────────────────────────────
  const [notices, setNotices]           = useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  const [form, setForm] = useState({
    title:      "",
    message:    "",
    type:       "General",
    priority:   "normal",
    targetRole: "student",
    semester:   "",
    year:       "",
    term:       "",
    attachment: null as File | null,
  });

  // ── Query / reply state ─────────────────────────────────────────────────
  const [queries, setQueries]         = useState<Query[]>(MOCK_QUERIES);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [replyText, setReplyText]     = useState("");
  const [searchTerm, setSearchTerm]   = useState("");

  // ── Fetch notices from DB ───────────────────────────────────────────────
  const fetchNotices = async () => {
    setNoticesLoading(true);
    try {
      const res  = await fetch("/api/v1/announcements/admin", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotices(
          (data.data as any[]).map((a) => ({
            ...a,
            attachments: Array.isArray(a.attachments) ? a.attachments : [],
          }))
        );
      }
    } catch {
      /* silent */
    } finally {
      setNoticesLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  // ── Post a new announcement ─────────────────────────────────────────────
  const handlePost = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      alert("Title and message are required.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title",      form.title);
      fd.append("message",    form.message);
      fd.append("type",       form.type);
      fd.append("priority",   form.priority);
      fd.append("targetRole", JSON.stringify([form.targetRole]));
      if (form.semester) fd.append("semester", form.semester);
      if (form.year)     fd.append("year",     form.year);
      if (form.term)     fd.append("term",     form.term);
      if (form.attachment) fd.append("files",  form.attachment);

      const res  = await fetch("/api/v1/announcements", {
        method:  "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body:    fd,
      });
      const data = await res.json();

      if (data.success) {
        setShowForm(false);
        setForm({ title: "", message: "", type: "General", priority: "normal", targetRole: "student", semester: "", year: "", term: "", attachment: null });
        fetchNotices();
      } else {
        alert(data.error ?? "Failed to post announcement.");
      }
    } catch {
      alert("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete an announcement ──────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      const res  = await fetch(`/api/v1/announcements/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      if (data.success) fetchNotices();
    } catch {
      alert("Delete failed.");
    }
  };

  // ── Filtered queries ────────────────────────────────────────────────────
  const filteredQueries = queries.filter(
    (q) =>
      q.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ═══════════════════════════════════════════════════════════════════════
  return (
    <MainLayout>
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-header font-serif">Communication Center</h1>
          <p className="text-muted-foreground -mt-4">
            View announcements and respond to student queries
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90">
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancel" : "Make Announcement"}
        </Button>
      </div>

      {/* ── Announcement form ───────────────────────────────────────── */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-8 p-6 bg-card rounded-xl border border-border shadow-sm overflow-hidden"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Create New Announcement</h3>

          {/* Row 1: targeting selectors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <select className="h-10 rounded-md border border-input px-3 text-sm bg-background"
              value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
              <option value="">All Semesters</option>
              {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={String(s)}>Sem {s}</option>)}
            </select>

            <select className="h-10 rounded-md border border-input px-3 text-sm bg-background"
              value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}>
              <option value="">Both Terms</option>
              <option value="even">Even</option>
              <option value="odd">Odd</option>
            </select>

            <select className="h-10 rounded-md border border-input px-3 text-sm bg-background"
              value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
              <option value="">All Years</option>
              {["I","II","III","IV"].map((y) => <option key={y} value={y}>{y} Year</option>)}
            </select>

            <select className="h-10 rounded-md border border-input px-3 text-sm bg-background"
              value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
              <option value="all">Everyone</option>
            </select>
          </div>

          {/* Row 2: title + category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Announcement title" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="General">General</option>
                <option value="Examination">Examination</option>
                <option value="Training">Training</option>
                <option value="Placement">Placement</option>
                <option value="Events">Events</option>
              </select>
            </div>
          </div>

          {/* Row 3: message + priority + attachment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea placeholder="Enter announcement details..." className="min-h-[100px]"
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <div className="flex gap-4 pt-1">
                {(["high","normal","low"] as const).map((p) => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="priority" value={p} checked={form.priority === p}
                      onChange={() => setForm({ ...form, priority: p })} />
                    <span className="text-sm capitalize">{p}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Attachment (PDF / Image)</label>
              <Input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] ?? null })} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handlePost} disabled={submitting}>
              {submitting ? "Posting…" : "Post Announcement"}
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <Tabs defaultValue="notices" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="notices" className="flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notice Board
          </TabsTrigger>
          <TabsTrigger value="queries" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Student Queries
            <Badge variant="secondary" className="ml-1">
              {queries.filter((q) => q.status === "pending").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* ── Notice board ──────────────────────────────────────────── */}
        <TabsContent value="notices" className="mt-0">
          {noticesLoading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : notices.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
              <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-20" />
              <p className="font-medium text-muted-foreground">No announcements yet</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Make Announcement" to post one</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice, idx) => {
                const pStyle = PRIORITY_STYLES[notice.priority ?? "normal"] ?? PRIORITY_STYLES.normal;
                const isOwn  = notice.createdBy?.id !== undefined; // could compare to current user

                return (
                  <motion.div
                    key={notice.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "widget-card border-l-4 group relative",
                      notice.priority === "high" || notice.priority === "urgent"
                        ? "border-l-destructive"
                        : notice.priority === "normal" || notice.priority === "medium"
                        ? "border-l-secondary"
                        : "border-l-muted-foreground"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary/10">
                          <Megaphone className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{notice.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {notice.createdBy?.name ?? notice.creatorRole} &bull;{" "}
                            {new Date(notice.createdAt).toLocaleDateString()}
                            {notice.semester && ` · Sem ${notice.semester}`}
                            {notice.year && ` · ${notice.year} Year`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={pStyle}>
                          {notice.type ?? "General"}
                        </Badge>
                        <Button
                          variant="ghost" size="icon"
                          className="w-8 h-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(notice.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground pl-12">{notice.message}</p>

                    {/* Attachments */}
                    {notice.attachments && notice.attachments.length > 0 && (
                      <div className="pl-12 mt-3 flex flex-wrap gap-2">
                        {notice.attachments.map((file, i) => (
                          <a key={i} href={file.url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/5 px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                            <Download className="w-3 h-3" /> {file.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Student queries ───────────────────────────────────────── */}
        <TabsContent value="queries">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Query list */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search queries…" className="pl-10"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {filteredQueries.map((query, idx) => (
                <motion.div key={query.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => setSelectedQuery(query)}
                  className={cn(
                    "widget-card cursor-pointer transition-all hover:border-primary/30",
                    selectedQuery?.id === query.id && "border-primary bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                        {query.student.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{query.student}</p>
                        <p className="text-xs text-muted-foreground">{query.rollNo} · {query.subject}</p>
                      </div>
                    </div>
                    {query.status === "pending" ? (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                        <AlertCircle className="w-3 h-3 mr-1" /> Pending
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Replied
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{query.message}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {query.date}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Reply panel */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }} className="widget-card h-fit sticky top-6">
              {selectedQuery ? (
                <>
                  <div className="flex items-center gap-3 pb-4 border-b mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {selectedQuery.student.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{selectedQuery.student}</p>
                      <p className="text-sm text-muted-foreground">{selectedQuery.rollNo} · {selectedQuery.subject}</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-foreground">{selectedQuery.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{selectedQuery.date}</p>
                  </div>
                  {selectedQuery.reply && (
                    <div className="bg-secondary/10 rounded-lg p-4 mb-4 border-l-4 border-secondary">
                      <p className="text-xs font-medium text-secondary mb-2">Your Reply</p>
                      <p className="text-sm text-foreground">{selectedQuery.reply}</p>
                    </div>
                  )}
                  <div className="space-y-3">
                    <Textarea placeholder="Type your reply here…" rows={4}
                      value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                    <Button className="w-full">
                      <Send className="w-4 h-4 mr-2" /> Send Reply
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium text-foreground">Select a Query</p>
                  <p className="text-sm text-muted-foreground">Click on a query to view details and reply</p>
                </div>
              )}
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
