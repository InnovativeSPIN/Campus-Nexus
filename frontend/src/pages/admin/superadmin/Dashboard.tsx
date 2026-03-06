import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { StatsCard } from '@/pages/admin/superadmin/components/dashboard/StatsCard';
import {
  Users,
  GraduationCap,
  Building2,
  Clock,
  Bell,
  ShieldCheck,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/pages/admin/superadmin/components/ui/card';
import { Badge } from '@/pages/admin/superadmin/components/ui/badge';
import { useAnnouncementNotification } from '@/hooks/useAnnouncementNotification';
import { AnnouncementNotificationModal } from '@/components/common/AnnouncementNotificationModal';


// Hook: animate a number counting up from 0 to target
function useCountUp(target: number, duration = 1200, enabled = true) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || target === 0) return;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, enabled]);

  return current;
}

interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalDepartments: number;
}

export default function SuperAdminDashboard() {
  const { announcement, showNotification, setShowNotification } = useAnnouncementNotification();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalFaculty: 0,
    totalDepartments: 0,
  });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [statsError, setStatsError] = useState(false);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [recentFaculty, setRecentFaculty] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Animated display values
  const displayStudents = useCountUp(stats.totalStudents, 1400, statsLoaded);
  const displayFaculty = useCountUp(stats.totalFaculty, 1200, statsLoaded);
  const displayDepartments = useCountUp(stats.totalDepartments, 800, statsLoaded);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/v1/dashboard/stats');
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
        setStatsLoaded(true);
        setStatsError(false);
      }
    } catch (e) {
      console.error('Failed to load dashboard stats', e);
      setStatsError(true);
    }
  };

  const fetchRecent = async () => {
    try {
      const stuRes = await fetch('/api/v1/students?limit=5&sort=createdAt:desc');
      const stuJson = await stuRes.json();
      if (stuJson.success) setRecentStudents(stuJson.data);
    } catch (e) {
      console.error('Failed to load recent students', e);
    }
    try {
      const facRes = await fetch('/api/v1/faculty?limit=5&sort=createdAt:desc');
      const facJson = await facRes.json();
      if (facJson.success) setRecentFaculty(facJson.data);
    } catch (e) {
      console.error('Failed to load recent faculty', e);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecent();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setStatsLoaded(false);
    setStats({ totalStudents: 0, totalFaculty: 0, totalDepartments: 0 });
    await fetchStats();
    await fetchRecent();
    setRefreshing(false);
  };

  return (
    <AdminLayout>
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Students */}
          <div className="relative">
            <StatsCard
              key="total-students"
              title="Total Students"
              value={statsLoaded ? displayStudents : '–'}
              icon={<GraduationCap className="h-6 w-6" />}
              change={statsLoaded ? `Enrolled in college` : 'Loading...'}
              changeType="positive"
            />
            {statsLoaded && (
              <div className="absolute top-3 right-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </div>
            )}
          </div>

          {/* Total Faculty */}
          <div className="relative">
            <StatsCard
              key="total-faculty"
              title="Total Faculty"
              value={statsLoaded ? displayFaculty : '–'}
              icon={<Users className="h-6 w-6" />}
              change={statsLoaded ? `Active staff members` : 'Loading...'}
              changeType="positive"
            />
            {statsLoaded && (
              <div className="absolute top-3 right-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </div>
            )}
          </div>

          {/* Departments */}
          <div className="relative">
            <StatsCard
              key="departments"
              title="Departments"
              value={statsLoaded ? displayDepartments : '–'}
              icon={<Building2 className="h-6 w-6" />}
              change="Active departments"
              changeType="positive"
            />
            {statsLoaded && (
              <div className="absolute top-3 right-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Error banner */}
        {statsError && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <TrendingUp className="h-4 w-4 shrink-0" />
            Could not fetch live stats from the server. Showing fallback values.
          </div>
        )}

        {/* System Alerts */}
        <div className="grid gap-6 lg:grid-cols-4">
          <Card className="lg:col-span-4 border-border">
            <CardHeader className="py-3">
              <CardTitle className="text-foreground flex items-center gap-2 text-sm uppercase font-black">
                <Bell className="h-4 w-4 text-secondary" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3 text-sm p-3 rounded-lg bg-orange-500/5 border border-orange-500/10 items-center">
                <Clock className="h-4 w-4 text-orange-500 shrink-0" />
                <div>
                  <p className="font-bold text-foreground">Backup Reminder</p>
                  <p className="text-xs text-muted-foreground">Last backup was 3 days ago.</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm p-3 rounded-lg bg-success/5 border border-success/10 items-center">
                <ShieldCheck className="h-4 w-4 text-success shrink-0" />
                <div>
                  <p className="font-bold text-foreground">Security Patch</p>
                  <p className="text-xs text-muted-foreground">System is up to date.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Students */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentStudents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent students found.</p>
                )}
                {recentStudents.map((student, index) => {
                  const fullName = `${student.firstName || 'Unknown'} ${student.lastName || ''}`.trim();
                  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
                  return (
                    <div key={student.id || index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.studentId || student.rollNumber || 'N/A'} · {student.batch || ''}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={student.status === 'active' ? 'default' : 'secondary'}
                        className={student.status === 'active' ? 'bg-success text-white' : ''}
                      >
                        {student.status || 'unknown'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Faculty */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Faculty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFaculty.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent faculty found.</p>
                )}
                {recentFaculty.map((faculty, idx) => {
                  const name = faculty.Name || faculty.name || 'Unknown';
                  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
                  return (
                    <div key={faculty.faculty_id || idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary font-medium text-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{name}</p>
                          <p className="text-sm text-muted-foreground">
                            {faculty.designation || 'N/A'} · {faculty.faculty_college_code || ''}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={faculty.status === 'active' ? 'default' : 'secondary'}
                        className={faculty.status === 'active' ? 'bg-success text-white' : ''}
                      >
                        {faculty.status || 'unknown'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
