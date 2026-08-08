import { MainLayout } from "@/pages/admin/department-admin/components/layout/MainLayout";
import { StatCard } from "@/pages/admin/department-admin/components/dashboard/StatCard";
import { NextClassCard } from "@/pages/admin/department-admin/components/dashboard/NextClassCard";
import { PendingTasksList } from "@/pages/admin/department-admin/components/dashboard/PendingTasksList";
import { LeaveSnapshot } from "@/pages/admin/department-admin/components/dashboard/LeaveSnapshot";
import { IntegratedNotificationBell } from "@/components/common/IntegratedNotificationBell";
import { LeaveNotificationBell } from "@/components/common/LeaveNotificationBell";
import { useAnnouncementNotification } from "@/hooks/useAnnouncementNotification";
import { useLeaveNotification } from "@/hooks/useLeaveNotification";
import { AnnouncementNotificationModal } from "@/components/common/AnnouncementNotificationModal";
import { LeaveRequestPopup } from "@/components/common/LeaveRequestPopup";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Calendar,
  Clock,
  GraduationCap,
  Bell
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { announcement, showNotification, setShowNotification } = useAnnouncementNotification();
  const { pendingLeaves, showLeavePopup, setShowLeavePopup } = useLeaveNotification();
  const { authToken, user } = useAuth();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [todaySlots, setTodaySlots] = useState<any[]>([]);
  const [stats, setStats] = useState({ students: 0, faculty: 0, pending: 0, attendance: 0, syllabusProgress: 0, onLeave: 0, projects: 0 });
  const [slotStudents, setSlotStudents] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's slots and statistics
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split("T")[0];

        // Fetch today's timetable
        const slotsResponse = await fetch(
          `/api/v1/attendance/faculty/timetable/${today}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        const slotsData = await slotsResponse.json();

        if (slotsData.success && slotsData.data) {
          setTodaySlots(slotsData.data.slots || []);
          setSlotStudents(slotsData.data.studentsByClass || {});
        }

        // Fetch department statistics
        const statsResponse = await fetch(
          `/api/v1/departments/statistics`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        ).catch(() => null);

        // Fetch and map students and faculty explicitly by department ID as requested
        let studentCount: number | null = null;
        let facultyCount: number | null = null;
        try {
          const deptId = (user as any)?.department_id || (user as any)?.departmentId || (user as any)?.department?.id;
          if (deptId) {
            const [stuRes, facRes] = await Promise.all([
              fetch(`/api/v1/students/department/${deptId}`, { headers: { Authorization: `Bearer ${authToken}` } }).catch(() => null),
              fetch(`/api/v1/faculty?department=${deptId}&limit=0`, { headers: { Authorization: `Bearer ${authToken}` } }).catch(() => null)
            ]);

            if (stuRes?.ok) {
              const stuData = await stuRes.json();
              if (stuData.success && Array.isArray(stuData.data)) {
                studentCount = stuData.data.length;
              }
            }
            if (facRes?.ok) {
              const facData = await facRes.json();
              if (facData.success && Array.isArray(facData.data)) {
                facultyCount = facData.data.length;
              }
            }
          }
        } catch (error) {
          console.error("Error mapping student/faculty counts:", error);
        }

        if (statsResponse?.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success && statsData.data) {
            setStats(prev => ({
              ...prev,
              students: studentCount !== null ? studentCount : (statsData.data.totalStudents || 0),
              faculty: facultyCount !== null ? facultyCount : (statsData.data.totalFaculty || 0),
              pending: statsData.data.pendingApprovals || 0,
              attendance: statsData.data.averageAttendance || 85,
              syllabusProgress: statsData.data.syllabusProgress || 92,
              onLeave: statsData.data.facultyOnLeave || 0,
              projects: statsData.data.activeProjects || 0,
            }));
          }
        } else if (studentCount !== null || facultyCount !== null) {
          setStats(prev => ({
            ...prev,
            students: studentCount !== null ? studentCount : prev.students,
            faculty: facultyCount !== null ? facultyCount : prev.faculty,
          }));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [authToken]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Compute current and next class from today's slots
  const { currentClass, nextClass, pendingTasks } = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Sort today's slots chronologically
    const sortedSlots = [...todaySlots].sort((a, b) => {
      const [aH, aM] = a.startTime?.split(':').map(Number) || [0, 0];
      const [bH, bM] = b.startTime?.split(':').map(Number) || [0, 0];
      return aH - bH || aM - bM;
    });

    // Find live and upcoming classes for the rest of the day
    const liveAndUpcomingSlots = sortedSlots.filter((slot: any) => {
      const [eHour, eMin] = slot.endTime?.split(':').map(Number) || [23, 59];
      // Keep if the class hasn't finished yet
      return (eHour > currentHour || (eHour === currentHour && eMin > currentMinute));
    });

    let current = null;
    let next = null;
    let isCurrentUpcomingOnly = false;

    if (liveAndUpcomingSlots.length > 0) {
      current = liveAndUpcomingSlots[0];
      const [sHour, sMin] = current.startTime?.split(':').map(Number) || [0, 0];
      // Check if it's strictly in the future (not started yet)
      isCurrentUpcomingOnly = (sHour > currentHour || (sHour === currentHour && sMin > currentMinute));
    }

    if (liveAndUpcomingSlots.length > 1) {
      next = liveAndUpcomingSlots[1];
    }

    const currentClassData = current ? {
      id: current.id || 0,
      subject: current.subjectName || "Class",
      time: `${current.startTime} - ${current.endTime}`,
      room: current.room || "TBD",
      section: current.className || "CLASS",
      studentsCount: (slotStudents[current.classSectionId]?.length || 0),
      type: current.session_type === 'lab' ? "Lab" : "Theory",
      totalPeriods: 1,
      duration: "50 mins",
      isUpcomingOnly: isCurrentUpcomingOnly
    } : null;

    const nextClassData = next ? {
      id: next.id || 0,
      subject: next.subjectName || "Class",
      time: `${next.startTime} - ${next.endTime}`,
      room: next.room || "TBD",
      section: next.className || "CLASS",
      studentsCount: (slotStudents[next.classSectionId]?.length || 0),
      type: next.session_type === 'lab' ? "Lab" : "Theory",
      totalPeriods: 1,
      duration: "50 mins",
    } : null;

    const tasks = [];
    tasks.push({ id: "1", title: "Mark today's attendance", dueDate: "Today", priority: "high" as const, type: "Faculty Circular" as const });
    if (pendingLeaves.length > 0) {
      tasks.push({ id: "2", title: `${pendingLeaves.length} pending leave approvals`, dueDate: "Today", priority: "high" as const, type: "Faculty Circular" as const });
    }

    return {
      currentClass: currentClassData || {
        id: 0,
        subject: "No class scheduled",
        time: "N/A",
        room: "N/A",
        section: "N/A",
        studentsCount: 0,
        type: "Theory",
        totalPeriods: 0,
        duration: "N/A",
        isUpcomingOnly: false
      },
      nextClass: nextClassData || {
        id: 0,
        subject: "No upcoming class",
        time: "N/A",
        room: "N/A",
        section: "N/A",
        studentsCount: 0,
        type: "Theory",
        totalPeriods: 0,
        duration: "N/A",
      },
      pendingTasks: tasks.length > 0 ? tasks : [{ id: "1", title: "All tasks completed", dueDate: "Today", priority: "low" as const, type: "Faculty Circular" as const }],
    };
  }, [todaySlots, slotStudents, pendingLeaves]);

  return (
    <MainLayout>
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
      <LeaveRequestPopup
        isOpen={showLeavePopup}
        onClose={() => setShowLeavePopup(false)}
        pendingLeaves={pendingLeaves}
      />
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
      >
        <div>
          <h1 className="page-header font-serif text-2xl md:text-3xl">HOD Dashboard</h1>
          <p className="text-muted-foreground -mt-4 text-sm md:text-base">
            Departmental overview and administrative control
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
        <StatCard title="Total Students" value={stats.students.toString()} subtitle="In department" icon={Users} variant="secondary" delay={0.1} />
        <StatCard title="Total Faculty" value={stats.faculty.toString()} subtitle="Active staff" icon={GraduationCap} variant="success" delay={0.2} />
        <StatCard title="Pending Approvals" value={stats.pending.toString()} subtitle="Awaiting review" icon={Bell} variant="warning" delay={0.3} />
        <StatCard title="Avg. Attendance" value={`${stats.attendance}%`} subtitle="Department wide" icon={Clock} variant="primary" delay={0.4} />
      </div>

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          {currentClass || nextClass ? (
            <NextClassCard
              currentClass={currentClass}
              nextClass={nextClass}
              onClassClick={(classInfo) => setSelectedSubject({
                id: (classInfo as any).id || currentClass?.id || nextClass?.id || 0,
                name: classInfo.subject,
                room: classInfo.room,
                type: classInfo.type || "Theory",
                totalPeriods: classInfo.totalPeriods || 1,
                duration: classInfo.duration || "50 mins",
              })}
            />
          ) : todaySlots.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="widget-card p-5 bg-secondary/5 border border-secondary/20"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">Today&apos;s Classes</h3>
              <div className="space-y-2">
                {todaySlots.map((cls) => {
                  const sHour = parseInt(cls.startTime?.split(':')[0] || "0");
                  const sMin = parseInt(cls.startTime?.split(':')[1] || "0");
                  const eHour = parseInt(cls.endTime?.split(':')[0] || "0");
                  const eMin = parseInt(cls.endTime?.split(':')[1] || "0");
                  const durationMins = (eHour - sHour) * 60 + (eMin - sMin);
                  return (
                    <button
                      key={`${cls.id}-${cls.startTime}`}
                      className="w-full text-left px-3 py-2 bg-background/70 hover:bg-background rounded-lg border border-border"
                      onClick={() => setSelectedSubject({
                        id: cls.id,
                        name: cls.subjectName || "Class",
                        room: cls.room || "TBD",
                        type: cls.session_type === 'lab' ? 'Lab' : 'Theory',
                        totalPeriods: 1,
                        duration: `${durationMins} mins`,
                      })}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm text-foreground">{cls.subjectName || "Class"}</span>
                        <span className="text-xs text-muted-foreground">{cls.startTime} - {cls.endTime}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{cls.className || "CLASS"} &bull; {cls.room || "TBD"}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
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
                    You have a free day! No classes scheduled for today.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-primary/20 w-full">
                  <p className="text-xs text-muted-foreground">
                    Use this time for preparation, grading, or administrative tasks
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="widget-card"
          >
            <h3 className="section-title mb-4">Departmental Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 text-center">
                <p className="text-2xl font-black text-secondary">{stats.attendance}%</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase text-center mt-2">Attendance</p>
              </div>
              <div className="p-4 rounded-2xl bg-success/5 border border-success/10 text-center">
                <p className="text-2xl font-black text-success">{stats.syllabusProgress}%</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">Syllabus</p>
              </div>
              <div className="p-4 rounded-2xl bg-warning/5 border border-warning/10 text-center">
                <p className="text-2xl font-black text-warning">{stats.onLeave.toString().padStart(2, '0')}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">On Leave</p>
              </div>
              <div className="p-4 rounded-2xl bg-info/5 border border-info/10 text-center">
                <p className="text-2xl font-black text-info">{stats.projects.toString().padStart(2, '0')}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">Projects</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="widget-card flex flex-col h-fit"
        >
          <h3 className="section-title text-center mb-4">Class Details</h3>
          {todaySlots.length === 0 ? (
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
        <LeaveSnapshot leaves={[]} />
      </div>
    </MainLayout>
  );
}
