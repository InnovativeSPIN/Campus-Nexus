import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { StatCard } from "@/pages/faculty/components/dashboard/StatCard";
import { NextClassCard } from "@/pages/faculty/components/dashboard/NextClassCard";
import { PendingTasksList } from "@/pages/faculty/components/dashboard/PendingTasksList";
import { LeaveSnapshot } from "@/pages/faculty/components/dashboard/LeaveSnapshot";
import { IntegratedNotificationBell } from "@/components/common/IntegratedNotificationBell";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Award,
  Clock,
  GraduationCap,
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

const pendingTasks = [
  { id: "1", title: "Annual Day staff commity list Announced", dueDate: "Today", priority: "high" as const, type: "Faculty Circular" as const },
  { id: "2", title: "Upload Internal Test 1 marks", dueDate: "Tomorrow", priority: "medium" as const, type: "Faculty Circular" as const },
];

const leaveBalance = [
  { type: "Casual Leave", icon: Calendar, total: 12, used: 4, remaining: 8 },
];

export default function Dashboard() {
  const [selectedSubject, setSelectedSubject] = useState<any>({
    id: 0,
    name: currentClass.subject,
    room: currentClass.room,
    type: currentClass.type,
    totalPeriods: currentClass.totalPeriods,
    duration: currentClass.duration,
  });
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
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between"
      >
        <div>
          <h1 className="page-header font-serif">Faculty Dashboard</h1>
          <p className="text-muted-foreground -mt-4">
            Welcome back! Here's your academic overview for today
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Subjects" value="6" subtitle="This semester" icon={BookOpen} variant="secondary" delay={0.1} />
        <StatCard title="Classes Today" value="5" subtitle="2 completed" icon={Calendar} variant="success" delay={0.2} />
        <StatCard title="Avg. Attendance" value="87%" subtitle="+3% from last month" icon={Award} variant="warning" delay={0.3} />
        <StatCard title="Pending Tasks" value={pendingTasks.length.toString()} subtitle="Requires action" icon={Clock} variant="primary" delay={0.4} />
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="widget-card flex flex-col"
        >
          <h3 className="section-title text-center mb-4">Class Details</h3>
          {selectedSubject && (
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-lg p-5 border border-primary/20">
                <h4 className="font-semibold text-lg text-foreground flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  {selectedSubject.name}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Room</p>
                    <p className="font-bold">{selectedSubject.room}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-bold">{selectedSubject.type}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <PendingTasksList tasks={pendingTasks} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <LeaveSnapshot leaves={leaveBalance} />
      </div>
    </MainLayout>
  );
}
