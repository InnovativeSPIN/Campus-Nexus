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
          `/api/v1/department/statistics`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        ).catch(() => null);

        if (statsResponse?.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success && statsData.data) {
            setStats(prev => ({
              ...prev,
              students: statsData.data.totalStudents || 0,
              faculty: statsData.data.totalFaculty || 0,
              pending: statsData.data.pendingApprovals || 0,
              attendance: statsData.data.averageAttendance || 85,
              syllabusProgress: statsData.data.syllabusProgress || 92,
              onLeave: statsData.data.facultyOnLeave || 0,
              projects: statsData.data.activeProjects || 0,
            }));
          }
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

    const current = todaySlots.find((slot: any) => {
      const [sHour, sMin] = slot.startTime?.split(':').map(Number) || [0, 0];
      const [eHour, eMin] = slot.endTime?.split(':').map(Number) || [23, 59];
      return (sHour < currentHour || (sHour === currentHour && sMin <= currentMinute)) &&
             (eHour > currentHour || (eHour === currentHour && eMin > currentMinute));
    });

    const next = todaySlots.find((slot: any) => {
      const [sHour, sMin] = slot.startTime?.split(':').map(Number) || [0, 0];
      return (sHour > currentHour || (sHour === currentHour && sMin > currentMinute));
    });

    const currentClassData = current ? {
      subject: current.subjectName || "Class",
      time: `${current.startTime} - ${current.endTime}`,
      room: current.room || "TBD",
      section: current.className || "CLASS",
      studentsCount: (slotStudents[current.classSectionId]?.length || 0),
      type: current.session_type === 'lab' ? "Lab" : "Theory",
      totalPeriods: 1,
      duration: "50 mins",
    } : null;

    const nextClassData = next ? {
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
        subject: "No class scheduled",
        time: "N/A",
        room: "N/A",
        section: "N/A",
        studentsCount: 0,
        type: "Theory",
        totalPeriods: 0,
        duration: "N/A",
      },
      nextClass: nextClassData || {
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

        <div className="flex flex-col gap-6">
          <PendingTasksList tasks={pendingTasks} />
          <LeaveSnapshot leaves={[]} />
        </div>
      </div>
    </MainLayout>
  );
}
