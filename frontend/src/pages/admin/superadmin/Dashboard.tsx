import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { StatsCard } from '@/pages/admin/superadmin/components/dashboard/StatsCard';
import { dashboardStats } from '@/data/mockData'; // stats still static for now, lists fetched from API
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Clock,
  Bell,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/pages/admin/superadmin/components/ui/card';
import { Badge } from '@/pages/admin/superadmin/components/ui/badge';

export default function SuperAdminDashboard() {
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [recentFaculty, setRecentFaculty] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const stuRes = await fetch('/api/v1/students?limit=5&sort=createdAt:desc');
        const stuJson = await stuRes.json();
        if (stuJson.success) setRecentStudents(stuJson.data);
      } catch (e) {
        console.error('Failed to load recent students', e);
      }
      try {
        const facRes = await fetch('/api/v1/faculty?limit=3&sort=createdAt:desc');
        const facJson = await facRes.json();
        if (facJson.success) setRecentFaculty(facJson.data);
      } catch (e) {
        console.error('Failed to load recent faculty', e);
      }
    };
    fetchRecent();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            key="total-students"
            title="Total Students"
            value={dashboardStats.totalStudents}
            icon={<GraduationCap className="h-6 w-6" />}
            change="In College"
            changeType="positive"
          />
          <StatsCard
            key="total-faculty"
            title="Total Faculty"
            value={dashboardStats.totalFaculty}
            icon={<Users className="h-6 w-6" />}
            change="+2 this month"
            changeType="positive"
          />
          <StatsCard
            key="departments"
            title="Departments"
            value={dashboardStats.totalDepartments}
            icon={<Building2 className="h-6 w-6" />}
          />
          <StatsCard
            key="active-programs"
            title="Active Programs"
            value={dashboardStats.activePrograms}
            icon={<BookOpen className="h-6 w-6" />}
          />
        </div>

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
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentStudents.map((student, index) => {
                  const fullName = `${student.firstName || 'Unknown'} ${student.lastName || ''}`.trim();
                  return (
                    <div key={student.id || index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                          {fullName.split(' ').map((n: string) => (n[0])).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{fullName}</p>
                          <p className="text-sm text-muted-foreground">{student.departmentId || 'N/A'}</p>
                        </div>
                      </div>
                      <Badge
                        variant={student.status === 'active' ? 'default' : 'secondary'}
                        className={student.status === 'active' ? 'bg-success' : ''}
                      >
                        {student.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Faculty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFaculty.map((faculty, idx) => (
                  <div key={faculty.faculty_id || idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary font-medium">
                        {(faculty.Name || 'Unknown').split(' ').map((n: string) => (n[0])).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{faculty.Name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{faculty.designation || 'N/A'}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{faculty.department_id || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
