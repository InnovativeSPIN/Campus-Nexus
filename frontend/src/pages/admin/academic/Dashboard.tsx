import { AdminLayout } from '@/pages/admin/academic/components/layout/AdminLayout';
import { StatsCard } from '@/pages/admin/academic/components/dashboard/StatsCard';
import { dashboardStats, mockStudents, mockFaculty } from '@/data/mockData';
import { Users, GraduationCap, Building2, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/pages/admin/academic/components/ui/card';
import { Badge } from '@/pages/admin/academic/components/ui/badge';

export default function AcademicAdminDashboard() {
  const recentStudents = mockStudents.slice(0, 4);
  const recentFaculty = mockFaculty.slice(0, 4);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Academic Dashboard</h1>
          <p className="text-muted-foreground">Academic management overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Students"
            value={dashboardStats.totalStudents}
            icon={<GraduationCap className="h-6 w-6" />}
            change="+12 this month"
            changeType="positive"
          />
          <StatsCard
            title="Total Faculty"
            value={dashboardStats.totalFaculty}
            icon={<Users className="h-6 w-6" />}
            change="+2 this month"
            changeType="positive"
          />
          <StatsCard
            title="Departments"
            value={dashboardStats.totalDepartments}
            icon={<Building2 className="h-6 w-6" />}
          />
          <StatsCard
            title="Active Programs"
            value={dashboardStats.activePrograms}
            icon={<BookOpen className="h-6 w-6" />}
          />
        </div>

        {/* Performance Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Graduation Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{dashboardStats.graduationRate}%</div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-success"
                  style={{ width: `${dashboardStats.graduationRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Attendance Rate
              </CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{dashboardStats.attendanceRate}%</div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-secondary"
                  style={{ width: `${dashboardStats.attendanceRate}%` }}
                />
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
                {recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                        {student.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.department}</p>
                      </div>
                    </div>
                    <Badge
                      variant={student.status === 'active' ? 'default' : 'secondary'}
                      className={student.status === 'active' ? 'bg-success' : ''}
                    >
                      {student.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Faculty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFaculty.map((faculty) => (
                  <div key={faculty.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary font-medium">
                        {faculty.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{faculty.name}</p>
                        <p className="text-sm text-muted-foreground">{faculty.designation}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{faculty.department}</span>
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
