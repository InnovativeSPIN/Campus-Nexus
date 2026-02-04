import { useState } from "react";
import { MainLayout } from "@/pages/admin/department-admin/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/admin/department-admin/components/ui/button";
import { Input } from "@/pages/admin/department-admin/components/ui/input";
import { Label } from "@/pages/admin/department-admin/components/ui/label";
import { Textarea } from "@/pages/admin/department-admin/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/pages/admin/department-admin/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/admin/department-admin/components/ui/tabs";
import {
  Users,
  Search,
  UserCheck,
  MessageCircle,
  Calendar,
  FileText,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  Target,
  Heart,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/pages/admin/department-admin/lib/utils";
import { MentorModeToggle } from "@/pages/admin/department-admin/components/mentor/MentorModeToggle";
import { NotificationBell } from "@/pages/admin/department-admin/components/notifications/NotificationBell";

interface Student {
  id: string;
  rollNo: string;
  name: string;
  photo: string;
  semester: number;
  section: string;
  cgpa: number;
  attendance: number;
  status: "good" | "at-risk" | "critical";
  lastCounseling?: string;
  phone: string;
  email: string;
  parentPhone: string;
}

interface CounselingRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  type: "academic" | "personal" | "career" | "disciplinary";
  summary: string;
  actionItems: string[];
  followUpDate?: string;
  status: "completed" | "follow-up" | "ongoing";
}

const assignedStudents: Student[] = [
  {
    id: "1",
    rollNo: "CSE001",
    name: "Aditya Kumar",
    photo: "AK",
    semester: 5,
    section: "A",
    cgpa: 8.5,
    attendance: 92,
    status: "good",
    lastCounseling: "2024-01-10",
    phone: "9876543210",
    email: "aditya.kumar@college.edu",
    parentPhone: "9876543211",
  },
  {
    id: "2",
    rollNo: "CSE002",
    name: "Priya Sharma",
    photo: "PS",
    semester: 5,
    section: "A",
    cgpa: 6.2,
    attendance: 68,
    status: "at-risk",
    lastCounseling: "2024-01-05",
    phone: "9876543220",
    email: "priya.sharma@college.edu",
    parentPhone: "9876543221",
  },
  {
    id: "3",
    rollNo: "CSE003",
    name: "Rahul Verma",
    photo: "RV",
    semester: 5,
    section: "A",
    cgpa: 4.8,
    attendance: 55,
    status: "critical",
    lastCounseling: "2024-01-12",
    phone: "9876543230",
    email: "rahul.verma@college.edu",
    parentPhone: "9876543231",
  },
  {
    id: "4",
    rollNo: "CSE004",
    name: "Sneha Patel",
    photo: "SP",
    semester: 5,
    section: "A",
    cgpa: 9.1,
    attendance: 95,
    status: "good",
    phone: "9876543240",
    email: "sneha.patel@college.edu",
    parentPhone: "9876543241",
  },
  {
    id: "5",
    rollNo: "CSE005",
    name: "Vikram Singh",
    photo: "VS",
    semester: 5,
    section: "A",
    cgpa: 5.5,
    attendance: 72,
    status: "at-risk",
    lastCounseling: "2024-01-08",
    phone: "9876543250",
    email: "vikram.singh@college.edu",
    parentPhone: "9876543251",
  },
  {
    id: "6",
    rollNo: "CSE006",
    name: "Ananya Gupta",
    photo: "AG",
    semester: 5,
    section: "A",
    cgpa: 7.8,
    attendance: 88,
    status: "good",
    phone: "9876543260",
    email: "ananya.gupta@college.edu",
    parentPhone: "9876543261",
  },
];

const counselingRecords: CounselingRecord[] = [
  {
    id: "1",
    studentId: "2",
    studentName: "Priya Sharma",
    date: "2024-01-05",
    type: "academic",
    summary: "Discussed poor performance in recent internal exams. Student mentioned difficulty in understanding Data Structures concepts.",
    actionItems: ["Extra tutoring sessions", "Weekly progress review", "Parent meeting scheduled"],
    followUpDate: "2024-01-20",
    status: "follow-up",
  },
  {
    id: "2",
    studentId: "3",
    studentName: "Rahul Verma",
    date: "2024-01-12",
    type: "disciplinary",
    summary: "Addressed attendance issues and lack of assignment submissions. Student committed to improving.",
    actionItems: ["Daily attendance monitoring", "Assignment deadline reminders", "Mentor assignment"],
    followUpDate: "2024-01-25",
    status: "ongoing",
  },
  {
    id: "3",
    studentId: "1",
    studentName: "Aditya Kumar",
    date: "2024-01-10",
    type: "career",
    summary: "Career guidance session for placement preparation. Discussed resume building and interview skills.",
    actionItems: ["Mock interview practice", "Resume review", "Company research"],
    status: "completed",
  },
  {
    id: "4",
    studentId: "5",
    studentName: "Vikram Singh",
    date: "2024-01-08",
    type: "personal",
    summary: "Student facing family issues affecting studies. Provided emotional support and resources.",
    actionItems: ["Counselor referral", "Flexible deadline arrangement", "Regular check-ins"],
    followUpDate: "2024-01-22",
    status: "follow-up",
  },
];

const statusConfig = {
  good: {
    label: "Good Standing",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
  },
  "at-risk": {
    label: "At Risk",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
  },
  critical: {
    label: "Critical",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
  },
};

const counselingTypeConfig = {
  academic: { label: "Academic", color: "text-primary", bg: "bg-primary/10" },
  personal: { label: "Personal", color: "text-secondary", bg: "bg-secondary/10" },
  career: { label: "Career", color: "text-success", bg: "bg-success/10" },
  disciplinary: { label: "Disciplinary", color: "text-warning", bg: "bg-warning/10" },
};

const recordStatusConfig = {
  completed: { label: "Completed", icon: CheckCircle2, color: "text-success" },
  "follow-up": { label: "Follow-up", icon: Clock, color: "text-warning" },
  ongoing: { label: "Ongoing", icon: AlertTriangle, color: "text-secondary" },
};

export default function Counseling() {
  const [activeTab, setActiveTab] = useState("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sessionStudent, setSessionStudent] = useState<Student | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [counselingType, setCounselingType] = useState("");

  const filteredStudents = assignedStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const goodCount = assignedStudents.filter((s) => s.status === "good").length;
  const atRiskCount = assignedStudents.filter((s) => s.status === "at-risk").length;
  const criticalCount = assignedStudents.filter((s) => s.status === "critical").length;

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="page-header font-serif">Student Counseling</h1>
          <p className="text-muted-foreground -mt-4">
            Guide and support your assigned students
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MentorModeToggle />
          <NotificationBell />
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="widget-card text-center"
        >
          <Users className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-3xl font-bold text-primary">{assignedStudents.length}</p>
          <p className="text-xs text-muted-foreground">Total Mentees</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="widget-card text-center"
        >
          <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
          <p className="text-3xl font-bold text-success">{goodCount}</p>
          <p className="text-xs text-muted-foreground">Good Standing</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="widget-card text-center"
        >
          <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
          <p className="text-3xl font-bold text-warning">{atRiskCount}</p>
          <p className="text-xs text-muted-foreground">At Risk</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="widget-card text-center"
        >
          <Heart className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-3xl font-bold text-destructive">{criticalCount}</p>
          <p className="text-xs text-muted-foreground">Need Attention</p>
        </motion.div>
      </motion.div>

      {/* Selected Student Details Panel */}
      {sessionStudent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="widget-card mb-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                {sessionStudent.photo}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">{sessionStudent.name}</h3>
                <p className="text-muted-foreground">{sessionStudent.rollNo} Semester {sessionStudent.semester}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSessionStudent(null)}>
              Clear Session
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Attendance</p>
              <p className="text-2xl font-bold text-secondary">{sessionStudent.attendance}%</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">CGPA</p>
              <p className="text-2xl font-bold text-primary">{sessionStudent.cgpa}</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Backlogs</p>
              <p className="text-2xl font-bold text-warning">0</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <div className={cn("px-2 py-1 rounded text-sm font-medium w-fit", statusConfig[sessionStudent.status].bg, statusConfig[sessionStudent.status].color)}>
                {statusConfig[sessionStudent.status].label}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Students
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Counseling Records
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2" disabled={!sessionStudent}>
            <PlusCircle className="w-4 h-4" />
            New Session
          </TabsTrigger>
        </TabsList>

        {/* My Students Tab */}
        <TabsContent value="students">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Filters */}
            <div className="widget-card mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="good">Good Standing</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Student List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map((student, index) => {
                const config = statusConfig[student.status];
                return (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn("widget-card border-l-4 cursor-pointer hover:shadow-lg transition-shadow", config.border)}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {student.photo}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-foreground">{student.name}</h4>
                          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", config.bg, config.color)}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {student.rollNo} Sem {student.semester} Section {student.section}
                        </p>
                        <div className="flex gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            CGPA: <span className={cn(student.cgpa >= 7 ? "text-success" : student.cgpa >= 5 ? "text-warning" : "text-destructive")}>{student.cgpa}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Attendance: <span className={cn(student.attendance >= 75 ? "text-success" : student.attendance >= 60 ? "text-warning" : "text-destructive")}>{student.attendance}%</span>
                          </span>
                        </div>
                        {student.lastCounseling && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Last counseled: {student.lastCounseling}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Student Detail Modal/Sidebar */}
            {selectedStudent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedStudent(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-card rounded-xl p-6 max-w-md w-full shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                      {selectedStudent.photo}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedStudent.rollNo}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="widget-card text-center">
                        <p className="text-2xl font-bold text-primary">{selectedStudent.cgpa}</p>
                        <p className="text-xs text-muted-foreground">CGPA</p>
                      </div>
                      <div className="widget-card text-center">
                        <p className="text-2xl font-bold text-secondary">{selectedStudent.attendance}%</p>
                        <p className="text-xs text-muted-foreground">Attendance</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedStudent.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedStudent.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>Parent: {selectedStudent.parentPhone}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setSessionStudent(selectedStudent);
                          setSelectedStudent(null);
                          setActiveTab("new");
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start Session
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>

        {/* Counseling Records Tab */}
        <TabsContent value="records">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {counselingRecords.map((record, index) => {
              const typeConfig = counselingTypeConfig[record.type];
              const statusConf = recordStatusConfig[record.status];
              const StatusIcon = statusConf.icon;

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="widget-card"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-foreground">{record.studentName}</h4>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", typeConfig.bg, typeConfig.color)}>
                          {typeConfig.label}
                        </span>
                        <span className={cn("flex items-center gap-1 text-xs", statusConf.color)}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConf.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{record.summary}</p>

                      <div className="mb-3">
                        <p className="text-xs font-medium text-foreground mb-1">Action Items:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {record.actionItems.map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Target className="w-3 h-3 text-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {record.date}
                        </span>
                        {record.followUpDate && (
                          <span className="flex items-center gap-1 text-warning">
                            <Clock className="w-3 h-3" />
                            Follow-up: {record.followUpDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </TabsContent>

        {/* New Counseling Session Tab */}
        <TabsContent value="new">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="widget-card max-w-2xl"
          >
            <h3 className="section-title flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              New Counseling Session
            </h3>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Session For</Label>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {sessionStudent?.photo}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{sessionStudent?.name}</p>
                      <p className="text-xs text-muted-foreground">{sessionStudent?.rollNo}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Counseling Type</Label>
                  <Select value={counselingType} onValueChange={setCounselingType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="career">Career Guidance</SelectItem>
                      <SelectItem value="disciplinary">Disciplinary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Session Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Follow-up Date (Optional)</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Session Summary</Label>
                <Textarea
                  placeholder="Describe the counseling session, topics discussed, and student's response..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Action Items / Recommendations</Label>
                <Textarea
                  placeholder="List the action items and recommendations for the student (one per line)..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Notes (Optional)</Label>
                <Textarea
                  placeholder="Any confidential notes or observations..."
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Save Session Record
                </Button>
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
              </div>
            </form>
          </motion.div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}


