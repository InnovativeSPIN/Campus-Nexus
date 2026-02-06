import { MainLayout } from "@/pages/admin/department-admin/components/layout/MainLayout";
import { StatCard } from "@/pages/admin/department-admin/components/dashboard/StatCard";
import { NextClassCard } from "@/pages/admin/department-admin/components/dashboard/NextClassCard";
import { PendingTasksList } from "@/pages/admin/department-admin/components/dashboard/PendingTasksList";
import { LeaveSnapshot } from "@/pages/admin/department-admin/components/dashboard/LeaveSnapshot";
import { IntegratedNotificationBell } from "@/components/common/IntegratedNotificationBell";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  Clock,
  GraduationCap,
  Bell
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
];

const leaveBalance = [
  { type: "Casual Leave", icon: Calendar, total: 12, used: 4, remaining: 8 },
];

export default function Dashboard() {
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
    <MainLayout>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between"
      >
        <div>
          <h1 className="page-header font-serif">HOD Dashboard</h1>
          <p className="text-muted-foreground -mt-4">
            Departmental overview and administrative control
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
        <StatCard title="Total Students" value="450" subtitle="In department" icon={Users} variant="secondary" delay={0.1} />
        <StatCard title="Total Faculty" value="24" subtitle="Active researchers" icon={GraduationCap} variant="success" delay={0.2} />
        <StatCard title="Pending Queries" value="12" subtitle="Student requests" icon={Bell} variant="warning" delay={0.3} />
        <StatCard title="Academic Progress" value="78%" subtitle="Syllabus coverage" icon={Clock} variant="primary" delay={0.4} />
      </div>

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <NextClassCard
            currentClass={currentClass}
            nextClass={nextClass}
            onClassClick={() => { }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="widget-card"
          >
            <h3 className="section-title mb-4">Departmental Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 text-center">
                <p className="text-2xl font-black text-secondary">85%</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase text-center mt-2">Attendance</p>
              </div>
              <div className="p-4 rounded-2xl bg-success/5 border border-success/10 text-center">
                <p className="text-2xl font-black text-success">92%</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">Syllabus</p>
              </div>
              <div className="p-4 rounded-2xl bg-warning/5 border border-warning/10 text-center">
                <p className="text-2xl font-black text-warning">08</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">On Leave</p>
              </div>
              <div className="p-4 rounded-2xl bg-info/5 border border-info/10 text-center">
                <p className="text-2xl font-black text-info">15</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">Projects</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col gap-6">
          <PendingTasksList tasks={pendingTasks} />
          <LeaveSnapshot leaves={leaveBalance} />
        </div>
      </div>
    </MainLayout>
  );
}
