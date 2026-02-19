import { useState, useEffect } from "react";
import { IntegratedNotificationBell } from "@/components/common/IntegratedNotificationBell";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import { Input } from "@/pages/faculty/components/ui/input";
import {
  FileText,
  Calendar,
  Upload,
  Lock,
  Eye,
  MapPin,
  Clock,
  Users,
  Shield,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";
import { InternalMarksEntry } from "./InternalMarksEntry";

interface InvigilationDuty {
  id: string;
  date: string;
  time: string;
  hall: string;
  exam: string;
  department: string;
}

interface QuestionPaper {
  id: string;
  subject: string;
  code: string;
  semester: string;
  uploadedOn?: string;
  status: "pending" | "uploaded" | "approved";
}

const invigilationDuties: InvigilationDuty[] = [
  {
    id: "1",
    date: "2024-02-15",
    time: "9:00 AM - 12:00 PM",
    hall: "Examination Hall A",
    exam: "End Semester - Data Structures",
    department: "CSE",
  },
  {
    id: "2",
    date: "2024-02-17",
    time: "2:00 PM - 5:00 PM",
    hall: "Examination Hall B",
    exam: "End Semester - Algorithms",
    department: "CSE",
  },
  {
    id: "3",
    date: "2024-02-20",
    time: "9:00 AM - 12:00 PM",
    hall: "Examination Hall C",
    exam: "End Semester - Database Systems",
    department: "IT",
  },
];

const questionPapers: QuestionPaper[] = [
  {
    id: "1",
    subject: "Data Structures & Algorithms",
    code: "CS301",
    semester: "5",
    uploadedOn: "2024-01-20",
    status: "approved",
  },
  {
    id: "2",
    subject: "Object Oriented Programming",
    code: "CS302",
    semester: "5",
    uploadedOn: "2024-01-22",
    status: "uploaded",
  },
  {
    id: "3",
    subject: "Computer Networks",
    code: "CS401",
    semester: "7",
    status: "pending",
  },
];

const statusStyles = {
  pending: { bg: "bg-warning/10", text: "text-warning", label: "Pending Upload" },
  uploaded: { bg: "bg-secondary/10", text: "text-secondary", label: "Under Review" },
  approved: { bg: "bg-success/10", text: "text-success", label: "Approved" },
};

export default function Assessments() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <MainLayout hideHeader={true}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between"
      >
        <div>
          <h1 className="page-header font-serif">Assessments & Exams</h1>
          <p className="text-muted-foreground -mt-4">
            Manage invigilation duties and question papers
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {formatDate(currentTime)}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-secondary" />
              {formatTime(currentTime)}
            </p>
          </div>
          <IntegratedNotificationBell />
        </div>
      </motion.div>

      <Tabs defaultValue="invigilation" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="invigilation" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Invigilation Schedule
          </TabsTrigger>
          <TabsTrigger value="papers" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Question Papers
          </TabsTrigger>
          <TabsTrigger value="marks" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Internal Marks
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Evaluation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invigilation">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {invigilationDuties.map((duty, index) => (
              <motion.div
                key={duty.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="widget-card hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-lg">
                        {duty.exam}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {duty.department} Department
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-4 h-4 text-secondary" />
                          {duty.date}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4 text-secondary" />
                          {duty.time}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-4 h-4 text-secondary" />
                          {duty.hall}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="papers">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="widget-card mb-6"
          >
            <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-lg border border-secondary/20">
              <Shield className="w-6 h-6 text-secondary" />
              <div>
                <p className="font-medium text-foreground">Secure Upload Portal</p>
                <p className="text-sm text-muted-foreground">
                  All question papers are encrypted and accessible only to authorized personnel
                </p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            {questionPapers.map((paper, index) => {
              const status = statusStyles[paper.status];
              return (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="widget-card"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-xl",
                        paper.status === "approved" ? "bg-success/10" : "bg-primary/10"
                      )}>
                        <FileText className={cn(
                          "w-6 h-6",
                          paper.status === "approved" ? "text-success" : "text-primary"
                        )} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {paper.subject}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {paper.code} Semester {paper.semester}
                        </p>
                        {paper.uploadedOn && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Uploaded: {paper.uploadedOn}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        status.bg,
                        status.text
                      )}>
                        {status.label}
                      </span>
                      {paper.status === "pending" ? (
                        <Button>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Paper
                        </Button>
                      ) : (
                        <Button variant="outline">
                          <Lock className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="marks">
          <InternalMarksEntry />
        </TabsContent>

        <TabsContent value="evaluation">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="widget-card"
          >
            <h3 className="section-title flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              External Exam Marks Entry
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="Select subject" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Exam Type</label>
                <Input placeholder="End Semester" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Section</label>
                <Input placeholder="CSE-A" />
              </div>
            </div>

            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium text-foreground mb-2">
                Select subject and section to load students
              </p>
              <p className="text-sm text-muted-foreground">
                External exam marks can be entered after the evaluation period begins
              </p>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}


