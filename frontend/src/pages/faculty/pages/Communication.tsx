import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";

export interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: "high" | "normal" | "low";
  category: string;

  // ✅ ADDED (for announcement targeting)
  semester: string;
  term: "even" | "odd";
  department: string;
  year: string;
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

const notices: Notice[] = [
  {
    id: "1",
    title: "Holiday",
    content: "College closed",
    author: "Admin",
    date: "2026-02-01",
    priority: "high",
    category: "General",

    // ✅ REQUIRED (temporary / default values)
    semester: "",
    term: "odd",
    department: "",
    year: "",
  },
  {
    id: "2",
    title: "Faculty Development Program",
    content: "A 5-day FDP on 'AI in Education' will be conducted from January 25-29, 2024. All interested faculty members are requested to register.",
    author: "Principal",
    date: "2024-01-17",
    priority: "normal",
    category: "Training",
     semester: "",
    term: "odd",
    department: "",
    year: "",
  },
  {
    id: "3",
    title: "Updated Leave Policy",
    content: "Please note the revised leave policy effective from February 1, 2024. Check the HR portal for detailed guidelines.",
    author: "HR Department",
    date: "2024-01-15",
    priority: "low",
    category: "Policy",
 semester: "",
    term: "odd",
    department: "",
    year: "",
  },
];

const queries: Query[] = [
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
// filter 

const priorityStyles = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  normal: "bg-secondary/10 text-secondary border-secondary/30",
  low: "bg-muted text-muted-foreground border-border",
};

export default function Communication() {
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    category: "General",
    content: "",
    priority: "normal" as "high" | "normal" | "low",
    attachment: null as File | null,
    semester: "",
    term: "",
    department: "",
    year: "",

  });

  const handlePostAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return;

    // handle notice 
    const notice: Notice = {
         id: Date.now().toString(),
         title: newAnnouncement.title,
         content: newAnnouncement.content,
         author: "Me",
         date: new Date().toISOString().split("T")[0],
         priority: newAnnouncement.priority,
         category: newAnnouncement.category,

  // ✅ ADDED
         semester: newAnnouncement.semester,
         term: newAnnouncement.term as "even" | "odd",
         department: newAnnouncement.department,
         year: newAnnouncement.year,
};
if (
  !newAnnouncement.semester ||
  !newAnnouncement.term ||
  !newAnnouncement.department ||
  !newAnnouncement.year
) {
  alert("Please select Semester, Term, Department and Year");
  return;
}

    // In a real app, we would upload the file here
    if (newAnnouncement.attachment) {
      console.log("Uploading file:", newAnnouncement.attachment.name);
    }

    // Add to notices (mock)
    notices.unshift(notice); // Modifying the imported array directly for demo, ideally use state

    setShowAnnouncementForm(false);
    setNewAnnouncement({
  title: "",
  category: "General",
  content: "",
  priority: "normal",
  attachment: null,

  // ✅ REQUIRED
  semester: "",
  term: "",
  department: "",
  year: "",
});

  };

  const filteredQueries = queries.filter(
    (q) =>
      q.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-header font-serif">Communication Center</h1>
          <p className="text-muted-foreground -mt-4">
            View announcements and respond to student queries
          </p>
        </div>
        <Button onClick={() => setShowAnnouncementForm(!showAnnouncementForm)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Make Announcement
        </Button>
      </div>

      {showAnnouncementForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-8 p-6 bg-card rounded-xl border border-border shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-foreground">Create New Announcement</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowAnnouncementForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          {/* ✅ Class Selection */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
  <select
    className="h-10 rounded-md border border-input px-3 text-sm"
    value={newAnnouncement.semester}
    onChange={(e) =>
      setNewAnnouncement({ ...newAnnouncement, semester: e.target.value })
    }
  >
    <option value="">Semester</option>
    {[1,2,3,4,5,6,7,8].map((s) => (
      <option key={s} value={String(s)}>Sem {s}</option>
    ))}
  </select>

  <select
    className="h-10 rounded-md border border-input px-3 text-sm"
    value={newAnnouncement.term}
    onChange={(e) =>
      setNewAnnouncement({ ...newAnnouncement, term: e.target.value })
    }
  >
    <option value="">Even / Odd</option>
    <option value="even">Even</option>
    <option value="odd">Odd</option>
  </select>

  <select
    className="h-10 rounded-md border border-input px-3 text-sm"
    value={newAnnouncement.department}
    onChange={(e) =>
      setNewAnnouncement({ ...newAnnouncement, department: e.target.value })
    }
  >
    <option value="">Department</option>
    <option value="CSE">CSE</option>
    <option value="ECE">ECE</option>
    <option value="EEE">EEE</option>
    <option value="MECH">MECH</option>
  </select>

  <select
    className="h-10 rounded-md border border-input px-3 text-sm"
    value={newAnnouncement.year}
    onChange={(e) =>
      setNewAnnouncement({ ...newAnnouncement, year: e.target.value })
    }
  >
    <option value="">Year</option>
    <option value="I">I</option>
    <option value="II">II</option>
    <option value="III">III</option>
    <option value="IV">IV</option>
  </select>
</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Announcement Title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newAnnouncement.category}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
              >
                <option value="General">General</option>
                <option value="Examination">Examination</option>
                <option value="Training">Training</option>
                <option value="Placement">Placement</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Content/Description</label>
              <Textarea
                placeholder="Enter announcement details..."
                className="min-h-[100px]"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="priority" value="high" className="radio radio-error radio-sm" />
                  <span className="text-sm">High</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="priority" value="normal" defaultChecked className="radio radio-primary radio-sm" />
                  <span className="text-sm">Normal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="priority" value="low" className="radio radio-sm" />
                  <span className="text-sm">Low</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Attachment (PDF/Word)</label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setNewAnnouncement({ ...newAnnouncement, attachment: e.target.files[0] });
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAnnouncementForm(false)}>Cancel</Button>
            <Button onClick={handlePostAnnouncement}>Post Announcement</Button>
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="notices" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="notices" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notice Board
          </TabsTrigger>
          <TabsTrigger value="queries" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Student Queries
            <Badge variant="secondary" className="ml-1">
              {queries.filter((q) => q.status === "pending").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notices" className="mt-0">
          <div className="space-y-4">
            {notices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "widget-card border-l-4",
                  notice.priority === "high" && "border-l-destructive",
                  notice.priority === "normal" && "border-l-secondary",
                  notice.priority === "low" && "border-l-muted-foreground"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      notice.priority === "high" && "bg-destructive/10",
                      notice.priority === "normal" && "bg-secondary/10",
                      notice.priority === "low" && "bg-muted"
                    )}>
                      <Megaphone className={cn(
                        "w-5 h-5",
                        notice.priority === "high" && "text-destructive",
                        notice.priority === "normal" && "text-secondary",
                        notice.priority === "low" && "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {notice.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {notice.author} {notice.date}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={priorityStyles[notice.priority]}>
                    {notice.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground pl-12">
                  {notice.content}
                </p>
                {/* Simulated Attachment Link */}
                <div className="pl-12 mt-2">
                  <Button variant="link" className="p-0 h-auto text-primary text-xs flex items-center gap-1">
                    <Download className="w-3 h-3" /> Download Attachment
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="queries">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Query List */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search queries..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {filteredQueries.map((query, index) => (
                <motion.div
                  key={query.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
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
                        <p className="font-medium text-sm text-foreground">
                          {query.student}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {query.rollNo} {query.subject}
                        </p>
                      </div>
                    </div>
                    {query.status === "pending" ? (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Replied
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {query.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {query.date}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Reply Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="widget-card h-fit sticky top-6"
            >
              {selectedQuery ? (
                <>
                  <div className="flex items-center gap-3 pb-4 border-b mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {selectedQuery.student.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {selectedQuery.student}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedQuery.rollNo} {selectedQuery.subject}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-foreground">{selectedQuery.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedQuery.date}
                    </p>
                  </div>

                  {selectedQuery.reply && (
                    <div className="bg-secondary/10 rounded-lg p-4 mb-4 border-l-4 border-secondary">
                      <p className="text-xs font-medium text-secondary mb-2">Your Reply</p>
                      <p className="text-sm text-foreground">{selectedQuery.reply}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your reply here..."
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <Button className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium text-foreground">Select a Query</p>
                  <p className="text-sm text-muted-foreground">
                    Click on a query to view details and reply
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}


