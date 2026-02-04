import { MainLayout } from "@/pages/admin/department-admin/components/layout/MainLayout";
import { StatCard } from "@/pages/admin/department-admin/components/dashboard/StatCard";
import { NextClassCard } from "@/pages/admin/department-admin/components/dashboard/NextClassCard";
import { PendingTasksList } from "@/pages/admin/department-admin/components/dashboard/PendingTasksList";
import { LeaveSnapshot } from "@/pages/admin/department-admin/components/dashboard/LeaveSnapshot";
import { NotificationBell } from "@/pages/admin/department-admin/components/notifications/NotificationBell";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Calendar,
  Award,
  Briefcase,
  Heart,
  CalendarDays,
  Clock,
  DoorOpen,
  GraduationCap,
  Timer,
} from "lucide-react";

// Mock data
const currentClass = {
  subject: "Data Structures & Algorithms",
  time: "10:30 AM - 11:30 AM",
  room: "Classroom 5",
  section: "CSE- II Year",
  studentsCount: 62,
  type: "Lab",
  totalPeriods: 4,
  duration: "60 mins",
};

const nextClass = {
  subject: "Object Oriented Programming",
  time: "12:00 PM - 1:00 PM",
  room: "Classroom 7",
  section: "CSE",
  studentsCount: 58,
  type: "Theory",
  totalPeriods: 5,
  duration: "50 mins",
};

const subjects = [
  {
    id: 1,
    name: "Data Structures & Algorithms",
    room: "Class room 7 ",
    type: "Lab",
    totalPeriods: 4,
    duration: "60 mins",
  },
  {
    id: 2,
    name: "Object Oriented Programming",
    room: "Room 204, Block B",
    type: "Theory",
    totalPeriods: 5,
    duration: "50 mins",
  },
  {
    id: 3,
    name: "Computer Networks",
    room: "Room 301, Block A",
    type: "Theory",
    totalPeriods: 4,
    duration: "50 mins",
  },
  {
    id: 4,
    name: "Database Management Systems",
    room: "Lab 1, Block B",
    type: "Lab",
    totalPeriods: 3,
    duration: "60 mins",
  },
  {
    id: 5,
    name: "Operating Systems",
    room: "Room 205, Block A",
    type: "Theory",
    totalPeriods: 4,
    duration: "50 mins",
  },
  {
    id: 6,
    name: "Software Engineering",
    room: "Room 303, Block B",
    type: "Theory",
    totalPeriods: 3,
    duration: "50 mins",
  },
];

const pendingTasks = [
  {
    id: "1",
    title: "Annual Day staff commity list Announced",
    dueDate: "Today",
    priority: "high" as const,
    type: "Faculty Circular" as const,
  },
  {
    id: "2",
    title: "Upload Internal Test 1 marks",
    dueDate: "Tomorrow",
    priority: "medium" as const,
    type: "Faculty Circular" as const,
  },
  {
    id: "3",
    title: "House-wise Captain name list Announced",
    dueDate: "Today",
    priority: "low" as const,
    type: "Common Circular " as const,
  },
];

const leaveBalance = [
  { type: "Casual Leave", icon: Calendar, total: 12, used: 4, remaining: 8 },
  { type: "Medical Leave", icon: Heart, total: 10, used: 2, remaining: 8 },
  { type: "On-Duty Leave", icon: Briefcase, total: 15, used: 3, remaining: 12 },
];

export default function Dashboard() {
  const [selectedSubject, setSelectedSubject] = useState<typeof subjects[0] | null>({
    id: 0,
    name: currentClass.subject,
    room: currentClass.room,
    type: currentClass.type,
    totalPeriods: currentClass.totalPeriods,
    duration: currentClass.duration,
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between"
      >
        <div>
          <h1 className="page-header font-serif">Good Morning, Dr. Sharma</h1>
          <p className="text-muted-foreground -mt-4">
            Here's your academic overview for today
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
          <NotificationBell />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* <StatCard
          title="Available CL"
          value="5"
          subtitle="At This Month"
          icon={Users}
          variant="primary"
          delay={0}
        /> */}
        <StatCard
          title="Subjects"
          value="6"
          subtitle="This semester"
          icon={BookOpen}
          variant="secondary"
          delay={0.1}
        />
        <StatCard
          title="Classes Today"
          value="5"
          subtitle="2 completed"
          icon={Calendar}
          variant="success"
          delay={0.2}
        />
        <StatCard
          title="Avg. Attendance"
          value="87%"
          subtitle="+3% from last month"
          icon={Award}
          variant="warning"
          delay={0.3}
        />
      </div>

      {/* Current/Next Class */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <NextClassCard
          currentClass={currentClass}
          nextClass={nextClass}
          onClassClick={(classInfo) => setSelectedSubject({
            id: 0,
            name: classInfo.subject,
            room: classInfo.room,
            type: classInfo.type || "Theory",
            totalPeriods: classInfo.totalPeriods || 4,
            duration: classInfo.duration || "50 mins",
          })}
        />

        {/* Class Details container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="widget-card flex flex-col"
        >
          <h3 className="section-title text-center mb-4">
            {selectedSubject ? "Class Details" : "Quick Info"}
          </h3>

          {!selectedSubject ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-muted/20 rounded-xl border border-dashed border-border">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <p className="font-medium text-foreground mb-1">No Class Selected</p>
              <p className="text-sm text-muted-foreground">
                Click on the <strong>Live Now</strong> or <strong>Up Next</strong> card to view period details
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-lg p-5 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg text-foreground flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    {selectedSubject.name}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <DoorOpen className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Classroom</p>
                      <p className="text-sm font-semibold text-foreground">{selectedSubject.room}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm font-semibold text-foreground">{selectedSubject.type}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Periods</p>
                      <p className="text-sm font-semibold text-foreground">{selectedSubject.totalPeriods} weekly</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Timer className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-semibold text-foreground">{selectedSubject.duration}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingTasksList tasks={pendingTasks} />
        <LeaveSnapshot leaves={leaveBalance} />
      </div>
    </MainLayout>
  );
}


