import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { StatCard } from "@/pages/faculty/components/dashboard/StatCard";
import { NextClassCard } from "@/pages/faculty/components/dashboard/NextClassCard";
import { PendingTasksList } from "@/pages/faculty/components/dashboard/PendingTasksList";
import { LeaveSnapshot } from "@/pages/faculty/components/dashboard/LeaveSnapshot";
import { IntegratedNotificationBell } from "@/components/common/IntegratedNotificationBell";
import { LeaveNotificationBell } from "@/components/common/LeaveNotificationBell";

import { useAnnouncementNotification } from "@/hooks/useAnnouncementNotification";
import { useTodaysTimetable } from "@/hooks/useTodaysTimetable";
import { AnnouncementNotificationModal } from "@/components/common/AnnouncementNotificationModal";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Award,
  Clock,
  GraduationCap,
  Loader2,
} from "lucide-react";

const pendingTasks = [
  { id: "1", title: "Annual Day staff commity list Announced", dueDate: "Today", priority: "high" as const, type: "Faculty Circular" as const },
  { id: "2", title: "Upload Internal Test 1 marks", dueDate: "Tomorrow", priority: "medium" as const, type: "Faculty Circular" as const },
];

const leaveBalance = [
  { type: "Casual Leave", icon: Calendar, total: 12, used: 4, remaining: 8 },
];

export default function Dashboard() {
  const { announcement, showNotification, setShowNotification } = useAnnouncementNotification();
  const { current, next, allClasses, loading: timetableLoading, error: timetableError } = useTodaysTimetable();
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update selected subject when current class changes
  useEffect(() => {
    if (current) {
      setSelectedSubject({
        id: current.id,
        name: current.subject,
        room: current.room,
        type: current.type,
        totalPeriods: current.totalPeriods,
        duration: `${(parseInt(current.timeSlot.end.split(':')[0]) - parseInt(current.timeSlot.start.split(':')[0])) * 60 + (parseInt(current.timeSlot.end.split(':')[1]) - parseInt(current.timeSlot.start.split(':')[1]))} mins`,
      });
    } else if (next) {
      setSelectedSubject({
        id: next.id,
        name: next.subject,
        room: next.room,
        type: next.type,
        totalPeriods: next.totalPeriods,
        duration: `${(parseInt(next.timeSlot.end.split(':')[0]) - parseInt(next.timeSlot.start.split(':')[0])) * 60 + (parseInt(next.timeSlot.end.split(':')[1]) - parseInt(next.timeSlot.start.split(':')[1]))} mins`,
      });
    }
  }, [current, next]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatClassTime = (start: string, end: string): string => {
    const formatTimeStr = (time: string) => {
      const [hours, mins] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${mins} ${ampm}`;
    };
    return `${formatTimeStr(start)} - ${formatTimeStr(end)}`;
  };

  // Prepare class data for display
  const currentClassData = current ? {
    subject: current.subject,
    time: formatClassTime(current.timeSlot.start, current.timeSlot.end),
    room: current.room,
    section: current.className,
    studentsCount: current.studentsCount,
    type: current.type,
    totalPeriods: current.totalPeriods,
    duration: `${(parseInt(current.timeSlot.end.split(':')[0]) - parseInt(current.timeSlot.start.split(':')[0])) * 60 + (parseInt(current.timeSlot.end.split(':')[1]) - parseInt(current.timeSlot.start.split(':')[1]))} mins`,
  } : null;

  const nextClassData = next ? {
    subject: next.subject,
    time: formatClassTime(next.timeSlot.start, next.timeSlot.end),
    room: next.room,
    section: next.className,
    studentsCount: next.studentsCount,
    type: next.type,
    totalPeriods: next.totalPeriods,
    duration: `${(parseInt(next.timeSlot.end.split(':')[0]) - parseInt(next.timeSlot.start.split(':')[0])) * 60 + (parseInt(next.timeSlot.end.split(':')[1]) - parseInt(next.timeSlot.start.split(':')[1]))} mins`,
  } : null;

  return (
    <MainLayout hideHeader={true}>
      {announcement && (
        <AnnouncementNotificationModal
          isOpen={showNotification}
          onClose={() => setShowNotification(false)}
          title={announcement.title}
          message={announcement.message}
          creatorRole={announcement.creatorRole}
          createdAt={announcement.createdAt}
          updatedAt={announcement.updatedAt}
        />
      )}
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
      >
        <div>
          <h1 className="page-header font-serif">Faculty Dashboard</h1>
          <p className="text-muted-foreground -mt-4">
            Welcome back! Here's your academic overview for today
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {formatDate(currentTime)}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-secondary" />
              {formatTime(currentTime)}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="sm:hidden text-right mr-2">
               <p className="text-[10px] font-bold text-primary">{formatDate(currentTime)}</p>
               <p className="text-[10px] text-muted-foreground">{formatTime(currentTime)}</p>
            </div>
            <LeaveNotificationBell />
            <IntegratedNotificationBell />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Subjects" 
          value={new Set(allClasses.map(c => c.subjectCode || c.subject)).size.toString()} 
          subtitle="This semester" 
          icon={BookOpen} 
          variant="secondary" 
          delay={0.1} 
        />
        <StatCard 
          title="Classes Today" 
          value={allClasses.length.toString()} 
          subtitle={current ? "1 in progress" : "No class in progress"} 
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
        <StatCard 
          title="Pending Tasks" 
          value={pendingTasks.length.toString()} 
          subtitle="Requires action" 
          icon={Clock} 
          variant="primary" 
          delay={0.4} 
        />
      </div>

      {/* Current/Next Class */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {timetableLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="widget-card flex items-center justify-center py-12"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading your schedule...</p>
            </div>
          </motion.div>
        ) : timetableError ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="widget-card flex items-center justify-center py-12"
          >
            <div className="flex flex-col items-center gap-3">
              <Calendar className="w-8 h-8 text-destructive" />
              <p className="text-sm text-muted-foreground">Unable to load schedule</p>
              <p className="text-xs text-destructive">{timetableError}</p>
            </div>
          </motion.div>
        ) : currentClassData || nextClassData ? (
          <NextClassCard
            currentClass={currentClassData || undefined}
            nextClass={nextClassData || undefined}
            onClassClick={(classInfo) => setSelectedSubject({
              id: current?.id || next?.id || 0,
              name: classInfo.subject,
              room: classInfo.room,
              type: classInfo.type || "Theory",
              totalPeriods: classInfo.totalPeriods || 4,
              duration: classInfo.duration || "50 mins",
            })}
          />
        ) : allClasses.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-2"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="widget-card p-5 bg-secondary/5 border border-secondary/20"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">Today&apos;s Classes</h3>
              <div className="space-y-2">
                {allClasses.map((cls) => (
                  <button
                    key={`${cls.id}-${cls.timeSlot.start}`}
                    className="w-full text-left px-3 py-2 bg-background/70 hover:bg-background rounded-lg border border-border"
                    onClick={() => setSelectedSubject({
                      id: cls.id,
                      name: cls.subject,
                      room: cls.room,
                      type: cls.type || 'Theory',
                      totalPeriods: cls.totalPeriods || 1,
                      duration: `${(parseInt(cls.timeSlot.end.split(':')[0]) - parseInt(cls.timeSlot.start.split(':')[0])) * 60 + (parseInt(cls.timeSlot.end.split(':')[1]) - parseInt(cls.timeSlot.start.split(':')[1]))} mins`,
                    })}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-foreground">{cls.subject}</span>
                      <span className="text-xs text-muted-foreground">{formatClassTime(cls.timeSlot.start, cls.timeSlot.end)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{cls.className} • {cls.room}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-2"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="widget-card flex flex-col items-center justify-center py-16 bg-gradient-to-br from-secondary/10 to-primary/10 border-2 border-dashed border-primary/30"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative">
                  <Calendar className="w-16 h-16 text-primary/40" />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground mb-2">No Class Today</p>
                  <p className="text-sm text-muted-foreground">
                    You have a free day! No classes scheduled for {formatDate(currentTime).split(',')[0]}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-primary/20 w-full">
                  <p className="text-xs text-muted-foreground">
                    Use this time for preparation, grading, or administrative tasks
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="widget-card flex flex-col"
        >
          <h3 className="section-title text-center mb-4">Class Details</h3>
          {allClasses.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No Classes Today</p>
                <p className="text-xs text-muted-foreground mt-2">Your schedule is clear</p>
              </div>
            </div>
          ) : selectedSubject ? (
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
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Select a class to view details</p>
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
